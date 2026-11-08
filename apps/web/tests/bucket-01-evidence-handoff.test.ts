import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { terminologyDataset } from '../lib/content';

const names = ['apixaban','rivaroxaban','dabigatran','edoxaban','warfarin','aspirin','clopidogrel','prasugrel','ticagrelor','enoxaparin'] as const;
type Evidence = {
 groupId:string; mappedMedicationIds:string[]; formulationAdjudicated:boolean;
 evidenceStatus:string; clinicianReviewed:boolean; patientFacingEnabled:boolean;
 sources:Array<{name:string;url:string;section:string;extraction:string}>;
 scenarios:Array<{risk:string}>; verification:{agentA:string;agentB:string};
};
const load = (name:string):Evidence => JSON.parse(readFileSync(resolve(process.cwd(), '../../docs/medication-evidence/groups/ING-'+name+'.json'),'utf8')) as Evidence;

describe('Bucket 01 evidence handoff safety and terminology coverage',()=>{
 it('contains exactly ten distinct ingredient-set evidence records',()=>{
   expect(new Set(names).size).toBe(10);
   for(const name of names) expect(load(name).groupId).toBe('ING-'+name);
 });
 it('maps every assigned canonical ID without cross-medication inheritance',()=>{
   const mapped = new Set<string>();
   for(const name of names){
     const record=load(name);
     const expected=terminologyDataset.medications.filter(m=>m.ingredientIds.join('+')==='ING-'+name).map(m=>m.id).sort();
     expect(expected.length, name).toBeGreaterThan(0);
     expect([...record.mappedMedicationIds].sort(),name).toEqual(expected);
     for(const id of record.mappedMedicationIds){
       expect(mapped.has(id), 'duplicate '+id).toBe(false);
       mapped.add(id);
     }
   }
   expect(mapped.size).toBe(10);
 });
 it('preserves mandatory ASGE 2016 and BSG/ESGE 2021 comparisons for every group',()=>{
   for(const name of names){
     const record=load(name);
     for(const source of ['ASGE','BSG/ESGE']){
       const entry=record.sources.find(s=>s.name===source);
       expect(entry,name+' '+source).toBeDefined();
       expect(entry?.url).toMatch(/^https:\/\//);
       expect(entry?.section.trim().length).toBeGreaterThan(0);
       expect(entry?.extraction.trim().length).toBeGreaterThan(0);
     }
     expect(record.scenarios.some(s=>s.risk==='low'),name).toBe(true);
     expect(record.scenarios.some(s=>s.risk==='high'),name).toBe(true);
     expect(record.scenarios.some(s=>s.risk==='restart'),name).toBe(true);
   }
 });
 it('does not silently promote unfinished source checkpoints to completed or patient-facing rules',()=>{
   for(const name of names){
     const r=load(name);
     expect(r.formulationAdjudicated,name).toBe(false);
     expect(r.evidenceStatus,name).toBe('IN_PROGRESS');
     expect(r.clinicianReviewed,name).toBe(false);
     expect(r.patientFacingEnabled,name).toBe(false);
     expect(r.verification.agentA,name).toBe('NOT_EXECUTED');
     expect(r.verification.agentB,name).toBe('NOT_EXECUTED');
   }
 });
});
