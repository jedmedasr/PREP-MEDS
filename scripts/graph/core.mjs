import { createHash } from 'node:crypto';

export const SHA = /^[0-9a-f]{40}$/;
export const TASK = /^[A-Z]+-\d{3}$/;
const STATES = ['not_started', 'in_progress', 'blocked', 'needs_review', 'complete'];
const TRANSITIONS = {
  not_started: ['in_progress', 'blocked', 'needs_review'],
  in_progress: ['blocked', 'needs_review'],
  blocked: ['not_started', 'needs_review'],
  needs_review: ['in_progress', 'blocked', 'complete'],
  complete: ['needs_review'],
};
export const canonical = (v) => JSON.stringify(v, (_, x) => x && typeof x === 'object' && !Array.isArray(x)
  ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x);
export const digest = (v) => createHash('sha256').update(canonical(v)).digest('hex');
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const strings = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string' && s.trim());
const validDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const iso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
export const sameRepoURL = (url, repo) => {
  try { const u = new URL(url); return u.origin === 'https://github.com' && !u.username && !u.password &&
    (u.pathname === `/${repo}` || u.pathname.startsWith(`/${repo}/`)); } catch { return false; }
};

/** Pure, bounded, fail-closed validation. Legacy evidence remains readable, not auto-certified. */
export function validate(graph, ledger, policy) {
  const errors = [];
  if (!object(graph) || graph.schema_version !== 1 || !Array.isArray(graph.tasks) || !graph.tasks.length)
    return ['GRAPH_SHAPE: nonempty schema_version 1 task graph required'];
  if (!object(ledger) || ledger.schema_version !== 1 || !Array.isArray(ledger.records))
    return ['LEDGER_SHAPE: schema_version 1 evidence ledger required'];
  if (!object(policy) || policy.schema_version !== 2 || !Number.isInteger(policy.freshness_seconds) || policy.freshness_seconds < 1 ||
      !strings(policy.required_workflows) || !policy.required_workflows.length || !Array.isArray(policy.clinical_reviewers) ||
      !object(policy.scopes) || Object.values(policy.scopes).some((v) => !strings(v)) ||
      !object(policy.priorities) || Object.values(policy.priorities).some((n) => !Number.isInteger(n) || n < 0))
    return ['POLICY_SHAPE: invalid Stage 2 policy'];
  if (!/^[\w.-]+\/[\w.-]+$/.test(graph.repository ?? '') || ledger.repository !== graph.repository || policy.repository !== graph.repository)
    errors.push('REPOSITORY_MISMATCH');
  if (!SHA.test(graph.snapshot?.default_branch_sha ?? '')) errors.push('SNAPSHOT_SHA');
  if (graph.tasks.length > 1000 || ledger.records.length > 20000) return ['SIZE_LIMIT: archive historical evidence before exceeding limits'];
  const tasks = new Map();
  for (const t of graph.tasks) {
    if (!object(t) || !TASK.test(t.id ?? '')) { errors.push('TASK_ID'); continue; }
    if (tasks.has(t.id)) errors.push(`DUPLICATE_TASK: ${t.id}`);
    tasks.set(t.id, t);
    if (!STATES.includes(t.status) || !strings(t.acceptance) || !t.acceptance.length || !strings([t.title, t.owner]) ||
        !sameRepoURL(t.source_ref, graph.repository) || typeof t.clinical_gate !== 'boolean') errors.push(`TASK_SHAPE: ${t.id}`);
    if (!strings(t.depends_on) || new Set(t.depends_on).size !== t.depends_on.length) errors.push(`DEPENDENCY_SHAPE: ${t.id}`);
    if (t.required_workflows !== undefined && !strings(t.required_workflows)) errors.push(`WORKFLOW_REQUIREMENTS: ${t.id}`);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`CYCLE: ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    const deps = Array.isArray(tasks.get(id)?.depends_on) ? tasks.get(id).depends_on : [];
    for (const dep of deps) {
      if (!tasks.has(dep)) errors.push(`MISSING_TASK: ${id} -> ${String(dep)}`);
      else visit(dep);
    }
    visiting.delete(id); visited.add(id);
  }
  for (const id of tasks.keys()) visit(id);
  const ids = new Set();
  for (const r of ledger.records) {
    if (!object(r) || typeof r.id !== 'string' || !r.id) { errors.push('EVIDENCE_SHAPE'); continue; }
    if (ids.has(r.id)) errors.push(`DUPLICATE_EVIDENCE: ${r.id}`);
    ids.add(r.id);
    if (!tasks.has(r.task_id) || !SHA.test(r.commit_sha ?? '') || !['verified', 'failed', 'pending'].includes(r.result) ||
        !strings([r.type, r.summary]) || !sameRepoURL(r.url, graph.repository) ||
        !validDate(r.date))
      errors.push(`EVIDENCE_SHAPE: ${r.id}`);
    if (r.type === 'task_verification' && (!iso(r.timestamp) || !strings(r.acceptance) || !strings(r.blockers) ||
        !Array.isArray(r.commands) || !r.commands.length || !Array.isArray(r.workflow_run_ids) || !r.workflow_run_ids.length ||
        r.workflow_run_ids.some((n) => !Number.isSafeInteger(n) || n < 1) || !Number.isSafeInteger(r.pr_number) || r.pr_number < 1 ||
        !strings([r.implemented_by, r.verified_by]) || r.implemented_by === r.verified_by ||
        !Array.isArray(r.artifact_urls) || !r.artifact_urls.length || r.artifact_urls.some((u) => !sameRepoURL(u, graph.repository))))
      errors.push(`VERIFICATION_CONTRACT: ${r.id}`);
  }
  for (const t of tasks.values()) {
    const incomplete = (Array.isArray(t.depends_on) ? t.depends_on : []).filter((id) => tasks.get(id)?.status !== 'complete');
    if (['complete', 'in_progress'].includes(t.status) && incomplete.length) errors.push(`INCOMPLETE_DEPENDENCIES: ${t.id}`);
    if (t.status === 'complete' && !ledger.records.some((r) => r?.task_id === t.id && r.result === 'verified')) errors.push(`NO_EVIDENCE: ${t.id}`);
    if (t.status === 'complete' && t.clinical_gate && !ledger.records.some((r) => r?.task_id === t.id && r.type === 'clinical_approval' && r.result === 'verified' && r.approved_by && r.approval_reference))
      errors.push(`CLINICAL_GATE: ${t.id}`);
  }
  return [...new Set(errors)];
}

export function validateHistory(graph, ledger, previous, priorLedger) {
  const errors = [];
  if (!previous || !priorLedger) return ['BASELINE_REQUIRED'];
  const old = new Map(priorLedger.records.map((r) => [r.id, r]));
  const current = new Map(ledger.records.map((r) => [r.id, r]));
  for (const [id, r] of old) if (canonical(r) !== canonical(current.get(id))) errors.push(`APPEND_ONLY_VIOLATION: ${id}`);
  const now = new Map(graph.tasks.map((t) => [t.id, t]));
  for (const before of previous.tasks) {
    const after = now.get(before.id);
    if (!after) { errors.push(`TASK_REMOVAL: ${before.id}`); continue; }
    if (after.status !== before.status && !TRANSITIONS[before.status]?.includes(after.status)) errors.push(`INVALID_TRANSITION: ${before.id} ${before.status} -> ${after.status}`);
    if (before.clinical_gate && !after.clinical_gate) errors.push(`CLINICAL_GATE_DOWNGRADE: ${before.id}`);
    if (before.status === 'complete' && after.status === 'complete' &&
        (canonical(before.acceptance) !== canonical(after.acceptance) || canonical(before.depends_on) !== canonical(after.depends_on))) errors.push(`REOPEN_REQUIRED: ${before.id}`);
  }
  return errors;
}

export function freshness(state, policy, now = Date.now()) {
  if (!state || state.complete !== true) return ['LIVE_STATE_UNAVAILABLE', ...(state?.errors ?? [])];
  const age = (now - Date.parse(state.observed_at)) / 1000;
  if (!Number.isFinite(age) || age < -30 || age > policy.freshness_seconds) return ['STALE_GITHUB_STATE'];
  return state.errors?.length ? ['INCOMPLETE_GITHUB_STATE', ...state.errors] : [];
}

/** A completion receipt is only a claim until remote immutable evidence verifies it. */
export function completion(task, ledger, state, policy) {
  const receipts = ledger.records.filter((r) => r.task_id === task.id && r.type === 'task_verification' && r.result === 'verified');
  if (!receipts.length) return { verified: false, reasons: ['LEGACY_OR_MISSING_COMPLETION_RECEIPT'] };
  const failures = [];
  for (const r of receipts) {
    const reasons = [];
    if (!task.acceptance.every((a) => r.acceptance?.includes(a)) || r.blockers?.length !== 0) reasons.push('ACCEPTANCE_UNRESOLVED');
    if (!state?.commits?.[r.commit_sha]) reasons.push('COMMIT_NOT_VERIFIED');
    const pr = state?.pulls?.find((p) => p.number === r.pr_number);
    if (!pr?.merged || pr.head_sha !== r.commit_sha) reasons.push('PR_NOT_MERGED_OR_SHA_MISMATCH');
    const reviews = pr?.reviews ?? [];
    const latest = new Map();
    for (const review of [...reviews].sort((a, b) => a.id - b.id)) if (review.state !== 'COMMENTED') latest.set(review.login, review);
    const approver = latest.get(r.verified_by);
    if (!approver || approver.state !== 'APPROVED' || approver.commit_id !== r.commit_sha ||
        r.verified_by === r.implemented_by || r.verified_by === pr?.author || pr?.contributors?.includes(r.verified_by)) reasons.push('INDEPENDENT_REVIEW_MISSING');
    const runs = (r.workflow_run_ids ?? []).map((id) => state?.runs?.[id]);
    if (!runs.length || runs.some((run) => !run || run.head_sha !== r.commit_sha || run.status !== 'completed' || run.conclusion !== 'success')) reasons.push('CI_NOT_SUCCESS_FOR_EXACT_SHA');
    const required = [...new Set([...policy.required_workflows, ...(task.required_workflows ?? [])])];
    for (const name of required) if (!runs.some((run) => run?.path === `.github/workflows/${name}.yml`)) reasons.push(`WORKFLOW_MISSING: ${name}`);
    for (const c of r.commands ?? []) {
      const run = state?.runs?.[c.run_id];
      if (!strings([c.command, c.step]) || !r.workflow_run_ids?.includes(c.run_id) || c.outcome !== 'success' ||
          !run?.jobs?.some((j) => j.conclusion === 'success' && j.steps?.some((s) => s.name === c.step && s.conclusion === 'success'))) reasons.push('TEST_COMMAND_UNVERIFIED');
    }
    for (const u of r.artifact_urls ?? []) {
      const match = u.match(/\/actions\/runs\/(\d+)(?:\/artifacts\/(\d+))?$/);
      const runId = Number(match?.[1]), artifactId = Number(match?.[2]);
      const artifact = artifactId ? state?.artifacts?.[artifactId] : null;
      if (!match || !r.workflow_run_ids?.includes(runId) || (artifactId && (!artifact || artifact.expired || artifact.workflow_run?.id !== runId || artifact.workflow_run?.head_sha !== r.commit_sha))) reasons.push('ARTIFACT_UNVERIFIED_OR_EXPIRED');
    }
    if (task.clinical_gate) {
      const clinical = ledger.records.find((a) => a.task_id === task.id && a.type === 'clinical_approval' && a.result === 'verified' &&
        a.commit_sha === r.commit_sha && policy.clinical_reviewers.includes(a.approved_by) &&
        latest.get(a.approved_by)?.state === 'APPROVED' && latest.get(a.approved_by)?.commit_id === a.commit_sha && latest.get(a.approved_by)?.html_url === a.approval_reference && !pr?.contributors?.includes(a.approved_by));
      if (!clinical) reasons.push('AUTHENTICATED_CLINICAL_APPROVAL_MISSING');
    }
    if (!reasons.length) return { verified: true, evidence_id: r.id, reasons: [] };
    failures.push(...reasons);
  }
  return { verified: false, reasons: [...new Set(failures)] };
}

export function reconcile(graph, ledger, policy, state, now = Date.now()) {
  const errors = validate(graph, ledger, policy);
  if (errors.length) return { valid: false, errors, eligible: [], next: null };
  const liveErrors = freshness(state, policy, now);
  const byId = new Map(graph.tasks.map((t) => [t.id, t]));
  const tasks = graph.tasks.map((t) => {
    const proof = t.status === 'complete' ? completion(t, ledger, state, policy) : { verified: false, reasons: [] };
    const blocked = t.depends_on.filter((id) => byId.get(id)?.status !== 'complete');
    const overlaps = (state?.pulls ?? []).filter((p) => p.state === 'open' && ((p.task_ids ?? []).includes(t.id) ||
      (policy.scopes?.[t.id] ?? []).some((prefix) => p.files?.some((f) => f === prefix || f.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`))))).map((p) => p.number);
    const claims = (state?.claims ?? []).filter((c) => c.task_id === t.id);
    return { id: t.id, title: t.title, declared_status: t.status, clinical_gate: t.clinical_gate,
      priority: policy.priorities[t.id] ?? 100, blocked_by: blocked, overlaps, claims,
      completion_verified: proof.verified, unresolved: proof.reasons,
      evidence_ids: ledger.records.filter((r) => r.task_id === t.id).map((r) => r.id) };
  });
  const unresolved = new Set(tasks.filter((t) => t.declared_status === 'complete' && !t.completion_verified).map((t) => t.id));
  let changed = true;
  while (changed) { changed = false; for (const t of graph.tasks) if (!unresolved.has(t.id) && t.depends_on.some((id) => unresolved.has(id))) { unresolved.add(t.id); changed = true; } }
  for (const t of tasks) {
    t.evidence_blocked = unresolved.has(t.id);
    t.effective_status = t.declared_status === 'complete' && t.evidence_blocked ? 'unresolved' : t.blocked_by.length ? 'blocked' : t.declared_status;
  }
  const previousHandoffs = new Map();
  for (const h of [...(state?.handoffs ?? [])].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))) previousHandoffs.set(h.previous_task, h);
  const unfinished = [...previousHandoffs.values()].filter((h) => h.previous_outcome !== 'PASS' && !tasks.some((t) => t.id === h.previous_task && t.completion_verified));
  const structural = tasks.filter((t) => t.declared_status === 'not_started' && !t.blocked_by.length).sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id, 'en'));
  const eligible = liveErrors.length ? [] : structural.filter((t) => !t.evidence_blocked && !t.clinical_gate && !t.overlaps.length && !t.claims.length && !unfinished.some((h) => h.previous_task === t.id)).map((t) => t.id);
  const byWorkflow = new Map();
  for (const r of Object.values(state?.runs ?? {}).filter(Boolean).sort((a, b) => a.id - b.id))
    if (r.head_sha === state?.main_sha) byWorkflow.set(r.path, r);
  const mainRuns = [...byWorkflow.values()];
  const mainFailures = mainRuns.filter((r) => r.status !== 'completed' || r.conclusion !== 'success').map((r) => r.id);
  // A green graph cannot hide a broken application baseline. Do not start new changes.
  const mainMissing = policy.required_workflows.filter((w) => !mainRuns.some((r) => r.path === `.github/workflows/${w}.yml` && r.conclusion === 'success'));
  const graphMatchesMain = !state?.main_graph_digest || (state.main_graph_digest === digest(graph) && state.main_ledger_digest === digest(ledger));
  const dispatch = mainFailures.length || mainMissing.length || !graphMatchesMain ? [] : eligible;
  const completed = tasks.filter((t) => t.declared_status === 'complete');
  return { schema_version: 2, valid: true, repository: graph.repository, mode: state ? 'live-observation' : 'offline-structure-only',
    observed_at: state?.observed_at ?? null, main_sha: state?.main_sha ?? null, graph_digest: digest(graph), ledger_digest: digest(ledger),
    snapshot_changed: state ? state.main_sha !== graph.snapshot.default_branch_sha : null,
    graph_matches_main: graphMatchesMain, resume_required: unfinished,
    github: state ? { default_branch: state.default_branch, branches: state.branches, pulls: state.pulls.map(({number, state, head_sha, branch, task_ids}) => ({number, state, head_sha, branch, task_ids})), workflow_runs: Object.values(state.runs).filter(Boolean).map(({id, path, head_sha, status, conclusion}) => ({id, path, head_sha, status, conclusion})) } : null,
    errors: liveErrors, main_failed_or_pending_runs: mainFailures, main_missing_workflows: mainMissing,
    tasks, structurally_eligible: structural.map((t) => t.id), eligible: dispatch, next: dispatch[0] ?? null,
    metrics: { declared_completions: completed.length, remotely_verified_completions: completed.filter((t) => t.completion_verified).length,
      evidence_supported_completion_percent: completed.length ? 100 * completed.filter((t) => t.completion_verified).length / completed.length : null,
      stale_or_unresolved_completed_tasks: completed.filter((t) => !t.completion_verified).length,
      duplicate_work_candidates_blocked: structural.filter((t) => t.overlaps.length || t.claims.length).length,
      failed_handoffs: [...previousHandoffs.values()].filter((h) => h.previous_outcome === 'FAIL').length,
      unsupported_completion_claims: completed.filter((t) => !t.completion_verified).length,
      task_selection_fixture_accuracy: null, engineering_seconds: null, api_requests: state?.api_requests ?? 0, infrastructure_cost: null, llm_api_calls: 0,
      note: 'Per-observation metrics, not lifetime counters. Null cost means not measured; runner billing may apply.' } };
}

export function completionTransitions(graph, previous, ledger, state, policy) {
  const old = new Map((previous?.tasks ?? []).map((t) => [t.id, t.status]));
  const errors = [];
  for (const t of graph.tasks) if (t.status === 'complete' && old.get(t.id) !== 'complete') {
    const proof = completion(t, ledger, state, policy);
    if (freshness(state, policy).length || !proof.verified) errors.push(`COMPLETION_REJECTED: ${t.id}: ${proof.reasons.join(', ') || 'fresh live verification required'}`);
  }
  return errors;
}

export function handoff(report, input) {
  if (!report.tasks?.some((t) => t.id === input.task_id) || !TASK.test(input.task_id ?? '') || !['PASS', 'PARTIAL', 'FAIL'].includes(input.outcome) || !strings(input.blockers) ||
      !strings(input.tests_executed) || !strings(input.acceptance_satisfied) || !strings([input.session_id])) throw new Error('HANDOFF_INPUT_INVALID');
  if (input.outcome === 'PASS' && !report.tasks?.some((t) => t.id === input.task_id && t.completion_verified)) throw new Error('HANDOFF_PASS_UNVERIFIED');
  if (input.outcome !== 'PASS' && !input.blockers.length) throw new Error('HANDOFF_BLOCKERS_REQUIRED');
  const result = { schema_version: 2, id: `HND-${digest({ task: input.task_id, session: input.session_id }).slice(0, 24)}`,
    created_at: report.observed_at ?? new Date().toISOString(),
    previous_task: input.task_id, previous_outcome: input.outcome, repository: report.repository,
    latest_verified_state: { main_sha: report.main_sha, observed_at: report.observed_at, graph_digest: report.graph_digest, ledger_digest: report.ledger_digest },
    tests_executed: input.tests_executed, acceptance_satisfied: input.acceptance_satisfied, outstanding_blockers: input.blockers,
    next_eligible_task: input.outcome === 'PASS' ? report.next : null,
    recommended_action: input.outcome === 'PASS' ? 'Re-fetch GitHub, re-verify evidence, then claim the next eligible task.' : `Resume ${input.task_id}; independently verify and resolve the listed blockers before advancing.`,
    metrics: report.metrics, verification: 'Claims in this handoff must be independently reconciled next session; no clinical approval is conveyed.' };
  return result;
}
