import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-methadone-oral-tablet', 'MED-methadone-oral-concentrate', 'MED-naltrexone-film-coated-oral-tablet', 'MED-vivitrol-naltrexone-er-im-injection'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing methadone/naltrexone fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-OUD-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T21:12:00Z', engineVersion: 'periprocedural-methadone-naltrexone-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-OUD', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('periprocedural methadone/naltrexone terminology', () => {
  it('assembles valid terminology and preserves four explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['methadone', 'naltrexone'])('fails bare %s closed across form/route identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['methadone tablet', 'MED-methadone-oral-tablet'],
    ['methadone oral concentrate', 'MED-methadone-oral-concentrate'],
    ['oral naltrexone', 'MED-naltrexone-film-coated-oral-tablet'],
    ['Vivitrol injection', 'MED-vivitrol-naltrexone-er-im-injection'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('periprocedural methadone/naltrexone review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PERIPROCEDURAL-METHADONE-NALTREXONE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-METHADONE-NALTREXONE-REVIEW-001', version: 1 });
    }
  });
});
