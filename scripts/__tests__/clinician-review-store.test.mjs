import test from 'node:test';import assert from 'node:assert/strict';
import {ReviewStore,AUDIT_BRANCH,AUDIT_PATH,CATALOG_PATH} from '../clinician-review/store.mjs';
import {materialHash,POLICY_VERSION} from '../clinician-review/core.mjs';
const main='a'.repeat(40),tree='b'.repeat(40),commit='c'.repeat(40),actor={id:42,type:'User',login:'synthetic-clinician'},key='test-audit-key-'.repeat(5);
const inventory=[{id:'SYN-ONE',ingredientIds:['ING-SYN']}];
function fixture(){return {schemaVersion:1,policyVersion:POLICY_VERSION,groups:[{id:'test-group',label:'Fictional fixture only',ingredientIds:['ING-SYN'],formulation:{route:'oral',doseForm:'tablet',release:'immediate',chemicalForm:'fixture',device:'none',regimen:'fixture'},mappingRevision:'1',canonicalIds:['SYN-ONE'],mappingBasis:{'SYN-ONE':'synthetic mapping'},package:{id:'fixture',revision:'1',state:'READY_FOR_CLINICIAN_REVIEW',provenance:{sourceCommit:'https://example.invalid/commit',extractedBy:'fixture'},recommendations:[{id:'fixture-rec',source:{publisher:'Synthetic',title:'Fictional',version:'1',publication:'2026',url:'https://example.invalid/source',locator:'Section 1',deepLink:'https://example.invalid/source#one',deepLinkUnavailableReason:null,passage:'Fixture passage',footnotes:'Fixture notes',sourceRevision:'fixture-1',accessLimitations:[]},scenario:'fixture',interruption:'fixture',resumption:'not specified',renal:'fixture',exceptions:'fixture',bridging:'not specified',strength:'not graded',certainty:'not graded',conflictsWith:[]}],conflicts:[],unresolved:[],testEvidence:['fixture-positive-and-negative']}}]};}
function server({conflict=false,changeBefore=false,changeAfter=false}={}){
 const catalog=fixture();let head=null,ledger={schemaVersion:1,events:[]},pending=null,reads=0;const writes=[];
 const fetchImpl=async(url,options)=>{
  const path=new URL(url).pathname,body=options.body?JSON.parse(options.body):null;
  if(options.method!=='GET'){writes.push({path,body});
   if(path.endsWith('/git/trees')){assert.equal(body.tree[0].path,AUDIT_PATH);pending=JSON.parse(body.tree[0].content);return Response.json({sha:tree});}
   if(path.endsWith('/git/commits'))return Response.json({sha:commit});
   if(path.includes('/git/refs')){assert.ok(path.endsWith('/git/refs')?body.ref==='refs/heads/'+AUDIT_BRANCH:path.endsWith(AUDIT_BRANCH));assert.notEqual(body.force,true);
    if(conflict)return Response.json({message:'conflict'},{status:422});head=commit;ledger=pending;return Response.json({object:{sha:head}});}
   throw new Error('Unexpected mutation '+path);
  }
  if(path.endsWith('/git/ref/heads/main'))return Response.json({object:{sha:main}});
  if(path.endsWith('/git/ref/heads/'+AUDIT_BRANCH))return head?Response.json({object:{sha:head}}):Response.json({},{status:404});
  if(path.endsWith('/contents/'+CATALOG_PATH)){
   reads++;const next=structuredClone(catalog);if(changeBefore&&reads>1||changeAfter&&head)next.groups[0].package.revision='2';
   return Response.json({encoding:'base64',content:Buffer.from(JSON.stringify(next)).toString('base64')});
  }
  if(path.endsWith('/contents/'+AUDIT_PATH))return Response.json({encoding:'base64',content:Buffer.from(JSON.stringify(ledger)).toString('base64')});
  if(path.includes('/git/commits/'))return Response.json({tree:{sha:tree}});
  throw new Error('Unexpected read '+path);
 };
 const store=new ReviewStore('server-only-token',key,inventory,{fetchImpl});
 const g=catalog.groups[0],request={action:'MARK_REVIEWED',groupId:g.id,expectedMaterialHash:materialHash(g,g.package),expectedRevision:'1',requestId:'fixture-request-id-123',attestation:true,notes:'Synthetic fixture only'};
 return {store,request,writes};
}
test('durable review stores exact evidence on audit branch; main and clinical activation are untouched',async()=>{
 const {store,request,writes}=server();const r=await store.review(actor,['42'],request,null);
 assert.equal(r.head,commit);assert.equal(r.effectiveState,'CLINICALLY_REVIEWED');assert.equal(r.event.patientFacingAuthorized,false);
 assert.equal(writes.length,3);assert.equal(writes.at(-1).body.ref,'refs/heads/'+AUDIT_BRANCH);
 const state=await store.read();assert.equal(state.ledger.events.length,1);assert.deepEqual(state.ledger.events[0],r.event);
 const retry=await store.review(actor,['42'],request,commit);assert.equal(retry.resumed,true);assert.equal(writes.length,3);
});
test('lost-response/retry with stale audit head cannot overwrite another review',async()=>{
 const {store,request,writes}=server();await store.review(actor,['42'],request,null);
 await assert.rejects(store.review(actor,['42'],request,null),/AUDIT_MOVED/);assert.equal(writes.length,3);
});
test('concurrent audit writer fails closed without a force update or automatic retry',async()=>{
 const {store,request,writes}=server({conflict:true});await assert.rejects(store.review(actor,['42'],request,null),/AUDIT_MOVED/);assert.equal(writes.length,3);
});
test('evidence change before append blocks review without publishing any audit event',async()=>{
 const {store,request,writes}=server({changeBefore:true});await assert.rejects(store.review(actor,['42'],request,null),/STALE_EVIDENCE/);assert.equal(writes.length,0);
});
test('source race after append retains history but returns invalidated, never approval of new revision',async()=>{
 const {store,request}=server({changeAfter:true});const r=await store.review(actor,['42'],request,null);assert.equal(r.effectiveState,'REVIEW_INVALIDATED');
});
test('unavailable GitHub store never falls back to local success',async()=>{
 const store=new ReviewStore('token',key,inventory,{fetchImpl:async()=>Response.json({},{status:403})});await assert.rejects(store.read(),/GITHUB_HTTP_403/);
});
