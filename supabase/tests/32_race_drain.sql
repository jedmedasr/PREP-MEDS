-- One worker draining the queue: every claim and every submit is its own transaction. Usage: psql -v w=race-1
\set QUIET on
select prepmeds.start_session(pmtest.secret(:'w'), 'drain')->>'session_id' as sid \gset
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
select (c->>'status' in ('CLAIMED','RESUMED')) as go, coalesce(c->'task'->>'task_id', '0') as tid,
       coalesce(c->'task'->>'claim_token', '00000000-0000-0000-0000-000000000000') as ct, coalesce(c->'group'->>'group_id', '') as gid
  from (select prepmeds.claim_next(pmtest.secret(:'w'), :sid) as c) q \gset
\if :go
select prepmeds.submit_package(pmtest.secret(:'w'), :sid, :tid, :'ct'::uuid, gen_random_uuid()::text, pmtest.package(:'gid'))->>'accepted' as acc \gset
\endif
