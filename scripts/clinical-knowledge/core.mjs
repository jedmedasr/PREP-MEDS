import { digest, stable, appendVersion } from '../clinical-evidence/core.mjs';
export { appendVersion };
export const ENGINE = 'ckg-reference-0.1.0';
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const sha = x => /^[a-f0-9]{64}$/.test(x ?? '');
export const dateOnly = s => typeof s === 'string' && /^(19|20|21)\d{2}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
export function calendarMonths(date, months) {
  if (!dateOnly(date) || !Number.isInteger(months) || months < 0 || months > 120) throw new Error('INVALID_CALENDAR_INTERVAL');
  const [y,m,d] = date.split('-').map(Number);
  const target = new Date(Date.UTC(y,m-1+months,1));
  const last = new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  target.setUTCDate(Math.min(d,last));
  return target.toISOString().slice(0,10);
}

/** Integrity and references, never clinical entailment. */
export function validateKnowledge(graph, registry) {
  const errors=[];
  if (graph?.schemaVersion !== 1 || !Array.isArray(graph?.claims) || !Array.isArray(graph?.pathways) || !Array.isArray(graph?.scenarios) || !Array.isArray(graph?.medications) || !Array.isArray(registry?.sources)) return ['INVALID_GRAPH'];
  const unique = (items,label) => { const ids=items.map(x=>x.id); if(ids.some(x=>!nonempty(x)) || new Set(ids).size!==ids.length) errors.push('DUPLICATE_OR_MISSING_'+label); return new Set(ids); };
  const sources=unique(registry.sources,'SOURCE'), claims=unique(graph.claims,'CLAIM'), paths=unique(graph.pathways,'PATHWAY'), scenarios=unique(graph.scenarios,'SCENARIO'), meds=unique(graph.medications,'MEDICATION');
  const passages=new Map();
  for(const s of registry.sources){
    if(!Array.isArray(s.passages) || !nonempty(s.version) || !/^https:\/\//.test(s.url??'')) {errors.push('INVALID_SOURCE:'+s.id);continue;}
    for(const p of s.passages){ if(passages.has(p.id)||!Number.isInteger(p.page)||p.page<1||!nonempty(p.quote)||!nonempty(p.section)) errors.push('INVALID_PASSAGE:'+p.id); passages.set(p.id,s.id); }
  }
  for(const m of graph.medications) if(!Array.isArray(m.ingredientIds)||!m.ingredientIds.length||!nonempty(m.formulation)) errors.push('INVALID_IDENTITY:'+m.id);
  for(const c of graph.claims){
    if(!sources.has(c.sourceId)||!Array.isArray(c.passageIds)||!c.passageIds.length||c.passageIds.some(p=>passages.get(p)!==c.sourceId)) errors.push('CLAIM_SOURCE_BINDING:'+c.id);
    if(c.interval?.value!==3||c.interval?.unit!=='calendar_months'||c.interval?.anchor!==c.anchor||!['CONSIDER_HIGH_RISK_DEFERRAL','EXCLUDE_ROUTINE_ELECTIVE'].includes(c.action)) errors.push('UNVALIDATED_INTERVAL_OR_ACTION:'+c.id);
    if(c.verification!=='SEMANTIC_VERIFICATION_PENDING') errors.push('UNSUPPORTED_PROMOTION:'+c.id);
    if(!nonempty(c.version)||!nonempty(c.summary)||!Array.isArray(c.qualifications)) errors.push('INCOMPLETE_CLAIM:'+c.id);
  }
  for(const p of graph.pathways){
    if(p.evaluator!=='recent-vte-v1')errors.push('UNVALIDATED_EVALUATOR:'+p.id);
    if(!scenarios.has(p.scenarioId)||!Array.isArray(p.claimIds)||!p.claimIds.length||p.claimIds.some(c=>!claims.has(c))) errors.push('PATHWAY_CLAIMS:'+p.id);
    if(!Array.isArray(p.guardSourceIds)||p.guardSourceIds.some(s=>!sources.has(s))) errors.push('PATHWAY_GUARD:'+p.id);
    if(!Array.isArray(p.medicationIds)||p.medicationIds.some(m=>!meds.has(m))) errors.push('PATHWAY_IDENTITY:'+p.id);
    if(!Array.isArray(p.requires)||p.requires.some(q=>!paths.has(q))) errors.push('PATHWAY_DEPENDENCY:'+p.id);
  }
  const visited=new Set(),active=new Set();
  function walk(id){ if(active.has(id)){errors.push('PATHWAY_CYCLE');return;} if(visited.has(id))return;active.add(id); for(const d of graph.pathways.find(p=>p.id===id)?.requires??[]) if(paths.has(d))walk(d);active.delete(id);visited.add(id); }
  for(const p of graph.pathways)walk(p.id);
  for(const s of graph.scenarios) if(!Array.isArray(s.variables)||!s.variables.length||!Array.isArray(s.pathwayIds)||s.pathwayIds.some(p=>!paths.has(p))) errors.push('SCENARIO_SPEC:'+s.id);
  return [...new Set(errors)];
}

export function sourceStatus(source, receipt, observation, asOf) {
  if(!dateOnly(asOf)||!source||!sha(source.rawSha256)||!receipt) return 'SOURCE_NOT_CHECKED';
  if(receipt.rawSha256!==source.rawSha256||receipt.version!==source.version||receipt.url!==source.url) return 'SOURCE_BINDING_FAILED';
  if(observation?.currencyUnresolved) return 'POTENTIAL_SUPERSESSION_REVIEW_REQUIRED';
  if(!observation||observation.rawSha256!==source.rawSha256||observation.available!==true) return 'SOURCE_CHANGED_OR_UNAVAILABLE';
  const checked=Date.parse(observation.checkedAt??receipt.checkedAt), now=Date.parse(asOf+'T23:59:59Z');
  if(!Number.isFinite(checked)||checked>now||now-checked>31*86400000) return 'PASSAGE_CHECK_STALE';
  if(receipt.status!=='PASSAGE_MATCH_ONLY'||!source.passages.every(p=>receipt.passages?.some(r=>r.id===p.id&&r.page===p.page&&r.quoteSha256===digest(p.quote)&&r.matches?.length===2&&r.matches.every(x=>x===true)))) return 'PASSAGE_BINDING_FAILED';
  return 'PRIMARY_PASSAGE_CHECKED_NOT_SEMANTICALLY_VERIFIED';
}
const conditionNames=['activeBleeding','priorCoronaryStent','mechanicalValve','recentStroke','recurrentVteOnTherapy','pregnant','severeOrUnstableRenalDisease'];
const allowedKeys=['synthetic','scenarioId','medicationId','formulation','procedure','vteDate','anticoagulationStart','procedureDate','vteType','adult','otherAntithrombotics','treatmentContinuous','safeToDefer','conditions'];
export function evaluate(graph,registry,input,context={}) {
  if(context.mode!=='synthetic-research') throw new Error('PRODUCTION_PATHWAY_DISABLED');
  if(!['physician','medical-assistant'].includes(context.role)) throw new Error('INVALID_RESEARCH_ROLE');
  if(validateKnowledge(graph,registry).length) throw new Error('GRAPH_INVALID');
  if(!input||typeof input!=='object'||Array.isArray(input)||input.synthetic!==true||Object.keys(input).some(k=>!allowedKeys.includes(k))) throw new Error('SYNTHETIC_ALLOWLIST_ONLY');
  const asOf=context.asOf;
  if(!dateOnly(asOf)) throw new Error('EVALUATION_DATE_REQUIRED');
  const scenario=graph.scenarios.find(s=>s.id===input.scenarioId);
  const base={engine:ENGINE,graphVersion:graph.version,graphDigest:digest(graph),sourceDigest:digest(registry),role:context.role,synthetic:true,routineInstructionsAllowed:false,patientInstructions:null,modelCalls:0,networkCalls:0,rows:[],reasons:[],status:'CLINICIAN_REVIEW_REQUIRED'};
  if(!scenario||!scenario.pathwayIds.length) return {...base,status:'RESEARCH_REQUIRED',reasons:['NO_IMPLEMENTED_PATHWAY'],research:researchRequest(graph,registry,scenario?.id??'unclassified','UNCOVERED_SCENARIO')};
  const p=graph.pathways.find(x=>x.id===scenario.pathwayIds[0]);
  const med=graph.medications.find(x=>x.id===input.medicationId);
  const missing=[]; const excluded=[];
  for(const key of ['vteDate','anticoagulationStart','procedureDate']) if(!dateOnly(input[key]))missing.push(key);
  if(input.adult!==true) (input.adult===false?excluded:missing).push('adult');
  if(input.otherAntithrombotics!==false) (input.otherAntithrombotics===true?excluded:missing).push('otherAntithrombotics');
  if(input.treatmentContinuous!==true) (input.treatmentContinuous===false?excluded:missing).push('treatmentContinuous');
  if(!['DVT_LOWER_LIMB','PE'].includes(input.vteType))missing.push('vteType');
  if(!['high-risk-polypectomy-ge1cm','diagnostic-with-or-without-biopsy'].includes(input.procedure))missing.push('procedure');
  if(typeof input.safeToDefer!=='boolean')missing.push('safeToDefer');
  if(!med||!p.medicationIds.includes(input.medicationId)||input.formulation!==med.formulation)excluded.push('identity/formulation');
  if(input.conditions&&Object.keys(input.conditions).some(k=>!conditionNames.includes(k))) throw new Error('UNKNOWN_CONDITION_FIELD');
  for(const key of conditionNames) if(input.conditions?.[key]!==false) (input.conditions?.[key]===true?excluded:missing).push(key);
  if(input.conditions?.activeBleeding===true) return {...base,status:'OUT_OF_SCOPE',reasons:['URGENT_BLEEDING_NOT_ELECTIVE_PATHWAY']};
  if(!missing.some(x=>['vteDate','anticoagulationStart','procedureDate'].includes(x))){
    if(input.vteDate>asOf||input.anticoagulationStart>asOf||input.procedureDate<asOf||input.vteDate>input.procedureDate||input.anticoagulationStart>input.procedureDate)excluded.push('invalid/future-event/elapsed-procedure');
    if(input.anticoagulationStart<input.vteDate)excluded.push('event-after-treatment-start');
  }
  const fingerprint=digest({engine:ENGINE,graph,registry,input,observations:context.observations,receipts:context.receipts,asOf,role:context.role});
  const intervals=Object.fromEntries(p.claimIds.map(id=>graph.claims.find(c=>c.id===id)).map(c=>[c.anchor,c.interval.value]));
  const boundaries=missing.some(x=>['vteDate','anticoagulationStart'].includes(x))?null:{event:calendarMonths(input.vteDate,intervals.vteDate),treatment:calendarMonths(input.anticoagulationStart,intervals.anticoagulationStart),meaning:'Calendar-month reference dates only; not procedural clearance or medication stop/restart dates.'};
  const rows=p.claimIds.map(id=>{
    const c=graph.claims.find(x=>x.id===id),s=registry.sources.find(x=>x.id===c.sourceId);
    const integrity=sourceStatus(s,context.receipts?.find(r=>r.sourceId===s.id),context.observations?.[s.id],asOf);
    const sourceAvailable=integrity==='PRIMARY_PASSAGE_CHECKED_NOT_SEMANTICALLY_VERIFIED';
    const deadline=boundaries?(c.anchor==='vteDate'?boundaries.event:boundaries.treatment):null;
    let match='INPUTS_UNRESOLVED';
    if(!missing.length&&!excluded.length){
      match=input.procedureDate<deadline?'WITHIN_RECENT_WINDOW':input.procedureDate===deadline?'EXACT_BOUNDARY_REQUIRES_INTERPRETATION':'RECENT_WINDOW_NOT_MET_NO_CLEARANCE';
      if(c.action==='CONSIDER_HIGH_RISK_DEFERRAL'&&input.procedure==='diagnostic-with-or-without-biopsy'&&match==='WITHIN_RECENT_WINDOW') match='LOW_RISK_EXCEPTION_REQUIRES_PHYSICIAN_INTERPRETATION';
      if(input.safeToDefer===false)match='DEFERRAL_NOT_ASSUMED_SAFE_COORDINATE';
    }
    return {id:c.id,claimVersion:c.version,sourceId:s.id,society:s.society,title:s.title,publication:s.publication,version:s.version,integrity,lastPassageCheck:context.receipts?.find(r=>r.sourceId===s.id)?.checkedAt??null,
      strength:s.strength,certainty:s.certainty,currency:s.currency,semanticVerification:c.verification,summary:c.summary,qualifications:c.qualifications,match,referenceDate:deadline,
      passages:s.passages.filter(x=>c.passageIds.includes(x.id)).map(x=>({...x,url:s.url+'#page='+x.page})),contextLocations:s.contextLocations.map(x=>({...x,url:s.url+'#page='+x.page})),
      researchSelectable:sourceAvailable&&!missing.length&&!excluded.length&&context.role==='physician'};
  });
  const guard=registry.sources.find(s=>s.id==='BSG-2024-ADDENDUM');
  const guardStatus=sourceStatus(guard,context.receipts?.find(r=>r.sourceId===guard?.id),context.observations?.[guard?.id],asOf);
  if(guardStatus!=='PRIMARY_PASSAGE_CHECKED_NOT_SEMANTICALLY_VERIFIED')for(const row of rows)row.researchSelectable=false;
  return {...base,fingerprint,inputs:structuredClone(input),boundaries,rows,
    status:excluded.length?'OUT_OF_SCOPE':missing.length?'INSUFFICIENT_INFORMATION':'CLINICIAN_REVIEW_REQUIRED',
    reasons:[...missing.map(x=>'MISSING:'+x),...excluded.map(x=>'OUT_OF_SCOPE:'+x),'INDEPENDENT_SOURCE_SEMANTIC_VERIFICATION_PENDING','NO_INSTITUTIONAL_PROTOCOL_ACTIVATED',...(guardStatus!=='PRIMARY_PASSAGE_CHECKED_NOT_SEMANTICALLY_VERIFIED'?['ADDENDUM_NOT_CURRENTLY_CHECKED']:[])],
    guardSources:[{id:guard.id,title:guard.title,url:guard.url+'#page=1',status:guardStatus}],
    note:context.role==='medical-assistant'?'Escalate to the treating physician; do not resolve high-risk antithrombotic management.':'Reference comparison for synthetic cases only. A source selection is not a prescription or institutional authorization.'};
}
export function selectReference(result,selection) {
  if(result.role!=='physician'||!selection||selection.fingerprint!==result.fingerprint)throw new Error('ROLE_OR_STALE_SELECTION');
  const row=result.rows.find(x=>x.id===selection.claimId);
  if(!row?.researchSelectable)throw new Error('UNVERIFIED_OR_UNSUPPORTED_REFERENCE');
  return {type:'SYNTHETIC_REFERENCE_SELECTION_NOT_CLINICAL_ORDER',engine:ENGINE,graphDigest:result.graphDigest,sourceDigest:result.sourceDigest,
    claimId:row.id,claimVersion:row.claimVersion,sourceId:row.sourceId,sourceVersion:row.version,caseFingerprint:result.fingerprint,inputs:result.inputs,
    clinicianIdentity:'SYNTHETIC_PHYSICIAN_NOT_AUTHENTICATED',patientInstructions:null,ruleActivation:false,receiptId:digest({fingerprint:result.fingerprint,claimId:row.id})};
}
export function sourceImpact(graph,changedSources,inventory=graph.medications) {
  const claims=graph.claims.filter(c=>changedSources.includes(c.sourceId));
  const pathways=graph.pathways.filter(p=>p.claimIds.some(id=>claims.some(c=>c.id===id))||p.guardSourceIds.some(s=>changedSources.includes(s)));
  const direct=new Set(pathways.flatMap(p=>p.medicationIds));
  const ingredients=new Set(graph.medications.filter(m=>direct.has(m.id)).flatMap(m=>m.ingredientIds));
  return {claims:claims.map(x=>x.id),pathways:pathways.map(x=>x.id),medications:inventory.filter(m=>m.ingredientIds.some(i=>ingredients.has(i))).map(m=>m.id).sort(),action:'REVERIFY_NOT_AUTO_ADOPT'};
}
const reasons=new Set(['UNCOVERED_SCENARIO','MISSING_INPUT','SOURCE_CHANGED','UNRESOLVED_EVIDENCE']);
export function researchRequest(graph,registry,scenarioId,reason){
  if(!reasons.has(reason))throw new Error('UNSTRUCTURED_REASON_REJECTED');
  const known=graph.scenarios.some(s=>s.id===scenarioId)?scenarioId:'unclassified';
  const scenario=graph.scenarios.find(s=>s.id===known);
  const paths=graph.pathways.filter(p=>scenario?.pathwayIds.includes(p.id));
  const claims=graph.claims.filter(c=>paths.some(p=>p.claimIds.includes(c.id)));
  const sources=registry.sources.filter(s=>claims.some(c=>c.sourceId===s.id)||paths.some(p=>p.guardSourceIds.includes(s.id)));
  const scope={contract:graph.version,variables:scenario?.variables,eligibility:scenario?.eligibility,escalation:scenario?.escalation,paths,claims,sources};
  return {id:digest({known,reason,scope,engine:ENGINE}),scenarioId:known,reason,priority:'ENGINEERING_REVIEW_QUEUE',modelCalls:0,trustPromotion:false};
}
export function aggregateGap(counters,request){
  const next=structuredClone(counters);const key=request.id;
  if(!sha(key)||!reasons.has(request.reason))throw new Error('INVALID_AGGREGATE');
  next[key]=Math.min((next[key]??0)+1,1000000);return next;
}
export function compareVersions(before,after){
  return ['claims','pathways','medications'].flatMap(kind=>[...after[kind].filter(item=>stable(item)!==stable(before[kind].find(x=>x.id===item.id))).map(item=>({kind,id:item.id,action:'REVALIDATE'})),...before[kind].filter(item=>!after[kind].some(x=>x.id===item.id)).map(item=>({kind,id:item.id,action:'REMOVAL_REQUIRES_REVALIDATION'}))]);
}

/** Adapter for PR #42 observation artifacts; no clinical-state mutation or model dispatch. */
export function reconcileObservation(graph,registry,observation){
  const current={};const changes=[];
  for(const source of registry.sources){
    const item=Object.values(observation.observations??{}).find(x=>x.url===source.url&&x.kind==='primary');
    const history=[...(observation.history??[]).flatMap(h=>h.changes??[]),...(observation.changes??[])];
    const discovery=[...new Map(history.filter(c=>c.kind==='discovery'&&c.reason==='CONTENT_CHANGED'&&c.sourceId===(item?.sourceId??source.id)).map(c=>[c.hash,c])).values()];
    current[source.id]={rawSha256:item?.hash??null,available:item?.available===true,checkedAt:item?.checkedAt??null,currencyUnresolved:discovery.length>0};
    if(!item||item.available!==true||item.hash!==source.rawSha256||discovery.length){
      const impact=sourceImpact(graph,[source.id]);
      changes.push({id:digest({source:source.id,old:source.rawSha256,new:item?.hash??null,available:item?.available===true,discovery:discovery.map(c=>c.hash),impact}),sourceId:source.id,impact,taskType:'CLINICAL_SOURCE_REVERIFICATION',automaticAdoption:false});
    }
  }
  return {current,changes,modelCalls:0,clinicalAuthorityGranted:false};
}
