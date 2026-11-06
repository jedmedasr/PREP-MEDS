import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/research/route';

async function research(medicationId: string, procedureCode = 'COLONOSCOPY') {
 const request = new Request('http://localhost/api/research?medicationId='+encodeURIComponent(medicationId)+'&procedureCode='+procedureCode);
 const response = await GET(request);
 return { status: response.status, body: await response.json() as {rules:Array<{id:string;name:string;scope:{medicationIds?:string[];ingredientIds?:string[];drugClassIds?:string[]}}>;evidence:Array<{id:string;title:string;summary:string}>} };
}
describe('medication-specific clinical research', () => {
 it('shows apixaban research without metformin or sulfonylurea pathways', async () => {
   const {status,body}=await research('MED-apixaban');
   expect(status).toBe(200);
   expect(body.rules.some(r=>r.id.includes('APIXABAN'))).toBe(true);
   expect(body.rules.every(r=>!(/metformin|sulfonylurea/i).test(r.name+' '+r.id))).toBe(true);
   expect(body.evidence.length).toBeGreaterThan(0);
   expect(body.evidence.every(e=>Boolean(e.title&&e.summary))).toBe(true);
 });
 it('does not include apixaban pathways for metformin',async()=>{
   const {status,body}=await research('MED-metformin');
   expect(status).toBe(200);
   expect(body.rules.every(r=>!(/apixaban/i).test(r.name+' '+r.id))).toBe(true);
 });
 it('rejects invalid procedure and medication',async()=>{
   expect((await research('MED-apixaban','INVALID')).status).toBe(400);
   expect((await research('MED-does-not-exist')).status).toBe(404);
 });
});
