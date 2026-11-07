import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluate,selectReference,reconcileObservation,validateKnowledge} from './core.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const graph=read('clinical-knowledge/catalog.json'),registry=read('clinical-knowledge/source-register.json'),receipts=read('clinical-knowledge/verification-receipts.json');
const command=process.argv[2]??'status';
let report;
if(command==='impact'){
 if(!process.argv[3])throw new Error('PR42_OBSERVATION_FILE_REQUIRED');
 report=reconcileObservation(graph,registry,read(process.argv[3]));
}else if(command==='demo'){
 const input=read('clinical-knowledge/examples/recent-vte.json');
 const observations=Object.fromEntries(receipts.sources.map(s=>[s.sourceId,{rawSha256:s.rawSha256,available:true}]));
 const result=evaluate(graph,registry,input,{mode:'synthetic-research',role:'physician',asOf:'2026-11-07',receipts:receipts.sources,observations});
 // Explicit test-fixture choice, never a default clinical recommendation.
 const selected=result.rows.find(r=>r.id==='CKG-BSG-VTE'&&r.researchSelectable);
 report={testFixtureAsOf:'2026-11-07',notice:'Real primary documents, synthetic case, no independent clinical semantic verification or patient instructions.',result,selection:selected?selectReference(result,{claimId:selected.id,fingerprint:result.fingerprint}):null};
 if(!selected||result.rows.some(r=>!r.researchSelectable))process.exitCode=2;
}else if(command==='status'){
 report={errors:validateKnowledge(graph,registry),scenarios:graph.scenarios.length,referencePathways:graph.pathways.length,clinicallyVerifiedPathways:0,modelCalls:0};
 if(report.errors.length)process.exitCode=1;
}else throw new Error('UNKNOWN_READ_ONLY_COMMAND');
const outputIndex=process.argv.indexOf('--output');
if(outputIndex>=0){const target=resolve(process.argv[outputIndex+1]);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify(report,null,2));
