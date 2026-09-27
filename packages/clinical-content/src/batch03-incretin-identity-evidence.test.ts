import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03IncretinIdentityAtoms,
  batch03IncretinIdentityDefinitions,
  batch03IncretinIdentityEvidence,
  batch03IncretinIdentitySources,
  batch03TirzepatideProcedureReviewAtoms,
} from './batch03-incretin-identity-evidence.js';

describe('Batch 03 incretin product/formulation identity evidence', () => {
  it('validates six explicit identities from six source records', () => {
    expect(validateEvidenceBundle(batch03IncretinIdentityEvidence)).toEqual([]);
    expect(batch03IncretinIdentityDefinitions).toHaveLength(6);
    expect(batch03IncretinIdentitySources).toHaveLength(6);
    expect(batch03IncretinIdentityAtoms).toHaveLength(6);
    expect(batch03TirzepatideProcedureReviewAtoms).toHaveLength(2);
  });

  it('pins the current verified source versions', () => {
    const byId = new Map(batch03IncretinIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B3-MOUNJARO-SPL40')?.metadata?.splVersion).toBe(40);
    expect(byId.get('SRC-B3-MOUNJARO-SPL40')?.effectiveDate).toBe('2026-08-27');
    expect(byId.get('SRC-B3-ZEPBOUND-SPL40')?.metadata?.splVersion).toBe(40);
    expect(byId.get('SRC-B3-ZEPBOUND-SPL40')?.effectiveDate).toBe('2026-08-28');
    expect(byId.get('SRC-B3-BYETTA-SPL26')?.metadata?.splVersion).toBe(26);
    expect(byId.get('SRC-B3-BYETTA-SPL26')?.effectiveDate).toBe('2025-09-02');
    expect(byId.get('SRC-B3-BYDUREON-BCISE-SPL39')?.metadata?.splVersion).toBe(39);
    expect(byId.get('SRC-B3-BYDUREON-BCISE-SPL39')?.effectiveDate).toBe('2025-05-28');
    expect(byId.get('SRC-B3-SAXENDA-SPL22')?.metadata?.splVersion).toBe(22);
    expect(byId.get('SRC-B3-SAXENDA-SPL22')?.effectiveDate).toBe('2026-02-25');
    expect(byId.get('SRC-B3-LIRAGLUTIDE-CIPLA-SPL6')?.metadata?.splVersion).toBe(6);
    expect(byId.get('SRC-B3-LIRAGLUTIDE-CIPLA-SPL6')?.effectiveDate).toBe('2026-06-18');
  });

  it('preserves ingredient-to-product ambiguity and formulation distinctions', () => {
    const tirzepatide = batch03IncretinIdentityDefinitions.filter((item) => item.genericName === 'tirzepatide');
    const exenatide = batch03IncretinIdentityDefinitions.filter((item) => item.genericName === 'exenatide');
    const liraglutide = batch03IncretinIdentityDefinitions.filter((item) => item.genericName === 'liraglutide');

    expect(tirzepatide.map((item) => item.medicationId)).toEqual([
      'MED-tirzepatide-mounjaro',
      'MED-tirzepatide-zepbound',
    ]);
    expect(new Set(tirzepatide.map((item) => item.indicationBoundary))).toEqual(
      new Set(['DIABETES', 'WEIGHT_MANAGEMENT_OR_OSA']),
    );

    expect(new Set(exenatide.map((item) => item.formulation))).toEqual(
      new Set(['IMMEDIATE_RELEASE', 'EXTENDED_RELEASE']),
    );

    expect(liraglutide).toHaveLength(2);
    expect(liraglutide.every((item) => item.indicationBoundary === 'WEIGHT_MANAGEMENT')).toBe(true);
  });

  it('keeps all evidence draft, descriptive and non-action-authorizing', () => {
    for (const atom of batch03IncretinIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
      );
    }

    for (const source of batch03IncretinIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
    }
  });
  it('keeps tirzepatide procedure evidence review-only without inventing timing', () => {
    expect(batch03TirzepatideProcedureReviewAtoms.map((atom) => atom.id)).toEqual([
      'EVD-B3-MOUNJARO-PROCEDURE-REVIEW',
      'EVD-B3-ZEPBOUND-PROCEDURE-REVIEW',
    ]);
    for (const atom of batch03TirzepatideProcedureReviewAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'PREP-MEDS therefore uses this atom to require review, not to generate a hold/continue/restart timing instruction.',
      );
    }
  });

});
