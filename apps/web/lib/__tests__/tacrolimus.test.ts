import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-prograf-tacrolimus-immediate-release-oral-capsule',
  'MED-prograf-tacrolimus-granules-for-oral-suspension',
  'MED-prograf-tacrolimus-intravenous-injection',
  'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule',
  'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing tacrolimus fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-TACROLIMUS-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T02:31:00Z', engineVersion: 'tacrolimus-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-TACROLIMUS', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('tacrolimus terminology', () => {
  it('assembles valid terminology and preserves five explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['Prograf capsule', 'MED-prograf-tacrolimus-immediate-release-oral-capsule'],
    ['Prograf granules', 'MED-prograf-tacrolimus-granules-for-oral-suspension'],
    ['Prograf injection', 'MED-prograf-tacrolimus-intravenous-injection'],
    ['Astagraf XL capsule', 'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule'],
    ['Envarsus XR tablet', 'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it('fails bare tacrolimus closed across release, form, and route identities', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('tacrolimus', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('tacrolimus review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-TACROLIMUS-TRANSPLANT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-TACROLIMUS-TRANSPLANT-REVIEW-001', version: 1 });
    }
  });
});
