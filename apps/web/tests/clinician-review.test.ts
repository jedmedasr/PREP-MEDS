import {describe,it,expect,vi,afterEach} from 'vitest';
import {NextRequest} from 'next/server';
import catalog from '../../../clinical-content/clinician-review/catalog.json';
import {terminologyDataset,activeRules} from '../lib/content';
import {validateCatalog,canonicalReviewMap,appendReview,materialHash,type Catalog,type Group,type ReviewRequest} from '../../../scripts/clinician-review/core.mjs';
import {GET,POST} from '../app/api/clinical-review/route';
import {effectiveGroupReview,effectiveCanonicalMap} from '../lib/clinician-group-review';
describe('clinician evidence review separation',()=>{
 afterEach(()=>vi.unstubAllEnvs());
 it('validates group mappings against assembled real canonical identity, not an invented list',()=>{
  expect(validateCatalog(catalog,terminologyDataset.medications)).toEqual([]);
  const mapping=canonicalReviewMap(catalog as Catalog,terminologyDataset.medications,{schemaVersion:1,events:[]});
  expect(Object.keys(mapping).sort()).toEqual(terminologyDataset.medications.map(m=>m.id).sort());
  expect(activeRules).toEqual([]);
 });
 it('leaves incomplete source-agent extraction DRAFT with six separately linked sources',()=>{
  expect(catalog.groups[0]?.package.state).toBe('DRAFT');expect(catalog.groups[0]?.package.recommendations).toHaveLength(6);
  expect(catalog.groups[0]?.package.unresolved.length).toBeGreaterThan(0);
 });
 it('feature disabled GET returns 404 without authenticating or loading a ledger',async()=>{
  vi.stubEnv('PREP_MEDS_CLINICIAN_REVIEW','');
  expect((await GET(new NextRequest('https://example.invalid/api/clinical-review'))).status).toBe(404);
 });
 it('client reviewer and approval flags cannot activate an unconfigured feature',async()=>{
  vi.stubEnv('PREP_MEDS_CLINICIAN_REVIEW','');
  const r=await POST(new NextRequest('https://example.invalid/api/clinical-review',{method:'POST',body:JSON.stringify({reviewer:'admin',approved:true})}));
  expect(r.status).toBe(404);expect((await r.json()).patientFacingAuthorized).toBe(false);expect(activeRules).toEqual([]);
 });
});

describe('reuse of dedicated evidence-agent review gate',()=>{
 function ready(){
  const c=structuredClone(catalog) as Catalog;const g=c.groups[0] as Group;
  g.id='synthetic-only-group';g.label='SYNTHETIC TEST ONLY';g.package.revision='synthetic-ready-1';g.package.state='READY_FOR_CLINICIAN_REVIEW';g.package.unresolved=[];g.package.testEvidence=['synthetic-only-test'];
  for(const r of g.package.recommendations){r.source.passage='Fictional test passage';r.source.deepLink='https://example.invalid/synthetic#passage';r.source.url='https://example.invalid/synthetic';}
  const request:ReviewRequest={groupId:g.id,action:'MARK_REVIEWED',expectedRevision:g.package.revision,expectedMaterialHash:materialHash(g,g.package),requestId:'synthetic-agent-gate-001',attestation:true,notes:'Synthetic test; no actual clinical approval'};
  const result=appendReview(c,terminologyDataset.medications,{schemaVersion:1,events:[]},{id:42,login:'synthetic-clinician',type:'User'},['42'],request,'synthetic-key-not-for-deployment-000000000');
  return {c,g,ledger:result.ledger};
 }
 it('requires the exact signed group/source/mapping and never authorizes instructions',()=>{
  const {c,g,ledger}=ready();expect(effectiveGroupReview(g,ledger).state).toBe('CLINICALLY_REVIEWED');
  const map=effectiveCanonicalMap(c,terminologyDataset.medications,ledger);expect(map['MED-apixaban']?.groups[0]?.state).toBe('CLINICALLY_REVIEWED');expect(map['MED-apixaban']?.patientFacingAuthorized).toBe(false);
  g.package.recommendations[0]!.renal='changed';expect(effectiveGroupReview(g,ledger).state).toBe('REVIEW_INVALIDATED');
 });
 it('does not treat the source-agent predicate alone as authenticated clinical authority',()=>{
  const {g}=ready();expect(effectiveGroupReview(g,{schemaVersion:1,events:[]}).state).toBe('READY_FOR_CLINICIAN_REVIEW');
 });
});
