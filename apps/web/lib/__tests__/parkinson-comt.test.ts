import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-entacapone-oral-tablet', 'MED-tolcapone-oral-tablet', 'MED-ongentys-opicapone-oral-capsule', 'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Parkinson COMT fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PARKINSON-COMT-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T15:55:00Z', engineVersion: 'parkinson-comt-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PARKINSON-COMT', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Parkinson COMT terminology', () => {
  it('assembles valid terminology and preserves four identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it('fails bare entacapone closed across single-ingredient and whole-product identities', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('entacapone', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['entacapone tablet', 'MED-entacapone-oral-tablet'],
    ['tolcapone', 'MED-tolcapone-oral-tablet'],
    ['Ongentys', 'MED-ongentys-opicapone-oral-capsule'],
    ['carbidopa levodopa entacapone tablet', 'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Parkinson COMT review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PARKINSON-COMT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PARKINSON-COMT-REVIEW-001', version: 1 });
    }
  });
});
