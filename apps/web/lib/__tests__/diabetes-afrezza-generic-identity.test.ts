import { describe, expect, it } from 'vitest';
import { TerminologyIndex } from '@prep-meds/terminology';
import { terminologyDataset } from '../content';

const query = 'insulin human inhalation powder';
const genericId = 'MED-inhaled-insulin';
const brandedFamilyId = 'MED-afrezza-strength-unspecified';
const moduleIndex = new TerminologyIndex(terminologyDataset);

function assertGenericAmbiguity(index: TerminologyIndex, enableFuzzy?: boolean) {
  const fuzzyOptions = enableFuzzy === undefined ? {} : { enableFuzzy };
  const hits = index.search(query, { ...fuzzyOptions, limit: terminologyDataset.medications.length });
  const exactIds = hits.filter((hit) => hit.matchKind === 'EXACT').map((hit) => hit.medicationId);
  const diagnostic = JSON.stringify({ query, enableFuzzy, hits, generic: index.getMedicationById(genericId), branded: index.getMedicationById(brandedFamilyId) });
  expect(new Set(exactIds), diagnostic).toEqual(new Set([genericId, brandedFamilyId]));
  for (const limit of [1, 10]) {
    const result = index.resolve(query, { ...fuzzyOptions, limit });
    expect(result.status, diagnostic).toBe('AMBIGUOUS');
    expect(result.reason).toBe('MULTIPLE_PLAUSIBLE_MATCHES');
    expect(result.medication).toBeUndefined();
    expect(result.ingredientIds).toEqual([]);
  }
  expect(index.resolve('Afrezza 4 unit cartridge').medication?.id).toBe('MED-afrezza-4-unit-cartridge');
}

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
    assertGenericAmbiguity(index);
    assertGenericAmbiguity(index, false);
    assertGenericAmbiguity(index, true);
  });

  it('preserves a module-level index after repeated preceding cartridge searches', () => {
    for (const units of [4, 8, 12]) {
      for (const name of [`Afrezza ${units} unit cartridge`, `Afrezza ${units} units per cartridge`, `Afrezza ${units} units/cartridge`]) {
        expect(moduleIndex.resolve(name).medication?.id).toBe(`MED-afrezza-${units}-unit-cartridge`);
      }
    }
    expect(moduleIndex.resolve('Afrezza', { limit: 1 }).status).toBe('AMBIGUOUS');
    assertGenericAmbiguity(moduleIndex);
    assertGenericAmbiguity(moduleIndex, false);
    assertGenericAmbiguity(moduleIndex, true);
  });
});
