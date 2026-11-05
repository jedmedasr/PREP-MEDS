import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';
const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-xanax-alprazolam-immediate-release-oral-tablet',
  'MED-xanax-xr-alprazolam-extended-release-oral-tablet',
  'MED-ativan-lorazepam-oral-tablet',
  'MED-ativan-lorazepam-intramuscular-intravenous-injection',
  'MED-klonopin-clonazepam-oral-tablet',
  'MED-clonazepam-orally-disintegrating-tablet',
  'MED-diazepam-intramuscular-intravenous-injection',
  'MED-restoril-temazepam-oral-capsule',
] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing benzodiazepine fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-BENZODIAZEPINE-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T21:43:45Z', engineVersion: 'periprocedural-benzodiazepine-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-BENZODIAZEPINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural benzodiazepine terminology', () => {
  it('assembles valid terminology and preserves eight identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each(['alprazolam', 'lorazepam', 'clonazepam'])('fails non-specific %s closed', (query) => { for (const limit of [1, 10]) { const result = index.resolve(query, { limit }); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([
    ['Xanax tablet', medicationIds[0]], ['Xanax XR', medicationIds[1]], ['Ativan tablet', medicationIds[2]], ['Ativan injection', medicationIds[3]],
    ['Klonopin tablet', medicationIds[4]], ['clonazepam ODT', medicationIds[5]], ['diazepam injection', medicationIds[6]], ['Restoril capsule', medicationIds[7]],
  ])('resolves explicit wording %s', (query, expectedId) => { const result = index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId); });
});
describe('periprocedural benzodiazepine review routing', () => {
  it('keeps production rules empty and routing timing-free', () => { expect(activeRules).toEqual([]); const rule = clinicalReviewRules.find((x) => x.id === 'RULE-PERIPROCEDURAL-BENZODIAZEPINE-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to clinician review for %s', (procedureCode) => { for (const medicationId of medicationIds) { const event = evaluate(medicationId, procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({ id: 'RULE-PERIPROCEDURAL-BENZODIAZEPINE-REVIEW-001', version: 1 }); } });
});
