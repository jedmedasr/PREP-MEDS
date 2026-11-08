-- Additive hardening of 20261108234000. Do NOT apply before catalog inspection.
-- Reuses all four original tables; preserves original rows and historical evidence.
-- Runtime is disabled until an owner binds the inspected existing project.
set lock_timeout = '5s';
do $$ begin
  if to_regclass('prepmeds_audit.review_groups') is null or
     to_regclass('prepmeds_audit.canonical_mapping') is null or
     to_regclass('prepmeds_audit.agent_runs') is null or
     to_regclass('prepmeds_audit.custody_events') is null then
    raise exception 'BASELINE_SCHEMA_REQUIRED: inspect existing schema; apply original migration once only';
  end if;
end $$;
create table if not exists prepmeds_audit.runtime_config (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default false,
  environment text not null default 'disabled' check(environment in ('disabled','test','operational')),
  project_ref text,
  inspected_schema_hash text,
  configured_at timestamptz not null default clock_timestamp(),
  check(not enabled or (project_ref is not null and inspected_schema_hash ~ '^[0-9a-f]{64}$' and environment <> 'disabled'))
);
insert into prepmeds_audit.runtime_config(singleton) values(true) on conflict do nothing;
create table if not exists prepmeds_audit.agent_principals (
  principal_id text primary key,
  identity_id text not null check(length(identity_id) > 3),
  agent text not null check(agent in ('A','B')),
  owner_lane text not null check(owner_lane in ('odd','even')),
  credential_hash text not null unique check(credential_hash ~ '^[0-9a-f]{64}$'),
  enabled boolean not null default false,
  created_at timestamptz not null default clock_timestamp()
);
alter table prepmeds_audit.review_groups add column if not exists parent_group_id text references prepmeds_audit.review_groups(group_id);
alter table prepmeds_audit.review_groups add column if not exists is_container boolean not null default false;
alter table prepmeds_audit.review_groups add column if not exists ingredient_ids jsonb not null default '[]';
alter table prepmeds_audit.review_groups add column if not exists import_snapshot jsonb;
alter table prepmeds_audit.review_groups add column if not exists clinical_reviewed boolean not null default false;
alter table prepmeds_audit.review_groups add column if not exists patient_facing_enabled boolean not null default false;
alter table prepmeds_audit.canonical_mapping add column if not exists import_snapshot jsonb;
alter table prepmeds_audit.canonical_mapping add column if not exists source_commit text;
create table if not exists prepmeds_audit.review_unit_members (
  group_id text not null references prepmeds_audit.review_groups(group_id),
  medication_id text not null references prepmeds_audit.canonical_mapping(medication_id),
  formulation_scope jsonb not null default '{"adjudicated":false}',
  primary key(group_id, medication_id)
);
alter table prepmeds_audit.agent_runs add column if not exists principal_id text references prepmeds_audit.agent_principals(principal_id);
alter table prepmeds_audit.agent_runs add column if not exists context_id text;
alter table prepmeds_audit.agent_runs add column if not exists attempt integer not null default 1 check(attempt > 0);
alter table prepmeds_audit.agent_runs add column if not exists previous_state text;
alter table prepmeds_audit.agent_runs add column if not exists result_hash text;
-- Original unique(group,agent,revision) prevents a new attempt after lease expiry.
-- Replace only that known constraint; no rows or run history are deleted.
alter table prepmeds_audit.agent_runs drop constraint if exists agent_runs_group_id_agent_revision_key;
create unique index if not exists agent_attempt_revision on prepmeds_audit.agent_runs(group_id,agent,revision,attempt);
create unique index if not exists agent_one_live_unit on prepmeds_audit.agent_runs(group_id) where state='CLAIMED';
create unique index if not exists agent_one_live_principal on prepmeds_audit.agent_runs(principal_id) where state='CLAIMED' and principal_id is not null;
create unique index if not exists agent_group_identity on prepmeds_audit.agent_runs(run_id,group_id);
create index if not exists agent_expiry on prepmeds_audit.agent_runs(lease_until) where state='CLAIMED';
create index if not exists group_eligible on prepmeds_audit.review_groups(owner_lane,state,bucket,group_id) where not is_container;
do $$ begin
  if not exists(select 1 from pg_constraint where conname='latest_a_same_group' and conrelid='prepmeds_audit.review_groups'::regclass) then
    alter table prepmeds_audit.review_groups add constraint latest_a_same_group foreign key(latest_a_run,group_id) references prepmeds_audit.agent_runs(run_id,group_id);
  end if;
  if not exists(select 1 from pg_constraint where conname='latest_b_same_group' and conrelid='prepmeds_audit.review_groups'::regclass) then
    alter table prepmeds_audit.review_groups add constraint latest_b_same_group foreign key(latest_b_run,group_id) references prepmeds_audit.agent_runs(run_id,group_id);
  end if;
end $$;
create table if not exists prepmeds_audit.evidence_revisions (
  group_id text not null references prepmeds_audit.review_groups(group_id),
  revision integer not null check(revision > 0),
  a_run_id uuid not null unique,
  content_hash text not null check(content_hash ~ '^[0-9a-f]{64}$'),
  github_commit text not null check(github_commit ~ '^[0-9a-f]{40}$'),
  payload jsonb not null check(jsonb_typeof(payload)='object'),
  mapping_snapshot jsonb not null,
  deficiencies jsonb not null default '[]',
  created_at timestamptz not null default clock_timestamp(),
  primary key(group_id,revision),
  foreign key(a_run_id,group_id) references prepmeds_audit.agent_runs(run_id,group_id)
);
create table if not exists prepmeds_audit.import_receipts (
  import_key text primary key,
  content_hash text not null check(content_hash ~ '^[0-9a-f]{64}$'),
  source_commit text not null check(source_commit ~ '^[0-9a-f]{40}$'),
  payload jsonb not null,
  created_at timestamptz not null default clock_timestamp()
);
create table if not exists prepmeds_audit.dispatch_requests (
  principal_id text not null references prepmeds_audit.agent_principals(principal_id),
  request_key text not null,
  request_hash text not null,
  run_id uuid references prepmeds_audit.agent_runs(run_id),
  response jsonb not null,
  created_at timestamptz not null default clock_timestamp(),
  primary key(principal_id,request_key)
);
alter table prepmeds_audit.custody_events add column if not exists previous_hash text;
alter table prepmeds_audit.custody_events add column if not exists event_hash text;
create index if not exists custody_group_order on prepmeds_audit.custody_events(group_id,event_id desc);
create or replace function prepmeds_audit.hash_json(p jsonb) returns text
language sql immutable strict set search_path='' as $$ select encode(sha256(convert_to(p::text,'UTF8')),'hex') $$;
create or replace function prepmeds_audit.stamp_custody() returns trigger
language plpgsql set search_path='' as $$
declare prior prepmeds_audit.custody_events;
begin
  perform 1 from prepmeds_audit.review_groups where group_id=new.group_id for update;
  select * into prior from prepmeds_audit.custody_events where group_id=new.group_id order by event_id desc limit 1;
  new.occurred_at := clock_timestamp();
  new.previous_hash := coalesce(prior.event_hash,case when prior.event_id is not null then prepmeds_audit.hash_json(to_jsonb(prior)) end);
  new.event_hash := prepmeds_audit.hash_json(jsonb_build_object('id',new.event_id,'group',new.group_id,'run',new.run_id,'type',new.event_type,'details',new.details,'previous',new.previous_hash,'utc',to_char(new.occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
  return new;
end $$;
drop trigger if exists custody_stamp on prepmeds_audit.custody_events;
create trigger custody_stamp before insert on prepmeds_audit.custody_events for each row execute function prepmeds_audit.stamp_custody();
drop trigger if exists custody_no_truncate on prepmeds_audit.custody_events;
create trigger custody_no_truncate before truncate on prepmeds_audit.custody_events for each statement execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists evidence_immutable on prepmeds_audit.evidence_revisions;
create trigger evidence_immutable before update or delete on prepmeds_audit.evidence_revisions for each row execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists evidence_no_truncate on prepmeds_audit.evidence_revisions;
create trigger evidence_no_truncate before truncate on prepmeds_audit.evidence_revisions for each statement execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists imports_immutable on prepmeds_audit.import_receipts;
create trigger imports_immutable before update or delete on prepmeds_audit.import_receipts for each row execute function prepmeds_audit.prevent_custody_changes();
create or replace function prepmeds_audit.protect_finished_run() returns trigger
language plpgsql set search_path='' as $$ begin
  if tg_op='DELETE' or old.state <> 'CLAIMED' then raise exception 'FINISHED_RUN_IMMUTABLE'; end if;
  if new.run_id<>old.run_id or new.group_id<>old.group_id or new.agent<>old.agent or new.revision<>old.revision or new.principal_id is distinct from old.principal_id or new.context_id is distinct from old.context_id then raise exception 'RUN_IDENTITY_IMMUTABLE'; end if;
  return new;
end $$;
drop trigger if exists run_immutable on prepmeds_audit.agent_runs;
create trigger run_immutable before update or delete on prepmeds_audit.agent_runs for each row execute function prepmeds_audit.protect_finished_run();
-- Explicitly deny direct writes even to the Data API service role. Functions below
-- are the only granted path. Database owners remain a trusted administrative boundary.
do $$ declare t text; begin
  foreach t in array array['runtime_config','agent_principals','review_unit_members','evidence_revisions','import_receipts','dispatch_requests','review_groups','canonical_mapping','agent_runs','custody_events'] loop
    execute format('alter table prepmeds_audit.%I enable row level security',t);
  end loop;
end $$;
revoke all on schema prepmeds_audit from public,anon,authenticated,service_role;
revoke all on all tables in schema prepmeds_audit from public,anon,authenticated,service_role;
revoke all on all sequences in schema prepmeds_audit from public,anon,authenticated,service_role;
revoke all on all functions in schema prepmeds_audit from public,anon,authenticated,service_role;
