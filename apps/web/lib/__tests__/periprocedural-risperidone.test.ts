import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-risperidone-oral-tablet','MED-risperidone-oral-solution','MED-risperidone-orally-disintegrating-tablet','MED-risperdal-consta-risperidone-er-intramuscular-injection','MED-perseris-risperidone-er-subcutaneous-injection','MED-uzedy-risperidone-er-subcutaneous-injection'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing risperidone fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-RISPERIDONE-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-04T02:49:01Z', engineVersion: 'periprocedural-risperidone-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-RISPERIDONE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural risperidone terminology', () => {
  it('assembles valid terminology and preserves six identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it('fails nonspecific risperidone closed', () => { for (const limit of [1,10]) { const result=index.resolve('risperidone',{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['Risperdal tablet',medicationIds[0]],['Risperdal oral solution',medicationIds[1]],['Risperdal M-Tab',medicationIds[2]],['Risperdal Consta',medicationIds[3]],['Perseris',medicationIds[4]],['Uzedy',medicationIds[5]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});
describe('periprocedural risperidone review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((b)=>b.atoms.some((a)=>a.id==='EVD-RISPERDAL-CONSTA-IM-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((x)=>x.id==='RULE-PERIPROCEDURAL-RISPERIDONE-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-RISPERIDONE-REVIEW-001',version:1});}});
});
