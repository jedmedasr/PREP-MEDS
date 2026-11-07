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

describe('antithrombotic audit coverage accounting', () => {
  it('prints exact auditable denominator and checks every mapped ID', () => {
    const result = queue();
    console.info('ANTITHROMBOTIC_AUDIT_COUNTS', JSON.stringify(result.counts));
    expect(Object.keys(result.canonicalIdToProvisionalGroup)).toHaveLength(result.counts.canonicalMedicationIds);
    expect(result.groups).toHaveLength(result.counts.provisionalIngredientGroups);
    for (const medication of result.medications) {
      expect(result.canonicalIdToProvisionalGroup[medication.medicationId]).toBe(medication.provisionalGroupKey);
      expect(medication.asge2016.source.doi).toBe('10.1016/j.gie.2015.09.035');
      expect(medication.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(medication.sourceVersions[0].year).toBe(2016);
      expect(medication.unresolvedIssues.length).toBeGreaterThan(0);
    }
  });
  it('does not omit any canonical medication carrying an explicit antithrombotic ingredient', async () => {
    const { terminologyDataset } = await import('./content');
    const mapped = new Set(queue().medications.map(m => m.medicationId));
    const antithromboticIngredients = /apixaban|rivaroxaban|edoxaban|dabigatran|warfarin|heparin|enoxaparin|dalteparin|fondaparinux|aspirin|clopidogrel|prasugrel|ticagrelor|ticlopidine|dipyridamole|cilostazol/i;
    for (const medication of terminologyDataset.medications) {
      if (medication.ingredientIds.some(id => antithromboticIngredients.test(id))) {
        expect(mapped.has(medication.id), 'Missing antithrombotic medication: ' + medication.id).toBe(true);
      }
    }
  });
});
