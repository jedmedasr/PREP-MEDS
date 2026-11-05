import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  periproceduralBuprenorphineIdentityAtoms,
  periproceduralBuprenorphineIdentityDefinitions,
  periproceduralBuprenorphineIdentityEvidence,
  periproceduralBuprenorphineIdentitySources,
  periproceduralBuprenorphineReviewRules,
} from './periprocedural-buprenorphine-evidence.js';

describe('periprocedural buprenorphine evidence', () => {
  it('validates six route/form/indication-specific source-linked identities', () => {
    expect(validateEvidenceBundle(periproceduralBuprenorphineIdentityEvidence)).toEqual([]);
    expect(periproceduralBuprenorphineIdentityDefinitions).toHaveLength(6);
    expect(periproceduralBuprenorphineIdentitySources).toHaveLength(6);
    expect(periproceduralBuprenorphineIdentityAtoms).toHaveLength(6);
  });

  it('preserves whole combinations, routes, release, and indication context', () => {
    const byId = new Map(periproceduralBuprenorphineIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-SUBOXONE-FILM-INDIVIOR-NDA022410')?.metadata).toMatchObject({ route: 'SUBLINGUAL OR BUCCAL', dosageForm: 'FILM, SOLUBLE', applicationNumber: 'NDA022410', indicationContext: 'OPIOID_USE_DISORDER' });
    expect(byId.get('SRC-BELBUCA-BUCCAL-BDSI-NDA207932')?.metadata).toMatchObject({ route: 'BUCCAL', indicationContext: 'SEVERE_PERSISTENT_PAIN' });
    expect(byId.get('SRC-SUBLOCADE-SC-INDIVIOR-NDA209819')?.metadata).toMatchObject({ route: 'SUBCUTANEOUS', dosageForm: 'INJECTION, EXTENDED RELEASE SOLUTION', applicationNumber: 'NDA209819' });
  });

  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of periproceduralBuprenorphineIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    const rule = periproceduralBuprenorphineReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(6);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
