-- Concurrency fixtures: sixty synthetic single-ingredient groups in one odd bucket, eight odd-lane workers.
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = warning;
\o /dev/null
\ir 10_helpers_and_fixtures.sql
\o /dev/null
select prepmeds.ci_sync_inventory(pmtest.secret('ci'), repeat('3', 40),
  (select jsonb_build_object('medications', jsonb_agg(jsonb_build_object('medicationId', 'MED-race' || lpad(i::text, 2, '0'),
     'canonicalName', 'Race drug ' || i, 'ingredientIds', jsonb_build_array('ING-race' || lpad(i::text, 2, '0')))))
   from generate_series(1, 60) i));
-- The twelve fixture medications are absent from this inventory, so only the sixty race groups stay active.
select prepmeds.admin_assign_groups((select jsonb_agg(jsonb_build_object('group_id', group_id, 'bucket', 1)) from prepmeds.review_groups where group_id like 'ING-race%'));
select prepmeds.admin_assign_groups((select jsonb_agg(jsonb_build_object('group_id', group_id, 'bucket', 2)) from prepmeds.review_groups
                                     where group_id not like 'ING-race%' and lane = 'odd'), 'race test: move every non-race group out of the odd lane');
select prepmeds.admin_open_initial_tasks();
insert into pmtest.secrets select 'race-' || i, prepmeds.admin_create_worker('race-' || i, 'odd', null) from generate_series(1, 8) i;

-- Test-only controls. They use the owner's ability to enter the API context; no production code path does this.
create or replace function pmtest.limit_available(p_keep int) returns void language plpgsql as $t$
begin
  perform set_config('prepmeds.api', '1', true);
  update prepmeds.tasks set status = 'available', blocked_reason = null where blocked_reason = 'TEST_PARKED';
  if p_keep is not null then
    update prepmeds.tasks set status = 'blocked', blocked_reason = 'TEST_PARKED'
     where status = 'available' and task_id not in (select t.task_id from prepmeds.tasks t join prepmeds.review_groups g using (group_id)
                                                    where t.status = 'available' and g.group_id like 'ING-race%' order by t.task_id limit p_keep);
  end if;
  perform set_config('prepmeds.api', '0', true);
end $t$;
create or replace function pmtest.release_all() returns void language sql as $t$
  select prepmeds.release_task(pmtest.secret(t.claimed_by), s.session_id, t.task_id, t.claim_token, 'SESSION_ENDING')
  from prepmeds.tasks t join prepmeds.sessions s on s.worker_id = t.claimed_by and s.ended_at is null where t.status = 'claimed'
$t$;
\o
