import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-amlodipine', 'MED-nifedipine-capsule', 'MED-nifedipine-er', 'MED-felodipine-er'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 DHP CCB fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-DHP-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T08:34:00Z',
    engineVersion: 'batch-04-dhp-ccb-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-DHP',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 dihydropyridine CCB terminology', () => {
  it('assembles valid terminology and preserves four identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-calcium-channel-blocker');
    }
  });

  it('fails bare nifedipine closed across capsule and extended-release tablet', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('nifedipine', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['amlodipine', 'MED-amlodipine'],
    ['amlodipine besylate', 'MED-amlodipine'],
    ['nifedipine capsule', 'MED-nifedipine-capsule'],
    ['nifedipine ER', 'MED-nifedipine-er'],
    ['nifedipine extended release', 'MED-nifedipine-er'],
    ['felodipine', 'MED-felodipine-er'],
    ['felodipine ER', 'MED-felodipine-er'],
  ])('resolves explicit DHP CCB wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 dihydropyridine CCB review routing', () => {
  it('keeps production rules empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-DHP-CCB-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit DHP CCB identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-DHP-CCB-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
