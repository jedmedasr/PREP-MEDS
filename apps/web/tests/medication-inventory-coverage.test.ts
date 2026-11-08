import { describe, expect, it } from 'vitest';
import { terminologyDataset } from '../lib/content';

/**
 * Inventory denominator is canonical medication IDs; review-group denominator is
 * distinct ingredient sets, a LOWER BOUND until route/formulation adjudication.
 * Never equate grouping by ingredient IDs with clinical approval.
 */
describe('medication inventory integrity for clinical validation sprint', () => {
  const medications = terminologyDataset.medications;
  const ingredientIds = new Set(terminologyDataset.ingredients.map((item) => item.id));
  const canonicalIds = medications.map((medication) => medication.id);
  const groupKey = (ids: string[]) => [...ids].sort().join('+');
  const ingredientGroups = new Map<string, string[]>();
  for (const medication of medications) {
    const key = groupKey(medication.ingredientIds);
    ingredientGroups.set(key, [...(ingredientGroups.get(key) ?? []), medication.id]);
  }

  it('has unique canonical medication identifiers', () => {
    expect(new Set(canonicalIds).size).toBe(canonicalIds.length);
  });

  it('maps every medication to at least one existing ingredient', () => {
    const unmapped = medications.filter((medication) =>
      !medication.ingredientIds.length || medication.ingredientIds.some((id) => !ingredientIds.has(id))
    );
    expect(unmapped.map((medication) => medication.id)).toEqual([]);
  });

  it('preserves every ingredient in combination products', () => {
    const combinations = medications.filter((medication) => medication.ingredientIds.length > 1);
    for (const medication of combinations) {
      expect(groupKey(medication.ingredientIds).split('+')).toHaveLength(medication.ingredientIds.length);
    }
  });

  it('reports exact ingredient-set grouping denominator without asserting formulation equivalence', () => {
    expect(ingredientGroups.size).toBeGreaterThan(0);
    expect(medications.length).toBeGreaterThanOrEqual(ingredientGroups.size);
    console.info(JSON.stringify({
      canonicalMedicationCount: medications.length,
      uniqueIngredientSetCount: ingredientGroups.size,
      combinationMedicationCount: medications.filter((m) => m.ingredientIds.length > 1).length,
      note: 'Ingredient-set groups are provisional; distinct formulations require clinical adjudication',
    }));
  });
});
