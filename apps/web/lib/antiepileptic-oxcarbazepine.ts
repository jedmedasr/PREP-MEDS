import { antiepilepticOxcarbazepineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticOxcarbazepineIngredients: IngredientRecord[] = [
  { id: 'ING-oxcarbazepine', canonicalName: 'Oxcarbazepine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-trileptal-oxcarbazepine-film-coated-oral-tablet': { canonicalName: 'TRILEPTAL oxcarbazepine film-coated oral tablet', genericName: 'oxcarbazepine', brandNames: ['Trileptal'], aliases: ['oxcarbazepine', 'Trileptal', 'oxcarbazepine tablet', 'Trileptal tablet', 'oxcarbazepine immediate release tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-oxcarbazepine'] },
  'MED-trileptal-oxcarbazepine-oral-suspension': { canonicalName: 'TRILEPTAL oxcarbazepine oral suspension', genericName: 'oxcarbazepine', brandNames: ['Trileptal'], aliases: ['oxcarbazepine', 'Trileptal', 'oxcarbazepine suspension', 'oxcarbazepine oral suspension', 'Trileptal suspension', 'oxcarbazepine liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-oxcarbazepine'] },
  'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet': { canonicalName: 'OXTELLAR XR oxcarbazepine extended-release oral tablet', genericName: 'oxcarbazepine extended release', brandNames: ['Oxtellar XR'], aliases: ['oxcarbazepine', 'Oxtellar XR', 'oxcarbazepine extended release tablet', 'oxcarbazepine ER tablet', 'Oxtellar tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-oxcarbazepine'] },
};

export const antiepilepticOxcarbazepineMedications: MedicationRecord[] = antiepilepticOxcarbazepineIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
