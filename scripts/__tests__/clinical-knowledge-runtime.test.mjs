import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { digest } from '../clinical-evidence/core.mjs';
import { evaluate, selectReference } from '../clinical-knowledge/core.mjs';
import { loadRuntimeObservation, MAX_OBSERVATION_BYTES } from '../clinical-knowledge/runtime-observation.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const graph = read('../../clinical-knowledge/catalog.json');
const registry = read('../../clinical-knowledge/source-register.json');
const watchRegistry = read('../../engineering/clinical-evidence/sources.json');
const receipt = read('../../clinical-knowledge/verification-receipts.json');
const input = read('../../clinical-knowledge/examples/recent-vte.json');
const now = '2026-11-07T20:00:00.000Z';
const checkedAt = '2026-11-07T18:00:00.000Z';
const primary = registry.sources[0];
const primaryKey = digest(primary.url);
const watched = watchRegistry.sources.find(s => s.url === primary.url);
const discoveryKey = digest(watched.discoveryUrls[0]);
function fixture() {
  const observations = {};
  for (const source of watchRegistry.sources) {
    for (const [url, kind] of [[source.url, 'primary'], ...source.discoveryUrls.map(url => [url, 'discovery'])]) {
      observations[digest(url)] = { url, kind, sourceId: source.id, available: true, checkedAt,
        hash: registry.sources.find(s => s.url === url)?.rawSha256 ?? digest(url) };
    }
  }
  return { schemaVersion: 1, checkedAt, observations, changes: [], blockers: [], history: [{ checkedAt, changes: [], blockers: [] }] };
}
function location(t) {
  const dir = mkdtempSync(join(tmpdir(), 'prep-runtime-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return { dir, path: join(dir, 'observation.json') };
}
function save(path, snapshot) { writeFileSync(path, JSON.stringify(snapshot)); }
function load(path, clock = now) { return loadRuntimeObservation(graph, registry, watchRegistry, { path, now: clock }); }
function result(runtime) { return evaluate(graph, registry, input, { mode: 'synthetic-research', role: 'physician', asOf: '2026-11-07', receipts: receipt.sources, observations: runtime.observations }); }

test('unconfigured runtime never manufactures current observations from committed receipts', () => {
  const r = load(undefined);
  assert.equal(r.metadata.reason, 'OBSERVATION_NOT_CONFIGURED');
  assert.equal(result(r).rows.some(row => row.researchSelectable), false);
  assert.equal(result(r).patientInstructions, null);
});
test('fresh complete server observation enables only synthetic reference checks without network or models', t => {
  const { path } = location(t); const s = fixture(); save(path, s);
  const r = load(path); assert.equal(r.metadata.status, 'READY_FOR_REFERENCE_CHECKS');
  assert.equal(r.metadata.snapshotHash, digest(s));
  const evaluated = result(r);
  assert.ok(evaluated.rows.every(row => row.researchSelectable));
  assert.ok(evaluated.rows.every(row => row.semanticVerification === 'SEMANTIC_VERIFICATION_PENDING'));
  assert.equal(evaluated.modelCalls, 0); assert.equal(evaluated.networkCalls, 0); assert.equal(evaluated.patientInstructions, null);
  assert.deepEqual(r, load(path));
});
for (const [name, modify, expected] of [
  ['missing primary', s => { delete s.observations[primaryKey]; }, 'OBSERVATION_SOURCE_MISSING'],
  ['missing discovery index', s => { delete s.observations[discoveryKey]; }, 'OBSERVATION_SOURCE_MISSING'],
  ['unavailable index', s => { s.observations[discoveryKey].available = false; }, 'OBSERVATION_SOURCE_UNAVAILABLE'],
  ['unavailable primary', s => { s.observations[primaryKey].available = false; }, 'OBSERVATION_SOURCE_UNAVAILABLE'],
  ['wrong source ID', s => { s.observations[primaryKey].sourceId = 'unregistered'; }, 'OBSERVATION_LOCATION_INVALID'],
  ['incorrect URL key', s => { s.observations.wrong = s.observations[primaryKey]; delete s.observations[primaryKey]; }, 'OBSERVATION_LOCATION_INVALID'],
  ['duplicate URL', s => { s.observations.duplicate = s.observations[primaryKey]; }, 'OBSERVATION_LOCATION_INVALID'],
  ['malformed hash', s => { s.observations[primaryKey].hash = 'verified'; }, 'OBSERVATION_SOURCE_UNAVAILABLE'],
  ['missing source timestamp', s => { delete s.observations[primaryKey].checkedAt; }, 'OBSERVATION_SOURCE_TIMESTAMP_INVALID'],
  ['old source timestamp in new envelope', s => { s.observations[primaryKey].checkedAt = '2026-09-01T00:00:00Z'; }, 'OBSERVATION_SOURCE_TIMESTAMP_INVALID'],
  ['missing history', s => { delete s.history; }, 'OBSERVATION_SCHEMA_INVALID'],
  ['empty history', s => { s.history = []; }, 'OBSERVATION_SCHEMA_INVALID'],
  ['malformed history entry', s => { s.history.unshift(null); }, 'OBSERVATION_HISTORY_INVALID'],
  ['discarded last-run changes', s => { s.history[0].changes = [{kind:'discovery'}]; }, 'OBSERVATION_HISTORY_INVALID'],
  ['impossible timestamp date', s => { s.checkedAt = '2026-02-30T10:00:00Z'; }, 'OBSERVATION_SCHEMA_INVALID'],
  ['conflicting access blocker', s => { const b = {sourceId:watched.id,url:primary.url,reason:'SOURCE_HTTP_403'}; s.blockers=[b];s.history[0].blockers=[b]; }, 'OBSERVATION_SOURCE_UNAVAILABLE']
]) test(`runtime fails closed on ${name}`, t => {
  const { path } = location(t); const s = fixture(); modify(s); save(path, s);
  const r = load(path); assert.equal(r.metadata.reason, expected); assert.deepEqual(r.observations, {});
  assert.equal(result(r).rows.some(row => row.researchSelectable), false);
});
test('exact-clock checks reject a timestamp later today, not only tomorrow', t => {
  const { path } = location(t); save(path, fixture());
  assert.equal(load(path, '2026-11-07T17:59:59.999Z').metadata.reason, 'OBSERVATION_FROM_FUTURE');
  assert.equal(load(path, checkedAt).metadata.status, 'READY_FOR_REFERENCE_CHECKS');
});
test('31-day freshness boundary is precise and stale input cannot reuse the last good snapshot', t => {
  const { path } = location(t); save(path, fixture());
  assert.equal(load(path, '2026-12-08T18:00:00.000Z').metadata.status, 'READY_FOR_REFERENCE_CHECKS');
  assert.equal(load(path, '2026-12-08T18:00:00.001Z').metadata.reason, 'OBSERVATION_STALE');
});
test('invalid JSON, oversized input, directories and missing files are unavailable without disclosing the path', t => {
  const { dir, path } = location(t);
  assert.equal(load(path).metadata.reason, 'OBSERVATION_UNREADABLE');
  writeFileSync(path, '{'); assert.equal(load(path).metadata.reason, 'OBSERVATION_INVALID_JSON');
  writeFileSync(path, Buffer.alloc(MAX_OBSERVATION_BYTES + 1)); assert.equal(load(path).metadata.reason, 'OBSERVATION_TOO_LARGE');
  assert.equal(load(dir).metadata.reason, 'OBSERVATION_NOT_REGULAR_FILE');
  assert.equal(JSON.stringify(load(path)).includes(path), false);
});
test('changed primary document invalidates selection; reverting to an old reference receipt cannot override it', t => {
  const { path } = location(t); const s = fixture(); save(path, s);
  const original = result(load(path)); const selection = {claimId:original.rows[0].id,fingerprint:original.fingerprint};
  assert.equal(selectReference(original, selection).patientInstructions, null);
  s.observations[primaryKey].hash = 'a'.repeat(64); save(path, s);
  const r = load(path); assert.equal(r.metadata.status, 'INVALIDATES_REFERENCES');
  const changed = result(r); assert.equal(changed.rows[0].researchSelectable, false);
  assert.throws(() => selectReference(changed, selection), /STALE_SELECTION/);
  rmSync(path); assert.equal(load(path).metadata.status, 'UNAVAILABLE');
});
test('historical discovery warning survives unchanged primary bytes and an empty current change list', t => {
  const { path } = location(t); const s = fixture();
  s.history.unshift({checkedAt:'2026-11-01T12:00:00.000Z',blockers:[],changes:[{
    sourceId:watched.id,url:watched.discoveryUrls[0],kind:'discovery',reason:'CONTENT_CHANGED',
    hash:'b'.repeat(64),previousHash:'c'.repeat(64)
  }]});
  save(path, s); const r=load(path);
  assert.equal(r.metadata.status,'INVALIDATES_REFERENCES');
  assert.equal(r.observations[primary.id].currencyUnresolved,true);
  assert.equal(result(r).rows[0].researchSelectable,false);
});
test('missing guard-source discovery prevents every reference selection', t => {
  const {path}=location(t);const s=fixture();
  const guard=watchRegistry.sources.find(x=>x.id==='bsg-antithrombotic-addendum-2024');
  delete s.observations[digest(guard.discoveryUrls[0])];save(path,s);
  assert.ok(result(load(path)).rows.every(x=>!x.researchSelectable));
});
