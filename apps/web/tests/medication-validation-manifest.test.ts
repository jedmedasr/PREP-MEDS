import { describe, expect, it } from 'vitest';
import { terminologyDataset } from '../lib/content';
import { buildMedicationValidationManifest } from '../lib/medication-validation-manifest';

describe('machine-readable medication validation manifest', () => {
  const manifest = buildMedicationValidationManifest();
  it('covers every canonical medication exactly once', () => {
    expect(manifest.counts.canonicalMedications).toBe(terminologyDataset.medications.length);
    expect(manifest.medications.map((m) => m.medicationId).sort()).toEqual(
      terminologyDataset.medications.map((m) => m.id).sort()
    );
  });
  it('groups by complete ingredient set and never drops combination ingredients', () => {
    const ids = manifest.groups.flatMap((g) => g.medicationIds);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(manifest.medications.map((m) => m.medicationId).sort());
    for (const group of manifest.groups) {
      expect(group.ingredientIds.join('+')).toBe(group.ingredientSetKey);
      for (const medicationId of group.medicationIds) {
        const medication = manifest.medications.find((m) => m.medicationId === medicationId);
        expect(medication?.ingredientSetKey).toBe(group.ingredientSetKey);
      }
    }
  });
  it('remains fail-closed until formulation adjudication and clinical approval', () => {
    expect(manifest.groups.every((g) => g.formulationAdjudication === 'PENDING' && g.clinicalStatus === 'NOT_STARTED')).toBe(true);
  });
  it('can be serialized as JSON for audit export', () => {
    expect(JSON.parse(JSON.stringify(manifest)).counts).toEqual(manifest.counts);
  });
});
