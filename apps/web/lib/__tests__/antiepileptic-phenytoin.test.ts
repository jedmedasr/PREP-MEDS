import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-dilantin-phenytoin-sodium-er-oral-capsule',
  'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet',
  'MED-dilantin-125-phenytoin-oral-suspension',
  'MED-phenytoin-sodium-parenteral-injection',
  'MED-cerebyx-fosphenytoin-sodium-parenteral-injection',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing phenytoin fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PHENYTOIN-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-03T04:50:00Z', engineVersion: 'antiepileptic-phenytoin-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PHENYTOIN', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Phenytoin/fosphenytoin terminology', () => {
  it('assembles valid terminology and preserves five identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.filter((item) => ['ING-phenytoin', 'ING-fosphenytoin'].includes(item.id))).toHaveLength(2);
    for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['phenytoin', 'Dilantin'])('fails non-specific %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Dilantin capsule', 'MED-dilantin-phenytoin-sodium-er-oral-capsule'],
    ['Dilantin Infatabs', 'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet'],
    ['Dilantin-125', 'MED-dilantin-125-phenytoin-oral-suspension'],
    ['phenytoin sodium injection', 'MED-phenytoin-sodium-parenteral-injection'],
    ['Cerebyx', 'MED-cerebyx-fosphenytoin-sodium-parenteral-injection'],
  ])('resolves explicit wording %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Phenytoin/fosphenytoin review routing', () => {
  it('keeps production empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-PHENYTOIN-FOSPHENYTOIN-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
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
