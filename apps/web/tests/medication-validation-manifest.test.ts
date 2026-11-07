import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
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
  it('has no duplicate canonical IDs or empty ingredient mappings', () => {
    const ids = manifest.medications.map(m => m.medicationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(manifest.medications.every(m => m.medicationId.trim() && m.ingredientIds.length > 0 && m.ingredientIds.every(id => id.trim()))).toBe(true);
    expect(Object.keys(manifest.canonicalIdToProvisionalGroup).length).toBe(ids.length);
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
  it('rejects duplicate canonical IDs rather than silently overwriting mapping keys', () => {
    const first = terminologyDataset.medications[0]!;
    expect(() => buildMedicationValidationManifest([first, first])).toThrow('DUPLICATE_CANONICAL_MEDICATION_ID');
  });
  it('rejects empty and duplicate ingredient identifiers before grouping', () => {
    const first = terminologyDataset.medications[0]!;
    expect(() => buildMedicationValidationManifest([{ ...first, ingredientIds: [] }])).toThrow('INVALID_MEDICATION_INGREDIENT_MAPPING');
    expect(() => buildMedicationValidationManifest([{ ...first, ingredientIds: [''] }])).toThrow('INVALID_MEDICATION_INGREDIENT_MAPPING');
    expect(() => buildMedicationValidationManifest([{ ...first, ingredientIds: ['ingredient-a', 'ingredient-a'] }])).toThrow('INVALID_MEDICATION_INGREDIENT_MAPPING');
  });
  it('does not confer clinical review status through provisional group inheritance', () => {
    const duplicatedIngredient = terminologyDataset.medications[0]!;
    const second = { ...duplicatedIngredient, id: duplicatedIngredient.id + '-alternate-brand' };
    const candidate = buildMedicationValidationManifest([duplicatedIngredient, second]);
    expect(candidate.counts.canonicalMedications).toBe(2);
    expect(candidate.counts.provisionalIngredientSets).toBe(1);
    expect(candidate.groups[0]?.medicationIds).toHaveLength(2);
    expect(candidate.medications.every(m => m.reviewStatus === 'NOT_STARTED' && m.lastReviewedDate === null && m.sourceVersions.length === 0)).toBe(true);
    expect(candidate.groups.every(g => g.formulationAdjudication === 'PENDING' && g.clinicalStatus === 'NOT_STARTED')).toBe(true);
  });
  it('exports a deterministic, version-controlled audit snapshot only on explicit request', () => {
    if (process.env.EXPORT_MEDICATION_AUDIT !== '1') return;
    const output = resolve(process.cwd(), '../../docs/medication-audit-manifest.json');
    mkdirSync(dirname(output), { recursive: true });
    const serialized = JSON.stringify(manifest, null, 2) + '\n';
    if (existsSync(output)) {
      expect(readFileSync(output, 'utf8'), 'Committed audit snapshot differs from canonical terminology; regenerate and review before approval').toBe(serialized);
    } else {
      writeFileSync(output, serialized, 'utf8');
    }
    expect(manifest.medications.length).toBe(manifest.counts.canonicalMedications);
  });
  it('rejects unnamed medication records instead of emitting unreviewable audit entries', () => {
    const first = terminologyDataset.medications[0]!;
    expect(() => buildMedicationValidationManifest([{ ...first, canonicalName: '   ' }])).toThrow('INVALID_MEDICATION_INGREDIENT_MAPPING');
  });
  it('retains deterministic group membership under shuffled source order', () => {
    const forward = buildMedicationValidationManifest(terminologyDataset.medications);
    const reverse = buildMedicationValidationManifest([...terminologyDataset.medications].reverse());
    expect(JSON.stringify(reverse)).toBe(JSON.stringify(forward));
    expect(forward.groups.every(group => group.medicationIds.every(id => forward.canonicalIdToProvisionalGroup[id] === group.ingredientSetKey))).toBe(true);
  });
  it('can be serialized as JSON for audit export', () => {
    expect(JSON.parse(JSON.stringify(manifest)).counts).toEqual(manifest.counts);
  });
});
