import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-imuran-azathioprine-oral-tablet', 'MED-azathioprine-sodium-intravenous-injection'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing azathioprine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-AZATHIOPRINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T07:12:00Z', engineVersion: 'azathioprine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-AZATHIOPRINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('azathioprine terminology', () => {
  it('assembles valid terminology and preserves both identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['Imuran tablet', 'MED-imuran-azathioprine-oral-tablet'],
    ['azathioprine sodium injection', 'MED-azathioprine-sodium-intravenous-injection'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it.each(['azathioprine'])('fails route/form-ambiguous %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('azathioprine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-AZATHIOPRINE-SPECIALIST-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-AZATHIOPRINE-SPECIALIST-REVIEW-001', version: 1 });
    }
  });
});
