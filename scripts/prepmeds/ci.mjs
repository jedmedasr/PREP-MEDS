#!/usr/bin/env node
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const MAX_REQUEST_BYTES = 1024 * 1024;
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9-]+$/;
export const LANES = new Set(['odd', 'even']);

function git(cwd, args, options = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

export function validateLane(lane) {
  if (!LANES.has(lane)) throw new Error('lane must be odd or even');
  return lane;
}

export function parseCli(argv) {
  const [command, ...rest] = argv;
  const values = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith('--')) throw new Error(`unexpected argument: ${token}`);
    const name = token.slice(2);
    const value = rest[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`missing value for --${name}`);
    values[name] = value;
    i += 1;
  }
  return { command, values };
}

function ensureInside(root, candidate) {
  const rootPath = resolve(root);
  const candidatePath = resolve(candidate);
  if (candidatePath !== rootPath && !candidatePath.startsWith(`${rootPath}/`)) {
    throw new Error('request path escaped the lane checkout');
  }
  return candidatePath;
}

export function discoverPendingRequests(laneDir, gitImpl = git) {
  const commits = gitImpl(laneDir, [
    'log',
    '--reverse',
    '--format=%H',
    '--',
    'requests',
  ])
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  const seen = new Set();
  const pending = [];
  for (const commit of commits) {
    const paths = gitImpl(laneDir, [
      'diff-tree',
      '--root',
      '--no-commit-id',
      '--name-only',
      '--diff-filter=A',
      '-r',
      commit,
      '--',
      'requests',
    ])
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean)
      .sort();

    for (const path of paths) {
      if (!/^requests\/[A-Za-z0-9-]+\.json$/.test(path)) continue;
      if (seen.has(path)) continue;
      seen.add(path);
      const requestId = basename(path, '.json');
      const responsePath = join(laneDir, 'responses', `${requestId}.json`);
      if (!existsSync(responsePath)) pending.push({ commit, path, requestId, responsePath });
    }
  }
  return pending;
}

function isZeroSha(value) {
  return typeof value === 'string' && /^0+$/.test(value);
}

function isAncestor(laneDir, older, newer, gitImpl = git) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', older, newer], {
      cwd: laneDir,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

export function activityContainsCommit(activity, commit, laneDir, gitImpl = git) {
  if (!activity || activity.activity_type !== 'push') return false;
  const after = activity.after;
  const before = activity.before;
  if (typeof after !== 'string' || typeof before !== 'string') return false;
  if (commit === after) return true;
  if (!isAncestor(laneDir, commit, after, gitImpl)) return false;
  if (isZeroSha(before)) return true;
  if (commit === before) return false;
  return isAncestor(laneDir, before, commit, gitImpl);
}

export function resolvePusherForCommit(activities, commit, laneDir, gitImpl = git) {
  const matches = activities
    .filter((activity) => activityContainsCommit(activity, commit, laneDir, gitImpl))
    .map((activity) => activity.pusher?.login)
    .filter(Boolean);
  const unique = [...new Set(matches)];
  if (unique.length !== 1) {
    throw new Error(
      unique.length === 0
        ? `PREPMEDS_RELAY_IDENTITY_NOT_FOUND: no GitHub pusher found for ${commit}`
        : `PREPMEDS_RELAY_IDENTITY_AMBIGUOUS: multiple GitHub pushers found for ${commit}`,
    );
  }
  return unique[0];
}

function nextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2] === 'next') return match[1];
  }
  return null;
}

export async function fetchLaneActivities({
  repository,
  lane,
  githubToken,
  fetchImpl = fetch,
}) {
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('PREPMEDS_RELAY_CONFIG: GITHUB_REPOSITORY must be owner/repo');
  }
  validateLane(lane);
  let url =
    `https://api.github.com/repos/${repository}/activity` +
    `?ref=${encodeURIComponent(`refs/heads/lane/${lane}`)}&activity_type=push&direction=desc&per_page=100`;
  const activities = [];
  for (let page = 0; url && page < 20; page += 1) {
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) {
      throw new Error(`PREPMEDS_RELAY_GITHUB_ACTIVITY: HTTP ${response.status}`);
    }
    const body = await response.json();
    if (!Array.isArray(body)) throw new Error('PREPMEDS_RELAY_GITHUB_ACTIVITY: response is not an array');
    activities.push(...body);
    url = nextLink(response.headers.get('link'));
  }
  return activities;
}

export async function dataApiRpc({
  baseUrl,
  publishableKey,
  functionName,
  body,
  fetchImpl = fetch,
}) {
  if (!baseUrl || !publishableKey) throw new Error('PREPMEDS_RELAY_CONFIG: Supabase URL/key missing');
  const response = await fetchImpl(
    `${baseUrl.replace(/\/$/, '')}/rest/v1/rpc/${functionName}`,
    {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
        'Content-Profile': 'prepmeds',
      },
      body: JSON.stringify(body),
    },
  );
  const raw = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${functionName} returned non-JSON HTTP ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(parsed?.message || `${functionName} failed with HTTP ${response.status}`);
  }
  return parsed;
}

export function loadRequestFile(laneDir, item, gitImpl = git) {
  ensureInside(laneDir, join(laneDir, item.path));

  const treeLine = gitImpl(laneDir, ['ls-tree', item.commit, '--', item.path]);
  const mode = treeLine.split(/\\s+/)[0];
  if (mode !== '100644' && mode !== '100755') {
    throw new Error('PREPMEDS_RELAY_BAD_REQUEST: request must be a regular committed file');
  }

  const size = Number(gitImpl(laneDir, ['cat-file', '-s', `${item.commit}:${item.path}`]));
  if (!Number.isFinite(size) || size > MAX_REQUEST_BYTES) {
    throw new Error(`PREPMEDS_RELAY_REQUEST_TOO_LARGE: maximum is ${MAX_REQUEST_BYTES} bytes`);
  }

  const committedText = gitImpl(laneDir, ['show', `${item.commit}:${item.path}`], { maxBuffer: MAX_REQUEST_BYTES + 1024 });
  let request;
  try {
    request = JSON.parse(committedText);
  } catch {
    throw new Error('PREPMEDS_RELAY_BAD_JSON: request is not valid JSON');
  }
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new Error('PREPMEDS_RELAY_BAD_REQUEST: request must be one JSON object');
  }
  if (
    typeof request.request_id !== 'string' ||
    !REQUEST_ID_PATTERN.test(request.request_id) ||
    request.request_id !== item.requestId
  ) {
    throw new Error('PREPMEDS_RELAY_BAD_REQUEST_ID: request_id must match the request filename');
  }
  return request;
}

export async function relayOne({
  request,
  requestCommit,
  lane,
  githubLogin,
  ciToken,
  rpc,
}) {
  validateLane(lane);
  const forwarded = { ...request };
  delete forwarded.github_login;
  delete forwarded.lane;
  if (forwarded.op === 'submit') forwarded.git_commit = requestCommit;

  const result = await rpc('ci_relay', {
    p_ci_token: ciToken,
    p_github_login: githubLogin,
    p_lane: lane,
    p_request: forwarded,
  });

  const wantsClaim = forwarded.then === 'claim';
  const startSucceeded =
    forwarded.op === 'start_session' && result?.ok === true && Number.isInteger(Number(result.session_id));
  const submitSucceeded =
    forwarded.op === 'submit' && result?.ok === true && result?.accepted === true;

  if (wantsClaim && (startSucceeded || submitSucceeded)) {
    const sessionId = startSucceeded ? Number(result.session_id) : Number(forwarded.session_id);
    result.next = await rpc('ci_relay', {
      p_ci_token: ciToken,
      p_github_login: githubLogin,
      p_lane: lane,
      p_request: { op: 'claim', session_id: sessionId },
    });
  }
  return result;
}

function errorResponse(error) {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

export async function processRelay({
  lane,
  laneDir,
  repository,
  githubToken,
  ciToken,
  baseUrl,
  publishableKey,
  fetchImpl = fetch,
  gitImpl = git,
  rpcOverride,
}) {
  validateLane(lane);
  const pending = discoverPendingRequests(laneDir, gitImpl);
  if (pending.length === 0) return { processed: 0, responses: [] };

  const activities = await fetchLaneActivities({
    repository,
    lane,
    githubToken,
    fetchImpl,
  });

  const rpc =
    rpcOverride ||
    ((name, body) =>
      dataApiRpc({
        baseUrl,
        publishableKey,
        functionName: name,
        body,
        fetchImpl,
      }));

  mkdirSync(join(laneDir, 'responses'), { recursive: true });
  const results = [];
  for (const item of pending) {
    let responseBody;
    try {
      const request = loadRequestFile(laneDir, item);
      const githubLogin = resolvePusherForCommit(activities, item.commit, laneDir, gitImpl);
      responseBody = await relayOne({
        request,
        requestCommit: item.commit,
        lane,
        githubLogin,
        ciToken,
        rpc,
      });
    } catch (error) {
      responseBody = errorResponse(error);
    }
    const responsePath = ensureInside(laneDir, item.responsePath);
    mkdirSync(dirname(responsePath), { recursive: true });
    writeFileSync(responsePath, `${JSON.stringify(responseBody, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });
    results.push({ request_id: item.requestId, commit: item.commit, response: responseBody });
  }
  return { processed: results.length, responses: results };
}

async function listPendingTests({ ciToken, baseUrl, publishableKey, fetchImpl = fetch }) {
  return dataApiRpc({
    baseUrl,
    publishableKey,
    functionName: 'ci_pending_tests',
    body: { p_ci_token: ciToken, p_limit: 100 },
    fetchImpl,
  });
}

async function commandTestPending(config) {
  const pending = await listPendingTests(config);
  process.stdout.write(`${JSON.stringify(pending, null, 2)}\n`);
}

async function commandRecheckPassages(config) {
  const pending = await listPendingTests(config);
  if (Array.isArray(pending) && pending.length > 0) {
    throw new Error(
      'PREPMEDS_RECHECK_NOT_READY: passage re-verification is implemented in Phase 3; refusing to imply verification',
    );
  }
  process.stdout.write('[]\n');
}

function envConfig() {
  return {
    ciToken: process.env.PREPMEDS_CI_TOKEN,
    baseUrl: process.env.PREPMEDS_SUPABASE_URL,
    publishableKey: process.env.PREPMEDS_PUBLISHABLE_KEY,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const { command, values } = parseCli(argv);
  if (command === 'relay') {
    const lane = validateLane(values.lane);
    const laneDir = values['lane-dir'];
    if (!laneDir) throw new Error('--lane-dir is required');
    const result = await processRelay({
      lane,
      laneDir,
      repository: process.env.GITHUB_REPOSITORY || process.env.PREPMEDS_REPOSITORY,
      githubToken: process.env.GITHUB_TOKEN,
      ...envConfig(),
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  if (command === 'test-pending') {
    await commandTestPending(envConfig());
    return;
  }
  if (command === 'recheck-passages') {
    await commandRecheckPassages(envConfig());
    return;
  }
  throw new Error('usage: ci.mjs relay --lane odd|even --lane-dir <path> | test-pending | recheck-passages');
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
