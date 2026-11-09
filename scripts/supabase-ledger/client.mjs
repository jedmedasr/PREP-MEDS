/** Server-only, dependency-free Supabase RPC transport. No implicit retries. */
export function ledgerConfig(env = process.env) {
  if (env.PREP_MEDS_LEDGER_ENABLED !== 'true') throw new Error('LEDGER_DISABLED');
  const ref = env.PREP_MEDS_SUPABASE_PROJECT_REF;
  if (!/^[a-z0-9]{20}$/.test(ref ?? '')) throw new Error('EXISTING_PROJECT_REFERENCE_REQUIRED');
  const url = `https://${ref}.supabase.co`;
  if (env.PREP_MEDS_SUPABASE_URL !== url) throw new Error('PROJECT_URL_BINDING_MISMATCH');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof key !== 'string' || key.length < 32) throw new Error('SERVER_DATABASE_CREDENTIAL_REQUIRED');
  return { ref, url, key };
}
export function ledgerClient(config, agentToken, fetchImpl = fetch) {
  if (typeof agentToken !== 'string' || agentToken.length < 32) throw new Error('AGENT_CREDENTIAL_REQUIRED');
  const call = async (action, payload = {}) => {
    const response = await fetchImpl(`${config.url}/rest/v1/rpc/prepmeds_agent_dispatch`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_token: agentToken, p_action: action, p_payload: payload })
    });
    if (!response.ok) throw new Error(`LEDGER_HTTP_${response.status}`);
    return response.json();
  };
  return { call, async inspect() {
    const state = await call('status');
    if (state.project_ref !== config.ref || state.enabled !== true || state.environment !== 'operational') throw new Error('OPERATIONAL_PROJECT_NOT_VERIFIED');
    return state;
  } };
}
export async function boundedJSON(request, limit = 2000000) {
  if (!request.body) throw new Error('JSON_BODY_REQUIRED');
  const reader = request.body.getReader(); let length = 0; const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error('REQUEST_TOO_LARGE'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(bytes));
}
export async function handleLedgerRequest(request, env = process.env, fetchImpl = fetch) {
  const json = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (env.PREP_MEDS_LEDGER_ENABLED !== 'true') return json({ error: 'Not found' }, 404);
  if (request.method !== 'POST' || request.headers.has('origin')) return json({ error: 'BACKEND_POST_REQUIRED' }, 403);
  const token = request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/)?.[1];
  if (!token) return json({ error: 'UNAUTHORIZED' }, 401);
  try {
    const cfg = ledgerConfig(env); const body = await boundedJSON(request);
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['action','payload'].includes(k)) ||
      !['status','next','claim','get','renew','checkpoint','split','submit','verify'].includes(body.action)) return json({ error: 'INVALID_ACTION' }, 400);
    const client = ledgerClient(cfg, token, fetchImpl);
    const state = await client.inspect();
    return json(body.action === 'status' ? state : await client.call(body.action, body.payload ?? {}), 200);
  } catch (error) {
    const code = error?.message === 'REQUEST_TOO_LARGE' ? 'REQUEST_TOO_LARGE' : 'LEDGER_UNAVAILABLE_OR_REQUEST_REJECTED';
    return json({ error: code }, code === 'REQUEST_TOO_LARGE' ? 413 : 503);
  }
}
