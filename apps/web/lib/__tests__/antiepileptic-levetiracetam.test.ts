import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-keppra-levetiracetam-ir-film-coated-oral-tablet', 'MED-keppra-levetiracetam-oral-solution', 'MED-keppra-levetiracetam-intravenous-concentrate', 'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet', 'MED-spritam-levetiracetam-tablet-for-oral-suspension'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing antiepileptic levetiracetam fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-ANTIEPILEPTIC-LEVETIRACETAM-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T18:55:00Z', engineVersion: 'antiepileptic-levetiracetam-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-ANTIEPILEPTIC-LEVETIRACETAM', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Antiepileptic levetiracetam terminology', () => {
  it('assembles valid terminology and preserves five identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['levetiracetam', 'Keppra'])('fails bare %s closed across route/form/release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['levetiracetam IR tablet', 'MED-keppra-levetiracetam-ir-film-coated-oral-tablet'],
    ['Keppra oral solution', 'MED-keppra-levetiracetam-oral-solution'],
    ['Keppra injection', 'MED-keppra-levetiracetam-intravenous-concentrate'],
    ['Keppra XR', 'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet'],
    ['Spritam', 'MED-spritam-levetiracetam-tablet-for-oral-suspension'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Antiepileptic levetiracetam review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-LEVETIRACETAM-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-ANTIEPILEPTIC-LEVETIRACETAM-REVIEW-001', version: 1 });
    }
  });
});
