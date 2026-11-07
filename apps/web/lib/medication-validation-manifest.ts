import { terminologyDataset } from './content';

/**
 * Machine-readable, deterministic medication inventory.
 * Ingredient-set grouping is a provisional research unit, NOT clinical signoff.
 * Clinically consequential formulation splits must be adjudicated separately.
 */
export type MedicationInventoryRecord = {
  medicationId: string;
  canonicalName: string;
  ingredientIds: string[];
  ingredientSetKey: string;
  reviewStatus: 'NOT_STARTED';
};

export type IngredientReviewGroup = {
  ingredientSetKey: string;
  medicationIds: string[];
  ingredientIds: string[];
  formulationAdjudication: 'PENDING';
  clinicalStatus: 'NOT_STARTED';
};

export function buildMedicationValidationManifest() {
  const medications: MedicationInventoryRecord[] = terminologyDataset.medications.map((m) => ({
    medicationId: m.id,
    canonicalName: m.canonicalName,
    ingredientIds: [...m.ingredientIds].sort(),
    ingredientSetKey: [...m.ingredientIds].sort().join('+'),
    reviewStatus: 'NOT_STARTED',
  })).sort((a, b) => a.medicationId.localeCompare(b.medicationId));

  const grouped = new Map<string, IngredientReviewGroup>();
  for (const m of medications) {
    const existing = grouped.get(m.ingredientSetKey);
    if (existing) existing.medicationIds.push(m.medicationId);
    else grouped.set(m.ingredientSetKey, {
      ingredientSetKey: m.ingredientSetKey,
      ingredientIds: m.ingredientIds,
      medicationIds: [m.medicationId],
      formulationAdjudication: 'PENDING',
      clinicalStatus: 'NOT_STARTED',
    });
  }
  const groups = [...grouped.values()].sort((a, b) => a.ingredientSetKey.localeCompare(b.ingredientSetKey));
  return {
    schemaVersion: 1,
    scope: 'provisional-ingredient-set-inventory',
    warning: 'Ingredient sets are not clinically distinct formulation groups; no guideline reviews or clinical approvals are implied.',
    counts: {
      canonicalMedications: medications.length,
      provisionalIngredientSets: groups.length,
      combinationMedications: medications.filter((m) => m.ingredientIds.length > 1).length,
    },
    medications,
    groups,
  };
}
