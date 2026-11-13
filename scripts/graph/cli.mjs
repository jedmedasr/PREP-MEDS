#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { validate, validateHistory, completionTransitions, reconcile, handoff, canonical, SHA } from './core.mjs';
import { GitHubClient, collect, claim } from './github.mjs';
import { analyzeIncidents } from './improvement.mjs';

export function save(path, value) {
  const body = JSON.stringify(value, null, 2) + '\n';
  mkdirSync(dirname(path), { recursive: true });
  try { writeFileSync(path, body, { flag: 'wx' }); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    let previous;
    try { previous = JSON.parse(readFileSync(path, 'utf8')); } catch { throw new Error('OUTPUT_INCOMPLETE: inspect interrupted write; no overwrite attempted'); }
    if (canonical(previous) !== canonical(value)) throw new Error('OUTPUT_CONFLICT: append a new report; never overwrite historical evidence');
  }
}
const read = (root, path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

export async function main(argv = process.argv.slice(2)) {
  const { positionals, values: opt } = parseArgs({ args: argv, allowPositionals: true, strict: true,
    options: { root: { type: 'string' }, live: { type: 'boolean' }, offline: { type: 'boolean' },
      'base-ref': { type: 'string' }, output: { type: 'string' }, input: { type: 'string' },
      write: { type: 'boolean' }, task: { type: 'string' }, owner: { type: 'string' }, key: { type: 'string' },
      'expect-main': { type: 'string' }, help: { type: 'boolean' } } });
  const command = positionals[0];
  if (opt.help || !command) {
    console.log('Usage: node scripts/graph/cli.mjs status|next|verify|reconcile|handoff|claim|improve [options]\nRead-only by default. next/reconcile use live GitHub; --offline is explicitly non-executable planning.\nverify --base-ref <40-char-sha> [--live]; handoff --input <json> [--live] [--output <new-json>].\nclaim --task ENG-001 --owner <login> --key <session-key> --expect-main <sha> --write\nGH_TOKEN or GITHUB_TOKEN is required for live reads. Claims require a user token with Contents:write.');
    return 0;
  }
  if (!['status', 'next', 'verify', 'reconcile', 'handoff', 'claim', 'improve'].includes(command) || positionals.length !== 1) throw new Error('UNKNOWN_COMMAND');
  if (opt.live && opt.offline) throw new Error('CONFLICTING_MODES');
  if (opt.write && command !== 'claim') throw new Error('WRITE_SUPPORTED_ONLY_FOR_CLAIM');
  if (command === 'claim' && (!opt.write || opt.offline)) throw new Error('CLAIM_REQUIRES_EXPLICIT_LIVE_WRITE');
  const root = resolve(opt.root ?? fileURLToPath(new URL('../../', import.meta.url)));
  const graph = read(root, 'engineering/task-graph.json');
  const ledger = read(root, 'engineering/evidence-ledger.json');
  const policy = read(root, 'engineering/orchestrator-policy.json');
  const errors = validate(graph, ledger, policy);
  if (errors.length) { console.log(JSON.stringify({ valid: false, errors }, null, 2)); return 1; }
  let previous = null, priorLedger = null;
  if (opt['base-ref']) {
    if (!SHA.test(opt['base-ref'])) throw new Error('EXACT_BASE_SHA_REQUIRED');
    const at = (path) => JSON.parse(execFileSync('git', ['show', `${opt['base-ref']}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
    previous = at('engineering/task-graph.json'); priorLedger = at('engineering/evidence-ledger.json');
    errors.push(...validateHistory(graph, ledger, previous, priorLedger));
  }
  const live = !opt.offline && (Boolean(opt.live) || ['next', 'reconcile', 'claim'].includes(command));
  let client, state;
  if (live) {
    client = new GitHubClient(graph.repository, process.env.GH_TOKEN || process.env.GITHUB_TOKEN);
    state = await collect(client, graph, ledger, policy);
  }
  if (previous) errors.push(...completionTransitions(graph, previous, ledger, state, policy));
  const report = reconcile(graph, ledger, policy, state);
  const improvement = analyzeIncidents(root);
  let result = command === 'improve' ? improvement : { ...report, improvement };
  if (command === 'verify') result = { schema_version: 2, valid: !errors.length, errors,
    structural_verification: !errors.length ? 'PASS' : 'FAIL', history_checked: Boolean(previous),
    live_verification: live ? { ...report, improvement } : 'NOT_RUN: structure is not independent evidence or clinical approval', improvement };
  if (command === 'handoff') {
    if (!opt.input) throw new Error('HANDOFF_INPUT_REQUIRED');
    result = handoff({ ...report, improvement }, read(root, opt.input));
  }
  if (command === 'claim') {
    if (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()) throw new Error('CLEAN_WORKTREE_REQUIRED');
    if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() !== state?.main_sha) throw new Error('CLAIM_FROM_LATEST_MAIN_REQUIRED');
    result = await claim(client, graph, ledger, policy, state, { taskId: opt.task, owner: opt.owner, key: opt.key, expectedMain: opt['expect-main'], write: opt.write });
  }
  if (command === 'next' && opt.offline) result = { ...report, improvement, dispatch_authorized: false, note: 'Structural planning only. Never claim or start work from this offline result.' };
  if (opt.output) save(resolve(root, opt.output), result);
  console.log(JSON.stringify(result, null, 2));
  return errors.length ? 1 : live && (!state.complete || state.errors.length) ? 2 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((e) => {
    console.error(JSON.stringify({ valid: false, error: e.message, recovery: 'Do not retry mutations blindly. Re-fetch state, inspect claims and handoffs, resolve the blocker explicitly.' }));
    process.exitCode = 1;
  });
}
