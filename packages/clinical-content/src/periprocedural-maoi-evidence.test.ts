import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralMaoiIdentityDefinitions as definitions, periproceduralMaoiIdentityEvidence as evidence, periproceduralMaoiIdentitySources as sources, periproceduralMaoiReviewRules as rules } from './periprocedural-maoi-evidence.js';

describe('periprocedural MAOI evidence', () => {
  it('validates five route/form/subtype-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
  });
  it('preserves oral nonselective versus transdermal identity context', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-PARNATE-ADVANZ-NDA012342')?.metadata).toMatchObject({ route: 'ORAL', maoiContext: 'NONSELECTIVE_IRREVERSIBLE_MAOI', applicationNumber: 'NDA012342' });
    expect(byId.get('SRC-EMSAM-NOVEN-NDA021336')?.metadata).toMatchObject({ route: 'TRANSDERMAL', dosageForm: 'TRANSDERMAL SYSTEM', applicationNumber: 'NDA021336' });
    expect(byId.get('SRC-SELEGILINE-ORAL-APOTEX-ANDA074871')?.metadata).toMatchObject({ route: 'ORAL', maoiContext: 'SELECTIVE_MAO_B_ADJUNCT', applicationNumber: 'ANDA074871' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
