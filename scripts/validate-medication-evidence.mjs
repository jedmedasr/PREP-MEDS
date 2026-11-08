#!/usr/bin/env node
/**
 * PREP-MEDS deterministic evidence acceptance gate (research only).
 * Usage: node scripts/validate-medication-evidence.mjs [--group ING-name] [--lane odd|even]
 * This tool never grants clinical approval or enables patient-facing guidance.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const read = p => JSON.parse(readFileSync(resolve(root,p),'utf8'));
const manifest = read('docs/medication-audit-manifest.json');
const buckets = readFileSync(resolve(root,'docs/parallel-clinical-buckets-2026-11-08.md'),'utf8');
const args = process.argv.slice(2);
const option = name => { const i=args.indexOf(name); return i<0?null:args[i+1]; };
const lane = option('--lane'), requested = option('--group');
if(lane && !['odd','even'].includes(lane)) throw Error('INVALID_LANE');
if(!Array.isArray(manifest.medications)) throw Error('INVALID_MANIFEST');
const meds = manifest.medications;
const ids = meds.map(m=>m.medicationId);
if(new Set(ids).size!==ids.length) throw Error('DUPLICATE_CANONICAL_ID');
const expected=manifest.counts?.canonicalMedications;
if(ids.length!==expected) throw Error('INVENTORY_COUNT_MISMATCH');
const assignments=new Map();
let bucket=null, owner=null;
for(const line of buckets.split(/\r?\n/)){
 const header=line.match(/^## Bucket (\d+) — (CURRENT CHAT|OTHER CHAT)/);
 if(header){bucket=Number(header[1]);owner=header[2];continue;}
 const match=line.match(/^- \`(ING-[^\`]+)\` \((\d+) canonical IDs?\)/);
 if(match && bucket!==null){
   const key=match[1];
   if(assignments.has(key)) throw Error('DUPLICATE_GROUP_ASSIGNMENT: '+key);
   assignments.set(key,{bucket,owner,expectedIds:Number(match[2])});
 }
}
const byGroup=new Map();
for(const m of meds){
 const key=m.ingredientSetKey;
 if(!key) throw Error('UNMAPPED_ID: '+m.medicationId);
 if(!byGroup.has(key)) byGroup.set(key,[]);
 byGroup.get(key).push(m.medicationId);
}
if(assignments.size!==byGroup.size) throw Error('GROUP_COUNT_MISMATCH: '+assignments.size+'/'+byGroup.size);
for(const [key,records] of byGroup){
 const a=assignments.get(key);
 if(!a) throw Error('UNASSIGNED_GROUP: '+key);
 if(a.expectedIds!==records.length) throw Error('GROUP_MAPPING_MISMATCH: '+key);
}
const groupKeys=[...byGroup.keys()].filter(key=>(!requested||requested===key)&&(!lane||((assignments.get(key).bucket%2===1)===(lane==='odd'))));
if(requested&&!groupKeys.length) throw Error('UNKNOWN_OR_UNOWNED_GROUP: '+requested);
let complete=0;
const failures=[];
for(const key of groupKeys){
 const file=resolve(root,'docs/medication-evidence/groups',key+'.json');
 if(!existsSync(file)){failures.push({group:key,missing:['evidence package']});continue;}
 const e=JSON.parse(readFileSync(file,'utf8'));
 const missing=[];
 if(e.groupId!==key) missing.push('groupId');
 if(e.formulationAdjudicated!==true) missing.push('formulation adjudication');
 if(!Array.isArray(e.mappedMedicationIds)||e.mappedMedicationIds.length!==byGroup.get(key).length||
    [...e.mappedMedicationIds].sort().join('|')!==[...byGroup.get(key)].sort().join('|')) missing.push('canonical ID inheritance');
 if(!Array.isArray(e.sources)||!e.sources.length||e.sources.some(s=>!s.url||!s.version||!s.section||!s.publicationDate)) missing.push('dated primary passage links');
 if(!Array.isArray(e.scenarios)||!e.scenarios.length) missing.push('scenario matrix');
 if(!Array.isArray(e.tests)||!e.tests.length||e.tests.some(t=>!t.commit||!t.command||t.passed!==true||!t.evidenceUrl)) missing.push('executed test evidence');
 if(!e.commitSha) missing.push('evidence commit');
 if(/apixaban|rivaroxaban|dabigatran|edoxaban|warfarin|aspirin|clopidogrel|prasugrel|ticagrelor|enoxaparin|heparin|dipyridamole|ticlopidine/.test(key)&&
 (!e.asge2016||!['COMPARED','NOT_ADDRESSED'].includes(e.asge2016.status)||!e.asge2016.section||!e.asge2016.url)) missing.push('ASGE 2016 comparator');
 if(missing.length) failures.push({group:key,missing}); else complete++;
}
const report={lane:lane??'all',inventoryIds:ids.length,provisionalGroups:byGroup.size,selectedGroups:groupKeys.length,evidenceComplete:complete,incomplete:failures.length,failures};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(failures.length)process.exitCode=1;
