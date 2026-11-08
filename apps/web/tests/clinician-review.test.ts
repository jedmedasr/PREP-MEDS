import {describe,it,expect,vi,afterEach} from 'vitest';
import {NextRequest} from 'next/server';
import catalog from '../../../clinical-content/clinician-review/catalog.json';
import {terminologyDataset,activeRules} from '../lib/content';
import {validateCatalog,canonicalReviewMap,type Catalog} from '../../../scripts/clinician-review/core.mjs';
import {GET,POST} from '../app/api/clinical-review/route';
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
