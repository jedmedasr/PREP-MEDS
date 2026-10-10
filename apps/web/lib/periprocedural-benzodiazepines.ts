import { periproceduralBenzodiazepineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';
export const periproceduralBenzodiazepineIngredients: IngredientRecord[] = [
  { id: 'ING-alprazolam', canonicalName: 'Alprazolam' }, { id: 'ING-lorazepam', canonicalName: 'Lorazepam' },
  { id: 'ING-clonazepam', canonicalName: 'Clonazepam' }, { id: 'ING-diazepam', canonicalName: 'Diazepam' },
  { id: 'ING-temazepam', canonicalName: 'Temazepam' },
];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-xanax-alprazolam-immediate-release-oral-tablet': { canonicalName: 'XANAX alprazolam immediate-release oral tablet', genericName: 'alprazolam', brandNames: ['Xanax'], aliases: ['alprazolam', 'Xanax', 'alprazolam tablet', 'Xanax tablet', 'alprazolam immediate-release tablet'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-xanax-xr-alprazolam-extended-release-oral-tablet': { canonicalName: 'XANAX XR alprazolam extended-release oral tablet', genericName: 'alprazolam extended-release', brandNames: ['Xanax XR'], aliases: ['alprazolam', 'Xanax XR', 'alprazolam XR', 'alprazolam ER tablet', 'alprazolam extended-release tablet'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-ativan-lorazepam-oral-tablet': { canonicalName: 'ATIVAN lorazepam oral tablet', genericName: 'lorazepam', brandNames: ['Ativan'], aliases: ['lorazepam', 'Ativan', 'lorazepam tablet', 'Ativan tablet', 'oral lorazepam'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-ativan-lorazepam-intramuscular-intravenous-injection': { canonicalName: 'ATIVAN lorazepam intramuscular/intravenous injection', genericName: 'lorazepam injection', brandNames: ['Ativan Injection'], aliases: ['lorazepam', 'Ativan injection', 'lorazepam injection', 'lorazepam IV', 'lorazepam IM'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-klonopin-clonazepam-oral-tablet': { canonicalName: 'KLONOPIN clonazepam oral tablet', genericName: 'clonazepam', brandNames: ['Klonopin'], aliases: ['clonazepam', 'Klonopin', 'clonazepam tablet', 'Klonopin tablet'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-clonazepam-orally-disintegrating-tablet': { canonicalName: 'Clonazepam orally disintegrating tablet', genericName: 'clonazepam', aliases: ['clonazepam', 'clonazepam ODT', 'clonazepam orally disintegrating tablet', 'clonazepam disintegrating tablet', 'clonazepam wafer'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-diazepam-intramuscular-intravenous-injection': { canonicalName: 'Diazepam intramuscular/intravenous injection', genericName: 'diazepam injection', aliases: ['diazepam injection', 'diazepam IV', 'diazepam IM', 'injectable diazepam'], drugClassIds: ['CLS-benzodiazepine'] },
  'MED-restoril-temazepam-oral-capsule': { canonicalName: 'RESTORIL temazepam oral capsule', genericName: 'temazepam', brandNames: ['Restoril'], aliases: ['temazepam', 'Restoril', 'temazepam capsule', 'Restoril capsule'], drugClassIds: ['CLS-benzodiazepine'] },
};
export const periproceduralBenzodiazepineMedications: MedicationRecord[] = periproceduralBenzodiazepineIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
