import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04DhpCcbIdentityAtoms,
  batch04DhpCcbIdentityDefinitions,
  batch04DhpCcbIdentityEvidence,
  batch04DhpCcbIdentitySources,
  batch04DhpCcbReviewRules,
} from './batch04-dhp-ccb-evidence.js';

describe('Batch 04 dihydropyridine CCB evidence', () => {
  it('validates four formulation-aware identities', () => {
    expect(validateEvidenceBundle(batch04DhpCcbIdentityEvidence)).toEqual([]);
    expect(batch04DhpCcbIdentityDefinitions).toHaveLength(4);
    expect(batch04DhpCcbIdentitySources).toHaveLength(4);
    expect(batch04DhpCcbIdentityAtoms).toHaveLength(4);
    expect(batch04DhpCcbReviewRules).toHaveLength(1);
  });

  it('pins direct source provenance and non-authorizing flags', () => {
    const byId = new Map(batch04DhpCcbIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-AMLODIPINE-ASCEND-SPL20')?.metadata).toMatchObject({ setId: '3f4703c0-0b9e-41a0-8b70-da26683d9ed2', splVersion: 20, applicationNumber: 'ANDA078925', route: 'ORAL', dosageForm: 'TABLET', releaseForm: 'STANDARD' });
    expect(byId.get('SRC-B4-NIFEDIPINE-AVET-CAPSULE-SPL17')?.metadata).toMatchObject({ setId: 'b8b8cfee-ea71-44c2-81af-675efecfdf15', splVersion: 17, applicationNumber: 'ANDA202644', dosageForm: 'CAPSULE', releaseForm: 'STANDARD' });
    expect(byId.get('SRC-B4-NIFEDIPINE-INGENUS-ER-SPL6')?.metadata).toMatchObject({ setId: '4d3e11d2-d320-45d3-96c8-48322202b504', splVersion: 6, applicationNumber: 'ANDA210614', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE' });
    expect(byId.get('SRC-B4-FELODIPINE-AVET-ER-SPL8')?.metadata).toMatchObject({ setId: '0bef7cf2-012b-4804-ac93-0a8b333035db', splVersion: 8, applicationNumber: 'ANDA201964', dosageForm: 'TABLET, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE' });
    for (const source of batch04DhpCcbIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps identity evidence descriptive and review routing timing-free', () => {
    for (const atom of batch04DhpCcbIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const rule = batch04DhpCcbReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(4);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
