import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-hydrochlorothiazide', 'MED-chlorthalidone', 'MED-indapamide'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 thiazide diuretic fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-THIAZIDE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T09:02:00Z',
    engineVersion: 'batch-04-thiazide-diuretic-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-THIAZIDE',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 thiazide/thiazide-like diuretic terminology', () => {
  it('assembles valid terminology and preserves three identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-diuretic');
    }
  });

  it.each([
    ['hydrochlorothiazide', 'MED-hydrochlorothiazide'],
    ['HCTZ', 'MED-hydrochlorothiazide'],
    ['chlorthalidone', 'MED-chlorthalidone'],
    ['indapamide', 'MED-indapamide'],
  ])('resolves verified diuretic wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 thiazide/thiazide-like diuretic review routing', () => {
  it('keeps production rules empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-THIAZIDE-DIURETIC-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit thiazide/thiazide-like identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-THIAZIDE-DIURETIC-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
