import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  diabetesLevemirEvidence, diabetesNovoLogEvidence, diabetesWorkflowEvidence,
  novologAtoms, novologPresentationMarketingStatuses, novologProductDefinitions, novologSources,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesLevemirMedications } from '../diabetes-levemir';
import { diabetesNovoLogAudit, diabetesNovoLogIdentities, diabetesNovoLogMedications } from '../diabetes-novolog';

const index=new TerminologyIndex(terminologyDataset);
const procedures:ProcedureCode[]=['EGD','COLONOSCOPY','EGD_COLONOSCOPY'];
const known=(modifierId:string,value:unknown):ModifierValue=>({modifierId,state:'KNOWN',value});

function evaluate(id:string,procedureCode:ProcedureCode,overrides:ModifierValue[]=[]){
  const medication=index.getMedicationById(id);
  if(!medication) throw new Error(`Missing NovoLog fixture ${id}`);
  const values=[
    known('MOD-diabetes-type','TYPE_2'),
    known('MOD-current-insulin-plan-confirmed',true),
    known('MOD-insulin-formulation-confirmed',true),
    known('MOD-pump-aid-system-type','NOT_USING_PUMP'),
    known('MOD-current-oral-intake-state','FASTING'),
  ];
  const modifiers=new Map(values.map((value)=>[value.modifierId,value]));
  for(const value of overrides) modifiers.set(value.modifierId,value);
  return evaluateDecision({
    decisionEventId:'DEC-SYNTHETIC-NOVOLOG',occurredAt:'2026-09-26T03:04:08Z',
    engineVersion:'novolog-identity-test',mode:'VALIDATION',
    context:{organizationId:'ORG-SYNTHETIC-NOVOLOG',procedureCode,
      medication:{medicationId:id,ingredientIds:medication.ingredientIds,drugClassIds:medication.drugClassIds??[]},
      modifiers:[...modifiers.values()]},
    rules:clinicalReviewRules,policies:[],
  }).event;
}

describe('NovoLog product identity and mixed presentation marketing status',()=>{
  it('adds one source-linked branded identity without changing the 58-concept Levemir snapshot',()=>{
    expect(diabetesLevemirMedications).toHaveLength(58);
    expect(diabetesNovoLogMedications).toHaveLength(59);
    expect(novologProductDefinitions).toHaveLength(1);
    expect(diabetesNovoLogAudit.searchableConceptCount).toBe(59);
    expect(diabetesNovoLogAudit.sourceLinkedIdentityCount).toBe(31);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
  });

  it.each(['NovoLog','NovoLog U-100','NovoLog 100 units/mL','NovoLog PenFill U-100','NovoLog FlexPen U-100','NovoLog FlexTouch U-100','ReliOn NovoLog U-100'])(
    'recognizes explicit branded wording %s without confirming presentation or regimen',(query)=>{
      const result=index.resolve(query);
      expect(result.medication?.id).toBe('MED-insulin-aspart-novolog-u100');
      const identity=diabetesNovoLogIdentities['MED-insulin-aspart-novolog-u100'];
      expect(identity?.concentration).toEqual({value:100,unit:'units/mL'});
      expect(identity?.allowsDoseCalculation).toBe(false);
      expect(identity?.presentationConfirmed).toBe(false);
      expect(identity?.deviceCompatibilityAuthorized).toBe(false);
      expect(identity?.substitutionAuthorized).toBe(false);
    },
  );

  it.each(['insulin aspart U-100','insulin aspart 100 units/mL','aspart U100'])(
    'does not authenticate NovoLog from generic wording %s',(query)=>{
      for(const limit of [1,10]){
        const result=index.resolve(query,{limit});
        expect(result.medication?.id).not.toBe('MED-insulin-aspart-novolog-u100');
        if(result.status==='RESOLVED'){
          expect(result.medication?.id).toBe('MED-insulin-aspart');
          expect(result.medication?.brandNames).toEqual([]);
          expect(diabetesNovoLogIdentities['MED-insulin-aspart']?.state).toBe('UNSPECIFIED');
        } else {
          expect(result.status).toBe('AMBIGUOUS');
          expect(result.medication).toBeUndefined();
        }
      }
    },
  );

  it.each(['NovoLog U-200','NovoLog 200 units/mL','NovoLog U-300','NovoLog U-500'])(
    'does not discard unsupported concentration detail in %s',(query)=>{
      const result=index.resolve(query,{limit:1});
      expect(result.status).not.toBe('RESOLVED');
      expect(result.medication).toBeUndefined();
    },
  );

  it('preserves mixed Purple Book status at product-number presentation level',()=>{
    expect(novologPresentationMarketingStatuses).toEqual([
      {productNumber:'001',presentation:'MULTI_DOSE_VIAL',status:'RX'},
      {productNumber:'002',presentation:'MULTI_DOSE_CARTRIDGE',status:'RX'},
      {productNumber:'003',presentation:'AUTOINJECTOR',status:'RX'},
      {productNumber:'004',presentation:'AUTOINJECTOR',status:'DISCONTINUED'},
      {productNumber:'005',presentation:'AUTOINJECTOR',status:'DISCONTINUED'},
    ]);
    const identity=diabetesNovoLogIdentities['MED-insulin-aspart-novolog-u100'];
    expect(identity?.presentationMarketingStatuses).toEqual(novologPresentationMarketingStatuses);
    expect(diabetesNovoLogAudit.rxPresentationProductCount).toBe(3);
    expect(diabetesNovoLogAudit.discontinuedPresentationProductCount).toBe(2);
    expect(diabetesNovoLogAudit.marketAvailabilityAsserted).toBe(false);
    expect(index.getMedicationById('MED-insulin-aspart-novolog-u100')?.externalCodes??[]).toEqual([]);
  });
});

describe('NovoLog evidence provenance and append-only history',()=>{
  it('pins manufacturer identity separately from presentation-level Purple Book status',()=>{
    expect(novologSources).toHaveLength(2);
    expect(novologAtoms).toHaveLength(2);
    const label=novologSources.find((source)=>source.id==='SRC-B2-NOVOLOG-SPL34');
    expect(label?.metadata?.setId).toBe('3a1e73a2-3009-40d0-876c-b4cb2be56fc5');
    expect(label?.metadata?.splVersion).toBe(34);
    expect(label?.effectiveDate).toBe('2023-02-28');
    expect(label?.metadata?.currentArchivePublishedDate).toBe('2025-01-22');
    const status=novologSources.find((source)=>source.id==='SRC-B2-NOVOLOG-PURPLEBOOK-2026-09');
    expect(status?.metadata?.applicationNumber).toBe('BLA 020986');
    expect(status?.metadata?.databaseLastUpdated).toBe('2026-09-11');
    expect(status?.metadata?.listedProductCount).toBe(5);
    expect(label?.lifecycle).toBe('DRAFT');
    expect(status?.lifecycle).toBe('DRAFT');
  });

  it('appends to Levemir without mutating its historical evidence bundle',()=>{
    expect(validateEvidenceBundle(diabetesLevemirEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesNovoLogEvidence)).toEqual([]);
    expect(diabetesWorkflowEvidence).toBe(diabetesNovoLogEvidence);
    expect(diabetesNovoLogEvidence.sources.slice(0,diabetesLevemirEvidence.sources.length)).toEqual(diabetesLevemirEvidence.sources);
    expect(diabetesNovoLogEvidence.atoms.slice(0,diabetesLevemirEvidence.atoms.length)).toEqual(diabetesLevemirEvidence.atoms);
    expect(diabetesNovoLogEvidence.sources).toHaveLength(diabetesLevemirEvidence.sources.length+2);
    expect(diabetesNovoLogEvidence.atoms).toHaveLength(diabetesLevemirEvidence.atoms.length+2);
  });

  it('keeps identity and marketing-status atoms descriptive and outside medication-action rules',()=>{
    const ruleEvidenceIds=new Set(clinicalReviewRules.flatMap((rule)=>rule.evidenceRefs.map((ref)=>ref.id)));
    for(const atom of novologAtoms){
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.lifecycle).toBe('DRAFT');
      expect(ruleEvidenceIds.has(atom.id)).toBe(false);
    }
  });
});

describe('NovoLog retains existing insulin clinical-review safeguards',()=>{
  it.each(novologProductDefinitions.map((product)=>product.medicationId))(
    'keeps review-only behavior and missing-input safeguards for %s',(id)=>{
      for(const procedure of procedures){
        const routine=evaluate(id,procedure);
        expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(routine.outputSnapshot.timingRule).toBeUndefined();

        const typeOne=evaluate(id,procedure,[known('MOD-diabetes-type','TYPE_1')]);
        expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
        expect(typeOne.outputSnapshot.timingRule).toBeUndefined();

        const pump=evaluate(id,procedure,[known('MOD-pump-aid-system-type','AID')]);
        expect(pump.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(pump.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
        expect(pump.outputSnapshot.timingRule).toBeUndefined();

        for(const state of ['UNKNOWN','CONFLICTING'] as const){
          const missing=evaluate(id,procedure,[{modifierId:'MOD-insulin-formulation-confirmed',state}]);
          expect(missing.disposition).toBe('INSUFFICIENT_INFORMATION');
          expect(missing.outputSnapshot.timingRule).toBeUndefined();
        }
      }
    },
  );
});
