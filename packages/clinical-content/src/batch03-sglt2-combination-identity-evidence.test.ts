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
  it('validates four explicit combination identities from four current sources', () => {
    expect(validateEvidenceBundle(batch03Sglt2CombinationIdentityEvidence)).toEqual([]);
    expect(batch03Sglt2CombinationIdentityDefinitions).toHaveLength(4);
    expect(batch03Sglt2CombinationIdentitySources).toHaveLength(4);
    expect(batch03Sglt2CombinationIdentityAtoms).toHaveLength(4);
    expect(batch03Sglt2CombinationProcedureReviewAtoms).toHaveLength(4);
  });

  it('pins exact source versions and keeps them draft/non-authorizing', () => {
    const byId = new Map(batch03Sglt2CombinationIdentitySources.map((s) => [s.id, s]));
    expect(byId.get('SRC-B3-GLYXAMBI-SPL23')?.metadata?.splVersion).toBe(23);
    expect(byId.get('SRC-B3-XIGDUO-XR-SPL40')?.metadata?.splVersion).toBe(40);
    expect(byId.get('SRC-B3-SEGLUROMET-SPL20')?.metadata?.splVersion).toBe(20);
    expect(byId.get('SRC-B3-STEGLUJAN-SPL24')?.metadata?.splVersion).toBe(24);
    for (const s of batch03Sglt2CombinationIdentitySources) {
      expect(s.lifecycle).toBe('DRAFT');
      expect(s.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(s.metadata?.substitutionAuthorized).toBe(false);
      expect(s.metadata?.clinicalApprovalGranted).toBe(false);
      expect(s.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps procedure evidence review-only and timing-free', () => {
    for (const atom of batch03Sglt2CombinationProcedureReviewAtoms) {
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.limitations).toContain('This atom authorizes review routing only; it does not authorize a hold/continue/restart timing rule.');
    }
  });
});
