import { antiepilepticValproateIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticValproateIngredients: IngredientRecord[] = [
  { id: 'ING-valproic-acid', canonicalName: 'Valproic acid' },
  { id: 'ING-valproate-sodium', canonicalName: 'Valproate sodium' },
  { id: 'ING-divalproex-sodium', canonicalName: 'Divalproex sodium' },
];

const classes = ['CLS-antiepileptic', 'CLS-valproate'];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-valproic-acid-oral-capsule': { canonicalName: 'valproic acid oral capsule', genericName: 'valproic acid', brandNames: [], aliases: ['valproate', 'valproic acid', 'valproic acid capsule', 'valproic acid oral capsule'], drugClassIds: classes },
  'MED-valproic-acid-oral-solution': { canonicalName: 'valproic acid oral solution', genericName: 'valproic acid', brandNames: [], aliases: ['valproate', 'valproic acid', 'valproic acid solution', 'valproic acid oral solution', 'valproic acid liquid'], drugClassIds: classes },
  'MED-valproate-sodium-intravenous-injection': { canonicalName: 'valproate sodium intravenous injection', genericName: 'valproate sodium', brandNames: [], aliases: ['valproate', 'valproate sodium', 'valproate sodium injection', 'valproate sodium IV injection', 'intravenous valproate'], drugClassIds: classes },
  'MED-depakote-divalproex-sodium-dr-oral-tablet': { canonicalName: 'Depakote divalproex sodium delayed-release oral tablet', genericName: 'divalproex sodium', brandNames: ['Depakote'], aliases: ['valproate', 'divalproex', 'divalproex sodium', 'Depakote', 'Depakote delayed-release tablet', 'Depakote DR tablet', 'divalproex delayed-release tablet'], drugClassIds: classes },
  'MED-depakote-er-divalproex-sodium-er-oral-tablet': { canonicalName: 'Depakote ER divalproex sodium extended-release oral tablet', genericName: 'divalproex sodium', brandNames: ['Depakote ER'], aliases: ['valproate', 'divalproex', 'divalproex sodium', 'Depakote', 'Depakote ER', 'Depakote ER extended-release tablet', 'divalproex extended-release tablet'], drugClassIds: classes },
  'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule': { canonicalName: 'Depakote Sprinkles divalproex sodium delayed-release oral capsule', genericName: 'divalproex sodium', brandNames: ['Depakote Sprinkles'], aliases: ['valproate', 'divalproex', 'divalproex sodium', 'Depakote', 'Depakote Sprinkles', 'Depakote Sprinkles delayed-release capsule', 'divalproex sprinkle capsule'], drugClassIds: classes },
};

export const antiepilepticValproateMedications: MedicationRecord[] = antiepilepticValproateIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
