import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-rasagiline-mesylate-oral-tablet', 'MED-xadago-safinamide-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Parkinson MAO-B fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PARKINSON-MAOB-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T14:47:00Z', engineVersion: 'parkinson-maob-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PARKINSON-MAOB', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Parkinson MAO-B adjunct terminology', () => {
  it('assembles valid terminology and preserves rasagiline and XADAGO identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['rasagiline', 'MED-rasagiline-mesylate-oral-tablet'],
    ['rasagiline tablet', 'MED-rasagiline-mesylate-oral-tablet'],
    ['safinamide', 'MED-xadago-safinamide-oral-tablet'],
    ['Xadago', 'MED-xadago-safinamide-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it('preserves existing selegiline route ambiguity rather than collapsing MAO-B identities', () => {
    const result = index.resolve('selegiline');
    expect(result.status).toBe('AMBIGUOUS');
    expect(result.medication).toBeUndefined();
    expect(result.ingredientIds).toEqual([]);
  });
});

describe('Parkinson MAO-B adjunct review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PARKINSON-MAOB-ADJUNCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes both explicit identities to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PARKINSON-MAOB-ADJUNCT-REVIEW-001', version: 1 });
    }
  });
});
