import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-amantadine-hydrochloride-ir-oral-capsule', 'MED-amantadine-hydrochloride-ir-oral-tablet', 'MED-amantadine-hydrochloride-oral-solution', 'MED-gocovri-amantadine-er-oral-capsule', 'MED-osmolex-er-amantadine-er-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Parkinson amantadine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PARKINSON-AMANTADINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T17:55:00Z', engineVersion: 'parkinson-amantadine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PARKINSON-AMANTADINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Parkinson amantadine terminology', () => {
  it('assembles valid terminology and preserves five identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it('fails bare amantadine closed across route/form/release identities', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('amantadine', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['amantadine capsule', 'MED-amantadine-hydrochloride-ir-oral-capsule'],
    ['amantadine tablet', 'MED-amantadine-hydrochloride-ir-oral-tablet'],
    ['amantadine oral solution', 'MED-amantadine-hydrochloride-oral-solution'],
    ['Gocovri', 'MED-gocovri-amantadine-er-oral-capsule'],
    ['Osmolex ER', 'MED-osmolex-er-amantadine-er-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Parkinson amantadine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PARKINSON-AMANTADINE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PARKINSON-AMANTADINE-REVIEW-001', version: 1 });
    }
  });
});
