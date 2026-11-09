-- PREP-MEDS research-only chain of custody. Apply to a dedicated PREP-MEDS Supabase project.
-- All tables in private schema; no anon/authenticated access or patient-facing release.
create schema if not exists prepmeds_audit;
create table if not exists prepmeds_audit.review_groups (
  group_id text primary key,
  bucket integer not null check (bucket between 1 and 24),
  owner_lane text not null check (owner_lane in ('odd','even')),
  formulation_key text not null default 'UNADJUDICATED',
  state text not null default 'QUEUED' check (state in ('QUEUED','AGENT_A_CLAIMED','AWAITING_B','AGENT_B_CLAIMED','DISPUTED','EVIDENCE_COMPLETE')),
  current_revision integer not null default 0,
  latest_a_run uuid,
  latest_b_run uuid,
  updated_at timestamptz not null default now(),
  check ((bucket % 2 = 1 and owner_lane='odd') or (bucket % 2 = 0 and owner_lane='even'))
);
create table if not exists prepmeds_audit.canonical_mapping (
  medication_id text primary key,
  group_id text not null references prepmeds_audit.review_groups(group_id),
  canonical_name text not null,
  mapping_status text not null default 'PROVISIONAL' check(mapping_status in ('PROVISIONAL','ADJUDICATED')),
  created_at timestamptz not null default now()
);
create table if not exists prepmeds_audit.agent_runs (
  run_id uuid primary key default gen_random_uuid(),
  group_id text not null references prepmeds_audit.review_groups(group_id),
  agent text not null check(agent in ('A','B')),
  revision integer not null,
  state text not null default 'CLAIMED' check(state in ('CLAIMED','PASS','FAIL','EXPIRED')),
  evidence_hash text,
  evidence_commit text,
  source_citations jsonb not null default '[]'::jsonb,
  scenario_evidence jsonb not null default '{}'::jsonb,
  test_evidence jsonb not null default '[]'::jsonb,
  discrepancies jsonb not null default '[]'::jsonb,
  claimed_at timestamptz not null default now(),
  finished_at timestamptz,
  lease_until timestamptz not null default (now() + interval '45 minutes'),
  unique (group_id,agent,revision),
  check (state <> 'PASS' or (evidence_hash is not null and evidence_commit ~ '^[0-9a-f]{40}$' and finished_at is not null))
);
-- Safe to re-run during integration; preserve existing references and rows.
do $
begin
  if not exists (select 1 from pg_constraint where conname='review_groups_latest_a_fk' and conrelid='prepmeds_audit.review_groups'::regclass) then
    alter table prepmeds_audit.review_groups add constraint review_groups_latest_a_fk
      foreign key(latest_a_run) references prepmeds_audit.agent_runs(run_id);
  end if;
  if not exists (select 1 from pg_constraint where conname='review_groups_latest_b_fk' and conrelid='prepmeds_audit.review_groups'::regclass) then
    alter table prepmeds_audit.review_groups add constraint review_groups_latest_b_fk
      foreign key(latest_b_run) references prepmeds_audit.agent_runs(run_id);
  end if;
end $;
create table if not exists prepmeds_audit.custody_events (
  event_id bigint generated always as identity primary key,
  group_id text not null references prepmeds_audit.review_groups(group_id),
  run_id uuid references prepmeds_audit.agent_runs(run_id),
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create or replace function prepmeds_audit.prevent_custody_changes() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'custody events are append-only';
end $$;
drop trigger if exists custody_append_only on prepmeds_audit.custody_events;
create trigger custody_append_only before update or delete on prepmeds_audit.custody_events
for each row execute function prepmeds_audit.prevent_custody_changes();
-- No browser/client access to this schema; only privileged backend scheduler.
revoke all on schema prepmeds_audit from public, anon, authenticated;
revoke all on all tables in schema prepmeds_audit from public, anon, authenticated;
revoke all on all functions in schema prepmeds_audit from public, anon, authenticated;
alter table prepmeds_audit.review_groups enable row level security;
alter table prepmeds_audit.canonical_mapping enable row level security;
alter table prepmeds_audit.agent_runs enable row level security;
alter table prepmeds_audit.custody_events enable row level security;
-- Work selection indexes. An Agent B record is optional under the clinician-review
-- governance decision; its absence must never block clinician review of source-linked evidence.
create index if not exists review_groups_lane_queue_idx
  on prepmeds_audit.review_groups(owner_lane, state, bucket, updated_at);
create index if not exists agent_runs_expiring_idx
  on prepmeds_audit.agent_runs(lease_until) where state='CLAIMED';
create index if not exists custody_events_group_time_idx
  on prepmeds_audit.custody_events(group_id, occurred_at, event_id);
