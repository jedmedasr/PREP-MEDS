import test from 'node:test';
import assert from 'node:assert/strict';
import {GROUPS,loadEvidence,validateOwnedPackage,referenceCandidates,intervalRelation,evidenceHash} from '../lane-b/evidence.mjs';
const data=loadEvidence();const R=data.reference.recommendations;const clone=x=>structuredClone(x);
const risks={activeBleeding:false,renalUnstable:false,hepaticFailure:false,recentThrombosis:false,neuraxial:false,pregnant:false};
const context={adult:true,procedure:'COLONOSCOPY',risks,diabetesType:'type1',basalCoverage:true,route:'SC',regimen:'basal',source:'COLON22',phase:'day_before',mealState:'NORMAL',missedMeals:1};
for(const p of data.packages){
 test(`${p.groupId}: exact allocated identity coverage, provenance, formulation and clinical separation`,()=>assert.deepEqual(validateOwnedPackage(p,data.reference,data.manifest),[]));
 test(`${p.groupId}: foreign canonical medication cannot inherit`,()=>assert.equal(referenceCandidates(data,{...context,groupId:p.groupId,medicationId:'MED-apixaban'}).status,'FOREIGN_CANONICAL_ID'));
 test(`${p.groupId}: missing source cannot silently choose shortest or longest`,()=>assert.equal(referenceCandidates(data,{...context,groupId:p.groupId,medicationId:p.mappedMedicationIds[0],source:undefined}).status,'SOURCE_SELECTION_REQUIRED'));
 test(`${p.groupId}: clinical change invalidates evidence hash, receipt-only update does not`,()=>{
  const x=clone(p);x.tests=[{passed:true}];x.commitSha='a'.repeat(40);x.status='READY_FOR_CLINICIAN_REVIEW';assert.equal(evidenceHash(p,data.reference),evidenceHash(x,data.reference));
  const b=clone(data.reference);b.recommendations['chest-ufh-stop'].value[0]=5;assert.notEqual(evidenceHash(p,data.reference),evidenceHash(p,b));
 });
 for(const m of p.mappings)test(`${m.medicationId}: canonical identity/aliases/formulation explicit, no activation`,()=>{
  assert.ok(m.aliases.length);assert.ok(m.canonicalName);assert.equal(m.ingredientIds.slice().sort().join('+'),p.groupId);assert.equal(p.patientFacingAuthorized,false);
  const q=referenceCandidates(data,{...context,groupId:p.groupId,medicationId:m.medicationId,concentration:m.concentrationUnitsPerMl,source:p.sources[0].id});
  assert.equal(q.patientInstructions,null);assert.equal(q.modelCalls,0);assert.equal(q.networkCalls,0);
  if(m.family.startsWith('unspecified'))assert.equal(q.status,'NEEDS_FORMULATION_CONFIRMATION');
 });
}
test('exact bucket02 count is ten provisional groups and34 canonical IDs, not aliases',()=>{assert.equal(GROUPS.length,10);assert.equal(data.packages.flatMap(p=>p.mappedMedicationIds).length,34);});
const basal={...context,groupId:'ING-insulin-glargine',medicationId:'MED-insulin-glargine-u100',concentration:100};
test('colonoscopy first-generation previous-day80%, procedure morning50% retain separate anchors',()=>{
 assert.deepEqual(R['colon-first-before'].value,[80,80]);assert.deepEqual(R['colon-first-am'].value,[50,50]);assert.equal(referenceCandidates(data,basal).references[0]?.id,'colon-first-before');assert.equal(referenceCandidates(data,{...basal,phase:'morning_procedure'}).references[0]?.id,'colon-first-am');
});
test('CPOC80%, ADA75-80% and colonoscopy50% are not consensus',()=>{assert.deepEqual(R['cpoc-basal-am'].value,[80,80]);assert.deepEqual(R['ada-basal'].value,[75,80]);assert.deepEqual(R['colon-first-am'].value,[50,50]);});
test('NPH society disagreement50% vs80% is explicit',()=>{assert.deepEqual(R['ada-nph'].value,[50,50]);assert.ok(R['cpoc-basal-am'].families.includes('nph'));});
test('glargineU300/degludec preserve type1range50-80% versus type2fixed50%',()=>{
 const q={...basal,medicationId:'MED-insulin-glargine-u300',concentration:300,phase:'day_before_and_if_due_before_procedure'};assert.equal(referenceCandidates(data,q).references[0]?.id,'colon-second-t1');assert.equal(referenceCandidates(data,{...q,diabetesType:'type2'}).references[0]?.id,'colon-second-t2');
 assert.equal(intervalRelation(R['colon-second-t1'],49.999,'percent_usual_dose'),'BELOW_SOURCE_RANGE');for(const n of [50,65,80])assert.match(intervalRelation(R['colon-second-t1'],n,'percent_usual_dose'),/^WITHIN/);assert.equal(intervalRelation(R['colon-second-t1'],80.001,'percent_usual_dose'),'ABOVE_SOURCE_RANGE');
});
test('type1 basal never silently omitted',()=>assert.equal(referenceCandidates(data,{...basal,basalCoverage:false}).status,'BASAL_CONTINUITY_REQUIRED'));
test('U100/U300 cannot inherit across concentration',()=>{assert.equal(referenceCandidates(data,{...basal,concentration:300}).status,'CONCENTRATION_MISMATCH');assert.equal(referenceCandidates(data,{...basal,family:'basal-u300'}).status,'FORMULATION_MISMATCH');});
test('generic glargine requires confirmation; unsupported pump family rejected',()=>{const q={...basal,medicationId:'MED-insulin-glargine'};assert.equal(referenceCandidates(data,q).status,'NEEDS_FORMULATION_CONFIRMATION');assert.equal(referenceCandidates(data,{...q,formulationConfirmed:true,family:'pump'}).status,'FORMULATION_MISMATCH');});
test('meal omission is not clear-fluid50% or carbohydrate ratio',()=>{
 const q={...context,groupId:'ING-insulin-lispro',medicationId:'MED-insulin-lispro-humalog-u100',concentration:100,regimen:'fixed',phase:'clear_fluids',mealState:'CLEAR_FLUIDS'};
 assert.equal(referenceCandidates(data,q).references[0]?.id,'colon-prandial');assert.equal(referenceCandidates(data,{...q,mealState:'NPO'}).status,'MEAL_PHASE_MISMATCH');assert.equal(referenceCandidates(data,{...q,regimen:'carb-ratio'}).status,'CARBOHYDRATE_RATIO_REFERENCE');assert.deepEqual(referenceCandidates(data,{...q,source:'CPOC23',phase:'fasting_meal',mealState:'NPO'}).references[0]?.value,[0,0]);
});
test('premix cannot use rapid-only clear-fluid fraction or meal omission',()=>{
 for(const [group,id] of [['ING-insulin-lispro','MED-insulin-lispro-75-25'],['ING-insulin-lispro','MED-insulin-lispro-50-50'],['ING-insulin-aspart','MED-insulin-aspart-70-30']]){
  const q={...context,groupId:group,medicationId:id,concentration:100,regimen:'premix'};assert.equal(referenceCandidates(data,q).references[0]?.id,'colon-premix');assert.equal(referenceCandidates(data,{...q,phase:'clear_fluids',mealState:'CLEAR_FLUIDS'}).references.length,0);assert.equal(referenceCandidates(data,{...q,regimen:'fixed'}).status,'REGIMEN_MISMATCH');
 }
});
test('U500 regular never inherits U100 meal-dose omission',()=>{for(const id of ['MED-insulin-regular-humulin-u500','MED-regular-insulin-u500'])assert.equal(referenceCandidates(data,{...context,groupId:'ING-insulin-regular',medicationId:id,concentration:500,regimen:'fixed'}).status,'INDIVIDUAL_INSULIN_PLAN');});
test('EGD alone cannot inherit colonoscopy dietary fractions',()=>assert.equal(referenceCandidates(data,{...basal,procedure:'EGD'}).status,'SOURCE_SCOPE_MISMATCH'));
for(const route of ['IV','PUMP'])test(`insulin ${route} requires continuity plan not injection arithmetic`,()=>assert.equal(referenceCandidates(data,{...basal,route}).status,'INDIVIDUAL_INSULIN_PLAN'));
test('prolonged fasting and missing diabetes type fail closed',()=>{assert.equal(referenceCandidates(data,{...basal,missedMeals:2}).status,'PROLONGED_FASTING_PLAN');assert.equal(referenceCandidates(data,{...basal,diabetesType:undefined}).status,'DIABETES_TYPE_REQUIRED');});
for(const key of Object.keys(risks))test(`${key} requires explicit clinical plan`,()=>assert.equal(referenceCandidates(data,{...basal,risks:{...risks,[key]:true}}).status,'INDIVIDUAL_CLINICIAN_PLAN'));
for(const n of [14.9,15,29.9,30,49.9,50,59.9,60,90])test(`renal${n} cannot manufacture insulin dose threshold`,()=>{const r=referenceCandidates(data,{...basal,renalValue:n});assert.equal(r.references[0]?.id,'colon-first-before');assert.match(r.warnings[0],/NO_NUMERIC_RENAL_TABLE/);});
for(const n of [NaN,Infinity,-1,'30'])test(`invalid renal${n} rejected`,()=>assert.equal(referenceCandidates(data,{...basal,renalValue:n}).status,'INVALID_RENAL_INPUT'));
const heparin={adult:true,procedure:'COLONOSCOPY',risks,groupId:'ING-heparin',medicationId:'MED-heparin',formulationConfirmed:true,family:'ufh-iv',route:'IV',source:'CHEST22',indication:'THERAPEUTIC_BRIDGE',phase:'interruption'};
test('CHEST therapeutic IV UFH stop>=4h inclusive, not genericSC',()=>{
 assert.equal(referenceCandidates(data,heparin).references[0]?.id,'chest-ufh-stop');assert.equal(intervalRelation(R['chest-ufh-stop'],3.999,'hours'),'BELOW_SOURCE_RANGE');assert.match(intervalRelation(R['chest-ufh-stop'],4,'hours'),/^WITHIN/);assert.match(intervalRelation(R['chest-ufh-stop'],7,'hours'),/^WITHIN/);assert.equal(referenceCandidates(data,{...heparin,family:'ufh-sc',route:'SC'}).references.length,0);assert.equal(referenceCandidates(data,{...heparin,indication:'PROPHYLAXIS'}).status,'SOURCE_SCOPE_MISMATCH');
});
test('ASGE2-6h versus CHEST>=24h restart distinct, hemostasis required',()=>{
 const q={...heparin,phase:'resumption',hemostasisConfirmed:true};assert.deepEqual(referenceCandidates(data,q).references[0]?.value,[24,null]);assert.deepEqual(referenceCandidates(data,{...q,source:'ASGE16'}).references[0]?.value,[2,6]);assert.equal(referenceCandidates(data,{...q,hemostasisConfirmed:false}).status,'HEMOSTASIS_REQUIRED');assert.equal(intervalRelation(R['chest-ufh-resume'],23.999,'hours'),'BELOW_SOURCE_RANGE');assert.match(intervalRelation(R['chest-ufh-resume'],24,'hours'),/^WITHIN/);
});
test('ASGE duration table is not a withholding order',()=>{for(const id of ['asge-ufh-iv','asge-ufh-sc','asge-dipy'])assert.equal(intervalRelation(R[id],3,'hours'),'DESCRIPTIVE_NOT_A_HOLD');});
test('aspirin/dipyridamole does not borrow P2Y12 timing or ASAmonotherapy',()=>{
 const p=data.packages.find(x=>x.groupId==='ING-aspirin+ING-dipyridamole');assert.equal(p.asge2016.wholeProductStatus,'NOT_ADDRESSED');assert.equal(p.societyComparison.find(x=>x.source==='CHEST22').status,'NOT_ADDRESSED');
 const q={adult:true,procedure:'EGD',risks,groupId:p.groupId,medicationId:'MED-aspirin-dipyridamole',source:'UKCPA',phase:'interruption',route:'oral',indication:'SECONDARY_STROKE'};assert.equal(referenceCandidates(data,q).references[0]?.value,null);assert.equal(referenceCandidates(data,{...q,medicationId:'MED-dipyridamole'}).status,'FOREIGN_CANONICAL_ID');assert.equal(referenceCandidates(data,{...q,indication:'CORONARY_DAPT'}).status,'COMBINATION_SCOPE_MISMATCH');
});
test('source genres, supplemental access limits and FDA nonauthority explicit',()=>{
 assert.equal(data.reference.sources.COLON22.kind,'AUTHOR_PRACTICE_REVIEW');assert.match(data.reference.sources.AOA26.limitations.join(' '),/inaccessible/);assert.ok(!Object.values(R).some(r=>/FDA/.test(r.source)));for(const r of Object.values(R)){assert.match(r.passageUrl,/^https:\/\//);assert.ok(r.sourceSection&&r.recommendationStrength&&r.evidenceCertainty);}
});
test('six requested societies compared for both antithrombotic groups',()=>{for(const p of data.packages.filter(x=>x.contextRef==='antithrombotic'))assert.deepEqual(p.societyComparison.map(x=>x.source),['ASGE16','ACG22','BSG21','IDEN24','CHEST22','AHA24']);});
test('no implicit day/hour conversion or invented restart timestamp',()=>{assert.equal(intervalRelation(R['chest-ufh-stop'],1,'days'),'UNIT_MISMATCH');assert.equal(intervalRelation(R['ukcpa-combo'],24,'hours'),'NO_QUANTIFIED_INTERVAL');});
