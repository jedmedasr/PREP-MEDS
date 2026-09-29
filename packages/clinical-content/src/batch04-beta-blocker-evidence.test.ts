import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04BetaBlockerIdentityAtoms,
  batch04BetaBlockerIdentityDefinitions,
  batch04BetaBlockerIdentityEvidence,
  batch04BetaBlockerIdentitySources,
  batch04BetaBlockerReviewRules,
} from './batch04-beta-blocker-evidence.js';

describe('Batch 04 beta-blocker evidence', () => {
  it('validates eight formulation-aware beta-blocker identities', () => {
    expect(validateEvidenceBundle(batch04BetaBlockerIdentityEvidence)).toEqual([]);
    expect(batch04BetaBlockerIdentityDefinitions).toHaveLength(8);
    expect(batch04BetaBlockerIdentitySources).toHaveLength(8);
    expect(batch04BetaBlockerIdentityAtoms).toHaveLength(8);
    expect(batch04BetaBlockerReviewRules).toHaveLength(1);
  });

  it('pins metoprolol tartrate versus succinate ER provenance', () => {
    const byId = new Map(batch04BetaBlockerIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-METOPROLOL-TARTRATE-MYLAN-SPL31')?.metadata).toMatchObject({ setId: '809c6386-0039-42ff-a03e-e42733e229b8', splVersion: 31, applicationNumber: 'ANDA076704', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', releaseForm: 'STANDARD' });
    expect(byId.get('SRC-B4-METOPROLOL-SUCCINATE-ZYDUS-SPL10')?.metadata).toMatchObject({ setId: 'bd77ec6e-c58c-440b-81d6-8a462b2fdc9c', splVersion: 10, applicationNumber: 'ANDA203894', route: 'ORAL', dosageForm: 'TABLET, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE' });
  });

  it('pins the remaining direct DailyMed source identities', () => {
    const byId = new Map(batch04BetaBlockerIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-CARVEDILOL-BLUEPOINT-SPL14')?.metadata).toMatchObject({ splVersion: 14, applicationNumber: 'ANDA077614' });
    expect(byId.get('SRC-B4-ATENOLOL-ZYDUS-SPL13')?.metadata).toMatchObject({ splVersion: 13, applicationNumber: 'ANDA076900' });
    expect(byId.get('SRC-B4-PROPRANOLOL-LIFESTAR-SPL7')?.metadata).toMatchObject({ splVersion: 7, applicationNumber: 'ANDA216663' });
    expect(byId.get('SRC-B4-BISOPROLOL-MICROLABS-SPL1')?.metadata).toMatchObject({ splVersion: 1, applicationNumber: 'ANDA218303' });
    expect(byId.get('SRC-B4-NADOLOL-ZYDUS-SPL6')?.metadata).toMatchObject({ splVersion: 6, applicationNumber: 'ANDA207761' });
    expect(byId.get('SRC-B4-LABETALOL-BLUEPOINT-SPL5')?.metadata).toMatchObject({ splVersion: 5, applicationNumber: 'ANDA074787' });
    for (const source of batch04BetaBlockerIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps identity atoms descriptive and the review rule timing-free', () => {
    for (const atom of batch04BetaBlockerIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const rule = batch04BetaBlockerReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(8);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.requiredModifierIds).toEqual(['MOD-stable-chronic-use']);
    expect(rule?.timingRule).toBeUndefined();
    expect(rule?.evidenceRefs).toEqual([{ id: 'EVD-AHA-BETA-CONTINUE-2024', version: 1 }]);
  });
});
