// Synthetic unit fixtures exercise timing semantics, not real guideline verification.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { digest, verifyExtraction, instructionPreview } from '../clinical-evidence/core.mjs';
const envelope = JSON.parse(readFileSync(new URL('../../engineering/clinical-evidence/synthetic-bundle.json', import.meta.url), 'utf8'));
const bytes = gunzipSync(Buffer.from(envelope.data, 'base64'));
assert.equal(digest(bytes), envelope.sha256);
const bundle = JSON.parse(bytes.toString());
function fixture(fields) {
  const r = structuredClone(bundle.records[0]);
  for (const [field, change] of Object.entries(fields)) {
    const old = r.a.anchors.find(a => a.field === field).quote;
    r.source.text = r.source.text.replace(old, change.quote);
    for (const output of [r.a, r.b]) {
      output.rule[field] = structuredClone(change.value);
      output.anchors.find(a => a.field === field).quote = change.quote;
    }
  }
  r.source.textHash = digest(r.source.text);
  for (const output of [r.a, r.b]) {
    output.sourceHash = r.source.textHash;
    for (const a of output.anchors) {
      a.start = r.source.text.indexOf(a.quote); a.end = a.start + a.quote.length;
      a.location = `text-lines:${r.source.text.slice(0, a.start).split('\n').length}`;
      a.sourceHash = r.source.textHash;
    }
  }
  r.receipts.forEach((receipt, i) => { receipt.sourceHash = r.source.textHash; receipt.outputHash = digest(i === 0 ? r.a : r.b); });
  assert.equal(verifyExtraction(r.source,r.a,r.b,r.receipts,bundle.inventory).status, 'SYNTHETIC_VERIFIED');
  return r;
}
const range = () => fixture({hold:{quote:'Hold: interrupt; 2 to 4 calendar days before procedure_start',value:{action:'interrupt',min:2,max:4,unit:'calendar_days',anchor:'procedure_start'}}});
const selection = r => ({recordId:r.id,clinicianId:'SYNTHETIC-CLINICIAN',decisionId:'SYNTHETIC-TIMING-TEST'});
const run = (r, patient = bundle.patient, choices = {}) => instructionPreview([r],{...selection(r),...choices},patient,bundle.inventory,{[r.source.id]:r.source.textHash},{mode:'synthetic'});
test('valid source range never becomes an automatic shortest or longest interval',()=>{assert.throws(()=>run(range()),/CLINICIAN_INTERVAL_SELECTION_REQUIRED/);});
test('clinician-selected interval inside the source range is traceable',()=>{const out=run(range(),bundle.patient,{holdAmount:3});assert.equal(out.hold.date,'2026-11-07');assert.equal(out.selection.holdAmount,3);});
test('clinician selection cannot extrapolate outside the source range',()=>{for(const amount of [1,5,NaN,Infinity])assert.throws(()=>run(range(),bundle.patient,{holdAmount:amount}),/CLINICIAN_INTERVAL_SELECTION_REQUIRED/);});
function hours() {return fixture({hold:{quote:'Hold: interrupt; 48 hours before procedure_start',value:{action:'interrupt',min:48,max:48,unit:'hours',anchor:'procedure_start'}},resume:{quote:'Resume: interrupt; 24 hours after procedure_end',value:{action:'interrupt',min:24,max:24,unit:'hours',anchor:'procedure_end'}}});}
const timed = {...bundle.patient,procedureDate:'2026-11-02',procedureEndDate:'2026-11-02',procedureStart:'2026-11-02T08:00:00-06:00',procedureEnd:'2026-11-02T09:00:00-06:00'};
test('elapsed hours remain elapsed hours across the daylight-saving transition',()=>{const out=run(hours(),timed);assert.equal(out.hold.timestamp,'2026-10-31T14:00:00.000Z');assert.equal(out.resume.timestamp,'2026-11-03T15:00:00.000Z');assert.equal(out.hold.date,null);});
test('hour-based guidance rejects timestamps without offsets or inconsistent dates',()=>{assert.throws(()=>run(hours(),{...timed,procedureStart:'2026-11-02T08:00:00'}),/EXPLICIT_OFFSET_TIMESTAMP_REQUIRED/);assert.throws(()=>run(hours(),{...timed,procedureDate:'2026-11-03'}),/PROCEDURE_DATE_TIMESTAMP_MISMATCH/);});
test('an omitted source restart interval is not invented from the hold interval',()=>{const r=fixture({resume:{quote:'Resume: timing not specified by the synthetic source',value:{action:'not_specified',min:null,max:null,unit:'not_specified',anchor:'not_specified'}}});assert.throws(()=>run(r),/SOURCE_TIMING_NOT_SPECIFIED/);});
