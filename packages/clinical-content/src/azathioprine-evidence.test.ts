import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { azathioprineIdentityDefinitions as definitions, azathioprineIdentityEvidence as evidence, azathioprineIdentitySources as sources, azathioprineReviewRules as rules } from './azathioprine-evidence.js';

describe('azathioprine evidence', () => {
  it('validates oral-tablet and intravenous identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(2);
    expect(sources).toHaveLength(2);
  });
  it('preserves route/form and salt distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-IMURAN-TABLET-LEGACY-NDA016324')?.metadata).toMatchObject({ route: 'ORAL', dosageForm: 'TABLET', applicationNumber: 'NDA016324' });
    expect(byId.get('SRC-AZATHIOPRINE-SODIUM-IV-HIKMA-ANDA074419')?.metadata).toMatchObject({ route: 'INTRAVENOUS', dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', applicationNumber: 'ANDA074419' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ indicationNotInferred: true, regimenNotInferred: true, tpmtNudt15StatusNotInferred: true, bloodCountNotInferred: true, infectionDecisionReviewOnly: true, interactionDecisionReviewOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
