import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-valproic-acid-oral-capsule',
  'MED-valproic-acid-oral-solution',
  'MED-valproate-sodium-intravenous-injection',
  'MED-depakote-divalproex-sodium-dr-oral-tablet',
  'MED-depakote-er-divalproex-sodium-er-oral-tablet',
  'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing valproate/divalproex fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-VALPROATE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-03T08:55:00Z', engineVersion: 'antiepileptic-valproate-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-VALPROATE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Valproate and divalproex terminology', () => {
  it('assembles valid terminology and preserves six identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ['ING-valproic-acid', 'ING-valproate-sodium', 'ING-divalproex-sodium']) {
      expect(terminologyDataset.ingredients.filter((item) => item.id === id)).toHaveLength(1);
    }
    for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['valproate', 'valproic acid', 'divalproex', 'Depakote'])('fails non-specific %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['valproic acid oral capsule', 'MED-valproic-acid-oral-capsule'],
    ['valproic acid oral solution', 'MED-valproic-acid-oral-solution'],
    ['valproate sodium IV injection', 'MED-valproate-sodium-intravenous-injection'],
    ['Depakote delayed-release tablet', 'MED-depakote-divalproex-sodium-dr-oral-tablet'],
    ['Depakote ER extended-release tablet', 'MED-depakote-er-divalproex-sodium-er-oral-tablet'],
    ['Depakote Sprinkles delayed-release capsule', 'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule'],
  ])('resolves explicit wording %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Valproate and divalproex review routing', () => {
  it('keeps production empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-VALPROATE-REVIEW-001');
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
