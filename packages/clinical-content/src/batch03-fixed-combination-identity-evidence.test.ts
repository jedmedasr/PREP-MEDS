import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03FixedCombinationIdentityAtoms,
  batch03FixedCombinationIdentityDefinitions,
  batch03FixedCombinationIdentityEvidence,
  batch03FixedCombinationIdentitySources,
  batch03FixedCombinationProcedureReviewAtoms,
} from './batch03-fixed-combination-identity-evidence.js';

describe('Batch 03 fixed insulin/GLP-1 combination evidence', () => {
  it('validates two explicit fixed-combination identities from two current manufacturer sources', () => {
    expect(validateEvidenceBundle(batch03FixedCombinationIdentityEvidence)).toEqual([]);
    expect(batch03FixedCombinationIdentityDefinitions).toHaveLength(2);
    expect(batch03FixedCombinationIdentitySources).toHaveLength(2);
    expect(batch03FixedCombinationIdentityAtoms).toHaveLength(2);
    expect(batch03FixedCombinationProcedureReviewAtoms).toHaveLength(2);
  });

  it('pins current manufacturer label identity without inventing product substitutions', () => {
    const byId = new Map(batch03FixedCombinationIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B3-SOLIQUA-SPL25')?.metadata?.splVersion).toBe(25);
    expect(byId.get('SRC-B3-SOLIQUA-SPL25')?.effectiveDate).toBe('2026-03-18');
    expect(byId.get('SRC-B3-XULTOPHY-SPL14')?.metadata?.splVersion).toBe(14);
    expect(byId.get('SRC-B3-XULTOPHY-SPL14')?.effectiveDate).toBe('2025-10-14');

    for (const source of batch03FixedCombinationIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.doseArithmeticAuthorized).toBe(false);
      expect(source.metadata?.deviceSettingAuthorized).toBe(false);
    }
  });

  it('preserves both active ingredient identities for each indivisible product record', () => {
    expect(batch03FixedCombinationIdentityDefinitions[0]?.ingredientIds).toEqual([
      'ING-insulin-glargine',
      'ING-lixisenatide',
    ]);
    expect(batch03FixedCombinationIdentityDefinitions[1]?.ingredientIds).toEqual([
      'ING-insulin-degludec',
      'ING-liraglutide',
    ]);
  });

  it('keeps identity and procedure evidence non-action-authorizing', () => {
    for (const atom of batch03FixedCombinationIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.limitations).toContain(
        'No substitution, dose arithmetic, insulin conversion, device setting, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
      );
    }
    for (const atom of batch03FixedCombinationProcedureReviewAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.limitations).toContain(
        'PREP-MEDS uses this atom to require review, not to generate a hold/continue/restart timing instruction.',
      );
    }
  });
});
