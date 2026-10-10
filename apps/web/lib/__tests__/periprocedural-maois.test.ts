import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-phenelzine-sulfate-oral-tablet', 'MED-parnate-tranylcypromine-film-coated-oral-tablet', 'MED-marplan-isocarboxazid-oral-tablet', 'MED-emsam-selegiline-transdermal-system', 'MED-selegiline-hydrochloride-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing MAOI fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-MAOI-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T01:08:00Z', engineVersion: 'periprocedural-maoi-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-MAOI', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('periprocedural MAOI terminology', () => {
  it('assembles valid terminology and preserves five explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['phenelzine', 'MED-phenelzine-sulfate-oral-tablet'],
    ['Parnate', 'MED-parnate-tranylcypromine-film-coated-oral-tablet'],
    ['Marplan', 'MED-marplan-isocarboxazid-oral-tablet'],
    ['Emsam patch', 'MED-emsam-selegiline-transdermal-system'],
    ['oral selegiline', 'MED-selegiline-hydrochloride-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it('fails bare selegiline closed across oral MAO-B and transdermal antidepressant identities', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('selegiline', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('periprocedural MAOI review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PERIPROCEDURAL-MAOI-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-MAOI-REVIEW-001', version: 1 });
    }
  });
});
