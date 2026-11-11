import { describe, expect, it } from 'vitest';
import { terminologyDataset } from '../lib/content';
import {
  buildInventoryPayload,
  byteOrderCompare,
  ingredientSetKey,
} from '../../../scripts/prepmeds/export-inventory';

describe('canonical inventory export', () => {
  const payload = buildInventoryPayload(terminologyDataset);

  it('exports each canonical medication ID exactly once', () => {
    const ids = payload.medications.map((medication) => medication.medicationId);
    expect(ids).toHaveLength(terminologyDataset.medications.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only defined ingredient IDs', () => {
    const defined = new Set(payload.ingredients.map((ingredient) => ingredient.ingredientId));
    for (const medication of payload.medications) {
      expect(medication.ingredientIds.length).toBeGreaterThan(0);
      for (const ingredientId of medication.ingredientIds) {
        expect(defined.has(ingredientId), `${medication.medicationId} -> ${ingredientId}`).toBe(true);
      }
    }
  });

  it('derives ingredientSetKey from ingredient IDs in byte order', () => {
    for (const medication of payload.medications) {
      const expectedIds = [...medication.ingredientIds].sort(byteOrderCompare);
      expect(medication.ingredientIds).toEqual(expectedIds);
      expect(medication.ingredientSetKey).toBe(expectedIds.join('+'));
      expect(medication.ingredientSetKey).toBe(ingredientSetKey(medication.ingredientIds));
    }
  });
});
