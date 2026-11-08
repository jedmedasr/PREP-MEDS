import { describe, expect, it } from 'vitest';
import { terminologyDataset } from './content';
import { buildMedicationValidationManifest } from './medication-validation-manifest';

describe('deterministic medication audit group membership', () => {
  it('produces identical output when canonical medication input order is reversed', () => {
    const original = buildMedicationValidationManifest(terminologyDataset.medications);
    const reversed = buildMedicationValidationManifest([...terminologyDataset.medications].reverse());
    expect(reversed).toEqual(original);
    expect(original.groups.flatMap(group => group.medicationIds).length).toBe(original.medications.length);
    for (const group of original.groups) {
      expect(group.medicationIds).toEqual([...group.medicationIds].sort((a, b) => a.localeCompare(b)));
    }
  });
});
