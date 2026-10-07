import { periproceduralTcaBupropionIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralTcaBupropionIngredients: IngredientRecord[] = [
  { id: 'ING-amitriptyline-hydrochloride', canonicalName: 'Amitriptyline hydrochloride' },
  { id: 'ING-nortriptyline-hydrochloride', canonicalName: 'Nortriptyline hydrochloride' },
  { id: 'ING-imipramine-hydrochloride', canonicalName: 'Imipramine hydrochloride' },
  { id: 'ING-clomipramine-hydrochloride', canonicalName: 'Clomipramine hydrochloride' },
  { id: 'ING-bupropion-hydrochloride', canonicalName: 'Bupropion hydrochloride' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-amitriptyline-hydrochloride-oral-tablet': { canonicalName: 'Amitriptyline hydrochloride oral tablet', genericName: 'amitriptyline', aliases: ['amitriptyline tablet', 'Elavil tablet'], drugClassIds: ['CLS-tricyclic-antidepressant'] },
  'MED-nortriptyline-hydrochloride-oral-capsule': { canonicalName: 'Nortriptyline hydrochloride oral capsule', genericName: 'nortriptyline', aliases: ['nortriptyline capsule', 'Pamelor capsule'], drugClassIds: ['CLS-tricyclic-antidepressant'] },
  'MED-imipramine-hydrochloride-oral-tablet': { canonicalName: 'Imipramine hydrochloride oral tablet', genericName: 'imipramine', aliases: ['imipramine tablet', 'Tofranil tablet'], drugClassIds: ['CLS-tricyclic-antidepressant'] },
  'MED-clomipramine-hydrochloride-oral-capsule': { canonicalName: 'Clomipramine hydrochloride oral capsule', genericName: 'clomipramine', aliases: ['clomipramine capsule', 'Anafranil capsule'], drugClassIds: ['CLS-tricyclic-antidepressant'] },
  'MED-bupropion-hydrochloride-immediate-release-oral-tablet': { canonicalName: 'Bupropion hydrochloride immediate-release oral tablet', genericName: 'bupropion', aliases: ['bupropion IR', 'bupropion immediate release', 'Wellbutrin IR'], drugClassIds: ['CLS-aminoketone-antidepressant'] },
  'MED-wellbutrin-sr-bupropion-hydrochloride-sustained-release-oral-tablet': { canonicalName: 'WELLBUTRIN SR bupropion hydrochloride sustained-release oral tablet', genericName: 'bupropion', brandNames: ['Wellbutrin SR'], aliases: ['bupropion SR', 'bupropion sustained release'], drugClassIds: ['CLS-aminoketone-antidepressant'] },
  'MED-bupropion-hydrochloride-xl-extended-release-oral-tablet': { canonicalName: 'Bupropion hydrochloride XL extended-release oral tablet', genericName: 'bupropion', brandNames: ['Wellbutrin XL'], aliases: ['bupropion XL', 'bupropion extended release', 'Wellbutrin XL'], drugClassIds: ['CLS-aminoketone-antidepressant'] },
};

export const periproceduralTcaBupropionMedications: MedicationRecord[] = periproceduralTcaBupropionIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
