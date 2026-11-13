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
