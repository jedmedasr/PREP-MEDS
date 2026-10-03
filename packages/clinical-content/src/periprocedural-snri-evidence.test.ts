import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralSnriIdentityDefinitions as definitions, periproceduralSnriIdentityEvidence as evidence, periproceduralSnriIdentitySources as sources, periproceduralSnriReviewRules as rules } from './periprocedural-snri-evidence.js';
describe('periprocedural SNRI evidence', () => {
  it('validates four route/form/release identities', () => { expect(validateEvidenceBundle(evidence)).toEqual([]); expect(definitions).toHaveLength(4); expect(sources).toHaveLength(4); });
  it('preserves immediate, extended, and delayed release', () => {
    expect(definitions.find((x) => x.medicationId.includes('venlafaxine-immediate'))?.releaseContext).toBe('IMMEDIATE_RELEASE');
    expect(definitions.find((x) => x.medicationId.includes('venlafaxine-extended'))?.releaseContext).toBe('EXTENDED_RELEASE');
    expect(definitions.find((x) => x.medicationId.includes('duloxetine-delayed'))?.releaseContext).toBe('DELAYED_RELEASE');
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) { expect(source.lifecycle).toBe('DRAFT'); expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false }); }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rules[0]?.timingRule).toBeUndefined();
  });
});
