import { antiepilepticCarbamazepineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticCarbamazepineIngredients: IngredientRecord[] = [
  { id: 'ING-carbamazepine', canonicalName: 'Carbamazepine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-tegretol-carbamazepine-conventional-oral-tablet': { canonicalName: 'TEGRETOL carbamazepine conventional oral tablet', genericName: 'carbamazepine', brandNames: ['Tegretol'], aliases: ['carbamazepine', 'Tegretol', 'carbamazepine conventional tablet', 'carbamazepine immediate release tablet', 'Tegretol tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
  'MED-tegretol-carbamazepine-oral-suspension': { canonicalName: 'TEGRETOL carbamazepine oral suspension', genericName: 'carbamazepine', brandNames: ['Tegretol'], aliases: ['carbamazepine', 'Tegretol', 'carbamazepine suspension', 'carbamazepine oral suspension', 'Tegretol suspension', 'carbamazepine liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
  'MED-carbamazepine-chewable-oral-tablet': { canonicalName: 'carbamazepine chewable oral tablet', genericName: 'carbamazepine', brandNames: [], aliases: ['carbamazepine', 'carbamazepine chewable tablet', 'chewable carbamazepine'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
  'MED-tegretol-xr-carbamazepine-er-oral-tablet': { canonicalName: 'TEGRETOL XR carbamazepine extended-release oral tablet', genericName: 'carbamazepine extended release', brandNames: ['Tegretol XR'], aliases: ['carbamazepine', 'Tegretol', 'Tegretol XR', 'carbamazepine XR tablet', 'carbamazepine extended release tablet', 'carbamazepine ER tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
  'MED-carbatrol-carbamazepine-er-oral-capsule': { canonicalName: 'CARBATROL carbamazepine extended-release oral capsule', genericName: 'carbamazepine extended release', brandNames: ['Carbatrol'], aliases: ['carbamazepine', 'Carbatrol', 'carbamazepine extended release capsule', 'carbamazepine ER capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
  'MED-equetro-carbamazepine-er-oral-capsule': { canonicalName: 'EQUETRO carbamazepine extended-release oral capsule', genericName: 'carbamazepine extended release', brandNames: ['Equetro'], aliases: ['carbamazepine', 'Equetro', 'carbamazepine extended release capsule', 'carbamazepine ER capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-carbamazepine'] },
};

export const antiepilepticCarbamazepineMedications: MedicationRecord[] = antiepilepticCarbamazepineIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
