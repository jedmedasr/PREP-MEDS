import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest } from './core.mjs';
const MAX_BYTES = 12 * 1024 * 1024;
export function permittedUrl(value, hosts) {
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.username || u.password || u.port || !hosts.includes(u.hostname) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)) throw new Error('URL_NOT_ALLOWLISTED');
  return u;
}
export async function fetchBounded(url, hosts, previous, format, transport = fetch, conditional = true) {
  let target = permittedUrl(url, hosts).href;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const headers = { 'User-Agent': 'PREP-MEDS-evidence-surveillance/1.0', Accept: format === 'pdf' ? 'application/pdf' : 'text/html,text/plain' };
    if (conditional && previous?.hash && previous?.etag) headers['If-None-Match'] = previous.etag;
    if (conditional && previous?.hash && previous?.lastModified) headers['If-Modified-Since'] = previous.lastModified;
    const response = await transport(target, { headers, redirect: 'manual', signal: AbortSignal.timeout(25000) });
    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('REDIRECT_WITHOUT_LOCATION');
      target = permittedUrl(new URL(location, target).href, hosts).href; continue;
    }
    if (response.status === 304) {
      if (!previous?.hash) throw new Error('UNVERIFIABLE_304');
      return { ...previous, url, finalUrl: target, notModified: true, available: true };
    }
    if (!response.ok) throw new Error(`SOURCE_HTTP_${response.status}`);
    if (Number(response.headers.get('content-length') ?? 0) > MAX_BYTES) throw new Error('SOURCE_TOO_LARGE');
    const type = (response.headers.get('content-type') ?? '').split(';')[0].trim();
    if (!(format === 'pdf' ? type === 'application/pdf' : ['text/html','text/plain'].includes(type))) throw new Error('SOURCE_MIME_MISMATCH');
    if (!response.body) throw new Error('EMPTY_SOURCE');
    const reader = response.body.getReader(); const chunks = []; let bytes = 0;
    try {
      while (true) { const item = await reader.read(); if (item.done) break; bytes += item.value.length; if (bytes > MAX_BYTES) throw new Error('SOURCE_TOO_LARGE'); chunks.push(Buffer.from(item.value)); }
    } finally { await reader.cancel(); }
    const body = Buffer.concat(chunks);
    if (body.length < 100 || (format === 'pdf' && body.subarray(0,5).toString() !== '%PDF-')) throw new Error('SOURCE_CONTENT_INVALID');
    if (format !== 'pdf' && /<title>[^<]*(access denied|just a moment|sign in|captcha)/i.test(body.toString())) throw new Error('SOURCE_ACCESS_CHALLENGE');
    return { url, finalUrl: target, hash: digest(body), bytes, contentType: type, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified'), available: true, notModified: false };
  }
  throw new Error('REDIRECT_LIMIT');
}
export async function observe(registry, previous = { observations: {} }, { comprehensive = false, transport = fetch, now = new Date().toISOString() } = {}) {
  const observations = structuredClone(previous.observations ?? {}); const changes = []; const blockers = []; const jobs = [];
  for (const source of registry.sources) {
    for (const [url, format, kind] of [[source.url, source.format, 'primary'], ...(source.discoveryUrls ?? []).map(u => [u, 'html', 'discovery'])]) {
      const key = digest(url); const old = observations[key];
      try {
        const current = await fetchBounded(url, source.allowedHosts, old, format, transport, !comprehensive);
        const changed = old?.hash !== current.hash;
        observations[key] = { ...current, sourceId: source.id, kind, checkedAt: now };
        if (changed) changes.push({ sourceId: source.id, kind, url, previousHash: old?.hash ?? null, hash: current.hash, reason: old ? 'CONTENT_CHANGED' : 'INITIAL_SNAPSHOT', requiresSemanticReview: true });
        if (kind === 'primary' && (changed || !old?.verifiedEvidenceHash)) jobs.push({ sourceId: source.id, rawHash: current.hash, idempotencyKey: digest({ source: source.id, hash: current.hash }), status: 'UNVERIFIED', reason: 'PRIMARY_TEXT_AND_INDEPENDENT_LIVE_ADAPTERS_REQUIRED' });
      } catch (error) {
        blockers.push({ sourceId: source.id, url, reason: error.message });
        observations[key] = { ...old, sourceId: source.id, url, kind, available: false, checkedAt: now, lastError: error.message };
      }
    }
  }
  return { schemaVersion: 1, checkedAt: now, previousStateHash: digest(previous), comprehensive, observations, changes, blockers,
    history: [...(previous.history ?? []), { checkedAt: now, changes, blockers }],
    workQueue: [...new Map(jobs.map(j => [j.idempotencyKey, j])).values()],
    coverage: { registeredSources: registry.sources.length, exhaustiveSocietyCoverage: false, completeEvidenceReview: false },
    graphEvents: changes.map(c => ({ taskType: 'SOURCE_REVERIFICATION', sourceId: c.sourceId, sourceHash: c.hash, status: 'not_started', reason: c.reason })),
    agentCalls: 0, modelCalls: 0, note: 'Change detection does not establish guideline revision, supersession or verified guidance. No recurring model calls. Live extraction adapters are not configured.' };
}
export async function watchCli(args = process.argv.slice(2)) {
  const value = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
  const registry = JSON.parse(await readFile(value('--registry', 'engineering/clinical-evidence/sources.json'), 'utf8'));
  let previous = { observations: {} };
  const previousFile = value('--previous', null);
  if (previousFile) { try { previous = JSON.parse(await readFile(previousFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
  const report = await observe(registry, previous, { comprehensive: args.includes('--comprehensive') });
  const path = resolve(value('--output', 'evidence-observation.json'));
  await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output: path, changes: report.changes.length, blockers: report.blockers, modelCalls: report.modelCalls, evidenceReviewComplete: false }, null, 2));
  return report;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await watchCli();
