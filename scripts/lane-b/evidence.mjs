import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Bounded evidence-reference reader for review/tests. Never a patient decision engine.
export const GROUPS=['ING-heparin','ING-aspirin+ING-dipyridamole','ING-insulin-glargine','ING-insulin-lispro','ING-insulin-aspart','ING-insulin-regular','ING-insulin-nph','ING-insulin-degludec','ING-insulin-detemir','ING-insulin-glulisine'];
export const stable=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v);
export const sha256=v=>createHash('sha256').update(typeof v==='string'?v:stable(v)).digest('hex');
export function loadEvidence(root=process.cwd()){
 const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
 return {reference:read('docs/medication-evidence/lane-b/bucket02-reference.json'),packages:GROUPS.map(g=>read(`docs/medication-evidence/groups/${g}.json`)),manifest:read('docs/medication-audit-manifest.json')};
}
export function evidenceHash(pkg,reference){const {tests,commitSha,status,verification,...clinical}=pkg;return sha256({clinical,reference});}
export function validateOwnedPackage(pkg,reference,manifest){
 const errors=[];
 if(!GROUPS.includes(pkg.groupId)||pkg.lane!=='B'||pkg.bucket!==2)errors.push('UNOWNED_GROUP');
 const expected=manifest.medications.filter(m=>m.ingredientSetKey===pkg.groupId).map(m=>m.medicationId).sort();
 if(stable([...pkg.mappedMedicationIds].sort())!==stable(expected)||new Set(pkg.mappedMedicationIds).size!==expected.length)errors.push('MAPPING_INCOMPLETE');
 if(stable(pkg.mappings.map(m=>m.medicationId).sort())!==stable(expected))errors.push('MAPPING_DETAILS_INCOMPLETE');
 for(const m of pkg.mappings){const original=manifest.medications.find(x=>x.medicationId===m.medicationId);if(!original||stable([...m.ingredientIds].sort())!==stable([...original.ingredientIds].sort()))errors.push('FOREIGN_INGREDIENT');if(!Array.isArray(m.aliases)||!m.family||!m.route)errors.push('IDENTITY_METADATA_MISSING');}
 if(pkg.clinicalApproval!==false||pkg.patientFacingAuthorized!==false)errors.push('UNAUTHORIZED_ACTIVATION');
 for(const id of pkg.referenceIds)if(!reference.recommendations[id]||!reference.sources[reference.recommendations[id].source])errors.push('BROKEN_REFERENCE');
 if(!pkg.sources.length||pkg.sources.some(s=>!s.publicationDate||!s.version||!s.section||!s.strength||!/^https:\/\//.test(s.url)))errors.push('SOURCE_PROVENANCE_MISSING');
 if(!pkg.scenarios.length||!pkg.formulationAssessment.length||!pkg.societyComparison?.length)errors.push('EVIDENCE_SCOPE_MISSING');
 if(pkg.contextRef==='antithrombotic'&&(!pkg.asge2016||!['COMPARED','NOT_ADDRESSED'].includes(pkg.asge2016.status)))errors.push('ASGE_COMPARATOR_MISSING');
 return errors;
}
const riskKeys=['activeBleeding','renalUnstable','hepaticFailure','recentThrombosis','neuraxial','pregnant'];
export function referenceCandidates(corpus,input){
 const result={status:'REFERENCE_ONLY',references:[],warnings:[],patientInstructions:null,clinicalApproval:false,patientFacingAuthorized:false,modelCalls:0,networkCalls:0};const stop=reason=>({...result,status:reason});
 if(!input||typeof input!=='object'||Array.isArray(input))return stop('MALFORMED_INPUT');
 const pkg=corpus.packages.find(p=>p.groupId===input.groupId);if(!pkg)return stop('UNOWNED_GROUP');
 const m=pkg.mappings.find(x=>x.medicationId===input.medicationId);if(!m)return stop('FOREIGN_CANONICAL_ID');
 if(input.adult!==true||!['EGD','COLONOSCOPY','COMBINED'].includes(input.procedure))return stop('UNSUPPORTED_POPULATION_OR_PROCEDURE');
 if(!input.risks||riskKeys.some(k=>typeof input.risks[k]!=='boolean'))return stop('MISSING_RISK_INPUT');
 if(riskKeys.some(k=>input.risks[k]))return stop('INDIVIDUAL_CLINICIAN_PLAN');
 if(!input.source||!pkg.sources.concat(pkg.supportingSources??[]).some(s=>s.id===input.source))return stop('SOURCE_SELECTION_REQUIRED');
 const reference=corpus.reference;
 if(input.renalValue!==undefined&&(typeof input.renalValue!=='number'||!Number.isFinite(input.renalValue)||input.renalValue<0))return stop('INVALID_RENAL_INPUT');
 result.warnings.push('NO_NUMERIC_RENAL_TABLE; stable CKD still requires individualized assessment');
 let family=m.family;
 if(family.startsWith('unspecified')){
  if(input.formulationConfirmed!==true||!input.family)return stop('NEEDS_FORMULATION_CONFIRMATION');
  const allowed=pkg.groupId==='ING-heparin'?['ufh-iv','ufh-sc']:pkg.mappings.filter(x=>!x.family.startsWith('unspecified')).map(x=>x.family);
  if(!allowed.includes(input.family))return stop('FORMULATION_MISMATCH');family=input.family;
  if(pkg.contextRef==='insulin'&&!pkg.mappings.some(x=>x.family===family&&x.concentrationUnitsPerMl===input.concentration))return stop('CONCENTRATION_MISMATCH');
 }else if(input.family&&input.family!==family)return stop('FORMULATION_MISMATCH');
 if(m.concentrationUnitsPerMl&&input.concentration!==m.concentrationUnitsPerMl)return stop('CONCENTRATION_MISMATCH');
 if(pkg.contextRef==='insulin'){
  if(!['type1','type2'].includes(input.diabetesType))return stop('DIABETES_TYPE_REQUIRED');
  if(!['SC','PUMP','IV'].includes(input.route)||!['fixed','carb-ratio','basal','premix'].includes(input.regimen))return stop('REGIMEN_REQUIRED');
  if(input.route!=='SC'||family==='regular-u500')return stop('INDIVIDUAL_INSULIN_PLAN');
  if(input.missedMeals>1)return stop('PROLONGED_FASTING_PLAN');
  if(input.diabetesType==='type1'&&input.basalCoverage!==true)return stop('BASAL_CONTINUITY_REQUIRED');
  if(input.source==='COLON22'&&input.procedure==='EGD')return stop('SOURCE_SCOPE_MISMATCH');
  if(input.phase==='clear_fluids'&&input.mealState!=='CLEAR_FLUIDS')return stop('MEAL_PHASE_MISMATCH');
  if(input.phase==='fasting_meal'&&input.mealState!=='NPO')return stop('MEAL_PHASE_MISMATCH');
  if(input.regimen==='carb-ratio'&&['rapid','short-u100'].includes(family)&&input.phase==='clear_fluids')return {...result,status:'CARBOHYDRATE_RATIO_REFERENCE',warnings:[...result.warnings,'Actual carbohydrate ratio discussion, not fixed-dose50%.']};
  if(['rapid','short-u100'].includes(family)&&input.regimen!=='fixed')return stop('REGIMEN_MISMATCH');
  if(family==='premix'&&input.regimen!=='premix')return stop('REGIMEN_MISMATCH');
  if(['basal-u100','basal-u300','basal-degludec','nph'].includes(family)&&input.regimen!=='basal')return stop('REGIMEN_MISMATCH');
 }else{
  if(family.startsWith('ufh')&&(input.route!==(family==='ufh-iv'?'IV':'SC')||!['THERAPEUTIC_BRIDGE','PROPHYLAXIS','OTHER_INPATIENT'].includes(input.indication)))return stop('UFH_ROUTE_INDICATION_REQUIRED');
  if(family==='asa-er-dipyridamole'&&(input.route!=='oral'||input.indication!=='SECONDARY_STROKE'))return stop('COMBINATION_SCOPE_MISMATCH');
  if(input.source==='CHEST22'&&family==='ufh-iv'&&input.indication!=='THERAPEUTIC_BRIDGE')return stop('SOURCE_SCOPE_MISMATCH');
  if(input.phase==='resumption'&&input.hemostasisConfirmed!==true)return stop('HEMOSTASIS_REQUIRED');
 }
 result.references=pkg.referenceIds.map(id=>reference.recommendations[id]).filter(r=>r.source===input.source&&r.families.includes(family)&&r.phase===input.phase&&(!r.id.endsWith('-t1')||input.diabetesType==='type1')&&(!r.id.endsWith('-t2')||input.diabetesType==='type2'));
 if(!result.references.length)result.status='NOT_ADDRESSED_FOR_EXACT_SCENARIO';return result;
}
export function intervalRelation(rec,amount,unit){
 if(rec.kind==='DESCRIPTIVE')return 'DESCRIPTIVE_NOT_A_HOLD';if(!rec.value)return 'NO_QUANTIFIED_INTERVAL';if(unit!==rec.unit)return 'UNIT_MISMATCH';if(typeof amount!=='number'||!Number.isFinite(amount)||amount<0)return 'INVALID_AMOUNT';
 const [lower,upper]=rec.value;if(amount<lower)return 'BELOW_SOURCE_RANGE';if(upper!==null&&amount>upper)return 'ABOVE_SOURCE_RANGE';return 'WITHIN_SOURCE_RANGE_NOT_CLINICAL_CLEARANCE';
}
