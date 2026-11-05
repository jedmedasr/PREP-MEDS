import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-vimpat-lacosamide-film-coated-oral-tablet', 'MED-vimpat-lacosamide-oral-solution', 'MED-vimpat-lacosamide-intravenous-injection'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing antiepileptic lacosamide fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-ANTIEPILEPTIC-LACOSAMIDE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-10-02T22:55:00Z', engineVersion: 'antiepileptic-lacosamide-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-ANTIEPILEPTIC-LACOSAMIDE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Antiepileptic lacosamide terminology', () => {
  it('assembles valid terminology and preserves three identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['lacosamide', 'Vimpat'])('fails bare %s closed across route/form identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Vimpat tablet', 'MED-vimpat-lacosamide-film-coated-oral-tablet'],
    ['lacosamide oral solution', 'MED-vimpat-lacosamide-oral-solution'],
    ['Vimpat injection', 'MED-vimpat-lacosamide-intravenous-injection'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Antiepileptic lacosamide review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-ANTIEPILEPTIC-LACOSAMIDE-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-ANTIEPILEPTIC-LACOSAMIDE-REVIEW-001', version: 1 });
    }
  });
});
