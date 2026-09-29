import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04OtherAntihypertensiveIdentityAtoms,
  batch04OtherAntihypertensiveIdentityDefinitions,
  batch04OtherAntihypertensiveIdentityEvidence,
  batch04OtherAntihypertensiveIdentitySources,
  batch04OtherAntihypertensiveReviewRules,
} from './batch04-other-antihypertensive-evidence.js';

describe('Batch 04 remaining antihypertensive evidence', () => {
  it('validates six route/form-specific source-linked identities', () => {
    expect(validateEvidenceBundle(batch04OtherAntihypertensiveIdentityEvidence)).toEqual([]);
    expect(batch04OtherAntihypertensiveIdentityDefinitions).toHaveLength(6);
    expect(batch04OtherAntihypertensiveIdentitySources).toHaveLength(6);
    expect(batch04OtherAntihypertensiveIdentityAtoms).toHaveLength(6);
    expect(batch04OtherAntihypertensiveReviewRules).toHaveLength(1);
  });

  it('pins direct DailyMed provenance without asserting availability', () => {
    const byId = new Map(batch04OtherAntihypertensiveIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-CLONIDINE-CARDINAL-SPL6')?.metadata).toMatchObject({ setId: 'df62817d-2f50-4c27-aaa8-a22f0290c94f', splVersion: 6, route: 'ORAL', dosageForm: 'TABLET' });
    expect(byId.get('SRC-B4-CATAPRES-TTS-TECHNOMED-SPL4')?.metadata).toMatchObject({ setId: 'd4a55825-7041-42f4-b3b2-dd7a25dbe793', splVersion: 4, route: 'TRANSDERMAL', dosageForm: 'PATCH', labelListedMarketingEndDate: '2026-10-30', marketAvailabilityAsserted: false });
    expect(byId.get('SRC-B4-MINOXIDIL-SUN-SPL5')?.metadata).toMatchObject({ setId: '0354a7f5-5917-44dc-9963-411104008cb5', splVersion: 5, applicationNumber: 'ANDA072709' });
  });

  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch04OtherAntihypertensiveIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.routeConversionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    const rule = batch04OtherAntihypertensiveReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(6);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
