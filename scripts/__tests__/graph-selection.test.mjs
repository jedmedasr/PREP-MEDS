import test from 'node:test';
import assert from 'node:assert/strict';
import { declaredTasks } from '../graph/task-tags.mjs';
import { reconcile } from '../graph/core.mjs';

test('only explicit task declarations claim work, not unrelated prose references', () => {
  assert.deepEqual(declaredTasks('feat: ENG-003 orchestrator', '## Task: ENG-003\nSeparate from SPR-001 and PR #40; SHA-256 is a digest.'), ['ENG-003']);
  assert.deepEqual(declaredTasks('inventory reconciliation', '## Task: SPR-001\nReferences ENG-002'), ['SPR-001']);
});

test('task-selection fixture accuracy: numeric priority and deterministic ID tie break', () => {
  const repository = 'jedmedasr/PREP-MEDS', sha = 'a'.repeat(40);
  const task = (id) => ({ id, title: id, owner: 'engineering', status: 'not_started', depends_on: [], clinical_gate: false, acceptance: ['test'], source_ref: `https://github.com/${repository}` });
  const graph = { schema_version: 1, repository, snapshot: { default_branch_sha: sha }, tasks: [task('ENG-001'), task('DEMO-001')] };
  const ledger = { schema_version: 1, repository, records: [] };
  const policy = { schema_version: 2, repository, freshness_seconds: 900, required_workflows: ['quality'], clinical_reviewers: [], scopes: {}, priorities: {} };
  const state = { complete: true, observed_at: new Date().toISOString(), main_sha: sha, errors: [], default_branch: 'main', branches: [], pulls: [], claims: [], runs: { 1: { id: 1, path: '.github/workflows/quality.yml', head_sha: sha, status: 'completed', conclusion: 'success' } } };
  const cases = [
    { priorities: { 'ENG-001': 10, 'DEMO-001': 1 }, expected: 'DEMO-001' },
    { priorities: { 'ENG-001': 10, 'DEMO-001': 10 }, expected: 'DEMO-001' },
    { priorities: { 'ENG-001': 10, 'DEMO-001': 20 }, expected: 'ENG-001' },
  ];
  for (const item of cases) {
    policy.priorities = item.priorities;
    assert.equal(reconcile(graph, ledger, policy, state).next, item.expected);
  }
  console.log('SELECTION_FIXTURE_ACCURACY', JSON.stringify({ correct: cases.length, total: cases.length, percentage: 100, scope: 'synthetic deterministic fixtures only, not observed production accuracy' }));
});
