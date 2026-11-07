import { describe, expect, it } from 'vitest';
import { buildAntithromboticAuditQueue as queue } from './antithrombotic-audit-queue';
describe('antithrombotic audit discovery', () => {
  it('preserves canonical IDs and does not double count', () => {
    const items = queue().medications;
    expect(new Set(items.map(m=>m.medicationId)).size).toBe(items.length);
  });
  it('includes major agents and combination antiplatelet', () => {
    const ids = new Set(queue().medications.map(m=>m.medicationId));
    for (const id of ['MED-rivaroxaban','MED-dabigatran','MED-aspirin-dipyridamole','MED-heparin']) expect(ids.has(id)).toBe(true);
  });
  it('does not confer ASGE review or clinical approval by inventory mapping', () => {
    for (const m of queue().medications) {
      expect(m.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(m.clinicalApproval).toBe(false);
      expect(m.auditStatus).toBe('NOT_STARTED');
    }
  });
  it('maps all discovered IDs to provisional groups without claiming formulation adjudication', () => {
    const result=queue();
    expect(result.medications.length).toBeGreaterThanOrEqual(result.groups.length);
    for (const m of result.medications) expect(result.groups).toContain(m.provisionalGroupKey);
  });
});
