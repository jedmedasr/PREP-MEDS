import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-tegretol-carbamazepine-conventional-oral-tablet',
  'MED-tegretol-carbamazepine-oral-suspension',
  'MED-carbamazepine-chewable-oral-tablet',
  'MED-tegretol-xr-carbamazepine-er-oral-tablet',
  'MED-carbatrol-carbamazepine-er-oral-capsule',
  'MED-equetro-carbamazepine-er-oral-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing antiepileptic carbamazepine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-ANTIEPILEPTIC-CARBAMAZEPINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-03T03:55:00Z', engineVersion: 'antiepileptic-carbamazepine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-ANTIEPILEPTIC-CARBAMAZEPINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Antiepileptic carbamazepine terminology', () => {
  it('assembles valid terminology and preserves six identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.filter((item) => item.id === 'ING-carbamazepine')).toHaveLength(1);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });

  it.each(['carbamazepine', 'Tegretol', 'carbamazepine extended release capsule'])('fails non-specific %s closed across form, release, or branded capsule identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['Tegretol tablet', 'MED-tegretol-carbamazepine-conventional-oral-tablet'],
    ['Tegretol suspension', 'MED-tegretol-carbamazepine-oral-suspension'],
    ['carbamazepine chewable tablet', 'MED-carbamazepine-chewable-oral-tablet'],
    ['Tegretol XR', 'MED-tegretol-xr-carbamazepine-er-oral-tablet'],
    ['Carbatrol', 'MED-carbatrol-carbamazepine-er-oral-capsule'],
    ['Equetro', 'MED-equetro-carbamazepine-er-oral-capsule'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Antiepileptic carbamazepine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-CARBAMAZEPINE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-ANTIEPILEPTIC-CARBAMAZEPINE-REVIEW-001', version: 1 });
    }
  });
});
