import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validate, validateHistory, reconcile, completion, completionTransitions, handoff, digest } from '../graph/core.mjs';
import { claim, collect, GitHubClient } from '../graph/github.mjs';
import { save } from '../graph/cli.mjs';

const repo = 'jedmedasr/PREP-MEDS', A = 'a'.repeat(40), B = 'b'.repeat(40), url = `https://github.com/${repo}`;
function fixture() {
  const task = (id, status, deps = [], clinical_gate = false) => ({ id, title: id, owner: 'engineering', status,
    depends_on: deps, clinical_gate, acceptance: ['tests passed'], source_ref: url });
  const graph = { schema_version: 1, repository: repo, snapshot: { default_branch_sha: A }, tasks: [
    task('ENG-001', 'complete'), task('ENG-002', 'not_started', ['ENG-001']), task('CLIN-001', 'blocked', ['ENG-002'], true) ] };
  const receipt = { id: 'EV-001', task_id: 'ENG-001', type: 'task_verification', result: 'verified', commit_sha: A,
    url: `${url}/pull/7`, date: '2026-11-07', timestamp: '2026-11-07T12:00:00Z', summary: 'synthetic verification fixture',
    acceptance: ['tests passed'], blockers: [], commands: [{ command: 'pnpm test', run_id: 1, step: 'Unit and regression tests', outcome: 'success' }],
    workflow_run_ids: [1, 2], artifact_urls: [`${url}/actions/runs/1`], implemented_by: 'alice', verified_by: 'bob', pr_number: 7 };
  const ledger = { schema_version: 1, repository: repo, records: [receipt] };
  const policy = { schema_version: 2, repository: repo, freshness_seconds: 900, priorities: { 'ENG-002': 10 }, scopes: {},
    clinical_reviewers: [], required_workflows: ['quality', 'engineering-graph'], protected_prs: [37] };
  const state = { complete: true, observed_at: new Date().toISOString(), errors: [], main_sha: A, default_branch: 'main',
    branches: [], claims: [], commits: { [A]: { sha: A } }, pulls: [{ number: 7, state: 'closed', merged: true, author: 'alice',
      head_sha: A, contributors: ['alice'], task_ids: ['ENG-001'], files: [], reviews: [{ id: 1, login: 'bob', state: 'APPROVED', commit_id: A, html_url: `${url}/pull/7#pullrequestreview-1` }] }],
    runs: { 1: { id: 1, path: '.github/workflows/quality.yml', head_sha: A, status: 'completed', conclusion: 'success',
      jobs: [{ conclusion: 'success', steps: [{ name: 'Unit and regression tests', conclusion: 'success' }] }] },
    2: { id: 2, path: '.github/workflows/engineering-graph.yml', head_sha: A, status: 'completed', conclusion: 'success', jobs: [] } } };
  return { graph, ledger, policy, state };
}
const plan = (f) => reconcile(f.graph, f.ledger, f.policy, f.state);
const proof = (f) => completion(f.graph.tasks[0], f.ledger, f.state, f.policy);

test('1: verified dependencies make a task eligible; deterministic priority', () => { const f = fixture(); assert.deepEqual(validate(f.graph, f.ledger, f.policy), []); assert.equal(plan(f).next, 'ENG-002'); });
test('2: incomplete dependency remains blocked', () => { const f = fixture(); f.graph.tasks[0].status = 'needs_review'; assert.equal(plan(f).next, null); });
test('3: cycles fail validation', () => { const f = fixture(); f.graph.tasks[0].depends_on = ['ENG-002']; assert.match(validate(f.graph, f.ledger, f.policy).join(), /CYCLE/); });
test('4: missing dependency fails validation', () => { const f = fixture(); f.graph.tasks[1].depends_on = ['BAD-999']; assert.match(validate(f.graph, f.ledger, f.policy).join(), /MISSING_TASK/); });
test('5: duplicate evidence fails validation', () => { const f = fixture(); f.ledger.records.push(structuredClone(f.ledger.records[0])); assert.match(validate(f.graph, f.ledger, f.policy).join(), /DUPLICATE_EVIDENCE/); });
test('6: complete without evidence fails validation', () => { const f = fixture(); f.ledger.records = []; assert.match(validate(f.graph, f.ledger, f.policy).join(), /NO_EVIDENCE/); });
test('7: failed CI rejects completion and dispatch', () => { const f = fixture(); f.state.runs[1].conclusion = 'failure'; assert.equal(proof(f).verified, false); assert.equal(plan(f).next, null); });
test('8: changed PR head makes completion unresolved', () => { const f = fixture(); f.state.pulls[0].head_sha = B; assert.match(proof(f).reasons.join(), /SHA_MISMATCH/); assert.equal(plan(f).tasks[0].effective_status, 'unresolved'); });
test('10: partial handoff preserves unfinished work and forbids advancing', () => { const f = fixture(); const h = handoff(plan(f), { task_id: 'ENG-002', outcome: 'PARTIAL', blockers: ['review pending'], tests_executed: ['node --test'], acceptance_satisfied: [], session_id: 'x' }); assert.equal(h.next_eligible_task, null); assert.deepEqual(h.outstanding_blockers, ['review pending']); assert.match(h.recommended_action, /Resume ENG-002/); });
test('11: incomplete clinical gate never allows production completion', () => { const f = fixture(); f.graph.tasks[0].clinical_gate = true; assert.match(proof(f).reasons.join(), /CLINICAL_APPROVAL/); });
test('12: demo task can proceed without unrelated clinical approval', () => { const f = fixture(); f.graph.tasks[1].title = 'Synthetic demo tooling'; assert.equal(plan(f).next, 'ENG-002'); assert.equal(plan(f).tasks[2].effective_status, 'blocked'); });
test('append-only evidence rejects rewritten history', () => { const f = fixture(), before = structuredClone(f.ledger); f.ledger.records[0].summary = 'rewritten'; assert.match(validateHistory(f.graph, f.ledger, f.graph, before).join(), /APPEND_ONLY/); });
test('invalid status transition is rejected even with evidence', () => { const f = fixture(), before = structuredClone(f.graph); f.graph.tasks[1].status = 'complete'; assert.match(validateHistory(f.graph, f.ledger, before, f.ledger).join(), /INVALID_TRANSITION/); });
test('new completion requires live verified evidence', () => { const f = fixture(), before = structuredClone(f.graph); before.tasks[0].status = 'needs_review'; assert.deepEqual(completionTransitions(f.graph, before, f.ledger, f.state, f.policy), []); assert.match(completionTransitions(f.graph, before, f.ledger, null, f.policy).join(), /COMPLETION_REJECTED/); });
test('stale and future snapshots prevent selection', () => { const f = fixture(); f.state.observed_at = '2000-01-01T00:00:00Z'; assert.equal(plan(f).next, null); f.state.observed_at = '2999-01-01T00:00:00Z'; assert.equal(plan(f).next, null); });
test('legacy completions are not silently upgraded', () => { const f = fixture(); f.ledger.records[0].type = 'repository_inspection'; assert.match(proof(f).reasons.join(), /LEGACY/); assert.equal(plan(f).metrics.evidence_supported_completion_percent, 0); });
test('historical immutable completion remains valid when main advances', () => { const f = fixture(); f.state.main_sha = B; for (const id of [3, 4]) f.state.runs[id] = { ...f.state.runs[id - 2], id, head_sha: B }; assert.equal(proof(f).verified, true); assert.equal(plan(f).next, 'ENG-002'); });
test('pending CI and missing runs reject completion', () => { const f = fixture(); f.state.runs[1].status = 'in_progress'; assert.equal(proof(f).verified, false); delete f.state.runs[1]; assert.equal(proof(f).verified, false); });
test('failed test step cannot be hidden by a claimed successful run', () => { const f = fixture(); f.state.runs[1].jobs[0].steps[0].conclusion = 'failure'; assert.match(proof(f).reasons.join(), /COMMAND_UNVERIFIED/); });
test('contributor cannot independently approve own implementation', () => { const f = fixture(); f.state.pulls[0].contributors.push('bob'); assert.match(proof(f).reasons.join(), /INDEPENDENT_REVIEW/); });
test('later requested changes invalidate earlier approval', () => { const f = fixture(); f.state.pulls[0].reviews.push({ id: 2, login: 'bob', state: 'CHANGES_REQUESTED', commit_id: A }); assert.equal(proof(f).verified, false); });
test('cross-repository URLs and malformed dates fail safely', () => { const f = fixture(); f.ledger.records[0].url = 'https://github.com/other/repo'; assert.match(validate(f.graph, f.ledger, f.policy).join(), /EVIDENCE_SHAPE/); f.ledger.records[0].date = '2026-99-99'; assert.doesNotThrow(() => validate(f.graph, f.ledger, f.policy)); });
test('malformed dependencies return errors instead of throwing', () => { const f = fixture(); f.graph.tasks[1].depends_on = {}; assert.match(validate(f.graph, f.ledger, f.policy).join(), /DEPENDENCY_SHAPE/); });
test('overlapping PR or task claim blocks duplicate work', () => { const f = fixture(); f.state.pulls.push({ number: 40, state: 'open', task_ids: ['ENG-002'], files: [] }); assert.equal(plan(f).next, null); assert.equal(plan(f).metrics.duplicate_work_candidates_blocked, 1); });
test('scope overlap uses path boundaries', () => { const f = fixture(); f.policy.scopes['ENG-002'] = ['apps/web']; f.state.pulls.push({ number: 37, state: 'open', task_ids: [], files: ['apps/web2/a.ts'] }); assert.equal(plan(f).next, 'ENG-002'); f.state.pulls[1].files = ['apps/web/a.ts']; assert.equal(plan(f).next, null); });
test('PASS handoff cannot be self-asserted', () => { const f = fixture(); assert.throws(() => handoff(plan(f), { task_id: 'ENG-002', outcome: 'PASS', blockers: [], tests_executed: [], acceptance_satisfied: [], session_id: 'x' }), /PASS_UNVERIFIED/); });
test('read-only planning does not modify graph or ledger', () => { const f = fixture(), original = digest(f); plan(f); assert.equal(digest(f), original); });
test('completion criteria changes require reopening', () => { const f = fixture(), before = structuredClone(f.graph); f.graph.tasks[0].acceptance.push('new requirement'); assert.match(validateHistory(f.graph, f.ledger, before, f.ledger).join(), /REOPEN_REQUIRED/); });
test('clinical gate cannot be downgraded', () => { const f = fixture(), before = structuredClone(f.graph); f.graph.tasks[2].clinical_gate = false; assert.match(validateHistory(f.graph, f.ledger, before, f.ledger).join(), /CLINICAL_GATE_DOWNGRADE/); });
test('latest workflow result supersedes an older run without hiding failed receipt', () => { const f = fixture(); f.state.runs[3] = { ...f.state.runs[1], id: 3 }; f.state.runs[1].conclusion = 'failure'; assert.equal(plan(f).main_failed_or_pending_runs.length, 0); assert.equal(proof(f).verified, false); });

function fakeClaims(f) {
  const store = { ref: null, commits: {}, posts: 0, seq: 0, main: A, failRef: false, moveAfter: false };
  const client = (owner) => ({ prefix: `/repos/${repo}`, async request(path, options = {}) {
    if (path === '/user') return { login: owner };
    if (path.endsWith('/git/ref/heads/main')) return { object: { sha: store.main } };
    if (path.includes('/git/ref/heads/engineering/claims/')) { if (!store.ref) { const e = new Error('404'); e.status = 404; throw e; } return { object: { sha: store.ref } }; }
    if (path.includes('/contents/')) { const source = path.includes('task-graph') ? f.graph : path.includes('evidence-ledger') ? f.ledger : f.policy; return { encoding: 'base64', content: Buffer.from(JSON.stringify(source)).toString('base64') }; }
    if (path.endsWith(`/git/commits/${A}`)) return { tree: { sha: B } };
    if (path.includes('/git/commits/')) return store.commits[path.split('/').at(-1)];
    if (path.endsWith('/git/commits') && options.method === 'POST') { const sha = String(++store.seq).padStart(40, '0'); store.commits[sha] = { ...options.body, sha }; return { sha }; }
    if (path.endsWith('/git/refs') && options.method === 'POST') { store.posts++; if (store.failRef) throw new Error('NETWORK_INTERRUPTED'); if (store.ref) { const e = new Error('422'); e.status = 422; throw e; } store.ref = options.body.sha; if (store.moveAfter) store.main = B; return { ref: options.body.ref }; }
    throw new Error(`UNEXPECTED ${path}`);
  } });
  return { store, client };
}
const options = (owner = 'alice', key = 'session-1') => ({ taskId: 'ENG-002', owner, key, expectedMain: A, write: true });
test('9: two agents race, exactly one acquires the atomic task ref', async () => { const f = fixture(), fake = fakeClaims(f); const results = await Promise.allSettled(['alice', 'eve'].map((who) => claim(fake.client(who), f.graph, f.ledger, f.policy, f.state, options(who)))); assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1); assert.match(results.find((r) => r.status === 'rejected').reason.message, /CLAIM_CONFLICT/); });
test('idempotent claim resumes same ownership without granting stale execution', async () => { const f = fixture(), fake = fakeClaims(f), c = fake.client('alice'); const one = await claim(c, f.graph, f.ledger, f.policy, f.state, options()); const two = await claim(c, f.graph, f.ledger, f.policy, f.state, options()); assert.equal(one.claim_sha, two.claim_sha); assert.equal(two.resumed, true); assert.equal(two.execution_authorized, false); assert.equal(fake.store.posts, 1); });
test('a main change prevents claim writes', async () => { const f = fixture(), fake = fakeClaims(f); fake.store.main = B; await assert.rejects(claim(fake.client('alice'), f.graph, f.ledger, f.policy, f.state, options()), /MAIN_MOVED/); assert.equal(fake.store.posts, 0); });
test('main change after claim retains lock and refuses execution', async () => { const f = fixture(), fake = fakeClaims(f); fake.store.moveAfter = true; await assert.rejects(claim(fake.client('alice'), f.graph, f.ledger, f.policy, f.state, options()), /MAIN_MOVED_AFTER/); assert.ok(fake.store.ref); });
test('interrupted mutation is not silently retried', async () => { const f = fixture(), fake = fakeClaims(f); fake.store.failRef = true; await assert.rejects(claim(fake.client('alice'), f.graph, f.ledger, f.policy, f.state, options()), /NETWORK_INTERRUPTED/); assert.equal(fake.store.posts, 1); assert.equal(fake.store.ref, null); });
test('write opt-in and authenticated owner are mandatory', async () => { const f = fixture(), fake = fakeClaims(f); await assert.rejects(claim(fake.client('alice'), f.graph, f.ledger, f.policy, f.state, { ...options(), write: false }), /WRITE_OPT_IN/); await assert.rejects(claim(fake.client('eve'), f.graph, f.ledger, f.policy, f.state, options()), /AUTHENTICATED/); });
test('unavailable GitHub state fails closed', async () => { const f = fixture(); const s = await collect({ prefix: `/repos/${repo}`, calls: 1, request: async () => { throw new Error('403'); } }, f.graph, f.ledger, f.policy); assert.equal(s.complete, false); assert.equal(reconcile(f.graph, f.ledger, f.policy, s).next, null); });
test('API adapter refuses host escape, missing tokens and exhausted budgets', async () => { assert.throws(() => new GitHubClient(repo, ''), /TOKEN_REQUIRED/); const c = new GitHubClient(repo, 'secret', { budget: 0 }); await assert.rejects(c.request('/user'), /BUDGET/); await assert.rejects(c.request('https://evil.example'), /PATH_REJECTED/); });
test('pagination limit is an error rather than silent incomplete success', async () => { const c = new GitHubClient(repo, 'token'); c.request = async () => Array.from({ length: 100 }, () => ({})); await assert.rejects(c.list(`/repos/${repo}/branches`), /PAGINATION_LIMIT/); });
test('report writes are idempotent and refuse history replacement or interrupted files', () => { const dir = mkdtempSync(join(tmpdir(), 'graph-write-')); try { const path = join(dir, 'a.json'); save(path, { a: 1 }); save(path, { a: 1 }); assert.throws(() => save(path, { a: 2 }), /OUTPUT_CONFLICT/); writeFileSync(path, '{'); assert.throws(() => save(path, { a: 1 }), /OUTPUT_INCOMPLETE/); } finally { rmSync(dir, { recursive: true }); } });
test('CLI status/verify work offline and live next never silently falls back', () => { const dir = mkdtempSync(join(tmpdir(), 'graph-cli-')); try { const f = fixture(); save(join(dir, 'engineering/task-graph.json'), f.graph); save(join(dir, 'engineering/evidence-ledger.json'), f.ledger); save(join(dir, 'engineering/orchestrator-policy.json'), f.policy); const cli = new URL('../graph/cli.mjs', import.meta.url).pathname; const env = { ...process.env }; delete env.GH_TOKEN; delete env.GITHUB_TOKEN; for (const command of ['status', 'verify']) { const r = spawnSync(process.execPath, [cli, command, '--root', dir], { env, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); assert.equal(JSON.parse(r.stdout).valid, true); } const r = spawnSync(process.execPath, [cli, 'next', '--root', dir], { env, encoding: 'utf8' }); assert.notEqual(r.status, 0); assert.match(r.stderr, /TOKEN_REQUIRED/); } finally { rmSync(dir, { recursive: true }); } });
test('artifact expiry and wrong run binding invalidate completion evidence', () => { const f = fixture(); f.ledger.records[0].artifact_urls = [`${url}/actions/runs/1/artifacts/99`]; f.state.artifacts = { 99: { expired: true, workflow_run: { id: 1, head_sha: A } } }; assert.equal(proof(f).verified, false); f.state.artifacts[99].expired = false; assert.equal(proof(f).verified, true); f.state.artifacts[99].workflow_run.head_sha = B; assert.equal(proof(f).verified, false); });
test('arbitrary artifact links cannot masquerade as workflow proof', () => { const f = fixture(); f.ledger.records[0].artifact_urls = [`${url}/issues/1`]; assert.match(proof(f).reasons.join(), /ARTIFACT_UNVERIFIED/); });
test('incomplete prior handoff is detected before selecting its task again', () => { const f = fixture(); f.state.handoffs = [{ previous_task: 'ENG-002', previous_outcome: 'PARTIAL', created_at: new Date().toISOString(), outstanding_blockers: ['interrupted run'] }]; assert.equal(plan(f).next, null); assert.equal(plan(f).resume_required[0].previous_task, 'ENG-002'); });
test('unmerged local graph changes cannot authorize task dispatch', () => { const f = fixture(); f.state.main_graph_digest = 'other'; f.state.main_ledger_digest = digest(f.ledger); assert.equal(plan(f).next, null); assert.equal(plan(f).graph_matches_main, false); });

test('per-task workflow requirements can add but never remove baseline checks', () => { const f = fixture(); f.graph.tasks[0].required_workflows = []; f.ledger.records[0].workflow_run_ids = [1]; assert.match(proof(f).reasons.join(), /WORKFLOW_MISSING: engineering-graph/); });
