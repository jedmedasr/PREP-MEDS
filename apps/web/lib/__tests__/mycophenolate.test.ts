import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-cellcept-mycophenolate-mofetil-oral-capsule',
  'MED-cellcept-mycophenolate-mofetil-oral-tablet',
  'MED-cellcept-mycophenolate-mofetil-oral-suspension',
  'MED-cellcept-mycophenolate-mofetil-intravenous-injection',
  'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing mycophenolate fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-MYCOPHENOLATE-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T06:51:00Z', engineVersion: 'mycophenolate-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-MYCOPHENOLATE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('mycophenolate terminology', () => {
  it('assembles valid terminology and preserves five explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each([
    ['CellCept capsule', 'MED-cellcept-mycophenolate-mofetil-oral-capsule'],
    ['CellCept tablet', 'MED-cellcept-mycophenolate-mofetil-oral-tablet'],
    ['CellCept oral suspension', 'MED-cellcept-mycophenolate-mofetil-oral-suspension'],
    ['CellCept IV', 'MED-cellcept-mycophenolate-mofetil-intravenous-injection'],
    ['Myfortic tablet', 'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it.each(['mycophenolate', 'mycophenolate mofetil', 'CellCept'])('fails route/form/ingredient-ambiguous %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
});

describe('mycophenolate review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-MYCOPHENOLATE-SPECIALIST-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-MYCOPHENOLATE-SPECIALIST-REVIEW-001', version: 1 });
    }
  });
});
