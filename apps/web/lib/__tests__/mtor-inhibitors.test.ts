import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-sirolimus-oral-tablet',
  'MED-sirolimus-oral-solution',
  'MED-zortress-everolimus-transplant-oral-tablet',
  'MED-afinitor-everolimus-oncology-oral-tablet',
  'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing mTOR inhibitor fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-MTOR-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T06:34:00Z', engineVersion: 'mtor-inhibitor-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-MTOR', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('mTOR inhibitor terminology', () => {
  it('assembles valid terminology and preserves five explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['sirolimus tablet', 'MED-sirolimus-oral-tablet'],
    ['sirolimus oral solution', 'MED-sirolimus-oral-solution'],
    ['Zortress tablet', 'MED-zortress-everolimus-transplant-oral-tablet'],
    ['Afinitor tablet', 'MED-afinitor-everolimus-oncology-oral-tablet'],
    ['Afinitor Disperz tablet for suspension', 'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it.each(['sirolimus', 'everolimus', 'everolimus tablet'])('fails formulation or indication-ambiguous %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('mTOR inhibitor review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-MTOR-INHIBITOR-SPECIALIST-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-MTOR-INHIBITOR-SPECIALIST-REVIEW-001', version: 1 });
    }
  });
});
