import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-diltiazem-tablet',
  'MED-diltiazem-er-capsule-twice-daily',
  'MED-diltiazem-cartia-xt-er-capsule-once-daily',
  'MED-diltiazem-er-tablet-once-daily',
  'MED-verapamil-tablet',
  'MED-verapamil-er-tablet',
  'MED-verapamil-verelan-pm-er-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 non-DHP CCB fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-NONDHP-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T08:46:00Z',
    engineVersion: 'batch-04-nondhp-ccb-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-NONDHP',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 non-DHP CCB terminology', () => {
  it('assembles valid terminology and preserves seven identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-nondihydropyridine-ccb');
    }
  });

  it.each(['diltiazem', 'diltiazem ER', 'diltiazem extended release'])('fails generic diltiazem wording %s closed across formulation/release profiles', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each(['verapamil', 'verapamil ER', 'verapamil extended release'])('fails generic verapamil wording %s closed across standard/ER products', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['diltiazem tablet', 'MED-diltiazem-tablet'],
    ['diltiazem ER twice daily capsule', 'MED-diltiazem-er-capsule-twice-daily'],
    ['Cartia XT', 'MED-diltiazem-cartia-xt-er-capsule-once-daily'],
    ['diltiazem ER tablet', 'MED-diltiazem-er-tablet-once-daily'],
    ['verapamil tablet', 'MED-verapamil-tablet'],
    ['verapamil ER tablet', 'MED-verapamil-er-tablet'],
    ['Verelan PM', 'MED-verapamil-verelan-pm-er-capsule'],
  ])('resolves explicit non-DHP CCB wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 non-DHP CCB review routing', () => {
  it('keeps production rules empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-NONDHP-CCB-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit non-DHP CCB identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-NONDHP-CCB-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
