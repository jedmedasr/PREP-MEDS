"""Expanded real PostgreSQL contract tests; fixture evidence is NOT clinical verification."""
import concurrent.futures
import subprocess
import unittest
import json
import test_ledger as support
sql,parse,quote,js=support.sql,support.parse,support.quote,support.js
fixture_catalog,evidence=support.fixture_catalog,support.evidence
COMMIT,MIGRATIONS,ART=support.COMMIT,support.MIGRATIONS,support.ART

class ExtendedLedgerTests(support.LedgerTests):
    def test_status_uses_database_identity_clock_and_lane(self):
        status=self.call('a1','status')
        self.assertEqual(status['agent'],'A');self.assertEqual(status['lane'],'odd')
        self.assertEqual(status['states'],{'QUEUED':1});self.assertEqual(status['canonical_ids'],1)
        self.assertIn('observed_at_utc',status);self.assertFalse(status['patient_facing_authorized'])
        self.assertEqual(status['identity_id'],'extractor-1')

    def test_request_replay_does_not_authorize_duplicate_worker(self):
        first=self.claim(key='stable-request-key');second=self.claim(key='stable-request-key')
        self.assertTrue(first['execution_authorized']);self.assertFalse(second['execution_authorized'])
        self.assertTrue(second['replayed']);self.assertEqual(first['run']['run_id'],second['run']['run_id'])
        self.fails('a1','claim',{'idempotency_key':'different-request-key'},'PRINCIPAL_ALREADY_HAS_ACTIVE_EXECUTION')

    def test_context_required_and_lease_renewal(self):
        a=self.claim()['run'];payload={'run_id':a['run_id'],'context_id':a['context_id'],'lease_seconds':3600}
        self.fails('a1','renew',{**payload,'context_id':'wrong'},'EXECUTION_CONTEXT_MISMATCH')
        renewed=self.call('a1','renew',payload)['run'];self.assertGreaterEqual(renewed['lease_until'],a['lease_until'])
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.custody_events where event_type='LEASE_RENEWED'"),'1')

    def test_b_priority_prevents_new_a_claim(self):
        self.seed(2);a=self.claim()['run'];self.submit(a)
        reply=self.claim('a2');self.assertIsNone(reply['run']);self.assertEqual(reply['next_agent'],'B')
        b=self.claim('b1')['run'];self.assertEqual(b['group_id'],a['group_id'])

    def test_parallel_independent_workers_claim_distinct_groups(self):
        self.seed(2)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            out=list(pool.map(lambda who:self.claim(who),['a1','a2']))
        self.assertEqual(len({x['run']['group_id'] for x in out}),2)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.agent_runs where state='CLAIMED'"),'2')

    def test_locked_group_is_skipped(self):
        import select
        self.seed(2)
        process=subprocess.Popen(['psql','-X','-q','-A','-t','-v','ON_ERROR_STOP=1','-d',self.db],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        try:
            process.stdin.write("begin; select group_id from prepmeds_audit.review_groups where group_id='ING-fixture-0' for update;\n");process.stdin.flush()
            self.assertTrue(select.select([process.stdout],[],[],5)[0]);self.assertEqual(process.stdout.readline().strip(),'ING-fixture-0')
            self.assertEqual(self.claim()['run']['group_id'],'ING-fixture-1')
        finally:
            process.communicate('rollback;\n',timeout=5)

    def test_b_expiry_reclaims_same_revision_and_preserves_attempt(self):
        a=self.claim()['run'];submitted=self.submit(a);b=self.claim('b1')['run']
        sql(self.db,f"update prepmeds_audit.agent_runs set lease_until=clock_timestamp()-interval '1 second' where run_id={quote(b['run_id'])}::uuid")
        b2=self.claim('b1')['run'];self.assertEqual(b2['revision'],b['revision']);self.assertEqual(b2['attempt'],2)
        self.assertEqual(self.call('b1','verify',self.verification(b2,submitted))['state'],'EVIDENCE_COMPLETE')

    def test_source_checks_do_not_accept_inaccessible_or_different_document(self):
        a=self.claim()['run'];s=self.submit(a);b=self.claim('b1')['run'];v=self.verification(b,s)
        v['verification']['source_checks'][0]['access']='INACCESSIBLE'
        self.fails('b1','verify',v,'PRIMARY_SOURCE_NOT_VERIFIED')
        v=self.verification(b,s);v['verification']['source_checks'][0]['document_sha256']='f'*64
        self.fails('b1','verify',v,'PRIMARY_SOURCE_NOT_VERIFIED')
        v=self.verification(b,s);v['verification']['source_checks'][0]['passage_hashes']=[]
        self.fails('b1','verify',v,'SOURCE_PASSAGE_NOT_VERIFIED')
        v=self.verification(b,s);v['verification']['source_checks']*=2
        self.fails('b1','verify',v,'DUPLICATE_OR_EXTRA_SOURCE_CHECKS')

    def test_missing_comparison_and_invalid_timing_rejected(self):
        a=self.claim()['run'];e=evidence(a['group_id']);e['domain']='antithrombotic'
        e['recommendations'][0]['interruption']['min']=-1
        result=self.submit(a,e)
        self.assertEqual(result['state'],'QUEUED');self.assertIn('INVALID_INTERVAL',result['deficiencies'])
        self.assertIn('COMPARISON_REQUIRED:ASGE-2016',result['deficiencies'])

    def test_no_clinical_authority_or_test_failure_can_pass(self):
        a=self.claim()['run'];e=evidence(a['group_id']);e['clinical_reviewed']=True;e['tests'][0]['status']='FAIL'
        result=self.submit(a,e);self.assertEqual(result['state'],'QUEUED')
        self.assertIn('ACTIVATION_BOUNDARY_REQUIRED',result['deficiencies']);self.assertIn('EXACT_HEAD_TEST_RECEIPT_REQUIRED',result['deficiencies'])

    def test_split_scoped_formulations_and_foreign_mapping(self):
        a=self.claim()['run'];scope={'route':'oral','regimen':'fixture','requires_confirmation':True}
        body={'run_id':a['run_id'],'context_id':a['context_id'],'units':[{'key':'oral-tablet','scope':scope,'medication_ids':['MED-foreign']}]}
        self.fails('a1','split',body,'FORMULATION_MAPPING_OUTSIDE_PARENT_OR_AMBIGUOUS')
        self.assertEqual(sql(self.db,'select count(*) from prepmeds_audit.review_groups'),'1')
        body['units'][0]['medication_ids']=['MED-fixture-0']
        body['units'].append({'key':'oral-solution','scope':scope,'medication_ids':['MED-fixture-0']})
        self.assertTrue(self.call('a1','split',body)['split'])
        self.assertTrue(self.call('a1','split',body)['replayed'])
        self.assertEqual(sql(self.db,'select count(*) from prepmeds_audit.canonical_mapping'),'1')
        self.assertEqual(sql(self.db,'select count(*) from prepmeds_audit.review_groups where parent_group_id is not null'),'2')
        next_run=self.claim()['run'];self.assertIn('::oral-',next_run['group_id'])

    def test_incomplete_submission_does_not_prevent_formulation_correction(self):
        sql(self.db,"update prepmeds_audit.review_groups set formulation_key='UNADJUDICATED'")
        a=self.claim()['run'];self.assertEqual(self.submit(a)['state'],'QUEUED')
        a2=self.claim()['run'];result=self.call('a1','split',{'run_id':a2['run_id'],'context_id':a2['context_id'],'units':[{'key':'oral-tablet','scope':{'route':'oral','regimen':'fixture'},'medication_ids':['MED-fixture-0']}]})
        self.assertTrue(result['split']);self.assertEqual(sql(self.db,'select count(*) from prepmeds_audit.evidence_revisions'),'1')

    def test_material_change_invalidates_without_erasing_old_verdict(self):
        a=self.claim()['run'];s=self.submit(a);b=self.claim('b1')['run'];verdict=self.verification(b,s)
        self.call('b1','verify',verdict)
        invalidated=parse(self.db,f"select prepmeds_audit.invalidate_revision({quote(a['group_id'])},{quote(s['evidence_hash'])},'Changed source recommendation',{quote('2'*40)})")
        self.assertEqual(invalidated['state'],'QUEUED')
        replay=self.call('b1','verify',verdict);self.assertTrue(replay['replayed']);self.assertEqual(replay['current_state'],'QUEUED')
        self.assertEqual(self.claim()['run']['revision'],2)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.agent_runs where agent='B' and state='PASS'"),'1')

    def test_history_and_run_rewrites_denied(self):
        a=self.claim()['run'];self.submit(a)
        for table in ['evidence_revisions','import_receipts','dispatch_requests','agent_runs']:
            for op in ['delete from','truncate']:
                self.assertNotEqual(sql(self.db,f'{op} prepmeds_audit.{table}',False).returncode,0)
        self.assertNotEqual(sql(self.db,"update prepmeds_audit.agent_runs set state='CLAIMED'",False).returncode,0)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.custody_events where event_hash is null"),'0')
        self.assertEqual(sql(self.db,"select count(*) from (select previous_hash,lag(event_hash) over(partition by group_id order by event_id) expected from prepmeds_audit.custody_events) x where previous_hash is distinct from expected"),'0')

    def test_atomic_rollback_preserves_existing_records(self):
        before=sql(self.db,"select count(*) from prepmeds_audit.custody_events")
        migrations='\n'.join(x.read_text() for x in MIGRATIONS[1:])
        sql(self.db,'begin; create table public.rollback_probe(id int);\n'+migrations+'\nrollback;')
        self.assertEqual(sql(self.db,"select to_regclass('public.rollback_probe') is null"),'t')
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.custody_events"),before)
        self.assertNotEqual(sql(self.db,'begin;'+MIGRATIONS[0].read_text()+'commit;',False).returncode,0)
        self.assertEqual(self.call('a1','status')['states'],{'QUEUED':1})

    def test_import_conflict_rolls_back_and_preserves_review_history(self):
        sql(self.db,"update prepmeds_audit.review_groups set clinical_reviewed=true where group_id='ING-fixture-0'")
        data=fixture_catalog(1);data['groups'][0]['preliminary_evidence']={'status':'EVIDENCE_COMPLETE'}
        parse(self.db,f"select prepmeds_audit.import_catalog('second-import',{quote(COMMIT)},{js(data)})")
        self.assertEqual(sql(self.db,"select clinical_reviewed from prepmeds_audit.review_groups where group_id='ING-fixture-0'"),'t')
        self.assertEqual(sql(self.db,"select state from prepmeds_audit.review_groups where group_id='ING-fixture-0'"),'QUEUED')
        data['medications'][0]['canonical_name']='Conflicting alias'
        self.assertNotEqual(sql(self.db,f"select prepmeds_audit.import_catalog('conflict',{quote(COMMIT)},{js(data)})",False).returncode,0)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.import_receipts where import_key='conflict'"),'0')

    def test_disabled_runtime_and_unprivileged_admin_operations(self):
        sql(self.db,'update prepmeds_audit.runtime_config set enabled=false')
        self.assertFalse(self.call('a1','status')['enabled'])
        self.fails('a1','claim',{'idempotency_key':'disabled-check'},'LEDGER_NOT_ACTIVATED')
        self.assertNotEqual(sql(self.db,f"set role service_role; select prepmeds_audit.import_catalog('attack',{quote(COMMIT)},{js(fixture_catalog())})",False).returncode,0)
        self.assertEqual(sql(self.db,"select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='prepmeds_audit' and c.relkind='r' and not c.relrowsecurity"),'0')

    def test_record_executable_custody_evidence(self):
        a=self.claim()['run'];submitted=self.submit(a);b=self.claim('b1')['run'];result=self.call('b1','verify',self.verification(b,submitted))
        self.assertEqual(result['state'],'EVIDENCE_COMPLETE')
        query="select jsonb_build_object('server_version',current_setting('server_version'),'utc',clock_timestamp(),'groups',(select jsonb_agg(to_jsonb(x)) from prepmeds_audit.review_groups x),'executions',(select jsonb_agg(to_jsonb(x) order by claimed_at) from prepmeds_audit.agent_runs x),'custody',(select jsonb_agg(to_jsonb(x) order by event_id) from prepmeds_audit.custody_events x))"
        rows=parse(self.db,query)
        (ART/'e2e-transitions.json').write_text(json.dumps({'scope':'DISPOSABLE_POSTGRESQL_SYNTHETIC_NOT_SUPABASE','sql':query,'a_submission':submitted,'b_result':result,'actual_query_result':rows},indent=2))

if __name__=='__main__':unittest.main(verbosity=2)
