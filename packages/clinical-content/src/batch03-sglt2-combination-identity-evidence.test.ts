import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03Sglt2CombinationIdentityAtoms,
  batch03Sglt2CombinationIdentityDefinitions,
  batch03Sglt2CombinationIdentityEvidence,
  batch03Sglt2CombinationIdentitySources,
  batch03Sglt2CombinationProcedureReviewAtoms,
} from './batch03-sglt2-combination-identity-evidence.js';

describe('Batch 03 SGLT2 combination evidence', () => {
  it('validates nine explicit combination identities with product-specific provenance', () => {
    expect(validateEvidenceBundle(batch03Sglt2CombinationIdentityEvidence)).toEqual([]);
    expect(batch03Sglt2CombinationIdentityDefinitions).toHaveLength(9);
    expect(batch03Sglt2CombinationIdentitySources).toHaveLength(9);
    expect(batch03Sglt2CombinationIdentityAtoms).toHaveLength(9);
    expect(batch03Sglt2CombinationProcedureReviewAtoms).toHaveLength(9);
  });

  it('pins exact source versions and keeps them draft/non-authorizing', () => {
    const byId = new Map(batch03Sglt2CombinationIdentitySources.map((s) => [s.id, s]));
    expect(byId.get('SRC-B3-GLYXAMBI-SPL23')?.metadata?.splVersion).toBe(23);
    expect(byId.get('SRC-B3-XIGDUO-XR-SPL40')?.metadata?.splVersion).toBe(40);
    expect(byId.get('SRC-B3-SEGLUROMET-SPL20')?.metadata?.splVersion).toBe(20);
    expect(byId.get('SRC-B3-STEGLUJAN-SPL24')?.metadata?.splVersion).toBe(24);
    expect(byId.get('SRC-B3-SYNJARDY-SPL23')?.metadata?.splVersion).toBe(23);
    expect(byId.get('SRC-B3-SYNJARDY-XR-SPL18')?.metadata?.splVersion).toBe(18);
    expect(byId.get('SRC-B3-TRIJARDY-XR-SPL11')?.metadata?.splVersion).toBe(11);
    expect(byId.get('SRC-B3-INVOKAMET-SPL32')?.metadata?.splVersion).toBe(32);
    expect(byId.get('SRC-B3-INVOKAMET-SPL32')?.metadata?.applicationNumber).toBe('NDA204353');
    expect(byId.get('SRC-B3-INVOKAMET-XR-SPL32')?.metadata?.splVersion).toBe(32);
    expect(byId.get('SRC-B3-INVOKAMET-XR-SPL32')?.metadata?.applicationNumber).toBe('NDA205879');
    expect(byId.get('SRC-B3-INVOKAMET-SPL32')?.metadata?.setId).toBe('6868666b-c25e-40d1-9d1f-306bbe9390c1');
    expect(byId.get('SRC-B3-INVOKAMET-XR-SPL32')?.metadata?.setId).toBe('6868666b-c25e-40d1-9d1f-306bbe9390c1');
    for (const s of batch03Sglt2CombinationIdentitySources) {
      expect(s.lifecycle).toBe('DRAFT');
      expect(s.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(s.metadata?.substitutionAuthorized).toBe(false);
      expect(s.metadata?.clinicalApprovalGranted).toBe(false);
      expect(s.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('preserves INVOKAMET immediate-release and INVOKAMET XR extended-release as distinct identities', () => {
    const byMedication = new Map(batch03Sglt2CombinationIdentityDefinitions.map((p) => [p.medicationId, p]));
    expect(byMedication.get('MED-canagliflozin-metformin-invokamet')?.release).toBe('IMMEDIATE');
    expect(byMedication.get('MED-canagliflozin-metformin-invokamet-xr')?.release).toBe('EXTENDED');
    expect(byMedication.get('MED-canagliflozin-metformin-invokamet')?.ingredientIds).toEqual(['ING-canagliflozin','ING-metformin']);
    expect(byMedication.get('MED-canagliflozin-metformin-invokamet-xr')?.ingredientIds).toEqual(['ING-canagliflozin','ING-metformin']);
  });

  it('keeps procedure evidence review-only and timing-free', () => {
    for (const atom of batch03Sglt2CombinationProcedureReviewAtoms) {
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.limitations).toContain('This atom authorizes review routing only; it does not authorize a hold/continue/restart timing rule.');
    }
  });
});
