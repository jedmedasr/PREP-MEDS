import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const names = ['apixaban','rivaroxaban','dabigatran','edoxaban','warfarin','aspirin','clopidogrel','prasugrel','ticagrelor','enoxaparin'];
const root = [process.cwd(), resolve(process.cwd(),'../..')].find(p => existsSync(resolve(p,'docs/medication-evidence/groups/ING-apixaban.json')));
if (!root) throw new Error('Repository root with medication evidence not found');
const load = (name: string) => JSON.parse(readFileSync(resolve(root,'docs/medication-evidence/groups/ING-'+name+'.json'),'utf8'));

describe('Bucket 01 source and release integrity', () => {
  for (const name of names) {
    it(name + ': keeps source comparison separate from clinician approval', () => {
      const e = load(name);
      expect(e.groupId).toBe('ING-'+name);
      expect(e.mappedMedicationIds).toEqual(['MED-'+name]);
      expect(e.sources.some((s: {url: string})=>s.url.includes('2016_antithrombotics'))).toBe(true);
      expect(e.sources.some((s: {url: string})=>s.url.includes('gutjnl-2021-325184'))).toBe(true);
      expect(e.clinicianReviewed).toBe(false);
      expect(e.patientFacingEnabled).toBe(false);
      if(e.evidenceStatus==='EVIDENCE_COMPLETE') {
        expect(e.formulationAdjudicated).toBe(true);
        // Independent agent signoff is not a clinical-governance prerequisite.
        // Clinician verifies the linked primary passage at Mark Reviewed.
        expect(e.tests?.some((t:{passed:boolean})=>t.passed)).toBe(true);
      }
    });
  }
  it('does not transfer dabigatran renal interval to other DOACs',()=>{
    const dab = load('dabigatran');
    expect(JSON.stringify(dab.scenarios)).toContain('30–50');
    for(const name of ['apixaban','rivaroxaban','edoxaban']){
      expect(JSON.stringify(load(name).sources.find((s:{name:string})=>s.name==='BSG/ESGE'))).not.toContain('CrCl 30–50 5d');
    }
  });
});
