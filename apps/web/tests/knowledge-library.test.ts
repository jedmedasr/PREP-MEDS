import {describe,it,expect,afterEach,vi} from 'vitest';
import graph from '../../../clinical-knowledge/catalog.json';
import {terminologyDataset} from '../lib/content';
import {buildKnowledgeView,knowledgeLibraryEnabled,exampleCase} from '../lib/knowledge-library';
import {GET,POST} from '../app/api/knowledge-library/route';
afterEach(()=>vi.unstubAllEnvs());
describe('clinical knowledge integration',()=>{
 it('references assembled canonical identities without losing ingredients',()=>{for(const m of graph.medications){const existing=terminologyDataset.medications.find(x=>x.id===m.id);expect(existing?.ingredientIds).toEqual(m.ingredientIds);}});
 it('requires two explicit environment gates',()=>{expect(knowledgeLibraryEnabled({})).toBe(false);expect(knowledgeLibraryEnabled({PREP_MEDS_CONTENT_MODE:'production',PREP_MEDS_KNOWLEDGE_MODE:'reference'})).toBe(false);expect(knowledgeLibraryEnabled({PREP_MEDS_CONTENT_MODE:'shadow',PREP_MEDS_KNOWLEDGE_MODE:'reference'})).toBe(true);});
 it('has nine specifications and no real clinical instructions',()=>{const r=buildKnowledgeView({},'2026-11-07');expect(r.catalog).toHaveLength(9);expect(r.result.patientInstructions).toBeNull();expect(r.result.role).toBe('medical-assistant');expect(r.result.routineInstructionsAllowed).toBe(false);});
 it('rejects arbitrary names, evidence flags and roles',()=>{expect(()=>buildKnowledgeView({name:'not permitted'})).toThrow();expect(()=>buildKnowledgeView({role:'admin'})).toThrow();expect(()=>buildKnowledgeView({case:{...exampleCase,sourceVerified:true}})).toThrow();});
 it('production GET and POST are hidden',async()=>{vi.stubEnv('PREP_MEDS_CONTENT_MODE','production');vi.stubEnv('PREP_MEDS_KNOWLEDGE_MODE','reference');expect((await GET()).status).toBe(404);expect((await POST(new Request('http://localhost/api/knowledge-library',{method:'POST',body:'{}'}))).status).toBe(404);});
 it('synthetic API returns a reference-only view and rejects malformed input',async()=>{vi.stubEnv('PREP_MEDS_CONTENT_MODE','shadow');vi.stubEnv('PREP_MEDS_KNOWLEDGE_MODE','reference');const r=await GET();expect(r.status).toBe(200);expect(r.headers.get('Cache-Control')).toBe('no-store');expect((await r.json()).result.modelCalls).toBe(0);expect((await POST(new Request('http://localhost/api/knowledge-library',{method:'POST',body:'{'}))).status).toBe(422);});
});
