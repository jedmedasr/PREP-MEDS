import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  MAX_REQUEST_BYTES,
  discoverPendingRequests,
  loadRequestFile,
  processRelay,
  relayOne,
  resolvePusherForCommit,
  runEvidenceSuite,
  runMappingSuite,
  runPendingTests,
} from '../prepmeds/ci.mjs';

function runGit(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'prepmeds-relay-'));
  runGit(dir, 'init', '-q');
  runGit(dir, 'config', 'user.name', 'Relay Test');
  runGit(dir, 'config', 'user.email', 'relay@example.invalid');
  mkdirSync(join(dir, 'requests'), { recursive: true });
  mkdirSync(join(dir, 'responses'), { recursive: true });
  writeFileSync(join(dir, 'README.md'), 'relay fixture\n');
  runGit(dir, 'add', '.');
  runGit(dir, 'commit', '-q', '-m', 'base');
  return dir;
}

function addRequest(dir, requestId, body) {
  writeFileSync(join(dir, 'requests', `${requestId}.json`), body);
  runGit(dir, 'add', `requests/${requestId}.json`);
  runGit(dir, 'commit', '-q', '-m', `request ${requestId}`);
  return runGit(dir, 'rev-parse', 'HEAD');
}

function activityResponse(activities) {
  return new Response(JSON.stringify(activities), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

test('pending requests are discovered in introducing-commit order and completed responses are skipped', () => {
  const dir = makeRepo();
  const first = addRequest(dir, 'odd-001', JSON.stringify({ request_id: 'odd-001', op: 'claim', session_id: 1 }));
  const second = addRequest(dir, 'odd-002', JSON.stringify({ request_id: 'odd-002', op: 'claim', session_id: 1 }));
  writeFileSync(join(dir, 'responses', 'odd-001.json'), '{}\n');

  const pending = discoverPendingRequests(dir);
  assert.deepEqual(
    pending.map(({ commit, requestId }) => ({ commit, requestId })),
    [{ commit: second, requestId: 'odd-002' }],
  );
  assert.notEqual(first, second);
});

test('invalid JSON and oversized files are rejected before any database operation can be formed', () => {
  const dir = makeRepo();
  const badCommit = addRequest(dir, 'odd-bad', '{not json');
  const bad = discoverPendingRequests(dir).find((item) => item.commit === badCommit);
  assert.throws(() => loadRequestFile(dir, bad), /PREPMEDS_RELAY_BAD_JSON/);

  const hugeBody = 'x'.repeat(MAX_REQUEST_BYTES + 1);
  const hugeCommit = addRequest(dir, 'odd-huge', hugeBody);
  const huge = discoverPendingRequests(dir).find((item) => item.commit === hugeCommit);
  assert.throws(() => loadRequestFile(dir, huge), /PREPMEDS_RELAY_REQUEST_TOO_LARGE/);
});

test('request content is immutable at the introducing commit even if a later commit edits the path', () => {
  const dir = makeRepo();
  const requestId = 'odd-immutable-001';
  const original = { request_id: requestId, op: 'claim', session_id: 11 };
  const commit = addRequest(dir, requestId, JSON.stringify(original));

  writeFileSync(
    join(dir, 'requests', `${requestId}.json`),
    JSON.stringify({ request_id: requestId, op: 'release', session_id: 999 }),
  );
  runGit(dir, 'add', `requests/${requestId}.json`);
  runGit(dir, 'commit', '-q', '-m', 'attempt to mutate earlier request');

  const item = discoverPendingRequests(dir).find((candidate) => candidate.commit === commit);
  assert.deepEqual(loadRequestFile(dir, item), original);
});

test('GitHub pusher identity comes from repository activity, not request-controlled identity fields', async () => {
  const calls = [];
  const result = await relayOne({
    request: {
      request_id: 'odd-submit-001',
      op: 'submit',
      session_id: 7,
      task_id: 8,
      claim_token: '11111111-1111-1111-1111-111111111111',
      submission_id: 'submission-001',
      package: { schema_version: 1 },
      git_commit: 'attacker-controlled',
      github_login: 'attacker',
      lane: 'even',
    },
    requestCommit: 'a'.repeat(40),
    lane: 'odd',
    githubLogin: 'trusted-pusher',
    ciToken: 'ci-token',
    rpc: async (name, body) => {
      calls.push({ name, body });
      return { ok: true, accepted: false };
    },
  });

  assert.equal(result.accepted, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.p_github_login, 'trusted-pusher');
  assert.equal(calls[0].body.p_lane, 'odd');
  assert.equal(calls[0].body.p_request.git_commit, 'a'.repeat(40));
  assert.equal('github_login' in calls[0].body.p_request, false);
  assert.equal('lane' in calls[0].body.p_request, false);
});

test('then=claim chains only after a successful start_session or accepted submit', async () => {
  const calls = [];
  const started = await relayOne({
    request: { request_id: 'odd-start-001', op: 'start_session', label: 'test', then: 'claim' },
    requestCommit: 'b'.repeat(40),
    lane: 'odd',
    githubLogin: 'trusted-pusher',
    ciToken: 'ci-token',
    rpc: async (_name, body) => {
      calls.push(body.p_request);
      if (body.p_request.op === 'start_session') return { ok: true, session_id: 44 };
      return { ok: true, status: 'CLAIMED', task: { task_id: 9 } };
    },
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { op: 'claim', session_id: 44 });
  assert.equal(started.next.status, 'CLAIMED');

  let rejectedCalls = 0;
  const rejected = await relayOne({
    request: {
      request_id: 'odd-submit-002',
      op: 'submit',
      session_id: 44,
      then: 'claim',
    },
    requestCommit: 'c'.repeat(40),
    lane: 'odd',
    githubLogin: 'trusted-pusher',
    ciToken: 'ci-token',
    rpc: async () => {
      rejectedCalls += 1;
      return { ok: true, accepted: false };
    },
  });
  assert.equal(rejectedCalls, 1);
  assert.equal('next' in rejected, false);
});

test('a multi-commit push maps every introduced request to the authenticated pusher', () => {
  const dir = makeRepo();
  const before = runGit(dir, 'rev-parse', 'HEAD');
  const first = addRequest(dir, 'odd-one', JSON.stringify({ request_id: 'odd-one', op: 'claim', session_id: 1 }));
  const second = addRequest(dir, 'odd-two', JSON.stringify({ request_id: 'odd-two', op: 'claim', session_id: 1 }));
  const activities = [
    {
      activity_type: 'push',
      before,
      after: second,
      pusher: { login: 'lane-owner' },
    },
  ];
  assert.equal(resolvePusherForCommit(activities, first, dir), 'lane-owner');
  assert.equal(resolvePusherForCommit(activities, second, dir), 'lane-owner');
});

test('relay-level competing claims in one push yield CLAIMED then RESUMED for the same task', async () => {
  const dir = makeRepo();
  const before = runGit(dir, 'rev-parse', 'HEAD');
  const first = addRequest(
    dir,
    'odd-claim-001',
    JSON.stringify({ request_id: 'odd-claim-001', op: 'claim', session_id: 10 }),
  );
  const second = addRequest(
    dir,
    'odd-claim-002',
    JSON.stringify({ request_id: 'odd-claim-002', op: 'claim', session_id: 10 }),
  );

  const activities = [
    {
      activity_type: 'push',
      before,
      after: second,
      pusher: { login: 'lane-owner' },
    },
  ];
  let held = false;
  const calls = [];
  const result = await processRelay({
    lane: 'odd',
    laneDir: dir,
    repository: 'owner/repo',
    githubToken: 'github-token',
    ciToken: 'ci-token',
    baseUrl: 'https://example.invalid',
    publishableKey: 'publishable',
    fetchImpl: async () => activityResponse(activities),
    rpcOverride: async (name, body) => {
      calls.push({ name, body });
      assert.equal(name, 'ci_relay');
      assert.equal(body.p_github_login, 'lane-owner');
      if (body.p_request.op !== 'claim') throw new Error('unexpected operation');
      if (!held) {
        held = true;
        return { ok: true, status: 'CLAIMED', task: { task_id: 77 }, group: { group_id: 'ING-test' } };
      }
      return { ok: true, status: 'RESUMED', task: { task_id: 77 }, group: { group_id: 'ING-test' } };
    },
  });

  assert.equal(result.processed, 2);
  assert.equal(result.responses[0].commit, first);
  assert.equal(result.responses[1].commit, second);
  assert.equal(result.responses[0].response.status, 'CLAIMED');
  assert.equal(result.responses[1].response.status, 'RESUMED');
  assert.equal(result.responses[0].response.task.task_id, 77);
  assert.equal(result.responses[1].response.task.task_id, 77);
  assert.equal(calls.length, 2);

  const firstResponse = JSON.parse(readFileSync(join(dir, 'responses', 'odd-claim-001.json'), 'utf8'));
  const secondResponse = JSON.parse(readFileSync(join(dir, 'responses', 'odd-claim-002.json'), 'utf8'));
  assert.equal(firstResponse.status, 'CLAIMED');
  assert.equal(secondResponse.status, 'RESUMED');
});

test('repository PushEvent fallback resolves identity when repository activity has not indexed the push', async () => {
  const dir = makeRepo();
  const before = runGit(dir, 'rev-parse', 'HEAD');
  const commit = addRequest(
    dir,
    'even-api-001',
    JSON.stringify({ request_id: 'even-api-001', op: 'claim', session_id: 12 }),
  );
  const calls = [];
  const result = await processRelay({
    lane: 'even',
    laneDir: dir,
    repository: 'owner/repo',
    githubToken: 'github-token',
    ciToken: 'ci-token',
    baseUrl: 'https://example.invalid',
    publishableKey: 'publishable',
    fetchImpl: async (url) => {
      if (String(url).includes('/activity')) return activityResponse([]);
      if (String(url).includes('/events')) {
        return activityResponse([
          {
            type: 'PushEvent',
            actor: { login: 'api-writer' },
            payload: {
              ref: 'refs/heads/lane/even',
              before,
              head: commit,
            },
          },
        ]);
      }
      throw new Error(`unexpected URL: ${url}`);
    },
    rpcOverride: async (name, body) => {
      calls.push({ name, body });
      return { ok: true, status: 'CLAIMED', task: { task_id: 88 } };
    },
  });

  assert.equal(result.processed, 1);
  assert.equal(result.deferred, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.p_github_login, 'api-writer');
  assert.equal(result.responses[0].response.status, 'CLAIMED');
});

test('relay-poke workflow run actor resolves identity before activity APIs index the push', async () => {
  const dir = makeRepo();
  const commit = addRequest(
    dir,
    'even-actions-001',
    JSON.stringify({ request_id: 'even-actions-001', op: 'claim', session_id: 12 }),
  );
  const calls = [];
  const result = await processRelay({
    lane: 'even',
    laneDir: dir,
    repository: 'owner/repo',
    githubToken: 'github-token',
    ciToken: 'ci-token',
    baseUrl: 'https://example.invalid',
    publishableKey: 'publishable',
    fetchImpl: async (url) => {
      const value = String(url);
      if (value.includes('/activity')) return activityResponse([]);
      if (value.includes('/events')) return activityResponse([]);
      if (value.includes('/actions/runs')) {
        return new Response(JSON.stringify({
          workflow_runs: [{
            event: 'push',
            head_branch: 'lane/even',
            head_sha: commit,
            path: '.github/workflows/relay-poke.yml',
            actor: { login: 'api-writer' },
          }],
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      throw new Error(`unexpected URL: ${url}`);
    },
    rpcOverride: async (name, body) => {
      calls.push({ name, body });
      return { ok: true, status: 'CLAIMED', task: { task_id: 89 } };
    },
  });

  assert.equal(result.processed, 1);
  assert.equal(result.deferred, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.p_github_login, 'api-writer');
  assert.equal(result.responses[0].response.status, 'CLAIMED');
});

test('missing GitHub identity is deferred instead of writing an immutable failure response', async () => {
  const dir = makeRepo();
  const commit = addRequest(
    dir,
    'even-defer-001',
    JSON.stringify({ request_id: 'even-defer-001', op: 'claim', session_id: 12 }),
  );
  let rpcCalls = 0;
  const result = await processRelay({
    lane: 'even',
    laneDir: dir,
    repository: 'owner/repo',
    githubToken: 'github-token',
    ciToken: 'ci-token',
    baseUrl: 'https://example.invalid',
    publishableKey: 'publishable',
    fetchImpl: async () => activityResponse([]),
    rpcOverride: async () => {
      rpcCalls += 1;
      return { ok: true };
    },
  });

  assert.equal(result.processed, 0);
  assert.equal(result.deferred, 1);
  assert.equal(result.deferred_requests[0].commit, commit);
  assert.equal(rpcCalls, 0);
  assert.equal(existsSync(join(dir, 'responses', 'even-defer-001.json')), false);
});

test('relay errors are always materialized as response JSON instead of aborting the sweep', async () => {
  const dir = makeRepo();
  const before = runGit(dir, 'rev-parse', 'HEAD');
  const commit = addRequest(
    dir,
    'odd-error-001',
    JSON.stringify({ request_id: 'odd-error-001', op: 'claim', session_id: 2 }),
  );
  const result = await processRelay({
    lane: 'odd',
    laneDir: dir,
    repository: 'owner/repo',
    githubToken: 'github-token',
    ciToken: 'ci-token',
    baseUrl: 'https://example.invalid',
    publishableKey: 'publishable',
    fetchImpl: async () =>
      activityResponse([
        { activity_type: 'push', before, after: commit, pusher: { login: 'lane-owner' } },
      ]),
    rpcOverride: async () => {
      throw new Error('PREPMEDS_DATABASE_REJECTED');
    },
  });

  assert.equal(result.responses[0].response.ok, false);
  assert.match(result.responses[0].response.error, /PREPMEDS_DATABASE_REJECTED/);
  const stored = JSON.parse(readFileSync(join(dir, 'responses', 'odd-error-001.json'), 'utf8'));
  assert.equal(stored.ok, false);
});


function pendingFixture() {
  return {
    revision_id: 41,
    group_id: 'ING-test-drug',
    content_sha256: 'a'.repeat(64),
    min_suite_version: 1,
    needs: ['evidence', 'mapping'],
    current_medication_ids: ['MED-test-b', 'MED-test-a'],
    revision: {
      revision_id: 41,
      group_id: 'ING-test-drug',
      content_sha256: 'a'.repeat(64),
      formulation: {
        decision: 'single_unit',
        rationale: 'The source guidance does not distinguish these mapped formulations.',
      },
      open_questions: [{ text: 'Nonblocking clarification', blocking: false }],
      medications: [
        { medication_id: 'MED-test-a' },
        { medication_id: 'MED-test-b' },
      ],
      sources: [
        {
          source_id: 'SRC-1',
          comparison: {
            status: 'COMPARED',
            checked_locators: 'Section 1',
          },
        },
      ],
      passages: [
        {
          passage_id: 7,
          source_id: 'SRC-1',
          locator: 'Section 1, paragraph 2',
          quote: 'Synthetic source passage used only for structural CI testing.',
        },
      ],
      recommendations: [
        {
          source_id: 'SRC-1',
          passage_id: 7,
          scenario_key: 'before_procedure',
          action: 'continue',
          summary: 'Synthetic recommendation fixture.',
        },
      ],
      scenario_coverage: [
        {
          scenario_key: 'before_procedure',
          status: 'ADDRESSED',
          reason: 'Synthetic source addresses the scenario.',
        },
      ],
      components: [],
    },
  };
}

test('mapping suite passes exact canonical membership regardless of ordering', () => {
  const result = runMappingSuite(pendingFixture());
  assert.equal(result.passed, true);
  assert.equal(result.failed, 0);
});

test('mapping suite fails closed when revision medications diverge from current canonical mapping', () => {
  const item = pendingFixture();
  item.current_medication_ids = ['MED-test-a', 'MED-test-c'];
  const result = runMappingSuite(item);
  assert.equal(result.passed, false);
  assert.ok(result.report.failed_checks.includes('revision_mapping_matches_current_canonical_mapping'));
});

test('evidence suite passes a structurally complete source-linked technical package', () => {
  const result = runEvidenceSuite(pendingFixture());
  assert.equal(result.passed, true);
  assert.equal(result.failed, 0);
});

test('evidence suite rejects blocking questions, stale components and source/passage mismatches', () => {
  const item = pendingFixture();
  item.revision.open_questions = [{ text: 'Needs resolution', blocking: true }];
  item.revision.components = [{ group_id: 'ING-component', is_current: false }];
  item.revision.passages[0].source_id = 'SRC-WRONG';
  const result = runEvidenceSuite(item);
  assert.equal(result.passed, false);
  assert.ok(result.report.failed_checks.includes('blocking_questions_are_absent'));
  assert.ok(result.report.failed_checks.includes('component_revisions_are_current'));
  assert.ok(result.report.failed_checks.includes('recommendations_reference_exact_source_passages'));
});

test('pending-suite executor records exact-SHA evidence and mapping results through CI RPC', async () => {
  const calls = [];
  const item = pendingFixture();
  const result = await runPendingTests(
    { ciToken: 'ci-token' },
    { commitSha: 'b'.repeat(40), ciRunId: 1234, ciRunAttempt: 2 },
    async (name, body) => {
      calls.push({ name, body });
      if (name === 'ci_pending_tests') return [item];
      if (name === 'ci_record_test_run') return { ok: true, outcome: 'recorded' };
      throw new Error(`unexpected RPC: ${name}`);
    },
  );

  assert.equal(result.pending_revisions, 1);
  assert.equal(result.recorded_runs, 2);
  assert.equal(result.results.every((entry) => entry.passed), true);
  assert.equal(calls[0].name, 'ci_pending_tests');
  const records = calls.filter((call) => call.name === 'ci_record_test_run');
  assert.deepEqual(records.map((call) => call.body.p_suite).sort(), ['evidence', 'mapping']);
  assert.equal(records.every((call) => call.body.p_commit_sha === 'b'.repeat(40)), true);
  assert.equal(records.every((call) => call.body.p_ci_run_id === 1234), true);
  assert.equal(records.every((call) => call.body.p_ci_run_attempt === 2), true);
  assert.equal(records.every((call) => call.body.p_passed === true), true);
});

test('pending-suite executor refuses missing immutable GitHub run provenance', async () => {
  await assert.rejects(
    runPendingTests({ ciToken: 'ci-token' }, { commitSha: 'not-a-sha', ciRunId: 1 }, async () => []),
    /exact GITHUB_SHA/,
  );
  await assert.rejects(
    runPendingTests({ ciToken: 'ci-token' }, { commitSha: 'c'.repeat(40), ciRunId: 0 }, async () => []),
    /positive GITHUB_RUN_ID/,
  );
});
