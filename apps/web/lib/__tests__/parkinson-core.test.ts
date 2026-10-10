import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-carbidopa-levodopa-ir-oral-tablet',
  'MED-carbidopa-levodopa-er-oral-tablet',
  'MED-rytary-carbidopa-levodopa-er-capsule',
  'MED-crexont-carbidopa-levodopa-er-capsule',
  'MED-duopa-carbidopa-levodopa-enteral-suspension',
  'MED-inbrija-levodopa-inhalation-capsule',
  'MED-neupro-rotigotine-er-transdermal-patch',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Parkinson core fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-PARKINSON-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T12:50:00Z', engineVersion: 'parkinson-core-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-PARKINSON', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Parkinson core terminology', () => {
  it('assembles valid terminology and preserves seven explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['carbidopa levodopa', 'levodopa', 'carbidopa levodopa tablet', 'carbidopa levodopa extended-release capsule'])('fails bare or shared wording %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['carbidopa levodopa immediate-release tablet', 'MED-carbidopa-levodopa-ir-oral-tablet'],
    ['carbidopa levodopa extended-release tablet', 'MED-carbidopa-levodopa-er-oral-tablet'],
    ['Rytary', 'MED-rytary-carbidopa-levodopa-er-capsule'],
    ['Crexont', 'MED-crexont-carbidopa-levodopa-er-capsule'],
    ['Duopa', 'MED-duopa-carbidopa-levodopa-enteral-suspension'],
    ['Inbrija', 'MED-inbrija-levodopa-inhalation-capsule'],
    ['Neupro', 'MED-neupro-rotigotine-er-transdermal-patch'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
  it('never treats the INBRIJA inhalation capsule as a generic swallowed capsule identity', () => {
    expect(index.resolve('levodopa capsule').status).not.toBe('RESOLVED');
    expect(index.resolve('levodopa capsule for inhalation').medication?.id).toBe('MED-inbrija-levodopa-inhalation-capsule');
  });
});

describe('Parkinson core review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PARKINSON-CORE-ANESTHESIA-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PARKINSON-CORE-ANESTHESIA-REVIEW-001', version: 1 });
    }
  });
});
