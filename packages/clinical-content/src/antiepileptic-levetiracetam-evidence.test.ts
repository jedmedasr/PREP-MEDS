import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticLevetiracetamIdentityDefinitions as definitions, antiepilepticLevetiracetamIdentityEvidence as evidence, antiepilepticLevetiracetamIdentitySources as sources, antiepilepticLevetiracetamReviewRules as rules } from './antiepileptic-levetiracetam-evidence.js';

describe('Antiepileptic levetiracetam evidence', () => {
  it('validates five route/form/release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
    expect(new Set(definitions.map((item) => item.route))).toEqual(new Set(['ORAL', 'INTRAVENOUS']));
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
