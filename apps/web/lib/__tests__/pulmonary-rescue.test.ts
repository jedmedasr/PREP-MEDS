import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-ventolin-hfa-albuterol-inhalation-aerosol',
  'MED-albuterol-sulfate-nebulizer-solution',
  'MED-xopenex-hfa-levalbuterol-inhalation-aerosol',
  'MED-xopenex-levalbuterol-nebulizer-concentrate',
  'MED-atrovent-hfa-ipratropium-inhalation-aerosol',
  'MED-ipratropium-bromide-nebulizer-solution',
  'MED-combivent-respimat-ipratropium-albuterol-inhalation-spray',
  'MED-ipratropium-albuterol-nebulizer-solution',
] as const;

describe('Pulmonary rescue terminology and routing', () => {
  it('assembles eight route/form/device/combination-specific identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['albuterol', 'levalbuterol', 'Xopenex', 'ipratropium'])('fails non-specific %s closed', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Ventolin HFA inhaler', ids[0]],
    ['albuterol nebulizer solution', ids[1]],
    ['Xopenex HFA inhaler', ids[2]],
    ['Xopenex nebulizer', ids[3]],
    ['Atrovent HFA inhaler', ids[4]],
    ['ipratropium nebulizer solution', ids[5]],
    ['Combivent Respimat inhaler', ids[6]],
    ['ipratropium albuterol nebulizer', ids[7]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('preserves combination ingredients and keeps production empty', () => {
    expect(activeRules).toEqual([]);
    expect(index.getMedicationById(ids[6])?.ingredientIds).toEqual(['ING-ipratropium', 'ING-albuterol']);
    expect(index.getMedicationById(ids[7])?.ingredientIds).toEqual(['ING-ipratropium', 'ING-albuterol']);
    const rule = clinicalReviewRules.find((item) => item.id === 'RULE-PULMONARY-RESCUE-AIRWAY-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...ids]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit product to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-PULMONARY-RESCUE-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T10:55:00Z', engineVersion: 'pulmonary-rescue-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-PULMONARY-RESCUE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
