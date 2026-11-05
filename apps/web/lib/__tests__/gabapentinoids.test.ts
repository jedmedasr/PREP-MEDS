import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-neurontin-gabapentin-oral-capsule','MED-neurontin-gabapentin-oral-tablet','MED-neurontin-gabapentin-oral-solution',
  'MED-gralise-gabapentin-er-oral-tablet','MED-horizant-gabapentin-enacarbil-er-oral-tablet',
  'MED-lyrica-pregabalin-oral-capsule','MED-lyrica-pregabalin-oral-solution','MED-lyrica-cr-pregabalin-er-oral-tablet',
] as const;

describe('Gabapentinoid terminology and routing', () => {
  it('assembles eight distinct identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['gabapentin', 'Neurontin', 'pregabalin', 'Lyrica'])('fails non-specific %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Neurontin capsule', ids[0]], ['Neurontin tablet', ids[1]], ['Neurontin oral solution', ids[2]],
    ['Gralise extended-release tablet', ids[3]], ['Horizant extended-release tablet', ids[4]],
    ['Lyrica capsule', ids[5]], ['Lyrica oral solution', ids[6]], ['Lyrica CR extended-release tablet', ids[7]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('keeps production empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((item) => item.id === 'RULE-GABAPENTINOID-ANESTHESIA-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...ids]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit product to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-GABAPENTINOID-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T09:45:00Z', engineVersion: 'gabapentinoid-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-GABAPENTINOID', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
