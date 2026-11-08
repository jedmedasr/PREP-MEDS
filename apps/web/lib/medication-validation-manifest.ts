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
  reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_CORRECTION' | 'TESTED' | 'CLINICALLY_REVIEWED';
  lastReviewedDate: string | null;
  reviewCommit: string | null;
  sourceVersions: string[];
  testEvidence: string[];
  remainingIssues: string[];
};

export type IngredientReviewGroup = {
  ingredientSetKey: string;
  medicationIds: string[];
  ingredientIds: string[];
  formulationAdjudication: 'PENDING';
  clinicalStatus: 'NOT_STARTED';
};

export function buildMedicationValidationManifest(sourceMedications: typeof terminologyDataset.medications = terminologyDataset.medications) {
  const medications: MedicationInventoryRecord[] = sourceMedications.map((m) => ({
    medicationId: m.id,
    canonicalName: m.canonicalName,
    ingredientIds: [...m.ingredientIds].sort(),
    ingredientSetKey: [...m.ingredientIds].sort().join('+'),
    reviewStatus: 'NOT_STARTED' as const,
    lastReviewedDate: null,
    reviewCommit: null,
    sourceVersions: [],
    testEvidence: [],
    remainingIssues: ['Formulation/route review and clinical evidence not yet completed'],
  })).sort((a, b) => a.medicationId.localeCompare(b.medicationId));

  // Fail closed before Object.fromEntries can silently overwrite a duplicate ID.
  const canonicalIds = medications.map(m => m.medicationId);
  if (new Set(canonicalIds).size !== canonicalIds.length) throw new Error('DUPLICATE_CANONICAL_MEDICATION_ID');
  // Reject invisible control characters before they contaminate immutable audit keys or labels.
  const containsControl = (value: string) => /[\u0000-\u001f\u007f]/.test(value);
  if (medications.some(m => !m.medicationId.trim() || !m.canonicalName.trim() || containsControl(m.medicationId) || containsControl(m.canonicalName) || m.ingredientIds.length === 0 || m.ingredientIds.some(id => !id.trim() || id !== id.trim() || containsControl(id)) || m.medicationId !== m.medicationId.trim() || new Set(m.ingredientIds).size !== m.ingredientIds.length)) {
    throw new Error('INVALID_MEDICATION_INGREDIENT_MAPPING');
  }

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
  // Stable group membership is required for reproducible audit snapshots.\n  for (const group of groups) group.medicationIds.sort((a, b) => a.localeCompare(b));\n  // Each canonical ID must belong to exactly one provisional group; mapping is not clinical validation.
  const groupMembers = groups.flatMap(group => group.medicationIds);
  if (groupMembers.length !== medications.length || new Set(groupMembers).size !== medications.length ||
      groupMembers.some(id => !canonicalIds.includes(id))) throw new Error('INCOMPLETE_CANONICAL_GROUP_MAPPING');
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
    canonicalIdToProvisionalGroup: Object.fromEntries(medications.map(m => [m.medicationId, m.ingredientSetKey])),
  };
}
