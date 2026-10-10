import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-amiodarone-tablet',
  'MED-amiodarone-injection',
  'MED-dronedarone-multaq-tablet',
  'MED-sotalol-tablet',
  'MED-sotalol-af-tablet',
  'MED-sotalol-sotylize-solution',
  'MED-sotalol-injection',
  'MED-dofetilide-tikosyn-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 05 class III antiarrhythmic fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B5-CLASS-III-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T14:47:00Z', engineVersion: 'batch-05-class-iii-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-B5-CLASS-III', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Batch 05 class III antiarrhythmic terminology', () => {
  it('assembles valid terminology and preserves eight identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-class-iii-antiarrhythmic');
  });

  it.each(['amiodarone', 'sotalol'])('fails bare %s closed across route/form products', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['amiodarone tablet', 'MED-amiodarone-tablet'],
    ['IV amiodarone', 'MED-amiodarone-injection'],
    ['MULTAQ', 'MED-dronedarone-multaq-tablet'],
    ['standard sotalol tablet', 'MED-sotalol-tablet'],
    ['sotalol AF', 'MED-sotalol-af-tablet'],
    ['SOTYLIZE', 'MED-sotalol-sotylize-solution'],
    ['IV sotalol', 'MED-sotalol-injection'],
    ['TIKOSYN', 'MED-dofetilide-tikosyn-capsule'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 05 class III antiarrhythmic review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B5-CLASS-III-ANTIARRHYTHMIC-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B5-CLASS-III-ANTIARRHYTHMIC-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
