create or replace function prepmeds.owner_dashboard_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = prepmeds, pg_catalog
as $function$
with
medication_counts as (
  select count(*)::int as total,
         count(*) filter (where active)::int as active
  from medications
),
group_counts as (
  select count(*)::int as total
  from review_groups
  where retired_at is null
),
task_counts as (
  select
    count(*) filter (where status = 'claimed')::int as in_research,
    count(*) filter (where status = 'awaiting_ci')::int as awaiting_ci,
    count(*) filter (where status = 'available' and reason = 'ci_failed')::int as ci_failed,
    count(*) filter (where status = 'available')::int as available,
    count(*) filter (where status = 'done')::int as completed
  from tasks
),
progress_counts as (
  select
    count(*) filter (where m09_ready_for_clinician_review)::int as ready_for_clinician_review,
    count(*) filter (where m10_clinician_reviewed)::int as clinician_reviewed,
    count(*) filter (where m11_patient_facing_authorized)::int as patient_facing_authorized,
    count(*) filter (where patient_facing_active)::int as patient_facing_active
  from group_progress
),
accepted_today as (
  select count(*)::int as count
  from events
  where event_type = 'revision_accepted'
    and at >= (date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York')
),
recent_medications as (
  select coalesce(jsonb_agg(x.j order by x.updated_at desc, x.canonical_name collate "C"), '[]'::jsonb) as items
  from (
    select m.updated_at, m.canonical_name,
           jsonb_build_object(
             'medication_id', m.medication_id,
             'canonical_name', m.canonical_name,
             'generic_name', m.generic_name,
             'route', m.route,
             'dosage_form', m.dosage_form,
             'release_type', m.release_type,
             'active', m.active,
             'first_seen_commit', m.first_seen_commit,
             'last_seen_commit', m.last_seen_commit,
             'updated_at', m.updated_at
           ) as j
    from medications m
    order by m.updated_at desc nulls last, m.canonical_name collate "C"
    limit 20
  ) x
),
recent_events as (
  select coalesce(jsonb_agg(x.j order by x.at desc, x.event_id desc), '[]'::jsonb) as items
  from (
    select e.event_id, e.at,
           jsonb_build_object(
             'event_id', e.event_id,
             'at', e.at,
             'event_type', e.event_type,
             'group_id', e.group_id,
             'task_id', e.task_id,
             'revision_id', e.revision_id
           ) as j
    from events e
    order by e.at desc, e.event_id desc
    limit 30
  ) x
),
awaiting_items as (
  select coalesce(jsonb_agg(x.j order by x.updated_at desc, x.task_id desc), '[]'::jsonb) as items
  from (
    select t.updated_at, t.task_id,
           jsonb_build_object(
             'task_id', t.task_id,
             'group_id', t.group_id,
             'status', t.status,
             'reason', t.reason,
             'revision_id', t.revision_id,
             'updated_at', t.updated_at
           ) as j
    from tasks t
    where t.status = 'awaiting_ci'
    order by t.updated_at desc, t.task_id desc
    limit 30
  ) x
),
review_items as (
  select coalesce(jsonb_agg(x.j order by x.domain_key collate "C", x.group_id collate "C"), '[]'::jsonb) as items
  from (
    select p.domain_key, p.group_id,
           jsonb_build_object(
             'group_id', p.group_id,
             'domain_key', p.domain_key,
             'class_key', p.class_key,
             'revision_no', p.head_revision_no,
             'content_sha256', p.head_sha256,
             'clinician_reviewed', p.m10_clinician_reviewed,
             'patient_facing_authorized', p.m11_patient_facing_authorized
           ) as j
    from group_progress p
    where p.m09_ready_for_clinician_review
    order by p.domain_key collate "C", p.group_id collate "C"
    limit 50
  ) x
)
select jsonb_build_object(
  'generated_at', now(),
  'medications', jsonb_build_object(
    'total', mc.total,
    'active', mc.active,
    'recent', rm.items
  ),
  'review_groups', jsonb_build_object('total', gc.total),
  'pipeline', jsonb_build_object(
    'revisions_accepted_today', a.count,
    'in_research', tc.in_research,
    'awaiting_ci', tc.awaiting_ci,
    'ci_failed', tc.ci_failed,
    'available', tc.available,
    'completed', tc.completed,
    'ready_for_clinician_review', pc.ready_for_clinician_review,
    'clinician_reviewed', pc.clinician_reviewed,
    'patient_facing_authorized', pc.patient_facing_authorized,
    'patient_facing_active', pc.patient_facing_active
  ),
  'awaiting_ci', ai.items,
  'ready_for_review', ri.items,
  'recent_events', re.items
)
from medication_counts mc
cross join group_counts gc
cross join task_counts tc
cross join progress_counts pc
cross join accepted_today a
cross join recent_medications rm
cross join recent_events re
cross join awaiting_items ai
cross join review_items ri;
$function$;

revoke all on function prepmeds.owner_dashboard_snapshot() from public;
grant execute on function prepmeds.owner_dashboard_snapshot() to anon, authenticated, service_role;

comment on function prepmeds.owner_dashboard_snapshot() is
  'Read-only non-PHI operational snapshot for the protected PREP-MEDS owner dashboard.';
