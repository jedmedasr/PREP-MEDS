-- =====================================================================================
-- PREP-MEDS API. Every state change in the prepmeds schema happens in a function here.
--
--   Workers      start_session, claim_next, heartbeat, save_progress, submit_package,
--                release_task, propose_split, session_report, worker_status   (lane token)
--   CI runner    ci_relay, ci_sync_inventory, ci_pending_tests, ci_record_test_run,
--                ci_record_passage_check                                       (CI token)
--   Clinician    clin_review_queue, clin_get_package, clin_verify_passages,
--                clin_mark_reviewed, clin_request_changes, clin_authorize_release,
--                clin_revoke, clin_record_exception                  (signed in, plus PIN)
--   Application  get_active_guidance, get_progress, group_status, verify_integrity
--   Owner only   admin_*                                    (never granted to an API role)
--
-- File hygiene: no double-dollar quoting, no backslash escapes, no end-anchored regexes.
-- =====================================================================================

-- ── Internals ────────────────────────────────────────────────────────────────────────
create or replace function prepmeds._enter() returns void language plpgsql as $fn$
begin perform set_config('prepmeds.api', '1', true); end $fn$;

create or replace function prepmeds._exit() returns void language plpgsql as $fn$
begin perform set_config('prepmeds.api', '0', true); end $fn$;

create or replace function prepmeds._setting_int(p_key text) returns int
language sql stable set search_path = prepmeds, pg_catalog as
$fn$ select (s.value #>> '{}')::int from settings s where s.key = p_key $fn$;

create or replace function prepmeds._event(p_kind text, p_actor text, p_type text, p_group text,
                                          p_task bigint, p_rev bigint, p_payload jsonb)
returns void language sql set search_path = prepmeds, pg_catalog as $fn$
  insert into events (seq, actor_kind, actor_id, event_type, group_id, task_id, revision_id, payload, hash)
  values (0, p_kind, p_actor, p_type, p_group, p_task, p_rev, coalesce(p_payload, '{}'::jsonb), '')
$fn$;

create or replace function prepmeds._worker(p_token text) returns prepmeds.workers
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare w workers;
begin
  select * into w from workers x where x.token_sha256 = _sha256(coalesce(p_token, '')) and x.active;
  if not found then raise exception 'PREPMEDS_BAD_WORKER_TOKEN' using errcode = '28000'; end if;
  return w;
end $fn$;

create or replace function prepmeds._ci(p_token text) returns text
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare v text;
begin
  select c.name into v from ci_credentials c where c.token_sha256 = _sha256(coalesce(p_token, '')) and c.active;
  if not found then raise exception 'PREPMEDS_BAD_CI_TOKEN' using errcode = '28000'; end if;
  return v;
end $fn$;

create or replace function prepmeds._jwt_sub() returns uuid language plpgsql stable as $fn$
declare v text;
begin
  v := nullif(current_setting('request.jwt.claim.sub', true), '');
  if v is null then
    v := (nullif(current_setting('request.jwt.claims', true), '')::jsonb) ->> 'sub';
  end if;
  return v::uuid;
exception when others then
  return null;
end $fn$;

-- p_need: 'read' (identity only), 'review' or 'release' (identity, permission and PIN).
create or replace function prepmeds._clinician(p_pin text, p_need text) returns prepmeds.clinicians
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; v_uid uuid := _jwt_sub();
begin
  if v_uid is null then
    raise exception 'PREPMEDS_NOT_SIGNED_IN: a clinician action needs an authenticated clinician session' using errcode = '28000';
  end if;
  select * into c from clinicians x where x.user_id = v_uid and x.active;
  if not found then raise exception 'PREPMEDS_NOT_A_CLINICIAN' using errcode = '42501'; end if;
  if p_need = 'review' and not c.can_review then raise exception 'PREPMEDS_CLINICIAN_CANNOT_REVIEW' using errcode = '42501'; end if;
  if p_need = 'release' and not c.can_release then raise exception 'PREPMEDS_CLINICIAN_CANNOT_RELEASE' using errcode = '42501'; end if;
  if p_need <> 'read' and _sha256(c.pin_salt || ':' || coalesce(p_pin, '')) <> c.pin_sha256 then
    raise exception 'PREPMEDS_BAD_PIN' using errcode = '28000';
  end if;
  return c;
end $fn$;

create or replace function prepmeds._head(p_group text) returns prepmeds.evidence_revisions
language sql stable set search_path = prepmeds, pg_catalog as
$fn$ select * from evidence_revisions e where e.group_id = p_group order by e.revision_no desc limit 1 $fn$;

create or replace function prepmeds._standalone_groups(p_ingredient text) returns setof text
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select g.group_id from review_groups g
  where g.kind = 'single' and g.retired_at is null
    and exists (select 1 from group_ingredients gi where gi.group_id = g.group_id and gi.ingredient_id = p_ingredient)
$fn$;

-- A combination group becomes claimable once every ingredient that has a standalone group
-- has an accepted revision in at least one of them.
create or replace function prepmeds._deps_ready(p_group text) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select not exists (
    select 1 from review_groups g join group_ingredients gi on gi.group_id = g.group_id
    where g.group_id = p_group and g.kind = 'combination'
      and exists (select 1 from _standalone_groups(gi.ingredient_id))
      and not exists (select 1 from _standalone_groups(gi.ingredient_id) s(gid)
                      join evidence_revisions e on e.group_id = s.gid))
$fn$;

create or replace function prepmeds._current_meds(p_group text) returns text[]
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select coalesce(array_agg(m.medication_id order by m.medication_id collate "C"), '{}')
  from medication_group_map m join medications d on d.medication_id = m.medication_id
  where m.group_id = p_group and d.active
$fn$;

create or replace function prepmeds._revision_meds(p_rev bigint) returns text[]
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select coalesce(array_agg(m.medication_id order by m.medication_id collate "C"), '{}')
  from revision_medications m where m.revision_id = p_rev
$fn$;

create or replace function prepmeds._suite_decided(p_rev bigint, p_suite text) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select exists (select 1 from test_runs t where t.revision_id = p_rev and t.suite = p_suite
                 and t.suite_version >= _setting_int('min_suite_version'))
$fn$;

create or replace function prepmeds._suite_passed(p_rev bigint, p_suite text) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select coalesce((select t.passed from test_runs t where t.revision_id = p_rev and t.suite = p_suite
                   and t.suite_version >= _setting_int('min_suite_version')
                   order by t.test_run_id desc limit 1), false)
$fn$;

create or replace function prepmeds._suite_failing(p_rev bigint) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select exists (select 1 from unnest(array['evidence','mapping']) s(suite)
                 where (select t.passed from test_runs t where t.revision_id = p_rev and t.suite = s.suite
                        order by t.test_run_id desc limit 1) is false)
$fn$;

create or replace function prepmeds._components_current(p_rev bigint) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select not exists (select 1 from revision_components rc
                     where rc.revision_id = p_rev
                       and rc.component_revision_id is distinct from (_head(rc.component_group_id)).revision_id)
$fn$;

create or replace function prepmeds._passages_ok(p_rev bigint) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select not exists (select 1 from recommendations r where r.revision_id = p_rev
                     and (select pc.result from passage_checks pc where pc.passage_id = r.passage_id
                          order by pc.check_id desc limit 1) = 'not_found')
$fn$;

create or replace function prepmeds._revoked(p_target text, p_id bigint) returns boolean
language sql stable set search_path = prepmeds, pg_catalog as
$fn$ select exists (select 1 from revocations v where v.target = p_target and v.target_id = p_id) $fn$;

-- What is missing from the guideline comparison of a revision.
create or replace function prepmeds._comparison_gaps(p_rev bigint, p_group text) returns text[]
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare d text[] := '{}'; r record; v_domain text; v_pinned boolean; v_soc int; v_soc_compared int;
begin
  select g.domain_key, dm.comparators_pinned into v_domain, v_pinned
  from review_groups g join domains dm on dm.domain_key = g.domain_key where g.group_id = p_group;
  for r in select s.source_id from domain_required_sources s where s.domain_key = v_domain
            and not exists (select 1 from comparisons c where c.revision_id = p_rev and c.source_id = s.source_id)
            order by s.source_id loop
    d := d || format('MISSING_COMPARISON:%s: this guideline is a required comparator for domain %s; add a comparisons entry (COMPARED, NOT_ADDRESSED or NOT_SPECIFIED)', r.source_id, v_domain);
  end loop;
  for r in select c.source_id from comparisons c where c.revision_id = p_rev and c.status = 'COMPARED'
            and not exists (select 1 from recommendations x where x.revision_id = p_rev and x.source_id = c.source_id)
            order by c.source_id loop
    d := d || format('COMPARED_WITHOUT_RECOMMENDATION:%s: status is COMPARED but no recommendation cites this source', r.source_id);
  end loop;
  if not v_pinned then
    select count(*), count(*) filter (where c.status = 'COMPARED') into v_soc, v_soc_compared
    from comparisons c join guideline_sources s on s.source_id = c.source_id
    where c.revision_id = p_rev and s.kind in ('society_guideline','consensus_statement');
    if v_soc = 0 then
      d := array_append(d, 'NO_SOCIETY_SOURCE_CHECKED: at least one professional-society guideline or consensus statement must be compared (a drug label alone is not enough)');
    elsif v_soc_compared = 0 and v_soc < 2 then
      d := array_append(d, 'ABSENCE_NEEDS_TWO_SOCIETY_SOURCES: to record that no society addresses this medication, list at least two society sources that were checked');
    end if;
  end if;
  return d;
end $fn$;

create or replace function prepmeds._scenario_gaps(p_rev bigint, p_group text) returns text[]
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare d text[] := '{}'; r record; v_domain text;
begin
  select g.domain_key into v_domain from review_groups g where g.group_id = p_group;
  for r in select s.scenario_key from domain_scenarios s where s.domain_key = v_domain and s.required
            and not exists (select 1 from scenario_coverage c where c.revision_id = p_rev and c.scenario_key = s.scenario_key)
            order by s.scenario_key loop
    d := d || format('MISSING_SCENARIO:%s: add a scenario_coverage entry (ADDRESSED, NOT_APPLICABLE or NO_SOURCE_GUIDANCE)', r.scenario_key);
  end loop;
  for r in select c.scenario_key from scenario_coverage c where c.revision_id = p_rev and c.status = 'ADDRESSED'
            and not exists (select 1 from recommendations x where x.revision_id = p_rev and x.scenario_key = c.scenario_key)
            order by c.scenario_key loop
    d := d || format('ADDRESSED_WITHOUT_RECOMMENDATION:%s: status is ADDRESSED but no recommendation is tagged with this scenario', r.scenario_key);
  end loop;
  return d;
end $fn$;

-- Full acceptance check of the rows staged for a revision. Empty result = acceptable.
create or replace function prepmeds._validate(p_rev bigint, p_group text, p_formulation jsonb) returns text[]
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare d text[] := '{}'; g review_groups; v_cur text[]; v_given text[]; r record;
begin
  select * into g from review_groups x where x.group_id = p_group;

  v_cur := _current_meds(p_group); v_given := _revision_meds(p_rev);
  if v_cur <> v_given then
    d := d || format('MAPPING_MISMATCH: medication_ids must list exactly the canonical IDs mapped to this group. Mapped: %s. Given: %s', v_cur::text, v_given::text);
  end if;

  if coalesce(p_formulation->>'decision', '') not in ('single_unit','split_required') then
    d := array_append(d, 'FORMULATION_DECISION_MISSING: formulation.decision must be single_unit or split_required');
  elsif p_formulation->>'decision' = 'split_required' then
    d := array_append(d, 'SPLIT_REQUIRED: this group needs more than one recommendation set; call propose_split instead of submitting one package');
  elsif cardinality(v_cur) > 1
        and ((select count(distinct (coalesce(m.route, ''), coalesce(m.dosage_form, ''), coalesce(m.release_type, '')))
              from medications m where m.medication_id = any (v_cur)) > 1
             or exists (select 1 from medications m where m.medication_id = any (v_cur)
                        and (m.route is null or m.dosage_form is null)))
        and length(btrim(coalesce(p_formulation->>'rationale', ''))) < 40 then
    d := array_append(d, 'FORMULATION_RATIONALE_REQUIRED: the mapped products differ in route, dosage form or release, or the inventory does not record them; explain in formulation.rationale (40+ characters) why one recommendation set covers them all');
  end if;

  d := d || _comparison_gaps(p_rev, p_group);
  for r in select c.source_id from comparisons c where c.revision_id = p_rev and c.status <> 'COMPARED'
            and exists (select 1 from recommendations x where x.revision_id = p_rev and x.source_id = c.source_id) order by 1 loop
    d := d || format('COMPARISON_CONTRADICTION:%s: recommendations cite this source but its comparison status is not COMPARED', r.source_id);
  end loop;

  d := d || _scenario_gaps(p_rev, p_group);
  for r in select c.scenario_key from scenario_coverage c where c.revision_id = p_rev and c.status <> 'ADDRESSED'
            and exists (select 1 from recommendations x where x.revision_id = p_rev and x.scenario_key = c.scenario_key) order by 1 loop
    d := d || format('SCENARIO_CONTRADICTION:%s: recommendations exist for this scenario but its coverage status is not ADDRESSED', r.scenario_key);
  end loop;
  for r in select distinct x.scenario_key from recommendations x where x.revision_id = p_rev
            and not exists (select 1 from scenario_coverage c where c.revision_id = p_rev and c.scenario_key = x.scenario_key) order by 1 loop
    d := d || format('SCENARIO_COVERAGE_MISSING:%s: a recommendation uses this scenario; add a scenario_coverage entry for it', r.scenario_key);
  end loop;

  -- Disagreement between guidelines must be declared, never averaged away.
  for r in
    with sig as (
      select x.scenario_key, x.source_id,
             string_agg(concat_ws('~', x.qualifier, coalesce(x.renal_band::text, '-'), x.action,
                                  coalesce(trim_scale(x.hold_min)::text, '-'), coalesce(trim_scale(x.hold_max)::text, '-'),
                                  coalesce(x.hold_unit, '-'), x.bridging), ';'
                        order by x.qualifier collate "C", x.renal_band::text collate "C", x.action) as s
      from recommendations x where x.revision_id = p_rev group by 1, 2)
    select sig.scenario_key, array_agg(sig.source_id order by sig.source_id collate "C") as srcs
    from sig group by sig.scenario_key having count(distinct sig.s) > 1 order by 1
  loop
    if not (r.srcs <@ coalesce((select array_agg(distinct u) from conflicts c, unnest(c.source_ids) u
                                where c.revision_id = p_rev and c.scenario_key = r.scenario_key), '{}'::text[])) then
      d := d || format('UNDECLARED_CONFLICT:%s: sources %s do not give the same recommendation; add conflicts entries for this scenario that together name every one of them', r.scenario_key, r.srcs::text);
    end if;
  end loop;
  for r in select c.scenario_key, u as source_id from conflicts c, unnest(c.source_ids) u where c.revision_id = p_rev
            and not exists (select 1 from recommendations x where x.revision_id = p_rev and x.scenario_key = c.scenario_key and x.source_id = u) order by 1, 2 loop
    d := d || format('CONFLICT_WITHOUT_RECOMMENDATION:%s:%s: a conflict names this source but no recommendation from it exists for the scenario', r.scenario_key, r.source_id);
  end loop;

  -- Kidney-function bands of one source must be contiguous, or the gap must be explained.
  for r in
    with b as (
      select x.source_id, x.scenario_key, x.qualifier, x.renal_band,
             lead(x.renal_band) over (partition by x.source_id, x.scenario_key, x.qualifier
                                      order by lower(x.renal_band) nulls first, upper(x.renal_band) nulls last) as nxt
      from recommendations x where x.revision_id = p_rev and x.renal_band is not null)
    select b.* from b where b.nxt is not null and not (b.renal_band -|- b.nxt) order by 1, 2, 3
  loop
    if not exists (select 1 from boundary_notes n where n.revision_id = p_rev and n.source_id = r.source_id
                   and n.scenario_key = r.scenario_key and n.qualifier = r.qualifier) then
      d := d || format('RENAL_BAND_GAP:%s:%s: bands %s and %s are not contiguous, so some kidney-function values get no recommendation. Fix the bounds, or add a boundary_notes entry stating exactly what the source says', r.source_id, r.scenario_key, r.renal_band::text, r.nxt::text);
    end if;
  end loop;
  for r in select x.source_id, x.scenario_key, x.qualifier from recommendations x where x.revision_id = p_rev
            group by 1, 2, 3 having count(*) filter (where x.renal_band is null) > 0 and count(*) filter (where x.renal_band is not null) > 0 loop
    d := d || format('RENAL_MIXED:%s:%s: the same source and scenario has both kidney-stratified and unstratified rows; use a qualifier to separate them', r.source_id, r.scenario_key);
  end loop;

  -- Combination products: every ingredient is accounted for.
  if g.kind = 'combination' then
    for r in select gi.ingredient_id, exists (select 1 from _standalone_groups(gi.ingredient_id)) as has_standalone
              from group_ingredients gi where gi.group_id = p_group order by 1 loop
      if r.has_standalone then
        if not exists (select 1 from revision_components rc join group_ingredients x on x.group_id = rc.component_group_id
                       where rc.revision_id = p_rev and x.ingredient_id = r.ingredient_id) then
          d := d || format('COMPONENT_NOT_PINNED:%s: pin the current revision of a standalone review group for this ingredient in components[]', r.ingredient_id);
        end if;
      elsif not exists (select 1 from revision_ingredient_coverage c where c.revision_id = p_rev and c.ingredient_id = r.ingredient_id) then
        d := d || format('INGREDIENT_UNACCOUNTED:%s: this ingredient has no standalone review group; cover it in this package and list it in ingredient_coverage[]', r.ingredient_id);
      end if;
    end loop;
    for r in select rc.component_group_id from revision_components rc where rc.revision_id = p_rev
              and rc.component_revision_id is distinct from (_head(rc.component_group_id)).revision_id order by 1 loop
      d := d || format('COMPONENT_STALE:%s: components[] must pin the current head revision of this group', r.component_group_id);
    end loop;
  elsif exists (select 1 from revision_components rc where rc.revision_id = p_rev) then
    d := array_append(d, 'COMPONENTS_NOT_ALLOWED: only combination groups may list components[]');
  end if;

  for r in select distinct x.passage_id from recommendations x where x.revision_id = p_rev
            and (select pc.result from passage_checks pc where pc.passage_id = x.passage_id order by pc.check_id desc limit 1) = 'not_found' order by 1 loop
    d := d || format('PASSAGE_FAILED_VERIFICATION:%s: the automated check did not find this quote in the source; register the exact passage again and cite the new one', r.passage_id);
  end loop;
  return d;
end $fn$;

-- The material content of a revision, rebuilt from its normalized rows. Its SHA-256 is the
-- revision's identity for testing, review and release; editorial notes are not part of it.
create or replace function prepmeds._material(p_rev bigint, p_group text, p_formulation jsonb, p_open_questions jsonb)
returns jsonb language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select jsonb_build_object(
    'v', 1,
    'group_id', p_group,
    'formulation', jsonb_build_object('decision', p_formulation->>'decision', 'rationale', coalesce(btrim(p_formulation->>'rationale'), '')),
    'medications', to_jsonb(_revision_meds(p_rev)),
    'comparisons', (select coalesce(jsonb_agg(jsonb_build_object('source_id', c.source_id, 'status', c.status,
                      'checked_locators', coalesce(c.checked_locators, '')) order by c.source_id collate "C"), '[]'::jsonb)
                    from comparisons c where c.revision_id = p_rev),
    'recommendations', (select coalesce(jsonb_agg(jsonb_build_object(
                      'source_id', r.source_id, 'passage_id', r.passage_id, 'locator', p.locator, 'quote_sha256', p.quote_sha256,
                      'scenario_key', r.scenario_key, 'qualifier', r.qualifier, 'renal_measure', r.renal_measure, 'renal_band', r.renal_band::text,
                      'action', r.action, 'hold_min', trim_scale(r.hold_min), 'hold_max', trim_scale(r.hold_max), 'hold_unit', r.hold_unit,
                      'timing_text', r.timing_text, 'resume_min', trim_scale(r.resume_min), 'resume_max', trim_scale(r.resume_max),
                      'resume_unit', r.resume_unit, 'resume_text', r.resume_text, 'bridging', r.bridging, 'strength', r.strength,
                      'certainty', r.certainty, 'applicability', r.applicability, 'exceptions', r.exceptions, 'summary', r.summary)
                      order by r.source_id collate "C", r.scenario_key collate "C", r.qualifier collate "C",
                               lower(r.renal_band) nulls first, upper(r.renal_band) nulls last), '[]'::jsonb)
                    from recommendations r join source_passages p on p.passage_id = r.passage_id where r.revision_id = p_rev),
    'scenario_coverage', (select coalesce(jsonb_agg(jsonb_build_object('scenario_key', s.scenario_key, 'status', s.status,
                      'reason', coalesce(s.reason, '')) order by s.scenario_key collate "C"), '[]'::jsonb)
                    from scenario_coverage s where s.revision_id = p_rev),
    'conflicts', (select coalesce(jsonb_agg(jsonb_build_object('scenario_key', c.scenario_key,
                      'source_ids', (select jsonb_agg(u order by u collate "C") from unnest(c.source_ids) u), 'description', c.description)
                      order by c.scenario_key collate "C", c.description collate "C"), '[]'::jsonb)
                    from conflicts c where c.revision_id = p_rev),
    'boundary_notes', (select coalesce(jsonb_agg(jsonb_build_object('source_id', n.source_id, 'scenario_key', n.scenario_key,
                      'qualifier', n.qualifier, 'note', n.note) order by n.source_id collate "C", n.scenario_key collate "C", n.qualifier collate "C"), '[]'::jsonb)
                    from boundary_notes n where n.revision_id = p_rev),
    'components', (select coalesce(jsonb_agg(jsonb_build_object('group_id', rc.component_group_id, 'sha256', rc.component_sha256)
                      order by rc.component_group_id collate "C"), '[]'::jsonb)
                    from revision_components rc where rc.revision_id = p_rev),
    'ingredient_coverage', (select coalesce(jsonb_agg(c.ingredient_id order by c.ingredient_id collate "C"), '[]'::jsonb)
                    from revision_ingredient_coverage c where c.revision_id = p_rev),
    'blocking_questions', (select coalesce(jsonb_agg(q->>'text' order by (q->>'text') collate "C"), '[]'::jsonb)
                    from jsonb_array_elements(case when jsonb_typeof(p_open_questions) = 'array' then p_open_questions else '[]'::jsonb end) q
                    where coalesce((q->>'blocking')::boolean, false)))
$fn$;

-- Everything a clinician, the CI runner or the application needs to see for one revision.
create or replace function prepmeds._export_revision(p_rev bigint) returns jsonb
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select jsonb_build_object(
    'revision_id', e.revision_id, 'group_id', e.group_id, 'revision_no', e.revision_no, 'content_sha256', e.content_sha256,
    'created_at', e.created_at, 'worker_id', e.worker_id, 'git_commit', e.git_commit,
    'formulation', jsonb_build_object('decision', e.formulation_decision, 'rationale', e.formulation_rationale),
    'open_questions', e.open_questions,
    'editorial', e.package->'editorial',
    'medications', (select coalesce(jsonb_agg(jsonb_build_object('medication_id', d.medication_id, 'name', d.canonical_name,
                      'generic_name', d.generic_name, 'route', d.route, 'dosage_form', d.dosage_form, 'release_type', d.release_type,
                      'brand_names', to_jsonb(d.brand_names),
                      'aliases', (select coalesce(jsonb_agg(a.alias order by a.alias), '[]'::jsonb) from medication_aliases a where a.medication_id = d.medication_id))
                      order by d.medication_id collate "C"), '[]'::jsonb)
                    from revision_medications rm join medications d on d.medication_id = rm.medication_id where rm.revision_id = e.revision_id),
    'sources', (select coalesce(jsonb_agg(jsonb_build_object('source_id', s.source_id, 'kind', s.kind, 'society', s.society, 'title', s.title,
                      'publication_date', s.publication_date, 'version_label', s.version_label, 'doi', s.doi, 'url', s.url,
                      'superseded_by', s.superseded_by, 'withdrawn_at', s.withdrawn_at,
                      'comparison', jsonb_build_object('status', c.status, 'checked_locators', c.checked_locators, 'note', c.note))
                      order by s.source_id collate "C"), '[]'::jsonb)
                    from comparisons c join guideline_sources s on s.source_id = c.source_id where c.revision_id = e.revision_id),
    'passages', (select coalesce(jsonb_agg(jsonb_build_object('passage_id', p.passage_id, 'source_id', p.source_id, 'locator', p.locator,
                      'page', p.page, 'deep_link', p.deep_link, 'quote', p.quote, 'quote_sha256', p.quote_sha256,
                      'last_check', (select jsonb_build_object('result', pc.result, 'detail', pc.detail, 'checked_at', pc.checked_at)
                                     from passage_checks pc where pc.passage_id = p.passage_id order by pc.check_id desc limit 1))
                      order by p.source_id collate "C", p.passage_id), '[]'::jsonb)
                    from source_passages p where p.passage_id in (select r.passage_id from recommendations r where r.revision_id = e.revision_id)),
    'recommendations', (select coalesce(jsonb_agg(jsonb_build_object('source_id', r.source_id, 'passage_id', r.passage_id,
                      'scenario_key', r.scenario_key, 'qualifier', r.qualifier, 'renal_measure', r.renal_measure,
                      'renal_band', r.renal_band::text, 'renal_min', lower(r.renal_band), 'renal_min_inclusive', lower_inc(r.renal_band),
                      'renal_max', upper(r.renal_band), 'renal_max_inclusive', upper_inc(r.renal_band),
                      'action', r.action, 'hold_min', r.hold_min, 'hold_max', r.hold_max, 'hold_unit', r.hold_unit, 'timing_text', r.timing_text,
                      'resume_min', r.resume_min, 'resume_max', r.resume_max, 'resume_unit', r.resume_unit, 'resume_text', r.resume_text,
                      'bridging', r.bridging, 'strength', r.strength, 'certainty', r.certainty, 'applicability', r.applicability,
                      'exceptions', r.exceptions, 'summary', r.summary)
                      order by r.scenario_key collate "C", r.source_id collate "C", r.qualifier collate "C",
                               lower(r.renal_band) nulls first), '[]'::jsonb)
                    from recommendations r where r.revision_id = e.revision_id),
    'scenario_coverage', (select coalesce(jsonb_agg(jsonb_build_object('scenario_key', s.scenario_key, 'status', s.status, 'reason', s.reason,
                      'label', ds.label) order by s.scenario_key collate "C"), '[]'::jsonb)
                    from scenario_coverage s join domain_scenarios ds on ds.domain_key = s.domain_key and ds.scenario_key = s.scenario_key
                    where s.revision_id = e.revision_id),
    'conflicts', (select coalesce(jsonb_agg(jsonb_build_object('scenario_key', c.scenario_key, 'source_ids', to_jsonb(c.source_ids),
                      'description', c.description) order by c.scenario_key collate "C", c.conflict_id), '[]'::jsonb)
                    from conflicts c where c.revision_id = e.revision_id),
    'boundary_notes', (select coalesce(jsonb_agg(jsonb_build_object('source_id', n.source_id, 'scenario_key', n.scenario_key,
                      'qualifier', n.qualifier, 'note', n.note) order by n.source_id collate "C", n.scenario_key collate "C"), '[]'::jsonb)
                    from boundary_notes n where n.revision_id = e.revision_id),
    'components', (select coalesce(jsonb_agg(jsonb_build_object('group_id', rc.component_group_id, 'revision_id', rc.component_revision_id,
                      'content_sha256', rc.component_sha256,
                      'is_current', rc.component_revision_id is not distinct from (_head(rc.component_group_id)).revision_id)
                      order by rc.component_group_id collate "C"), '[]'::jsonb)
                    from revision_components rc where rc.revision_id = e.revision_id),
    'test_runs', (select coalesce(jsonb_agg(jsonb_build_object('suite', t.suite, 'suite_version', t.suite_version, 'passed', t.passed,
                      'total', t.total, 'failed', t.failed, 'commit_sha', t.commit_sha, 'ci_run_id', t.ci_run_id,
                      'recorded_at', t.recorded_at) order by t.test_run_id), '[]'::jsonb)
                    from test_runs t where t.revision_id = e.revision_id))
  from evidence_revisions e where e.revision_id = p_rev
$fn$;

-- ── Derived progress: eleven independent facts, each computed from rows that exist ───
create or replace function prepmeds.group_status(p_group_id text) returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
declare
  g review_groups; h evidence_revisions; b text[] := '{}';
  m1 boolean; m2 boolean; m3 boolean; m4 boolean := false; m5 boolean := false; m6 boolean := false;
  m7 boolean := false; m8 boolean := false; m9 boolean := false; m10 boolean := false; m11 boolean := false;
  v_map_current boolean := false;
begin
  select * into g from review_groups x where x.group_id = p_group_id;
  if not found then return null; end if;
  m1 := cardinality(_current_meds(g.group_id)) > 0;
  m2 := g.bucket is not null;
  m3 := exists (select 1 from tasks t where t.group_id = g.group_id and t.first_claimed_at is not null);
  if not m1 then b := array_append(b, 'NO_ACTIVE_MEDICATION_MAPPED'); end if;
  if not m2 then b := array_append(b, 'NO_BUCKET_ASSIGNED'); end if;
  h := _head(g.group_id);
  if h.revision_id is null then
    b := array_append(b, 'NO_ACCEPTED_EVIDENCE_REVISION');
  else
    m4 := exists (select 1 from recommendations r where r.revision_id = h.revision_id)
          or (exists (select 1 from comparisons c where c.revision_id = h.revision_id)
              and not exists (select 1 from comparisons c where c.revision_id = h.revision_id and c.status = 'COMPARED'));
    m5 := cardinality(_comparison_gaps(h.revision_id, g.group_id)) = 0;
    m6 := cardinality(_scenario_gaps(h.revision_id, g.group_id)) = 0;
    v_map_current := _revision_meds(h.revision_id) = _current_meds(g.group_id);
    m7 := v_map_current and _suite_passed(h.revision_id, 'mapping');
    m8 := _suite_passed(h.revision_id, 'evidence');
    if not m4 then b := array_append(b, 'NO_EVIDENCE_EXTRACTED'); end if;
    if not m5 then b := array_append(b, 'GUIDELINE_COMPARISON_INCOMPLETE'); end if;
    if not m6 then b := array_append(b, 'SCENARIO_COVERAGE_INCOMPLETE'); end if;
    if not v_map_current then b := array_append(b, 'CANONICAL_MAPPING_CHANGED_SINCE_REVISION'); end if;
    if not _suite_passed(h.revision_id, 'mapping') then b := array_append(b, 'MAPPING_TESTS_NOT_PASSED'); end if;
    if not m8 then b := array_append(b, 'EVIDENCE_TESTS_NOT_PASSED'); end if;
    if h.has_blocking_question then b := array_append(b, 'BLOCKING_OPEN_QUESTION'); end if;
    if not _passages_ok(h.revision_id) then b := array_append(b, 'PASSAGE_FAILED_VERIFICATION'); end if;
    if not _components_current(h.revision_id) then b := array_append(b, 'COMPONENT_REVISION_OUT_OF_DATE'); end if;
    m9 := cardinality(b) = 0;
    m10 := exists (select 1 from clinician_reviews r where r.group_id = g.group_id and r.content_sha256 = h.content_sha256
                   and r.decision = 'reviewed' and not _revoked('review', r.review_id));
    m11 := exists (select 1 from release_authorizations a join clinician_reviews r on r.review_id = a.review_id
                   where a.group_id = g.group_id and a.content_sha256 = h.content_sha256
                     and not _revoked('release', a.authorization_id) and not _revoked('review', r.review_id));
  end if;
  return jsonb_build_object(
    'group_id', g.group_id, 'kind', g.kind, 'bucket', g.bucket, 'lane', g.lane, 'domain_key', g.domain_key, 'retired', g.retired_at is not null,
    'head_revision_no', h.revision_no, 'head_sha256', h.content_sha256,
    'm01_inventoried', m1, 'm02_assigned', m2, 'm03_research_started', m3, 'm04_evidence_extracted', m4,
    'm05_guideline_comparison_completed', m5, 'm06_scenario_coverage_completed', m6, 'm07_canonical_mapping_tested', m7,
    'm08_evidence_tests_passed', m8, 'm09_ready_for_clinician_review', m9, 'm10_clinician_reviewed', m10,
    'm11_patient_facing_authorized', m11,
    'patient_facing_active', m11 and not _suite_failing(h.revision_id),
    'blockers', to_jsonb(b));
end $fn$;

create or replace view prepmeds.group_progress as
  select g.group_id, g.kind, g.bucket, g.lane, g.domain_key, g.class_key, s.*
  from prepmeds.review_groups g
  cross join lateral jsonb_to_record(prepmeds.group_status(g.group_id)) as s(
    head_revision_no int, head_sha256 text,
    m01_inventoried boolean, m02_assigned boolean, m03_research_started boolean, m04_evidence_extracted boolean,
    m05_guideline_comparison_completed boolean, m06_scenario_coverage_completed boolean, m07_canonical_mapping_tested boolean,
    m08_evidence_tests_passed boolean, m09_ready_for_clinician_review boolean, m10_clinician_reviewed boolean,
    m11_patient_facing_authorized boolean, patient_facing_active boolean, blockers jsonb)
  where g.retired_at is null;

-- Every way the inventory can fail to be fully accounted for. Empty = reconciled.
create or replace view prepmeds.inventory_gaps as
  select 'MEDICATION_UNMAPPED'::text as gap, d.medication_id as subject, 'active canonical ID has no review group'::text as detail
    from prepmeds.medications d
    where d.active and not exists (select 1 from prepmeds.medication_group_map m where m.medication_id = d.medication_id)
      and not exists (select 1 from prepmeds.inventory_exceptions x where x.medication_id = d.medication_id)
  union all
  select 'MEDICATION_IN_RETIRED_GROUP', d.medication_id, 'mapped to retired group ' || m.group_id
    from prepmeds.medications d join prepmeds.medication_group_map m on m.medication_id = d.medication_id
    join prepmeds.review_groups g on g.group_id = m.group_id
    where d.active and g.retired_at is not null
      and not exists (select 1 from prepmeds.inventory_exceptions x where x.medication_id = d.medication_id)
  union all
  select 'GROUP_UNASSIGNED', g.group_id, 'review group has no bucket, so no lane owns it'
    from prepmeds.review_groups g where g.retired_at is null and g.bucket is null
  union all
  select 'GROUP_EMPTY', g.group_id, 'review group has no active canonical ID'
    from prepmeds.review_groups g where g.retired_at is null and cardinality(prepmeds._current_meds(g.group_id)) = 0
  union all
  select 'GROUP_WITHOUT_WORK', g.group_id, 'no accepted revision and no open task'
    from prepmeds.review_groups g
    where g.retired_at is null and g.bucket is not null and (prepmeds._head(g.group_id)).revision_id is null
      and not exists (select 1 from prepmeds.tasks t where t.group_id = g.group_id and t.status in ('available','claimed','awaiting_ci','blocked'))
  union all
  select 'REVISION_MAPPING_STALE', g.group_id, 'the canonical IDs mapped to the group changed after its current revision'
    from prepmeds.review_groups g
    where g.retired_at is null and (prepmeds._head(g.group_id)).revision_id is not null
      and prepmeds._revision_meds((prepmeds._head(g.group_id)).revision_id) <> prepmeds._current_meds(g.group_id)
  union all
  select 'ALIAS_AMBIGUOUS', a.alias_norm, 'alias resolves to more than one review group: ' || string_agg(distinct m.group_id, ', ')
    from prepmeds.medication_aliases a join prepmeds.medication_group_map m on m.medication_id = a.medication_id
    join prepmeds.medications d on d.medication_id = a.medication_id and d.active
    group by a.alias_norm having count(distinct m.group_id) > 1;

-- ── Worker implementation (identity already resolved to a workers row) ───────────────
create or replace function prepmeds._session_check(w prepmeds.workers, p_session_id bigint) returns void
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
begin
  if not exists (select 1 from sessions s where s.session_id = p_session_id and s.worker_id = w.worker_id and s.ended_at is null) then
    raise exception 'PREPMEDS_SESSION_NOT_CURRENT: session % is not the open session of %; call start_session and use the id it returns',
      coalesce(p_session_id::text, '(none)'), w.worker_id using errcode = '42501';
  end if;
end $fn$;

create or replace function prepmeds._lane_counts(p_lane text) returns jsonb
language sql stable set search_path = prepmeds, pg_catalog as $fn$
  select jsonb_build_object(
    'available', count(*) filter (where t.status = 'available'),
    'available_but_waiting_for_component', count(*) filter (where t.status = 'available' and not _deps_ready(t.group_id)),
    'claimed', count(*) filter (where t.status = 'claimed'),
    'awaiting_ci', count(*) filter (where t.status = 'awaiting_ci'),
    'blocked', count(*) filter (where t.status = 'blocked'),
    'done', count(*) filter (where t.status = 'done'))
  from tasks t join review_groups g on g.group_id = t.group_id
  where g.lane = p_lane and g.retired_at is null
$fn$;

create or replace function prepmeds._open_task(p_group text, p_reason text, p_detail jsonb, p_priority int) returns bigint
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v bigint;
begin
  if exists (select 1 from tasks t where t.group_id = p_group and t.status in ('available','claimed','awaiting_ci','blocked')) then return null; end if;
  if (select g.retired_at is not null or g.bucket is null from review_groups g where g.group_id = p_group) then return null; end if;
  insert into tasks (group_id, reason, detail, priority) values (p_group, p_reason, p_detail, p_priority) returning task_id into v;
  perform _event('system', null, 'task_opened', p_group, v, null, jsonb_build_object('reason', p_reason));
  return v;
end $fn$;

create or replace function prepmeds._expire_leases(p_lane text) returns int
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare x record; n int := 0; v_max int := _setting_int('max_attempts');
begin
  for x in select t.task_id, t.group_id, t.claimed_by, t.attempt from tasks t join review_groups g on g.group_id = t.group_id
            where t.status = 'claimed' and t.lease_expires_at < clock_timestamp() and (p_lane is null or g.lane = p_lane)
            for update of t skip locked loop
    if x.attempt >= v_max then
      update tasks set status = 'blocked', blocked_reason = 'ATTEMPTS_EXHAUSTED', claimed_by = null, claim_token = null,
             lease_expires_at = null, last_error_code = 'LEASE_EXPIRED', updated_at = now() where task_id = x.task_id;
      perform _event('system', null, 'task_blocked', x.group_id, x.task_id, null,
                     jsonb_build_object('reason', 'ATTEMPTS_EXHAUSTED', 'attempts', x.attempt, 'last_worker', x.claimed_by));
    else
      update tasks set status = 'available', claimed_by = null, claim_token = null, lease_expires_at = null,
             last_error_code = 'LEASE_EXPIRED', updated_at = now() where task_id = x.task_id;
      perform _event('system', null, 'lease_expired', x.group_id, x.task_id, null,
                     jsonb_build_object('attempt', x.attempt, 'last_worker', x.claimed_by));
    end if;
    n := n + 1;
  end loop;
  return n;
end $fn$;

create or replace function prepmeds._brief(p_task_id bigint) returns jsonb
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; g review_groups;
begin
  select * into t from tasks x where x.task_id = p_task_id;
  select * into g from review_groups x where x.group_id = t.group_id;
  return jsonb_build_object(
    'task', jsonb_build_object('task_id', t.task_id, 'claim_token', t.claim_token, 'attempt', t.attempt, 'reason', t.reason,
            'detail', t.detail, 'lease_expires_at', t.lease_expires_at, 'saved_progress', t.progress,
            'saved_progress_at', t.progress_saved_at, 'last_error_code', t.last_error_code),
    'group', jsonb_build_object('group_id', g.group_id, 'kind', g.kind, 'bucket', g.bucket, 'lane', g.lane,
            'domain', g.domain_key, 'class', g.class_key,
            'ingredients', (select coalesce(jsonb_agg(gi.ingredient_id order by gi.ingredient_id collate "C"), '[]'::jsonb)
                            from group_ingredients gi where gi.group_id = g.group_id),
            'medications', (select coalesce(jsonb_agg(jsonb_build_object('medication_id', d.medication_id, 'name', d.canonical_name,
                              'generic_name', d.generic_name, 'route', d.route, 'dosage_form', d.dosage_form,
                              'release_type', d.release_type, 'brand_names', to_jsonb(d.brand_names))
                              order by d.medication_id collate "C"), '[]'::jsonb)
                            from medication_group_map m join medications d on d.medication_id = m.medication_id
                            where m.group_id = g.group_id and d.active)),
    'based_on_revision_no', coalesce((_head(g.group_id)).revision_no, 0),
    'comparators_pinned', (select d.comparators_pinned from domains d where d.domain_key = g.domain_key),
    'required_sources', (select coalesce(jsonb_agg(jsonb_build_object('source_id', s.source_id, 'society', s.society, 'title', s.title,
                           'version', s.version_label, 'doi', s.doi, 'url', s.url) order by s.source_id collate "C"), '[]'::jsonb)
                         from domain_required_sources r join guideline_sources s on s.source_id = r.source_id
                         where r.domain_key = g.domain_key),
    'scenarios', (select coalesce(jsonb_agg(jsonb_build_object('scenario_key', s.scenario_key, 'label', s.label,
                    'description', s.description, 'required', s.required) order by s.required desc, s.scenario_key collate "C"), '[]'::jsonb)
                  from domain_scenarios s where s.domain_key = g.domain_key),
    'known_passages', (select coalesce(jsonb_agg(q.p order by q.source_id collate "C", q.passage_id), '[]'::jsonb) from (
                         select sp.source_id, sp.passage_id,
                                jsonb_build_object('passage_id', sp.passage_id, 'source_id', sp.source_id, 'locator', sp.locator,
                                  'quote_start', left(sp.quote, 140),
                                  'last_check', (select pc.result from passage_checks pc where pc.passage_id = sp.passage_id
                                                 order by pc.check_id desc limit 1)) as p
                         from source_passages sp
                         where sp.source_id in (
                                 select r.source_id from domain_required_sources r where r.domain_key = g.domain_key
                                 union
                                 select c.source_id from comparisons c join evidence_revisions e on e.revision_id = c.revision_id
                                   join review_groups og on og.group_id = e.group_id
                                   where og.domain_key = g.domain_key and og.class_key is not distinct from g.class_key)
                         order by sp.passage_id desc limit 150) q),
    'components', case when g.kind = 'combination' then (
                    select coalesce(jsonb_agg(jsonb_build_object('ingredient_id', gi.ingredient_id,
                             'standalone_groups', (select coalesce(jsonb_agg(jsonb_build_object('group_id', s.gid,
                                                     'head_revision_no', (_head(s.gid)).revision_no,
                                                     'head_sha256', (_head(s.gid)).content_sha256) order by s.gid collate "C"), '[]'::jsonb)
                                                   from _standalone_groups(gi.ingredient_id) s(gid)),
                             'rule', case when exists (select 1 from _standalone_groups(gi.ingredient_id))
                                          then 'pin the head revision of one standalone group in components[]'
                                          else 'no standalone group exists: cover this ingredient here and list it in ingredient_coverage[]' end)
                             order by gi.ingredient_id collate "C"), '[]'::jsonb)
                    from group_ingredients gi where gi.group_id = g.group_id)
                  else '[]'::jsonb end,
    'package_schema_version', 1);
end $fn$;

create or replace function prepmeds._start_session(w prepmeds.workers, p_label text) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v bigint;
begin
  update sessions set ended_at = now(), end_reason = 'superseded' where worker_id = w.worker_id and ended_at is null;
  insert into sessions (worker_id, label) values (w.worker_id, p_label) returning session_id into v;
  update tasks set session_id = v, updated_at = now() where claimed_by = w.worker_id and status = 'claimed';
  perform _event('worker', w.worker_id, 'session_started', null, null, null, jsonb_build_object('session_id', v, 'label', p_label));
  return jsonb_build_object('ok', true, 'session_id', v, 'worker_id', w.worker_id, 'lane', w.lane,
                            'target_ready_groups', _setting_int('session_target'), 'lane_counts', _lane_counts(w.lane));
end $fn$;

create or replace function prepmeds._claim(w prepmeds.workers, p_session_id bigint) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; v_task bigint; v_lease interval := make_interval(mins => _setting_int('lease_minutes'));
begin
  perform _session_check(w, p_session_id);
  perform _expire_leases(w.lane);
  -- A worker has at most one live claim. Asking again returns it: a fresh conversation resumes, it does not restart.
  select * into t from tasks x where x.claimed_by = w.worker_id and x.status = 'claimed' for update;
  if found then
    update tasks set lease_expires_at = clock_timestamp() + v_lease, session_id = p_session_id, updated_at = now()
     where task_id = t.task_id;
    perform _event('worker', w.worker_id, 'claim_resumed', t.group_id, t.task_id, null,
                   jsonb_build_object('session_id', p_session_id, 'attempt', t.attempt));
    return jsonb_build_object('ok', true, 'status', 'RESUMED') || _brief(t.task_id);
  end if;
  -- Unfinished work first: failed or returned work, then work with saved progress, then new work in bucket order.
  select x.task_id into v_task
    from tasks x join review_groups g on g.group_id = x.group_id
   where x.status = 'available' and g.lane = w.lane and g.retired_at is null and _deps_ready(g.group_id)
   order by (x.reason <> 'initial') desc, (x.progress is not null) desc, x.priority, g.bucket, g.group_id collate "C"
   limit 1 for update of x skip locked;
  if not found then
    return jsonb_build_object('ok', true, 'status', 'NO_WORK', 'lane', w.lane, 'lane_counts', _lane_counts(w.lane));
  end if;
  update tasks set status = 'claimed', claimed_by = w.worker_id, session_id = p_session_id, claim_token = gen_random_uuid(),
         lease_expires_at = clock_timestamp() + v_lease, attempt = attempt + 1,
         first_claimed_at = coalesce(first_claimed_at, now()), updated_at = now()
   where task_id = v_task returning * into t;
  perform _event('worker', w.worker_id, 'claimed', t.group_id, t.task_id, null,
                 jsonb_build_object('session_id', p_session_id, 'attempt', t.attempt, 'reason', t.reason));
  return jsonb_build_object('ok', true, 'status', 'CLAIMED') || _brief(t.task_id);
end $fn$;

create or replace function prepmeds._claim_holder(w prepmeds.workers, p_task_id bigint, p_claim_token uuid) returns prepmeds.tasks
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks;
begin
  select * into t from tasks x where x.task_id = p_task_id for update;
  if not found then raise exception 'PREPMEDS_NO_SUCH_TASK: %', p_task_id; end if;
  if t.status <> 'claimed' or t.claimed_by is distinct from w.worker_id or t.claim_token is distinct from p_claim_token then
    raise exception 'PREPMEDS_NOT_CLAIM_HOLDER: task % is not held by % with this claim token (its status is %). Call claim_next to see what you hold',
      p_task_id, w.worker_id, t.status using errcode = '42501';
  end if;
  if (select g.lane from review_groups g where g.group_id = t.group_id) is distinct from w.lane then
    raise exception 'PREPMEDS_LANE_VIOLATION: % (lane %) may not write to group %', w.worker_id, w.lane, t.group_id using errcode = '42501';
  end if;
  return t;
end $fn$;

create or replace function prepmeds._heartbeat(w prepmeds.workers, p_session_id bigint, p_task_id bigint, p_claim_token uuid) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; v_until timestamptz;
begin
  perform _session_check(w, p_session_id);
  t := _claim_holder(w, p_task_id, p_claim_token);
  v_until := clock_timestamp() + make_interval(mins => _setting_int('lease_minutes'));
  update tasks set lease_expires_at = v_until, updated_at = now() where task_id = t.task_id;
  return jsonb_build_object('ok', true, 'lease_expires_at', v_until);
end $fn$;

create or replace function prepmeds._save_progress(w prepmeds.workers, p_session_id bigint, p_task_id bigint, p_claim_token uuid, p_progress jsonb) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; v_until timestamptz;
begin
  perform _session_check(w, p_session_id);
  t := _claim_holder(w, p_task_id, p_claim_token);
  if p_progress is null or jsonb_typeof(p_progress) <> 'object' then
    raise exception 'PREPMEDS_BAD_PROGRESS: progress must be a JSON object';
  end if;
  v_until := clock_timestamp() + make_interval(mins => _setting_int('lease_minutes'));
  update tasks set progress = p_progress, progress_saved_at = clock_timestamp(), lease_expires_at = v_until, updated_at = now()
   where task_id = t.task_id;
  perform _event('worker', w.worker_id, 'progress_saved', t.group_id, t.task_id, null,
                 jsonb_build_object('bytes', length(p_progress::text), 'sha256', _sha256(p_progress::text)));
  return jsonb_build_object('ok', true, 'lease_expires_at', v_until);
end $fn$;

create or replace function prepmeds._release(w prepmeds.workers, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                            p_code text, p_note text) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; v_block boolean;
begin
  perform _session_check(w, p_session_id);
  t := _claim_holder(w, p_task_id, p_claim_token);
  if p_code not in ('SESSION_ENDING','TOOL_FAILURE','SOURCE_INACCESSIBLE','NEEDS_CLINICIAN_INPUT','CANNOT_COMPLETE') then
    raise exception 'PREPMEDS_BAD_RELEASE_CODE: use SESSION_ENDING, TOOL_FAILURE, SOURCE_INACCESSIBLE, NEEDS_CLINICIAN_INPUT or CANNOT_COMPLETE';
  end if;
  v_block := p_code in ('SOURCE_INACCESSIBLE','NEEDS_CLINICIAN_INPUT','CANNOT_COMPLETE');
  if v_block and length(btrim(coalesce(p_note, ''))) < 20 then
    raise exception 'PREPMEDS_RELEASE_NEEDS_NOTE: say exactly what is blocking this group (20+ characters) so a person can act on it';
  end if;
  update tasks set status = case when v_block then 'blocked' else 'available' end,
         blocked_reason = case when v_block then p_code || ': ' || btrim(p_note) end,
         claimed_by = null, claim_token = null, lease_expires_at = null, last_error_code = p_code, updated_at = now()
   where task_id = t.task_id;
  perform _event('worker', w.worker_id, case when v_block then 'task_blocked' else 'task_released' end, t.group_id, t.task_id, null,
                 jsonb_build_object('code', p_code, 'note', p_note));
  return jsonb_build_object('ok', true, 'task_id', t.task_id, 'status', case when v_block then 'blocked' else 'available' end);
end $fn$;

create or replace function prepmeds._submit(w prepmeds.workers, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                           p_submission_id text, p_package jsonb, p_git_commit text) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare
  t tasks; g review_groups; e evidence_revisions; c evidence_revisions; r record;
  v_head int; v_rev bigint; v_defs text[] := '{}'; v_pre text[] := '{}';
  v_keymap jsonb := '{}'; v_pid bigint; v_q text; v_i int; v_con text; v_msg text;
  v_band numrange; v_measure text; v_material jsonb; v_hash text; v_rejected boolean := false;
  v_form jsonb; v_questions jsonb;
  v_lease interval := make_interval(mins => _setting_int('lease_minutes'));
begin
  if p_package is null or jsonb_typeof(p_package) <> 'object' then
    raise exception 'PREPMEDS_BAD_PACKAGE: the package must be a JSON object';
  end if;
  if length(btrim(coalesce(p_submission_id, ''))) < 8 then
    raise exception 'PREPMEDS_BAD_PACKAGE: submission_id (8+ characters, unique per attempt) is required';
  end if;
  perform _session_check(w, p_session_id);

  -- Idempotent replay: resubmitting the same submission returns the stored result.
  select * into e from evidence_revisions x where x.task_id = p_task_id and x.submission_id = p_submission_id;
  if found then
    return jsonb_build_object('ok', true, 'accepted', true, 'replayed', true, 'revision_id', e.revision_id,
                              'revision_no', e.revision_no, 'content_sha256', e.content_sha256, 'next', 'awaiting_ci');
  end if;

  t := _claim_holder(w, p_task_id, p_claim_token);
  select * into g from review_groups x where x.group_id = t.group_id;
  if (p_package->>'schema_version') is distinct from '1' then
    raise exception 'PREPMEDS_BAD_PACKAGE: schema_version must be 1';
  end if;
  if (p_package->>'group_id') is distinct from g.group_id then
    raise exception 'PREPMEDS_BAD_PACKAGE: group_id % does not match the claimed task, which is for %', coalesce(p_package->>'group_id', '(missing)'), g.group_id;
  end if;
  v_head := coalesce((_head(g.group_id)).revision_no, 0);
  if (p_package->>'based_on_revision_no') is distinct from v_head::text then
    raise exception 'PREPMEDS_STALE_BASE: the package is based on revision % but the current revision is %. Re-read the task and rebuild from the current revision',
      coalesce(p_package->>'based_on_revision_no', '(missing)'), v_head;
  end if;
  v_form := case when jsonb_typeof(p_package->'formulation') = 'object' then p_package->'formulation' else '{}'::jsonb end;
  v_questions := case when jsonb_typeof(p_package->'open_questions') = 'array' then p_package->'open_questions' else '[]'::jsonb end;

  -- Sources and passages are shared reference data: they are kept even if this package is rejected.
  for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'sources') = 'array' then p_package->'sources' else '[]'::jsonb end) loop
    begin
      if not exists (select 1 from guideline_sources s where s.source_id = r.j->>'source_id') then
        insert into guideline_sources (source_id, kind, society, title, publication_date, version_label, doi, url, registered_by)
        values (r.j->>'source_id', r.j->>'kind', r.j->>'society', r.j->>'title', nullif(r.j->>'publication_date', '')::date,
                r.j->>'version_label', nullif(btrim(r.j->>'doi'), ''), r.j->>'url', w.worker_id);
        perform _event('worker', w.worker_id, 'source_registered', g.group_id, t.task_id, null, jsonb_build_object('source_id', r.j->>'source_id'));
      end if;
    exception
      when unique_violation then
        v_pre := v_pre || format('SOURCE[%s]: this DOI is already registered as %s; use that source_id', r.j->>'source_id',
                   (select s.source_id from guideline_sources s where lower(s.doi) = lower(btrim(r.j->>'doi'))));
      when others then
        v_pre := v_pre || format('SOURCE[%s]: %s', coalesce(r.j->>'source_id', '?'), sqlerrm);
    end;
  end loop;

  for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'passages') = 'array' then p_package->'passages' else '[]'::jsonb end) loop
    begin
      if coalesce(r.j->>'key', '') = '' then raise exception 'every passage needs a key'; end if;
      v_q := btrim(regexp_replace(coalesce(r.j->>'quote', ''), '[[:space:]]+', ' ', 'g'));
      select p.passage_id into v_pid from source_passages p
       where p.source_id = r.j->>'source_id' and p.locator = btrim(r.j->>'locator') and p.quote_sha256 = _sha256(v_q);
      if not found then
        insert into source_passages (source_id, locator, page, deep_link, quote, quote_sha256, registered_by)
        values (r.j->>'source_id', btrim(r.j->>'locator'), nullif(btrim(r.j->>'page'), ''), nullif(btrim(r.j->>'deep_link'), ''),
                v_q, _sha256(v_q), w.worker_id)
        returning passage_id into v_pid;
      end if;
      v_keymap := v_keymap || jsonb_build_object(r.j->>'key', v_pid);
    exception when others then
      v_pre := v_pre || format('PASSAGE[%s]: %s', coalesce(r.j->>'key', '?'), sqlerrm);
    end;
  end loop;

  v_rev := nextval('prepmeds.evidence_revision_id_seq');
  begin
    for r in select value #>> '{}' as mid from jsonb_array_elements(case when jsonb_typeof(p_package->'medication_ids') = 'array' then p_package->'medication_ids' else '[]'::jsonb end) loop
      begin
        insert into revision_medications (revision_id, medication_id) values (v_rev, r.mid);
      exception when others then
        v_defs := v_defs || format('MEDICATION[%s]: %s', coalesce(r.mid, '?'), sqlerrm);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'comparisons') = 'array' then p_package->'comparisons' else '[]'::jsonb end) loop
      begin
        insert into comparisons (revision_id, source_id, status, checked_locators, note)
        values (v_rev, r.j->>'source_id', r.j->>'status', nullif(btrim(r.j->>'checked_locators'), ''), nullif(btrim(r.j->>'note'), ''));
      exception when others then
        get stacked diagnostics v_con = constraint_name;
        v_defs := v_defs || format('COMPARISON[%s]: %s', coalesce(r.j->>'source_id', '?'),
          case v_con when 'comparisons_absence_needs_locators'
               then 'NOT_ADDRESSED and NOT_SPECIFIED need checked_locators: say which sections or tables you read to establish the absence'
               else sqlerrm end);
      end;
    end loop;

    v_i := 0;
    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'recommendations') = 'array' then p_package->'recommendations' else '[]'::jsonb end) loop
      v_i := v_i + 1;
      begin
        if jsonb_typeof(r.j->'passage') = 'number' then v_pid := (r.j->>'passage')::bigint;
        else v_pid := (v_keymap ->> (r.j->>'passage'))::bigint; end if;
        if v_pid is null then
          raise exception 'passage "%" is neither a key in passages[] nor an existing passage_id', coalesce(r.j->>'passage', '(missing)');
        end if;
        v_band := null; v_measure := null;
        if jsonb_typeof(r.j->'renal') = 'object' then
          v_measure := r.j->'renal'->>'measure';
          v_band := numrange((r.j->'renal'->>'min')::numeric, (r.j->'renal'->>'max')::numeric,
                     case when coalesce((r.j->'renal'->>'min_inclusive')::boolean, true) then '[' else '(' end ||
                     case when coalesce((r.j->'renal'->>'max_inclusive')::boolean, false) then ']' else ')' end);
        end if;
        insert into recommendations (revision_id, source_id, passage_id, domain_key, scenario_key, qualifier, renal_measure, renal_band,
               action, hold_min, hold_max, hold_unit, timing_text, resume_min, resume_max, resume_unit, resume_text,
               bridging, strength, certainty, applicability, exceptions, summary)
        values (v_rev, r.j->>'source_id', v_pid, g.domain_key, r.j->>'scenario_key', coalesce(btrim(r.j->>'qualifier'), ''), v_measure, v_band,
               r.j->>'action', (r.j->'hold'->>'min')::numeric, (r.j->'hold'->>'max')::numeric, r.j->'hold'->>'unit', nullif(btrim(r.j->>'timing_text'), ''),
               (r.j->'resume'->>'min')::numeric, (r.j->'resume'->>'max')::numeric, r.j->'resume'->>'unit', nullif(btrim(r.j->>'resume_text'), ''),
               coalesce(r.j->>'bridging', 'not_specified'), coalesce(nullif(btrim(r.j->>'strength'), ''), 'not_stated'),
               coalesce(nullif(btrim(r.j->>'certainty'), ''), 'not_stated'), nullif(btrim(r.j->>'applicability'), ''),
               nullif(btrim(r.j->>'exceptions'), ''), r.j->>'summary');
      exception when others then
        get stacked diagnostics v_con = constraint_name, v_msg = message_text;
        v_defs := v_defs || format('RECOMMENDATION[%s]: %s', v_i, case v_con
          when 'recommendations_no_renal_overlap' then 'RENAL_BAND_OVERLAP: another row of the same source, scenario and qualifier already covers part of this kidney-function range'
          when 'recommendations_one_unstratified' then 'DUPLICATE_ROW: the same source, scenario and qualifier already has an unstratified row'
          when 'recommendations_comparison_fk' then 'the source has no comparisons entry in this package'
          when 'recommendations_passage_fk' then 'the passage does not exist or belongs to a different source'
          when 'recommendations_scenario_fk' then format('scenario_key "%s" is not defined for domain %s', coalesce(r.j->>'scenario_key', '(missing)'), g.domain_key)
          when 'recommendations_hold_needs_timing' then 'action hold needs hold{min,max,unit} or timing_text quoting what the source says'
          when 'recommendations_hold_shape' then 'hold needs min, max and unit together, with max >= min >= 0'
          when 'recommendations_resume_shape' then 'resume needs min, max and unit together, with max >= min >= 0'
          when 'recommendations_renal_pair' then 'renal needs both a measure and bounds'
          when 'recommendations_renal_nonempty' then 'the renal range is empty; check min, max and inclusivity'
          else v_msg end);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'scenario_coverage') = 'array' then p_package->'scenario_coverage' else '[]'::jsonb end) loop
      begin
        insert into scenario_coverage (revision_id, domain_key, scenario_key, status, reason)
        values (v_rev, g.domain_key, r.j->>'scenario_key', r.j->>'status', nullif(btrim(r.j->>'reason'), ''));
      exception when others then
        get stacked diagnostics v_con = constraint_name;
        v_defs := v_defs || format('SCENARIO[%s]: %s', coalesce(r.j->>'scenario_key', '?'), case v_con
          when 'scenario_coverage_reason' then 'NOT_APPLICABLE and NO_SOURCE_GUIDANCE need a reason (10+ characters)'
          when 'scenario_coverage_scenario_fk' then format('not a scenario of domain %s', g.domain_key)
          else sqlerrm end);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'conflicts') = 'array' then p_package->'conflicts' else '[]'::jsonb end) loop
      begin
        insert into conflicts (revision_id, scenario_key, source_ids, description)
        values (v_rev, r.j->>'scenario_key', (select array_agg(v) from jsonb_array_elements_text(r.j->'source_ids') v), r.j->>'description');
      exception when others then
        v_defs := v_defs || format('CONFLICT[%s]: %s', coalesce(r.j->>'scenario_key', '?'), sqlerrm);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'boundary_notes') = 'array' then p_package->'boundary_notes' else '[]'::jsonb end) loop
      begin
        insert into boundary_notes (revision_id, source_id, scenario_key, qualifier, note)
        values (v_rev, r.j->>'source_id', r.j->>'scenario_key', coalesce(btrim(r.j->>'qualifier'), ''), r.j->>'note');
      exception when others then
        v_defs := v_defs || format('BOUNDARY_NOTE[%s]: %s', coalesce(r.j->>'source_id', '?'), sqlerrm);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'components') = 'array' then p_package->'components' else '[]'::jsonb end) loop
      begin
        select * into c from evidence_revisions x where x.group_id = r.j->>'group_id' and x.revision_no = (r.j->>'revision_no')::int;
        if not found then
          raise exception 'no revision % exists for group %', coalesce(r.j->>'revision_no', '(missing)'), coalesce(r.j->>'group_id', '(missing)');
        end if;
        insert into revision_components (revision_id, component_group_id, component_revision_id, component_sha256)
        values (v_rev, c.group_id, c.revision_id, c.content_sha256);
      exception when others then
        v_defs := v_defs || format('COMPONENT[%s]: %s', coalesce(r.j->>'group_id', '?'), sqlerrm);
      end;
    end loop;

    for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_package->'ingredient_coverage') = 'array' then p_package->'ingredient_coverage' else '[]'::jsonb end) loop
      begin
        insert into revision_ingredient_coverage (revision_id, ingredient_id, covered_by)
        values (v_rev, r.j->>'ingredient_id', coalesce(r.j->>'covered_by', 'own_recommendations'));
      exception when others then
        v_defs := v_defs || format('INGREDIENT_COVERAGE[%s]: %s', coalesce(r.j->>'ingredient_id', '?'), sqlerrm);
      end;
    end loop;

    v_defs := v_pre || v_defs || _validate(v_rev, g.group_id, v_form);
    if cardinality(v_defs) > 0 then
      raise exception using errcode = 'PM001', message = 'package rejected';
    end if;

    v_material := _material(v_rev, g.group_id, v_form, v_questions);
    v_hash := _sha256(v_material::text);
    insert into evidence_revisions (revision_id, group_id, revision_no, task_id, worker_id, session_id, submission_id,
           formulation_decision, formulation_rationale, open_questions, has_blocking_question, package, content_sha256, git_commit)
    values (v_rev, g.group_id, v_head + 1, t.task_id, w.worker_id, p_session_id, p_submission_id,
           v_form->>'decision', coalesce(btrim(v_form->>'rationale'), ''), v_questions,
           exists (select 1 from jsonb_array_elements(v_questions) q where coalesce((q->>'blocking')::boolean, false)),
           p_package, v_hash, nullif(p_git_commit, ''));
  exception when sqlstate 'PM001' then
    v_rejected := true;
  end;

  if v_rejected then
    update tasks set last_error_code = 'SUBMISSION_REJECTED', lease_expires_at = clock_timestamp() + v_lease, updated_at = now()
     where task_id = t.task_id;
    perform _event('worker', w.worker_id, 'submission_rejected', g.group_id, t.task_id, null,
                   jsonb_build_object('submission_id', p_submission_id, 'deficiencies', to_jsonb(v_defs)));
    return jsonb_build_object('ok', true, 'accepted', false, 'deficiency_count', cardinality(v_defs), 'deficiencies', to_jsonb(v_defs),
                              'task_id', t.task_id, 'claim_token', t.claim_token,
                              'hint', 'Fix every deficiency and submit again with a new submission_id. Nothing was stored except sources and passages.');
  end if;

  update tasks set status = 'awaiting_ci', claimed_by = null, claim_token = null, lease_expires_at = null,
         revision_id = v_rev, last_error_code = null, updated_at = now() where task_id = t.task_id;
  perform _event('worker', w.worker_id, 'revision_accepted', g.group_id, t.task_id, v_rev,
                 jsonb_build_object('revision_no', v_head + 1, 'content_sha256', v_hash, 'submission_id', p_submission_id, 'git_commit', p_git_commit));
  -- Combination groups whose current revision pins an older revision of this group need rework.
  for r in select distinct e2.group_id from revision_components rc join evidence_revisions e2 on e2.revision_id = rc.revision_id
            where rc.component_group_id = g.group_id and rc.component_revision_id <> v_rev
              and e2.revision_id = (_head(e2.group_id)).revision_id loop
    perform _open_task(r.group_id, 'component_changed', jsonb_build_object('component_group_id', g.group_id, 'new_revision_no', v_head + 1), 50);
  end loop;
  return jsonb_build_object('ok', true, 'accepted', true, 'revision_id', v_rev, 'revision_no', v_head + 1,
                            'content_sha256', v_hash, 'next', 'awaiting_ci');
end $fn$;

create or replace function prepmeds._split(w prepmeds.workers, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                          p_parts jsonb, p_rationale text) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks; g review_groups; v_cur text[]; v_all text[]; r record; v_child text; v_children jsonb := '[]';
begin
  perform _session_check(w, p_session_id);
  t := _claim_holder(w, p_task_id, p_claim_token);
  select * into g from review_groups x where x.group_id = t.group_id;
  if length(btrim(coalesce(p_rationale, ''))) < 40 then
    raise exception 'PREPMEDS_SPLIT_INVALID: give a rationale of at least 40 characters';
  end if;
  if p_parts is null or jsonb_typeof(p_parts) <> 'array' or jsonb_array_length(p_parts) < 2 then
    raise exception 'PREPMEDS_SPLIT_INVALID: at least two parts are required';
  end if;
  v_cur := _current_meds(g.group_id);
  select coalesce(array_agg(v order by v collate "C"), '{}') into v_all
    from jsonb_array_elements(p_parts) p, jsonb_array_elements_text(p->'medication_ids') v;
  if v_all <> v_cur then
    raise exception 'PREPMEDS_SPLIT_INVALID: the parts must contain every mapped canonical ID exactly once. Mapped: %. Given: %', v_cur::text, v_all::text;
  end if;
  for r in select p->>'suffix' as suffix, p->'medication_ids' as ids from jsonb_array_elements(p_parts) p loop
    if r.suffix is null or length(r.suffix) not between 2 and 30 or r.suffix ~ '[^a-z0-9-]' then
      raise exception 'PREPMEDS_SPLIT_INVALID: each part needs a suffix of 2-30 lowercase letters, digits or hyphens';
    end if;
    v_child := g.group_id || '|' || r.suffix;
    insert into review_groups (group_id, kind, domain_key, class_key, bucket, parent_group_id)
    values (v_child, g.kind, g.domain_key, g.class_key, g.bucket, g.group_id);
    insert into group_ingredients (group_id, ingredient_id)
    select v_child, gi.ingredient_id from group_ingredients gi where gi.group_id = g.group_id;
    update medication_group_map set group_id = v_child, mapped_at = now()
     where medication_id in (select jsonb_array_elements_text(r.ids));
    v_children := v_children || to_jsonb(v_child);
  end loop;
  update tasks set status = 'cancelled', claimed_by = null, claim_token = null, lease_expires_at = null, updated_at = now()
   where task_id = t.task_id;
  update review_groups set retired_at = now(), retired_reason = 'split' where group_id = g.group_id;
  perform _event('worker', w.worker_id, 'group_split', g.group_id, t.task_id, null,
                 jsonb_build_object('children', v_children, 'rationale', p_rationale, 'parts', p_parts));
  for r in select value #>> '{}' as gid from jsonb_array_elements(v_children) loop
    perform _open_task(r.gid, 'initial', jsonb_build_object('split_from', g.group_id), t.priority);
  end loop;
  return jsonb_build_object('ok', true, 'retired', g.group_id, 'children', v_children,
                            'note', 'The children stay in the same bucket and lane. Call claim_next to continue.');
end $fn$;

-- A session's result, computed from stored rows. Workers paste this; they do not write their own summary.
create or replace function prepmeds._session_report(w prepmeds.workers, p_session_id bigint) returns jsonb
language plpgsql stable set search_path = prepmeds, pg_catalog as $fn$
declare s sessions; v_target int := _setting_int('session_target'); v_ready int; v_groups jsonb;
begin
  select * into s from sessions x where x.session_id = p_session_id and x.worker_id = w.worker_id;
  if not found then raise exception 'PREPMEDS_NO_SUCH_SESSION'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('group_id', e.group_id, 'revision_no', e.revision_no,
           'is_current_revision', e.revision_id = (_head(e.group_id)).revision_id,
           'ready_for_clinician_review', (group_status(e.group_id)->>'m09_ready_for_clinician_review')::boolean and e.revision_id = (_head(e.group_id)).revision_id,
           'blockers', group_status(e.group_id)->'blockers') order by e.revision_id), '[]'::jsonb)
    into v_groups from evidence_revisions e where e.session_id = p_session_id;
  select count(distinct e.group_id) into v_ready from evidence_revisions e
   where e.session_id = p_session_id and e.revision_id = (_head(e.group_id)).revision_id
     and (group_status(e.group_id)->>'m09_ready_for_clinician_review')::boolean;
  return jsonb_build_object('ok', true, 'session_id', s.session_id, 'worker_id', w.worker_id, 'lane', w.lane,
    'started_at', s.started_at, 'ended_at', s.ended_at,
    'target_ready_groups', v_target,
    'groups_ready_for_clinician_review', v_ready,
    'shortfall', greatest(v_target - v_ready, 0),
    'revisions_accepted', (select count(*) from evidence_revisions e where e.session_id = p_session_id),
    'revisions_awaiting_ci', (select count(*) from evidence_revisions e join tasks t on t.revision_id = e.revision_id
                              where e.session_id = p_session_id and t.status = 'awaiting_ci'),
    'submissions_rejected', (select count(*) from events ev where ev.event_type = 'submission_rejected' and ev.actor_id = w.worker_id and ev.at >= s.started_at
                             and (s.ended_at is null or ev.at <= s.ended_at)),
    'tasks_blocked', (select count(*) from events ev where ev.event_type = 'task_blocked' and ev.actor_id = w.worker_id and ev.at >= s.started_at
                      and (s.ended_at is null or ev.at <= s.ended_at)),
    'still_claimed', (select coalesce(jsonb_agg(jsonb_build_object('task_id', t.task_id, 'group_id', t.group_id, 'has_saved_progress', t.progress is not null)), '[]'::jsonb)
                      from tasks t where t.claimed_by = w.worker_id and t.status = 'claimed'),
    'groups', v_groups,
    'lane_counts', _lane_counts(w.lane));
end $fn$;

-- ── Worker API: token-authenticated wrappers ─────────────────────────────────────────
create or replace function prepmeds.worker_status(p_token text) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare w workers;
begin
  w := _worker(p_token);
  return jsonb_build_object('ok', true, 'worker_id', w.worker_id, 'lane', w.lane,
    'open_session_id', (select s.session_id from sessions s where s.worker_id = w.worker_id and s.ended_at is null),
    'current_claim', (select jsonb_build_object('task_id', t.task_id, 'group_id', t.group_id, 'lease_expires_at', t.lease_expires_at,
                                                'has_saved_progress', t.progress is not null)
                      from tasks t where t.claimed_by = w.worker_id and t.status = 'claimed'),
    'lane_counts', _lane_counts(w.lane));
end $fn$;

create or replace function prepmeds.start_session(p_token text, p_label text default null) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _start_session(_worker(p_token), p_label); perform _exit(); return r; end $fn$;

create or replace function prepmeds.claim_next(p_token text, p_session_id bigint) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _claim(_worker(p_token), p_session_id); perform _exit(); return r; end $fn$;

create or replace function prepmeds.heartbeat(p_token text, p_session_id bigint, p_task_id bigint, p_claim_token uuid) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _heartbeat(_worker(p_token), p_session_id, p_task_id, p_claim_token); perform _exit(); return r; end $fn$;

create or replace function prepmeds.save_progress(p_token text, p_session_id bigint, p_task_id bigint, p_claim_token uuid, p_progress jsonb) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _save_progress(_worker(p_token), p_session_id, p_task_id, p_claim_token, p_progress); perform _exit(); return r; end $fn$;

create or replace function prepmeds.submit_package(p_token text, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                                  p_submission_id text, p_package jsonb, p_git_commit text default null) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin
  perform _enter();
  r := _submit(_worker(p_token), p_session_id, p_task_id, p_claim_token, p_submission_id, p_package, p_git_commit);
  perform _exit(); return r;
end $fn$;

create or replace function prepmeds.release_task(p_token text, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                                p_code text, p_note text default null) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _release(_worker(p_token), p_session_id, p_task_id, p_claim_token, p_code, p_note); perform _exit(); return r; end $fn$;

create or replace function prepmeds.propose_split(p_token text, p_session_id bigint, p_task_id bigint, p_claim_token uuid,
                                                 p_parts jsonb, p_rationale text) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare r jsonb;
begin perform _enter(); r := _split(_worker(p_token), p_session_id, p_task_id, p_claim_token, p_parts, p_rationale); perform _exit(); return r; end $fn$;

create or replace function prepmeds.session_report(p_token text, p_session_id bigint) returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
begin return _session_report(_worker(p_token), p_session_id); end $fn$;

-- ── CI runner API ────────────────────────────────────────────────────────────────────
-- The relay lets a worker that can only write to GitHub use the same protocol. The CI job passes
-- the GitHub login that made the commit and the lane taken from the branch name; neither comes
-- from the request body.
create or replace function prepmeds.ci_relay(p_ci_token text, p_github_login text, p_lane text, p_request jsonb) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare w workers; r jsonb; v_op text := p_request->>'op';
  v_session bigint := nullif(p_request->>'session_id', '')::bigint;
  v_task bigint := nullif(p_request->>'task_id', '')::bigint;
  v_claim uuid := nullif(p_request->>'claim_token', '')::uuid;
begin
  perform _enter();
  perform _ci(p_ci_token);
  select * into w from workers x where x.github_login = p_github_login and x.active;
  if not found then
    raise exception 'PREPMEDS_UNKNOWN_WORKER: GitHub login % is not a registered worker', coalesce(p_github_login, '(none)') using errcode = '28000';
  end if;
  if w.lane is distinct from p_lane then
    raise exception 'PREPMEDS_LANE_VIOLATION: % owns lane % and may not write to lane %', w.worker_id, w.lane, coalesce(p_lane, '(none)') using errcode = '42501';
  end if;
  case v_op
    when 'start_session' then r := _start_session(w, p_request->>'label');
    when 'claim'         then r := _claim(w, v_session);
    when 'heartbeat'     then r := _heartbeat(w, v_session, v_task, v_claim);
    when 'save_progress' then r := _save_progress(w, v_session, v_task, v_claim, p_request->'progress');
    when 'submit'        then r := _submit(w, v_session, v_task, v_claim, p_request->>'submission_id', p_request->'package', p_request->>'git_commit');
    when 'release'       then r := _release(w, v_session, v_task, v_claim, p_request->>'code', p_request->>'note');
    when 'split'         then r := _split(w, v_session, v_task, v_claim, p_request->'parts', p_request->>'rationale');
    when 'report'        then r := _session_report(w, v_session);
    else raise exception 'PREPMEDS_BAD_REQUEST: op must be start_session, claim, heartbeat, save_progress, submit, release, split or report';
  end case;
  perform _exit();
  return r || jsonb_build_object('worker_id', w.worker_id, 'op', v_op);
end $fn$;

create or replace function prepmeds.ci_pending_tests(p_ci_token text, p_limit int default 20) returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
begin
  perform _ci(p_ci_token);
  return (select coalesce(jsonb_agg(q.j order by q.created_at), '[]'::jsonb) from (
    select e.created_at, jsonb_build_object('revision_id', e.revision_id, 'group_id', e.group_id, 'revision_no', e.revision_no,
             'content_sha256', e.content_sha256, 'min_suite_version', _setting_int('min_suite_version'),
             'needs', (select jsonb_agg(s.suite) from unnest(array['evidence','mapping']) s(suite) where not _suite_decided(e.revision_id, s.suite)),
             'current_medication_ids', to_jsonb(_current_meds(e.group_id)),
             'revision', _export_revision(e.revision_id)) as j
    from review_groups g cross join lateral _head(g.group_id) e
    where g.retired_at is null and e.revision_id is not null
      and (not _suite_decided(e.revision_id, 'evidence') or not _suite_decided(e.revision_id, 'mapping'))
    order by e.created_at limit p_limit) q);
end $fn$;

create or replace function prepmeds.ci_record_passage_check(p_ci_token text, p_passage_id bigint, p_result text, p_detail text, p_ci_run_id bigint) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare v_ci text;
begin
  perform _enter(); v_ci := _ci(p_ci_token);
  insert into passage_checks (passage_id, result, detail, ci_run_id) values (p_passage_id, p_result, p_detail, p_ci_run_id);
  if p_result = 'not_found' then
    perform _event('ci', v_ci, 'passage_not_found_in_source', null, null, null, jsonb_build_object('passage_id', p_passage_id, 'ci_run_id', p_ci_run_id));
  end if;
  perform _exit();
  return jsonb_build_object('ok', true);
end $fn$;

create or replace function prepmeds.ci_record_test_run(p_ci_token text, p_revision_id bigint, p_content_sha256 text, p_suite text,
    p_suite_version int, p_passed boolean, p_total int, p_failed int, p_commit_sha text, p_ci_run_id bigint,
    p_ci_run_attempt int default 1, p_report jsonb default null) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare v_ci text; e evidence_revisions; t tasks; v_new bigint; v_is_head boolean; v_outcome text := 'recorded';
begin
  perform _enter(); v_ci := _ci(p_ci_token);
  select * into e from evidence_revisions x where x.revision_id = p_revision_id;
  if not found then raise exception 'PREPMEDS_NO_SUCH_REVISION: %', p_revision_id; end if;
  if e.content_sha256 is distinct from p_content_sha256 then
    raise exception 'PREPMEDS_HASH_MISMATCH: the tests ran against content % but revision % is %', coalesce(p_content_sha256, '(none)'), p_revision_id, e.content_sha256;
  end if;
  insert into test_runs (revision_id, content_sha256, suite, suite_version, passed, total, failed, commit_sha, ci_run_id, ci_run_attempt, report)
  values (p_revision_id, p_content_sha256, p_suite, p_suite_version, p_passed, p_total, p_failed, p_commit_sha, p_ci_run_id, coalesce(p_ci_run_attempt, 1), p_report)
  on conflict (revision_id, suite, ci_run_id, ci_run_attempt) do nothing
  returning test_run_id into v_new;
  if v_new is null then perform _exit(); return jsonb_build_object('ok', true, 'outcome', 'replayed'); end if;
  perform _event('ci', v_ci, case when p_passed then 'tests_passed' else 'tests_failed' end, e.group_id, e.task_id, e.revision_id,
                 jsonb_build_object('suite', p_suite, 'suite_version', p_suite_version, 'total', p_total, 'failed', p_failed,
                                    'commit_sha', p_commit_sha, 'ci_run_id', p_ci_run_id, 'ci_run_attempt', coalesce(p_ci_run_attempt, 1)));
  v_is_head := e.revision_id = (_head(e.group_id)).revision_id;
  if v_is_head then
    select * into t from tasks x where x.group_id = e.group_id and x.status in ('awaiting_ci','available') and x.revision_id is not distinct from e.revision_id for update;
    if not p_passed then
      if found and t.status = 'awaiting_ci' then
        update tasks set status = 'available', reason = 'ci_failed', priority = 10, updated_at = now(),
               detail = jsonb_build_object('suite', p_suite, 'revision_no', e.revision_no, 'report', p_report) where task_id = t.task_id;
        perform _event('system', null, 'task_reopened', e.group_id, t.task_id, e.revision_id, jsonb_build_object('reason', 'ci_failed', 'suite', p_suite));
        v_outcome := 'task_reopened';
      elsif not found then
        v_new := _open_task(e.group_id, 'ci_failed', jsonb_build_object('suite', p_suite, 'revision_no', e.revision_no, 'report', p_report), 10);
        if v_new is not null then
          update tasks set revision_id = e.revision_id where task_id = v_new;
          v_outcome := 'task_opened';
        end if;
      end if;
    elsif _suite_passed(e.revision_id, 'evidence') and _suite_passed(e.revision_id, 'mapping') then
      -- Close the task that was waiting on CI, or a failed-CI rework nobody has picked up yet. Never close other rework.
      if found and (t.status = 'awaiting_ci' or (t.status = 'available' and t.reason = 'ci_failed')) then
        update tasks set status = 'done', updated_at = now() where task_id = t.task_id;
        perform _event('system', null, 'task_done', e.group_id, t.task_id, e.revision_id, '{}'::jsonb);
        v_outcome := 'task_done';
      end if;
      if not _components_current(e.revision_id) then
        perform _open_task(e.group_id, 'component_changed', jsonb_build_object('revision_no', e.revision_no), 50);
      end if;
    end if;
  end if;
  perform _exit();
  return jsonb_build_object('ok', true, 'outcome', v_outcome, 'group_status', group_status(e.group_id));
end $fn$;

-- Loads the canonical inventory exported from the repository. Idempotent per (commit, payload).
create or replace function prepmeds.ci_sync_inventory(p_ci_token text, p_commit_sha text, p_inventory jsonb) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare
  v_ci text; v_hash text; m record; v_old text[]; v_key text; v_g review_groups; v_gid text; v_ids text[];
  v_added int := 0; v_changed int := 0; v_removed int := 0; v_groups int := 0; v_unplaced int := 0; v_reworks int := 0;
  v_touched text[] := '{}'; v_result jsonb;
begin
  perform _enter(); v_ci := _ci(p_ci_token);
  if p_commit_sha is null or length(p_commit_sha) <> 40 or p_commit_sha ~ '[^0-9a-f]' then
    raise exception 'PREPMEDS_INVENTORY_INVALID: commit sha must be 40 lowercase hex characters';
  end if;
  if p_inventory is null or jsonb_typeof(p_inventory->'medications') is distinct from 'array' or jsonb_array_length(p_inventory->'medications') = 0 then
    raise exception 'PREPMEDS_INVENTORY_INVALID: medications[] is required and may not be empty';
  end if;
  v_hash := _sha256(p_inventory::text);
  select s.result into v_result from inventory_syncs s where s.commit_sha = p_commit_sha and s.payload_sha256 = v_hash;
  if found then perform _exit(); return v_result || jsonb_build_object('replayed', true); end if;

  select array_agg(x->>'medicationId') into v_ids from jsonb_array_elements(p_inventory->'medications') x;
  if (select count(distinct u) from unnest(v_ids) u) <> cardinality(v_ids) or exists (select 1 from unnest(v_ids) u where u is null) then
    raise exception 'PREPMEDS_INVENTORY_INVALID: every medication needs a unique medicationId';
  end if;

  insert into ingredients (ingredient_id)
  select distinct i from jsonb_array_elements(p_inventory->'medications') x, jsonb_array_elements_text(x->'ingredientIds') i
  on conflict do nothing;
  if jsonb_typeof(p_inventory->'ingredients') = 'array' then
    update ingredients set name = y.name
      from (select x->>'ingredientId' as id, x->>'name' as name from jsonb_array_elements(p_inventory->'ingredients') x) y
     where ingredients.ingredient_id = y.id and y.name is not null and ingredients.name is distinct from y.name;
  end if;

  for m in
    select x->>'medicationId' as id, x->>'canonicalName' as name, x->>'genericName' as generic, x->>'route' as route,
           x->>'dosageForm' as form, x->>'releaseType' as release, x->>'ingredientSetKey' as declared_key,
           coalesce((select array_agg(v) from jsonb_array_elements_text(case when jsonb_typeof(x->'strengths') = 'array' then x->'strengths' else '[]'::jsonb end) v), '{}') as strengths,
           coalesce((select array_agg(v) from jsonb_array_elements_text(case when jsonb_typeof(x->'brandNames') = 'array' then x->'brandNames' else '[]'::jsonb end) v), '{}') as brands,
           coalesce((select array_agg(v) from jsonb_array_elements_text(case when jsonb_typeof(x->'aliases') = 'array' then x->'aliases' else '[]'::jsonb end) v), '{}') as aliases,
           (select array_agg(q.v order by q.v collate "C") from (select distinct v from jsonb_array_elements_text(x->'ingredientIds') v) q) as ings
    from jsonb_array_elements(p_inventory->'medications') x
  loop
    if m.ings is null then raise exception 'PREPMEDS_INVENTORY_INVALID: % has no ingredientIds', m.id; end if;
    v_key := array_to_string(m.ings, '+');
    if m.declared_key is not null and m.declared_key <> v_key then
      raise exception 'PREPMEDS_INVENTORY_INVALID: % declares ingredient set % but its ingredients give %', m.id, m.declared_key, v_key;
    end if;
    select array_agg(mi.ingredient_id order by mi.ingredient_id collate "C") into v_old from medication_ingredients mi where mi.medication_id = m.id;
    if v_old is null then
      insert into medications (medication_id, canonical_name, generic_name, route, dosage_form, release_type, strengths, brand_names, first_seen_commit, last_seen_commit)
      values (m.id, coalesce(m.name, m.id), m.generic, m.route, m.form, m.release, m.strengths, m.brands, p_commit_sha, p_commit_sha);
      insert into medication_ingredients (medication_id, ingredient_id) select m.id, unnest(m.ings);
      v_added := v_added + 1;
    else
      update medications set canonical_name = coalesce(m.name, canonical_name), generic_name = m.generic, route = m.route, dosage_form = m.form,
             release_type = m.release, strengths = m.strengths, brand_names = m.brands, active = true, last_seen_commit = p_commit_sha, updated_at = now()
       where medication_id = m.id;
      if v_old <> m.ings then
        select mg.group_id into v_gid from medication_group_map mg where mg.medication_id = m.id;
        if v_gid is not null then v_touched := v_touched || v_gid; end if;
        delete from medication_group_map where medication_id = m.id;
        delete from medication_ingredients where medication_id = m.id;
        insert into medication_ingredients (medication_id, ingredient_id) select m.id, unnest(m.ings);
        v_changed := v_changed + 1;
        perform _event('ci', v_ci, 'medication_ingredients_changed', v_gid, null, null,
                       jsonb_build_object('medication_id', m.id, 'from', to_jsonb(v_old), 'to', to_jsonb(m.ings)));
      end if;
    end if;
    insert into medication_aliases (medication_id, alias, kind)
      select m.id, btrim(b), 'brand' from unnest(m.brands) b where length(btrim(b)) > 0 on conflict do nothing;
    insert into medication_aliases (medication_id, alias, kind)
      select m.id, btrim(a), 'synonym' from unnest(m.aliases) a where length(btrim(a)) > 0 on conflict do nothing;

    if not exists (select 1 from medication_group_map mg where mg.medication_id = m.id) then
      select * into v_g from review_groups rg where rg.group_id = v_key;
      if not found then
        insert into review_groups (group_id, kind) values (v_key, case when cardinality(m.ings) > 1 then 'combination' else 'single' end);
        insert into group_ingredients (group_id, ingredient_id) select v_key, unnest(m.ings);
        v_groups := v_groups + 1;
        perform _event('ci', v_ci, 'group_created', v_key, null, null, jsonb_build_object('ingredients', to_jsonb(m.ings)));
      elsif v_g.retired_at is not null then
        v_unplaced := v_unplaced + 1;   -- the base group was split or retired: placing this ID is a decision, not a default
        continue;
      end if;
      insert into medication_group_map (medication_id, group_id) values (m.id, v_key);
      v_touched := v_touched || v_key;
    end if;
  end loop;

  for m in select d.medication_id as id, mg.group_id as gid from medications d
            left join medication_group_map mg on mg.medication_id = d.medication_id
            where d.active and not (d.medication_id = any (v_ids)) loop
    update medications set active = false, updated_at = now() where medication_id = m.id;
    v_removed := v_removed + 1;
    if m.gid is not null then v_touched := v_touched || m.gid; end if;
    perform _event('ci', v_ci, 'medication_deactivated', m.gid, null, null, jsonb_build_object('medication_id', m.id));
  end loop;

  for v_gid in select distinct u from unnest(v_touched) u loop
    if (_head(v_gid)).revision_id is not null and _revision_meds((_head(v_gid)).revision_id) <> _current_meds(v_gid) then
      if _open_task(v_gid, 'mapping_changed', jsonb_build_object('commit_sha', p_commit_sha), 20) is not null then v_reworks := v_reworks + 1; end if;
    end if;
  end loop;

  v_result := jsonb_build_object('ok', true, 'commit_sha', p_commit_sha, 'medications_in_payload', cardinality(v_ids),
    'added', v_added, 'ingredients_changed', v_changed, 'deactivated', v_removed, 'groups_created', v_groups,
    'needs_placement', v_unplaced, 'rework_tasks_opened', v_reworks,
    'active_medications', (select count(*) from medications where active),
    'active_groups', (select count(*) from review_groups where retired_at is null),
    'gaps', (select count(*) from inventory_gaps));
  insert into inventory_syncs (commit_sha, payload_sha256, result) values (p_commit_sha, v_hash, v_result);
  perform _event('ci', v_ci, 'inventory_synced', null, null, null, v_result);
  perform _exit();
  return v_result;
end $fn$;

-- ── Clinician API (identity from the signed-in session; PIN for every decision) ──────
create or replace function prepmeds.clin_review_queue() returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians;
begin
  c := _clinician(null, 'read');
  return (select coalesce(jsonb_agg(jsonb_build_object('group_id', p.group_id, 'kind', p.kind, 'bucket', p.bucket, 'lane', p.lane,
            'domain_key', p.domain_key, 'class_key', p.class_key, 'revision_no', p.head_revision_no, 'content_sha256', p.head_sha256,
            'clinician_reviewed', p.m10_clinician_reviewed, 'patient_facing_authorized', p.m11_patient_facing_authorized,
            'passages_cited', (select count(distinct r.passage_id) from recommendations r where r.revision_id = (_head(p.group_id)).revision_id),
            'passages_you_verified', (select count(distinct r.passage_id) from recommendations r
                                      join passage_verifications v on v.passage_id = r.passage_id and v.clinician_id = c.user_id
                                      where r.revision_id = (_head(p.group_id)).revision_id))
            order by p.m10_clinician_reviewed, p.domain_key, p.class_key nulls last, p.group_id collate "C"), '[]'::jsonb)
          from group_progress p where p.m09_ready_for_clinician_review);
end $fn$;

create or replace function prepmeds.clin_get_package(p_group_id text) returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; h evidence_revisions;
begin
  c := _clinician(null, 'read');
  h := _head(p_group_id);
  if h.revision_id is null then raise exception 'PREPMEDS_NOTHING_TO_REVIEW: % has no accepted evidence revision', p_group_id; end if;
  return jsonb_build_object('status', group_status(p_group_id), 'revision', _export_revision(h.revision_id),
    'passages_you_verified', (select coalesce(jsonb_agg(v.passage_id order by v.passage_id), '[]'::jsonb) from passage_verifications v
                              where v.clinician_id = c.user_id
                                and v.passage_id in (select r.passage_id from recommendations r where r.revision_id = h.revision_id)),
    'reviews', (select coalesce(jsonb_agg(jsonb_build_object('review_id', r.review_id, 'decision', r.decision, 'content_sha256', r.content_sha256,
                  'is_for_current_revision', r.content_sha256 = h.content_sha256, 'reviewed_at', r.reviewed_at,
                  'clinician', (select x.display_name from clinicians x where x.user_id = r.clinician_id),
                  'exceptions', r.exceptions, 'notes', r.notes, 'revoked', _revoked('review', r.review_id)) order by r.review_id), '[]'::jsonb)
                from clinician_reviews r where r.group_id = p_group_id));
end $fn$;

create or replace function prepmeds.clin_verify_passages(p_pin text, p_passage_ids bigint[]) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; n int;
begin
  perform _enter(); c := _clinician(p_pin, 'review');
  insert into passage_verifications (clinician_id, passage_id)
  select c.user_id, u from unnest(coalesce(p_passage_ids, '{}'::bigint[])) u on conflict do nothing;
  get diagnostics n = row_count;
  perform _exit();
  return jsonb_build_object('ok', true, 'newly_verified', n);
end $fn$;

create or replace function prepmeds.clin_mark_reviewed(p_pin text, p_group_id text, p_content_sha256 text, p_attested boolean,
    p_verified_passage_ids bigint[] default null, p_exceptions text default null, p_notes text default null) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; h evidence_revisions; st jsonb; v_missing bigint[]; v_review bigint;
begin
  perform _enter(); c := _clinician(p_pin, 'review');
  h := _head(p_group_id);
  if h.revision_id is null then raise exception 'PREPMEDS_NOTHING_TO_REVIEW: % has no accepted evidence revision', p_group_id; end if;
  if h.content_sha256 is distinct from p_content_sha256 then
    raise exception 'PREPMEDS_STALE_REVIEW_TARGET: the evidence for % changed after it was displayed. Reload it and review the current revision', p_group_id;
  end if;
  st := group_status(p_group_id);
  if not (st->>'m09_ready_for_clinician_review')::boolean then
    raise exception 'PREPMEDS_NOT_READY_FOR_REVIEW: % is not ready: %', p_group_id, st->'blockers';
  end if;
  if p_attested is not true then
    raise exception 'PREPMEDS_ATTESTATION_REQUIRED: Mark Reviewed records that you checked the linked primary passages yourself';
  end if;
  insert into passage_verifications (clinician_id, passage_id)
  select c.user_id, u from unnest(coalesce(p_verified_passage_ids, '{}'::bigint[])) u on conflict do nothing;
  select array_agg(distinct r.passage_id order by r.passage_id) into v_missing from recommendations r
   where r.revision_id = h.revision_id
     and not exists (select 1 from passage_verifications v where v.clinician_id = c.user_id and v.passage_id = r.passage_id);
  if v_missing is not null then
    raise exception 'PREPMEDS_PASSAGES_NOT_VERIFIED: these cited passages have not been checked by you: %', v_missing::text;
  end if;
  insert into clinician_reviews (group_id, revision_id, content_sha256, clinician_id, decision, attested, exceptions, notes)
  values (p_group_id, h.revision_id, h.content_sha256, c.user_id, 'reviewed', true, nullif(btrim(p_exceptions), ''), nullif(btrim(p_notes), ''))
  returning review_id into v_review;
  perform _event('clinician', c.user_id::text, 'clinician_reviewed', p_group_id, null, h.revision_id,
                 jsonb_build_object('review_id', v_review, 'content_sha256', h.content_sha256, 'revision_no', h.revision_no,
                                    'has_exceptions', nullif(btrim(p_exceptions), '') is not null));
  perform _exit();
  return jsonb_build_object('ok', true, 'review_id', v_review, 'group_id', p_group_id, 'revision_no', h.revision_no,
                            'content_sha256', h.content_sha256, 'patient_facing_authorized', false);
end $fn$;

create or replace function prepmeds.clin_request_changes(p_pin text, p_group_id text, p_content_sha256 text, p_reasons text) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; h evidence_revisions; v_review bigint; r record; v_task bigint;
begin
  perform _enter(); c := _clinician(p_pin, 'review');
  h := _head(p_group_id);
  if h.revision_id is null then raise exception 'PREPMEDS_NOTHING_TO_REVIEW: % has no accepted evidence revision', p_group_id; end if;
  if h.content_sha256 is distinct from p_content_sha256 then
    raise exception 'PREPMEDS_STALE_REVIEW_TARGET: the evidence for % changed after it was displayed', p_group_id;
  end if;
  if length(btrim(coalesce(p_reasons, ''))) < 10 then raise exception 'PREPMEDS_REASON_REQUIRED: say what must change'; end if;
  insert into clinician_reviews (group_id, revision_id, content_sha256, clinician_id, decision, attested, notes)
  values (p_group_id, h.revision_id, h.content_sha256, c.user_id, 'changes_requested', false, btrim(p_reasons))
  returning review_id into v_review;
  -- Asking for changes withdraws any standing approval of this exact content.
  for r in select x.review_id from clinician_reviews x where x.group_id = p_group_id and x.content_sha256 = h.content_sha256
            and x.decision = 'reviewed' and not _revoked('review', x.review_id) loop
    insert into revocations (target, target_id, clinician_id, reason) values ('review', r.review_id, c.user_id, 'changes requested: ' || btrim(p_reasons));
  end loop;
  for r in select a.authorization_id from release_authorizations a where a.group_id = p_group_id and a.content_sha256 = h.content_sha256
            and not _revoked('release', a.authorization_id) loop
    insert into revocations (target, target_id, clinician_id, reason) values ('release', r.authorization_id, c.user_id, 'changes requested: ' || btrim(p_reasons));
  end loop;
  v_task := _open_task(p_group_id, 'changes_requested', jsonb_build_object('reasons', btrim(p_reasons), 'revision_no', h.revision_no), 5);
  if v_task is null then
    -- A task is already open for this group: it becomes the clinician's rework, so the worker sees the reasons.
    update tasks set reason = 'changes_requested', priority = 5, updated_at = now(),
           detail = jsonb_build_object('reasons', btrim(p_reasons), 'revision_no', h.revision_no),
           status = case when status in ('awaiting_ci', 'blocked') then 'available' else status end,
           blocked_reason = null
     where group_id = p_group_id and status in ('available', 'claimed', 'awaiting_ci', 'blocked')
     returning task_id into v_task;
  end if;
  perform _event('clinician', c.user_id::text, 'changes_requested', p_group_id, v_task, h.revision_id,
                 jsonb_build_object('review_id', v_review, 'reasons', btrim(p_reasons)));
  perform _exit();
  return jsonb_build_object('ok', true, 'review_id', v_review, 'task_id', v_task);
end $fn$;

create or replace function prepmeds.clin_authorize_release(p_pin text, p_group_id text, p_content_sha256 text, p_attested boolean) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; h evidence_revisions; st jsonb; v_review bigint; v_auth bigint;
begin
  perform _enter(); c := _clinician(p_pin, 'release');
  h := _head(p_group_id);
  if h.revision_id is null then raise exception 'PREPMEDS_NOTHING_TO_RELEASE: % has no accepted evidence revision', p_group_id; end if;
  if h.content_sha256 is distinct from p_content_sha256 then
    raise exception 'PREPMEDS_STALE_RELEASE_TARGET: the evidence for % changed after it was displayed', p_group_id;
  end if;
  st := group_status(p_group_id);
  if not (st->>'m09_ready_for_clinician_review')::boolean then
    raise exception 'PREPMEDS_NOT_READY_FOR_RELEASE: % is not ready: %', p_group_id, st->'blockers';
  end if;
  select r.review_id into v_review from clinician_reviews r
   where r.group_id = p_group_id and r.content_sha256 = h.content_sha256 and r.decision = 'reviewed' and not _revoked('review', r.review_id)
   order by r.review_id desc limit 1;
  if not found then
    raise exception 'PREPMEDS_NOT_CLINICIAN_REVIEWED: release needs a standing Mark Reviewed for exactly this revision of %', p_group_id;
  end if;
  if p_attested is not true then
    raise exception 'PREPMEDS_ATTESTATION_REQUIRED: authorizing patient-facing use is an explicit clinical decision';
  end if;
  select a.authorization_id into v_auth from release_authorizations a
   where a.group_id = p_group_id and a.content_sha256 = h.content_sha256 and not _revoked('release', a.authorization_id) limit 1;
  if found then perform _exit(); return jsonb_build_object('ok', true, 'authorization_id', v_auth, 'replayed', true); end if;
  insert into release_authorizations (group_id, revision_id, content_sha256, review_id, clinician_id)
  values (p_group_id, h.revision_id, h.content_sha256, v_review, c.user_id) returning authorization_id into v_auth;
  perform _event('clinician', c.user_id::text, 'release_authorized', p_group_id, null, h.revision_id,
                 jsonb_build_object('authorization_id', v_auth, 'review_id', v_review, 'content_sha256', h.content_sha256));
  perform _exit();
  return jsonb_build_object('ok', true, 'authorization_id', v_auth, 'group_id', p_group_id, 'content_sha256', h.content_sha256);
end $fn$;

create or replace function prepmeds.clin_revoke(p_pin text, p_target text, p_target_id bigint, p_reason text) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians; v_group text; r record;
begin
  perform _enter(); c := _clinician(p_pin, case when p_target = 'release' then 'release' else 'review' end);
  if p_target = 'review' then
    select x.group_id into v_group from clinician_reviews x where x.review_id = p_target_id;
  elsif p_target = 'release' then
    select x.group_id into v_group from release_authorizations x where x.authorization_id = p_target_id;
  else
    raise exception 'PREPMEDS_BAD_REQUEST: target must be review or release';
  end if;
  if v_group is null then raise exception 'PREPMEDS_NO_SUCH_TARGET: % %', p_target, p_target_id; end if;
  insert into revocations (target, target_id, clinician_id, reason) values (p_target, p_target_id, c.user_id, btrim(p_reason))
  on conflict (target, target_id) do nothing;
  if p_target = 'review' then
    for r in select a.authorization_id from release_authorizations a where a.review_id = p_target_id and not _revoked('release', a.authorization_id) loop
      insert into revocations (target, target_id, clinician_id, reason) values ('release', r.authorization_id, c.user_id, 'underlying review revoked: ' || btrim(p_reason));
    end loop;
  end if;
  perform _event('clinician', c.user_id::text, p_target || '_revoked', v_group, null, null, jsonb_build_object('target_id', p_target_id, 'reason', btrim(p_reason)));
  perform _exit();
  return jsonb_build_object('ok', true, 'group_status', group_status(v_group));
end $fn$;

create or replace function prepmeds.clin_record_exception(p_pin text, p_medication_id text, p_reason text) returns jsonb
language plpgsql security definer set search_path = prepmeds, pg_catalog as $fn$
declare c clinicians;
begin
  perform _enter(); c := _clinician(p_pin, 'review');
  insert into inventory_exceptions (medication_id, reason, clinician_id) values (p_medication_id, btrim(p_reason), c.user_id);
  perform _event('clinician', c.user_id::text, 'inventory_exception_recorded', null, null, null,
                 jsonb_build_object('medication_id', p_medication_id, 'reason', btrim(p_reason)));
  perform _exit();
  return jsonb_build_object('ok', true);
end $fn$;

-- ── Application read API ─────────────────────────────────────────────────────────────
-- The only source of patient-facing medication guidance. No authorization row, no guidance.
create or replace function prepmeds.get_active_guidance(p_medication_id text) returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
declare v_group text; st jsonb; h evidence_revisions; a release_authorizations;
begin
  select m.group_id into v_group from medication_group_map m join medications d on d.medication_id = m.medication_id
   join review_groups g on g.group_id = m.group_id
   where m.medication_id = p_medication_id and d.active and g.retired_at is null;
  if v_group is null then
    return jsonb_build_object('medication_id', p_medication_id, 'authorized', false, 'reason', 'UNKNOWN_OR_UNMAPPED_MEDICATION');
  end if;
  st := group_status(v_group); h := _head(v_group);
  if not coalesce((st->>'patient_facing_active')::boolean, false) then
    return jsonb_build_object('medication_id', p_medication_id, 'group_id', v_group, 'authorized', false, 'reason', 'NO_AUTHORIZED_GUIDANCE');
  end if;
  if not exists (select 1 from revision_medications rm where rm.revision_id = h.revision_id and rm.medication_id = p_medication_id) then
    return jsonb_build_object('medication_id', p_medication_id, 'group_id', v_group, 'authorized', false, 'reason', 'MEDICATION_NOT_COVERED_BY_AUTHORIZED_REVISION');
  end if;
  select * into a from release_authorizations x where x.group_id = v_group and x.content_sha256 = h.content_sha256
   and not _revoked('release', x.authorization_id) order by x.authorization_id desc limit 1;
  return jsonb_build_object('medication_id', p_medication_id, 'group_id', v_group, 'authorized', true,
    'revision_no', h.revision_no, 'content_sha256', h.content_sha256, 'authorized_at', a.authorized_at,
    'authorized_by', (select c.display_name from clinicians c where c.user_id = a.clinician_id),
    'revision', _export_revision(h.revision_id));
end $fn$;

create or replace function prepmeds.verify_integrity() returns jsonb
language plpgsql stable security definer set search_path = prepmeds, pg_catalog as $fn$
declare p text[] := '{}'; r record; v_prev text := null; v_n bigint := 0; v_chain_ok boolean := true;
begin
  for r in select * from events order by seq loop
    v_n := v_n + 1;
    if r.seq <> v_n or r.prev_hash is distinct from v_prev
       or r.hash <> _event_hash(r.prev_hash, r.actor_kind, r.actor_id, r.event_type, r.group_id, r.task_id, r.revision_id, r.payload, r.at) then
      p := p || format('EVENT_CHAIN_BROKEN at event %s', r.event_id); v_chain_ok := false; exit;
    end if;
    v_prev := r.hash;
  end loop;
  for r in select e.revision_id, e.group_id from evidence_revisions e
            where e.content_sha256 <> _sha256(_material(e.revision_id, e.group_id,
                     jsonb_build_object('decision', e.formulation_decision, 'rationale', e.formulation_rationale), e.open_questions)::text) loop
    p := p || format('REVISION_CONTENT_DOES_NOT_MATCH_HASH revision %s (%s)', r.revision_id, r.group_id);
  end loop;
  for r in select e.revision_id from evidence_revisions e where not exists
            (select 1 from events ev where ev.event_type = 'revision_accepted' and ev.revision_id = e.revision_id
               and ev.payload->>'content_sha256' = e.content_sha256) loop
    p := p || format('REVISION_WITHOUT_ACCEPTANCE_EVENT revision %s', r.revision_id);
  end loop;
  for r in select t.test_run_id from test_runs t where not exists
            (select 1 from events ev where ev.event_type in ('tests_passed','tests_failed') and ev.revision_id = t.revision_id
               and (ev.payload->>'ci_run_id')::bigint = t.ci_run_id and ev.payload->>'suite' = t.suite) loop
    p := p || format('TEST_RUN_WITHOUT_EVENT test run %s', r.test_run_id);
  end loop;
  for r in select c.review_id from clinician_reviews c where not exists
            (select 1 from events ev where ev.event_type in ('clinician_reviewed','changes_requested') and (ev.payload->>'review_id')::bigint = c.review_id) loop
    p := p || format('REVIEW_WITHOUT_EVENT review %s', r.review_id);
  end loop;
  for r in select a.authorization_id from release_authorizations a where not exists
            (select 1 from events ev where ev.event_type = 'release_authorized' and (ev.payload->>'authorization_id')::bigint = a.authorization_id) loop
    p := p || format('AUTHORIZATION_WITHOUT_EVENT authorization %s', r.authorization_id);
  end loop;
  for r in select a.authorization_id from release_authorizations a join clinician_reviews c on c.review_id = a.review_id
            where c.content_sha256 <> a.content_sha256 or c.decision <> 'reviewed' loop
    p := p || format('AUTHORIZATION_NOT_BACKED_BY_REVIEW authorization %s', r.authorization_id);
  end loop;
  for r in select c.relname, t.tgname from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'prepmeds' and not t.tgisinternal and t.tgenabled <> 'O' loop
    p := p || format('TRIGGER_DISABLED %s.%s', r.relname, r.tgname);
  end loop;
  for r in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'prepmeds' and c.relkind = 'r'
              and (select count(*) from pg_trigger t where t.tgrelid = c.oid and not t.tgisinternal and t.tgname like 'a_guard%') < 2 loop
    p := p || format('GUARD_TRIGGER_MISSING %s', r.relname);
  end loop;
  return jsonb_build_object('ok', cardinality(p) = 0, 'events_checked', v_n, 'event_chain_ok', v_chain_ok,
                            'revisions_checked', (select count(*) from evidence_revisions), 'problems', to_jsonb(p));
end $fn$;

-- A fingerprint of every table column, constraint, index, trigger and function body in the schema.
-- CI builds a database from the migrations at a commit and compares its fingerprint with the hosted
-- project's: any difference is schema drift. (Compare within one PostgreSQL major version.)
create or replace function prepmeds.schema_fingerprint() returns text
language sql stable security definer set search_path = prepmeds, pg_catalog as $fn$
  select _sha256(string_agg(q.x, chr(10) order by q.x collate "C")) from (
    select 'function:' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || '):' || md5(p.prosrc) || ':' || p.prosecdef::text as x
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'prepmeds'
    union all
    select 'column:' || c.relname || '.' || a.attname || ':' || format_type(a.atttypid, a.atttypmod) || ':' || a.attnotnull::text
      from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'prepmeds' and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
    union all
    select 'constraint:' || c.relname || ':' || con.conname || ':' || con.contype::text
      from pg_constraint con join pg_class c on c.oid = con.conrelid join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'prepmeds'
    union all
    select 'trigger:' || c.relname || ':' || t.tgname || ':' || t.tgenabled::text || ':' || t.tgtype::text
      from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'prepmeds' and not t.tgisinternal
    union all
    select 'index:' || i.tablename || ':' || i.indexname from pg_indexes i where i.schemaname = 'prepmeds'
    union all
    select 'rls:' || c.relname || ':' || c.relrowsecurity::text
      from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'prepmeds' and c.relkind = 'r') q
$fn$;

-- One call that answers "where are we", entirely from stored rows.
create or replace function prepmeds.get_progress() returns jsonb
language sql stable security definer set search_path = prepmeds, pg_catalog as $fn$
  with p as (select * from group_progress),
  ids as (select m.group_id, count(*) as n from medication_group_map m join medications d on d.medication_id = m.medication_id where d.active group by 1)
  select jsonb_build_object(
    'generated_at', now(),
    'schema_fingerprint', schema_fingerprint(),
    'canonical_ids_active', (select count(*) from medications where active),
    'canonical_ids_excepted', (select count(*) from inventory_exceptions),
    'canonical_ids_without_route_or_form', (select count(*) from medications where active and (route is null or dosage_form is null)),
    'review_groups', (select count(*) from p),
    'combination_groups', (select count(*) from p where kind = 'combination'),
    'inventory_gaps', (select count(*) from inventory_gaps),
    'milestones', (select jsonb_build_object(
        '01_inventoried', count(*) filter (where m01_inventoried), '02_assigned', count(*) filter (where m02_assigned),
        '03_research_started', count(*) filter (where m03_research_started), '04_evidence_extracted', count(*) filter (where m04_evidence_extracted),
        '05_guideline_comparison_completed', count(*) filter (where m05_guideline_comparison_completed),
        '06_scenario_coverage_completed', count(*) filter (where m06_scenario_coverage_completed),
        '07_canonical_mapping_tested', count(*) filter (where m07_canonical_mapping_tested),
        '08_evidence_tests_passed', count(*) filter (where m08_evidence_tests_passed),
        '09_ready_for_clinician_review', count(*) filter (where m09_ready_for_clinician_review),
        '10_clinician_reviewed', count(*) filter (where m10_clinician_reviewed),
        '11_patient_facing_authorized', count(*) filter (where m11_patient_facing_authorized)) from p),
    'canonical_ids_by_milestone', (select jsonb_build_object(
        'in_groups_ready_for_clinician_review', coalesce(sum(ids.n) filter (where p.m09_ready_for_clinician_review), 0),
        'in_groups_clinician_reviewed', coalesce(sum(ids.n) filter (where p.m10_clinician_reviewed), 0),
        'in_groups_patient_facing_authorized', coalesce(sum(ids.n) filter (where p.m11_patient_facing_authorized), 0))
        from p left join ids on ids.group_id = p.group_id),
    'by_lane', (select coalesce(jsonb_object_agg(coalesce(x.lane, 'unassigned'), x.j), '{}'::jsonb) from (
        select p.lane, jsonb_build_object('groups', count(*), 'research_started', count(*) filter (where m03_research_started),
               'evidence_extracted', count(*) filter (where m04_evidence_extracted),
               'ready_for_clinician_review', count(*) filter (where m09_ready_for_clinician_review),
               'clinician_reviewed', count(*) filter (where m10_clinician_reviewed),
               'patient_facing_authorized', count(*) filter (where m11_patient_facing_authorized),
               'queue', _lane_counts(p.lane)) as j
        from p group by p.lane) x),
    'blocked_tasks', (select coalesce(jsonb_agg(jsonb_build_object('task_id', t.task_id, 'group_id', t.group_id, 'blocked_reason', t.blocked_reason,
                        'attempt', t.attempt) order by t.task_id), '[]'::jsonb) from tasks t where t.status = 'blocked'))
$fn$;

-- ── Owner-only administration (run from migrations or by the project owner) ──────────
create or replace function prepmeds._new_token() returns text language sql volatile as
$fn$ select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '') $fn$;

create or replace function prepmeds.admin_create_worker(p_worker_id text, p_lane text, p_github_login text default null) returns text
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v text := prepmeds._new_token();
begin
  perform _enter();
  insert into workers (worker_id, lane, github_login, token_sha256) values (p_worker_id, p_lane, p_github_login, _sha256(v));
  perform _event('admin', session_user, 'worker_created', null, null, null, jsonb_build_object('worker_id', p_worker_id, 'lane', p_lane, 'github_login', p_github_login));
  perform _exit();
  return v;   -- shown once; only its hash is stored
end $fn$;

create or replace function prepmeds.admin_rotate_worker_token(p_worker_id text) returns text
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v text := prepmeds._new_token();
begin
  perform _enter();
  update workers set token_sha256 = _sha256(v) where worker_id = p_worker_id;
  if not found then raise exception 'PREPMEDS_NO_SUCH_WORKER'; end if;
  perform _event('admin', session_user, 'worker_token_rotated', null, null, null, jsonb_build_object('worker_id', p_worker_id));
  perform _exit();
  return v;
end $fn$;

create or replace function prepmeds.admin_create_ci_credential(p_name text) returns text
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v text := prepmeds._new_token();
begin
  perform _enter();
  insert into ci_credentials (name, token_sha256) values (p_name, _sha256(v));
  perform _event('admin', session_user, 'ci_credential_created', null, null, null, jsonb_build_object('name', p_name));
  perform _exit();
  return v;
end $fn$;

create or replace function prepmeds.admin_add_clinician(p_user_id uuid, p_display_name text, p_can_review boolean, p_can_release boolean, p_pin text) returns void
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare v_salt text := replace(gen_random_uuid()::text, '-', '');
begin
  if length(coalesce(p_pin, '')) < 6 then raise exception 'PREPMEDS_PIN_TOO_SHORT: use at least 6 characters'; end if;
  perform _enter();
  insert into clinicians (user_id, display_name, can_review, can_release, pin_salt, pin_sha256)
  values (p_user_id, p_display_name, p_can_review, p_can_release, v_salt, _sha256(v_salt || ':' || p_pin));
  perform _event('admin', session_user, 'clinician_added', null, null, null,
                 jsonb_build_object('user_id', p_user_id, 'display_name', p_display_name, 'can_review', p_can_review, 'can_release', p_can_release));
  perform _exit();
end $fn$;

create or replace function prepmeds.admin_set_setting(p_key text, p_value jsonb) returns void
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
begin
  perform _enter();
  update settings set value = p_value, updated_at = now() where key = p_key;
  if not found then raise exception 'PREPMEDS_NO_SUCH_SETTING: %', p_key; end if;
  perform _event('admin', session_user, 'setting_changed', null, null, null, jsonb_build_object('key', p_key, 'value', p_value));
  perform _exit();
end $fn$;

create or replace function prepmeds.admin_register_source(p_source jsonb) returns text
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
begin
  perform _enter();
  insert into guideline_sources (source_id, kind, society, title, publication_date, version_label, doi, url, registered_by)
  values (p_source->>'source_id', p_source->>'kind', p_source->>'society', p_source->>'title', nullif(p_source->>'publication_date', '')::date,
          p_source->>'version_label', nullif(btrim(p_source->>'doi'), ''), p_source->>'url', 'admin')
  on conflict (source_id) do nothing;
  perform _exit();
  return p_source->>'source_id';
end $fn$;

-- Defines or extends a domain: its scenarios and, when given, its pinned required comparators.
create or replace function prepmeds.admin_upsert_domain(p_domain jsonb) returns void
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare r record;
begin
  perform _enter();
  insert into domains (domain_key, label) values (p_domain->>'domain_key', coalesce(p_domain->>'label', p_domain->>'domain_key'))
  on conflict (domain_key) do update set label = excluded.label;
  for r in select value as j from jsonb_array_elements(case when jsonb_typeof(p_domain->'scenarios') = 'array' then p_domain->'scenarios' else '[]'::jsonb end) loop
    insert into domain_scenarios (domain_key, scenario_key, label, description, required)
    values (p_domain->>'domain_key', r.j->>'scenario_key', r.j->>'label', r.j->>'description', coalesce((r.j->>'required')::boolean, true))
    on conflict (domain_key, scenario_key) do update set label = excluded.label, description = excluded.description, required = excluded.required;
  end loop;
  if jsonb_typeof(p_domain->'required_sources') = 'array' then
    insert into domain_required_sources (domain_key, source_id)
    select p_domain->>'domain_key', v from jsonb_array_elements_text(p_domain->'required_sources') v on conflict do nothing;
    update domains set comparators_pinned = true where domain_key = p_domain->>'domain_key';
  end if;
  perform _event('admin', session_user, 'domain_upserted', null, null, null, p_domain);
  perform _exit();
end $fn$;

-- Buckets, domains and classes for groups. Moving a group that already has a bucket needs a reason.
create or replace function prepmeds.admin_assign_groups(p_assignments jsonb, p_reason text default null) returns jsonb
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare r record; g review_groups; v_set int := 0; v_moved int := 0;
begin
  perform _enter();
  for r in select x->>'group_id' as gid, nullif(x->>'bucket', '')::int as bucket, x->>'domain_key' as dk, x->>'class_key' as ck
            from jsonb_array_elements(p_assignments) x loop
    select * into g from review_groups x where x.group_id = r.gid;
    if not found then raise exception 'PREPMEDS_NO_SUCH_GROUP: %', r.gid; end if;
    if r.bucket is not null and g.bucket is not null and g.bucket <> r.bucket then
      if length(btrim(coalesce(p_reason, ''))) < 10 then
        raise exception 'PREPMEDS_REASSIGNMENT_NEEDS_REASON: % is in bucket %; moving it to bucket % needs a written reason', r.gid, g.bucket, r.bucket;
      end if;
      if exists (select 1 from tasks t where t.group_id = g.group_id and t.status = 'claimed') then
        raise exception 'PREPMEDS_REASSIGNMENT_WHILE_CLAIMED: % is being worked on right now', r.gid;
      end if;
      perform _event('admin', session_user, 'bucket_reassigned', g.group_id, null, null,
                     jsonb_build_object('from_bucket', g.bucket, 'to_bucket', r.bucket, 'reason', btrim(p_reason)));
      v_moved := v_moved + 1;
    end if;
    update review_groups set bucket = coalesce(r.bucket, bucket), domain_key = coalesce(r.dk, domain_key), class_key = coalesce(r.ck, class_key)
     where group_id = r.gid;
    v_set := v_set + 1;
  end loop;
  perform _exit();
  return jsonb_build_object('ok', true, 'groups_set', v_set, 'groups_moved_between_buckets', v_moved);
end $fn$;

create or replace function prepmeds.admin_open_initial_tasks() returns int
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare r record; n int := 0;
begin
  perform _enter();
  for r in select g.group_id from review_groups g where g.retired_at is null and g.bucket is not null
            and (prepmeds._head(g.group_id)).revision_id is null order by g.bucket, g.group_id collate "C" loop
    if _open_task(r.group_id, 'initial', null, 100) is not null then n := n + 1; end if;
  end loop;
  perform _exit();
  return n;
end $fn$;

create or replace function prepmeds.admin_unblock_task(p_task_id bigint, p_note text) returns void
language plpgsql set search_path = prepmeds, pg_catalog as $fn$
declare t tasks;
begin
  perform _enter();
  update tasks set status = 'available', blocked_reason = null, attempt = 0, updated_at = now()
   where task_id = p_task_id and status = 'blocked' returning * into t;
  if not found then raise exception 'PREPMEDS_TASK_NOT_BLOCKED: %', p_task_id; end if;
  perform _event('admin', session_user, 'task_unblocked', t.group_id, t.task_id, null, jsonb_build_object('note', p_note));
  perform _exit();
end $fn$;

-- ── Privileges ───────────────────────────────────────────────────────────────────────
revoke all on schema prepmeds from public;
revoke all on all tables in schema prepmeds from public;
revoke all on all sequences in schema prepmeds from public;
revoke all on all functions in schema prepmeds from public;

do $grants$
declare
  r text;
  v_public_fns text[] := array[
    'worker_status(text)', 'start_session(text, text)', 'claim_next(text, bigint)', 'heartbeat(text, bigint, bigint, uuid)',
    'save_progress(text, bigint, bigint, uuid, jsonb)', 'submit_package(text, bigint, bigint, uuid, text, jsonb, text)',
    'release_task(text, bigint, bigint, uuid, text, text)', 'propose_split(text, bigint, bigint, uuid, jsonb, text)',
    'session_report(text, bigint)',
    'ci_relay(text, text, text, jsonb)', 'ci_pending_tests(text, int)', 'ci_record_passage_check(text, bigint, text, text, bigint)',
    'ci_record_test_run(text, bigint, text, text, int, boolean, int, int, text, bigint, int, jsonb)',
    'ci_sync_inventory(text, text, jsonb)',
    'get_active_guidance(text)', 'get_progress()', 'group_status(text)', 'verify_integrity()', 'schema_fingerprint()'];
  v_clinician_fns text[] := array[
    'clin_review_queue()', 'clin_get_package(text)', 'clin_verify_passages(text, bigint[])',
    'clin_mark_reviewed(text, text, text, boolean, bigint[], text, text)', 'clin_request_changes(text, text, text, text)',
    'clin_authorize_release(text, text, text, boolean)', 'clin_revoke(text, text, bigint, text)',
    'clin_record_exception(text, text, text)'];
begin
  foreach r in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on all tables in schema prepmeds from %I', r);
      execute format('revoke all on all functions in schema prepmeds from %I', r);
      execute format('grant usage on schema prepmeds to %I', r);
    end if;
  end loop;
  -- Token-authenticated functions and read-only status are callable with the publishable key.
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute (select string_agg(format('grant execute on function prepmeds.%s to %I', f, r), '; ') from unnest(v_public_fns) f);
    end if;
  end loop;
  -- Clinician functions need a signed-in user; the function then checks the allowlist and the PIN.
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute (select string_agg(format('grant execute on function prepmeds.%s to authenticated', f), '; ') from unnest(v_clinician_fns) f);
  end if;
end $grants$;
