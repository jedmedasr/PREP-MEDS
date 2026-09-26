import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import { diabetesHumalogEvidence, diabetesNovoLogEvidence, diabetesWorkflowEvidence, humalogAtoms, humalogPresentationMarketingStatuses, humalogProductDefinitions, humalogSources } from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesNovoLogMedications } from '../diabetes-novolog';
import { diabetesHumalogAudit, diabetesHumalogIdentities, diabetesHumalogMedications } from '../diabetes-humalog';

const index=new TerminologyIndex(terminologyDataset);
const procedures:ProcedureCode[]=['EGD','COLONOSCOPY','EGD_COLONOSCOPY'];
const known=(modifierId:string,value:unknown):ModifierValue=>({modifierId,state:'KNOWN',value});
function evaluate(id:string,procedureCode:ProcedureCode,overrides:ModifierValue[]=[]){
 const medication=index.getMedicationById(id); if(!medication) throw new Error('Missing Humalog fixture '+id);
 const values=[known('MOD-diabetes-type','TYPE_2'),known('MOD-current-insulin-plan-confirmed',true),known('MOD-insulin-formulation-confirmed',true),known('MOD-pump-aid-system-type','NOT_USING_PUMP'),known('MOD-current-oral-intake-state','FASTING')];
 const modifiers=new Map(values.map((value)=>[value.modifierId,value])); for(const value of overrides) modifiers.set(value.modifierId,value);
 return evaluateDecision({decisionEventId:'DEC-SYNTHETIC-HUMALOG',occurredAt:'2026-09-26T12:35:00Z',engineVersion:'humalog-identity-test',mode:'VALIDATION',context:{organizationId:'ORG-SYNTHETIC-HUMALOG',procedureCode,medication:{medicationId:id,ingredientIds:medication.ingredientIds,drugClassIds:medication.drugClassIds??[]},modifiers:[...modifiers.values()]},rules:clinicalReviewRules,policies:[]}).event;
}

describe('Humalog U-100/U-200 identity and presentation status',()=>{
 it('adds two source-linked branded identities without changing the 59-concept NovoLog snapshot',()=>{
   expect(diabetesNovoLogMedications).toHaveLength(59); expect(diabetesHumalogMedications).toHaveLength(61);
   expect(humalogProductDefinitions).toHaveLength(2); expect(diabetesHumalogAudit.searchableConceptCount).toBe(61);
   expect(diabetesHumalogAudit.sourceLinkedIdentityCount).toBe(33); expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
 });
 it.each([['Humalog U-100','MED-insulin-lispro-humalog-u100'],['Humalog 100 units/mL','MED-insulin-lispro-humalog-u100'],['Humalog KwikPen U-100','MED-insulin-lispro-humalog-u100'],['Humalog U-200','MED-insulin-lispro-humalog-u200'],['Humalog 200 units/mL','MED-insulin-lispro-humalog-u200'],['Humalog KwikPen U-200','MED-insulin-lispro-humalog-u200']])('resolves %s to the concentration-specific branded identity',(query,id)=>{
   expect(index.resolve(query).medication?.id).toBe(id); const identity=diabetesHumalogIdentities[id];
   expect(identity?.allowsDoseCalculation).toBe(false); expect(identity?.presentationConfirmed).toBe(false); expect(identity?.deviceCompatibilityAuthorized).toBe(false); expect(identity?.substitutionAuthorized).toBe(false);
 });
 it.each(['insulin lispro U-100','insulin lispro 100 units/mL','lispro U-200','insulin lispro 200 units/mL'])('does not authenticate Humalog from generic wording %s',(query)=>{
   const result=index.resolve(query,{limit:10}); expect(result.medication?.id).not.toBe('MED-insulin-lispro-humalog-u100'); expect(result.medication?.id).not.toBe('MED-insulin-lispro-humalog-u200');
   if(result.status==='RESOLVED'){expect(result.medication?.id).toBe('MED-insulin-lispro'); expect(result.medication?.brandNames).toEqual([]);} else {expect(result.status).toBe('AMBIGUOUS');}
 });
 it.each(['Humalog U-300','Humalog 300 units/mL','Humalog U-500'])('does not discard unsupported concentration detail in %s',(query)=>{const result=index.resolve(query,{limit:1}); expect(result.status).not.toBe('RESOLVED'); expect(result.medication).toBeUndefined();});
 it('preserves exact FDA Purple Book presentation statuses',()=>{
   expect(humalogPresentationMarketingStatuses).toHaveLength(8);
   expect(humalogPresentationMarketingStatuses.filter(x=>x.concentration===100&&x.status==='DISCONTINUED')).toEqual([{applicationNumber:'BLA 020563',concentration:100,productNumber:'002',presentation:'MULTI_DOSE_CARTRIDGE',status:'DISCONTINUED'}]);
   expect(humalogPresentationMarketingStatuses.filter(x=>x.concentration===200).every(x=>x.status==='RX')).toBe(true);
   expect(diabetesHumalogAudit.rxPresentationProductCount).toBe(7); expect(diabetesHumalogAudit.discontinuedPresentationProductCount).toBe(1); expect(diabetesHumalogAudit.marketAvailabilityAsserted).toBe(false);
});

});
describe('Humalog evidence provenance and append-only history',()=>{
 it('pins current manufacturer SPL 87 and separate Purple Book records',()=>{
   expect(humalogSources).toHaveLength(3); expect(humalogAtoms).toHaveLength(3);
   const label=humalogSources.find(s=>s.id==='SRC-B2-HUMALOG-SPL87'); expect(label?.metadata?.setId).toBe('c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f'); expect(label?.metadata?.splVersion).toBe(87); expect(label?.effectiveDate).toBe('2026-06-16');
   expect(humalogSources.filter(s=>s.id.includes('PURPLEBOOK')).every(s=>s.metadata?.databaseLastUpdated==='2026-09-11')).toBe(true);
 });
 it('appends to NovoLog without mutating historical evidence',()=>{
   expect(validateEvidenceBundle(diabetesNovoLogEvidence)).toEqual([]); expect(validateEvidenceBundle(diabetesHumalogEvidence)).toEqual([]);
   expect(diabetesWorkflowEvidence).toBe(diabetesHumalogEvidence);
   expect(diabetesHumalogEvidence.sources.slice(0,diabetesNovoLogEvidence.sources.length)).toEqual(diabetesNovoLogEvidence.sources);
   expect(diabetesHumalogEvidence.atoms.slice(0,diabetesNovoLogEvidence.atoms.length)).toEqual(diabetesNovoLogEvidence.atoms);
 });
 it('keeps all new atoms descriptive and outside action rules',()=>{const ids=new Set(clinicalReviewRules.flatMap(r=>r.evidenceRefs.map(x=>x.id))); for(const atom of humalogAtoms){expect(atom.stance).toBe('DESCRIPTIVE');expect(atom.evidenceStrength).toBe('NOT_GRADED');expect(atom.lifecycle).toBe('DRAFT');expect(ids.has(atom.id)).toBe(false);}});
});

describe('Humalog retains insulin review safeguards',()=>{
 it.each(humalogProductDefinitions.map(p=>p.medicationId))('keeps review-only behavior for %s',(id)=>{
   for(const procedure of procedures){
     const routine=evaluate(id,procedure);
     expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
     expect(routine.outputSnapshot.timingRule).toBeUndefined();
     const typeOne=evaluate(id,procedure,[known('MOD-diabetes-type','TYPE_1')]);
     expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
     const pump=evaluate(id,procedure,[known('MOD-pump-aid-system-type','AID')]);
     expect(pump.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
   }
 });
});
