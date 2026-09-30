import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { systemicCorticosteroidIdentityDefinitions as definitions, systemicCorticosteroidIdentityEvidence as evidence, systemicCorticosteroidIdentitySources as sources, systemicCorticosteroidReviewRules as rules } from './systemic-corticosteroid-evidence.js';

describe('systemic corticosteroid evidence', () => {
  it('validates eight route/form/release-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(8);
    expect(sources).toHaveLength(8);
  });
  it('preserves release and oral-versus-injectable distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-PREDNISONE-IR-QPHARMA-ANDA080292')?.metadata).toMatchObject({ route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', applicationNumber: 'ANDA080292' });
    expect(byId.get('SRC-PREDNISONE-DR-DRREDDYS-ANDA219477')?.metadata).toMatchObject({ route: 'ORAL', releaseContext: 'DELAYED_RELEASE', applicationNumber: 'ANDA219477' });
    expect(byId.get('SRC-SOLU-MEDROL-PFIZER-NDA011856')?.metadata).toMatchObject({ route: 'INTRAVENOUS_OR_INTRAMUSCULAR', applicationNumber: 'NDA011856' });
    expect(byId.get('SRC-SOLU-CORTEF-CARDINAL-NDA009866')?.metadata).toMatchObject({ route: 'INTRAVENOUS_OR_INTRAMUSCULAR', applicationNumber: 'NDA009866' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ chronicUseNotInferred: true, adrenalSuppressionNotInferred: true, stressDoseNeedNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
