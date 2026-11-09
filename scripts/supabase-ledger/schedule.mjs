import { fileURLToPath } from 'node:url';
import { ledgerConfig, ledgerClient } from './client.mjs';

/** One bounded, persisted database task. Workers must be separately provisioned;
 * this adapter neither creates model agents nor certifies their source fidelity. */
export async function scheduledTick({ env = process.env, lane, requestKey, fetchImpl = fetch } = {}) {
  if (!['odd','even'].includes(lane) || !/^[A-Za-z0-9:_./-]{8,160}$/.test(requestKey ?? '')) throw new Error('SCHEDULE_ARGUMENTS_REQUIRED');
  const cfg = ledgerConfig(env);
  const a = ledgerClient(cfg, env.PREP_MEDS_AGENT_A_TOKEN, fetchImpl);
  const b = ledgerClient(cfg, env.PREP_MEDS_AGENT_B_TOKEN, fetchImpl);
  const sa = await a.inspect(); const sb = await b.inspect();
  if (sa.lane !== lane || sb.lane !== lane || sa.agent !== 'A' || sb.agent !== 'B' ||
      !sa.identity_id || !sb.identity_id || sa.identity_id === sb.identity_id) throw new Error('INDEPENDENT_LANE_PRINCIPALS_REQUIRED');
  const next = await a.call('next');
  const role = next.next_agent;
  if (!['A','B'].includes(role)) throw new Error('INVALID_DATABASE_DISPATCH');
  const url = env[`PREP_MEDS_WORKER_${role}_URL`]; const workerToken = env[`PREP_MEDS_WORKER_${role}_TOKEN`];
  const parsed = new URL(url ?? 'https://invalid.invalid');
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.hash || parsed.hostname === 'invalid.invalid' || !workerToken || workerToken.length < 32) throw new Error('INDEPENDENT_WORKER_NOT_CONFIGURED');
  if (env.PREP_MEDS_WORKER_A_URL === env.PREP_MEDS_WORKER_B_URL) throw new Error('SEPARATE_WORKER_ENDPOINTS_REQUIRED');
  const client = role === 'A' ? a : b;
  const claimed = await client.call('claim', { idempotency_key: `${requestKey}:${role}`, lease_seconds: 600 });
  if (!claimed.execution_authorized || claimed.replayed || !claimed.run) return { dispatched: false, reason: claimed.reason ?? 'REPLAY_OR_NO_WORK', observed: sa.observed_at_utc };
  const run = claimed.run;
  try {
    const work = await client.call('get', { run_id: run.run_id });
    await client.call('checkpoint', { run_id: run.run_id, context_id: run.context_id, progress: { phase: 'WORKER_DISPATCHED', role } });
    const response = await fetchImpl(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(240000),
      headers: { Authorization: `Bearer ${workerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema_version: 1, role, run_id: run.run_id, context_id: run.context_id, group: work.group, members: work.members,
        evidence: role === 'B' ? work.current_evidence : null, imports: role === 'A' ? work.imports : null,
        instruction: 'Independently inspect original primary documents. Inaccessible passages cannot be verified. Do not activate clinical instructions.' }) });
    if (!response.ok) throw new Error('WORKER_FAILED');
    const output = await response.json();
    let result;
    if (role === 'A') result = await client.call('submit', { run_id: run.run_id, context_id: run.context_id, github_commit: output.github_commit, evidence: output.evidence });
    else {
      if (output.evidence_hash !== work.current_evidence?.content_hash || output.revision !== work.current_evidence?.revision) throw new Error('WORKER_STALE_REVISION');
      result = await client.call('verify', { run_id: run.run_id, context_id: run.context_id, revision: output.revision,
        evidence_hash: output.evidence_hash, outcome: output.outcome, verification: output.verification });
    }
    return { dispatched: true, role, run_id: run.run_id, result, patient_facing_authorized: false };
  } catch (error) {
    try { await client.call('checkpoint', { run_id: run.run_id, context_id: run.context_id, progress: { phase: 'WORKER_FAILED_OR_PERSISTENCE_UNCERTAIN' } }); } catch { /* Original execution and lease stay durable. */ }
    throw new Error('WORKER_FAILED_OR_PERSISTENCE_UNCERTAIN');
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await scheduledTick({ lane: process.env.PREP_MEDS_LANE, requestKey: process.env.PREP_MEDS_RUN_KEY }))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
