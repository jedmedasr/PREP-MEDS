export interface InventoryItem { id:string; ingredientIds:string[] }
export interface Source { publisher:string; title:string; version:string; publication:string; url:string; locator:string; deepLink:string|null; deepLinkUnavailableReason:string|null; passage:string; footnotes:string; sourceRevision:string; accessLimitations:string[] }
export interface Recommendation { id:string; source:Source; scenario:string; interruption:string; resumption:string; renal:string; exceptions:string; bridging:string; strength:string; certainty:string; conflictsWith:string[] }
export interface EvidencePackage { id:string; revision:string; state:'DRAFT'|'READY_FOR_CLINICIAN_REVIEW'; provenance:{sourceCommit:string;extractedBy:string}; recommendations:Recommendation[]; conflicts:string[]; unresolved:string[]; testEvidence:string[]; displayTitle?:string; editorialNotes?:string }
export interface Group { id:string; label:string; ingredientIds:string[]; formulation:{route:string;doseForm:string;release:string;chemicalForm:string;device:string;regimen:string}; mappingRevision:string; canonicalIds:string[]; mappingBasis:Record<string,string>; package:EvidencePackage }
export interface Catalog { schemaVersion:1; policyVersion:string; groups:Group[]; unmappedReason?:string }
export interface Actor { id:number; login:string; type:string }
export interface ReviewRequest { action:'MARK_REVIEWED'|'REQUEST_CHANGES'|'REVOKE'; groupId:string; expectedMaterialHash:string; expectedRevision:string; requestId:string; attestation:boolean; notes:string }
export interface AuditEvent { eventId:string; signature:string; groupId:string; action:ReviewRequest['action']; actor:Actor; reviewedAt:string; evidenceRevision:string; materialHash:string; groupSnapshot:Group; canonicalIds:string[]; notes:string; previousEvent:string|null; patientFacingAuthorized:false; modifications:unknown[] }
export interface Ledger {schemaVersion:1; events:AuditEvent[]}
export interface ReviewStatus { state:string; event:AuditEvent|null; materialHash:string; patientFacingAuthorized:false }
export const POLICY_VERSION:string;
export function stable(value:unknown):string;
export function digest(value:unknown):string;
export function groupKey(group:Group):string;
export function materialHash(group:Group,packet:EvidencePackage):string;
export function validateCatalog(catalog:unknown,inventory:InventoryItem[]):string[];
export function assertCatalog(catalog:unknown,inventory:InventoryItem[]):asserts catalog is Catalog;
export function validateLedger(ledger:unknown,key:string):Ledger;
export function reviewStatus(group:Group,ledger:Ledger):ReviewStatus;
export function actorAuthorized(actor:Actor,allowedIds:string[]):boolean;
export interface CanonicalReview { state:string; groups:(ReviewStatus & {groupId:string;formulation:Group['formulation']})[]; requiresFormulationConfirmation:true; patientFacingAuthorized:false }
export function canonicalReviewMap(catalog:Catalog,inventory:InventoryItem[],ledger:Ledger):Record<string,CanonicalReview>;
export function appendReview(catalog:Catalog,inventory:InventoryItem[],ledger:Ledger,actor:Actor,allowedIds:string[],request:ReviewRequest,key:string,now?:string):{ledger:Ledger;event:AuditEvent;resumed:boolean};
