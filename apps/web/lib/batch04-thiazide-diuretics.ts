import { batch04ThiazideDiureticIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04ThiazideDiureticIngredients: IngredientRecord[] = [
  { id: 'ING-hydrochlorothiazide', canonicalName: 'Hydrochlorothiazide', aliases: ['HCTZ', 'hydrochlorothiazide USP'] },
  { id: 'ING-chlorthalidone', canonicalName: 'Chlorthalidone' },
  { id: 'ING-indapamide', canonicalName: 'Indapamide' },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-hydrochlorothiazide': ['hydrochlorothiazide', 'HCTZ', 'hydrochlorothiazide tablet'],
  'MED-chlorthalidone': ['chlorthalidone', 'chlorthalidone tablet'],
  'MED-indapamide': ['indapamide', 'indapamide tablet', 'indapamide film coated tablet'],
};

export const batch04ThiazideDiureticMedications: MedicationRecord[] = batch04ThiazideDiureticIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: definition.genericName.charAt(0).toUpperCase() + definition.genericName.slice(1),
  genericName: definition.genericName,
  aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: [definition.ingredientId],
  drugClassIds: ['CLS-diuretic', definition.medicationId === 'MED-hydrochlorothiazide' ? 'CLS-thiazide-diuretic' : 'CLS-thiazide-like-diuretic'],
}));
