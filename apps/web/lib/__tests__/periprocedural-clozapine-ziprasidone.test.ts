import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-clozapine-oral-tablet','MED-clozapine-orally-disintegrating-tablet','MED-versacloz-clozapine-oral-suspension','MED-geodon-ziprasidone-hydrochloride-oral-capsule','MED-geodon-ziprasidone-mesylate-intramuscular-injection'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId); if (!medication) throw new Error('Missing clozapine/ziprasidone fixture: ' + medicationId);
  return evaluateDecision({ decisionEventId: 'DEC-SYNTHETIC-CLOZAPINE-ZIPRASIDONE-' + medicationId + '-' + procedureCode, occurredAt: '2026-10-04T06:20:00Z', engineVersion: 'periprocedural-clozapine-ziprasidone-review-test', mode: 'VALIDATION', context: { organizationId: 'ORG-SYNTHETIC-CLOZAPINE-ZIPRASIDONE', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] }, rules: clinicalReviewRules, policies: [] }).event;
}

describe('periprocedural clozapine and ziprasidone terminology', () => {
  it('assembles valid terminology and preserves five identities', () => { expect(validateTerminologyDataset(terminologyDataset)).toEqual([]); for (const id of medicationIds) expect(index.getMedicationById(id)).toBeDefined(); });
  it.each(['clozapine','ziprasidone','Geodon'])('fails nonspecific %s closed', (query) => { for (const limit of [1,10]) { const result=index.resolve(query,{limit}); expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]); } });
  it.each([['clozapine tablet',medicationIds[0]],['clozapine ODT',medicationIds[1]],['Versacloz',medicationIds[2]],['Geodon capsule',medicationIds[3]],['Geodon injection',medicationIds[4]]])('resolves explicit wording %s',(query,expectedId)=>{const result=index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);});
});

describe('periprocedural clozapine and ziprasidone review routing', () => {
  it('keeps production empty, evidence assembled, and timing-free', () => { expect(activeRules).toEqual([]); expect(clinicalReviewEvidenceBundles.some((bundle)=>bundle.atoms.some((atom)=>atom.id==='EVD-GEODON-ZIPRASIDONE-MESYLATE-IM-INJECTION-IDENTITY'))).toBe(true); const rule=clinicalReviewRules.find((candidate)=>candidate.id==='RULE-PERIPROCEDURAL-CLOZAPINE-ZIPRASIDONE-REVIEW-001'); expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined(); });
  it.each(procedures)('routes every identity to review for %s',(procedureCode)=>{for(const medicationId of medicationIds){const event=evaluate(medicationId,procedureCode); expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined(); expect(event.ruleRefs).toContainEqual({id:'RULE-PERIPROCEDURAL-CLOZAPINE-ZIPRASIDONE-REVIEW-001',version:1});}});
});
