import { antiepilepticZonisamideIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticZonisamideIngredients: IngredientRecord[] = [
  { id: 'ING-zonisamide', canonicalName: 'Zonisamide' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-zonegran-zonisamide-oral-capsule': { canonicalName: 'ZONEGRAN zonisamide oral capsule', genericName: 'zonisamide', brandNames: ['Zonegran'], aliases: ['zonisamide', 'Zonegran', 'zonisamide capsule', 'Zonegran capsule', 'zonisamide oral capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-zonisamide'] },
  'MED-zonisade-zonisamide-oral-suspension': { canonicalName: 'ZONISADE zonisamide oral suspension', genericName: 'zonisamide', brandNames: ['Zonisade'], aliases: ['zonisamide', 'Zonisade', 'zonisamide suspension', 'zonisamide oral suspension', 'Zonisade suspension', 'zonisamide liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-zonisamide'] },
};

export const antiepilepticZonisamideMedications: MedicationRecord[] = antiepilepticZonisamideIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
