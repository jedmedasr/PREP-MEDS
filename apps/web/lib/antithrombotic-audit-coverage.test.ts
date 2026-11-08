import { describe, expect, it } from 'vitest';
import { terminologyDataset } from './content';
import { buildAntithromboticAuditQueue } from './antithrombotic-audit-queue';

describe('antithrombotic audit discovery completeness', () => {
  it('includes every canonical medication containing an explicitly named high-risk ingredient', () => {
    const ingredientPattern = /apixaban|rivaroxaban|edoxaban|dabigatran|betrixaban|warfarin|acenocoumarol|phenprocoumon|heparin|enoxaparin|dalteparin|tinzaparin|fondaparinux|argatroban|bivalirudin|desirudin|lepirudin|danaparoid|aspirin|acetylsalicylic|clopidogrel|prasugrel|ticagrelor|ticlopidine|cangrelor|dipyridamole|cilostazol|vorapaxar|abciximab|eptifibatide|tirofiban/i;
    const expected = terminologyDataset.medications.filter(m => m.ingredientIds.some(id => ingredientPattern.test(id)));
    const queue = buildAntithromboticAuditQueue();
    const discovered = new Set(queue.medications.map(m => m.medicationId));
    for (const medication of expected) {
      expect(discovered.has(medication.id), medication.id).toBe(true);
      const audit = queue.medications.find(m => m.medicationId === medication.id);
      expect(audit?.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(audit?.clinicalApproval).toBe(false);
    }
    expect(queue.counts.canonicalMedicationIds).toBe(queue.medications.length);
    expect(queue.medications.every(m => m.asge2016.source.doi === '10.1016/j.gie.2015.09.035')).toBe(true);
  });
});
