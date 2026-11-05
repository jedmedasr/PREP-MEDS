import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralLithiumIdentityDefinitions as definitions, periproceduralLithiumIdentityEvidence as evidence, periproceduralLithiumIdentitySources as sources, periproceduralLithiumReviewRules as rules } from './periprocedural-lithium-evidence.js';
describe('periprocedural lithium evidence', () => {
  it('validates four chemical-form/form/release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(sources).toHaveLength(2);
  });
  it('preserves carbonate/citrate and immediate/extended-release distinctions', () => {
    expect(definitions.find((item) => item.medicationId.includes('lithobid'))?.releaseContext).toBe('EXTENDED_RELEASE');
    expect(definitions.find((item) => item.medicationId.includes('citrate'))?.chemicalForm).toBe('LITHIUM_CITRATE');
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
