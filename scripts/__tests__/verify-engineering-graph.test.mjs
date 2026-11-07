import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateGraph } from '../verify-engineering-graph.mjs';

const graph = JSON.parse(readFileSync(new URL('../../engineering/task-graph.json', import.meta.url), 'utf8'));
const ledger = JSON.parse(readFileSync(new URL('../../engineering/evidence-ledger.json', import.meta.url), 'utf8'));
const copy = (value) => structuredClone(value);

test('committed graph passes invariants', () => {
  assert.deepEqual(validateGraph(graph, ledger), []);
});
test('rejects an unknown dependency', () => {
  const g = copy(graph); g.tasks[1].depends_on.push('UNKNOWN-999');
  assert.match(validateGraph(g, ledger).join('\n'), /missing dependency/);
});
test('rejects cycles', () => {
  const g = copy(graph); g.tasks[0].depends_on.push('ENG-002');
  assert.match(validateGraph(g, ledger).join('\n'), /cycle/i);
});
test('rejects premature completion when dependencies remain incomplete', () => {
  const g = copy(graph); g.tasks[3].status = 'complete';
  assert.match(validateGraph(g, ledger).join('\n'), /dependencies incomplete/);
});
test('rejects completion without task-linked passing evidence', () => {
  const l = copy(ledger); l.records = [];
  assert.match(validateGraph(graph, l).join('\n'), /complete without passing evidence/);
});
test('rejects duplicate evidence records', () => {
  const l = copy(ledger); l.records.push(copy(l.records[0]));
  assert.match(validateGraph(graph, l).join('\n'), /Duplicate evidence id/);
});
test('rejects fabricated clinical gate completion without human approval', () => {
  const g = copy(graph);
  const l = copy(ledger);
  for (const t of g.tasks) t.status = 'complete';
  for (const t of g.tasks.filter((t) => t.id !== 'ENG-001')) {
    l.records.push({id: 'EV-' + t.id,task_id:t.id,type:'test',result:'verified',
      commit_sha:g.snapshot.default_branch_sha,url:'https://github.com/jedmedasr/PREP-MEDS',
      date:'2026-11-07',summary:'synthetic fixture only'});
  }
  assert.match(validateGraph(g, l).join('\n'), /clinical gate marked complete/);
});
test('rejects a blocked node with no incomplete prerequisites', () => {
  const g = copy(graph); g.tasks[1].status = 'blocked';
  assert.match(validateGraph(g, ledger).join('\n'), /blocked but all dependencies are complete/);
});
