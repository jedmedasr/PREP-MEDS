import test from 'node:test';
import assert from 'node:assert/strict';
import { exactUnion, requirePreserved, taskUnion } from '../verify-integration.mjs';

test('identical shared evidence is deduplicated without losing failures', () => {
  const failed={id:'EV-1',result:'failed'}, passed={id:'EV-2',result:'verified'};
  const result=exactUnion([[failed],[failed,passed]]);
  assert.equal(result.size,2); assert.equal(result.get('EV-1').result,'failed');
});
test('same ID with different content never silently replaces historical evidence', () => {
  assert.throws(()=>exactUnion([[{id:'EV-1',result:'failed'}],[{id:'EV-1',result:'verified'}]]),/CONFLICTING_RECORD/);
});
test('duplicate IDs inside one source are rejected even when values match', () => {
  assert.throws(()=>exactUnion([[{id:'EV-1'},{id:'EV-1'}]]),/DUPLICATE_ID/);
});
test('missing or rewritten records fail preservation', () => {
  const expected=exactUnion([[{id:'EV-1',value:1}]]);
  assert.throws(()=>requirePreserved(expected,[]),/DROPPED_OR_REWRITTEN/);
  assert.throws(()=>requirePreserved(expected,[{id:'EV-1',value:2}]),/DROPPED_OR_REWRITTEN/);
});
test('explicit task owner retains the reconciled review state', () => {
  const a={pr:40,tasks:[{id:'SPR-001',status:'needs_review'}]}, b={pr:43,tasks:[{id:'SPR-001',status:'not_started'},{id:'CKG-001',status:'needs_review'}]};
  const result=taskUnion([a,b],{'SPR-001':40});
  assert.equal(result.size,2);assert.equal(result.get('SPR-001').status,'needs_review');
});
test('unresolved task conflicts cannot invent completion', () => {
  assert.throws(()=>taskUnion([{pr:40,tasks:[{id:'SPR-001',status:'needs_review'}]},{pr:41,tasks:[{id:'SPR-001',status:'complete'}]}],{}),/UNRESOLVED_TASK_CONFLICT/);
});
test('a missing task and a nonexistent resolution owner fail closed', () => {
  assert.throws(()=>requirePreserved(new Map([['ENG-003',{id:'ENG-003'}]]),[]),/DROPPED_OR_REWRITTEN/);
  assert.throws(()=>taskUnion([{pr:40,tasks:[{id:'SPR-001'}]}],{'SPR-001':99}),/UNKNOWN_TASK_RESOLUTION/);
});
