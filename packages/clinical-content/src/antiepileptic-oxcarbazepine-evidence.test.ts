import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticOxcarbazepineIdentityDefinitions as definitions, antiepilepticOxcarbazepineIdentityEvidence as evidence, antiepilepticOxcarbazepineIdentitySources as sources, antiepilepticOxcarbazepineReviewRules as rules } from './antiepileptic-oxcarbazepine-evidence.js';

describe('Antiepileptic oxcarbazepine evidence', () => {
  it('validates tablet, suspension, and extended-release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(3);
    expect(sources).toHaveLength(3);
    expect(new Set(definitions.map((item) => item.releaseContext))).toEqual(new Set(['IMMEDIATE_RELEASE', 'EXTENDED_RELEASE', 'NOT_APPLICABLE']));
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
