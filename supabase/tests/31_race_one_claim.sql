-- One worker: open a session, wait for the shared start time, try to claim once. Usage: psql -v w=race-1 -v t0='<timestamp>'
\set QUIET on
select prepmeds.start_session(pmtest.secret(:'w'), 'race')->>'session_id' as sid \gset
select pg_sleep(greatest(0, extract(epoch from (:'t0'::timestamptz - clock_timestamp()))));
\o /dev/null
select 1 \g
\o
select prepmeds.claim_next(pmtest.secret(:'w'), :sid)->>'status';
