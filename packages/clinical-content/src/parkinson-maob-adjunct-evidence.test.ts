import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { parkinsonMaobAdjunctIdentityDefinitions as definitions, parkinsonMaobAdjunctIdentityEvidence as evidence, parkinsonMaobAdjunctIdentitySources as sources, parkinsonMaobAdjunctReviewRules as rules } from './parkinson-maob-adjunct-evidence.js';

describe('Parkinson MAO-B adjunct evidence', () => {
  it('validates two indication-specific oral identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(2);
    expect(sources).toHaveLength(2);
  });
  it('preserves rasagiline and XADAGO indication boundaries', () => {
    expect(definitions.map((item) => item.labeledIndicationContext)).toEqual([
      'PARKINSON_MONOTHERAPY_OR_ADJUNCT',
      'PARKINSON_ADJUNCT_LEVODOPA_OFF_EPISODES',
    ]);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, doseConversionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
