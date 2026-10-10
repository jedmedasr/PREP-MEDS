import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-adderall-mixed-amphetamine-salts-tablet',
  'MED-adderall-xr-mixed-amphetamine-salts-er-capsule',
  'MED-vyvanse-lisdexamfetamine-capsule',
  'MED-vyvanse-lisdexamfetamine-chewable-tablet',
  'MED-ritalin-methylphenidate-ir-tablet',
  'MED-concerta-methylphenidate-er-tablet',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing stimulant fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-STIMULANT-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-30T00:50:00Z', engineVersion: 'periprocedural-stimulant-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-STIMULANT', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('periprocedural stimulant terminology', () => {
  it('assembles valid terminology and preserves six explicit identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });
  it.each(['Adderall', 'mixed amphetamine salts', 'Vyvanse', 'lisdexamfetamine', 'methylphenidate'])('fails bare %s closed across form/release identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Adderall IR', 'MED-adderall-mixed-amphetamine-salts-tablet'],
    ['Adderall XR', 'MED-adderall-xr-mixed-amphetamine-salts-er-capsule'],
    ['Vyvanse capsule', 'MED-vyvanse-lisdexamfetamine-capsule'],
    ['Vyvanse chewable', 'MED-vyvanse-lisdexamfetamine-chewable-tablet'],
    ['Ritalin tablet', 'MED-ritalin-methylphenidate-ir-tablet'],
    ['Concerta ER', 'MED-concerta-methylphenidate-er-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('periprocedural stimulant review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-PERIPROCEDURAL-STIMULANT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-STIMULANT-REVIEW-001', version: 1 });
    }
  });
});
