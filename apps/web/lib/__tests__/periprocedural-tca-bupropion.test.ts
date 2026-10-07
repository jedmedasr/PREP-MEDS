import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-amitriptyline-hydrochloride-oral-tablet','MED-nortriptyline-hydrochloride-oral-capsule','MED-imipramine-hydrochloride-oral-tablet','MED-clomipramine-hydrochloride-oral-capsule','MED-bupropion-hydrochloride-immediate-release-oral-tablet','MED-wellbutrin-sr-bupropion-hydrochloride-sustained-release-oral-tablet','MED-bupropion-hydrochloride-xl-extended-release-oral-tablet'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing TCA/bupropion fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-TCA-BUPROPION-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-07T04:20:00Z', engineVersion: 'periprocedural-tca-bupropion-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-TCA-BUPROPION', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}

describe('periprocedural TCA and bupropion terminology', () => {
  it('assembles valid terminology and preserves seven identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each(['bupropion','Wellbutrin'])('fails nonspecific %s closed across release identities', (query) => { for (const limit of [1,10]) { const result=index.resolve(query,{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['amitriptyline tablet',medicationIds[0]],['nortriptyline capsule',medicationIds[1]],['imipramine tablet',medicationIds[2]],['clomipramine capsule',medicationIds[3]],['bupropion IR',medicationIds[4]],['Wellbutrin SR',medicationIds[5]],['Wellbutrin XL',medicationIds[6]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});

describe('periprocedural TCA and bupropion review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((bundle)=>bundle.atoms.some((atom)=>atom.id==='EVD-BUPROPION-HYDROCHLORIDE-XL-ORAL-TABLET-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((candidate)=>candidate.id==='RULE-PERIPROCEDURAL-TCA-BUPROPION-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-TCA-BUPROPION-REVIEW-001',version:1});}});
});
