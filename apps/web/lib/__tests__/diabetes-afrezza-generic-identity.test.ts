import { describe, expect, it } from 'vitest';
import { TerminologyIndex } from '@prep-meds/terminology';
import { terminologyDataset } from '../content';

const query = 'insulin human inhalation powder';
const genericId = 'MED-inhaled-insulin';
const brandedFamilyId = 'MED-afrezza-strength-unspecified';

describe('generic inhalation wording preserves product uncertainty end to end', () => {
  it('indexes the same generic name on unspecified and branded-family records', () => {
    const generic = terminologyDataset.medications.find((medication) => medication.id === genericId);
    const branded = terminologyDataset.medications.find((medication) => medication.id === brandedFamilyId);
    expect(generic?.genericName).toBe(query);
    expect(branded?.genericName).toBe(query);
    expect(generic?.brandNames).toEqual([]);
    expect(generic?.aliases).toContain('inhaled human insulin');
  });

  it.each([false, true])('keeps both exact identities with reversed catalog order = %s', (reverse) => {
    const medications = [...terminologyDataset.medications];
    if (reverse) medications.reverse();
    const index = new TerminologyIndex({ ...terminologyDataset, medications });
    const exactIds = index.search(query, { limit: medications.length, enableFuzzy: false })
      .filter((hit) => hit.matchKind === 'EXACT')
      .map((hit) => hit.medicationId);
    expect(new Set(exactIds)).toEqual(new Set([genericId, brandedFamilyId]));
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit, enableFuzzy: false });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.reason).toBe('MULTIPLE_PLAUSIBLE_MATCHES');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
    // Product-qualified wording remains usable; this is not a blanket search shutdown.
    expect(index.resolve('Afrezza 4 unit cartridge').medication?.id).toBe('MED-afrezza-4-unit-cartridge');
  });
});
