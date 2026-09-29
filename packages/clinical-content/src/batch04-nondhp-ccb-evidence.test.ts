import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04NonDhpCcbIdentityAtoms,
  batch04NonDhpCcbIdentityDefinitions,
  batch04NonDhpCcbIdentityEvidence,
  batch04NonDhpCcbIdentitySources,
  batch04NonDhpCcbMarketingStatusAtoms,
  batch04NonDhpCcbReviewRules,
} from './batch04-nondhp-ccb-evidence.js';

describe('Batch 04 non-DHP CCB evidence', () => {
  it('validates seven formulation-aware identities plus historical marketing provenance', () => {
    expect(validateEvidenceBundle(batch04NonDhpCcbIdentityEvidence)).toEqual([]);
    expect(batch04NonDhpCcbIdentityDefinitions).toHaveLength(7);
    expect(batch04NonDhpCcbIdentitySources).toHaveLength(7);
    expect(batch04NonDhpCcbIdentityAtoms).toHaveLength(7);
    expect(batch04NonDhpCcbMarketingStatusAtoms).toHaveLength(1);
    expect(batch04NonDhpCcbReviewRules).toHaveLength(1);
  });

  it('pins distinct diltiazem formulation/release provenance', () => {
    const byId = new Map(batch04NonDhpCcbIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-DILTIAZEM-ZYDUS-TABLET-SPL1')?.metadata).toMatchObject({ setId: '8329d0ac-d68c-48d2-9cbc-e1a1b60192d9', splVersion: 1, applicationNumber: 'ANDA219253', dosageForm: 'TABLET', releaseForm: 'STANDARD' });
    expect(byId.get('SRC-B4-DILTIAZEM-MYLAN-ER-CAPSULE-SPL13')?.metadata).toMatchObject({ setId: 'ec7e93b8-666c-4d2f-8d08-07931e09f748', splVersion: 13, applicationNumber: 'ANDA074910', dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseProfile: 'TWICE_DAILY' });
    expect(byId.get('SRC-B4-CARTIA-XT-ACTAVIS-SPL21')?.metadata).toMatchObject({ setId: '2dc2b889-8443-4f7f-83be-86c68e179804', splVersion: 21, applicationNumber: 'ANDA074752', releaseProfile: 'ONCE_DAILY' });
    expect(byId.get('SRC-B4-DILTIAZEM-SLATERUN-ER-TABLET-SPL10')?.metadata).toMatchObject({ setId: 'f7137458-0db3-7ecd-e053-6394a90a5f95', splVersion: 10, applicationNumber: 'ANDA216439', dosageForm: 'TABLET, EXTENDED RELEASE', releaseProfile: 'ONCE_DAILY' });
  });

  it('pins verapamil standard, ER tablet, and historical Verelan PM provenance', () => {
    const byId = new Map(batch04NonDhpCcbIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-VERAPAMIL-ACTAVIS-TABLET-SPL16')?.metadata).toMatchObject({ setId: 'a0343397-897b-46d6-943f-a87e07e1de10', splVersion: 16, applicationNumber: 'ANDA072924; ANDA070995; ANDA070994', releaseForm: 'STANDARD' });
    expect(byId.get('SRC-B4-VERAPAMIL-GLENMARK-ER-TABLET-SPL11')?.metadata).toMatchObject({ setId: 'ba1bf1ae-9347-4d17-998b-14bf7b5984ce', splVersion: 11, applicationNumber: 'ANDA090700; ANDA078906', releaseForm: 'EXTENDED_RELEASE' });
    expect(byId.get('SRC-B4-VERELAN-PM-LANNETT-SPL12')?.metadata).toMatchObject({ setId: 'fd1b433f-1895-4af0-9d1f-3901c6d34c20', splVersion: 12, applicationNumber: 'NDA020943', releaseProfile: 'CONTROLLED_ONSET_BEDTIME', historicalMarketingEndDate: '2026-05-31' });
    expect(batch04NonDhpCcbMarketingStatusAtoms[0]?.claim).toContain('2026-05-31');
  });

  it('keeps all product evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch04NonDhpCcbIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    for (const atom of batch04NonDhpCcbIdentityAtoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const rule = batch04NonDhpCcbReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(7);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
