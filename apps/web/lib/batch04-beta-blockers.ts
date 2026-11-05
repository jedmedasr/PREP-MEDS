import { batch04BetaBlockerIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04BetaBlockerIngredients: IngredientRecord[] = [
  { id: 'ING-carvedilol', canonicalName: 'Carvedilol' },
  { id: 'ING-atenolol', canonicalName: 'Atenolol' },
  { id: 'ING-propranolol', canonicalName: 'Propranolol', aliases: ['propranolol hydrochloride', 'propranolol HCl'] },
  { id: 'ING-bisoprolol', canonicalName: 'Bisoprolol', aliases: ['bisoprolol fumarate'] },
  { id: 'ING-nadolol', canonicalName: 'Nadolol' },
  { id: 'ING-labetalol', canonicalName: 'Labetalol', aliases: ['labetalol hydrochloride', 'labetalol HCl'] },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-metoprolol-tartrate': ['metoprolol', 'metoprolol tartrate', 'metoprolol tartrate tablet', 'metoprolol standard release'],
  'MED-metoprolol-succinate-er': ['metoprolol', 'metoprolol succinate', 'metoprolol succinate ER', 'metoprolol succinate extended release', 'metoprolol extended release'],
  'MED-carvedilol': ['carvedilol'],
  'MED-atenolol': ['atenolol'],
  'MED-propranolol': ['propranolol', 'propranolol hydrochloride', 'propranolol HCl'],
  'MED-bisoprolol': ['bisoprolol', 'bisoprolol fumarate'],
  'MED-nadolol': ['nadolol'],
  'MED-labetalol': ['labetalol', 'labetalol hydrochloride', 'labetalol HCl'],
};

function canonicalName(medicationId: string, genericName: string): string {
  if (medicationId === 'MED-metoprolol-tartrate') return 'Metoprolol tartrate tablet';
  if (medicationId === 'MED-metoprolol-succinate-er') return 'Metoprolol succinate extended-release tablet';
  return genericName.charAt(0).toUpperCase() + genericName.slice(1);
}

export const batch04BetaBlockerMedications: MedicationRecord[] = batch04BetaBlockerIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: canonicalName(definition.medicationId, definition.genericName),
  genericName: definition.genericName,
  brandNames: [],
  aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: [definition.ingredientId],
  drugClassIds: ['CLS-beta-blocker'],
}));
