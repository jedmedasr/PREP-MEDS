import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {terminologyDataset,activeRules} from '../lib/content';
const root=[process.cwd(),resolve(process.cwd(),'../..')].find(p=>existsSync(resolve(p,'docs/parallel-clinical-buckets-2026-11-08.md')));
if(!root)throw new Error('ALLOCATION_ROOT_MISSING');
const keys=['ING-dapagliflozin+ING-saxagliptin','ING-dulaglutide','ING-empagliflozin+ING-linagliptin','ING-empagliflozin+ING-linagliptin+ING-metformin','ING-empagliflozin+ING-metformin','ING-ertugliflozin+ING-metformin','ING-ertugliflozin+ING-sitagliptin','ING-exenatide','ING-liraglutide','ING-lixisenatide'];
type Mapping={medicationId:string;canonicalName:string;ingredientIds:string[];family:string;route:string;release:string;requiresConfirmation:boolean};
type Packet={groupId:string;mappedMedicationIds:string[];mappings:Mapping[];clinicalApproval:boolean;patientFacingAuthorized:boolean};
const packets=keys.map(k=>JSON.parse(readFileSync(resolve(root,'docs/medication-evidence/groups',k+'.json'),'utf8')) as Packet);
describe('Bucket04 exact mapping into the existing assembled terminology',()=>{
 for(const p of packets){
  it(p.groupId+' exact membership and original canonical names/ingredients',()=>{const actual=terminologyDataset.medications.filter(m=>m.ingredientIds.slice().sort().join('+')===p.groupId);expect(p.mappedMedicationIds.slice().sort()).toEqual(actual.map(m=>m.id).sort());for(const a of actual){const m=p.mappings.find(x=>x.medicationId===a.id);expect(m?.canonicalName).toBe(a.canonicalName);expect(m?.ingredientIds.slice().sort()).toEqual(a.ingredientIds.slice().sort());}});
  it(p.groupId+' rejects foreign combinations and does not edit aliases or approve evidence',()=>{for(const m of terminologyDataset.medications.filter(m=>m.ingredientIds.slice().sort().join('+')!==p.groupId))expect(p.mappedMedicationIds.includes(m.id)).toBe(false);expect(p.clinicalApproval).toBe(false);expect(p.patientFacingAuthorized).toBe(false);});
 }
 it('21IDs not21 completed ingredientgroups',()=>{expect(packets).toHaveLength(10);const ids=packets.flatMap(p=>p.mappedMedicationIds);expect(ids).toHaveLength(21);expect(new Set(ids).size).toBe(21);});
 it('release and regimen distinctions survive mapping',()=>{const rows=packets.flatMap(p=>p.mappings);expect(rows.find(m=>m.medicationId==='MED-empagliflozin-metformin-synjardy-xr')?.release).toBe('extended');expect(rows.find(m=>m.medicationId==='MED-exenatide-bydureon-bcise')?.family).toBe('weekly-glp');expect(rows.find(m=>m.medicationId==='MED-exenatide-byetta')?.family).toBe('daily-glp');expect(rows.find(m=>m.medicationId==='MED-exenatide')?.requiresConfirmation).toBe(true);});
 it('existing ACTIVE rules are not populated by research evidence',()=>expect(activeRules).toEqual([]));
});
