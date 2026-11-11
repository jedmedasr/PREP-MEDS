-- =====================================================================================
-- PREP-MEDS core: medication inventory, evidence store, work queue, custody log and
-- clinical governance, in one schema (prepmeds).
--
-- Rules this file enforces rather than documents:
--   * Every write goes through a function below. Direct INSERT/UPDATE/DELETE/TRUNCATE on
--     any table raises PREPMEDS_DIRECT_WRITE_BLOCKED.
--   * No table has a writable "complete" flag. Progress is computed from rows that exist
--     (group_status / group_progress), never stored.
--   * Evidence, test runs, reviews, authorizations and events are immutable once written.
--   * A lane (odd/even) is derived from the bucket number and from the caller's identity;
--     no function accepts a lane chosen by the caller.
--   * Test results are recorded only with the CI credential. Clinician actions need a
--     clinician identity (JWT subject) plus that clinician's PIN.
--
-- Portable: Supabase (Postgres 15+) and plain PostgreSQL 14+ (the CI service container).
-- File hygiene: no double-dollar quoting, no backslash escapes, no end-anchored regexes.
-- =====================================================================================

create schema if not exists prepmeds;
create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

-- ── 1. Settings and principals ───────────────────────────────────────────────────────
create table prepmeds.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table prepmeds.workers (
  worker_id    text primary key,
  lane         text not null check (lane in ('odd','even')),
  github_login text unique,
  token_sha256 text unique,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table prepmeds.ci_credentials (
  name         text primary key,
  token_sha256 text not null unique,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table prepmeds.clinicians (
  user_id      uuid primary key,
  display_name text not null,
  can_review   boolean not null default true,
  can_release  boolean not null default false,
  pin_salt     text not null,
  pin_sha256   text not null,
  active       boolean not null default true,
  added_at     timestamptz not null default now()
);

-- ── 2. Medication terminology ────────────────────────────────────────────────────────
create table prepmeds.ingredients (
  ingredient_id text primary key check (ingredient_id like 'ING-%'),
  name          text
);

create table prepmeds.medications (
  medication_id     text primary key check (medication_id like 'MED-%'),
  canonical_name    text not null,
  generic_name      text,
  route             text,
  dosage_form       text,
  release_type      text,
  strengths         text[] not null default '{}',
  brand_names       text[] not null default '{}',
  active            boolean not null default true,
  first_seen_commit text,
  last_seen_commit  text,
  updated_at        timestamptz not null default now()
);

create table prepmeds.medication_ingredients (
  medication_id text not null references prepmeds.medications,
  ingredient_id text not null references prepmeds.ingredients,
  primary key (medication_id, ingredient_id)
);

create table prepmeds.medication_aliases (
  medication_id text not null references prepmeds.medications,
  alias         text not null check (length(btrim(alias)) > 0),
  alias_norm    text generated always as (lower(btrim(regexp_replace(alias, '[^a-zA-Z0-9]+', ' ', 'g')))) stored,
  kind          text not null default 'synonym' check (kind in ('brand','generic','synonym')),
  primary key (medication_id, alias)
);
create index medication_aliases_norm on prepmeds.medication_aliases (alias_norm);

-- ── 3. Domains: which guidelines must be compared, which scenarios must be covered ───
create table prepmeds.domains (
  domain_key         text primary key,
  label              text not null,
  comparators_pinned boolean not null default false
);

create table prepmeds.domain_scenarios (
  domain_key   text not null references prepmeds.domains,
  scenario_key text not null check (scenario_key = lower(scenario_key) and length(scenario_key) > 0),
  label        text not null,
  description  text,
  required     boolean not null default true,
  primary key (domain_key, scenario_key)
);

-- ── 4. Review groups (the unit of evidence work and of clinician review) ─────────────
create table prepmeds.review_groups (
  group_id        text primary key,
  kind            text not null check (kind in ('single','combination')),
  domain_key      text not null default 'general' references prepmeds.domains,
  class_key       text,
  bucket          int check (bucket between 1 and 24),
  lane            text generated always as (case when bucket is null then null when bucket % 2 = 1 then 'odd' else 'even' end) stored,
  parent_group_id text references prepmeds.review_groups,
  retired_at      timestamptz,
  retired_reason  text,
  created_at      timestamptz not null default now(),
  check ((retired_at is null) = (retired_reason is null))
);

create table prepmeds.group_ingredients (
  group_id      text not null references prepmeds.review_groups,
  ingredient_id text not null references prepmeds.ingredients,
  primary key (group_id, ingredient_id)
);

-- One primary review group per canonical medication ID. A combination product maps to its
-- combination group; that group reaches its components through group_ingredients.
create table prepmeds.medication_group_map (
  medication_id text primary key references prepmeds.medications,
  group_id      text not null references prepmeds.review_groups,
  mapped_at     timestamptz not null default now()
);
create index medication_group_map_group on prepmeds.medication_group_map (group_id);

-- ── 5. Guideline sources and exact passages (shared by both lanes) ───────────────────
create table prepmeds.guideline_sources (
  source_id        text primary key check (source_id = upper(source_id) and length(source_id) >= 4),
  kind             text not null check (kind in ('society_guideline','consensus_statement','regulatory_label','review','institutional_policy')),
  society          text not null check (length(btrim(society)) > 0),
  title            text not null check (length(btrim(title)) > 0),
  publication_date date,
  version_label    text,
  doi              text,
  url              text not null check (url like 'https://%'),
  superseded_by    text references prepmeds.guideline_sources,
  withdrawn_at     timestamptz,
  registered_by    text,
  created_at       timestamptz not null default now()
);
create unique index guideline_sources_doi on prepmeds.guideline_sources (lower(doi)) where doi is not null;

create table prepmeds.domain_required_sources (
  domain_key text not null references prepmeds.domains,
  source_id  text not null references prepmeds.guideline_sources,
  primary key (domain_key, source_id)
);

create table prepmeds.source_passages (
  passage_id    bigint generated always as identity primary key,
  source_id     text not null references prepmeds.guideline_sources,
  locator       text not null check (length(btrim(locator)) > 0),
  page          text,
  deep_link     text check (deep_link is null or deep_link like 'https://%'),
  quote         text not null check (length(quote) between 12 and 600),
  quote_sha256  text not null,
  registered_by text not null,
  created_at    timestamptz not null default now(),
  unique (source_id, locator, quote_sha256),
  unique (passage_id, source_id)
);

create table prepmeds.passage_checks (
  check_id   bigint generated always as identity primary key,
  passage_id bigint not null references prepmeds.source_passages,
  result     text not null check (result in ('verified','not_found','unfetchable')),
  detail     text,
  ci_run_id  bigint not null,
  checked_at timestamptz not null default now()
);
create index passage_checks_passage on prepmeds.passage_checks (passage_id, check_id desc);

-- ── 6. Work queue ────────────────────────────────────────────────────────────────────
create table prepmeds.sessions (
  session_id bigint generated always as identity primary key,
  worker_id  text not null references prepmeds.workers,
  label      text,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  end_reason text
);
create unique index sessions_one_open_per_worker on prepmeds.sessions (worker_id) where ended_at is null;

create table prepmeds.tasks (
  task_id           bigint generated always as identity primary key,
  group_id          text not null references prepmeds.review_groups,
  status            text not null default 'available'
                      check (status in ('available','claimed','awaiting_ci','done','blocked','cancelled')),
  reason            text not null default 'initial'
                      check (reason in ('initial','ci_failed','changes_requested','mapping_changed','component_changed','source_superseded')),
  detail            jsonb,
  priority          int not null default 100,
  claimed_by        text references prepmeds.workers,
  session_id        bigint references prepmeds.sessions,
  claim_token       uuid,
  lease_expires_at  timestamptz,
  attempt           int not null default 0,
  first_claimed_at  timestamptz,
  progress          jsonb,
  progress_saved_at timestamptz,
  last_error_code   text,
  blocked_reason    text,
  revision_id       bigint,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check ((status = 'claimed') = (claimed_by is not null and claim_token is not null and lease_expires_at is not null)),
  check ((status = 'blocked') = (blocked_reason is not null))
);
create unique index tasks_one_open_per_group on prepmeds.tasks (group_id)
  where status in ('available','claimed','awaiting_ci','blocked');
create unique index tasks_one_claim_per_worker on prepmeds.tasks (claimed_by) where status = 'claimed';
create index tasks_available on prepmeds.tasks (status, priority) where status = 'available';

-- ── 7. Evidence revisions (immutable) and their normalized rows ──────────────────────
create table prepmeds.evidence_revisions (
  revision_id           bigint primary key,
  group_id              text not null references prepmeds.review_groups,
  revision_no           int not null check (revision_no >= 1),
  task_id               bigint not null references prepmeds.tasks,
  worker_id             text not null references prepmeds.workers,
  session_id            bigint references prepmeds.sessions,
  submission_id         text not null check (length(btrim(submission_id)) >= 8),
  formulation_decision  text not null check (formulation_decision = 'single_unit'),
  formulation_rationale text,
  open_questions        jsonb not null default '[]',
  has_blocking_question boolean not null default false,
  package               jsonb not null,
  content_sha256        text not null check (length(content_sha256) = 64),
  git_commit            text check (git_commit is null or (length(git_commit) = 40 and git_commit !~ '[^0-9a-f]')),
  created_at            timestamptz not null default now(),
  unique (group_id, revision_no),
  unique (task_id, submission_id)
);
create sequence prepmeds.evidence_revision_id_seq owned by prepmeds.evidence_revisions.revision_id;

create table prepmeds.revision_medications (
  revision_id   bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  medication_id text not null references prepmeds.medications,
  primary key (revision_id, medication_id)
);

create table prepmeds.revision_components (
  revision_id           bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  component_group_id    text not null references prepmeds.review_groups,
  component_revision_id bigint not null references prepmeds.evidence_revisions,
  component_sha256      text not null,
  primary key (revision_id, component_group_id)
);

create table prepmeds.revision_ingredient_coverage (
  revision_id   bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  ingredient_id text not null references prepmeds.ingredients,
  covered_by    text not null check (covered_by = 'own_recommendations'),
  primary key (revision_id, ingredient_id)
);

create table prepmeds.comparisons (
  revision_id      bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  source_id        text not null references prepmeds.guideline_sources,
  status           text not null check (status in ('COMPARED','NOT_ADDRESSED','NOT_SPECIFIED')),
  checked_locators text,
  note             text,
  primary key (revision_id, source_id),
  constraint comparisons_absence_needs_locators
    check (status = 'COMPARED' or length(btrim(coalesce(checked_locators, ''))) >= 10)
);

create table prepmeds.recommendations (
  rec_id        bigint generated always as identity primary key,
  revision_id   bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  source_id     text not null,
  passage_id    bigint not null,
  domain_key    text not null,
  scenario_key  text not null,
  qualifier     text not null default '',
  renal_measure text check (renal_measure in ('crcl_ml_min','egfr_ml_min_1_73m2')),
  renal_band    numrange,
  action        text not null check (action in ('continue','hold','adjust_dose','switch','individualize','no_specific_recommendation')),
  hold_min      numeric,
  hold_max      numeric,
  hold_unit     text check (hold_unit in ('hours','days','weeks','doses')),
  timing_text   text,
  resume_min    numeric,
  resume_max    numeric,
  resume_unit   text check (resume_unit in ('hours','days','weeks','doses')),
  resume_text   text,
  bridging      text not null default 'not_specified'
                  check (bridging in ('recommended','not_recommended','conditional','not_specified','not_applicable')),
  strength      text not null default 'not_stated',
  certainty     text not null default 'not_stated',
  applicability text,
  exceptions    text,
  summary       text not null check (length(btrim(summary)) >= 10),
  constraint recommendations_comparison_fk foreign key (revision_id, source_id)
    references prepmeds.comparisons (revision_id, source_id),
  constraint recommendations_passage_fk foreign key (passage_id, source_id)
    references prepmeds.source_passages (passage_id, source_id),
  constraint recommendations_scenario_fk foreign key (domain_key, scenario_key)
    references prepmeds.domain_scenarios (domain_key, scenario_key),
  constraint recommendations_renal_pair check ((renal_band is null) = (renal_measure is null)),
  constraint recommendations_renal_nonempty check (renal_band is null or not isempty(renal_band)),
  constraint recommendations_hold_shape check (
    (hold_min is null and hold_max is null and hold_unit is null)
    or (hold_min is not null and hold_max is not null and hold_unit is not null and hold_min >= 0 and hold_max >= hold_min)),
  constraint recommendations_resume_shape check (
    (resume_min is null and resume_max is null and resume_unit is null)
    or (resume_min is not null and resume_max is not null and resume_unit is not null and resume_min >= 0 and resume_max >= resume_min)),
  constraint recommendations_hold_needs_timing check (
    action <> 'hold' or hold_min is not null or length(btrim(coalesce(timing_text, ''))) >= 5),
  -- Two rows of one source, scenario and qualifier may never cover overlapping kidney-function ranges.
  constraint recommendations_no_renal_overlap exclude using gist
    (revision_id with =, source_id with =, scenario_key with =, qualifier with =, renal_band with &&)
);
create unique index recommendations_one_unstratified
  on prepmeds.recommendations (revision_id, source_id, scenario_key, qualifier) where renal_band is null;
create index recommendations_revision on prepmeds.recommendations (revision_id);

create table prepmeds.scenario_coverage (
  revision_id  bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  domain_key   text not null,
  scenario_key text not null,
  status       text not null check (status in ('ADDRESSED','NOT_APPLICABLE','NO_SOURCE_GUIDANCE')),
  reason       text,
  primary key (revision_id, scenario_key),
  constraint scenario_coverage_scenario_fk foreign key (domain_key, scenario_key)
    references prepmeds.domain_scenarios (domain_key, scenario_key),
  constraint scenario_coverage_reason check (status = 'ADDRESSED' or length(btrim(coalesce(reason, ''))) >= 10)
);

create table prepmeds.conflicts (
  conflict_id  bigint generated always as identity primary key,
  revision_id  bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  scenario_key text not null,
  source_ids   text[] not null check (cardinality(source_ids) >= 2),
  description  text not null check (length(btrim(description)) >= 10)
);
create index conflicts_revision on prepmeds.conflicts (revision_id);

create table prepmeds.boundary_notes (
  revision_id  bigint not null references prepmeds.evidence_revisions deferrable initially deferred,
  source_id    text not null,
  scenario_key text not null,
  qualifier    text not null default '',
  note         text not null check (length(btrim(note)) >= 10),
  primary key (revision_id, source_id, scenario_key, qualifier)
);

-- ── 8. Test runs (written only with the CI credential) ───────────────────────────────
create table prepmeds.test_runs (
  test_run_id    bigint generated always as identity primary key,
  revision_id    bigint not null references prepmeds.evidence_revisions,
  content_sha256 text not null,
  suite          text not null check (suite in ('evidence','mapping')),
  suite_version  int not null check (suite_version >= 1),
  passed         boolean not null,
  total          int not null check (total > 0),
  failed         int not null check (failed >= 0),
  commit_sha     text not null check (length(commit_sha) = 40 and commit_sha !~ '[^0-9a-f]'),
  ci_run_id      bigint not null,
  ci_run_attempt int not null default 1,
  report         jsonb,
  recorded_at    timestamptz not null default now(),
  constraint test_runs_pass_means_zero_failures check (passed = (failed = 0)),
  unique (revision_id, suite, ci_run_id, ci_run_attempt)
);

-- ── 9. Clinical governance (written only by an identified clinician) ─────────────────
create table prepmeds.passage_verifications (
  clinician_id uuid not null references prepmeds.clinicians,
  passage_id   bigint not null references prepmeds.source_passages,
  verified_at  timestamptz not null default now(),
  primary key (clinician_id, passage_id)
);

create table prepmeds.clinician_reviews (
  review_id      bigint generated always as identity primary key,
  group_id       text not null references prepmeds.review_groups,
  revision_id    bigint not null references prepmeds.evidence_revisions,
  content_sha256 text not null,
  clinician_id   uuid not null references prepmeds.clinicians,
  decision       text not null check (decision in ('reviewed','changes_requested')),
  attested       boolean not null,
  exceptions     text,
  notes          text,
  reviewed_at    timestamptz not null default now(),
  constraint clinician_reviews_attested check (decision <> 'reviewed' or attested)
);

create table prepmeds.release_authorizations (
  authorization_id bigint generated always as identity primary key,
  group_id         text not null references prepmeds.review_groups,
  revision_id      bigint not null references prepmeds.evidence_revisions,
  content_sha256   text not null,
  review_id        bigint not null references prepmeds.clinician_reviews,
  clinician_id     uuid not null references prepmeds.clinicians,
  authorized_at    timestamptz not null default now()
);

create table prepmeds.revocations (
  revocation_id bigint generated always as identity primary key,
  target        text not null check (target in ('review','release')),
  target_id     bigint not null,
  clinician_id  uuid not null references prepmeds.clinicians,
  reason        text not null check (length(btrim(reason)) >= 5),
  revoked_at    timestamptz not null default now(),
  unique (target, target_id)
);

-- ── 10. Append-only, hash-chained audit log and inventory sync log ───────────────────
create table prepmeds.events (
  event_id    bigint generated always as identity primary key,
  seq         bigint not null unique,   -- position in the hash chain; assigned under a lock, so it has no gaps and no races
  at          timestamptz not null default clock_timestamp(),
  actor_kind  text not null check (actor_kind in ('worker','ci','clinician','admin','system')),
  actor_id    text,
  event_type  text not null,
  group_id    text,
  task_id     bigint,
  revision_id bigint,
  payload     jsonb not null default '{}',
  prev_hash   text,
  hash        text not null
);
create index events_group on prepmeds.events (group_id, event_id);
create index events_task on prepmeds.events (task_id, event_id);

create table prepmeds.inventory_syncs (
  sync_id        bigint generated always as identity primary key,
  commit_sha     text not null,
  payload_sha256 text not null,
  result         jsonb not null,
  synced_at      timestamptz not null default now(),
  unique (commit_sha, payload_sha256)
);

-- A canonical ID that will deliberately never receive periendoscopic guidance (for example an
-- inpatient-only formulation). Recorded by a clinician with a reason; never silently dropped.
create table prepmeds.inventory_exceptions (
  medication_id text primary key references prepmeds.medications,
  reason        text not null check (length(btrim(reason)) >= 10),
  clinician_id  uuid not null references prepmeds.clinicians,
  recorded_at   timestamptz not null default now()
);

-- ── 11. Seed rows that the schema itself depends on ──────────────────────────────────
insert into prepmeds.settings (key, value) values
  ('lease_minutes', '90'), ('max_attempts', '3'), ('session_target', '10'), ('min_suite_version', '1');
insert into prepmeds.domains (domain_key, label) values ('general', 'General (comparators not yet pinned)');
insert into prepmeds.domain_scenarios (domain_key, scenario_key, label, description, required) values
  ('general', 'before_procedure', 'Before the procedure', 'Holding, continuing or adjusting in the days before the procedure, including the bowel-preparation day.', true),
  ('general', 'day_of_procedure', 'Day of the procedure', 'What to do on the morning or day of the procedure, including fasting and sedation considerations.', true),
  ('general', 'after_procedure', 'After the procedure', 'When and how to resume.', true);

-- ── 12. Guards: direct-write tripwire, immutability, hash chain ──────────────────────
create or replace function prepmeds._sha256(p text) returns text
language sql immutable parallel safe as
$fn$ select encode(sha256(convert_to(p, 'UTF8')), 'hex') $fn$;

create or replace function prepmeds._guard() returns trigger language plpgsql as $fn$
begin
  if coalesce(current_setting('prepmeds.api', true), '') <> '1' then
    raise exception 'PREPMEDS_DIRECT_WRITE_BLOCKED: %.% is written only through the prepmeds functions (% attempted)',
      tg_table_schema, tg_table_name, tg_op using errcode = '42501';
  end if;
  if tg_level = 'STATEMENT' then return null; end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $fn$;

create or replace function prepmeds._immutable() returns trigger language plpgsql as $fn$
begin
  raise exception 'PREPMEDS_IMMUTABLE: % on %.% is never permitted; write a new row instead',
    tg_op, tg_table_schema, tg_table_name using errcode = '42501';
end $fn$;

create or replace function prepmeds._event_hash(p_prev text, p_kind text, p_actor text, p_type text, p_group text,
                                               p_task bigint, p_rev bigint, p_payload jsonb, p_at timestamptz)
returns text language sql stable as $fn$
  select prepmeds._sha256(concat_ws('|', coalesce(p_prev, ''), p_kind, coalesce(p_actor, ''), p_type, coalesce(p_group, ''),
         coalesce(p_task::text, ''), coalesce(p_rev::text, ''), p_payload::text,
         to_char(p_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')))
$fn$;

create or replace function prepmeds._events_chain() returns trigger language plpgsql as $fn$
declare v_prev text; v_seq bigint;
begin
  -- One writer at a time appends to the chain. The identity value is handed out before this lock is
  -- taken, so it cannot define chain order; seq is assigned here, inside the lock.
  perform pg_advisory_xact_lock(742600119);
  select e.hash, e.seq into v_prev, v_seq from prepmeds.events e order by e.seq desc limit 1;
  new.seq := coalesce(v_seq, 0) + 1;
  new.at := clock_timestamp();
  new.prev_hash := v_prev;
  new.hash := prepmeds._event_hash(v_prev, new.actor_kind, new.actor_id, new.event_type, new.group_id,
                                   new.task_id, new.revision_id, new.payload, new.at);
  return new;
end $fn$;

create or replace function prepmeds._required_source_kind() returns trigger language plpgsql as $fn$
begin
  if (select s.kind from prepmeds.guideline_sources s where s.source_id = new.source_id)
       not in ('society_guideline','consensus_statement') then
    raise exception 'PREPMEDS_LABEL_IS_NOT_A_GATE: only professional-society guidance can be a required comparator (% is not)', new.source_id;
  end if;
  return new;
end $fn$;

do $install$
declare
  r record;
  v_immutable text[] := array['events','evidence_revisions','revision_medications','revision_components',
    'revision_ingredient_coverage','comparisons','recommendations','scenario_coverage','conflicts','boundary_notes',
    'test_runs','clinician_reviews','release_authorizations','revocations','source_passages','passage_checks',
    'passage_verifications','inventory_syncs','inventory_exceptions'];
begin
  for r in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'prepmeds' and c.relkind = 'r' loop
    execute format('create trigger a_guard_row before insert or update or delete on prepmeds.%I for each row execute function prepmeds._guard()', r.relname);
    execute format('create trigger a_guard_truncate before truncate on prepmeds.%I for each statement execute function prepmeds._guard()', r.relname);
    execute format('alter table prepmeds.%I enable row level security', r.relname);
    if r.relname = any (v_immutable) then
      execute format('create trigger b_immutable_row before update or delete on prepmeds.%I for each row execute function prepmeds._immutable()', r.relname);
      execute format('create trigger b_immutable_truncate before truncate on prepmeds.%I for each statement execute function prepmeds._immutable()', r.relname);
    end if;
  end loop;
end $install$;

create trigger c_events_chain before insert on prepmeds.events
  for each row execute function prepmeds._events_chain();
create trigger c_required_source_kind before insert or update on prepmeds.domain_required_sources
  for each row execute function prepmeds._required_source_kind();
