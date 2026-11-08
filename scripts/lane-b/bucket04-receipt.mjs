import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {corpus04,clinicalHash,validate04,GROUPS04} from './bucket04.mjs';
const dir=process.env.B04_OUTPUT;if(!dir)throw Error('B04_OUTPUT_REQUIRED');
const data=corpus04();const errors=validate04(data);if(errors.length)throw Error(JSON.stringify(errors));
const tap=readFileSync(resolve(dir,'node.tap'),'utf8'),mapping=JSON.parse(readFileSync(resolve(dir,'mapping.json'),'utf8'));
const count=key=>Number(tap.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
if(count('pass')<100||count('fail')!==0||count('skipped')!==0||mapping.numPassedTests!==23||mapping.numFailedTests!==0)throw Error('TEST_RECEIPT_FAILURE');
const head=process.env.B04_HEAD_SHA,checkout=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();if(!/^[a-f0-9]{40}$/.test(head??''))throw Error('HEAD_SHA_REQUIRED');
const report={schemaVersion:1,lane:'B',bucket:4,headSha:head,checkoutSha:checkout,runId:process.env.GITHUB_RUN_ID,recordedAt:new Date().toISOString(),tests:{node:{passed:count('pass'),failed:count('fail'),skipped:count('skipped')},mapping:{passed:mapping.numPassedTests,failed:mapping.numFailedTests}},groups:data.packages.map(p=>({groupId:p.groupId,canonicalIds:p.mappedMedicationIds,evidenceHash:clinicalHash(p,data.reference)})),clinicalApproval:false,patientFacingAuthorized:false};
for(const p of data.packages)if(p.status==='READY_FOR_CLINICIAN_REVIEW'){
 const oldRef=JSON.parse(execFileSync('git',['show',`${p.commitSha}:docs/medication-evidence/lane-b/bucket04-reference.json`],{encoding:'utf8'}));
 const old=JSON.parse(execFileSync('git',['show',`${p.commitSha}:docs/medication-evidence/groups/${p.groupId}.json`],{encoding:'utf8'}));
 if(clinicalHash(old,oldRef)!==clinicalHash(p,data.reference))throw Error('STALE_CLINICAL_RECEIPT');
 execFileSync('node',['scripts/validate-medication-evidence.mjs','--group',p.groupId,'--lane','even'],{stdio:'inherit'});
}
mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,'receipt.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
