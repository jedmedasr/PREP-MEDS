import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {GROUPS,loadEvidence,evidenceHash} from './evidence.mjs';
const data=loadEvidence();const tap=readFileSync('lane-b-artifacts/tests.tap','utf8');
const mapping=JSON.parse(readFileSync('lane-b-artifacts/mapping-tests.json','utf8'));
const passed=Number(tap.match(/^# pass (\d+)$/m)?.[1]);const failed=Number(tap.match(/^# fail (\d+)$/m)?.[1]);
if(!(passed>=115)||failed!==0||mapping.success!==true||mapping.numFailedTests!==0||mapping.numPassedTests!==22)throw Error('TEST_RECEIPT_NOT_SUCCESS');
const report={schemaVersion:1,observedAt:new Date().toISOString(),headSha:process.env.EVIDENCE_HEAD_SHA,checkoutSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),runId:process.env.GITHUB_RUN_ID,tests:{node:{passed,failed,command:'node --test scripts/__tests__/lane-b-*.test.mjs'},mapping:{passed:mapping.numPassedTests,failed:mapping.numFailedTests,command:'pnpm --filter @prep-meds/web exec vitest run tests/lane-b-bucket02-mapping.test.ts'}},groups:data.packages.map(p=>({groupId:p.groupId,evidenceHash:evidenceHash(p,data.reference),canonicalIds:p.mappedMedicationIds})),clinicalApproval:false,patientFacingAuthorized:false};
if(!/^[a-f0-9]{40}$/.test(report.headSha??''))throw Error('MISSING_SOURCE_SHA');
for(const p of data.packages.filter(p=>p.status==='READY_FOR_CLINICIAN_REVIEW')){
 if(p.verification?.evidenceHash!==evidenceHash(p,data.reference)||!p.tests.length)throw Error('STALE_COMPLETION_RECEIPT');
 const old=JSON.parse(execFileSync('git',['show',`${p.commitSha}:docs/medication-evidence/groups/${p.groupId}.json`],{encoding:'utf8'}));
 const ref=JSON.parse(execFileSync('git',['show',`${p.commitSha}:docs/medication-evidence/lane-b/bucket02-reference.json`],{encoding:'utf8'}));
 if(evidenceHash(old,ref)!==evidenceHash(p,data.reference))throw Error('EVIDENCE_CHANGED_AFTER_TESTS');
 execFileSync(process.execPath,['scripts/validate-medication-evidence.mjs','--group',p.groupId,'--lane','even'],{stdio:'inherit'});
}
writeFileSync('lane-b-artifacts/test-receipt.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
