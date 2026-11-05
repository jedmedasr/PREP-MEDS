import { batch04NonDhpCcbIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04NonDhpCcbIngredients: IngredientRecord[] = [
  { id: 'ING-diltiazem', canonicalName: 'Diltiazem', aliases: ['diltiazem hydrochloride', 'diltiazem HCl'] },
  { id: 'ING-verapamil', canonicalName: 'Verapamil', aliases: ['verapamil hydrochloride', 'verapamil HCl'] },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-diltiazem-tablet': ['diltiazem', 'diltiazem hydrochloride', 'diltiazem tablet', 'diltiazem standard tablet'],
  'MED-diltiazem-er-capsule-twice-daily': ['diltiazem', 'diltiazem ER', 'diltiazem extended release', 'diltiazem ER capsule', 'diltiazem extended-release capsule', 'diltiazem twice daily extended release', 'diltiazem ER twice daily capsule'],
  'MED-diltiazem-cartia-xt-er-capsule-once-daily': ['diltiazem', 'diltiazem ER', 'diltiazem extended release', 'Cartia XT', 'Cartia XT capsule', 'diltiazem once daily extended release capsule'],
  'MED-diltiazem-er-tablet-once-daily': ['diltiazem', 'diltiazem ER', 'diltiazem extended release', 'diltiazem ER tablet', 'diltiazem extended-release tablet', 'diltiazem once daily extended release tablet'],
  'MED-verapamil-tablet': ['verapamil', 'verapamil hydrochloride', 'verapamil tablet', 'verapamil standard tablet'],
  'MED-verapamil-er-tablet': ['verapamil', 'verapamil ER', 'verapamil extended release', 'verapamil ER tablet', 'verapamil extended-release tablet'],
  'MED-verapamil-verelan-pm-er-capsule': ['verapamil', 'verapamil ER', 'verapamil extended release', 'Verelan PM', 'Verelan PM capsule', 'verapamil controlled onset capsule'],
};

function canonicalName(medicationId: string): string {
  switch (medicationId) {
    case 'MED-diltiazem-tablet': return 'Diltiazem hydrochloride tablet';
    case 'MED-diltiazem-er-capsule-twice-daily': return 'Diltiazem hydrochloride extended-release capsule (twice-daily profile)';
    case 'MED-diltiazem-cartia-xt-er-capsule-once-daily': return 'Cartia XT diltiazem hydrochloride extended-release capsule (once-daily profile)';
    case 'MED-diltiazem-er-tablet-once-daily': return 'Diltiazem hydrochloride extended-release tablet (once-daily profile)';
    case 'MED-verapamil-tablet': return 'Verapamil hydrochloride tablet';
    case 'MED-verapamil-er-tablet': return 'Verapamil hydrochloride extended-release tablet';
    default: return 'Verelan PM verapamil hydrochloride controlled-onset extended-release capsule';
  }
}

export const batch04NonDhpCcbMedications: MedicationRecord[] = batch04NonDhpCcbIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: canonicalName(definition.medicationId),
  genericName: definition.genericName,
  brandNames: definition.brandName ? [definition.brandName] : [],
  aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: [definition.ingredientId],
  drugClassIds: ['CLS-calcium-channel-blocker', 'CLS-nondihydropyridine-ccb'],
}));
