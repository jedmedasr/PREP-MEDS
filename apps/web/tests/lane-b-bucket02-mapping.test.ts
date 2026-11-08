import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { terminologyDataset, activeRules } from '../lib/content';
const keys=['ING-heparin','ING-aspirin+ING-dipyridamole','ING-insulin-glargine','ING-insulin-lispro','ING-insulin-aspart','ING-insulin-regular','ING-insulin-nph','ING-insulin-degludec','ING-insulin-detemir','ING-insulin-glulisine'];
type Mapping={medicationId:string;canonicalName:string;ingredientIds:string[];aliases:string[];family:string;concentrationUnitsPerMl:number|null};
type Packet={groupId:string;mappedMedicationIds:string[];mappings:Mapping[];clinicalApproval:boolean;patientFacingAuthorized:boolean};
const root=resolve(process.cwd(),'../..');
const packages=keys.map(key=>JSON.parse(readFileSync(resolve(root,'docs/medication-evidence/groups',`${key}.json`),'utf8')) as Packet);
describe('Lane B Bucket02 mapping to assembled terminology, not a regenerated inventory',()=>{
 for(const p of packages){
  it(`${p.groupId}: exact allocated membership and all existing aliases retained`,()=>{
   const original=terminologyDataset.medications.filter(m=>[...m.ingredientIds].sort().join('+')===p.groupId);
   expect([...p.mappedMedicationIds].sort()).toEqual(original.map(m=>m.id).sort());
   for(const m of original){const row=p.mappings.find(r=>r.medicationId===m.id);expect(row).toBeDefined();expect(row?.canonicalName).toBe(m.canonicalName);expect(row?.aliases).toEqual(m.aliases);expect(row?.ingredientIds.slice().sort()).toEqual(m.ingredientIds.slice().sort());}
  });
  it(`${p.groupId}: no foreign ingredient or substring-based inheritance`,()=>{
   const foreign=terminologyDataset.medications.filter(m=>[...m.ingredientIds].sort().join('+')!==p.groupId);
   expect(foreign.some(m=>p.mappedMedicationIds.includes(m.id))).toBe(false);
   expect(p.mappedMedicationIds.includes('MED-nonexistent')).toBe(false);
   expect(p.clinicalApproval).toBe(false);expect(p.patientFacingAuthorized).toBe(false);
  });
 }
 it('covers exactly34 IDs, preserving premix/concentration distinctions rather than counting aliases',()=>{
  expect(packages.flatMap(p=>p.mappedMedicationIds)).toHaveLength(34);
  const rows=packages.flatMap(p=>p.mappings);
  expect(rows.find(m=>m.medicationId==='MED-insulin-lispro-75-25')?.family).toBe('premix');
  expect(rows.find(m=>m.medicationId==='MED-insulin-aspart-70-30')?.family).toBe('premix');
  expect(rows.find(m=>m.medicationId==='MED-insulin-glargine-u300')?.concentrationUnitsPerMl).toBe(300);
  expect(rows.find(m=>m.medicationId==='MED-regular-insulin-u500')?.family).toBe('regular-u500');
  expect(rows.find(m=>m.medicationId==='MED-insulin-glargine')?.family).toBe('unspecified-insulin');
 });
 it('review packages do not activate production medication rules',()=>expect(activeRules).toEqual([]));
});
