import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-phentermine-hydrochloride-oral-capsule',
  'MED-phentermine-hydrochloride-oral-tablet',
  'MED-qsymia-phentermine-topiramate-er-capsule',
  'MED-contrave-naltrexone-bupropion-er-tablet',
  'MED-xenical-orlistat-120mg-capsule',
  'MED-alli-orlistat-60mg-otc-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing weight-management fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-WEIGHT-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T12:05:00Z', engineVersion: 'weight-management-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-WEIGHT', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('weight-management terminology', () => {
  it('assembles valid terminology and preserves six explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['phentermine', 'orlistat'])('fails bare %s closed across product identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['phentermine capsule', 'MED-phentermine-hydrochloride-oral-capsule'],
    ['phentermine tablet', 'MED-phentermine-hydrochloride-oral-tablet'],
    ['Qsymia', 'MED-qsymia-phentermine-topiramate-er-capsule'],
    ['Contrave', 'MED-contrave-naltrexone-bupropion-er-tablet'],
    ['Xenical', 'MED-xenical-orlistat-120mg-capsule'],
    ['Alli', 'MED-alli-orlistat-60mg-otc-capsule'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('weight-management review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-WEIGHT-MANAGEMENT-ANESTHESIA-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-WEIGHT-MANAGEMENT-ANESTHESIA-REVIEW-001', version: 1 });
    }
  });
});
