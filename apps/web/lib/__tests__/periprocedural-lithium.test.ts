import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';
const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-lithium-carbonate-immediate-release-oral-tablet','MED-lithium-carbonate-immediate-release-oral-capsule','MED-lithobid-lithium-carbonate-extended-release-oral-tablet','MED-lithium-citrate-oral-solution'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing lithium fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-LITHIUM-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T18:55:00Z', engineVersion: 'periprocedural-lithium-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-LITHIUM', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural lithium terminology', () => {
  it('assembles valid terminology and preserves four identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['lithium', 'lithium carbonate'])('fails non-specific %s closed across chemical-form, form, or release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['lithium carbonate tablet', 'MED-lithium-carbonate-immediate-release-oral-tablet'],
    ['lithium carbonate capsule', 'MED-lithium-carbonate-immediate-release-oral-capsule'],
    ['Lithobid', 'MED-lithobid-lithium-carbonate-extended-release-oral-tablet'],
    ['lithium citrate solution', 'MED-lithium-citrate-oral-solution'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});
describe('periprocedural lithium review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PERIPROCEDURAL-LITHIUM-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-LITHIUM-REVIEW-001', version: 1 });
    }
  });
});
