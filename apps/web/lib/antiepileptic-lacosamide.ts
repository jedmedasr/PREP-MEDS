import { antiepilepticLacosamideIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticLacosamideIngredients: IngredientRecord[] = [
  { id: 'ING-lacosamide', canonicalName: 'Lacosamide' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-vimpat-lacosamide-film-coated-oral-tablet': { canonicalName: 'VIMPAT lacosamide film-coated oral tablet', genericName: 'lacosamide', brandNames: ['Vimpat'], aliases: ['lacosamide', 'Vimpat', 'lacosamide tablet', 'Vimpat tablet', 'lacosamide oral tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-lacosamide'] },
  'MED-vimpat-lacosamide-oral-solution': { canonicalName: 'VIMPAT lacosamide oral solution', genericName: 'lacosamide', brandNames: ['Vimpat'], aliases: ['lacosamide', 'Vimpat', 'lacosamide oral solution', 'Vimpat oral solution', 'lacosamide liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-lacosamide'] },
  'MED-vimpat-lacosamide-intravenous-injection': { canonicalName: 'VIMPAT lacosamide intravenous injection', genericName: 'lacosamide', brandNames: ['Vimpat'], aliases: ['lacosamide', 'Vimpat', 'lacosamide injection', 'IV lacosamide', 'Vimpat injection', 'Vimpat IV'], drugClassIds: ['CLS-antiepileptic', 'CLS-lacosamide'] },
};

export const antiepilepticLacosamideMedications: MedicationRecord[] = antiepilepticLacosamideIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
