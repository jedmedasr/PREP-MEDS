import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticLacosamideIdentityDefinitions as definitions, antiepilepticLacosamideIdentityEvidence as evidence, antiepilepticLacosamideIdentitySources as sources, antiepilepticLacosamideReviewRules as rules } from './antiepileptic-lacosamide-evidence.js';

describe('Antiepileptic lacosamide evidence', () => {
  it('validates three route/form identities and distinct NDA provenance', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(3);
    expect(sources).toHaveLength(3);
    expect(new Set(definitions.map((item) => item.route))).toEqual(new Set(['ORAL', 'INTRAVENOUS']));
    expect(new Set(definitions.map((item) => item.applicationNumber))).toEqual(new Set(['NDA022253', 'NDA022254', 'NDA022255']));
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
