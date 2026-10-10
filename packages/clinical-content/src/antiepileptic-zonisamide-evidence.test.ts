import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticZonisamideIdentityDefinitions as definitions, antiepilepticZonisamideIdentityEvidence as evidence, antiepilepticZonisamideIdentitySources as sources, antiepilepticZonisamideReviewRules as rules } from './antiepileptic-zonisamide-evidence.js';

describe('Antiepileptic zonisamide evidence', () => {
  it('validates capsule and oral-suspension identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(2);
    expect(sources).toHaveLength(2);
    expect(new Set(definitions.map((item) => item.formulationContext))).toEqual(new Set(['CAPSULE', 'ORAL_SUSPENSION']));
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
