import test from 'node:test';
import assert from 'node:assert/strict';
import {appendReview,materialHash,POLICY_VERSION} from '../clinician-review/core.mjs';
import {ReviewStore} from '../clinician-review/store.mjs';
const key='synthetic-key-not-for-deployment-000000000',actor={id:42,login:'synthetic-clinician',type:'User'};
const inventory=[{id:'SYN-A',ingredientIds:['ING-A']},{id:'SYN-B',ingredientIds:['ING-A']}];
function fixture(){const group={id:'synthetic-group',label:'SYNTHETIC TEST ONLY',ingredientIds:['ING-A'],formulation:{route:'oral',doseForm:'tablet',release:'immediate',chemicalForm:'fixture',device:'none',regimen:'fixture'},mappingRevision:'1',canonicalIds:['SYN-A'],mappingBasis:{'SYN-A':'synthetic'},package:{id:'fixture',revision:'1',state:'READY_FOR_CLINICIAN_REVIEW',provenance:{sourceCommit:'https://example.invalid/commit',extractedBy:'fixture'},recommendations:[{id:'fixture-rec',source:{publisher:'Fictional',title:'Synthetic ONLY',version:'1',publication:'2026',url:'https://example.invalid/source',locator:'Section 1',deepLink:'https://example.invalid/source#one',deepLinkUnavailableReason:null,passage:'Synthetic passage',footnotes:'Synthetic notes',sourceRevision:'fixture-1',accessLimitations:[]},scenario:'fixture',interruption:'fixture',resumption:'not specified',renal:'fixture',exceptions:'fixture',bridging:'not specified',strength:'not graded',certainty:'not graded',conflictsWith:[]}],conflicts:[],unresolved:[],testEvidence:['synthetic-only']}};
 return {catalog:{schemaVersion:1,policyVersion:POLICY_VERSION,groups:[group]},group};}
const request=g=>({action:'MARK_REVIEWED',groupId:g.id,expectedMaterialHash:materialHash(g,g.package),expectedRevision:g.package.revision,requestId:'synthetic-request-001',attestation:true,notes:'Synthetic fixture only'});
test('group diffs are immutable and a direct material edit cannot reuse the old review revision',()=>{
 const {catalog,group}=fixture();const first=appendReview(catalog,inventory,{schemaVersion:1,events:[]},actor,['42'],request(group),key);
 group.canonicalIds.push('SYN-B');group.mappingBasis['SYN-B']='explicit new synthetic mapping';
 assert.throws(()=>appendReview(catalog,inventory,first.ledger,actor,['42'],{...request(group),requestId:'synthetic-request-002'},key),/NEW_REVISION/);
 group.package.revision='2';const second=appendReview(catalog,inventory,first.ledger,actor,['42'],{...request(group),requestId:'synthetic-request-002'},key);
 assert.ok(second.event.groupModifications.some(x=>x.field==='canonicalIds'));
 assert.deepEqual(second.ledger.events[0],first.event);assert.deepEqual(first.event.groupSnapshot.canonicalIds,['SYN-A']);
});
test('source-owned review gate rejects before any durable approval write',async()=>{
 const {catalog,group}=fixture();let writes=0;const store=new ReviewStore('fixture',key,inventory,{reviewGate:()=>false});
 store.read=async()=>({catalog,sourceSha:'a'.repeat(40),head:null,ledger:{schemaVersion:1,events:[]}});
 store.request=async()=>{writes++;throw new Error('UNEXPECTED_WRITE');};
 await assert.rejects(store.review(actor,['42'],request(group),null),/SOURCE_REVIEW_GATE_REJECTED/);assert.equal(writes,0);
});
