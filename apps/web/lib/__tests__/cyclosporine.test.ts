import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-sandimmune-cyclosporine-nonmodified-oral-capsule',
  'MED-sandimmune-cyclosporine-intravenous-injection',
  'MED-neoral-cyclosporine-modified-oral-capsule',
  'MED-neoral-cyclosporine-modified-oral-solution',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing cyclosporine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-CYCLOSPORINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T05:55:00Z', engineVersion: 'cyclosporine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-CYCLOSPORINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('cyclosporine terminology', () => {
  it('assembles valid terminology and preserves four explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['Sandimmune capsule', 'MED-sandimmune-cyclosporine-nonmodified-oral-capsule'],
    ['Sandimmune injection', 'MED-sandimmune-cyclosporine-intravenous-injection'],
    ['Neoral capsule', 'MED-neoral-cyclosporine-modified-oral-capsule'],
    ['Neoral oral solution', 'MED-neoral-cyclosporine-modified-oral-solution'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it.each(['cyclosporine', 'cyclosporine capsule'])('fails bare or modified-status-omitting %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('cyclosporine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-CYCLOSPORINE-TRANSPLANT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-CYCLOSPORINE-TRANSPLANT-REVIEW-001', version: 1 });
    }
  });
});
