import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-trileptal-oxcarbazepine-film-coated-oral-tablet', 'MED-trileptal-oxcarbazepine-oral-suspension', 'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing antiepileptic oxcarbazepine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-ANTIEPILEPTIC-OXCARBAZEPINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-03T01:55:00Z', engineVersion: 'antiepileptic-oxcarbazepine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-ANTIEPILEPTIC-OXCARBAZEPINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Antiepileptic oxcarbazepine terminology', () => {
  it('assembles valid terminology and preserves three identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.filter((item) => item.id === 'ING-oxcarbazepine')).toHaveLength(1);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['oxcarbazepine', 'Trileptal'])('fails non-specific %s closed across form/release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Trileptal tablet', 'MED-trileptal-oxcarbazepine-film-coated-oral-tablet'],
    ['oxcarbazepine oral suspension', 'MED-trileptal-oxcarbazepine-oral-suspension'],
    ['Oxtellar XR', 'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Antiepileptic oxcarbazepine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-OXCARBAZEPINE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-ANTIEPILEPTIC-OXCARBAZEPINE-REVIEW-001', version: 1 });
    }
  });
});
