import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-symbicort-budesonide-formoterol-metered-aerosol',
  'MED-advair-hfa-fluticasone-salmeterol-metered-aerosol',
  'MED-advair-diskus-fluticasone-salmeterol-dry-powder',
  'MED-breo-ellipta-fluticasone-vilanterol-dry-powder',
  'MED-dulera-mometasone-formoterol-metered-aerosol',
  'MED-trelegy-ellipta-fluticasone-umeclidinium-vilanterol-dry-powder',
  'MED-breztri-aerosphere-budesonide-glycopyrrolate-formoterol-metered-aerosol',
] as const;

describe('Pulmonary controller-combination terminology and routing', () => {
  it('assembles seven device- and whole-product-specific identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['Advair', 'fluticasone propionate and salmeterol'])('fails non-specific %s closed across HFA and DISKUS', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Symbicort metered-dose inhaler', ids[0]],
    ['Advair HFA inhaler', ids[1]],
    ['Advair Diskus inhaler', ids[2]],
    ['Breo Ellipta inhaler', ids[3]],
    ['Dulera metered-dose inhaler', ids[4]],
    ['Trelegy Ellipta inhaler', ids[5]],
    ['Breztri Aerosphere inhaler', ids[6]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('preserves whole-product ingredient arrays and keeps production empty', () => {
    expect(activeRules).toEqual([]);
    expect(index.getMedicationById(ids[0])?.ingredientIds).toEqual(['ING-budesonide', 'ING-formoterol']);
    expect(index.getMedicationById(ids[5])?.ingredientIds).toEqual(['ING-fluticasone-furoate', 'ING-umeclidinium', 'ING-vilanterol']);
    expect(index.getMedicationById(ids[6])?.ingredientIds).toEqual(['ING-budesonide', 'ING-glycopyrrolate', 'ING-formoterol']);
    const rule = clinicalReviewRules.find((item) => item.id === 'RULE-PULMONARY-CONTROLLER-COMBINATION-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...ids]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit product to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-PULMONARY-CONTROLLER-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T12:15:00Z', engineVersion: 'pulmonary-controller-combination-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-PULMONARY-CONTROLLER', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
