import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POLICY_VERSION,validateCatalog,materialHash,appendReview,validateLedger,reviewStatus,canonicalReviewMap,nextExtraction,digest} from '../clinician-review/core.mjs';
import {prepareImport} from '../clinician-review/import.mjs';
const key='not-a-production-secret-'.repeat(3),now='2026-11-08T12:00:00.000Z';
const actor={id:42,login:'synthetic-clinician',type:'User'},allow=['42'];
const inventory=[{id:'SYN-A',ingredientIds:['ING-A']},{id:'SYN-BRAND',ingredientIds:['ING-A']},{id:'SYN-COMBO',ingredientIds:['ING-A','ING-B']},{id:'SYN-IR',ingredientIds:['ING-A']}];
const source={publisher:'Fictional fixture publisher',title:'Synthetic guidance ONLY',version:'1',publication:'2026',url:'https://example.invalid/fixture.pdf',locator:'Section 2; page 4',deepLink:'https://example.invalid/fixture.pdf#page=4',deepLinkUnavailableReason:null,passage:'Synthetic exact located passage.',footnotes:'Synthetic exception footnote.',sourceRevision:'fixture-hash-1',accessLimitations:[]};
export function fixture(){return {schemaVersion:1,policyVersion:POLICY_VERSION,groups:[{id:'group-a',label:'Synthetic A extended release',ingredientIds:['ING-A'],formulation:{route:'oral',doseForm:'tablet',release:'extended',chemicalForm:'base',device:'none',regimen:'synthetic-scope'},mappingRevision:'1',canonicalIds:['SYN-A','SYN-BRAND'],mappingBasis:{'SYN-A':'synthetic identity source','SYN-BRAND':'same scoped synthetic formulation'},package:{id:'packet-a',revision:'1',state:'READY_FOR_CLINICIAN_REVIEW',provenance:{sourceCommit:'https://example.invalid/source-commit',extractedBy:'synthetic evidence agent'},recommendations:[{id:'rec-a',source:{...source},scenario:'Synthetic procedure and bleeding risk',interruption:'Synthetic hold interval',resumption:'Not specified by fictional source',renal:'Synthetic metric and bounds',exceptions:'Synthetic contraindications',bridging:'Not addressed by fictional source',strength:'Not graded',certainty:'Not supplied',conflictsWith:[]}],conflicts:[],unresolved:[],testEvidence:['synthetic-case-boundary-tests']} }]};}
const empty=()=>({schemaVersion:1,events:[]});
function request(c,extra={}){return {action:'MARK_REVIEWED',groupId:'group-a',expectedMaterialHash:materialHash(c.groups[0],c.groups[0].package),expectedRevision:c.groups[0].package.revision,requestId:'synthetic-idempotency-key',attestation:true,notes:'No patient data; synthetic review only',...extra};}
function approve(c=fixture(),ledger=empty(),extra={}){return appendReview(c,inventory,ledger,actor,allow,request(c,extra),key,now);}
test('completed evidence becomes READY without a second AI or clinician and extraction advances',()=>{
 const c=fixture();assert.deepEqual(validateCatalog(c,inventory),[]);
 assert.equal(nextExtraction(c,[{groupId:'group-a',priority:1},{groupId:'next',priority:2}]).groupId,'next');
 assert.equal(reviewStatus(c.groups[0],empty()).state,'READY_FOR_CLINICIAN_REVIEW');
});
test('affirmative authenticated review binds exact versions, identity, mappings, modifications and time',()=>{
 const c=fixture(),{ledger,event}=approve(c);assert.equal(reviewStatus(c.groups[0],ledger).state,'CLINICALLY_REVIEWED');
 assert.deepEqual(event.actor,actor);assert.equal(event.reviewedAt,now);assert.equal(event.evidenceRevision,'1');assert.equal(event.sourceVersions[0].version,'1');
 assert.equal(event.modifications.some(x=>x.field==='recommendations'),true);assert.equal(event.patientFacingAuthorized,false);assert.equal(event.primarySourcesChecked,true);assert.deepEqual(validateLedger(ledger,key),ledger);
});
test('approved group propagates only to exact scoped IDs, never combinations or unrelated forms',()=>{
 const c=fixture(),map=canonicalReviewMap(c,inventory,approve(c).ledger);
 for(const id of ['SYN-A','SYN-BRAND']){assert.equal(map[id].groups[0].state,'CLINICALLY_REVIEWED');assert.equal(map[id].requiresFormulationConfirmation,true);assert.equal(map[id].patientFacingAuthorized,false);}
 for(const id of ['SYN-COMBO','SYN-IR'])assert.equal(map[id].state,'FORMULATION_MAPPING_REQUIRED');
});
test('same generic ID may have distinct formulation evidence, never unqualified drug-wide approval',()=>{
 const c=fixture();const ir=structuredClone(c.groups[0]);ir.id='a-ir';ir.formulation.release='immediate';ir.canonicalIds=['SYN-A'];ir.mappingBasis={'SYN-A':'explicit synthetic IR qualification'};c.groups.push(ir);
 assert.deepEqual(validateCatalog(c,inventory),[]);const map=canonicalReviewMap(c,inventory,approve(c).ledger);
 assert.equal(map['SYN-A'].groups.length,2);assert.equal(map['SYN-A'].groups[1].state,'READY_FOR_CLINICIAN_REVIEW');
});
for(const field of ['scenario','interruption','resumption','renal','exceptions','bridging','strength','certainty'])test(`material ${field} edit invalidates approval`,()=>{
 const c=fixture(),ledger=approve(c).ledger;c.groups[0].package.recommendations[0][field]+=' changed';
 assert.equal(reviewStatus(c.groups[0],ledger).state,'REVIEW_INVALIDATED');assert.equal(ledger.events.length,1);
});
for(const field of ['sourceRevision','version','passage','footnotes','locator','deepLink'])test(`source ${field} change invalidates review`,()=>{
 const c=fixture(),ledger=approve(c).ledger;c.groups[0].package.recommendations[0].source[field]+='-changed';
 assert.equal(reviewStatus(c.groups[0],ledger).state,'REVIEW_INVALIDATED');
});
test('display-only editorial note does not require redundant re-review',()=>{const c=fixture(),ledger=approve(c).ledger;c.groups[0].package.editorialNotes='layout only';assert.equal(reviewStatus(c.groups[0],ledger).state,'CLINICALLY_REVIEWED');});
test('canonical map additions, formulation, scope, conflicts and new evidence revision invalidate',()=>{
 for(const mutate of [c=>{c.groups[0].canonicalIds.push('SYN-IR');c.groups[0].mappingBasis['SYN-IR']='new qualifier';},c=>{c.groups[0].formulation.route='IV';},c=>c.groups[0].package.conflicts.push('different guidance'),c=>c.groups[0].package.revision='2']){
  const c=fixture(),ledger=approve(c).ledger;mutate(c);assert.equal(reviewStatus(c.groups[0],ledger).state,'REVIEW_INVALIDATED');
 }
});
test('correction and revocation are append-only, with notes; old approval never wins',()=>{
 const c=fixture(),first=approve(c);const second=approve(c,first.ledger,{action:'REQUEST_CHANGES',requestId:'second-synthetic-key',notes:'Correct the primary source table.'});
 assert.deepEqual(second.ledger.events[0],first.event);assert.equal(reviewStatus(c.groups[0],second.ledger).state,'CHANGES_REQUESTED');
 assert.throws(()=>approve(c,first.ledger,{action:'REVOKE',requestId:'third-synthetic-key',notes:''}),/CORRECTION_REASON/);
});
test('same request is idempotent and existing review does not force repetitive approval',()=>{
 const c=fixture(),first=approve(c);assert.equal(approve(c,first.ledger).resumed,true);
 assert.throws(()=>approve(c,first.ledger,{notes:'changed'}),/IDEMPOTENCY_CONFLICT/);
 assert.throws(()=>approve(c,first.ledger,{requestId:'new-key-synthetic-123'}),/ALREADY_REVIEWED/);
});
test('stale screen, forged reviewer, automation actor and absent affirmative verification fail closed',()=>{
 const c=fixture();assert.throws(()=>approve(c,empty(),{expectedMaterialHash:'a'.repeat(64)}),/STALE_EVIDENCE/);
 assert.throws(()=>approve(c,empty(),{reviewerId:'clinician'}),/UNTRUSTED/);assert.throws(()=>approve(c,empty(),{attestation:false}),/AFFIRMATIVE/);
 for(const a of [{...actor,type:'Bot'},{...actor,id:43}])assert.throws(()=>appendReview(c,inventory,empty(),a,allow,request(c),key,now),/AUTHORIZATION/);
});
test('audit tampering, reordering, duplicate events, changed timestamps and signatures rejected',()=>{
 const c=fixture(),first=approve(c),second=approve(c,first.ledger,{action:'REVOKE',requestId:'revoke-synthetic-123',notes:'withdraw'});
 for(const mutate of [l=>l.events.reverse(),l=>l.events.push(l.events[0]),l=>l.events[0].actor.id=999,l=>l.events[0].groupSnapshot.package.revision='forged',l=>l.events[0].signature='f'.repeat(64)]){
  const l=structuredClone(second.ledger);mutate(l);assert.throws(()=>validateLedger(l,key),/AUDIT_INTEGRITY/);
 }
});
for(const [name,mutate] of [
 ['unsafe group path',c=>c.groups[0].id='..'],
 ['empty test reference',c=>c.groups[0].package.testEvidence=['']],
 ['extra clinical field',c=>c.groups[0].package.recommendations[0].hiddenDose='new'],
 ['missing timing',c=>delete c.groups[0].package.recommendations[0].interruption],
 ['missing renal scope',c=>delete c.groups[0].package.recommendations[0].renal],
 ['missing source version',c=>delete c.groups[0].package.recommendations[0].source.version],
 ['unknown formulation',c=>c.groups[0].formulation.release='UNKNOWN'],
 ['incomplete combination',c=>c.groups[0].canonicalIds=['SYN-COMBO']],
 ['unknown canonical ID',c=>c.groups[0].canonicalIds=['invented']],
 ['duplicate group',c=>c.groups.push(structuredClone(c.groups[0]))],
 ['unresolved ready item',c=>c.groups[0].package.unresolved=['source inaccessible']],
 ['access failure',c=>c.groups[0].package.recommendations[0].source.accessLimitations=['403']],
 ['no scenario tests',c=>c.groups[0].package.testEvidence=[]],
 ['unsafe source URL',c=>c.groups[0].package.recommendations[0].source.deepLink='javascript:alert(1)'],
 ['unexplained generic link',c=>c.groups[0].package.recommendations[0].source.deepLink=null],
 ['dangling conflict',c=>c.groups[0].package.recommendations[0].conflictsWith=['missing']]
])test(`catalog rejects ${name}`,()=>{const c=fixture();mutate(c);assert.notEqual(validateCatalog(c,inventory).length,0);});
test('precise identifier and disclosed link limitation allow an honest fallback, never fabricated anchors',()=>{const c=fixture();c.groups[0].package.recommendations[0].source.deepLink=null;c.groups[0].package.recommendations[0].source.deepLinkUnavailableReason='Publisher does not expose stable section anchors';assert.deepEqual(validateCatalog(c,inventory),[]);});
test('material edit requires new immutable revision; a rollback cannot reuse old review revision',()=>{
 const c=fixture(),g=structuredClone(c.groups[0]);g.package.recommendations[0].interruption='changed';assert.throws(()=>prepareImport(c,g,inventory),/NEW_REVISION/);
 g.package.revision='2';assert.equal(prepareImport(c,g,inventory).changed,true);
 const newer=prepareImport(c,g,inventory).catalog;assert.throws(()=>prepareImport(newer,c.groups[0],inventory,[c.groups[0],g]),/ROLLBACK/);
});
test('DRAFT cannot be reviewed and authentic imported evidence is not fabricated as completed',()=>{
 const c=fixture();c.groups[0].package.state='DRAFT';assert.throws(()=>approve(c),/AFFIRMATIVE/);
 const actual=JSON.parse(readFileSync(new URL('../../clinical-content/clinician-review/catalog.json',import.meta.url)));
 assert.equal(actual.groups[0].package.state,'DRAFT');assert.match(actual.groups[0].package.provenance.sourceCommit,/54ba41ff/);
 assert.equal(actual.groups[0].package.recommendations.length,6);
});

test('removed group restoration requires a new revision rather than reviving an old signed approval',()=>{
 const c=fixture();assert.throws(()=>prepareImport({...c,groups:[]},c.groups[0],inventory,[c.groups[0]]),/ROLLBACK/);
});
