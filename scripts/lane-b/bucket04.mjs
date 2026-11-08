import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
export const GROUPS04=['ING-dapagliflozin+ING-saxagliptin','ING-dulaglutide','ING-empagliflozin+ING-linagliptin','ING-empagliflozin+ING-linagliptin+ING-metformin','ING-empagliflozin+ING-metformin','ING-ertugliflozin+ING-metformin','ING-ertugliflozin+ING-sitagliptin','ING-exenatide','ING-liraglutide','ING-lixisenatide'];
export const stable=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v);
export const digest=v=>createHash('sha256').update(typeof v==='string'?v:stable(v)).digest('hex');
export function corpus04(root=process.cwd()) {const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));return {reference:read('docs/medication-evidence/lane-b/bucket04-reference.json'),packages:GROUPS04.map(k=>read(`docs/medication-evidence/groups/${k}.json`)),manifest:read('docs/medication-audit-manifest.json')};}
export function clinicalHash(p,reference){const {tests,commitSha,status,verification,...clinical}=p;return digest({clinical,reference});}
export function validate04(c){const errors=[],seen=new Set();for(const p of c.packages){
 if(p.lane!=='B'||p.bucket!==4||!GROUPS04.includes(p.groupId))errors.push('UNOWNED_GROUP');
 const expected=c.manifest.medications.filter(m=>m.ingredientSetKey===p.groupId);
 if(stable(p.mappedMedicationIds.slice().sort())!==stable(expected.map(m=>m.medicationId).sort()))errors.push('ID_MAPPING');
 if(stable(p.mappings.map(m=>m.medicationId).sort())!==stable(p.mappedMedicationIds.slice().sort()))errors.push('PARTITION');
 for(const m of p.mappings){const o=expected.find(x=>x.medicationId===m.medicationId);if(!o||o.canonicalName!==m.canonicalName||stable(o.ingredientIds.slice().sort())!==stable(m.ingredientIds.slice().sort()))errors.push('INGREDIENT_OR_NAME');if(seen.has(m.medicationId))errors.push('DUPLICATE_ID');seen.add(m.medicationId);if(!m.family||!m.route||!m.release||typeof m.requiresConfirmation!=='boolean')errors.push('FORMULATION');}
 for(const id of p.referenceIds){const ref=c.reference.recommendations[id];if(!ref||!p.sources.some(s=>s.id===ref.source)||!ref.section||!ref.url)errors.push('PROVENANCE');}
 if(p.sources.some(s=>!s.version||!s.publicationDate||!s.section||!s.url.startsWith('https://')))errors.push('SOURCE');
 if(p.clinicalApproval!==false||p.patientFacingAuthorized!==false||p.extractionMustWaitForClinician!==false)errors.push('AUTHORITY');
 if(!p.formulationAssessment.length||p.scenarios.length<4)errors.push('SCOPE');
 }return errors;}
const no=reason=>({status:reason,rows:[],warnings:[],patientInstructions:null,clinicalApproval:false,patientFacingAuthorized:false,modelCalls:0,networkCalls:0});
// Research-only evidence view; deliberately not imported by the patient decision engine.
export function references04(c,input){
 if(!input||typeof input!=='object'||Array.isArray(input))return no('INVALID_INPUT');
 const p=c.packages.find(p=>p.groupId===input.groupId),m=p?.mappings.find(m=>m.medicationId===input.medicationId);
 if(!m)return no('FOREIGN_ID');
 if(m.requiresConfirmation||input.family!==m.family||input.route!==m.route||input.release!==m.release)return no('FORMULATION_CONFIRMATION_REQUIRED');
 if(input.adult!==true||input.elective!==true||!['EGD','COLONOSCOPY','COMBINED'].includes(input.procedure))return no('OUTSIDE_SCOPE');
 if(input.renalStable!==true||input.hepaticStable!==true||input.acuteMetabolicIllness!==false)return no('INDIVIDUAL_CLINICIAN_PLAN');
 if(!p.sources.some(s=>s.id===input.source))return no('SOURCE_SELECTION_REQUIRED');
 if(input.indication!==m.indication)return no('INDICATION_MISMATCH');
 const r=no('REFERENCE_ONLY'),refs=c.reference.recommendations;
 r.warnings.push('NOT_CLINICALLY_REVIEWED','DO_NOT_COMBINE_DIFFERENT_SOURCE_SCHEDULES');
 for(const issue of c.reference.sourceAccessLimitations)r.warnings.push(issue);
 const add=(id,data={})=>{const x=refs[id],s=c.reference.sources[x.source];r.rows.push({...x,...data,title:s.name,version:s.version,publicationDate:s.publicationDate,strength:s.strength,accessLimitations:s.limitations});};
 if(input.phase==='restart'){
  if(input.normalDiet!==true||input.hydrated!==true)return no('INTAKE_HYDRATION_REQUIRED');
  if(p.contextRef==='sglt'){
   if(input.ketosisResolved!==true)return no('KETOSIS_RISK_UNRESOLVED');
   if(input.source==='UK25'){
    if(!['inpatient','outpatient'].includes(input.setting))return no('SETTING_REQUIRED');
    if(input.setting==='inpatient'&&!ketoneBoundary(input.ketones))return no('KETONES_BELOW_0_6_REQUIRED');
    add('uk-sglt',{phase:'restart'});
   }else if(input.source==='ADA26')add('ada',{phase:'restart'});
   else if(input.source==='COLON23'&&input.procedure!=='EGD')add('colonoscopy',{phase:'restart'});
   else return no('NO_EXACT_RESTART_IN_SELECTED_SOURCE');
   if(p.groupId.includes('metformin')&&input.renalRestartAssessed!==true)return no('METFORMIN_RESTART_ASSESSMENT_REQUIRED');
   r.warnings.push('WHOLE_PRODUCT_NO_AUTOMATIC_COMPONENT_REPLACEMENT');
  }else{
   if(input.significantGiSymptoms!==false||input.retitrationAssessed!==true)return no('RESTART_OR_RETITRATION_REVIEW_REQUIRED');
   if(input.source!=='SPAQI25')return no('NO_EXACT_RESTART_IN_SELECTED_SOURCE');
   add('spaqi-glp',{phase:'restart'});
  }
  return r;
 }
 if(input.phase!=='preprocedure')return no('PHASE_REQUIRED');
 if(p.contextRef==='sglt'){
  if(input.source==='ASGE25'){
   const key=p.groupId.includes('ertugliflozin')?'ertugliflozinDays':p.groupId.includes('dapagliflozin')?'dapagliflozinDays':'empagliflozinDays';
   add('asge-sglt',{selectedDrugDays:refs['asge-sglt'][key],anchor:'procedure_start',dayCountConvention:'Do not silently equate full calendar days with elapsed hours'});
  }else if(input.source==='UK25')add('uk-sglt');
  else if(input.source==='ADA26')add('ada');
  else if(input.source==='CPOC23')add('cpoc');
  else if(input.source==='COLON23'&&input.procedure!=='EGD')add('colonoscopy');
  else return no('NOT_EXTRACTED_FOR_SCENARIO');
  r.warnings.push('NORMAL_GLUCOSE_DOES_NOT_EXCLUDE_EUGLYCEMIC_DKA','ALL_FIXED_COMBINATION_COMPONENTS_PRESENT','COMPONENTS_CANNOT_BE_SPLIT_AUTOMATICALLY');
  if(input.lowEnergyDiet===true)r.warnings.push('ASSESS_EARLIER_CESSATION_AT_RESTRICTIVE_DIET_START');
 }else{
  if(typeof input.significantGiSymptoms!=='boolean'||typeof input.otherMotilityRisk!=='boolean'||typeof input.escalation!=='boolean')return no('ASPIRATION_RISK_INPUTS_REQUIRED');
  if(input.significantGiSymptoms||input.otherMotilityRisk)return no('ANESTHESIA_PRESCRIBER_ASSESSMENT');
  if(input.source==='ASGE25')add('asge-glp',{selectedInterval:m.family==='weekly-glp'?{value:7,unit:'days',operator:'>='}:{value:24,unit:'elapsed_hours',operator:'>='}});
  else if(input.source==='USMULTI24'){add('usmulti-glp',{decision:input.escalation?'ELEVATED_RISK_SHARED_DECISION':'RISK_STRATIFY_DO_NOT_ASSUME_LOW_RISK'});}
  else if(input.source==='SPAQI25')add('spaqi-glp');
  else if(input.source==='UK25')add('uk-glp');
  else if(input.source==='ADA26')add('ada');
  else if(input.source==='CPOC23')add('cpoc');
  else return no('NOT_EXTRACTED_FOR_SCENARIO');
  r.warnings.push('NO_HOLD_INTERVAL_PROVES_EMPTY_STOMACH','NO_AUTOMATIC_DOSE_OR_CATCH_UP');
 }
 return r;
}
export function ketoneBoundary(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<0.6;}
export function liquidFastHours(percent){return typeof percent==='number'&&Number.isFinite(percent)&&percent>=0&&percent<=100?(percent>=10?8:4):null;}
export function renalBoundary(c,id,metric,value){const p=c.reference.recommendations[id];if(!p?.lowerNotRecommended||p.metric!==metric||typeof value!=='number'||!Number.isFinite(value)||value<0)return 'UNRESOLVED';return value<p.lowerNotRecommended?'NOT_RECOMMENDED_BY_LABEL':'NO_LOW_BOUNDARY_FLAG_NOT_CLEARANCE';}
export function fullCalendarOmission(date,days){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||![3,4].includes(days))return null;const d=new Date(`${date}T00:00:00Z`);if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==date)return null;return Array.from({length:days},(_,i)=>new Date(+d-(days-i)*86400000).toISOString().slice(0,10));}
