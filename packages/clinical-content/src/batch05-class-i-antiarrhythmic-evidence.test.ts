import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch05ClassIAntiarrhythmicIdentityAtoms,
  batch05ClassIAntiarrhythmicIdentityDefinitions,
  batch05ClassIAntiarrhythmicIdentityEvidence,
  batch05ClassIAntiarrhythmicIdentitySources,
  batch05ClassIAntiarrhythmicReviewRules,
} from './batch05-class-i-antiarrhythmic-evidence.js';

describe('Batch 05 class I antiarrhythmic evidence', () => {
  it('validates six release/form-specific source-linked identities', () => {
    expect(validateEvidenceBundle(batch05ClassIAntiarrhythmicIdentityEvidence)).toEqual([]);
    expect(batch05ClassIAntiarrhythmicIdentityDefinitions).toHaveLength(6);
    expect(batch05ClassIAntiarrhythmicIdentitySources).toHaveLength(6);
    expect(batch05ClassIAntiarrhythmicIdentityAtoms).toHaveLength(6);
    expect(batch05ClassIAntiarrhythmicReviewRules).toHaveLength(1);
  });

  it('pins release/salt provenance without asserting substitution or availability', () => {
    const byId = new Map(batch05ClassIAntiarrhythmicIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B5-PROPAFENONE-ER-VITRUVIAS-SPL3')?.metadata).toMatchObject({ setId: 'bc1d2548-15a3-4986-92b1-c3ddfb35343a', dosageForm: 'CAPSULE, EXTENDED RELEASE', formulationConversionAuthorized: false });
    expect(byId.get('SRC-B5-QUINIDINE-SULFATE-EON-SPL8')?.metadata).toMatchObject({ applicationNumber: 'ANDA088072', labelListedMarketingEndDate: '2025-05-31', marketAvailabilityAsserted: false });
    expect(byId.get('SRC-B5-QUINIDINE-GLUCONATE-GSMS-SPL2')?.metadata).toMatchObject({ applicationNumber: 'ANDA089338', dosageForm: 'TABLET, EXTENDED RELEASE' });
  });

  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch05ClassIAntiarrhythmicIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.formulationConversionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    const rule = batch05ClassIAntiarrhythmicReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(6);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
