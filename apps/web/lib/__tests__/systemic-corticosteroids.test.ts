import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-prednisone-immediate-release-oral-tablet',
  'MED-prednisone-delayed-release-oral-tablet',
  'MED-prednisolone-oral-tablet',
  'MED-prednisolone-sodium-phosphate-oral-solution',
  'MED-medrol-methylprednisolone-oral-tablet',
  'MED-solu-medrol-methylprednisolone-sodium-succinate-injection',
  'MED-cortef-hydrocortisone-oral-tablet',
  'MED-solu-cortef-hydrocortisone-sodium-succinate-injection',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing systemic corticosteroid fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-STEROID-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T02:05:00Z', engineVersion: 'systemic-corticosteroid-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-STEROID', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('systemic corticosteroid terminology', () => {
  it('assembles valid terminology and preserves eight explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['prednisone immediate-release tablet', 'MED-prednisone-immediate-release-oral-tablet'],
    ['prednisone delayed-release tablet', 'MED-prednisone-delayed-release-oral-tablet'],
    ['prednisolone tablet', 'MED-prednisolone-oral-tablet'],
    ['prednisolone oral solution', 'MED-prednisolone-sodium-phosphate-oral-solution'],
    ['Medrol tablet', 'MED-medrol-methylprednisolone-oral-tablet'],
    ['Solu-Medrol injection', 'MED-solu-medrol-methylprednisolone-sodium-succinate-injection'],
    ['Cortef tablet', 'MED-cortef-hydrocortisone-oral-tablet'],
    ['Solu-Cortef injection', 'MED-solu-cortef-hydrocortisone-sodium-succinate-injection'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it.each(['prednisone', 'prednisolone', 'methylprednisolone', 'hydrocortisone'])('fails bare %s closed across route/form/release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('systemic corticosteroid review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-SYSTEMIC-CORTICOSTEROID-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-SYSTEMIC-CORTICOSTEROID-REVIEW-001', version: 1 });
    }
  });
});
