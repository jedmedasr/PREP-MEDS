import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-revatio-sildenafil-oral-tablet',
  'MED-revatio-sildenafil-oral-suspension',
  'MED-revatio-sildenafil-intravenous-injection',
  'MED-adcirca-tadalafil-oral-tablet',
  'MED-tracleer-bosentan-oral-tablet',
  'MED-tracleer-bosentan-tablet-for-oral-suspension',
  'MED-letairis-ambrisentan-oral-tablet',
  'MED-opsumit-macitentan-oral-tablet',
  'MED-opsynvi-macitentan-tadalafil-oral-tablet',
  'MED-adempas-riociguat-oral-tablet',
  'MED-winrevair-sotatercept-subcutaneous-injection',
  'MED-ventavis-iloprost-inhalation-solution',
  'MED-aurlumyn-iloprost-intravenous-injection',
] as const;

describe('Remaining pulmonary hypertension terminology and routing', () => {
  it('assembles thirteen route-, form-, combination-, and indication-specific identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['sildenafil', 'Revatio', 'bosentan', 'Tracleer', 'macitentan', 'tadalafil', 'iloprost'])('fails non-specific %s closed across product, form, route, or indication contexts', (query) => {
    for (const limit of [1, 20]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Revatio tablet', ids[0]], ['Revatio suspension', ids[1]], ['Revatio IV', ids[2]], ['Adcirca', ids[3]],
    ['Tracleer film coated tablet', ids[4]], ['Tracleer dispersible tablet', ids[5]], ['Letairis', ids[6]],
    ['Opsumit', ids[7]], ['Opsynvi', ids[8]], ['Adempas', ids[9]], ['Winrevair injection', ids[10]],
    ['Ventavis', ids[11]], ['Aurlumyn', ids[12]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('keeps fixed combination intact and production empty', () => {
    expect(activeRules).toEqual([]);
    expect(index.getMedicationById(ids[8])?.ingredientIds).toEqual(['ING-macitentan', 'ING-tadalafil']);
    const pahRule = clinicalReviewRules.find((item) => item.id === 'RULE-PULMONARY-HYPERTENSION-VASODILATOR-REVIEW-001');
    const collisionRule = clinicalReviewRules.find((item) => item.id === 'RULE-ILOPROST-NON-PAH-COLLISION-REVIEW-001');
    expect(pahRule?.scope.medicationIds).toEqual(ids.slice(0, 12));
    expect(collisionRule?.scope.medicationIds).toEqual([ids[12]]);
    expect(pahRule?.timingRule).toBeUndefined();
    expect(collisionRule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({
        decisionEventId: 'DEC-SYNTHETIC-PH-VASODILATOR-' + medicationId + '-' + procedureCode,
        occurredAt: '2026-10-03T17:48:00Z',
        engineVersion: 'pulmonary-hypertension-vasodilator-review-test',
        mode: 'VALIDATION',
        context: { organizationId: 'ORG-SYNTHETIC-PH-VASODILATOR', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
        rules: clinicalReviewRules,
        policies: [],
      }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
