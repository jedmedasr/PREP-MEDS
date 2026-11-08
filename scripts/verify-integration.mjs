import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { normalizeHandoff } from './graph/handoffs.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function exactUnion(collections) {
  const result = new Map();
  for (const items of collections) {
    const seen = new Set();
    for (const item of items) {
      assert.ok(item && typeof item.id === 'string' && item.id, 'MISSING_ID');
      assert.ok(!seen.has(item.id), `DUPLICATE_ID:${item.id}`); seen.add(item.id);
      if (result.has(item.id)) assert.deepEqual(item, result.get(item.id), `CONFLICTING_RECORD:${item.id}`);
      else result.set(item.id, item);
    }
  }
  return result;
}
export function requirePreserved(expected, actual) {
  const current = exactUnion([actual]);
  for (const [id, value] of expected) assert.deepEqual(current.get(id), value, `DROPPED_OR_REWRITTEN:${id}`);
}
export function taskUnion(inputs, resolutions) {
  const result = new Map();
  const chosen = new Map();
  for (const { pr, tasks } of inputs) {
    exactUnion([tasks]);
    for (const task of tasks) {
      const previous = result.get(task.id);
      if (!previous || isDeepStrictEqual(previous, task)) { result.set(task.id, task); chosen.set(task.id, pr); continue; }
      const owner = resolutions[task.id];
      assert.ok(owner === pr || owner === chosen.get(task.id), `UNRESOLVED_TASK_CONFLICT:${task.id}`);
      if (owner === pr) { result.set(task.id, task); chosen.set(task.id, pr); }
    }
  }
  for (const [id, pr] of Object.entries(resolutions)) assert.equal(chosen.get(id), pr, `UNKNOWN_TASK_RESOLUTION:${id}`);
  return result;
}
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const jsonAt = (sha, path) => JSON.parse(git('show', `${sha}:${path}`));
function filesAt(sha) {
  return new Map(git('ls-tree', '-r', '-z', sha).split('\0').filter(Boolean).map(line => {
    const tab = line.indexOf('\t'); return [line.slice(tab + 1), line.slice(0, tab)];
  }));
}
function ancestor(a, b) {
  try { git('merge-base', '--is-ancestor', a, b); return true; }
  catch { return false; }
}
export function verifyIntegration() {
  const manifest = JSON.parse(readFileSync('engineering/integration-manifest.json', 'utf8'));
  assert.equal(manifest.schema_version, 1);
  for (const sha of [manifest.main_sha, ...manifest.inputs.map(x => x.sha)]) {
    assert.match(sha, /^[a-f0-9]{40}$/); assert.ok(ancestor(sha, 'HEAD'), `INPUT_NOT_IN_HISTORY:${sha}`);
  }
  const inputs = manifest.inputs.map(input => ({ ...input,
    graph: jsonAt(input.sha, 'engineering/task-graph.json'),
    ledger: jsonAt(input.sha, 'engineering/evidence-ledger.json'),
    package: jsonAt(input.sha, 'package.json'), files: filesAt(input.sha)
  }));
  const actualGraph = JSON.parse(readFileSync('engineering/task-graph.json', 'utf8'));
  const actualLedger = JSON.parse(readFileSync('engineering/evidence-ledger.json', 'utf8'));
  const handoffPaths = readdirSync('engineering/handoffs').filter(name => name.endsWith('.json'));
  for (const name of handoffPaths) normalizeHandoff(JSON.parse(readFileSync(`engineering/handoffs/${name}`, 'utf8')));
  const records = exactUnion(inputs.map(x => x.ledger.records));
  requirePreserved(records, actualLedger.records);
  const tasks = taskUnion(inputs.map(x => ({pr:x.pr,tasks:x.graph.tasks})), manifest.task_resolution);
  requirePreserved(tasks, actualGraph.tasks);
  assert.deepEqual(actualGraph.snapshot, inputs.find(x => x.pr === manifest.snapshot_source_pr).graph.snapshot);
  const main = filesAt(manifest.main_sha); const expected = new Map(main); const origin = new Map();
  const resolved = new Set(manifest.resolved_paths);
  for (const input of inputs) {
    for (const path of new Set([...main.keys(), ...input.files.keys()])) {
      const value = input.files.get(path);
      if (value === main.get(path) || resolved.has(path)) continue;
      if (origin.has(path) && expected.get(path) !== value) assert.ok(ancestor(origin.get(path), input.sha), `UNRESOLVED_FILE_CONFLICT:${path}`);
      if (value === undefined) expected.delete(path); else expected.set(path, value);
      origin.set(path, input.sha);
    }
  }
  const actual = filesAt('HEAD');
  for (const [path, hash] of expected) if (!resolved.has(path)) assert.equal(actual.get(path), hash, `INPUT_FILE_CHANGED_OR_DROPPED:${path}`);
  for (const path of actual.keys()) if (!expected.has(path) && !resolved.has(path)) assert.ok(manifest.additional_paths.includes(path), `UNDECLARED_FILE:${path}`);
  let clinicalBaselineFiles = 0;
  for (const [path, hash] of main) if (path.startsWith('apps/') || path.startsWith('packages/') || path.startsWith('clinical-content/')) {
    assert.equal(actual.get(path), hash, `BASELINE_CLINICAL_FILE_CHANGED:${path}`); clinicalBaselineFiles++;
  }
  const scripts = Object.assign({}, ...inputs.map(x => x.package.scripts));
  const currentPackage = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const [name, command] of Object.entries(scripts)) assert.equal(currentPackage.scripts[name], command, `SCRIPT_DROPPED:${name}`);
  assert.equal(currentPackage.scripts['verify:integration'], 'node scripts/verify-integration.mjs');
  const source43 = inputs.find(x => x.pr === 43).sha; const source41 = inputs.find(x => x.pr === 41).sha;
  assert.ok(readFileSync('AGENTS.md', 'utf8').startsWith(git('show', `${source43}:AGENTS.md`).trimEnd()), 'SOURCE_VERIFICATION_CONTRACT_LOST');
  assert.ok(readFileSync('AGENTS.md', 'utf8').includes('## Stage 2 executable orchestration'), 'STAGE2_CONTRACT_LOST');
  assert.equal(readFileSync('engineering/decisions.md','utf8'), git('show',`${source43}:engineering/decisions.md`));
  assert.equal(readFileSync('engineering/decisions-stage2.md','utf8'), git('show',`${source41}:engineering/decisions.md`));
  return { status:'PASS', mainSha:manifest.main_sha, inputs:manifest.inputs, handoffsReadable:handoffPaths.length, tasksPreserved:tasks.size, evidenceRecordsPreserved:records.size, baselineClinicalFilesUnchanged:clinicalBaselineFiles, clinicalApproval:false, mergedToMain:false };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(verifyIntegration(),null,2));
