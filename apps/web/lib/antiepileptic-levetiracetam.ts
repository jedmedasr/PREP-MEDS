import { antiepilepticLevetiracetamIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticLevetiracetamIngredients: IngredientRecord[] = [
  { id: 'ING-levetiracetam', canonicalName: 'Levetiracetam' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-keppra-levetiracetam-ir-film-coated-oral-tablet': { canonicalName: 'KEPPRA levetiracetam immediate-release film-coated oral tablet', genericName: 'levetiracetam', brandNames: ['Keppra'], aliases: ['levetiracetam', 'Keppra', 'levetiracetam IR tablet', 'levetiracetam immediate release tablet', 'Keppra tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-levetiracetam'] },
  'MED-keppra-levetiracetam-oral-solution': { canonicalName: 'KEPPRA levetiracetam oral solution', genericName: 'levetiracetam', brandNames: ['Keppra'], aliases: ['levetiracetam', 'Keppra', 'levetiracetam oral solution', 'Keppra oral solution', 'levetiracetam liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-levetiracetam'] },
  'MED-keppra-levetiracetam-intravenous-concentrate': { canonicalName: 'KEPPRA levetiracetam intravenous concentrate', genericName: 'levetiracetam', brandNames: ['Keppra'], aliases: ['levetiracetam', 'Keppra', 'levetiracetam injection', 'IV levetiracetam', 'Keppra injection', 'Keppra IV'], drugClassIds: ['CLS-antiepileptic', 'CLS-levetiracetam'] },
  'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet': { canonicalName: 'KEPPRA XR levetiracetam extended-release film-coated oral tablet', genericName: 'levetiracetam', brandNames: ['Keppra XR'], aliases: ['levetiracetam', 'Keppra', 'Keppra XR', 'levetiracetam ER tablet', 'levetiracetam extended release tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-levetiracetam'] },
  'MED-spritam-levetiracetam-tablet-for-oral-suspension': { canonicalName: 'SPRITAM levetiracetam tablet for oral suspension', genericName: 'levetiracetam', brandNames: ['Spritam'], aliases: ['levetiracetam', 'Spritam', 'Spritam tablet', 'levetiracetam tablet for oral suspension'], drugClassIds: ['CLS-antiepileptic', 'CLS-levetiracetam'] },
};

export const antiepilepticLevetiracetamMedications: MedicationRecord[] = antiepilepticLevetiracetamIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
