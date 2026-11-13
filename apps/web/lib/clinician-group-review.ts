import {canMarkClinicallyReviewed} from './clinical-evidence-review-gate';
import {reviewStatus,canonicalReviewMap,type Catalog,type Group,type Ledger,type ReviewStatus,type InventoryItem,type AuditEvent} from '../../../scripts/clinician-review/core.mjs';

/** Reuse the dedicated evidence agent's source/mapping contract AFTER authenticated audit validation.
 * This function does not authenticate a client-supplied review. ReviewStore validates the signed ledger first.
 */
export function sourceGateAllowsReview(group:Group,event:AuditEvent):boolean {
 const links=(g:Group)=>g.package.recommendations.map(r=>r.source.deepLink??r.source.url);
 const accepted=canMarkClinicallyReviewed({groupId:group.id,evidenceHash:reviewStatus(group,{schemaVersion:1,events:[]}).materialHash,sourceLinks:links(group),
  mappedMedicationIds:group.canonicalIds,formulationAdjudicated:group.package.state==='READY_FOR_CLINICIAN_REVIEW',
  evidenceTestsPassed:group.package.testEvidence.length>0,unresolvedBlockingIssues:group.package.unresolved},
  {groupId:event.groupId,evidenceHash:event.materialHash,reviewerId:String(event.actor.id),reviewedAt:event.reviewedAt,
   sourceLinks:links(event.groupSnapshot),mappedMedicationIds:event.canonicalIds,decision:'APPROVED'});
 return accepted;
}
export function effectiveGroupReview(group:Group,ledger:Ledger):ReviewStatus {
 const status=reviewStatus(group,ledger);
 if(status.state!=='CLINICALLY_REVIEWED'||!status.event)return status;
 return sourceGateAllowsReview(group,status.event)?status:{...status,state:'REVIEW_INVALIDATED'};
}
export function effectiveCanonicalMap(catalog:Catalog,inventory:InventoryItem[],ledger:Ledger) {
 const result=canonicalReviewMap(catalog,inventory,ledger);
 const groups=new Map(catalog.groups.map(group=>[group.id,group]));
 for(const entry of Object.values(result))entry.groups=entry.groups.map(mapped=>{
  const group=groups.get(mapped.groupId);if(!group)throw new Error('CANONICAL_MAPPING_INVALID');
  return {...mapped,...effectiveGroupReview(group,ledger)};
 });
 return result;
}
