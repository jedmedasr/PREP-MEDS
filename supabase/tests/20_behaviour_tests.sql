-- Behaviour tests. Run after 10_helpers_and_fixtures.sql on a fresh database.
-- Every assertion writes one row to pmtest.results; run_tests.sh prints them and fails on any "not ok".
\set ON_ERROR_STOP on
\set QUIET on
\pset format unaligned
\pset tuples_only on
set client_min_messages = warning;
\o /dev/null

create table pmtest.vars (name text primary key, j jsonb);
create or replace function pmtest.setv(p_name text, p_j jsonb) returns void language sql as
$t$ insert into pmtest.vars values (p_name, p_j) on conflict (name) do update set j = excluded.j $t$;
create or replace function pmtest.v(p_name text) returns jsonb language sql stable as
$t$ select j from pmtest.vars where name = p_name $t$;
create or replace function pmtest.st(p_group text, p_key text) returns boolean language sql stable as
$t$ select (prepmeds.group_status(p_group)->>p_key)::boolean $t$;
create or replace function pmtest.blocked_by(p_group text, p_blocker text) returns boolean language sql stable as
$t$ select prepmeds.group_status(p_group)->'blockers' ? p_blocker $t$;
-- Drop every trace of one source from a package.
create or replace function pmtest.without_source(p jsonb, p_source text) returns jsonb language sql immutable as $t$
  select p || jsonb_build_object(
    'comparisons', coalesce((select jsonb_agg(c) from jsonb_array_elements(p->'comparisons') c where c->>'source_id' <> p_source), '[]'::jsonb),
    'recommendations', coalesce((select jsonb_agg(c) from jsonb_array_elements(p->'recommendations') c where c->>'source_id' <> p_source), '[]'::jsonb))
$t$;
-- Replace the recommendations of one source and scenario.
create or replace function pmtest.replace_recs(p jsonb, p_source text, p_scenario text, p_new jsonb) returns jsonb language sql immutable as $t$
  select p || jsonb_build_object('recommendations',
    coalesce((select jsonb_agg(c) from jsonb_array_elements(p->'recommendations') c
              where not (c->>'source_id' = p_source and c->>'scenario_key' = p_scenario)), '[]'::jsonb) || p_new)
$t$;

-- ═════ A. Queue: claims, duplicates, lanes, recovery ═════════════════════════════════
select pmtest.ok('A01 a combination group is not claimable before its components have evidence',
                 not prepmeds._deps_ready('ING-betaformin+ING-gammagliptin'));
select pmtest.setv('b1', pmtest.claim('agent-1'));
select pmtest.ok('A02 odd worker receives the first odd-lane group in bucket order',
                 pmtest.v('b1')->>'status' = 'CLAIMED' and pmtest.v('b1')->'group'->>'group_id' = 'ING-alphaxaban' and pmtest.v('b1')->'group'->>'lane' = 'odd',
                 pmtest.v('b1')::text);
select pmtest.ok('A03 the brief carries what the task needs: both canonical IDs, 2 required sources, 4 scenarios, base revision 0',
                 jsonb_array_length(pmtest.v('b1')->'group'->'medications') = 2 and jsonb_array_length(pmtest.v('b1')->'required_sources') = 2
                 and jsonb_array_length(pmtest.v('b1')->'scenarios') = 4 and (pmtest.v('b1')->>'based_on_revision_no')::int = 0);
select pmtest.setv('b1_again', pmtest.claim('agent-1'));
select pmtest.ok('A04 duplicate claim: asking again returns the same task, not a second one',
                 pmtest.v('b1_again')->>'status' = 'RESUMED' and pmtest.v('b1_again')->'task'->>'task_id' = pmtest.v('b1')->'task'->>'task_id'
                 and (select count(*) from prepmeds.tasks where claimed_by = 'agent-1' and status = 'claimed') = 1);
select pmtest.setv('e1', pmtest.claim('agent-2'));
select pmtest.ok('A05 even worker receives an even-lane group',
                 pmtest.v('e1')->'group'->>'group_id' = 'ING-betaformin' and pmtest.v('e1')->'group'->>'lane' = 'even', pmtest.v('e1')::text);
select pmtest.throws('A06 even worker cannot submit against the odd worker''s task',
  $q$ select prepmeds.submit_package(pmtest.secret('agent-2'), (pmtest.v('e1')->>'session_id')::bigint, (pmtest.v('b1')->'task'->>'task_id')::bigint,
        (pmtest.v('b1')->'task'->>'claim_token')::uuid, 'cross-lane-attempt', pmtest.package('ING-alphaxaban')) $q$, 'PREPMEDS_NOT_CLAIM_HOLDER');
select pmtest.throws('A07 a guessed claim token is refused',
  $q$ select prepmeds.heartbeat(pmtest.secret('agent-1'), (pmtest.v('b1')->>'session_id')::bigint, (pmtest.v('b1')->'task'->>'task_id')::bigint, gen_random_uuid()) $q$,
  'PREPMEDS_NOT_CLAIM_HOLDER');
select pmtest.throws('A08 an unknown worker token is refused', $q$ select prepmeds.worker_status('not-a-token') $q$, 'PREPMEDS_BAD_WORKER_TOKEN');

-- Crash recovery: progress is saved, the conversation dies, a brand-new session picks the work up from the database.
select prepmeds.save_progress(pmtest.secret('agent-1'), (pmtest.v('b1')->>'session_id')::bigint, (pmtest.v('b1')->'task'->>'task_id')::bigint,
         (pmtest.v('b1')->'task'->>'claim_token')::uuid, '{"sources_read":["SOC-A-2016"],"note":"Table 1 transcribed; SOC-B still to read"}');
select pmtest.setv('s_new', prepmeds.start_session(pmtest.secret('agent-1'), 'fresh conversation after a crash'));
select pmtest.setv('b1', prepmeds.claim_next(pmtest.secret('agent-1'), (pmtest.v('s_new')->>'session_id')::bigint)
                         || jsonb_build_object('session_id', (pmtest.v('s_new')->>'session_id')::bigint));
select pmtest.ok('A09 crashed worker recovery: a new session resumes the same task with its saved progress',
                 pmtest.v('b1')->>'status' = 'RESUMED' and pmtest.v('b1')->'group'->>'group_id' = 'ING-alphaxaban'
                 and pmtest.v('b1')->'task'->'saved_progress'->>'note' like 'Table 1 transcribed%', pmtest.v('b1')::text);
select pmtest.throws('A10 the superseded session can no longer act',
  $q$ select prepmeds.claim_next(pmtest.secret('agent-1'), (pmtest.v('b1_again')->>'session_id')::bigint) $q$, 'PREPMEDS_SESSION_NOT_CURRENT');

-- No status flag can be flipped by hand.
select pmtest.throws('A11 direct UPDATE of a task status is blocked', $q$ update prepmeds.tasks set status = 'done' $q$, 'PREPMEDS_DIRECT_WRITE_BLOCKED');
select pmtest.throws('A12 direct INSERT of a test run is blocked',
  $q$ insert into prepmeds.test_runs (revision_id, content_sha256, suite, suite_version, passed, total, failed, commit_sha, ci_run_id) values (1, 'x', 'evidence', 1, true, 1, 0, repeat('a', 40), 1) $q$,
  'PREPMEDS_DIRECT_WRITE_BLOCKED');
select pmtest.throws('A13 TRUNCATE of the audit log is blocked', $q$ truncate prepmeds.events $q$, 'PREPMEDS_DIRECT_WRITE_BLOCKED');
select pmtest.throws('A14 direct INSERT of a clinician review is blocked',
  $q$ insert into prepmeds.clinician_reviews (group_id, revision_id, content_sha256, clinician_id, decision, attested) values ('ING-alphaxaban', 1, 'x', pmtest.secret('clin_a')::uuid, 'reviewed', true) $q$,
  'PREPMEDS_DIRECT_WRITE_BLOCKED');

-- ═════ B. Package acceptance ═════════════════════════════════════════════════════════
select pmtest.setv('good', pmtest.package('ING-alphaxaban'));
select pmtest.rejected('B01 missing guideline comparison is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.without_source(pmtest.v('good'), 'SOC-B-2021')), 'MISSING_COMPARISON:SOC-B-2021');
select pmtest.rejected('B02 NOT_ADDRESSED without saying what was read is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), (select p || jsonb_build_object('comparisons', p->'comparisons' || '[{"source_id":"SOC-B-2021","status":"NOT_ADDRESSED"}]'::jsonb)
                                             from (select pmtest.without_source(pmtest.v('good'), 'SOC-B-2021') as p) q)), 'checked_locators');
select pmtest.rejected('B03 COMPARED with no recommendation from that source is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), (select pmtest.v('good') || jsonb_build_object('recommendations',
      (select jsonb_agg(c) from jsonb_array_elements(pmtest.v('good')->'recommendations') c where c->>'source_id' <> 'SOC-B-2021')))),
  'COMPARED_WITHOUT_RECOMMENDATION:SOC-B-2021');
select pmtest.rejected('B04 missing scenario coverage is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), (select pmtest.v('good') || jsonb_build_object(
      'scenario_coverage', (select jsonb_agg(c) from jsonb_array_elements(pmtest.v('good')->'scenario_coverage') c where c->>'scenario_key' <> 'resumption'),
      'recommendations', (select jsonb_agg(c) from jsonb_array_elements(pmtest.v('good')->'recommendations') c where c->>'scenario_key' <> 'resumption')))),
  'MISSING_SCENARIO:resumption');
select pmtest.rejected('B05 a canonical ID left out of the package is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good') || '{"medication_ids":["MED-alphaxaban"]}'), 'MAPPING_MISMATCH');
select pmtest.rejected('B06 a canonical ID that belongs to another group is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good') || '{"medication_ids":["MED-alphaquis-starter","MED-alphaxaban","MED-zetaparin"]}'), 'MAPPING_MISMATCH');
select pmtest.rejected('B07 a recommendation citing a passage of a different guideline is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.replace_recs(pmtest.v('good'), 'SOC-A-2016', 'resumption',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-B-2021","scenario_key":"resumption","action":"continue","summary":"Cites the wrong document."}]')),
  'belongs to a different source');
select pmtest.rejected('B08 an undefined scenario is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good') || jsonb_build_object('recommendations', pmtest.v('good')->'recommendations' ||
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"bogus_scenario","action":"continue","summary":"Not a scenario of this domain."}]'::jsonb)),
  'is not defined for domain');
select pmtest.rejected('B09 overlapping kidney-function bands are rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.replace_recs(pmtest.v('good'), 'SOC-A-2016', 'high_risk_procedure',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":2,"max":2,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":30,"max":50},"summary":"Synthetic band one."},
        {"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":3,"max":3,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":40,"max":80},"summary":"Synthetic band two overlaps band one."}]')),
  'RENAL_BAND_OVERLAP');
select pmtest.rejected('B10 a gap between kidney-function bands is rejected unless explained',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.replace_recs(pmtest.v('good'), 'SOC-A-2016', 'high_risk_procedure',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":3,"max":3,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":30,"max":49,"max_inclusive":true},"summary":"Synthetic band 30 to 49 inclusive."},
        {"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":2,"max":2,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":50,"max":80,"max_inclusive":true},"summary":"Synthetic band 50 to 80 inclusive."}]')),
  'RENAL_BAND_GAP');
select pmtest.rejected('B11 "hold" with no interval and no quoted timing is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.replace_recs(pmtest.v('good'), 'SOC-A-2016', 'high_risk_procedure',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","summary":"Says hold but not for how long."}]')),
  'action hold needs');
-- SOC-A and SOC-B now disagree on the high-risk hold; the package must say so.
select pmtest.setv('disagree', pmtest.replace_recs(pmtest.replace_recs(pmtest.v('good'), 'SOC-A-2016', 'high_risk_procedure',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":3,"max":3,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":null,"max":30},"summary":"Synthetic: below 30, hold three days."},
        {"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":2,"max":2,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":30,"max":50},"summary":"Synthetic: 30 to under 50, hold two days."},
        {"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":1,"max":1,"unit":"days"},"renal":{"measure":"crcl_ml_min","min":50,"max":null},"summary":"Synthetic: 50 and above, hold one day."}]'),
      'SOC-B-2021', 'high_risk_procedure',
      '[{"source_id":"SOC-B-2021","passage":"p-SOC-B-2021","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":3,"max":3,"unit":"days"},"summary":"Synthetic: hold three days regardless of kidney function."}]'));
select pmtest.rejected('B12 guideline disagreement that is not declared as a conflict is rejected',
  pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('disagree')), 'UNDECLARED_CONFLICT:high_risk_procedure');
select pmtest.throws('B13 a package built on an out-of-date revision is refused',
  $q$ select pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good') || '{"based_on_revision_no": 5}') $q$, 'PREPMEDS_STALE_BASE');
select pmtest.throws('B14 a package for a different group than the claimed task is refused',
  $q$ select pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good') || '{"group_id":"ING-zetaparin"}') $q$, 'PREPMEDS_BAD_PACKAGE');
select pmtest.ok('B15 rejected packages stored no evidence revision', (select count(*) from prepmeds.evidence_revisions) = 0);
select pmtest.ok('B16 every rejection was logged with its reasons',
                 (select count(*) from prepmeds.events where event_type = 'submission_rejected' and jsonb_array_length(payload->'deficiencies') > 0) = 12,
                 (select count(*)::text from prepmeds.events where event_type = 'submission_rejected'));

select pmtest.setv('accepted1', pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('disagree') || jsonb_build_object('conflicts',
   '[{"scenario_key":"high_risk_procedure","source_ids":["SOC-A-2016","SOC-B-2021"],"description":"SOC-A stratifies the hold by kidney function (1 to 3 days); SOC-B gives a flat 3 days."}]'::jsonb), 'submission-0001'));
select pmtest.ok('B17 a complete package with the conflict declared is accepted as revision 1',
                 pmtest.v('accepted1')->>'accepted' = 'true' and (pmtest.v('accepted1')->>'revision_no')::int = 1, pmtest.v('accepted1')::text);
select pmtest.ok('B18 renal boundaries: 29.99, 30, 49.99 and 50 each fall in exactly one band of the source',
  (select bool_and(n = 1) from (select v, (select count(*) from prepmeds.recommendations r where r.source_id = 'SOC-A-2016'
       and r.scenario_key = 'high_risk_procedure' and r.renal_band @> v) as n from unnest(array[29.99, 30, 49.99, 50]::numeric[]) v) q));
select pmtest.ok('B19 renal boundaries: 30 belongs to the 30-to-under-50 band and 50 to the 50-and-above band',
  (select r.hold_min from prepmeds.recommendations r where r.source_id = 'SOC-A-2016' and r.scenario_key = 'high_risk_procedure' and r.renal_band @> 30::numeric) = 2
  and (select r.hold_min from prepmeds.recommendations r where r.source_id = 'SOC-A-2016' and r.scenario_key = 'high_risk_procedure' and r.renal_band @> 50::numeric) = 1);
select pmtest.setv('replay', pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good'), 'submission-0001'));
select pmtest.ok('B20 retrying the same submission is idempotent: same revision, nothing new stored',
                 pmtest.v('replay')->>'replayed' = 'true' and pmtest.v('replay')->>'revision_id' = pmtest.v('accepted1')->>'revision_id'
                 and (select count(*) from prepmeds.evidence_revisions) = 1);
select pmtest.throws('B21 a second, different submission after acceptance is refused (the claim is over)',
  $q$ select pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('good'), 'submission-0002') $q$, 'PREPMEDS_NOT_CLAIM_HOLDER');
select pmtest.throws('B22 an accepted revision cannot be edited, even from inside the API context',
  $q$ select set_config('prepmeds.api', '1', true); update prepmeds.recommendations set summary = 'rewritten after acceptance' $q$, 'PREPMEDS_IMMUTABLE');
select pmtest.throws('B23 an accepted revision cannot be deleted',
  $q$ select set_config('prepmeds.api', '1', true); delete from prepmeds.evidence_revisions $q$, 'PREPMEDS_IMMUTABLE');
select pmtest.ok('B24 accepted is not ready: extraction, comparison and scenarios are done, tests are not',
  pmtest.st('ING-alphaxaban', 'm04_evidence_extracted') and pmtest.st('ING-alphaxaban', 'm05_guideline_comparison_completed')
  and pmtest.st('ING-alphaxaban', 'm06_scenario_coverage_completed') and not pmtest.st('ING-alphaxaban', 'm07_canonical_mapping_tested')
  and not pmtest.st('ING-alphaxaban', 'm08_evidence_tests_passed') and not pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review')
  and pmtest.blocked_by('ING-alphaxaban', 'EVIDENCE_TESTS_NOT_PASSED'), prepmeds.group_status('ING-alphaxaban')::text);

-- ═════ C. Test results come only from CI ═════════════════════════════════════════════
select pmtest.setv('h', to_jsonb(prepmeds._head('ING-alphaxaban')));
select pmtest.ok('C01 CI sees the untested revision as pending',
  (select count(*) from jsonb_array_elements(prepmeds.ci_pending_tests(pmtest.secret('ci'))) x where x->>'group_id' = 'ING-alphaxaban') = 1);
select pmtest.throws('C02 a worker token cannot record a test result',
  $q$ select prepmeds.ci_record_test_run(pmtest.secret('agent-1'), (pmtest.v('h')->>'revision_id')::bigint, pmtest.v('h')->>'content_sha256', 'evidence', 1, true, 5, 0, repeat('a', 40), 9001) $q$,
  'PREPMEDS_BAD_CI_TOKEN');
select pmtest.throws('C03 a result for different content than the revision is refused',
  $q$ select prepmeds.ci_record_test_run(pmtest.secret('ci'), (pmtest.v('h')->>'revision_id')::bigint, repeat('0', 64), 'evidence', 1, true, 5, 0, repeat('a', 40), 9002) $q$,
  'PREPMEDS_HASH_MISMATCH');
select pmtest.throws('C04 a "pass" with zero tests executed is refused',
  $q$ select prepmeds.ci_record_test_run(pmtest.secret('ci'), (pmtest.v('h')->>'revision_id')::bigint, pmtest.v('h')->>'content_sha256', 'evidence', 1, true, 0, 0, repeat('a', 40), 9003) $q$,
  'test_runs_total_check');
select pmtest.throws('C05 a "pass" that reports failures is refused',
  $q$ select prepmeds.ci_record_test_run(pmtest.secret('ci'), (pmtest.v('h')->>'revision_id')::bigint, pmtest.v('h')->>'content_sha256', 'evidence', 1, true, 5, 2, repeat('a', 40), 9004) $q$,
  'test_runs_pass_means_zero_failures');
select pmtest.ci('ING-alphaxaban', false, 9100);
select pmtest.ok('C06 a failing run returns the group to its lane as rework',
  (select status = 'available' and reason = 'ci_failed' from prepmeds.tasks where group_id = 'ING-alphaxaban' and status <> 'cancelled' order by task_id desc limit 1)
  and not pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review'));
select pmtest.setv('b1', pmtest.claim('agent-1'));
select pmtest.ok('C07 unfinished work first: the worker is handed the failed group before any new group',
  pmtest.v('b1')->'group'->>'group_id' = 'ING-alphaxaban' and pmtest.v('b1')->'task'->>'reason' = 'ci_failed'
  and (pmtest.v('b1')->>'based_on_revision_no')::int = 1 and pmtest.v('b1')->'task'->'detail'->'report' is not null, pmtest.v('b1')::text);
select pmtest.setv('accepted2', pmtest.submit('agent-1', pmtest.v('b1'), pmtest.v('disagree') || jsonb_build_object('based_on_revision_no', 1, 'conflicts',
   '[{"scenario_key":"high_risk_procedure","source_ids":["SOC-A-2016","SOC-B-2021"],"description":"SOC-A stratifies the hold by kidney function (1 to 3 days); SOC-B gives a flat 3 days."}]'::jsonb,
   'editorial', '{"notes":"second attempt"}'::jsonb)));
select pmtest.ok('C08 rework is stored as revision 2; revision 1 is still there',
  (pmtest.v('accepted2')->>'revision_no')::int = 2 and (select count(*) from prepmeds.evidence_revisions where group_id = 'ING-alphaxaban') = 2);
select pmtest.ok('C09 material content, not wording of notes, determines the hash: revisions 1 and 2 have the same hash',
  pmtest.v('accepted2')->>'content_sha256' = pmtest.v('accepted1')->>'content_sha256');
select pmtest.ci('ING-alphaxaban', true, 9101);
select pmtest.ok('C10 with real passing runs for both suites the group is ready for clinician review, and its task is done',
  pmtest.st('ING-alphaxaban', 'm07_canonical_mapping_tested') and pmtest.st('ING-alphaxaban', 'm08_evidence_tests_passed')
  and pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review')
  and (select status from prepmeds.tasks where group_id = 'ING-alphaxaban' order by task_id desc limit 1) = 'done', prepmeds.group_status('ING-alphaxaban')::text);
select pmtest.ok('C11 ready does not mean reviewed or released',
  not pmtest.st('ING-alphaxaban', 'm10_clinician_reviewed') and not pmtest.st('ING-alphaxaban', 'm11_patient_facing_authorized')
  and prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'false');
select pmtest.ok('C12 nothing is pending for CI once both suites are decided',
  (select count(*) from jsonb_array_elements(prepmeds.ci_pending_tests(pmtest.secret('ci'))) x where x->>'group_id' = 'ING-alphaxaban') = 0);
-- Automated source check: a quote that is not in the document blocks readiness until a later check verifies it.
select pmtest.setv('a_passage', (select to_jsonb(r.passage_id) from prepmeds.recommendations r where r.revision_id = (prepmeds._head('ING-alphaxaban')).revision_id limit 1));
select prepmeds.ci_record_passage_check(pmtest.secret('ci'), (pmtest.v('a_passage') #>> '{}')::bigint, 'not_found', 'quote not present in fetched document', 9102);
select pmtest.ok('C13 a quote the automated check cannot find in the source blocks readiness',
  not pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review') and pmtest.blocked_by('ING-alphaxaban', 'PASSAGE_FAILED_VERIFICATION'));
select prepmeds.ci_record_passage_check(pmtest.secret('ci'), (pmtest.v('a_passage') #>> '{}')::bigint, 'verified', 'found on page 4', 9103);
select pmtest.ok('C14 the latest check decides: once verified, the group is ready again', pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review'));

-- ═════ D. Clinician review and patient-facing release ════════════════════════════════
select pmtest.setv('hash', to_jsonb((prepmeds._head('ING-alphaxaban')).content_sha256));
select pmtest.setv('passages', (select to_jsonb(array_agg(distinct r.passage_id)) from prepmeds.recommendations r where r.revision_id = (prepmeds._head('ING-alphaxaban')).revision_id));
create or replace function pmtest.pids() returns bigint[] language sql stable as
$t$ select array_agg(v::bigint) from jsonb_array_elements_text(pmtest.v('passages')) v $t$;
select pmtest.sign_in(null);
select pmtest.throws('D01 Mark Reviewed without a signed-in clinician is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, pmtest.pids()) $q$, 'PREPMEDS_NOT_SIGNED_IN');
select pmtest.sign_in(pmtest.secret('outsider')::uuid);
select pmtest.throws('D02 a signed-in user who is not an allow-listed clinician is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, pmtest.pids()) $q$, 'PREPMEDS_NOT_A_CLINICIAN');
select pmtest.sign_in(pmtest.secret('clin_a')::uuid);
select pmtest.throws('D03 the right clinician with the wrong PIN is refused',
  $q$ select prepmeds.clin_mark_reviewed('wrong-pin', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, pmtest.pids()) $q$, 'PREPMEDS_BAD_PIN');
select pmtest.throws('D04 missing approval credential (no PIN) is refused',
  $q$ select prepmeds.clin_mark_reviewed(null, 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, pmtest.pids()) $q$, 'PREPMEDS_BAD_PIN');
select pmtest.throws('D05 approving content other than what is current is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', repeat('0', 64), true, pmtest.pids()) $q$, 'PREPMEDS_STALE_REVIEW_TARGET');
select pmtest.throws('D06 Mark Reviewed without the attestation is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', false, pmtest.pids()) $q$, 'PREPMEDS_ATTESTATION_REQUIRED');
select pmtest.throws('D07 Mark Reviewed without having checked every cited passage is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, (pmtest.pids())[1:1]) $q$, 'PREPMEDS_PASSAGES_NOT_VERIFIED');
select pmtest.ok('D08 none of the refused attempts created a review', (select count(*) from prepmeds.clinician_reviews) = 0);
select pmtest.throws('D09 release before any clinician review is refused',
  $q$ select prepmeds.clin_authorize_release('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true) $q$, 'PREPMEDS_NOT_CLINICIAN_REVIEWED');
select pmtest.setv('review1', prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true, pmtest.pids(), 'Synthetic exception note', null));
select pmtest.ok('D10 Mark Reviewed by the clinician records identity, time, exact hash and exceptions',
  (select r.clinician_id = pmtest.secret('clin_a')::uuid and r.content_sha256 = pmtest.v('hash') #>> '{}' and r.exceptions = 'Synthetic exception note' and r.reviewed_at is not null
   from prepmeds.clinician_reviews r where r.review_id = (pmtest.v('review1')->>'review_id')::bigint));
select pmtest.ok('D11 reviewed is not released: patient-facing guidance is still withheld',
  pmtest.st('ING-alphaxaban', 'm10_clinician_reviewed') and not pmtest.st('ING-alphaxaban', 'm11_patient_facing_authorized')
  and prepmeds.get_active_guidance('MED-alphaxaban')->>'reason' = 'NO_AUTHORIZED_GUIDANCE');
select pmtest.sign_in(pmtest.secret('clin_b')::uuid);
select pmtest.throws('D12 a clinician without release authority cannot authorize patient-facing use',
  $q$ select prepmeds.clin_authorize_release('pin-bravo-2', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true) $q$, 'PREPMEDS_CLINICIAN_CANNOT_RELEASE');
select pmtest.sign_in(pmtest.secret('clin_a')::uuid);
select pmtest.throws('D13 release without the explicit attestation is refused',
  $q$ select prepmeds.clin_authorize_release('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', false) $q$, 'PREPMEDS_ATTESTATION_REQUIRED');
select pmtest.setv('auth1', prepmeds.clin_authorize_release('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', true));
select pmtest.ok('D14 after explicit authorization, both canonical IDs of the group inherit the authorized revision',
  prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'true' and prepmeds.get_active_guidance('MED-alphaquis-starter')->>'authorized' = 'true'
  and prepmeds.get_active_guidance('MED-alphaxaban')->>'content_sha256' = pmtest.v('hash') #>> '{}'
  and jsonb_array_length(prepmeds.get_active_guidance('MED-alphaxaban')->'revision'->'recommendations') = 8);
select pmtest.ok('D15 a medication in another group gets nothing from it',
  prepmeds.get_active_guidance('MED-zetaparin')->>'authorized' = 'false' and prepmeds.get_active_guidance('MED-does-not-exist')->>'authorized' = 'false');
-- A later CI run fails on the released revision (for example after the test suite is tightened).
select pmtest.ci('ING-alphaxaban', false, 9200);
select pmtest.ok('D16 a failing run on a released revision withdraws patient-facing guidance at once and opens rework',
  prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'false'
  and (select status = 'available' and reason = 'ci_failed' from prepmeds.tasks where group_id = 'ING-alphaxaban' order by task_id desc limit 1));
select pmtest.ci('ING-alphaxaban', true, 9201);
select pmtest.ok('D17 when the re-run passes, the standing approval of the same content applies again and the rework closes',
  prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'true'
  and (select status from prepmeds.tasks where group_id = 'ING-alphaxaban' order by task_id desc limit 1) = 'done');
-- Material change: the clinician asks for changes, the worker submits different content.
select pmtest.setv('changes', prepmeds.clin_request_changes('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash') #>> '{}', 'Synthetic: re-check the SOC-B hold interval.'));
select pmtest.ok('D18 requesting changes withdraws the approval and the release, and opens rework for the owning lane',
  not pmtest.st('ING-alphaxaban', 'm10_clinician_reviewed') and not pmtest.st('ING-alphaxaban', 'm11_patient_facing_authorized')
  and prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'false'
  and (select reason from prepmeds.tasks where task_id = (pmtest.v('changes')->>'task_id')::bigint) = 'changes_requested');
select pmtest.setv('b1', pmtest.claim('agent-1'));
select pmtest.setv('accepted3', pmtest.submit('agent-1', pmtest.v('b1'), pmtest.replace_recs(pmtest.v('disagree'), 'SOC-B-2021', 'high_risk_procedure',
      '[{"source_id":"SOC-B-2021","passage":"p-SOC-B-2021","scenario_key":"high_risk_procedure","action":"hold","hold":{"min":4,"max":4,"unit":"days"},"summary":"Synthetic: corrected to four days."}]')
   || jsonb_build_object('based_on_revision_no', 2, 'conflicts',
   '[{"scenario_key":"high_risk_procedure","source_ids":["SOC-A-2016","SOC-B-2021"],"description":"SOC-A stratifies the hold by kidney function (1 to 3 days); SOC-B gives a flat 4 days."}]'::jsonb)));
select pmtest.ci('ING-alphaxaban', true, 9300);
select pmtest.ok('D19 evidence-revision invalidation: the changed revision is ready but carries no approval and no release',
  (pmtest.v('accepted3')->>'revision_no')::int = 3 and pmtest.v('accepted3')->>'content_sha256' <> pmtest.v('hash') #>> '{}'
  and pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review') and not pmtest.st('ING-alphaxaban', 'm10_clinician_reviewed')
  and not pmtest.st('ING-alphaxaban', 'm11_patient_facing_authorized') and prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'false');
select pmtest.ok('D20 the earlier approval is preserved in the record, not deleted',
  (select count(*) from prepmeds.clinician_reviews where group_id = 'ING-alphaxaban' and decision = 'reviewed' and content_sha256 = pmtest.v('hash') #>> '{}') = 1
  and (select count(*) from prepmeds.release_authorizations where group_id = 'ING-alphaxaban') = 1 and (select count(*) from prepmeds.revocations) = 2);
select pmtest.setv('hash3', to_jsonb((prepmeds._head('ING-alphaxaban')).content_sha256));
select pmtest.setv('review3', prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash3') #>> '{}', true, null));
select pmtest.ok('D21 passages the clinician already checked stay checked, so re-review needs no re-ticking of unchanged passages',
  pmtest.st('ING-alphaxaban', 'm10_clinician_reviewed') and not pmtest.st('ING-alphaxaban', 'm11_patient_facing_authorized'));
select prepmeds.clin_authorize_release('pin-alpha-1', 'ING-alphaxaban', pmtest.v('hash3') #>> '{}', true);
select pmtest.sign_in(null);

-- A group whose package is accepted but untested cannot be reviewed.
select pmtest.setv('z', pmtest.claim('agent-1'));
select pmtest.setv('z_acc', pmtest.submit('agent-1', pmtest.v('z'), pmtest.package('ING-zetaparin')));
select pmtest.sign_in(pmtest.secret('clin_a')::uuid);
select pmtest.throws('D22 Mark Reviewed on a revision whose tests have not passed is refused',
  $q$ select prepmeds.clin_mark_reviewed('pin-alpha-1', 'ING-zetaparin', (prepmeds._head('ING-zetaparin')).content_sha256, true,
        (select array_agg(distinct r.passage_id) from prepmeds.recommendations r where r.revision_id = (prepmeds._head('ING-zetaparin')).revision_id)) $q$,
  'PREPMEDS_NOT_READY_FOR_REVIEW');
select pmtest.sign_in(null);
select pmtest.ci('ING-zetaparin', true, 9400);

-- ═════ E. Clinically distinct formulations ═══════════════════════════════════════════
select pmtest.setv('ep', pmtest.claim('agent-1'));
select pmtest.ok('E01 the odd-lane combination is skipped while its even-lane component has no evidence; the next single group is offered',
  pmtest.v('ep')->'group'->>'group_id' = 'ING-epsilon', pmtest.v('ep')::text);
select pmtest.rejected('E02 one package for products that differ in route and release needs an explicit rationale',
  pmtest.submit('agent-1', pmtest.v('ep'), pmtest.package('ING-epsilon', '{"formulation":{"decision":"single_unit","rationale":"same drug"}}')), 'FORMULATION_RATIONALE_REQUIRED');
select pmtest.rejected('E03 declaring that a split is needed is not a way to finish the group',
  pmtest.submit('agent-1', pmtest.v('ep'), pmtest.package('ING-epsilon', '{"formulation":{"decision":"split_required","rationale":"tablet and depot injection need different instructions"}}')), 'SPLIT_REQUIRED');
select pmtest.throws('E04 a split that drops a canonical ID is refused',
  $q$ select prepmeds.propose_split(pmtest.secret('agent-1'), (pmtest.v('ep')->>'session_id')::bigint, (pmtest.v('ep')->'task'->>'task_id')::bigint, (pmtest.v('ep')->'task'->>'claim_token')::uuid,
        '[{"suffix":"oral","medication_ids":["MED-epsilon-tablet"]},{"suffix":"depot","medication_ids":[]}]', 'Synthetic: the oral tablet and the depot injection have different timing.') $q$,
  'PREPMEDS_SPLIT_INVALID');
select pmtest.setv('split', prepmeds.propose_split(pmtest.secret('agent-1'), (pmtest.v('ep')->>'session_id')::bigint, (pmtest.v('ep')->'task'->>'task_id')::bigint, (pmtest.v('ep')->'task'->>'claim_token')::uuid,
        '[{"suffix":"oral","medication_ids":["MED-epsilon-tablet"]},{"suffix":"depot","medication_ids":["MED-epsilon-depot"]}]', 'Synthetic: the oral tablet and the depot injection have different timing.'));
select pmtest.ok('E05 the split creates two review groups in the same bucket and lane, retires the parent and moves each canonical ID',
  (select count(*) from prepmeds.review_groups where parent_group_id = 'ING-epsilon' and bucket = 3 and lane = 'odd' and retired_at is null) = 2
  and (select retired_reason from prepmeds.review_groups where group_id = 'ING-epsilon') = 'split'
  and (select group_id from prepmeds.medication_group_map where medication_id = 'MED-epsilon-depot') = 'ING-epsilon|depot'
  and (select group_id from prepmeds.medication_group_map where medication_id = 'MED-epsilon-tablet') = 'ING-epsilon|oral');
select pmtest.ok('E06 after the split the inventory still reconciles: 12 canonical IDs, 10 active groups, no gaps, a task for each child',
  (prepmeds.get_progress()->>'canonical_ids_active')::int = 12 and (prepmeds.get_progress()->>'review_groups')::int = 10
  and (prepmeds.get_progress()->>'inventory_gaps')::int = 0
  and (select count(*) from prepmeds.tasks t join prepmeds.review_groups g using (group_id) where g.parent_group_id = 'ING-epsilon' and t.status = 'available') = 2,
  prepmeds.get_progress()::text);

-- ═════ F. Combination products ═══════════════════════════════════════════════════════
select pmtest.setv('f_acc', pmtest.submit('agent-2', pmtest.v('e1'), pmtest.package('ING-betaformin')));
select pmtest.ok('F01 the even lane finishes its first component', pmtest.v('f_acc')->>'accepted' = 'true', pmtest.v('f_acc')::text);
select pmtest.ci('ING-betaformin', true, 9500);
select pmtest.make_ready('agent-2', 'ING-gammagliptin');
select pmtest.ok('F02 once both components have evidence the combination becomes claimable', prepmeds._deps_ready('ING-betaformin+ING-gammagliptin'));
select pmtest.setv('combo', pmtest.claim('agent-2'));
select pmtest.ok('F03 the combination brief names each ingredient and the component revision to pin',
  pmtest.v('combo')->'group'->>'group_id' = 'ING-betaformin+ING-gammagliptin' and jsonb_array_length(pmtest.v('combo')->'components') = 2
  and (pmtest.v('combo')->'components'->0->'standalone_groups'->0->>'head_revision_no')::int = 1, pmtest.v('combo')::text);
select pmtest.rejected('F04 a combination treated as if it were a single ingredient (no components pinned) is rejected',
  pmtest.submit('agent-2', pmtest.v('combo'), pmtest.package('ING-betaformin+ING-gammagliptin', '{"components":[]}')), 'COMPONENT_NOT_PINNED:ING-betaformin');
select pmtest.rejected('F05 pinning only one of two ingredients is rejected',
  pmtest.submit('agent-2', pmtest.v('combo'), pmtest.package('ING-betaformin+ING-gammagliptin', '{"components":[{"group_id":"ING-betaformin","revision_no":1}]}')), 'COMPONENT_NOT_PINNED:ING-gammagliptin');
select pmtest.rejected('F06 pinning a component revision that does not exist is rejected',
  pmtest.submit('agent-2', pmtest.v('combo'), pmtest.package('ING-betaformin+ING-gammagliptin', '{"components":[{"group_id":"ING-betaformin","revision_no":7},{"group_id":"ING-gammagliptin","revision_no":1}]}')), 'COMPONENT[ING-betaformin]');
select pmtest.setv('combo_acc', pmtest.submit('agent-2', pmtest.v('combo'), pmtest.package('ING-betaformin+ING-gammagliptin')));
select pmtest.ci('ING-betaformin+ING-gammagliptin', true, 9600);
select pmtest.ok('F07 a combination that pins the current revision of every component is accepted and becomes ready',
  pmtest.v('combo_acc')->>'accepted' = 'true' and pmtest.st('ING-betaformin+ING-gammagliptin', 'm09_ready_for_clinician_review'), pmtest.v('combo_acc')::text);
-- The component changes afterwards.
select pmtest.sign_in(pmtest.secret('clin_a')::uuid);
select prepmeds.clin_request_changes('pin-alpha-1', 'ING-betaformin', (prepmeds._head('ING-betaformin')).content_sha256, 'Synthetic: revise the day-of-procedure wording.');
select pmtest.sign_in(null);
select pmtest.setv('bf2', pmtest.claim('agent-2'));
select pmtest.setv('bf2_acc', pmtest.submit('agent-2', pmtest.v('bf2'), pmtest.replace_recs(pmtest.package('ING-betaformin'), 'SOC-A-2016', 'day_of_procedure',
      '[{"source_id":"SOC-A-2016","passage":"p-SOC-A-2016","scenario_key":"day_of_procedure","action":"hold","timing_text":"Synthetic: omit the morning dose.","summary":"Synthetic: hold on the morning of the procedure."}]')));
select pmtest.ok('F08 when a component gets a new revision, the combination stops being ready and is queued for rework',
  (pmtest.v('bf2_acc')->>'revision_no')::int = 2 and not pmtest.st('ING-betaformin+ING-gammagliptin', 'm09_ready_for_clinician_review')
  and pmtest.blocked_by('ING-betaformin+ING-gammagliptin', 'COMPONENT_REVISION_OUT_OF_DATE')
  and (select reason from prepmeds.tasks where group_id = 'ING-betaformin+ING-gammagliptin' and status = 'available') = 'component_changed',
  prepmeds.group_status('ING-betaformin+ING-gammagliptin')::text);
select pmtest.ci('ING-betaformin', true, 9700);
-- Cross-lane dependency: the odd-lane combination needs the even-lane component, and one ingredient has no standalone group.
select pmtest.setv('oc', pmtest.claim('agent-1'));
select pmtest.ok('F09 the odd-lane combination becomes claimable once the even-lane component has evidence',
  pmtest.v('oc')->'group'->>'group_id' = 'ING-betaformin+ING-deltaflozin', pmtest.v('oc')::text);
select pmtest.rejected('F10 an ingredient with no standalone review group must be accounted for inside the combination package',
  pmtest.submit('agent-1', pmtest.v('oc'), pmtest.package('ING-betaformin+ING-deltaflozin', '{"ingredient_coverage":[]}')), 'INGREDIENT_UNACCOUNTED:ING-deltaflozin');
select pmtest.setv('oc_acc', pmtest.submit('agent-1', pmtest.v('oc'), pmtest.package('ING-betaformin+ING-deltaflozin')));
select pmtest.ok('F11 the odd worker may pin the even lane''s component revision without being able to change it',
  pmtest.v('oc_acc')->>'accepted' = 'true'
  and (select rc.component_revision_id = (prepmeds._head('ING-betaformin')).revision_id from prepmeds.revision_components rc where rc.revision_id = (pmtest.v('oc_acc')->>'revision_id')::bigint),
  pmtest.v('oc_acc')::text);

-- ═════ G. Inventory changes and canonical-ID accounting ══════════════════════════════
create table pmtest.inv2 as select '{"medications":[
  {"medicationId":"MED-alphaxaban","canonicalName":"Alphaxaban","ingredientIds":["ING-alphaxaban"],"route":"oral","dosageForm":"tablet","brandNames":["Alphaquis"]},
  {"medicationId":"MED-alphaquis-starter","canonicalName":"Alphaquis starter pack","ingredientIds":["ING-alphaxaban"],"route":"oral","dosageForm":"tablet","brandNames":["Alphaquis"]},
  {"medicationId":"MED-alphaxaban-odt","canonicalName":"Alphaxaban orally disintegrating tablet","ingredientIds":["ING-alphaxaban"],"route":"oral","dosageForm":"odt"},
  {"medicationId":"MED-betaformin","canonicalName":"Betaformin","ingredientIds":["ING-betaformin"],"route":"oral","dosageForm":"tablet","releaseType":"immediate"},
  {"medicationId":"MED-betaformin-xr","canonicalName":"Betaformin XR","ingredientIds":["ING-betaformin"],"route":"oral","dosageForm":"tablet","releaseType":"extended"},
  {"medicationId":"MED-gammagliptin","canonicalName":"Gammagliptin","ingredientIds":["ING-gammagliptin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-betagamma","canonicalName":"Betagamma","ingredientIds":["ING-gammagliptin","ING-betaformin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-betadelta","canonicalName":"Betadelta","ingredientIds":["ING-betaformin","ING-deltaflozin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-epsilon-tablet","canonicalName":"Epsilon tablet","ingredientIds":["ING-epsilon"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-epsilon-depot","canonicalName":"Epsilon depot injection","ingredientIds":["ING-epsilon"],"route":"intramuscular","dosageForm":"injection","releaseType":"extended"},
  {"medicationId":"MED-epsilon-patch","canonicalName":"Epsilon patch","ingredientIds":["ING-epsilon"],"route":"transdermal","dosageForm":"patch"},
  {"medicationId":"MED-zetaparin","canonicalName":"Zetaparin","ingredientIds":["ING-zetaparin"],"route":"subcutaneous","dosageForm":"injection"},
  {"medicationId":"MED-thetastatin","canonicalName":"Thetastatin","ingredientIds":["ING-thetastatin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-iotamab","canonicalName":"Iotamab","ingredientIds":["ING-iotamab"],"brandNames":["Alphaquis"]},
  {"medicationId":"MED-iotamab-pen","canonicalName":"Iotamab pen","ingredientIds":["ING-iotamab"]}]}'::jsonb as p;
select pmtest.setv('sync2', prepmeds.ci_sync_inventory(pmtest.secret('ci'), repeat('2', 40), (select p from pmtest.inv2)));
select pmtest.ok('G02 the sync reports exactly what changed: 4 added, 1 removed, 1 new group, 1 ID needing placement, 1 rework',
  (pmtest.v('sync2')->>'added')::int = 4 and (pmtest.v('sync2')->>'deactivated')::int = 1 and (pmtest.v('sync2')->>'groups_created')::int = 1
  and (pmtest.v('sync2')->>'needs_placement')::int = 1 and (pmtest.v('sync2')->>'rework_tasks_opened')::int = 1, pmtest.v('sync2')::text);
select pmtest.ok('G03 re-sending the same inventory is a no-op',
  prepmeds.ci_sync_inventory(pmtest.secret('ci'), repeat('2', 40), (select p from pmtest.inv2))->>'replayed' = 'true'
  and (select count(*) from prepmeds.inventory_syncs) = 2);
select pmtest.ok('G04 every way the inventory fails to reconcile is listed, none silently',
  (select array_agg(gap || ':' || subject order by gap, subject) from prepmeds.inventory_gaps) = array[
    'ALIAS_AMBIGUOUS:alphaquis', 'GROUP_EMPTY:ING-etaprazole', 'GROUP_UNASSIGNED:ING-iotamab', 'MEDICATION_UNMAPPED:MED-epsilon-patch',
    'REVISION_MAPPING_STALE:ING-alphaxaban'],
  (select string_agg(gap || ':' || subject, ' | ' order by gap, subject) from prepmeds.inventory_gaps));
select pmtest.ok('G05 a canonical ID added after approval is not covered by it; the IDs that were approved still are',
  prepmeds.get_active_guidance('MED-alphaxaban-odt')->>'reason' = 'MEDICATION_NOT_COVERED_BY_AUTHORIZED_REVISION'
  and prepmeds.get_active_guidance('MED-alphaxaban')->>'authorized' = 'true');
select pmtest.ok('G06 the group is no longer "mapping tested" or "ready" until a revision covers the new ID',
  not pmtest.st('ING-alphaxaban', 'm07_canonical_mapping_tested') and not pmtest.st('ING-alphaxaban', 'm09_ready_for_clinician_review')
  and pmtest.blocked_by('ING-alphaxaban', 'CANONICAL_MAPPING_CHANGED_SINCE_REVISION')
  and (select reason from prepmeds.tasks where group_id = 'ING-alphaxaban' and status = 'available') = 'mapping_changed');
select pmtest.sign_in(pmtest.secret('clin_a')::uuid);
select prepmeds.clin_record_exception('pin-alpha-1', 'MED-epsilon-patch', 'Synthetic: not used in the outpatient endoscopy population.');
select pmtest.sign_in(null);
select pmtest.ok('G07 an exception recorded by a clinician with a reason closes that gap and is counted, not hidden',
  not exists (select 1 from prepmeds.inventory_gaps where subject = 'MED-epsilon-patch') and (prepmeds.get_progress()->>'canonical_ids_excepted')::int = 1);
select pmtest.throws('G08 moving a group to another bucket without a written reason is refused',
  $q$ select prepmeds.admin_assign_groups('[{"group_id":"ING-thetastatin","bucket":2}]') $q$, 'PREPMEDS_REASSIGNMENT_NEEDS_REASON');
select prepmeds.admin_assign_groups('[{"group_id":"ING-iotamab","bucket":4}]');
select prepmeds.admin_open_initial_tasks();
select pmtest.ok('G09 assigning the new group gives it a lane and a task',
  (select lane from prepmeds.review_groups where group_id = 'ING-iotamab') = 'even'
  and (select status from prepmeds.tasks where group_id = 'ING-iotamab') = 'available');
select pmtest.ok('G10 products whose route and dose form the inventory does not record still need a formulation rationale, and are counted',
  exists (select 1 from unnest(prepmeds._validate(0, 'ING-iotamab', '{"decision":"single_unit","rationale":"same drug"}'::jsonb)) x
          where x like 'FORMULATION_RATIONALE_REQUIRED%')
  and not exists (select 1 from unnest(prepmeds._validate(0, 'ING-iotamab',
          '{"decision":"single_unit","rationale":"Synthetic: both products are the same subcutaneous injection and differ only in the device."}'::jsonb)) x
          where x like 'FORMULATION_RATIONALE_REQUIRED%')
  and (prepmeds.get_progress()->>'canonical_ids_without_route_or_form')::int = 2,
  prepmeds.get_progress()->>'canonical_ids_without_route_or_form');

-- ═════ H. Leases and retries ═════════════════════════════════════════════════════════
insert into pmtest.secrets select 'agent-1b', prepmeds.admin_create_worker('agent-1b', 'odd', null);
select prepmeds.release_task(pmtest.secret('agent-1'), (pmtest.v('oc')->>'session_id')::bigint, t.task_id, t.claim_token, 'SESSION_ENDING')
  from prepmeds.tasks t where t.claimed_by = 'agent-1' and t.status = 'claimed';
select prepmeds.admin_set_setting('lease_minutes', '0');
select pmtest.setv('l1', pmtest.claim('agent-1'));
select prepmeds.save_progress(pmtest.secret('agent-1'), (pmtest.v('l1')->>'session_id')::bigint, (pmtest.v('l1')->'task'->>'task_id')::bigint,
         (pmtest.v('l1')->'task'->>'claim_token')::uuid, '{"note":"half done when the session died"}');
select pg_sleep(0.05);
select pmtest.setv('l2', pmtest.claim('agent-1b'));
select pmtest.ok('H01 expired lease: another worker of the same lane takes the task over, as attempt 2, with the saved progress',
  pmtest.v('l2')->'task'->>'task_id' = pmtest.v('l1')->'task'->>'task_id' and (pmtest.v('l2')->'task'->>'attempt')::int = 2
  and pmtest.v('l2')->'task'->'saved_progress'->>'note' = 'half done when the session died', pmtest.v('l2')::text);
select pmtest.throws('H02 the worker whose lease expired can no longer submit for that task',
  $q$ select pmtest.submit('agent-1', pmtest.v('l1'), pmtest.package(pmtest.v('l1')->'group'->>'group_id')) $q$, 'PREPMEDS_NOT_CLAIM_HOLDER');
select pg_sleep(0.05);
select pmtest.setv('l3', pmtest.claim('agent-1'));
select pg_sleep(0.05);
select pmtest.setv('l4', pmtest.claim('agent-1b'));
select pmtest.ok('H03 after the configured number of failed attempts the task is blocked for a person, not retried forever',
  (select status = 'blocked' and blocked_reason = 'ATTEMPTS_EXHAUSTED' and attempt = 3 from prepmeds.tasks where task_id = (pmtest.v('l1')->'task'->>'task_id')::bigint)
  and jsonb_array_length(prepmeds.get_progress()->'blocked_tasks') = 1
  and pmtest.v('l4')->'task'->>'task_id' is distinct from pmtest.v('l1')->'task'->>'task_id',
  (select row_to_json(t)::text from prepmeds.tasks t where task_id = (pmtest.v('l1')->'task'->>'task_id')::bigint));
select prepmeds.admin_set_setting('lease_minutes', '90');
select prepmeds.admin_unblock_task((pmtest.v('l1')->'task'->>'task_id')::bigint, 'synthetic: retry allowed');
select prepmeds.release_task(pmtest.secret(t.claimed_by), s.session_id, t.task_id, t.claim_token, 'SESSION_ENDING')
  from prepmeds.tasks t join prepmeds.sessions s on s.worker_id = t.claimed_by and s.ended_at is null where t.status = 'claimed';
select pmtest.ok('H04 every lease expiry, block and unblock is in the audit log',
  (select count(*) from prepmeds.events where event_type = 'lease_expired') = 2 and (select count(*) from prepmeds.events where event_type = 'task_blocked') = 1
  and (select count(*) from prepmeds.events where event_type = 'task_unblocked') = 1);

-- ═════ I. Session reporting from stored rows ═════════════════════════════════════════
select pmtest.setv('s2', prepmeds.start_session(pmtest.secret('agent-2'), 'throughput check'));
select pmtest.setv('t1', prepmeds.claim_next(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint) || jsonb_build_object('session_id', (pmtest.v('s2')->>'session_id')::bigint));
select pmtest.setv('t1_rej', pmtest.submit('agent-2', pmtest.v('t1'), pmtest.package(pmtest.v('t1')->'group'->>'group_id', '{"scenario_coverage":[]}')));
select pmtest.setv('t1_acc', pmtest.submit('agent-2', pmtest.v('t1'), pmtest.package(pmtest.v('t1')->'group'->>'group_id')));
select pmtest.setv('rep_before', prepmeds.session_report(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint));
select pmtest.ok('I01 an accepted but untested revision counts as accepted, not as a completed group',
  (pmtest.v('rep_before')->>'revisions_accepted')::int = 1 and (pmtest.v('rep_before')->>'groups_ready_for_clinician_review')::int = 0
  and (pmtest.v('rep_before')->>'shortfall')::int = 10 and (pmtest.v('rep_before')->>'submissions_rejected')::int = 1
  and (pmtest.v('rep_before')->>'revisions_awaiting_ci')::int = 1, pmtest.v('rep_before')::text);
select pmtest.ci(pmtest.v('t1')->'group'->>'group_id', true, 9800);
select pmtest.setv('rep_after', prepmeds.session_report(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint));
select pmtest.ok('I02 the completed count rises only when CI has passed: 1 of 10, shortfall 9, reported as such',
  (pmtest.v('rep_after')->>'groups_ready_for_clinician_review')::int = 1 and (pmtest.v('rep_after')->>'shortfall')::int = 9
  and (pmtest.v('rep_after')->>'target_ready_groups')::int = 10, pmtest.v('rep_after')::text);
select pmtest.setv('t2', prepmeds.claim_next(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint) || jsonb_build_object('session_id', (pmtest.v('s2')->>'session_id')::bigint));
select pmtest.throws('I03 giving up on a group needs a reason a person can act on',
  $q$ select prepmeds.release_task(pmtest.secret('agent-2'), (pmtest.v('t2')->>'session_id')::bigint, (pmtest.v('t2')->'task'->>'task_id')::bigint, (pmtest.v('t2')->'task'->>'claim_token')::uuid, 'SOURCE_INACCESSIBLE', 'paywall') $q$,
  'PREPMEDS_RELEASE_NEEDS_NOTE');
select prepmeds.release_task(pmtest.secret('agent-2'), (pmtest.v('t2')->>'session_id')::bigint, (pmtest.v('t2')->'task'->>'task_id')::bigint, (pmtest.v('t2')->'task'->>'claim_token')::uuid,
         'SOURCE_INACCESSIBLE', 'Synthetic: the only society statement is behind a paywall the worker cannot open.');
select pmtest.ok('I04 a blocked group is visible with its reason and is not offered again until a person unblocks it',
  (select blocked_reason like 'SOURCE_INACCESSIBLE:%' from prepmeds.tasks where task_id = (pmtest.v('t2')->'task'->>'task_id')::bigint)
  and (prepmeds.claim_next(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint)->'task'->>'task_id') is distinct from pmtest.v('t2')->'task'->>'task_id');

-- ═════ J. GitHub relay: the same protocol for a worker that can only write to GitHub ═
select pmtest.throws('J01 a relay request from an unregistered GitHub login is refused',
  $q$ select prepmeds.ci_relay(pmtest.secret('ci'), 'somebody-else', 'odd', '{"op":"start_session"}') $q$, 'PREPMEDS_UNKNOWN_WORKER');
select pmtest.throws('J02 the odd lane''s GitHub identity cannot write to the even lane',
  $q$ select prepmeds.ci_relay(pmtest.secret('ci'), 'odd-bot', 'even', '{"op":"start_session"}') $q$, 'PREPMEDS_LANE_VIOLATION');
select pmtest.throws('J03 the relay needs the CI credential; a worker token is not enough',
  $q$ select prepmeds.ci_relay(pmtest.secret('agent-1'), 'odd-bot', 'odd', '{"op":"start_session"}') $q$, 'PREPMEDS_BAD_CI_TOKEN');
select pmtest.setv('r_s', prepmeds.ci_relay(pmtest.secret('ci'), 'odd-bot', 'odd', '{"op":"start_session","label":"relay"}'));
select pmtest.setv('r_c', prepmeds.ci_relay(pmtest.secret('ci'), 'odd-bot', 'odd', jsonb_build_object('op', 'claim', 'session_id', pmtest.v('r_s')->>'session_id')));
select pmtest.setv('r_sub', prepmeds.ci_relay(pmtest.secret('ci'), 'odd-bot', 'odd', jsonb_build_object('op', 'submit', 'session_id', pmtest.v('r_s')->>'session_id',
   'task_id', pmtest.v('r_c')->'task'->>'task_id', 'claim_token', pmtest.v('r_c')->'task'->>'claim_token', 'submission_id', repeat('c', 40),
   'git_commit', repeat('c', 40), 'package', pmtest.package(pmtest.v('r_c')->'group'->>'group_id'))));
select pmtest.ok('J04 a full claim-and-submit cycle through the relay is accepted and records the submitting commit',
  pmtest.v('r_c')->>'status' in ('CLAIMED', 'RESUMED') and pmtest.v('r_c')->'group'->>'lane' = 'odd' and pmtest.v('r_sub')->>'accepted' = 'true'
  and (select git_commit from prepmeds.evidence_revisions where revision_id = (pmtest.v('r_sub')->>'revision_id')::bigint) = repeat('c', 40), pmtest.v('r_sub')::text);
select pmtest.ok('J05 re-running the relay for the same commit does not create a second revision',
  prepmeds.ci_relay(pmtest.secret('ci'), 'odd-bot', 'odd', jsonb_build_object('op', 'submit', 'session_id', pmtest.v('r_s')->>'session_id',
   'task_id', pmtest.v('r_c')->'task'->>'task_id', 'claim_token', pmtest.v('r_c')->'task'->>'claim_token', 'submission_id', repeat('c', 40),
   'package', pmtest.package(pmtest.v('r_c')->'group'->>'group_id')))->>'replayed' = 'true');

-- ═════ K. Professional-society guidance governs; a drug label is never a gate ════════
select pmtest.throws('K01 a drug label cannot be made a required comparator',
  $q$ select prepmeds.admin_upsert_domain('{"domain_key":"t_label_gate","label":"x","required_sources":["LABEL-X"]}') $q$, 'PREPMEDS_LABEL_IS_NOT_A_GATE');
select pmtest.setv('k', prepmeds.claim_next(pmtest.secret('agent-2'), (pmtest.v('s2')->>'session_id')::bigint) || jsonb_build_object('session_id', (pmtest.v('s2')->>'session_id')::bigint));
select pmtest.setv('k_pkg', pmtest.package(pmtest.v('k')->'group'->>'group_id'));
select pmtest.rejected('K02 a package whose only source is a drug label is rejected',
  pmtest.submit('agent-2', pmtest.v('k'), (select replace(pmtest.v('k_pkg')::text, 'SOC-A-2016', 'LABEL-X')::jsonb)), 'NO_SOCIETY_SOURCE_CHECKED');
select pmtest.rejected('K03 "no society addresses this drug" needs at least two society sources checked',
  pmtest.submit('agent-2', pmtest.v('k'), pmtest.v('k_pkg') || jsonb_build_object('passages', '[]'::jsonb, 'recommendations', '[]'::jsonb,
     'comparisons', '[{"source_id":"SOC-A-2016","status":"NOT_ADDRESSED","checked_locators":"Searched the full text for the drug name and its class; tables 1 to 9"}]'::jsonb,
     'scenario_coverage', (select jsonb_agg(c || '{"status":"NO_SOURCE_GUIDANCE","reason":"No society guidance found for this scenario."}'::jsonb) from jsonb_array_elements(pmtest.v('k_pkg')->'scenario_coverage') c))),
  'ABSENCE_NEEDS_TWO_SOCIETY_SOURCES');
select pmtest.setv('k_acc', pmtest.submit('agent-2', pmtest.v('k'), pmtest.v('k_pkg') || jsonb_build_object('passages', '[]'::jsonb, 'recommendations', '[]'::jsonb,
     'comparisons', '[{"source_id":"SOC-A-2016","status":"NOT_ADDRESSED","checked_locators":"Searched the full text for the drug name and its class; tables 1 to 9"},
                      {"source_id":"SOC-C-2022","status":"NOT_ADDRESSED","checked_locators":"Searched sections 2 to 6 and the appendix medication list"}]'::jsonb,
     'scenario_coverage', (select jsonb_agg(c || '{"status":"NO_SOURCE_GUIDANCE","reason":"No society guidance found for this scenario."}'::jsonb) from jsonb_array_elements(pmtest.v('k_pkg')->'scenario_coverage') c))));
select pmtest.ok('K04 an explicit, documented absence of guidance is a valid evidence package (never an invented recommendation)',
  pmtest.v('k_acc')->>'accepted' = 'true' and pmtest.st(pmtest.v('k')->'group'->>'group_id', 'm04_evidence_extracted')
  and pmtest.st(pmtest.v('k')->'group'->>'group_id', 'm05_guideline_comparison_completed')
  and (select count(*) from prepmeds.recommendations where revision_id = (pmtest.v('k_acc')->>'revision_id')::bigint) = 0, pmtest.v('k_acc')::text);

-- ═════ L. Audit trail and tamper evidence ════════════════════════════════════════════
select pmtest.setv('integrity', prepmeds.verify_integrity());
select pmtest.ok('L01 the audit chain and every revision hash verify after all of the above',
  (pmtest.v('integrity')->>'ok')::boolean and (pmtest.v('integrity')->>'events_checked')::int > 80, pmtest.v('integrity')::text);
select pmtest.ok('L02 every accepted revision, test run, review and release has its event',
  (select count(*) from prepmeds.evidence_revisions) = (select count(*) from prepmeds.events where event_type = 'revision_accepted')
  and (select count(*) from prepmeds.test_runs) = (select count(*) from prepmeds.events where event_type in ('tests_passed', 'tests_failed'))
  and (select count(*) from prepmeds.clinician_reviews) = (select count(*) from prepmeds.events where event_type in ('clinician_reviewed', 'changes_requested'))
  and (select count(*) from prepmeds.release_authorizations) = (select count(*) from prepmeds.events where event_type = 'release_authorized'));
-- Tampering by someone with owner access: disable the triggers and edit accepted evidence, or delete an audit row.
begin;
alter table prepmeds.recommendations disable trigger user;
update prepmeds.recommendations set hold_min = 9, hold_max = 9 where rec_id = (select min(rec_id) from prepmeds.recommendations where hold_min is not null);
select prepmeds.verify_integrity() as tampered \gset
rollback;
select pmtest.ok('L03 evidence edited behind the API is detected: the revision no longer matches its hash, and the disabled trigger is reported',
  :'tampered'::jsonb->>'ok' = 'false' and :'tampered'::jsonb->'problems' @? '$[*] ? (@ like_regex "REVISION_CONTENT_DOES_NOT_MATCH_HASH")'
  and :'tampered'::jsonb->'problems' @? '$[*] ? (@ like_regex "TRIGGER_DISABLED")', :'tampered');
begin;
alter table prepmeds.events disable trigger user;
delete from prepmeds.events where event_id = (select event_id from prepmeds.events order by event_id offset 20 limit 1);
select prepmeds.verify_integrity() as tampered2 \gset
rollback;
select pmtest.ok('L04 a deleted audit event breaks the hash chain and is detected',
  :'tampered2'::jsonb->>'ok' = 'false' and :'tampered2'::jsonb->'problems' @? '$[*] ? (@ like_regex "EVENT_CHAIN_BROKEN")', :'tampered2');
select pmtest.ok('L05 after rolling the tampering back, integrity verifies again', (prepmeds.verify_integrity()->>'ok')::boolean);
\o
