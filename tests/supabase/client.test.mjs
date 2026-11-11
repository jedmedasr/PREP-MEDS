import test from 'node:test';
import assert from 'node:assert/strict';
import { ledgerConfig, handleLedgerRequest } from '../../scripts/supabase-ledger/client.mjs';
import { scheduledTick } from '../../scripts/supabase-ledger/schedule.mjs';
const ref='a'.repeat(20), aToken='a'.repeat(40), bToken='b'.repeat(40);
const env={PREP_MEDS_LEDGER_ENABLED:'true',PREP_MEDS_SUPABASE_PROJECT_REF:ref,PREP_MEDS_SUPABASE_URL:`https://${ref}.supabase.co`,SUPABASE_SERVICE_ROLE_KEY:'s'.repeat(40),PREP_MEDS_AGENT_A_TOKEN:aToken,PREP_MEDS_AGENT_B_TOKEN:bToken,PREP_MEDS_WORKER_A_URL:'https://a.worker.invalid/run',PREP_MEDS_WORKER_B_URL:'https://b.worker.invalid/run',PREP_MEDS_WORKER_A_TOKEN:'u'.repeat(40),PREP_MEDS_WORKER_B_TOKEN:'v'.repeat(40)};
const request=(body,token=aToken,headers={})=>new Request('https://app.invalid/api/agent-ledger',{method:'POST',headers:{authorization:`Bearer ${token}`,...headers},body:JSON.stringify(body)});
function transport({role='A',replay=false,sourceChanged=false,workerFails=false,wrongProject=false}={}) {
  const calls=[];const run={run_id:'execution-1',context_id:'isolated-context-1',agent:role};
  const current={revision:3,content_hash:'c'.repeat(64)};
  const fetchImpl=async(url,init)=>{
    const p=JSON.parse(init.body);calls.push({url,body:p});
    if(url.includes('.supabase.co/')) {
      const agent=p.p_token===aToken?'A':'B';
      if(p.p_action==='status')return Response.json({enabled:true,environment:'operational',project_ref:wrongProject?'wrong':ref,lane:'even',agent,identity_id:`independent-${agent}`,observed_at_utc:'DATABASE_TIME'});
      if(p.p_action==='next')return Response.json({next_agent:role});
      if(p.p_action==='claim')return Response.json({run,execution_authorized:!replay,replayed:replay});
      if(p.p_action==='get')return Response.json({group:{group_id:'ING-fixture'},current_evidence:current,imports:[]});
      if(p.p_action==='checkpoint')return Response.json({saved:true});
      if(p.p_action==='submit')return Response.json({state:'AWAITING_B',clinical_reviewed:false});
      if(p.p_action==='verify')return Response.json({state:p.p_payload.outcome==='PASS'?'EVIDENCE_COMPLETE':'DISPUTED',clinical_reviewed:false});
      throw new Error('UNEXPECTED_ACTION');
    }
    assert.equal(init.headers.Authorization,`Bearer ${env[`PREP_MEDS_WORKER_${role}_TOKEN`]}`);
    assert.ok(!init.body.includes(env.SUPABASE_SERVICE_ROLE_KEY));assert.ok(!init.body.includes(aToken));
    if(workerFails)return new Response('',{status:500});
    return Response.json(role==='A'?{evidence:{schema_version:1},github_commit:'1'.repeat(40)}:{revision:3,evidence_hash:sourceChanged?'wrong':current.content_hash,outcome:'PASS',verification:{context_id:run.context_id}});
  };
  return {calls,fetchImpl};
}
test('disabled endpoint does not query a database',async()=>{
  const res=await handleLedgerRequest(request({action:'status'}),{},()=>{throw new Error('MUST_NOT_CALL');});assert.equal(res.status,404);
});
test('project mismatch and missing credentials fail closed',()=>{
  assert.throws(()=>ledgerConfig({...env,PREP_MEDS_SUPABASE_URL:'https://other.supabase.co'}),/BINDING/);
  assert.throws(()=>ledgerConfig({...env,SUPABASE_SERVICE_ROLE_KEY:''}),/CREDENTIAL/);
});
test('backend requires token and rejects browser-origin calls',async()=>{
  assert.equal((await handleLedgerRequest(request({action:'status'},'short'),env)).status,401);
  assert.equal((await handleLedgerRequest(request({action:'status'},aToken,{origin:'https://app.invalid'}),env)).status,403);
});
test('body cannot select arbitrary project or endpoint',async()=>{
  const t=transport();const res=await handleLedgerRequest(request({action:'status',url:'https://evil.invalid'}),env,t.fetchImpl);assert.equal(res.status,400);assert.equal(t.calls.length,0);
});
test('valid status is obtained from the bound project',async()=>{
  const t=transport();const res=await handleLedgerRequest(request({action:'status'}),env,t.fetchImpl);assert.equal(res.status,200);assert.equal((await res.json()).observed_at_utc,'DATABASE_TIME');assert.equal(t.calls.length,1);
});
test('wrong live project is rejected before mutation',async()=>{
  const t=transport({wrongProject:true});const res=await handleLedgerRequest(request({action:'claim',payload:{idempotency_key:'test-request'}}),env,t.fetchImpl);assert.equal(res.status,503);assert.equal(t.calls.length,1);
});
test('oversized actual stream rejected regardless of length header',async()=>{
  const t=transport();const res=await handleLedgerRequest(request({action:'checkpoint',payload:{data:'x'.repeat(2000001)}}),env,t.fetchImpl);assert.equal(res.status,413);assert.equal(t.calls.length,0);
});
test('upstream SQL and credential errors are not disclosed',async()=>{
  const res=await handleLedgerRequest(request({action:'status'}),env,async()=>new Response('password='+aToken,{status:403}));assert.equal(res.status,503);assert.ok(!(await res.text()).includes(aToken));
});
test('scheduled A task queries database before dispatch and persists submission',async()=>{
  const t=transport();const out=await scheduledTick({env,lane:'even',requestKey:'scheduled-run-1',fetchImpl:t.fetchImpl});assert.equal(out.result.state,'AWAITING_B');assert.equal(out.patient_facing_authorized,false);assert.deepEqual(t.calls.slice(0,4).map(x=>x.body.p_action),['status','status','next','claim']);assert.equal(t.calls.at(-1).body.p_action,'submit');
});
test('scheduled B is selected from database and binds exact A revision',async()=>{
  const t=transport({role:'B'});const out=await scheduledTick({env,lane:'even',requestKey:'scheduled-run-2',fetchImpl:t.fetchImpl});assert.equal(out.result.state,'EVIDENCE_COMPLETE');const verify=t.calls.at(-1).body;assert.equal(verify.p_token,bToken);assert.equal(verify.p_payload.revision,3);assert.equal(verify.p_payload.evidence_hash,'c'.repeat(64));
});
test('replayed schedule never launches another worker',async()=>{
  const t=transport({replay:true});const out=await scheduledTick({env,lane:'even',requestKey:'scheduled-run-3',fetchImpl:t.fetchImpl});assert.equal(out.dispatched,false);assert.ok(t.calls.every(x=>x.url.includes('.supabase.co/')));
});
test('worker failure preserves failure checkpoint but cannot complete',async()=>{
  const t=transport({workerFails:true});await assert.rejects(scheduledTick({env,lane:'even',requestKey:'scheduled-run-4',fetchImpl:t.fetchImpl}),/PERSISTENCE_UNCERTAIN/);assert.equal(t.calls.at(-1).body.p_action,'checkpoint');assert.ok(!t.calls.some(x=>['verify','submit'].includes(x.body.p_action)));
});
test('B returning stale revision cannot submit PASS',async()=>{
  const t=transport({role:'B',sourceChanged:true});await assert.rejects(scheduledTick({env,lane:'even',requestKey:'scheduled-run-5',fetchImpl:t.fetchImpl}),/PERSISTENCE_UNCERTAIN/);assert.ok(!t.calls.some(x=>x.body.p_action==='verify'));
});
test('missing worker configuration does not claim work',async()=>{
  const t=transport();await assert.rejects(scheduledTick({env:{...env,PREP_MEDS_WORKER_A_URL:undefined},lane:'even',requestKey:'scheduled-run-6',fetchImpl:t.fetchImpl}),/WORKER_NOT_CONFIGURED/);assert.ok(!t.calls.some(x=>x.body.p_action==='claim'));
});
test('wrong lane cannot be supplied to scheduler',async()=>{
  const t=transport();await assert.rejects(scheduledTick({env,lane:'odd',requestKey:'scheduled-run-7',fetchImpl:t.fetchImpl}),/INDEPENDENT_LANE/);assert.ok(!t.calls.some(x=>x.body.p_action==='claim'));
});
test('same worker endpoint is rejected',async()=>{
  const t=transport();await assert.rejects(scheduledTick({env:{...env,PREP_MEDS_WORKER_B_URL:env.PREP_MEDS_WORKER_A_URL},lane:'even',requestKey:'scheduled-run-8',fetchImpl:t.fetchImpl}),/SEPARATE_WORKER/);
});
