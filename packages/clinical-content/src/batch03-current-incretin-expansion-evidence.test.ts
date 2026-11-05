import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03CurrentIncretinExpansionDefinitions,
  batch03CurrentIncretinExpansionEvidence,
  batch03CurrentIncretinExpansionIdentityAtoms,
  batch03CurrentIncretinExpansionProcedureReviewAtoms,
  batch03CurrentIncretinExpansionReviewRules,
  batch03CurrentIncretinExpansionSources,
} from './batch03-current-incretin-expansion-evidence.js';

describe('Batch 03 current incretin expansion evidence', () => {
  it('validates two current product identities with product-specific review evidence', () => {
    expect(validateEvidenceBundle(batch03CurrentIncretinExpansionEvidence)).toEqual([]);
    expect(batch03CurrentIncretinExpansionDefinitions).toHaveLength(2);
    expect(batch03CurrentIncretinExpansionSources).toHaveLength(2);
    expect(batch03CurrentIncretinExpansionIdentityAtoms).toHaveLength(2);
    expect(batch03CurrentIncretinExpansionProcedureReviewAtoms).toHaveLength(2);
  });

  it('pins exact current manufacturer-label provenance', () => {
    const byId = new Map(batch03CurrentIncretinExpansionSources.map((source) => [source.id, source]));

    const exenatide = byId.get('SRC-B3-EXENATIDE-AMNEAL-SPL17');
    expect(exenatide?.metadata?.setId).toBe('e6cb5c8f-e97f-4a6a-95a4-939fd2393949');
    expect(exenatide?.metadata?.splVersion).toBe(17);
    expect(exenatide?.effectiveDate).toBe('2026-05-27');
    expect(exenatide?.metadata?.applicationNumber).toBe('ANDA206697');

    const foundayo = byId.get('SRC-B3-FOUNDAYO-SPL10');
    expect(foundayo?.metadata?.setId).toBe('8ac446c5-feba-474f-a103-23facb9b5c62');
    expect(foundayo?.metadata?.splVersion).toBe(10);
    expect(foundayo?.effectiveDate).toBe('2026-07-29');
    expect(foundayo?.metadata?.applicationNumber).toBe('NDA220934');

    for (const source of batch03CurrentIncretinExpansionSources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps product identity descriptive and non-action-authorizing', () => {
    for (const atom of batch03CurrentIncretinExpansionIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No substitution, conversion, peri-procedural hold/continue/restart instruction, or market-availability claim is authorized by this identity atom.',
      );
    }
  });

  it('keeps label-derived procedure evidence review-only and timing-free', () => {
    for (const atom of batch03CurrentIncretinExpansionProcedureReviewAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'This atom authorizes clinician-review routing only; it does not authorize a hold/continue/restart timing rule.',
      );
    }

    const guard = batch03CurrentIncretinExpansionReviewRules[0];
    expect(guard?.scope.medicationIds).toEqual([
      'MED-exenatide-generic-anda206697',
      'MED-orforglipron-foundayo',
    ]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
  });
});
