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
  if (!activity || activity.push_type === 'force') return false;
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

export async function fetchRepositoryPushEvents({
  repository,
  lane,
  githubToken,
  fetchImpl = fetch,
}) {
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('PREPMEDS_RELAY_CONFIG: GITHUB_REPOSITORY must be owner/repo');
  }
  validateLane(lane);
  const laneRef = `refs/heads/lane/${lane}`;
  let url = `https://api.github.com/repos/${repository}/events?per_page=100`;
  const activities = [];
  for (let page = 0; url && page < 10; page += 1) {
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) {
      throw new Error(`PREPMEDS_RELAY_GITHUB_EVENTS: HTTP ${response.status}`);
    }
    const body = await response.json();
    if (!Array.isArray(body)) throw new Error('PREPMEDS_RELAY_GITHUB_EVENTS: response is not an array');
    for (const event of body) {
      if (event?.type !== 'PushEvent' || event?.payload?.ref !== laneRef) continue;
      const before = event.payload.before;
      const after = event.payload.head;
      const login = event.actor?.login;
      if (typeof before !== 'string' || typeof after !== 'string' || typeof login !== 'string') continue;
      activities.push({
        before,
        after,
        ref: laneRef,
        push_type: 'normal',
        pusher: { login },
      });
    }
    url = nextLink(response.headers.get('link'));
  }
  return activities;
}

export async function fetchRelayWorkflowActors({
  repository,
  lane,
  githubToken,
  fetchImpl = fetch,
}) {
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('PREPMEDS_RELAY_CONFIG: GITHUB_REPOSITORY must be owner/repo');
  }
  validateLane(lane);
  const branch = `lane/${lane}`;
  let url =
    `https://api.github.com/repos/${repository}/actions/runs` +
    `?branch=${encodeURIComponent(branch)}&event=push&per_page=100`;
  const activities = [];
  for (let page = 0; url && page < 10; page += 1) {
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) {
      throw new Error(`PREPMEDS_RELAY_GITHUB_ACTIONS: HTTP ${response.status}`);
    }
    const body = await response.json();
    if (!body || !Array.isArray(body.workflow_runs)) {
      throw new Error('PREPMEDS_RELAY_GITHUB_ACTIONS: response missing workflow_runs');
    }
    for (const run of body.workflow_runs) {
      if (
        run?.event !== 'push' ||
        run?.head_branch !== branch ||
        run?.path !== '.github/workflows/relay-poke.yml'
      ) continue;
      const after = run.head_sha;
      const login = run.actor?.login;
      if (typeof after !== 'string' || typeof login !== 'string') continue;
      activities.push({
        before: after,
        after,
        ref: `refs/heads/${branch}`,
        push_type: 'normal',
        pusher: { login },
      });
    }
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
  const mode = treeLine.split(/\s+/)[0];
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

  const identitySources = await Promise.allSettled([
    fetchLaneActivities({ repository, lane, githubToken, fetchImpl }),
    fetchRepositoryPushEvents({ repository, lane, githubToken, fetchImpl }),
    fetchRelayWorkflowActors({ repository, lane, githubToken, fetchImpl }),
  ]);
  const activities = identitySources
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
  if (identitySources.every((result) => result.status === 'rejected')) {
    const details = identitySources
      .map((result) => (result.status === 'rejected' ? String(result.reason) : ''))
      .filter(Boolean)
      .join('; ');
    throw new Error(`PREPMEDS_RELAY_GITHUB_IDENTITY_SOURCES: ${details}`);
  }

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
  const deferredRequests = [];
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
      if (
        error instanceof Error &&
        error.message.startsWith('PREPMEDS_RELAY_IDENTITY_NOT_FOUND:')
      ) {
        deferredRequests.push({
          request_id: item.requestId,
          commit: item.commit,
          reason: error.message,
        });
        continue;
      }
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
  return {
    processed: results.length,
    deferred: deferredRequests.length,
    deferred_requests: deferredRequests,
    responses: results,
  };
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

function textValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizedIds(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(textValue))].sort();
}

function suiteResult(suite, checks) {
  const failedChecks = checks.filter((item) => item.passed !== true);
  return {
    suite,
    passed: failedChecks.length === 0,
    total: checks.length,
    failed: failedChecks.length,
    report: {
      checks,
      failed_checks: failedChecks.map((item) => item.name),
    },
  };
}

export function runMappingSuite(item) {
  const revision = item?.revision;
  const medications = Array.isArray(revision?.medications) ? revision.medications : [];
  const revisionIdsRaw = medications.map((medication) => medication?.medication_id);
  const currentIdsRaw = Array.isArray(item?.current_medication_ids) ? item.current_medication_ids : [];
  const revisionIds = normalizedIds(revisionIdsRaw);
  const currentIds = normalizedIds(currentIdsRaw);
  const checks = [
    {
      name: 'revision_identity_matches_queue_item',
      passed:
        Number(revision?.revision_id) === Number(item?.revision_id) &&
        revision?.group_id === item?.group_id &&
        revision?.content_sha256 === item?.content_sha256,
    },
    {
      name: 'current_canonical_mapping_is_nonempty',
      passed: currentIds.length > 0 && currentIds.length === currentIdsRaw.length,
    },
    {
      name: 'revision_medication_mapping_is_well_formed',
      passed:
        revisionIds.length > 0 &&
        revisionIds.length === revisionIdsRaw.length &&
        medications.every((medication) => textValue(medication?.medication_id)),
    },
    {
      name: 'revision_mapping_matches_current_canonical_mapping',
      passed: JSON.stringify(revisionIds) === JSON.stringify(currentIds),
      detail: { revision_medication_ids: revisionIds, current_medication_ids: currentIds },
    },
  ];
  return suiteResult('mapping', checks);
}

export function runEvidenceSuite(item) {
  const revision = item?.revision;
  const sources = Array.isArray(revision?.sources) ? revision.sources : [];
  const passages = Array.isArray(revision?.passages) ? revision.passages : [];
  const recommendations = Array.isArray(revision?.recommendations) ? revision.recommendations : [];
  const coverage = Array.isArray(revision?.scenario_coverage) ? revision.scenario_coverage : [];
  const questions = Array.isArray(revision?.open_questions) ? revision.open_questions : [];
  const components = Array.isArray(revision?.components) ? revision.components : [];
  const sourceById = new Map(sources.map((source) => [source?.source_id, source]));
  const passageById = new Map(passages.map((passage) => [Number(passage?.passage_id), passage]));
  const comparedSources = sources.filter((source) => source?.comparison?.status === 'COMPARED');

  const recommendationSourcesValid = recommendations.every((recommendation) => {
    const source = sourceById.get(recommendation?.source_id);
    return (
      source &&
      source?.comparison?.status === 'COMPARED' &&
      textValue(recommendation?.scenario_key) &&
      textValue(recommendation?.action) &&
      textValue(recommendation?.summary)
    );
  });
  const recommendationPassagesValid = recommendations.every((recommendation) => {
    const passage = passageById.get(Number(recommendation?.passage_id));
    return (
      Number.isSafeInteger(Number(recommendation?.passage_id)) &&
      passage &&
      passage?.source_id === recommendation?.source_id &&
      textValue(passage?.locator) &&
      textValue(passage?.quote)
    );
  });
  const noGuidancePackageIsExplicit =
    recommendations.length > 0 || (sources.length > 0 && comparedSources.length === 0);

  const checks = [
    {
      name: 'revision_identity_matches_queue_item',
      passed:
        Number(revision?.revision_id) === Number(item?.revision_id) &&
        revision?.group_id === item?.group_id &&
        revision?.content_sha256 === item?.content_sha256,
    },
    {
      name: 'formulation_decision_is_documented',
      passed:
        textValue(revision?.formulation?.decision) &&
        textValue(revision?.formulation?.rationale),
    },
    {
      name: 'source_comparison_is_documented',
      passed:
        sources.length > 0 &&
        sources.every(
          (source) =>
            textValue(source?.source_id) &&
            textValue(source?.comparison?.status) &&
            textValue(source?.comparison?.checked_locators),
        ),
    },
    {
      name: 'scenario_coverage_is_documented',
      passed:
        coverage.length > 0 &&
        coverage.every(
          (scenario) =>
            textValue(scenario?.scenario_key) &&
            textValue(scenario?.status) &&
            textValue(scenario?.reason),
        ),
    },
    {
      name: 'blocking_questions_are_absent',
      passed: questions.every((question) => question?.blocking !== true),
    },
    {
      name: 'component_revisions_are_current',
      passed: components.every((component) => component?.is_current === true),
    },
    {
      name: 'recommendations_or_explicit_no_guidance_are_present',
      passed: noGuidancePackageIsExplicit,
    },
    {
      name: 'recommendations_reference_compared_sources',
      passed: recommendationSourcesValid,
    },
    {
      name: 'recommendations_reference_exact_source_passages',
      passed: recommendationPassagesValid,
    },
  ];
  return suiteResult('evidence', checks);
}

async function recordTestRun(config, item, result, metadata, rpcOverride) {
  const rpc =
    rpcOverride ||
    ((name, body) =>
      dataApiRpc({
        baseUrl: config.baseUrl,
        publishableKey: config.publishableKey,
        functionName: name,
        body,
      }));
  return rpc('ci_record_test_run', {
    p_ci_token: config.ciToken,
    p_revision_id: Number(item.revision_id),
    p_content_sha256: item.content_sha256,
    p_suite: result.suite,
    p_suite_version: Number(item.min_suite_version),
    p_passed: result.passed,
    p_total: result.total,
    p_failed: result.failed,
    p_commit_sha: metadata.commitSha,
    p_ci_run_id: metadata.ciRunId,
    p_ci_run_attempt: metadata.ciRunAttempt,
    p_report: result.report,
  });
}

export async function runPendingTests(config, metadata, rpcOverride) {
  if (!textValue(metadata?.commitSha) || !/^[0-9a-f]{40}$/i.test(metadata.commitSha)) {
    throw new Error('PREPMEDS_CI_CONFIG: exact GITHUB_SHA is required');
  }
  if (!Number.isSafeInteger(Number(metadata?.ciRunId)) || Number(metadata.ciRunId) < 1) {
    throw new Error('PREPMEDS_CI_CONFIG: positive GITHUB_RUN_ID is required');
  }
  const pending = await listPendingTests(config);
  if (!Array.isArray(pending)) throw new Error('PREPMEDS_CI_PENDING_SHAPE: expected an array');
  const recorded = [];
  for (const item of pending) {
    const needs = Array.isArray(item?.needs) ? item.needs : [];
    for (const suite of needs) {
      let result;
      if (suite === 'mapping') result = runMappingSuite(item);
      else if (suite === 'evidence') result = runEvidenceSuite(item);
      else throw new Error(`PREPMEDS_CI_UNKNOWN_SUITE: ${suite}`);
      const database = await recordTestRun(
        config,
        item,
        result,
        {
          commitSha: metadata.commitSha,
          ciRunId: Number(metadata.ciRunId),
          ciRunAttempt: Number(metadata.ciRunAttempt || 1),
        },
        rpcOverride,
      );
      recorded.push({
        revision_id: Number(item.revision_id),
        group_id: item.group_id,
        suite,
        passed: result.passed,
        total: result.total,
        failed: result.failed,
        database,
      });
    }
  }
  return { pending_revisions: pending.length, recorded_runs: recorded.length, results: recorded };
}

async function commandTestPending(config) {
  const pending = await listPendingTests(config);
  process.stdout.write(`${JSON.stringify(pending, null, 2)}\n`);
}

async function commandRunTests(config) {
  const result = await runPendingTests(config, {
    commitSha: process.env.GITHUB_SHA,
    ciRunId: Number(process.env.GITHUB_RUN_ID),
    ciRunAttempt: Number(process.env.GITHUB_RUN_ATTEMPT || 1),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.results.some((item) => item.passed !== true)) process.exitCode = 1;
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
  if (command === 'run-tests') {
    await commandRunTests(envConfig());
    return;
  }
  if (command === 'recheck-passages') {
    await commandRecheckPassages(envConfig());
    return;
  }
  throw new Error('usage: ci.mjs relay --lane odd|even --lane-dir <path> | test-pending | run-tests | recheck-passages');
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
