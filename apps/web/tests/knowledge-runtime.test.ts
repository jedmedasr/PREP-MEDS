import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import registry from '../../../clinical-knowledge/source-register.json';
import watchRegistry from '../../../engineering/clinical-evidence/sources.json';
import { buildKnowledgeView } from '../lib/knowledge-library';
import { GET, POST } from '../app/api/knowledge-library/route';
const now = '2026-11-07T20:00:00.000Z';
const observedAt = '2026-11-07T18:00:00.000Z';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
type Observation = { url: string; kind: string; sourceId: string; available: boolean; checkedAt: string; hash: string };
let directory: string;
let path: string;
function snapshot() {
  const observations: Record<string, Observation> = {};
  for (const source of watchRegistry.sources) {
    for (const url of [source.url, ...source.discoveryUrls]) {
      observations[hash(url)] = { url, kind: url === source.url ? 'primary' : 'discovery', sourceId: source.id,
        available: true, checkedAt: observedAt, hash: registry.sources.find(item => item.url === url)?.rawSha256 ?? hash(url) };
    }
  }
  return { schemaVersion: 1, checkedAt: observedAt, observations, changes: [], blockers: [], history: [{ checkedAt: observedAt, changes: [], blockers: [] }] };
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(now));
  directory = mkdtempSync(join(tmpdir(), 'prep-api-observations-')); path = join(directory, 'state.json');
  vi.stubEnv('PREP_MEDS_CONTENT_MODE', 'shadow');
  vi.stubEnv('PREP_MEDS_KNOWLEDGE_MODE', 'reference');
  vi.stubEnv('PREP_MEDS_KNOWLEDGE_OBSERVATIONS', path);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); rmSync(directory, { recursive: true, force: true }); });
describe('server-owned knowledge surveillance', () => {
  it('keeps comparisons visible but disables selection when current state is absent', async () => {
    const view = buildKnowledgeView({ role: 'physician' });
    expect(view.surveillance.status).toBe('UNAVAILABLE');
    expect(view.result.rows).toHaveLength(2);
    expect(view.result.rows.every(row => !row.researchSelectable)).toBe(true);
    expect((await GET()).status).toBe(200);
  });
  it('records the exact fresh observation hash on a synthetic selection, without clinical activation', () => {
    writeFileSync(path, JSON.stringify(snapshot()));
    const view = buildKnowledgeView({ role: 'physician' });
    expect(view.surveillance.status).toBe('READY_FOR_REFERENCE_CHECKS');
    expect(view.result.rows.every(row => row.researchSelectable)).toBe(true);
    const selection = { claimId: view.result.rows[0]!.id, fingerprint: view.result.fingerprint };
    const selected = buildKnowledgeView({ role: 'physician', selection });
    expect(selected.decision?.surveillance.snapshotHash).toBe(view.surveillance.snapshotHash);
    expect(selected.result.patientInstructions).toBeNull();
    expect(selected.result.routineInstructionsAllowed).toBe(false);
  });
  it('re-reads state on POST and rejects an earlier selection after the source changes', async () => {
    const state = snapshot(); writeFileSync(path, JSON.stringify(state));
    const view = buildKnowledgeView({ role: 'physician' });
    const source = registry.sources[0]!;
    state.observations[hash(source.url)]!.hash = 'a'.repeat(64);
    writeFileSync(path, JSON.stringify(state));
    const response = await POST(new Request('http://localhost/api/knowledge-library', { method: 'POST', body: JSON.stringify({
      role: 'physician', selection: { claimId: view.result.rows[0]!.id, fingerprint: view.result.fingerprint }
    }) }));
    expect(response.status).toBe(422);
    expect(buildKnowledgeView({ role: 'physician' }).surveillance.status).toBe('INVALIDATES_REFERENCES');
  });
  it('does not use a previous valid observation after a file becomes unreadable', () => {
    writeFileSync(path, JSON.stringify(snapshot())); expect(buildKnowledgeView().surveillance.status).toBe('READY_FOR_REFERENCE_CHECKS');
    writeFileSync(path, '{'); const view = buildKnowledgeView({ role: 'physician' });
    expect(view.surveillance.reason).toBe('OBSERVATION_INVALID_JSON');
    expect(view.result.rows.every(row => !row.researchSelectable)).toBe(true);
    expect(JSON.stringify(view)).not.toContain(path);
  });
  it('rejects request-controlled paths and fabricated evidence even with a valid server snapshot', () => {
    writeFileSync(path, JSON.stringify(snapshot()));
    for (const field of ['observationPath', 'observations', 'surveillance', 'sourceVerified']) {
      expect(() => buildKnowledgeView({ [field]: 'untrusted' })).toThrow('SYNTHETIC_FIELDS_ONLY');
    }
  });
});
