import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-garlic-oral-supplement','MED-ginkgo-biloba-oral-supplement','MED-asian-ginseng-oral-supplement','MED-st-johns-wort-oral-supplement','MED-valerian-oral-supplement','MED-kava-oral-supplement'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing herbal-supplement fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-HERBAL-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-07T05:05:00Z', engineVersion: 'periprocedural-herbal-supplement-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-HERBAL', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}

describe('periprocedural herbal supplement terminology', () => {
  it('assembles valid terminology and preserves six bounded identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each([['garlic supplement',medicationIds[0]],['ginkgo supplement',medicationIds[1]],['Panax ginseng supplement',medicationIds[2]],["St Johns wort",medicationIds[3]],['valerian root supplement',medicationIds[4]],['kava kava supplement',medicationIds[5]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
  it.each(['herbal supplement','sleep supplement','bleeding supplement','proprietary herbal blend'])('does not infer a specific product from %s',(query)=>{const result=index.resolve(query); expect(result.status).not.toBe('RESOLVED'); expect(result.medication).toBeUndefined();});
});

describe('periprocedural herbal supplement review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((bundle)=>bundle.atoms.some((atom)=>atom.id==='EVD-ST-JOHNS-WORT-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT'))).toBe(true); const rule=clinicalReviewRules.find((candidate)=>candidate.id==='RULE-PERIPROCEDURAL-HERBAL-SUPPLEMENT-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every bounded identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-HERBAL-SUPPLEMENT-REVIEW-001',version:1});}});
});
