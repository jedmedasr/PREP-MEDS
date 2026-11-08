import test from 'node:test';
import assert from 'node:assert/strict';
import { collect, GitHubClient } from '../graph/github.mjs';

const repository = 'jedmedasr/PREP-MEDS';
const prefix = `/repos/${repository}`;
const main = 'a'.repeat(40), head = 'b'.repeat(40), historic = 'c'.repeat(40);
const clone = x => structuredClone(x);
function fixture({ movedPR = false, movedMain = false, denyReviews = false, fullCommitPayload = false, budget = 180 } = {}) {
  const calls = [];
  const graph = { repository, tasks: [{ id: 'ENG-003', source_ref: `https://github.com/${repository}/pull/7` }] };
  const ledger = { records: [
    { id:'EV-1', pr_number:8, commit_sha:head, workflow_run_ids:[20], url:`https://github.com/${repository}/actions/runs/20` },
    { id:'EV-2', commit_sha:historic, workflow_run_ids:[30], url:`https://github.com/${repository}/actions/runs/30` }
  ] };
  const pr = (number, state = 'open') => ({ number, state, title:'ENG-003 fixture', body:'', draft:false,
    merged:state==='closed', head:{sha:head,ref:`feature-${number}`}, user:{login:'alice'},
    merge_commit_sha:state==='closed'?main:null, html_url:`https://github.com/${repository}/pull/${number}` });
  const run = (id, sha) => ({id, repository:{full_name:repository}, path:'.github/workflows/quality.yml', head_sha:sha,
    status:'completed', conclusion:'success',run_attempt:1,html_url:`https://github.com/${repository}/actions/runs/${id}`});
  let mainReads = 0;
  const fetchImpl = async raw => {
    const u = new URL(raw), path=u.pathname; calls.push(path+u.search);
    const reply = (data,status=200) => ({ok:status<400,status,json:async()=>clone(data)});
    if (path===prefix) return reply({default_branch:'main'});
    if (path===`${prefix}/git/ref/heads/main`) return reply({object:{sha:movedMain && mainReads++>0?historic:main}});
    if (path===`${prefix}/branches`) return reply([{name:'main',commit:{sha:main},protected:false}]);
    if (path===`${prefix}/contents/engineering/handoffs`) return reply({},404);
    if (path===`${prefix}/contents/engineering/task-graph.json`) return reply({encoding:'base64',content:Buffer.from(JSON.stringify(graph)).toString('base64')});
    if (path===`${prefix}/contents/engineering/evidence-ledger.json`) return reply({encoding:'base64',content:Buffer.from(JSON.stringify(ledger)).toString('base64')});
    if (path===`${prefix}/pulls`) return reply([pr(8),pr(9)]);
    if (/\/pulls\/\d+$/.test(path)) {
      const n=Number(path.split('/').at(-1)), value=pr(n,n===7?'closed':'open');
      if (movedPR && n===8) value.head.sha=historic;
      return reply(value);
    }
    if (/\/pulls\/\d+\/files$/.test(path)) return reply([{filename:'scripts/graph/core.mjs'}]);
    if (/\/pulls\/\d+\/reviews$/.test(path)) return denyReviews?reply({},403):reply([{id:1,user:{login:'bob'},state:'APPROVED',commit_id:head,html_url:'https://github.com/review'}]);
    if (/\/pulls\/\d+\/commits$/.test(path)) return reply([fullCommitPayload ? {author:{login:'alice'},sha:head,commit:{tree:{sha:historic}},parents:[{sha:main}]} : {author:{login:'alice'}}]);
    if (/\/commits\/[a-f0-9]{40}$/.test(path)) return reply({sha:path.split('/').at(-1),commit:{tree:{sha:historic}},parents:[]});
    if (path===`${prefix}/actions/runs`) return reply({workflow_runs:[run(u.searchParams.get('head_sha')===main?10:20,u.searchParams.get('head_sha'))]});
    if (path===`${prefix}/actions/runs/30`) return reply(run(30,historic));
    if (path===`${prefix}/actions/runs/20`) return reply(run(20,head));
    if (/\/actions\/runs\/\d+\/jobs$/.test(path)) return reply({jobs:[{name:'quality',conclusion:'failure',steps:[{name:'Unit tests',conclusion:'failure'}]}]});
    throw new Error(`UNEXPECTED_TEST_REQUEST:${path}`);
  };
  const client=new GitHubClient(repository,'fixture-only',{fetchImpl,budget});
  return {client,graph,ledger,policy:{protected_prs:[]},calls};
}
const gather = f => collect(f.client,f.graph,f.ledger,f.policy);

test('collector reuses open PR payloads but still reads closed references and final live heads',async()=>{
  const f=fixture(), s=await gather(f);assert.equal(s.complete,true,s.errors.join());
  for(const n of [7,8,9]) assert.equal(f.calls.filter(p=>p===`${prefix}/pulls/${n}`).length,1);
  assert.equal(s.pulls.find(p=>p.number===7).merged,true);
  assert.equal(s.pulls.find(p=>p.number===8).reviews[0].login,'bob');
  assert.deepEqual(s.pulls.find(p=>p.number===8).contributors,['alice']);
});
test('shared PR heads are queried once and evidence headers already observed are not fetched again',async()=>{
  const f=fixture(),s=await gather(f);assert.equal(s.complete,true);
  assert.equal(f.calls.filter(p=>p.startsWith(`${prefix}/actions/runs?head_sha=${head}`)).length,1);
  assert.equal(f.calls.filter(p=>p===`${prefix}/actions/runs/20`).length,0);
  assert.equal(f.calls.filter(p=>p===`${prefix}/actions/runs/30`).length,1);
  assert.equal(s.runs[20].jobs[0].steps[0].conclusion,'failure');
  assert.equal(s.runs[30].jobs[0].steps[0].conclusion,'failure');
});
test('no cache crosses observations; reviews, workflow jobs and live heads are read again',async()=>{
  const f=fixture();await gather(f);const previous=f.calls.length;await gather(f);
  assert.equal(f.calls.length,previous*2);
  assert.equal(f.calls.filter(p=>p.includes('/actions/runs/20/jobs?')).length,2);
});
test('head movement is still detected after reusing the initial list payload',async()=>{
  const s=await gather(fixture({movedPR:true}));assert.equal(s.complete,false);
  assert.ok(s.errors.includes('PR_MOVED_DURING_RECONCILIATION: 8'));
});
test('main movement remains a fail-closed error',async()=>{
  const s=await gather(fixture({movedMain:true}));assert.equal(s.complete,false);
  assert.ok(s.errors.includes('MAIN_MOVED_DURING_RECONCILIATION'));
});
test('unavailable review evidence is not skipped to save calls',async()=>{
  const s=await gather(fixture({denyReviews:true}));assert.equal(s.complete,false);
  assert.match(s.errors.join(),/GITHUB_403/);
});
test('request-budget exhaustion remains a hard failure with no retry or budget increase',async()=>{
  const f=fixture({budget:5}),s=await gather(f);assert.equal(s.complete,false);
  assert.ok(s.errors.includes('API_BUDGET_EXCEEDED'));assert.equal(f.calls.length,5);
});

test('immutable commit metadata already returned with contributors is reused',async()=>{
  const f=fixture({fullCommitPayload:true}),s=await gather(f);assert.equal(s.complete,true,s.errors.join());
  assert.equal(f.calls.filter(p=>p===`${prefix}/commits/${head}`).length,0);
  assert.deepEqual(s.commits[head],{sha:head,tree:historic,parents:[main]});
  assert.equal(f.calls.filter(p=>p===`${prefix}/commits/${historic}`).length,1);
});
test('incomplete commit summaries require the individual endpoint rather than assuming validity',async()=>{
  const f=fixture(),s=await gather(f);assert.equal(s.complete,true);
  assert.equal(f.calls.filter(p=>p===`${prefix}/commits/${head}`).length,1);
  assert.equal(s.commits[head].tree,historic);
});
