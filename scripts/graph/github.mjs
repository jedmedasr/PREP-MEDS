import { digest, SHA, TASK, reconcile, freshness } from './core.mjs';

/** Small REST adapter: fixed host/repository, bounded pagination, no hidden retries or token logging. */
export class GitHubClient {
  constructor(repository, token, { fetchImpl = fetch, budget = 180 } = {}) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('INVALID_REPOSITORY');
    if (!token) throw new Error('GITHUB_TOKEN_REQUIRED: set GH_TOKEN or GITHUB_TOKEN; no offline fallback for dispatch');
    this.repository = repository; this.token = token; this.fetch = fetchImpl;
    this.budget = budget; this.calls = 0; this.prefix = `/repos/${repository}`;
  }
  async request(path, { method = 'GET', body } = {}) {
    if (!(path === '/user' || path === this.prefix || path.startsWith(`${this.prefix}/`)) || path.includes('..') || path.includes('://')) throw new Error('API_PATH_REJECTED');
    if (++this.calls > this.budget) throw new Error('API_BUDGET_EXCEEDED');
    const res = await this.fetch(`https://api.github.com${path}`, { method, redirect: 'error',
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${this.token}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
    if (!res.ok) { const error = new Error(`GITHUB_${res.status}: ${method} ${path}; no mutation retried`); error.status = res.status; throw error; }
    return res.status === 204 ? null : res.json();
  }
  async list(path, key = null) {
    const all = [];
    for (let page = 1; page <= 10; page++) {
      const data = await this.request(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      const items = key ? data[key] : data;
      if (!Array.isArray(items)) throw new Error('API_RESPONSE_SHAPE');
      all.push(...items);
      if (items.length < 100) return all;
    }
    throw new Error(`PAGINATION_LIMIT: ${path}; state is incomplete, dispatch prohibited`);
  }
}

const unique = (xs) => [...new Set(xs)];
const prFromURL = (url) => Number(String(url).match(/\/pull\/(\d+)(?:[/?#]|$)/)?.[1]) || null;
const runFromURL = (url) => Number(String(url).match(/\/actions\/runs\/(\d+)(?:[/?#]|$)/)?.[1]) || null;
const normalizePR = (p) => ({ number: p.number, state: p.state, merged: Boolean(p.merged || p.merged_at),
  draft: p.draft, head_sha: p.head.sha, branch: p.head.ref, author: p.user.login,
  merge_sha: p.merge_commit_sha, url: p.html_url,
  task_ids: unique(`${p.title}\n${p.body ?? ''}`.match(/\b[A-Z]+-\d{3}\b/g) ?? []) });

/** Reads immutable receipts and live heads. PR #37 is never modified or rerun. */
export async function collect(client, graph, ledger, policy) {
  const p = client.prefix;
  const state = { repository: graph.repository, complete: false, observed_at: new Date().toISOString(),
    errors: [], branches: [], pulls: [], runs: {}, artifacts: {}, commits: {}, claims: [], handoffs: [], main_sha: null, api_requests: 0 };
  try {
    const meta = await client.request(p);
    state.default_branch = meta.default_branch;
    const main = await client.request(`${p}/git/ref/heads/${encodeURIComponent(meta.default_branch)}`);
    state.main_sha = main.object.sha;
    state.branches = (await client.list(`${p}/branches`)).map((b) => ({ name: b.name, sha: b.commit.sha, protected: b.protected }));
    const contentJSON = async (path) => {
      const value = await client.request(`${p}/contents/${path}?ref=${state.main_sha}`);
      if (value.encoding !== 'base64') throw new Error('CONTENT_ENCODING_UNSUPPORTED');
      return JSON.parse(Buffer.from(value.content, 'base64').toString('utf8'));
    };
    state.main_graph_digest = digest(await contentJSON('engineering/task-graph.json'));
    state.main_ledger_digest = digest(await contentJSON('engineering/evidence-ledger.json'));
    let handoffFiles = [];
    try { handoffFiles = await client.request(`${p}/contents/engineering/handoffs?ref=${state.main_sha}`); } catch (e) { if (e.status !== 404) throw e; }
    if (!Array.isArray(handoffFiles) || handoffFiles.length > 100) throw new Error('HANDOFF_DIRECTORY_LIMIT');
    for (const file of handoffFiles.filter((f) => f.type === 'file' && f.name.endsWith('.json'))) {
      if (!/^[A-Za-z0-9_.-]+\.json$/.test(file.name)) throw new Error('INVALID_HANDOFF_FILENAME');
      const h = await contentJSON(`engineering/handoffs/${file.name}`);
      if (!TASK.test(h.previous_task ?? '') || !['PASS', 'PARTIAL', 'FAIL'].includes(h.previous_outcome) || !Array.isArray(h.outstanding_blockers) || !Number.isFinite(Date.parse(h.created_at))) throw new Error('MALFORMED_HANDOFF');
      state.handoffs.push(h);
    }
    const open = await client.list(`${p}/pulls?state=open`);
    const prNumbers = unique([...open.map((v) => v.number), ...(policy.protected_prs ?? []),
      ...graph.tasks.map((t) => prFromURL(t.source_ref)), ...ledger.records.map((r) => r.pr_number ?? prFromURL(r.url))].filter(Boolean));
    for (const n of prNumbers) {
      const raw = await client.request(`${p}/pulls/${n}`);
      const pr = normalizePR(raw);
      pr.files = (await client.list(`${p}/pulls/${n}/files`)).map((f) => f.filename);
      pr.reviews = (await client.list(`${p}/pulls/${n}/reviews`)).map((r) => ({ id: r.id, login: r.user.login, state: r.state, commit_id: r.commit_id, html_url: r.html_url }));
      // A contributor cannot certify independent verification of the same change.
      pr.contributors = unique((await client.list(`${p}/pulls/${n}/commits`)).map((c) => c.author?.login).filter(Boolean));
      state.pulls.push(pr);
    }
    for (const sha of unique([state.main_sha, ...state.pulls.map((v) => v.head_sha), ...ledger.records.map((r) => r.commit_sha)])) {
      if (!SHA.test(sha ?? '')) throw new Error('INVALID_EVIDENCE_SHA');
      try { const c = await client.request(`${p}/commits/${sha}`); state.commits[sha] = { sha: c.sha, tree: c.commit.tree.sha, parents: c.parents.map((v) => v.sha) }; }
      catch (e) { if (e.status === 404) state.commits[sha] = null; else throw e; }
    }
    const runs = await client.list(`${p}/actions/runs?head_sha=${state.main_sha}`, 'workflow_runs');
    // Observe current open PR CI as well, but do not confuse sprint failures with main failures.
    for (const pr of state.pulls.filter((v) => v.state === 'open')) runs.push(...await client.list(`${p}/actions/runs?head_sha=${pr.head_sha}`, 'workflow_runs'));
    const evidenceRuns = unique(ledger.records.flatMap((r) => [...(r.workflow_run_ids ?? []), runFromURL(r.url)]).filter(Boolean));
    for (const id of evidenceRuns) {
      try { runs.push(await client.request(`${p}/actions/runs/${id}`)); }
      catch (e) { if (e.status === 404) state.runs[id] = null; else throw e; }
    }
    for (const raw of runs) {
      if (state.runs[raw.id]) continue;
      if (raw.repository?.full_name !== graph.repository) throw new Error('WORKFLOW_REPOSITORY_MISMATCH');
      state.runs[raw.id] = { id: raw.id, path: raw.path, head_sha: raw.head_sha, status: raw.status, conclusion: raw.conclusion,
        run_attempt: raw.run_attempt, url: raw.html_url, updated_at: raw.updated_at, jobs: [] };
      if (evidenceRuns.includes(raw.id)) state.runs[raw.id].jobs = (await client.list(`${p}/actions/runs/${raw.id}/jobs?filter=latest`, 'jobs'))
        .map((j) => ({ name: j.name, conclusion: j.conclusion, steps: j.steps.map((s) => ({ name: s.name, conclusion: s.conclusion })) }));
    }
    for (const b of state.branches.filter((b) => b.name.startsWith('engineering/claims/'))) {
      const c = await client.request(`${p}/git/commits/${b.sha}`);
      let claim;
      try { claim = JSON.parse(c.message); } catch { throw new Error(`MALFORMED_CLAIM: ${b.name}`); }
      if (claim.kind !== 'engineering-task-claim' || !TASK.test(claim.task_id ?? '') || b.name !== `engineering/claims/${claim.task_id}` ||
          !SHA.test(claim.base_sha ?? '') || !claim.owner || !claim.idempotency_key || c.parents?.[0]?.sha !== claim.base_sha)
        throw new Error(`MALFORMED_CLAIM: ${b.name}`);
      state.claims.push({ ...claim, ref_sha: b.sha, stale_base: claim.base_sha !== state.main_sha });
    }
    for (const r of ledger.records) for (const u of r.artifact_urls ?? []) {
      const artifactId = Number(u.match(/\/artifacts\/(\d+)$/)?.[1]);
      if (artifactId && !(artifactId in state.artifacts)) {
        try { state.artifacts[artifactId] = await client.request(`${p}/actions/artifacts/${artifactId}`); }
        catch (e) { if (e.status === 404) state.artifacts[artifactId] = null; else throw e; }
      }
    }
    for (const pr of state.pulls.filter((v) => v.state === 'open')) {
      const refreshed = await client.request(`${p}/pulls/${pr.number}`);
      if (refreshed.head.sha !== pr.head_sha || refreshed.state !== pr.state) throw new Error(`PR_MOVED_DURING_RECONCILIATION: ${pr.number}`);
    }
    const end = await client.request(`${p}/git/ref/heads/${encodeURIComponent(meta.default_branch)}`);
    if (end.object.sha !== state.main_sha) throw new Error('MAIN_MOVED_DURING_RECONCILIATION');
    state.complete = true;
  } catch (e) { state.errors.push(e.message); }
  state.observed_at = new Date().toISOString(); state.api_requests = client.calls;
  return state;
}

/** Atomic create-only Git ref; never force-updates, deletes, expires, or steals another claim. */
export async function claim(client, graph, ledger, policy, state, { taskId, owner, key, expectedMain, write = false }) {
  if (!write) throw new Error('WRITE_OPT_IN_REQUIRED');
  if (!TASK.test(taskId ?? '') || !/^[\w.-]{1,100}$/.test(owner ?? '') || !/^[\w.-]{1,120}$/.test(key ?? '') || !SHA.test(expectedMain ?? '')) throw new Error('CLAIM_ARGUMENTS_INVALID');
  if (freshness(state, policy).length || state.main_sha !== expectedMain) throw new Error('STALE_CLAIM_BASE');
  const actor = await client.request('/user');
  if (actor.login !== owner) throw new Error('CLAIM_OWNER_MUST_MATCH_AUTHENTICATED_ACCOUNT');
  const p = client.prefix;
  const ref = `refs/heads/engineering/claims/${taskId}`;
  const existing = async () => {
    try {
      const r = await client.request(`${p}/git/ref/heads/engineering/claims/${taskId}`);
      const c = await client.request(`${p}/git/commits/${r.object.sha}`);
      const saved = JSON.parse(c.message);
      if (saved.kind === 'engineering-task-claim' && saved.task_id === taskId && saved.owner === owner && saved.idempotency_key === key && saved.base_sha === expectedMain &&
          saved.graph_digest === digest(graph) && saved.ledger_digest === digest(ledger)) return { acquired: true, resumed: true, ref, claim_sha: r.object.sha, owner, task_id: taskId };
      throw new Error('CLAIM_CONFLICT: another owner/key/base already holds this task; manual review required');
    } catch (e) { if (e.status === 404) return null; throw e; }
  };
  const currentMain = async () => (await client.request(`${p}/git/ref/heads/${encodeURIComponent(state.default_branch)}`)).object.sha;
  if (await currentMain() !== expectedMain) throw new Error('MAIN_MOVED_BEFORE_CLAIM');
  const saved = await existing();
  // A repeat resumes ownership, not permission to run stale or failed work. Always reconcile again.
  if (saved) return { ...saved, execution_authorized: false, action: 'Reconcile the work branch, tests and handoff before resuming implementation.' };
  const plan = reconcile(graph, ledger, policy, state);
  if (!plan.eligible.includes(taskId)) throw new Error('TASK_NOT_ELIGIBLE');
  for (const [path, expected] of [['engineering/task-graph.json', graph], ['engineering/evidence-ledger.json', ledger], ['engineering/orchestrator-policy.json', policy]]) {
    const remote = await client.request(`${p}/contents/${path}?ref=${expectedMain}`);
    if (remote.encoding !== 'base64' || digest(JSON.parse(Buffer.from(remote.content, 'base64').toString('utf8'))) !== digest(expected)) throw new Error('LOCAL_GRAPH_DIFFERS_FROM_MAIN');
  }
  const parent = await client.request(`${p}/git/commits/${expectedMain}`);
  const body = { kind: 'engineering-task-claim', schema_version: 2, task_id: taskId, owner, idempotency_key: key,
    base_sha: expectedMain, graph_digest: digest(graph), ledger_digest: digest(ledger), created_at: new Date().toISOString() };
  const commit = await client.request(`${p}/git/commits`, { method: 'POST', body: { message: JSON.stringify(body), tree: parent.tree.sha, parents: [expectedMain] } });
  try { await client.request(`${p}/git/refs`, { method: 'POST', body: { ref, sha: commit.sha } }); }
  catch (e) {
    if ([409, 422].includes(e.status)) { const raced = await existing(); if (raced) return { ...raced, execution_authorized: false }; }
    throw e;
  }
  if (await currentMain() !== expectedMain) throw new Error(`MAIN_MOVED_AFTER_CLAIM: ${ref} retained; do not execute; reconcile and explicitly recover`);
  return { acquired: true, resumed: false, ref, claim_sha: commit.sha, task_id: taskId, owner,
    execution_authorized: true, warning: 'Coordinate through this claim. Do not push work to the claim ref; use an isolated feature branch.' };
}
