import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-phenobarbital-oral-tablet',
  'MED-phenobarbital-oral-solution',
  'MED-phenobarbital-sodium-parenteral-injection',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing phenobarbital fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PHENOBARBITAL-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-03T05:55:00Z', engineVersion: 'antiepileptic-phenobarbital-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PHENOBARBITAL', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Phenobarbital terminology', () => {
  it('assembles valid terminology and preserves three identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.filter((item) => item.id === 'ING-phenobarbital')).toHaveLength(1);
    for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['phenobarbital'])('fails non-specific %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['phenobarbital oral tablet', 'MED-phenobarbital-oral-tablet'],
    ['phenobarbital oral solution', 'MED-phenobarbital-oral-solution'],
    ['phenobarbital sodium injection', 'MED-phenobarbital-sodium-parenteral-injection'],
  ])('resolves explicit wording %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Phenobarbital review routing', () => {
  it('keeps production empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-PHENOBARBITAL-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes all explicit identities to review for %s', (procedureCode) => {
    for (const id of medicationIds) {
      const event = evaluate(id, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
