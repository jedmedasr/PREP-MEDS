import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHandoff } from '../graph/handoffs.mjs';
import { digest } from '../graph/core.mjs';
const legacy=()=>({schema_version:1,task_id:'CKG-001',date:'2026-11-07',outcome:'PARTIAL',remaining_blockers:['Independent source verification']});
test('legacy CKG handoff retains blockers, original digest and date precision without rewriting the record',()=>{
  const raw=legacy(),before=structuredClone(raw),h=normalizeHandoff(raw);
  assert.deepEqual(raw,before);assert.equal(h.previous_outcome,'PARTIAL');
  assert.equal(h.legacy_source_digest,digest(raw));assert.equal(h.timestamp_precision,'day');
  assert.deepEqual(h.outstanding_blockers,raw.remaining_blockers);assert.equal(h.completion_inferred,false);assert.equal(h.next_eligible_task,null);
});
test('legacy evidence objective_status and not_delivered are accepted only as incomplete work',()=>{
  const raw={schema_version:1,task_id:'EVD-001',date:'2026-11-07',objective_status:'PARTIAL',not_delivered:['Live independent verification']};
  assert.equal(normalizeHandoff(raw).previous_task,'EVD-001');
  assert.deepEqual(normalizeHandoff(raw).outstanding_blockers,raw.not_delivered);
});
test('both legacy blocker lists are preserved without duplicate values',()=>{
  const raw=legacy();raw.not_delivered=['Independent source verification','Deployment'];
  assert.deepEqual(normalizeHandoff(raw).outstanding_blockers,['Independent source verification','Deployment']);
});
test('legacy PASS cannot become authoritative completion',()=>{
  const raw=legacy();raw.outcome='PASS';assert.throws(()=>normalizeHandoff(raw),/UNSUPPORTED_LEGACY/);
});
test('conflicting outcome fields fail closed',()=>{
  const raw=legacy();raw.objective_status='PASS';assert.throws(()=>normalizeHandoff(raw),/CONFLICTING/);
});
test('unknown legacy formats, impossible dates and invalid tasks are rejected',()=>{
  for (const change of [{schema_version:3},{date:'2026-02-30'},{task_id:'UNKNOWN'},{outcome:'complete'}])
    assert.throws(()=>normalizeHandoff({...legacy(),...change}),/UNSUPPORTED_LEGACY/);
});
test('legacy incomplete handoff cannot discard its unresolved blockers',()=>{
  for(const value of [undefined,[],[''],{}]) assert.throws(()=>normalizeHandoff({...legacy(),remaining_blockers:value}),/HANDOFF_BLOCKERS/);
});
test('canonical handoffs retain their exact original content',()=>{
  const raw={schema_version:2,previous_task:'ENG-003',previous_outcome:'PARTIAL',created_at:'2026-11-07T12:54:35.574Z',outstanding_blockers:['review']};
  const copy=normalizeHandoff(raw);assert.deepEqual(copy,raw);assert.notEqual(copy,raw);
});
test('malformed canonical fields cannot fall back to legacy parsing',()=>{
  assert.throws(()=>normalizeHandoff({...legacy(),previous_task:'CKG-001'}),/MALFORMED_HANDOFF/);
});
