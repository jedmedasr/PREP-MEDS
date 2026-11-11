"""Real isolated PostgreSQL tests via psql. Never connect this harness to a hosted project."""
import concurrent.futures
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = sorted((ROOT / 'supabase/migrations').glob('2026110823*.sql'))
COMMIT = '1' * 40
TOKENS = {k: ('test-only-' + k + '-') * 6 for k in ['a1','a2','b1','bself','even']}
ART = ROOT / 'ledger-artifacts'
ART.mkdir(exist_ok=True)
RESULTS = []

def quote(value):
    return "'" + str(value).replace("'", "''") + "'"

def js(value):
    return quote(json.dumps(value, separators=(',', ':'))) + '::jsonb'

def sql(db, text, check=True):
    r = subprocess.run(['psql', '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-d', db], input=text, text=True, capture_output=True, timeout=40)
    if check and r.returncode:
        raise AssertionError(r.stderr.strip())
    return r.stdout.strip() if check else r

def parse(db, text):
    return json.loads(sql(db, text))

def fixture_catalog(n=1):
    return {'groups': [{'group_id':f'ING-fixture-{i}', 'bucket':1, 'owner_lane':'odd', 'ingredient_ids':[f'ING-fixture-{i}']} for i in range(n)],
            'medications': [{'medication_id':f'MED-fixture-{i}', 'group_id':f'ING-fixture-{i}', 'canonical_name':f'Synthetic fixture {i}'} for i in range(n)]}

def evidence(group):
    passage = 'Synthetic source: withhold for exactly two hours before procedure start.'
    ph = hashlib.sha256(passage.encode()).hexdigest()
    source = {'id':'synthetic-source','society':'TEST_ONLY','title':'Synthetic fixture, not clinical guidance','version':'1','publication_date':'2026-01-01','primary_url':'https://example.invalid/source','document_sha256':hashlib.sha256(b'synthetic document').hexdigest(),'access':'RETRIEVED','passages':[{'locator':'Section 1','quote':passage,'sha256':ph}]}
    return {'schema_version':1,'group_id':group,'evidence_kind':'SYNTHETIC_TEST','domain':'test','medication_ids':[group.replace('ING-','MED-')],
            'formulation':{'key':'oral-tablet','adjudicated':True,'route':'oral','regimen':'synthetic only','scope':'no clinical use'},
            'sources':[source],'comparisons':[{'guideline':'TEST_ONLY','status':'COMPARED','source_id':source['id']}],
            'recommendations':[{'source_id':source['id'],'passage_sha256':ph,'interruption':{'status':'SPECIFIED','min':2,'max':2,'unit':'hours','anchor':'procedure_start','comparison':'EXACT'},'resumption':{'status':'NOT_SPECIFIED','reason':'Synthetic document has no restart instruction'},**{k:'NOT SPECIFIED in fixture' for k in ['renal','hepatic','indication','bleeding_risk','thrombotic_risk','bridging','strength','certainty','exceptions']}}],
            'conflicts':[],'exceptions':[],'tests':[{'status':'PASS','commit_sha':COMMIT,'command':'synthetic-test-receipt-only','run_url':'https://github.com/jedmedasr/PREP-MEDS/actions/runs/1'}],
            'clinical_reviewed':False,'patient_facing_enabled':False}

class LedgerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.environ.get('LEDGER_ISOLATED_CI') != 'true' or os.environ.get('PGHOST') not in ('localhost','127.0.0.1'):
            raise RuntimeError('ISOLATED_LOOPBACK_DATABASE_REQUIRED')
        sql('postgres', "DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon; END IF; IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF; IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role BYPASSRLS; END IF; END $$;")

    def setUp(self):
        self.db = 'prepmeds_ci_' + uuid.uuid4().hex[:12]
        sql('postgres', 'create database ' + self.db)
        for path in MIGRATIONS:
            sql(self.db, 'begin;\n' + path.read_text() + '\ncommit;')
        self.seed()

    def tearDown(self):
        try:
            snapshot = parse(self.db, "select jsonb_build_object('utc',clock_timestamp(),'states',(select jsonb_agg(jsonb_build_object('group',group_id,'state',state,'revision',current_revision,'clinical_reviewed',clinical_reviewed,'patient_facing_enabled',patient_facing_enabled)) from prepmeds_audit.review_groups),'runs',(select count(*) from prepmeds_audit.agent_runs),'events',(select count(*) from prepmeds_audit.custody_events))")
            RESULTS.append({'test':self.id(), 'database_result':snapshot})
            (ART/'query-results.json').write_text(json.dumps({'scope':'ISOLATED_POSTGRESQL_NOT_SUPABASE','results':RESULTS},indent=2,default=str))
        finally:
            sql('postgres', 'drop database ' + self.db)

    def seed(self, n=1):
        parse(self.db, f"select prepmeds_audit.import_catalog('fixture-{n}',{quote(COMMIT)},{js(fixture_catalog(n))})")
        sql(self.db, "update prepmeds_audit.review_groups set formulation_key='oral-tablet'; update prepmeds_audit.runtime_config set enabled=true,environment='test',project_ref='LOCAL-ISOLATED-NOT-SUPABASE',inspected_schema_hash=repeat('0',64);")
        for who, agent, identity, lane in [('a1','A','extractor-1','odd'),('a2','A','extractor-2','odd'),('b1','B','verifier-1','odd'),('bself','B','extractor-1','odd'),('even','A','extractor-even','even')]:
            digest = hashlib.sha256(TOKENS[who].encode()).hexdigest()
            sql(self.db, f"insert into prepmeds_audit.agent_principals(principal_id,identity_id,agent,owner_lane,credential_hash,enabled) values({quote(who)},{quote(identity)},{quote(agent)},{quote(lane)},{quote(digest)},true) on conflict do nothing")

    def call(self, who, action, payload=None):
        return parse(self.db, f"set role service_role; select public.prepmeds_agent_dispatch({quote(TOKENS[who])},{quote(action)},{js(payload or {})})")

    def fails(self, who, action, payload, pattern):
        with self.assertRaisesRegex(AssertionError, pattern):
            self.call(who, action, payload)

    def claim(self, who='a1', key=None, **extra):
        return self.call(who,'claim',{'idempotency_key':key or uuid.uuid4().hex,**extra})

    def submit(self, run, body=None):
        return self.call('a1','submit',{'run_id':run['run_id'],'context_id':run['context_id'],'evidence':body or evidence(run['group_id']),'github_commit':COMMIT})

    def verification(self, b, submitted):
        source = evidence(b['group_id'])['sources'][0]
        return {'run_id':b['run_id'],'context_id':b['context_id'],'revision':submitted['revision'],'evidence_hash':submitted['evidence_hash'],'outcome':'PASS',
                'verification':{'context_id':b['context_id'],'method':'INDEPENDENT_PRIMARY_DOCUMENT','mapping_adjudicated':True,'tests_passed':True,'test_commit':COMMIT,'discrepancies':[],
                                'source_checks':[{'source_id':source['id'],'access':'VERIFIED_PRIMARY_PASSAGES','primary_url':source['primary_url'],'document_sha256':source['document_sha256'],'passage_hashes':[x['sha256'] for x in source['passages']]}]}}

    def test_a_to_b_complete_and_no_clinical_activation(self):
        a=self.claim()['run']; s=self.submit(a)
        self.assertEqual(s['state'],'AWAITING_B')
        self.assertEqual(self.call('a1','next')['next_agent'],'B')
        b=self.claim('b1')['run']; v=self.verification(b,s)
        result=self.call('b1','verify',v)
        self.assertEqual(result['state'],'EVIDENCE_COMPLETE')
        self.assertFalse(result['clinical_reviewed']); self.assertFalse(result['patient_facing_authorized'])
        self.assertTrue(self.call('b1','verify',v)['replayed'])

    def test_fail_correction_and_exact_revision(self):
        a=self.claim()['run']; s=self.submit(a); b=self.claim('b1')['run']
        v=self.verification(b,s); v['outcome']='FAIL';v['verification']['discrepancies']=['Synthetic mismatch for adversarial test']
        self.assertEqual(self.call('b1','verify',v)['state'],'DISPUTED')
        a2=self.claim()['run']; e=evidence(a2['group_id']); e['exceptions']=['Correction revision']
        s2=self.submit(a2,e); self.assertEqual(s2['revision'],2)
        b2=self.claim('b1')['run']; stale=self.verification(b2,s)
        self.fails('b1','verify',stale,'STALE_EVIDENCE_REVISION')
        self.assertEqual(self.call('b1','verify',self.verification(b2,s2))['state'],'EVIDENCE_COMPLETE')
        self.assertEqual(sql(self.db,'select count(*) from prepmeds_audit.evidence_revisions'),'2')

    def test_independence_and_lane_enforcement(self):
        a=self.claim()['run'];self.submit(a)
        self.assertIsNone(self.claim('bself')['run'])
        self.assertIsNone(self.claim('even')['run'])
        self.fails('a2','renew',{'run_id':a['run_id'],'context_id':a['context_id']},'EXECUTION_NOT_OWNED')

    def test_claim_idempotency_and_collision(self):
        def worker(_):return self.claim(key='same-execution-key')
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: outcomes=list(pool.map(worker,range(2)))
        self.assertEqual(outcomes[0]['run']['run_id'],outcomes[1]['run']['run_id'])
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.agent_runs where state='CLAIMED'"),'1')
        self.fails('a1','claim',{'idempotency_key':'same-execution-key','lease_seconds':61},'IDEMPOTENCY_KEY_REUSE')
        self.assertIsNone(self.claim('a2')['run'])

    def test_expiry_retry_and_checkpoint(self):
        a=self.claim()['run'];payload={'run_id':a['run_id'],'context_id':a['context_id'],'progress':{'step':'source-retrieved'}}
        self.call('a1','checkpoint',payload);self.call('a1','checkpoint',payload)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.custody_events where event_type='PROGRESS_SAVED'"),'1')
        sql(self.db,f"update prepmeds_audit.agent_runs set lease_until=clock_timestamp()-interval '1 second' where run_id={quote(a['run_id'])}::uuid")
        self.fails('a1','submit',{'run_id':a['run_id'],'context_id':a['context_id'],'github_commit':COMMIT,'evidence':evidence(a['group_id'])},'LEASE_EXPIRED')
        newer=self.claim()['run'];self.assertNotEqual(newer['run_id'],a['run_id']);self.assertEqual(newer['attempt'],2)
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.agent_runs where state='EXPIRED'"),'1')
        self.assertIn('source-retrieved',sql(self.db,"select scenario_evidence from prepmeds_audit.agent_runs where state='EXPIRED'"))

    def test_missing_sources_and_formulation_fail_closed(self):
        a=self.claim()['run'];e=evidence(a['group_id']);e['sources'][0]['access']='INACCESSIBLE'
        s=self.submit(a,e);self.assertEqual(s['state'],'QUEUED');self.assertIn('PRIMARY_SOURCE_UNVERIFIED',s['deficiencies'])
        self.assertIsNone(self.claim('b1')['run'])

    def test_privileges_immutable_history_and_repeat_migration(self):
        for path in MIGRATIONS[1:]:sql(self.db,'begin;\n'+path.read_text()+'\ncommit;')
        for role in ['anon','authenticated','service_role']:
            self.assertNotEqual(sql(self.db,f'set role {role}; select * from prepmeds_audit.agent_principals',False).returncode,0)
        for role in ['anon','authenticated']:
            self.assertNotEqual(sql(self.db,f"set role {role}; select public.prepmeds_agent_dispatch('invalid','status','{{}}')",False).returncode,0)
        for query in ["update prepmeds_audit.custody_events set event_type='forged'",'delete from prepmeds_audit.custody_events','truncate prepmeds_audit.custody_events']:
            self.assertNotEqual(sql(self.db,query,False).returncode,0)

    def test_canonical_import_reconciliation(self):
        spec=importlib.util.spec_from_file_location('prepare',ROOT/'scripts/supabase-ledger/prepare_import.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        data=mod.prepare();self.assertEqual(data['counts'],{'canonical_ids':436,'provisional_groups':233,'combination_entries':48,'odd_groups':120,'even_groups':113})
        result=parse(self.db,f"select prepmeds_audit.import_catalog('canonical-test',{quote(COMMIT)},{js(data)})")
        self.assertEqual(result['canonical_ids'],436);self.assertEqual(result['groups'],233)
        replay=parse(self.db,f"select prepmeds_audit.import_catalog('canonical-test',{quote(COMMIT)},{js(data)})");self.assertTrue(replay['replayed'])
        self.assertEqual(sql(self.db,"select count(*) from prepmeds_audit.agent_runs"),'0')
        actual=parse(self.db,"select jsonb_build_object('canonical_ids',(select count(*) from prepmeds_audit.canonical_mapping where medication_id not like 'MED-fixture-%'),'groups',(select count(*) from prepmeds_audit.review_groups where group_id not like 'ING-fixture-%'),'awaiting_b',(select count(*) from prepmeds_audit.review_groups where state='AWAITING_B'),'complete',(select count(*) from prepmeds_audit.review_groups where state='EVIDENCE_COMPLETE'))")
        self.assertEqual(actual,{'canonical_ids':436,'groups':233,'awaiting_b':0,'complete':0})
        (ART/'canonical-import-result.json').write_text(json.dumps({'scope':'ISOLATED_TEST_DATABASE','counts':actual,'bucket01':[{'group_id':g['group_id'],'deficiencies':g['deficiencies']} for g in data['groups'] if g['bucket']==1]},indent=2))

if __name__=='__main__':unittest.main(verbosity=2)
