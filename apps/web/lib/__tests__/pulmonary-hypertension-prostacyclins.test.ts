import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const ids = [
  'MED-veletri-epoprostenol-intravenous-infusion',
  'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion',
  'MED-tyvaso-treprostinil-inhalation-solution',
  'MED-tyvaso-dpi-treprostinil-inhalation-powder',
  'MED-orenitram-treprostinil-er-oral-tablet',
  'MED-uptravi-selexipag-oral-tablet',
  'MED-uptravi-selexipag-intravenous-injection',
] as const;

describe('Pulmonary hypertension prostacyclin terminology and routing', () => {
  it('assembles seven route-, form-, device-, and delivery-specific identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const id of ids) expect(index.getMedicationById(id)).toBeDefined();
  });
  it.each(['treprostinil', 'Tyvaso', 'selexipag', 'Uptravi'])('fails non-specific %s closed across product or route contexts', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['Veletri infusion', ids[0]], ['Remodulin infusion', ids[1]], ['Tyvaso inhalation solution', ids[2]],
    ['Tyvaso DPI', ids[3]], ['Orenitram ER tablet', ids[4]], ['Uptravi oral tablet', ids[5]], ['Uptravi IV', ids[6]],
  ])('resolves explicit wording %s', (query, expected) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expected);
  });
  it('keeps production empty and all decisions review-only and timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((item) => item.id === 'RULE-PULMONARY-HYPERTENSION-PROSTACYCLIN-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...ids]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to review for %s', (procedureCode) => {
    for (const medicationId of ids) {
      const medication = index.getMedicationById(medicationId)!;
      const event = evaluateDecision({
        decisionEventId: 'DEC-SYNTHETIC-PH-PROSTACYCLIN-' + medicationId + '-' + procedureCode,
        occurredAt: '2026-10-03T16:50:00Z',
        engineVersion: 'pulmonary-hypertension-prostacyclin-review-test',
        mode: 'VALIDATION',
        context: { organizationId: 'ORG-SYNTHETIC-PH-PROSTACYCLIN', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
        rules: clinicalReviewRules,
        policies: [],
      }).event;
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-PULMONARY-HYPERTENSION-PROSTACYCLIN-REVIEW-001', version: 1 });
    }
  });
});
