import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-clonidine-tablet',
  'MED-clonidine-catapres-tts-patch',
  'MED-hydralazine-tablet',
  'MED-minoxidil-oral-tablet',
  'MED-doxazosin-tablet',
  'MED-prazosin-capsule',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 remaining-antihypertensive fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-OTHER-AHTN-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T13:34:00Z', engineVersion: 'batch-04-other-antihypertensive-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-B4-OTHER-AHTN', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Batch 04 remaining antihypertensive terminology', () => {
  it('assembles valid terminology and preserves six identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-antihypertensive');
  });

  it('fails bare clonidine closed across oral and transdermal routes', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('clonidine', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it('fails bare minoxidil closed because route/formulation is unspecified', () => {
    const result = index.resolve('minoxidil');
    expect(result.status).toBe('AMBIGUOUS');
    expect(result.medication).toBeUndefined();
    expect(result.ingredientIds).toEqual([]);
  });

  it.each([
    ['clonidine tablet', 'MED-clonidine-tablet'],
    ['CATAPRES-TTS', 'MED-clonidine-catapres-tts-patch'],
    ['clonidine transdermal patch', 'MED-clonidine-catapres-tts-patch'],
    ['hydralazine', 'MED-hydralazine-tablet'],
    ['systemic minoxidil oral tablet', 'MED-minoxidil-oral-tablet'],
    ['doxazosin', 'MED-doxazosin-tablet'],
    ['prazosin', 'MED-prazosin-capsule'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 remaining antihypertensive review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-OTHER-ANTIHYPERTENSIVE-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-OTHER-ANTIHYPERTENSIVE-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
