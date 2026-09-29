import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { batch04PotassiumSparingIdentityAtoms, batch04PotassiumSparingIdentityDefinitions, batch04PotassiumSparingIdentityEvidence, batch04PotassiumSparingIdentitySources, batch04PotassiumSparingReviewRules } from './batch04-potassium-sparing-evidence.js';

describe('Batch 04 potassium-sparing/MRA evidence', () => {
  it('validates nine source-linked standalone and fixed-combination identities', () => {
    expect(validateEvidenceBundle(batch04PotassiumSparingIdentityEvidence)).toEqual([]);
    expect(batch04PotassiumSparingIdentityDefinitions).toHaveLength(9);
    expect(batch04PotassiumSparingIdentitySources).toHaveLength(9);
    expect(batch04PotassiumSparingIdentityAtoms).toHaveLength(9);
    expect(batch04PotassiumSparingReviewRules).toHaveLength(1);
  });
  it('pins direct DailyMed provenance and composition metadata', () => {
    const byId = new Map(batch04PotassiumSparingIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-SPIRONOLACTONE-SUN-SPL16')?.metadata).toMatchObject({ setId: 'c23b6b9b-aec3-48a8-a518-76e4097f6479', splVersion: 16, applicationNumber: 'ANDA089424', combination: false });
    expect(byId.get('SRC-B4-CAROSPIR-CMP-SPL7')?.metadata).toMatchObject({ applicationNumber: 'NDA209478', dosageForm: 'SUSPENSION' });
    expect(byId.get('SRC-B4-EPLERENONE-BRECKENRIDGE-SPL8')?.metadata).toMatchObject({ applicationNumber: 'ANDA208283' });
    expect(byId.get('SRC-B4-AMILORIDE-PAR-SPL13')?.metadata).toMatchObject({ applicationNumber: 'ANDA070346' });
    expect(byId.get('SRC-B4-DYRENIUM-ADVANZ-SPL11')?.metadata).toMatchObject({ applicationNumber: 'NDA013174', dosageForm: 'CAPSULE' });
    expect(byId.get('SRC-B4-TRIAMTERENE-HCTZ-SANDOZ-CAPSULE-SPL24')?.metadata).toMatchObject({ combination: true, dosageForm: 'CAPSULE', applicationNumber: 'ANDA074821' });
    expect(byId.get('SRC-B4-TRIAMTERENE-HCTZ-ACTAVIS-TABLET-SPL17')?.metadata).toMatchObject({ combination: true, dosageForm: 'TABLET', applicationNumber: 'ANDA073449; ANDA071851' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch04PotassiumSparingIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.combinationSubstitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    for (const atom of batch04PotassiumSparingIdentityAtoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const rule = batch04PotassiumSparingReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(9);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
