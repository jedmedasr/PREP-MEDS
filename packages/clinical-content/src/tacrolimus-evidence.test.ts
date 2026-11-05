import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { tacrolimusIdentityDefinitions as definitions, tacrolimusIdentityEvidence as evidence, tacrolimusIdentitySources as sources, tacrolimusReviewRules as rules } from './tacrolimus-evidence.js';

describe('tacrolimus evidence', () => {
  it('validates five route/form/release-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
  });
  it('preserves immediate-release, extended-release, suspension, and intravenous distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-PROGRAF-CAPSULE-ASTELLAS-NDA050708')?.metadata).toMatchObject({ route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', applicationNumber: 'NDA050708' });
    expect(byId.get('SRC-PROGRAF-INJECTION-ASTELLAS-NDA050709')?.metadata).toMatchObject({ route: 'INTRAVENOUS', applicationNumber: 'NDA050709' });
    expect(byId.get('SRC-ASTAGRAF-XL-ASTELLAS-NDA204096')?.metadata).toMatchObject({ dosageForm: 'CAPSULE, COATED, EXTENDED RELEASE', applicationNumber: 'NDA204096' });
    expect(byId.get('SRC-ENVARSUS-XR-VELOXIS-NDA206406')?.metadata).toMatchObject({ dosageForm: 'TABLET, EXTENDED RELEASE', applicationNumber: 'NDA206406' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ transplantOrganNotInferred: true, regimenNotInferred: true, troughConcentrationNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
