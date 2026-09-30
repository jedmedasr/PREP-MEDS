import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { parkinsonCoreIdentityDefinitions as definitions, parkinsonCoreIdentityEvidence as evidence, parkinsonCoreIdentitySources as sources, parkinsonCoreReviewRules as rules } from './parkinson-core-evidence.js';

describe('Parkinson core evidence', () => {
  it('validates seven route/form/release/device-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(7);
    expect(sources).toHaveLength(7);
  });
  it('preserves oral, enteral, inhaled, transdermal, and release distinctions', () => {
    expect(definitions.find((item) => item.medicationId.includes('duopa'))).toMatchObject({ route: 'ENTERAL', deliveryContext: 'ENTERAL_PUMP' });
    expect(definitions.find((item) => item.medicationId.includes('inbrija'))).toMatchObject({ route: 'ORAL_INHALATION', dosageForm: 'CAPSULE FOR INHALATION', deliveryContext: 'INHALER_ONLY' });
    expect(definitions.find((item) => item.medicationId.includes('neupro'))).toMatchObject({ route: 'TRANSDERMAL', releaseProfile: 'EXTENDED_RELEASE' });
    expect(definitions.filter((item) => item.dosageForm === 'CAPSULE, EXTENDED RELEASE')).toHaveLength(2);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, routeConversionAuthorized: false, deviceConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
