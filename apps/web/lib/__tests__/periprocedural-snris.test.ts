import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';
const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-venlafaxine-immediate-release-oral-tablet','MED-venlafaxine-extended-release-oral-capsule','MED-desvenlafaxine-extended-release-oral-tablet','MED-duloxetine-delayed-release-oral-capsule'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing SNRI fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-SNRI-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-03T22:44:17Z', engineVersion: 'periprocedural-snri-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-SNRI', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural SNRI terminology', () => {
  it('assembles valid terminology and preserves four identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it('fails bare venlafaxine closed', () => { for (const limit of [1,10]) { const result=index.resolve('venlafaxine',{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['venlafaxine IR tablet',medicationIds[0]],['venlafaxine XR capsule',medicationIds[1]],['desvenlafaxine extended-release tablet',medicationIds[2]],['duloxetine delayed-release capsule',medicationIds[3]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});
describe('periprocedural SNRI review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((b)=>b.atoms.some((a)=>a.id==='EVD-VENLAFAXINE-IR-TABLET-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((x)=>x.id==='RULE-PERIPROCEDURAL-SNRI-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-SNRI-REVIEW-001',version:1});}});
});
