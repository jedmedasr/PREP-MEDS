import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-cannabis-inhaled-use-pattern','MED-cannabis-oral-ingested-use-pattern','MED-epidiolex-cannabidiol-oral-solution','MED-marinol-dronabinol-oral-capsule','MED-syndros-dronabinol-oral-solution'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing cannabinoid fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-CANNABINOID-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-07T05:46:51Z', engineVersion: 'periprocedural-cannabinoid-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-CANNABINOID', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}

describe('periprocedural cannabinoid terminology', () => {
  it('assembles valid terminology and preserves five bounded identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each([['smoked cannabis',medicationIds[0]],['cannabis edible',medicationIds[1]],['Epidiolex',medicationIds[2]],['Marinol capsule',medicationIds[3]],['Syndros oral solution',medicationIds[4]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
  it.each(['cannabis','marijuana','THC','CBD','dronabinol','cannabinoid product','cannabis oil'])('does not infer route, composition, or product from %s',(query)=>{const result=index.resolve(query); expect(result.status).not.toBe('RESOLVED'); expect(result.medication).toBeUndefined();});
});

describe('periprocedural cannabinoid review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((bundle)=>bundle.atoms.some((atom)=>atom.id==='EVD-CANNABIS-INHALED-USE-PATTERN-PERIOPERATIVE-CONTEXT'))).toBe(true); const rule=clinicalReviewRules.find((candidate)=>candidate.id==='RULE-PERIPROCEDURAL-CANNABINOID-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every bounded identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-CANNABINOID-REVIEW-001',version:1});}});
});
