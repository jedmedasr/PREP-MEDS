import { describe, expect, it } from 'vitest';
import {
  diabetesHumalogEvidence,
  diabetesOralReleaseEvidence,
  oralReleaseAtoms,
  oralReleaseProductDefinitions,
  oralReleaseSources,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { terminologyDataset } from '../content';
import {
  diabetesOralReleaseAudit,
  diabetesOralReleaseIdentities,
  diabetesOralReleaseMedications,
} from '../diabetes-oral-release';

const index = new TerminologyIndex(terminologyDataset);

describe('oral diabetes release-form identity', () => {
  it('adds four explicit release variants while preserving release-unspecified base concepts', () => {
    expect(diabetesOralReleaseMedications).toHaveLength(63);
    expect(oralReleaseProductDefinitions).toHaveLength(4);
    expect(diabetesOralReleaseAudit.searchableConceptCount).toBe(63);
    expect(diabetesOralReleaseAudit.sourceLinkedIdentityCount).toBe(35);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(diabetesOralReleaseIdentities['MED-metformin']?.state).toBe('RELEASE_UNSPECIFIED');
    expect(diabetesOralReleaseIdentities['MED-glipizide']?.state).toBe('RELEASE_UNSPECIFIED');
  });

  it.each(['metformin', 'glipizide'])('keeps bare %s release-form ambiguous even with a one-row display limit', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['metformin IR', 'MED-metformin-ir'],
    ['metformin immediate release', 'MED-metformin-ir'],
    ['metformin hydrochloride tablet', 'MED-metformin-ir'],
    ['metformin ER', 'MED-metformin-er'],
    ['metformin XR', 'MED-metformin-er'],
    ['metformin extended-release', 'MED-metformin-er'],
    ['glipizide IR', 'MED-glipizide-ir'],
    ['glipizide immediate-release', 'MED-glipizide-ir'],
    ['glipizide ER', 'MED-glipizide-er'],
    ['glipizide XL', 'MED-glipizide-er'],
    ['Glucotrol XL', 'MED-glipizide-er'],
  ])('resolves explicit release wording %s to %s', (query, id) => {
    expect(index.resolve(query).medication?.id).toBe(id);
  });

  it('preserves legacy unqualified brands without manufacturing a release form', () => {
    expect(index.resolve('Glucophage').medication?.id).toBe('MED-metformin');
    expect(index.resolve('Glucotrol').medication?.id).toBe('MED-glipizide');
    expect(diabetesOralReleaseIdentities['MED-metformin']?.releaseForm).toBeUndefined();
    expect(diabetesOralReleaseIdentities['MED-glipizide']?.releaseForm).toBeUndefined();
  });

  it('preserves ingredient and class identity for explicit release records', () => {
    for (const product of oralReleaseProductDefinitions) {
      const medication = index.getMedicationById(product.medicationId);
      expect(medication?.ingredientIds).toEqual([product.ingredientId]);
      expect(medication?.drugClassIds).toEqual([product.drugClassId]);
      expect(diabetesOralReleaseIdentities[product.medicationId]?.marketAvailabilityAsserted).toBe(false);
    }
  });
});

describe('oral release evidence provenance', () => {
  it('pins exact current source versions for IR and ER identity', () => {
    expect(oralReleaseSources).toHaveLength(5);
    expect(oralReleaseAtoms).toHaveLength(5);
    const byId = new Map(oralReleaseSources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B2-METFORMIN-IR-SPL15')?.metadata?.setId).toBe('8cd5555c-f6b2-28d8-e053-2a95a90a5f1e');
    expect(byId.get('SRC-B2-METFORMIN-IR-SPL15')?.effectiveDate).toBe('2026-06-29');
    expect(byId.get('SRC-B2-METFORMIN-ER-SPL15')?.metadata?.setId).toBe('9171d369-d35a-40e4-a9ad-26484e66fc5e');
    expect(byId.get('SRC-B2-METFORMIN-ER-SPL15')?.effectiveDate).toBe('2026-07-29');
    expect(byId.get('SRC-B2-GLIPIZIDE-IR-SPL8')?.metadata?.setId).toBe('252ba4e0-8dc3-43e3-be00-32570dc095bd');
    expect(byId.get('SRC-B2-GLIPIZIDE-IR-SPL8')?.effectiveDate).toBe('2026-07-13');
    expect(byId.get('SRC-B2-GLIPIZIDE-ER-SPL101')?.metadata?.setId).toBe('4afa67b2-7f86-4189-93a5-6a605f74540d');
    expect(byId.get('SRC-B2-GLIPIZIDE-ER-SPL101')?.effectiveDate).toBe('2026-04-09');
    expect(byId.get('SRC-B2-GLUCOTROL-XL-SPL28')?.metadata?.setId).toBe('eed99b60-d043-4249-9b2a-f05e46fb588d');
    expect(byId.get('SRC-B2-GLUCOTROL-XL-SPL28')?.metadata?.splVersion).toBe(28);
    expect(byId.get('SRC-B2-GLUCOTROL-XL-SPL28')?.effectiveDate).toBe('2026-07-21');
  });

  it('appends evidence without mutating Humalog history', () => {
    expect(validateEvidenceBundle(diabetesHumalogEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesOralReleaseEvidence)).toEqual([]);
    expect(diabetesOralReleaseEvidence.sources.slice(0, diabetesHumalogEvidence.sources.length)).toEqual(diabetesHumalogEvidence.sources);
    expect(diabetesOralReleaseEvidence.atoms.slice(0, diabetesHumalogEvidence.atoms.length)).toEqual(diabetesHumalogEvidence.atoms);
  });

  it('keeps new evidence in draft descriptive state', () => {
    for (const atom of oralReleaseAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
  });
});
