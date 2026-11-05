import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-flecainide-tablet',
  'MED-propafenone-tablet',
  'MED-propafenone-er-capsule',
  'MED-mexiletine-capsule',
  'MED-quinidine-sulfate-tablet',
  'MED-quinidine-gluconate-er-tablet',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 05 class I antiarrhythmic fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B5-CLASS-I-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T15:44:00Z', engineVersion: 'batch-05-class-i-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-B5-CLASS-I', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Batch 05 class I antiarrhythmic terminology', () => {
  it('assembles valid terminology and preserves six identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-class-i-antiarrhythmic');
  });

  it.each(['propafenone', 'quinidine'])('fails bare %s closed across release/salt forms', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['flecainide', 'MED-flecainide-tablet'],
    ['propafenone tablet', 'MED-propafenone-tablet'],
    ['propafenone ER', 'MED-propafenone-er-capsule'],
    ['mexiletine', 'MED-mexiletine-capsule'],
    ['quinidine sulfate', 'MED-quinidine-sulfate-tablet'],
    ['quinidine gluconate ER', 'MED-quinidine-gluconate-er-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 05 class I antiarrhythmic review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B5-CLASS-I-ANTIARRHYTHMIC-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B5-CLASS-I-ANTIARRHYTHMIC-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
