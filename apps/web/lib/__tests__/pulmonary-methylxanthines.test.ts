import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-theophylline-oral-solution',
  'MED-theophylline-er-oral-tablet',
  'MED-theo-24-theophylline-er-oral-capsule',
  'MED-aminophylline-intravenous-injection',
] as const;

describe('Pulmonary methylxanthine terminology and routing', () => {
  it('assembles four route-, form-, release-, and ingredient-specific identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['theophylline', 'theophylline anhydrous'])('fails non-specific %s closed across oral solution and extended-release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['theophylline oral solution', ids[0]],
    ['theophylline extended release tablet', ids[1]],
    ['Theo-24', ids[2]],
    ['aminophylline injection', ids[3]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('preserves ingredient and formulation boundaries and keeps production empty', () => {
    expect(activeRules).toEqual([]);
    expect(index.getMedicationById(ids[0])?.ingredientIds).toEqual(['ING-theophylline-anhydrous']);
    expect(index.getMedicationById(ids[3])?.ingredientIds).toEqual(['ING-aminophylline-dihydrate']);
    const rule = clinicalReviewRules.find((item) => item.id === 'RULE-PULMONARY-METHYLXANTHINE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...ids]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({
        decisionEventId: 'DEC-SYNTHETIC-PULMONARY-METHYLXANTHINE-' + medicationId + '-' + procedureCode,
        occurredAt: '2026-10-03T15:55:00Z',
        engineVersion: 'pulmonary-methylxanthine-review-test',
        mode: 'VALIDATION',
        context: { organizationId: 'ORG-SYNTHETIC-PULMONARY-METHYLXANTHINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
        rules: clinicalReviewRules,
        policies: [],
      }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PULMONARY-METHYLXANTHINE-REVIEW-001', version: 1 });
    }
  });
});
