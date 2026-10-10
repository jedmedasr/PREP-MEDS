import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { mycophenolateIdentityDefinitions as definitions, mycophenolateIdentityEvidence as evidence, mycophenolateIdentitySources as sources, mycophenolateReviewRules as rules } from './mycophenolate-evidence.js';

describe('mycophenolate evidence', () => {
  it('validates five route/form/release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
  });
  it('preserves CellCept form and Myfortic non-interchangeability distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-CELLCEPT-CAPSULE-GENENTECH-NDA050723')?.metadata).toMatchObject({ dosageForm: 'CAPSULE', applicationNumber: 'NDA050723' });
    expect(byId.get('SRC-CELLCEPT-TABLET-GENENTECH-NDA050722')?.metadata).toMatchObject({ dosageForm: 'TABLET, FILM COATED', applicationNumber: 'NDA050722' });
    expect(byId.get('SRC-CELLCEPT-SUSPENSION-GENENTECH-NDA050758')?.metadata).toMatchObject({ route: 'ORAL', applicationNumber: 'NDA050758' });
    expect(byId.get('SRC-CELLCEPT-IV-GENENTECH-NDA050759')?.metadata).toMatchObject({ route: 'INTRAVENOUS', applicationNumber: 'NDA050759' });
    expect(byId.get('SRC-MYFORTIC-DR-NOVARTIS-NDA050791')?.metadata).toMatchObject({ releaseContext: 'DELAYED_RELEASE', nonInterchangeabilityPreserved: true, applicationNumber: 'NDA050791' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ indicationNotInferred: true, regimenNotInferred: true, monitoringNotInferred: true, nonInterchangeabilityPreserved: true, infectionDecisionReviewOnly: true, giRiskDecisionReviewOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
