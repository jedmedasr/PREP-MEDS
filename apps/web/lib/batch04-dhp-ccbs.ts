import { batch04DhpCcbIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04DhpCcbIngredients: IngredientRecord[] = [
  { id: 'ING-amlodipine', canonicalName: 'Amlodipine', aliases: ['amlodipine besylate'] },
  { id: 'ING-nifedipine', canonicalName: 'Nifedipine' },
  { id: 'ING-felodipine', canonicalName: 'Felodipine' },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-amlodipine': ['amlodipine', 'amlodipine besylate'],
  'MED-nifedipine-capsule': ['nifedipine', 'nifedipine capsule', 'nifedipine standard capsule'],
  'MED-nifedipine-er': ['nifedipine', 'nifedipine ER', 'nifedipine extended release', 'nifedipine extended-release tablet'],
  'MED-felodipine-er': ['felodipine', 'felodipine ER', 'felodipine extended release', 'felodipine extended-release tablet'],
};

function canonicalName(medicationId: string): string {
  if (medicationId === 'MED-amlodipine') return 'Amlodipine tablet';
  if (medicationId === 'MED-nifedipine-capsule') return 'Nifedipine capsule';
  if (medicationId === 'MED-nifedipine-er') return 'Nifedipine extended-release tablet';
  return 'Felodipine extended-release tablet';
}

export const batch04DhpCcbMedications: MedicationRecord[] = batch04DhpCcbIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: canonicalName(definition.medicationId),
  genericName: definition.genericName,
  aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: [definition.ingredientId],
  drugClassIds: ['CLS-calcium-channel-blocker', 'CLS-dihydropyridine-ccb'],
}));
