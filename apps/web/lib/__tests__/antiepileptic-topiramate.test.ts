import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-topamax-topiramate-coated-oral-tablet', 'MED-topamax-topiramate-sprinkle-capsule', 'MED-eprontia-topiramate-oral-solution', 'MED-qudexy-xr-topiramate-er-oral-capsule', 'MED-trokendi-xr-topiramate-er-oral-capsule'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing antiepileptic topiramate fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-ANTIEPILEPTIC-TOPIRAMATE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-02T23:55:00Z', engineVersion: 'antiepileptic-topiramate-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-ANTIEPILEPTIC-TOPIRAMATE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Antiepileptic topiramate terminology', () => {
  it('assembles valid terminology, reuses the existing ingredient, and preserves five identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.filter((item) => item.id === 'ING-topiramate')).toHaveLength(1);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['topiramate', 'Topamax', 'topiramate ER capsule'])('fails non-specific %s closed across form/release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Topamax tablet', 'MED-topamax-topiramate-coated-oral-tablet'],
    ['Topamax sprinkle capsule', 'MED-topamax-topiramate-sprinkle-capsule'],
    ['Eprontia', 'MED-eprontia-topiramate-oral-solution'],
    ['Qudexy XR', 'MED-qudexy-xr-topiramate-er-oral-capsule'],
    ['Trokendi XR', 'MED-trokendi-xr-topiramate-er-oral-capsule'],
    ['Qsymia', 'MED-qsymia-phentermine-topiramate-er-capsule'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Antiepileptic topiramate review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-TOPIRAMATE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-ANTIEPILEPTIC-TOPIRAMATE-REVIEW-001', version: 1 });
    }
  });
});
