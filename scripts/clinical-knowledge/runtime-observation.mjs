import { openSync, readSync, closeSync, fstatSync, constants } from 'node:fs';
import { digest, stable } from '../clinical-evidence/core.mjs';
import { dateOnly, reconcileObservation } from './core.mjs';

export const MAX_OBSERVATION_BYTES = 2 * 1024 * 1024;
const MAX_AGE_MS = 31 * 86400000;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const reject = code => { throw new Error(code); };
function timestamp(value) {
  if (typeof value !== 'string' || !dateOnly(value.slice(0, 10)) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  return Date.parse(value);
}

// Only a server-configured regular file is read. No request path, source fetch or AI call.
function readBounded(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK);
    const before = fstatSync(fd);
    if (!before.isFile()) reject('OBSERVATION_NOT_REGULAR_FILE');
    if (before.size > MAX_OBSERVATION_BYTES) reject('OBSERVATION_TOO_LARGE');
    const bytes = Buffer.alloc(MAX_OBSERVATION_BYTES + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > MAX_OBSERVATION_BYTES) reject('OBSERVATION_TOO_LARGE');
    const after = fstatSync(fd);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || length !== after.size) reject('OBSERVATION_CHANGED_DURING_READ');
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, length))); }
    catch { reject('OBSERVATION_INVALID_JSON'); }
  } finally { if (fd !== undefined) closeSync(fd); }
}

function validateSnapshot(snapshot, registry, watchRegistry, now) {
  const clock = timestamp(now);
  const checked = timestamp(snapshot?.checkedAt);
  if (!Number.isFinite(clock)) reject('OBSERVATION_CLOCK_INVALID');
  if (!object(snapshot) || snapshot.schemaVersion !== 1 || !object(snapshot.observations) ||
      !Array.isArray(snapshot.history) || !snapshot.history.length || !Array.isArray(snapshot.changes) ||
      !Array.isArray(snapshot.blockers) || !Number.isFinite(checked)) reject('OBSERVATION_SCHEMA_INVALID');
  if (checked > clock) reject('OBSERVATION_FROM_FUTURE');
  if (clock - checked > MAX_AGE_MS) reject('OBSERVATION_STALE');
  const byId = new Map(watchRegistry.sources.map(source => [source.id, source]));
  const locationMatches = entry => {
    const source = byId.get(entry?.sourceId);
    return source && (entry.kind === 'primary' ? entry.url === source.url :
      entry.kind === 'discovery' && source.discoveryUrls?.includes(entry.url));
  };
  // History is required: dropping it must not erase an unresolved discovery warning.
  let previous = -Infinity;
  for (const entry of [...snapshot.history, snapshot]) {
    const at = timestamp(entry?.checkedAt);
    if (!object(entry) || !Number.isFinite(at) || at < previous || at > checked ||
        !Array.isArray(entry.changes) || !Array.isArray(entry.blockers)) reject('OBSERVATION_HISTORY_INVALID');
    previous = at;
    for (const change of entry.changes) {
      if (!object(change) || !locationMatches(change) || !hash(change.hash) ||
          !['CONTENT_CHANGED', 'INITIAL_SNAPSHOT'].includes(change.reason) ||
          (change.reason === 'CONTENT_CHANGED' && !hash(change.previousHash))) reject('OBSERVATION_HISTORY_INVALID');
    }
    for (const blocker of entry.blockers) {
      const source = byId.get(blocker?.sourceId);
      if (!source || ![source.url, ...(source.discoveryUrls ?? [])].includes(blocker.url) ||
          typeof blocker.reason !== 'string' || !blocker.reason) reject('OBSERVATION_HISTORY_INVALID');
    }
  }
  const last = snapshot.history.at(-1);
  if (last.checkedAt !== snapshot.checkedAt || stable(last.changes) !== stable(snapshot.changes) ||
      stable(last.blockers) !== stable(snapshot.blockers)) reject('OBSERVATION_HISTORY_INVALID');
  const seen = new Set();
  for (const [key, item] of Object.entries(snapshot.observations)) {
    if (!object(item) || !locationMatches(item) || key !== digest(item.url) || seen.has(item.url)) reject('OBSERVATION_LOCATION_INVALID');
    seen.add(item.url);
  }
  for (const source of registry.sources) {
    const watchSource = watchRegistry.sources.find(item => item.url === source.url);
    if (!watchSource) reject('OBSERVATION_SOURCE_NOT_REGISTERED');
    for (const url of [source.url, ...(watchSource.discoveryUrls ?? [])]) {
      const item = snapshot.observations[digest(url)];
      if (!item || item.sourceId !== watchSource.id) reject('OBSERVATION_SOURCE_MISSING');
      if (item.available !== true || !hash(item.hash)) reject('OBSERVATION_SOURCE_UNAVAILABLE');
      // Every source and index must have been checked in this observation run.
      if (item.checkedAt !== snapshot.checkedAt) reject('OBSERVATION_SOURCE_TIMESTAMP_INVALID');
      if (snapshot.blockers.some(blocker => blocker.url === url)) reject('OBSERVATION_SOURCE_UNAVAILABLE');
    }
  }
}

/** A trusted deployment supplies the file. Hashes prove content identity, not authorship.
 * Re-read on every request: there is no last-good or committed-receipt fallback.
 * Transporting/authenticating the scheduled artifact is a separate deployment task.
 */
export function loadRuntimeObservation(graph, registry, watchRegistry, { path, now = new Date().toISOString() } = {}) {
  try {
    if (typeof path !== 'string' || !path.trim()) reject('OBSERVATION_NOT_CONFIGURED');
    const snapshot = readBounded(path);
    validateSnapshot(snapshot, registry, watchRegistry, now);
    const result = reconcileObservation(graph, registry, snapshot);
    return { observations: result.current, metadata: {
      status: result.changes.length ? 'INVALIDATES_REFERENCES' : 'READY_FOR_REFERENCE_CHECKS',
      reason: result.changes.length ? 'DEPENDENT_SOURCE_REVERIFICATION_REQUIRED' : null,
      observedAt: snapshot.checkedAt, snapshotHash: digest(snapshot)
    } };
  } catch (error) {
    const code = typeof error?.message === 'string' && /^OBSERVATION_[A-Z_]+$/.test(error.message)
      ? error.message : 'OBSERVATION_UNREADABLE';
    return { observations: {}, metadata: { status: 'UNAVAILABLE', reason: code, observedAt: null, snapshotHash: null } };
  }
}
