import graph from '../../../clinical-knowledge/catalog.json';
import registry from '../../../clinical-knowledge/source-register.json';
import receipt from '../../../clinical-knowledge/verification-receipts.json';
import watchRegistry from '../../../engineering/clinical-evidence/sources.json';
import { loadRuntimeObservation } from '../../../scripts/clinical-knowledge/runtime-observation.mjs';
import { evaluate, selectReference, type CaseInput } from '../../../scripts/clinical-knowledge/core.mjs';
export function knowledgeLibraryEnabled(env:Record<string,string|undefined>=process.env):boolean {
  return env.PREP_MEDS_CONTENT_MODE==='shadow' && env.PREP_MEDS_KNOWLEDGE_MODE==='reference';
}
export const exampleCase:CaseInput={synthetic:true,scenarioId:'recent-vte',medicationId:'MED-apixaban',formulation:'oral-tablet',procedure:'high-risk-polypectomy-ge1cm',vteDate:'2026-10-01',anticoagulationStart:'2026-10-03',procedureDate:'2026-11-20',vteType:'PE',adult:true,otherAntithrombotics:false,treatmentContinuous:true,safeToDefer:true,conditions:{activeBleeding:false,priorCoronaryStent:false,mechanicalValve:false,recentStroke:false,recurrentVteOnTherapy:false,pregnant:false,severeOrUnstableRenalDisease:false}};
export function buildKnowledgeView(input:unknown={},asOf=new Date().toISOString().slice(0,10)) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('INVALID_REQUEST');
  const p=input as Record<string,unknown>;
  if(Object.keys(p).some(k=>!['case','role','selection'].includes(k)))throw new Error('SYNTHETIC_FIELDS_ONLY');
  const role=p.role??'medical-assistant';
  if(role!=='physician'&&role!=='medical-assistant')throw new Error('INVALID_RESEARCH_ROLE');
  // Request bodies cannot supply paths, source status, or verification authority.
  const runtime=loadRuntimeObservation(graph,registry,watchRegistry,{path:process.env.PREP_MEDS_KNOWLEDGE_OBSERVATIONS});
  const observations=runtime.observations;
  const result=evaluate(graph,registry,p.case??exampleCase,{mode:'synthetic-research',role,asOf,receipts:receipt.sources,observations});
  if(runtime.metadata.reason)result.reasons.push('SURVEILLANCE:'+runtime.metadata.reason);
  const decision=p.selection===undefined?null:{...selectReference(result,p.selection),surveillance:runtime.metadata};
  return {notice:'Real source documents; synthetic cases; independent semantic verification incomplete. No patient instructions.',result,decision,
    surveillance:runtime.metadata,
    catalog:graph.scenarios.map(s=>({id:s.id,title:s.title,status:s.status,priority:s.priority,frequency:s.frequency,variables:s.variables,coordination:s.coordination})),
    medications:graph.medications.map(m=>({id:m.id,formulation:m.formulation})),example:exampleCase};
}
