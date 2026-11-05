import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { parkinsonAmantadineIdentityDefinitions as definitions, parkinsonAmantadineIdentityEvidence as evidence, parkinsonAmantadineIdentitySources as sources, parkinsonAmantadineReviewRules as rules } from './parkinson-amantadine-evidence.js';

describe('Parkinson amantadine evidence', () => {
  it('validates five route/form/release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
    expect(new Set(definitions.map((item) => item.releaseContext))).toEqual(new Set(['IMMEDIATE_RELEASE', 'EXTENDED_RELEASE']));
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, formulationConversionAuthorized: false, releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
