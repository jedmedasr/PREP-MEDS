import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const STATUSES = new Set(['not_started', 'in_progress', 'blocked', 'needs_review', 'complete']);
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const DATE_PATTERN = /^\\d{4}-\\d{2}-\\d{2}$/;

export function validateGraph(graph, ledger) {
  const errors = [];
  const add = (message) => errors.push(message);
  const object = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

  if (!object(graph) || !Array.isArray(graph.tasks) || graph.schema_version !== 1) {
    return ['Invalid graph: expected schema_version 1 and tasks array'];
  }
  if (!object(ledger) || !Array.isArray(ledger.records) || ledger.schema_version !== 1) {
    return ['Invalid ledger: expected schema_version 1 and records array'];
  }
  if (!graph.repository || ledger.repository !== graph.repository) add('Graph and ledger repository must match');
  if (!object(graph.snapshot) || !SHA_PATTERN.test(graph.snapshot.default_branch_sha ?? '')) {
    add('Snapshot must identify a 40-character default branch commit');
  }

  const tasks = new Map();
  for (const task of graph.tasks) {
    if (!object(task) || !/^[A-Z]+-[0-9]{3}$/.test(task.id ?? '')) {
      add('Task has an invalid identifier'); continue;
    }
    if (tasks.has(task.id)) add(`Duplicate task id ${task.id}`);
    tasks.set(task.id, task);
    if (!STATUSES.has(task.status)) add(`${task.id}: invalid status`);
    if (!task.title || !task.owner || !task.source_ref) add(`${task.id}: missing title/owner/source`);
    if (!Array.isArray(task.acceptance) || !task.acceptance.length ||
        task.acceptance.some((x) => typeof x !== 'string' || !x.trim())) {
      add(`${task.id}: missing acceptance criteria`);
    }
    if (!Array.isArray(task.depends_on)) add(`${task.id}: dependencies must be an array`);
    if (typeof task.clinical_gate !== 'boolean') add(`${task.id}: clinical_gate must be boolean`);
  }

  for (const task of tasks.values()) {
    if (!Array.isArray(task.depends_on)) continue;
    const seen = new Set();
    for (const dep of task.depends_on) {
      if (seen.has(dep)) add(`${task.id}: duplicate dependency ${dep}`);
      seen.add(dep);
      if (!tasks.has(dep)) add(`${task.id}: missing dependency ${dep}`);
      if (dep === task.id) add(`${task.id}: self dependency`);
    }
  }

  const state = new Map();
  const visit = (id) => {
    if (state.get(id) === 1) { add(`Dependency cycle includes ${id}`); return; }
    if (state.get(id) === 2) return;
    state.set(id, 1);
    for (const dep of tasks.get(id)?.depends_on ?? []) if (tasks.has(dep)) visit(dep);
    state.set(id, 2);
  };
  for (const id of tasks.keys()) visit(id);

  const evidenceByTask = new Map();
  const evidenceIDs = new Set();
  for (const record of ledger.records) {
    if (!object(record) || typeof record.id !== 'string' || !record.id) {
      add('Evidence record missing identifier'); continue;
    }
    if (evidenceIDs.has(record.id)) add(`Duplicate evidence id ${record.id}`);
    evidenceIDs.add(record.id);
    if (!tasks.has(record.task_id)) add(`${record.id}: unknown task ${record.task_id}`);
    if (!['verified', 'failed', 'pending'].includes(record.result)) add(`${record.id}: invalid result`);
    if (!SHA_PATTERN.test(record.commit_sha ?? '')) add(`${record.id}: missing exact commit SHA`);
    if (typeof record.url !== 'string' || !record.url.startsWith('https://github.com/')) {
      add(`${record.id}: evidence URL must be a GitHub URL`);
    }
    if (typeof record.date !== 'string' || !DATE_PATTERN.test(record.date)) add(`${record.id}: invalid date`);
    if (typeof record.type !== 'string' || !record.type || !record.summary) {
      add(`${record.id}: missing evidence type or summary`);
    }
    if (record.type === 'clinical_approval') {
      if (!record.approved_by || !record.approval_reference) {
        add(`${record.id}: clinical approval requires named approver and independent approval reference`);
      }
    }
    const records = evidenceByTask.get(record.task_id) ?? [];
    records.push(record);
    evidenceByTask.set(record.task_id, records);
  }

  for (const task of tasks.values()) {
    const deps = Array.isArray(task.depends_on) ? task.depends_on : [];
    const incomplete = deps.filter((id) => tasks.get(id)?.status !== 'complete');
    if (['complete', 'in_progress'].includes(task.status) && incomplete.length) {
      add(`${task.id}: ${task.status} while dependencies incomplete: ${incomplete.join(', ')}`);
    }
    if (task.status === 'blocked' && !incomplete.length) {
      add(`${task.id}: blocked but all dependencies are complete; use not_started or needs_review`);
    }
    if (task.status !== 'complete') continue;
    const records = (evidenceByTask.get(task.id) ?? []).filter((r) => r.result === 'verified');
    if (!records.length) add(`${task.id}: complete without passing evidence`);
    if (task.clinical_gate && !records.some((r) => r.type === 'clinical_approval' && r.approved_by && r.approval_reference)) {
      add(`${task.id}: clinical gate marked complete without a recorded human approval`);
    }
  }
  return errors;
}

export function summary(graph) {
  const counts = Object.fromEntries([...STATUSES].map((s) => [s, 0]));
  const byID = new Map(graph.tasks.map((t) => [t.id, t]));
  for (const task of graph.tasks) if (task.status in counts) counts[task.status]++;
  const eligible = graph.tasks.filter((task) => task.status === 'not_started' &&
    task.depends_on.every((id) => byID.get(id)?.status === 'complete')).map((task) => task.id);
  return { counts, eligible };
}

function run() {
  let graph, ledger;
  try {
    graph = JSON.parse(readFileSync(resolve(ROOT, 'engineering/task-graph.json'), 'utf8'));
    ledger = JSON.parse(readFileSync(resolve(ROOT, 'engineering/evidence-ledger.json'), 'utf8'));
  } catch (error) {
    console.error(`Failed to load graph/ledger: ${error.message}`);
    process.exitCode = 1; return;
  }
  const errors = validateGraph(graph, ledger);
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1; return;
  }
  const { counts, eligible } = summary(graph);
  if (process.argv.includes('--summary')) {
    console.log('## Engineering graph verification');
    console.log('Result: PASS (structural integrity only; no clinical sign-off inferred).');
    console.log(`Tasks: ${graph.tasks.length}; complete: ${counts.complete}; in progress: ${counts.in_progress}; blocked: ${counts.blocked}; needs review: ${counts.needs_review}; not started: ${counts.not_started}`);
    console.log(`Eligible not-started tasks: ${eligible.length ? eligible.join(', ') : 'none'}`);
    console.log('Snapshot is historical; reconcile latest sprint branch, GitHub Actions and actual human approvals before advancing tasks.');
  } else {
    console.log(`Graph PASS: ${graph.tasks.length} tasks, ${ledger.records.length} evidence records. Structural verification only.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
