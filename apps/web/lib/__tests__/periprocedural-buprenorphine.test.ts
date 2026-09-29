import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-buprenorphine-sublingual-tablet',
  'MED-suboxone-buprenorphine-naloxone-film',
  'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet',
  'MED-belbuca-buprenorphine-buccal-film',
  'MED-butrans-buprenorphine-er-transdermal-patch',
  'MED-sublocade-buprenorphine-er-subcutaneous-injection',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing periprocedural buprenorphine fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-BUPRENORPHINE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T20:52:00Z', engineVersion: 'periprocedural-buprenorphine-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-BUPRENORPHINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('periprocedural buprenorphine terminology', () => {
  it('assembles valid terminology and preserves six explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });

  it.each(['buprenorphine', 'buprenorphine naloxone'])('fails bare %s closed across route/form/combination identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['buprenorphine sublingual tablet', 'MED-buprenorphine-sublingual-tablet'],
    ['Suboxone film', 'MED-suboxone-buprenorphine-naloxone-film'],
    ['Zubsolv tablet', 'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet'],
    ['Belbuca buccal film', 'MED-belbuca-buprenorphine-buccal-film'],
    ['Butrans patch', 'MED-butrans-buprenorphine-er-transdermal-patch'],
    ['Sublocade injection', 'MED-sublocade-buprenorphine-er-subcutaneous-injection'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('periprocedural buprenorphine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PERIPROCEDURAL-BUPRENORPHINE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-BUPRENORPHINE-REVIEW-001', version: 1 });
    }
  });
});
