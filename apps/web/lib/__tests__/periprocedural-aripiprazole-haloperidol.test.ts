import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-abilify-aripiprazole-oral-tablet','MED-aripiprazole-orally-disintegrating-tablet','MED-abilify-maintena-aripiprazole-er-im-injection','MED-abilify-asimtufii-aripiprazole-er-im-injection','MED-aristada-aripiprazole-lauroxil-er-im-injection','MED-aristada-initio-aripiprazole-lauroxil-er-im-injection','MED-haloperidol-oral-tablet','MED-haloperidol-oral-solution','MED-haloperidol-lactate-immediate-release-im-injection','MED-haloperidol-decanoate-er-im-injection'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing aripiprazole/haloperidol fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-ARIPIPRAZOLE-HALOPERIDOL-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-04T05:05:00Z', engineVersion: 'periprocedural-aripiprazole-haloperidol-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-ARIPIPRAZOLE-HALOPERIDOL', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural aripiprazole and haloperidol terminology', () => {
  it('assembles valid terminology and preserves ten identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each(['aripiprazole','aripiprazole lauroxil','haloperidol'])('fails nonspecific %s closed', (query) => { for (const limit of [1,10]) { const result=index.resolve(query,{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['Abilify tablet',medicationIds[0]],['aripiprazole ODT',medicationIds[1]],['Abilify Maintena',medicationIds[2]],['Abilify Asimtufii',medicationIds[3]],['Aristada',medicationIds[4]],['Aristada Initio',medicationIds[5]],['Haldol tablet',medicationIds[6]],['Haldol oral solution',medicationIds[7]],['Haldol lactate injection',medicationIds[8]],['Haldol decanoate injection',medicationIds[9]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});
describe('periprocedural aripiprazole and haloperidol review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((b)=>b.atoms.some((a)=>a.id==='EVD-HALOPERIDOL-DECANOATE-IM-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((x)=>x.id==='RULE-PERIPROCEDURAL-ARIPIPRAZOLE-HALOPERIDOL-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-ARIPIPRAZOLE-HALOPERIDOL-REVIEW-001',version:1});}});
});
