import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralMethadoneNaltrexoneIdentityDefinitions as definitions, periproceduralMethadoneNaltrexoneIdentityEvidence as evidence, periproceduralMethadoneNaltrexoneIdentitySources as sources, periproceduralMethadoneNaltrexoneReviewRules as rules } from './periprocedural-methadone-naltrexone-evidence.js';

describe('periprocedural methadone/naltrexone evidence', () => {
  it('validates four route/form/indication-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(sources).toHaveLength(4);
  });
  it('preserves formulation, release, and indication context', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-METHADONE-CONCENTRATE-HIKMA-ANDA089897')?.metadata).toMatchObject({ route: 'ORAL', dosageForm: 'CONCENTRATE', indicationContext: 'OPIOID-ADDICTION DETOXIFICATION OR MAINTENANCE' });
    expect(byId.get('SRC-VIVITROL-IM-ALKERMES-NDA021897')?.metadata).toMatchObject({ route: 'INTRAMUSCULAR', dosageForm: 'INJECTION, POWDER, FOR SUSPENSION, EXTENDED RELEASE', applicationNumber: 'NDA021897' });
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
