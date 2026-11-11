#!/usr/bin/env bash
# PREP-MEDS database test suite.
#   Plain PostgreSQL 14+ only (local, or the "postgres" service container in CI). Never point this at the hosted project:
#   it creates and drops throwaway databases.
# usage: PGHOST=... PGPORT=... PGUSER=postgres ./run_tests.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DB="prepmeds_test_$$"; RACE="prepmeds_race_$$"
fail=0
cleanup() { psql -q -d postgres -c "drop database if exists \"$DB\"" -c "drop database if exists \"$RACE\"" >/dev/null 2>&1; }
trap cleanup EXIT

echo "# PostgreSQL $(psql -q -d postgres -Atc 'show server_version')"
bash "$HERE/fresh_db.sh" "$DB" || { echo "not ok - migrations did not apply to a fresh database"; exit 1; }
echo "ok - migrations apply to a fresh database"
bash "$HERE/fresh_db.sh" "$DB" >/dev/null 2>&1
if psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/10_helpers_and_fixtures.sql" >/dev/null 2>"/tmp/pm_fix_$$.log"; then echo "ok - synthetic fixtures load through the API"; else echo "not ok - fixtures failed"; cat "/tmp/pm_fix_$$.log"; exit 1; fi
if ! psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/20_behaviour_tests.sql" >/dev/null 2>"/tmp/pm_beh_$$.log"; then echo "not ok - behaviour test script aborted:"; head -20 "/tmp/pm_beh_$$.log"; fail=1; fi

# ── Privilege boundary: what each database role can reach ───────────────────────────
expect_err() { # name, role, sql, expected fragment
  local out; out=$(psql -q -d "$DB" -Atc "set role $2; $3" 2>&1)
  if echo "$out" | grep -q "$4"; then psql -q -d "$DB" -c "select pmtest.ok(\$n\$$1\$n\$, true)" >/dev/null
  else psql -q -d "$DB" -c "select pmtest.ok(\$n\$$1\$n\$, false, \$d\$got: $(echo "$out" | head -2 | tr '\n' ' ')\$d\$)" >/dev/null; fi; }
expect_err "P01 the public API role cannot read any table"                         anon          "select count(*) from prepmeds.tasks"                                   "permission denied"
expect_err "P02 a signed-in application user cannot read any table"                authenticated "select count(*) from prepmeds.clinician_reviews"                       "permission denied"
expect_err "P03 the service role cannot write evidence tables either"              service_role  "insert into prepmeds.settings values ('x','1')"                        "permission denied"
expect_err "P04 the public API role cannot call owner-only administration"         anon          "select prepmeds.admin_create_worker('rogue','odd')"                    "permission denied"
expect_err "P05 the public API role cannot call internal functions"                anon          "select prepmeds._open_task('ING-alphaxaban','initial',null,1)"         "permission denied"
expect_err "P06 the public API role cannot reach clinician functions at all"       anon          "select prepmeds.clin_mark_reviewed('x','ING-alphaxaban','y',true)"     "permission denied"
expect_err "P07 a signed-in non-clinician reaches the function and is refused"     authenticated "select prepmeds.clin_review_queue()"                                   "PREPMEDS_NOT_SIGNED_IN"
expect_err "P08 worker functions are reachable with the public key but need a token" anon        "select prepmeds.claim_next('guess', 1)"                                "PREPMEDS_BAD_WORKER_TOKEN"
expect_err "P09 the public API role cannot set the write-guard flag to slip a write through" anon "select set_config('prepmeds.api','1',false); update prepmeds.tasks set status='done'" "permission denied"

# ── Concurrency: eight workers of one lane race for the same queue ──────────────────
bash "$HERE/fresh_db.sh" "$RACE"
psql -q -v ON_ERROR_STOP=1 -d "$RACE" -f "$HERE/30_race_fixtures.sql" >/dev/null 2>"/tmp/pm_race_$$.log" || { echo "not ok - race fixtures failed"; cat "/tmp/pm_race_$$.log"; fail=1; }
T0=$(psql -q -d "$RACE" -Atc "select (clock_timestamp() + interval '2 seconds')::text")
# (1) one simultaneous claim each, over only three tasks
psql -q -d "$RACE" -c "select pmtest.limit_available(3)" >/dev/null
for i in 1 2 3 4 5 6 7 8; do
  psql -q -d "$RACE" -At -v w="race-$i" -v t0="$T0" -f "$HERE/31_race_one_claim.sql" >"/tmp/pm_r1_${$}_$i.out" 2>&1 &
done; wait
psql -q -d "$RACE" -c "select pmtest.ok('R01 eight simultaneous claims over three tasks: exactly three succeed, on three different tasks',
   (select count(*) from prepmeds.tasks where status = 'claimed') = 3 and (select count(distinct claimed_by) from prepmeds.tasks where status = 'claimed') = 3,
   (select string_agg(task_id || ':' || coalesce(claimed_by, '-'), ' ') from prepmeds.tasks where status = 'claimed'))" >/dev/null
psql -q -d "$RACE" -c "select pmtest.ok('R02 the five losers were told there is no work; none errored',
   $(cat /tmp/pm_r1_${$}_*.out | grep -c NO_WORK) = 5 and $(cat /tmp/pm_r1_${$}_*.out | grep -ci error) = 0, 'outputs: $(cat /tmp/pm_r1_${$}_*.out | tr '\n' ' ' | cut -c1-200)')" >/dev/null
psql -q -d "$RACE" -c "select pmtest.release_all(); select pmtest.limit_available(null)" >/dev/null
# (2) eight workers drain sixty tasks, claiming and submitting concurrently, each call its own transaction
for i in 1 2 3 4 5 6 7 8; do
  psql -q -d "$RACE" -At -v w="race-$i" -f "$HERE/32_race_drain.sql" >"/tmp/pm_r2_${$}_$i.out" 2>&1 &
done; wait
psql -q -d "$RACE" -c "select pmtest.ok('R03 sixty tasks drained by eight concurrent workers: sixty revisions, one per group, none duplicated or lost',
   (select count(*) from prepmeds.evidence_revisions) = 60 and (select count(distinct group_id) from prepmeds.evidence_revisions) = 60
   and (select count(*) from prepmeds.tasks t join prepmeds.review_groups g using (group_id) where g.lane = 'odd' and t.status = 'awaiting_ci') = 60
   and (select count(*) from prepmeds.tasks t join prepmeds.review_groups g using (group_id) where g.lane = 'odd' and t.status in ('available','claimed')) = 0,
   (select 'revisions=' || count(*) || ' groups=' || count(distinct group_id) from prepmeds.evidence_revisions))" >/dev/null
psql -q -d "$RACE" -c "select pmtest.ok('R04 every task was claimed exactly once and no worker ever held two at a time',
   (select count(*) from prepmeds.events where event_type = 'claimed') = 63 and (select max(attempt) from prepmeds.tasks) = 2
   and not exists (select 1 from prepmeds.events e where e.event_type = 'claimed' group by e.task_id, e.payload->>'attempt' having count(*) > 1),
   (select 'claimed events=' || count(*) from prepmeds.events where event_type = 'claimed'))" >/dev/null
psql -q -d "$RACE" -c "select pmtest.ok('R05 the work was actually shared: at least four workers accepted revisions, and no session errored',
   (select count(distinct worker_id) from prepmeds.evidence_revisions) >= 4 and $(cat /tmp/pm_r2_${$}_*.out | grep -ci 'error') = 0,
   (select string_agg(worker_id || '=' || n, ' ') from (select worker_id, count(*) n from prepmeds.evidence_revisions group by 1 order by 1) q) || ' errors: $(cat /tmp/pm_r2_${$}_*.out | grep -i error | head -2 | tr '\n' ' ' | tr -d "'" | cut -c1-160)')" >/dev/null
psql -q -d "$RACE" -c "select pmtest.ok('R06 the audit chain is intact after concurrent writers', (prepmeds.verify_integrity()->>'ok')::boolean, prepmeds.verify_integrity()::text)" >/dev/null

# ── Schema drift: the fingerprint is stable across builds and changes when the schema is altered ──
FP1=$(psql -q -d "$DB" -Atc "select prepmeds.schema_fingerprint()"); FP2=$(psql -q -d "$RACE" -Atc "select prepmeds.schema_fingerprint()")
FP3=$(psql -q -d "$RACE" -Atc "begin; alter table prepmeds.tasks disable trigger a_guard_row; select prepmeds.schema_fingerprint(); rollback;" | grep -E '^[0-9a-f]{64}')
psql -q -d "$DB" -c "select pmtest.ok('S01 two databases built from the same migrations have the same schema fingerprint', '$FP1' = '$FP2' and length('$FP1') = 64, '$FP1 vs $FP2')" >/dev/null
psql -q -d "$DB" -c "select pmtest.ok('S02 disabling a single guard trigger changes the fingerprint (drift is detectable)', '$FP3' <> '$FP1' and length('$FP3') = 64, '$FP3')" >/dev/null

psql -q -d "$DB" -c "select pmtest.ok('S03 security-sensitive helper functions pin their search_path',
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'prepmeds'
     and p.proname = any (array['_enter','_exit','_jwt_sub','_new_token','_sha256','_guard','_immutable','_required_source_kind','_events_chain','_event_hash'])
     and p.proconfig @> array['search_path=prepmeds, pg_catalog']) = 10,
  (select string_agg(p.proname || ':' || coalesce(array_to_string(p.proconfig, ','), '<null>'), ' | ' order by p.proname)
   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'prepmeds'
     and p.proname = any (array['_enter','_exit','_jwt_sub','_new_token','_sha256','_guard','_immutable','_required_source_kind','_events_chain','_event_hash'])))" >/dev/null

# ── Report ──────────────────────────────────────────────────────────────────────────
{ psql -q -d "$DB" -Atc "select case when ok then 'ok - ' else 'not ok - ' end || name || coalesce(E'\n      ' || left(detail, 900), '') from pmtest.results order by n"
  psql -q -d "$RACE" -Atc "select case when ok then 'ok - ' else 'not ok - ' end || name || coalesce(E'\n      ' || left(detail, 900), '') from pmtest.results order by n"; } | tee "/tmp/pm_out_$$.txt"
total=$(grep -cE '^(ok|not ok) - ' "/tmp/pm_out_$$.txt"); bad=$(grep -c '^not ok - ' "/tmp/pm_out_$$.txt")
echo "# $((total - bad)) of $total assertions passed"
rm -f /tmp/pm_*_$$* 2>/dev/null
[ "$bad" -eq 0 ] && [ "$fail" -eq 0 ]
