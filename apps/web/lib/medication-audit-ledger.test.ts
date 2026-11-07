import { describe, expect, it } from 'vitest';
import { buildMedicationValidationManifest } from './medication-validation-manifest';
import { buildAntithromboticAuditQueue } from './antithrombotic-audit-queue';

describe('canonical audit ledger completeness', () => {
  it('covers every canonical ID exactly once and maps it to an existing provisional group', () => {
    const manifest = buildMedicationValidationManifest();
    const ids = manifest.medications.map(m => m.medicationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(manifest.canonicalIdToProvisionalGroup).length).toBe(ids.length);
    const groups = new Map(manifest.groups.map(g => [g.ingredientSetKey, g]));
    for (const medication of manifest.medications) {
      const groupKey = manifest.canonicalIdToProvisionalGroup[medication.medicationId];
      expect(groupKey).toBe(medication.ingredientSetKey);
      expect(groups.get(groupKey!)?.medicationIds).toContain(medication.medicationId);
      expect(medication.reviewStatus).toBe('NOT_STARTED');
      expect(medication.lastReviewedDate).toBeNull();
      expect(medication.reviewCommit).toBeNull();
      expect(medication.sourceVersions).toEqual([]);
      expect(medication.testEvidence).toEqual([]);
      expect(medication.remainingIssues.length).toBeGreaterThan(0);
    }
  });
  it('maps every antithrombotic queue ID to a canonical inventory ID without asserting source review', () => {
    const manifest = buildMedicationValidationManifest();
    const antithrombotics = buildAntithromboticAuditQueue();
    const canonical = new Map(manifest.medications.map(m => [m.medicationId, m]));
    expect(Object.keys(antithrombotics.canonicalIdToProvisionalGroup).length).toBe(antithrombotics.medications.length);
    for (const medication of antithrombotics.medications) {
      expect(canonical.has(medication.medicationId)).toBe(true);
      expect(antithrombotics.canonicalIdToProvisionalGroup[medication.medicationId]).toBe(medication.provisionalGroupKey);
      expect(medication.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(medication.asge2016.source.year).toBe(2016);
      expect(medication.asge2016.source.doi).toBe('10.1016/j.gie.2015.09.035');
      expect(medication.clinicalApproval).toBe(false);
      expect(medication.lastReviewedDate).toBeNull();
      expect(medication.testEvidence).toEqual([]);
    }
  });
});
