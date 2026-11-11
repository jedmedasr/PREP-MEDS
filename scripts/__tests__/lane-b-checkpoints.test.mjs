import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadEvidence,evidenceHash,stable,GROUPS} from '../lane-b/evidence.mjs';
const data=loadEvidence();
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const receipt=read('docs/medication-evidence/lane-b/receipts/42534346780.json');
const audit=read('docs/medication-evidence/lane-b/audit-manifest.json');
function valid(pkg,checkpoint,run){
 const row=run.groups.find(r=>r.groupId===pkg.groupId);
 return Boolean(row&&checkpoint.groupId===pkg.groupId&&checkpoint.lane==='B'&&checkpoint.bucket===2&&
 checkpoint.status==='READY_FOR_CLINICIAN_REVIEW'&&pkg.status===checkpoint.status&&
 checkpoint.evidenceCommit===run.headSha&&pkg.commitSha===run.headSha&&
 checkpoint.evidenceHash===evidenceHash(pkg,data.reference)&&row.evidenceHash===checkpoint.evidenceHash&&
 stable(checkpoint.canonicalIds)===stable(pkg.mappedMedicationIds)&&stable(row.canonicalIds)===stable(pkg.mappedMedicationIds)&&
 run.tests.node.passed===115&&run.tests.node.failed===0&&run.tests.mapping.passed===22&&run.tests.mapping.failed===0&&
 pkg.tests.length===2&&pkg.tests.every(t=>t.passed===true&&t.commit===run.headSha&&t.evidenceUrl.endsWith('/'+run.runId))&&
 pkg.clinicalApproval===false&&pkg.patientFacingAuthorized===false&&checkpoint.clinicalApproval===false&&checkpoint.patientFacingAuthorized===false);
}
for(const p of data.packages)test(`${p.groupId}: READY is tied to exact executed source, not green-CI alone`,()=>{
 const cp=read(`docs/medication-evidence/lane-b/checkpoints/${p.groupId}.json`);
 assert.equal(valid(p,cp,receipt),true);
 const record=audit.records.find(r=>r.groupId===p.groupId);
 assert.equal(record.evidenceHash,cp.evidenceHash);assert.match(record.checkpointCommit,/^[a-f0-9]{40}$/);
});
const p=data.packages[0],cp=read(`docs/medication-evidence/lane-b/checkpoints/${p.groupId}.json`);
test('changed clinical evidence cannot reuse prior test receipt',()=>{const x=structuredClone(p);x.formulationAssessment.push('changed');assert.equal(valid(x,cp,receipt),false);});
test('foreign mapping or lane cannot use another group checkpoint',()=>{assert.equal(valid(p,{...cp,canonicalIds:['MED-apixaban']},receipt),false);assert.equal(valid(p,{...cp,lane:'A'},receipt),false);});
test('failed tests or fabricated clinical approval cannot produce completion',()=>{const run=structuredClone(receipt);run.tests.node.failed=1;assert.equal(valid(p,cp,run),false);assert.equal(valid({...p,clinicalApproval:true},cp,receipt),false);});
test('audit is an exact completion receipt index, not a second allocation or alias count',()=>{
 assert.deepEqual(audit.records.map(r=>r.groupId),GROUPS);assert.equal(audit.evidenceCompleteGroups,10);assert.equal(audit.canonicalIdsTested,34);assert.equal(new Set(audit.records.flatMap(r=>r.canonicalIds)).size,34);assert.equal(audit.assignedProvisionalGroups,113);assert.equal(audit.nextBucket,4);assert.equal(audit.patientFacingAuthorized,false);
});
