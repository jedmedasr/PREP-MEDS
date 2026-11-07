import { describe, expect, it, afterEach, vi } from 'vitest';
import { buildLabView, evidenceLabEnabled } from '../lib/evidence-lab';
import { GET, POST } from '../app/api/evidence-lab/route';
afterEach(()=>vi.unstubAllEnvs());
describe('source verification synthetic lab isolation',()=>{
  it('requires both explicit shadow mode and the synthetic lab switch',()=>{
    expect(evidenceLabEnabled({})).toBe(false);
    expect(evidenceLabEnabled({PREP_MEDS_CONTENT_MODE:'production',PREP_MEDS_EVIDENCE_LAB:'synthetic'})).toBe(false);
    expect(evidenceLabEnabled({PREP_MEDS_CONTENT_MODE:'shadow'})).toBe(false);
    expect(evidenceLabEnabled({PREP_MEDS_CONTENT_MODE:'shadow',PREP_MEDS_EVIDENCE_LAB:'synthetic'})).toBe(true);
  });
  it('returns 404 for production and unset API modes',async()=>{
    for(const mode of ['', 'production']){vi.stubEnv('PREP_MEDS_CONTENT_MODE',mode);vi.stubEnv('PREP_MEDS_EVIDENCE_LAB','synthetic');expect((await GET()).status).toBe(404);expect((await POST(new Request('http://localhost/api/evidence-lab',{method:'POST',body:'{}'}))).status).toBe(404);}
  });
  it('keeps conflicting rows separate and needs explicit selection',()=>{
    const v=buildLabView();expect(v.rows).toHaveLength(2);expect(v.output).toBeUndefined();expect(v.rows.map(r=>r.rule.hold.min)).toEqual([4,2]);
    expect(buildLabView({recordId:v.rows[0]!.id}).output?.warning).toContain('SYNTHETIC');
  });
  it('blocks invalid scope and rejects real patient or caller-supplied verification',()=>{
    const id=buildLabView().rows[0]!.id;
    expect(()=>buildLabView({recordId:id,renalMetric:'eGFR'})).toThrow();
    expect(()=>buildLabView({recordId:id,renalValue:60})).toThrow();
    expect(()=>buildLabView({patientName:'Example'})).toThrow('SYNTHETIC_FIELDS_ONLY');
    expect(()=>buildLabView({verified:true})).toThrow('SYNTHETIC_FIELDS_ONLY');
  });
});
