import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { parkinsonOralDopamineAgonistIdentityDefinitions as definitions, parkinsonOralDopamineAgonistIdentityEvidence as evidence, parkinsonOralDopamineAgonistIdentitySources as sources, parkinsonOralDopamineAgonistReviewRules as rules } from './parkinson-oral-dopamine-agonist-evidence.js';

describe('Parkinson oral dopamine-agonist evidence', () => {
  it('validates four ingredient/release-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(sources).toHaveLength(4);
  });
  it('preserves IR/ER and labeled-indication boundaries', () => {
    for (const ingredient of ['pramipexole', 'ropinirole']) {
      const matches = definitions.filter((item) => item.medicationId.includes(ingredient));
      expect(matches.map((item) => item.releaseProfile)).toEqual(['IMMEDIATE_RELEASE', 'EXTENDED_RELEASE']);
      expect(matches.map((item) => item.labeledIndicationContext)).toEqual(['PARKINSON_AND_RLS', 'PARKINSON_ONLY']);
    }
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
