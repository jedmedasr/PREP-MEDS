import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-quetiapine-conventional-oral-tablet','MED-seroquel-xr-quetiapine-extended-release-oral-tablet','MED-zyprexa-olanzapine-oral-tablet','MED-zyprexa-zydis-olanzapine-orally-disintegrating-tablet','MED-zyprexa-olanzapine-intramuscular-injection','MED-zyprexa-relprevv-olanzapine-er-intramuscular-injection'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing quetiapine/olanzapine fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-QUETIAPINE-OLANZAPINE-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-04T04:03:00Z', engineVersion: 'periprocedural-quetiapine-olanzapine-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-QUETIAPINE-OLANZAPINE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}
describe('periprocedural quetiapine and olanzapine terminology', () => {
  it('assembles valid terminology and preserves six identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each(['quetiapine','olanzapine'])('fails nonspecific %s closed', (query) => { for (const limit of [1,10]) { const result=index.resolve(query,{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['Seroquel tablet',medicationIds[0]],['Seroquel XR',medicationIds[1]],['Zyprexa tablet',medicationIds[2]],['Zyprexa Zydis',medicationIds[3]],['Zyprexa Intramuscular',medicationIds[4]],['Zyprexa Relprevv',medicationIds[5]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});
describe('periprocedural quetiapine and olanzapine review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((b)=>b.atoms.some((a)=>a.id==='EVD-ZYPREXA-RELPREVV-OLANZAPINE-IM-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((x)=>x.id==='RULE-PERIPROCEDURAL-QUETIAPINE-OLANZAPINE-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-QUETIAPINE-OLANZAPINE-REVIEW-001',version:1});}});
});
