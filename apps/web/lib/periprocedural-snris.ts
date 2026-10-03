import { periproceduralSnriIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';
export const periproceduralSnriIngredients: IngredientRecord[] = [
  { id: 'ING-venlafaxine', canonicalName: 'Venlafaxine' }, { id: 'ING-desvenlafaxine', canonicalName: 'Desvenlafaxine' }, { id: 'ING-duloxetine', canonicalName: 'Duloxetine' },
];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-venlafaxine-immediate-release-oral-tablet': { canonicalName: 'Venlafaxine immediate-release oral tablet', genericName: 'venlafaxine', aliases: ['venlafaxine', 'venlafaxine tablet', 'venlafaxine IR', 'venlafaxine immediate-release tablet'], drugClassIds: ['CLS-snri'] },
  'MED-venlafaxine-extended-release-oral-capsule': { canonicalName: 'Venlafaxine extended-release oral capsule', genericName: 'venlafaxine extended-release', aliases: ['venlafaxine', 'venlafaxine ER', 'venlafaxine XR', 'venlafaxine ER capsule', 'venlafaxine extended-release capsule'], drugClassIds: ['CLS-snri'] },
  'MED-desvenlafaxine-extended-release-oral-tablet': { canonicalName: 'Desvenlafaxine extended-release oral tablet', genericName: 'desvenlafaxine extended-release', brandNames: ['Pristiq'], aliases: ['desvenlafaxine', 'Pristiq', 'desvenlafaxine ER', 'desvenlafaxine XR', 'desvenlafaxine extended-release tablet'], drugClassIds: ['CLS-snri'] },
  'MED-duloxetine-delayed-release-oral-capsule': { canonicalName: 'Duloxetine delayed-release oral capsule', genericName: 'duloxetine delayed-release', brandNames: ['Cymbalta'], aliases: ['duloxetine', 'Cymbalta', 'duloxetine DR', 'duloxetine delayed-release capsule'], drugClassIds: ['CLS-snri'] },
};
export const periproceduralSnriMedications: MedicationRecord[] = periproceduralSnriIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
