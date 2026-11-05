import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { parkinsonComtIdentityDefinitions as definitions, parkinsonComtIdentityEvidence as evidence, parkinsonComtIdentitySources as sources, parkinsonComtReviewRules as rules } from './parkinson-comt-evidence.js';

describe('Parkinson COMT evidence', () => {
  it('validates three adjunct identities and one whole-product identity', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(sources).toHaveLength(4);
    expect(definitions.find((item) => item.medicationId.includes('carbidopa-levodopa-entacapone'))?.ingredientIds).toEqual(['ING-carbidopa', 'ING-levodopa', 'ING-entacapone']);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, combinationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
