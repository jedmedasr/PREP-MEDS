import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralStimulantIdentityDefinitions as definitions, periproceduralStimulantIdentityEvidence as evidence, periproceduralStimulantIdentitySources as sources, periproceduralStimulantReviewRules as rules } from './periprocedural-stimulant-evidence.js';

describe('periprocedural stimulant evidence', () => {
  it('validates six form/release/indication-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(6);
    expect(sources).toHaveLength(6);
  });
  it('preserves mixed-salt, release, dosage-form, and indication context', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-ADDERALL-XR-TAKEDA-NDA021303')?.metadata).toMatchObject({ dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseProfile: 'EXTENDED_RELEASE', applicationNumber: 'NDA021303' });
    expect(byId.get('SRC-VYVANSE-CHEWABLE-TAKEDA-NDA208510')?.metadata).toMatchObject({ dosageForm: 'TABLET, CHEWABLE', applicationNumber: 'NDA208510' });
    expect(definitions[0]?.ingredientIds).toEqual(['ING-amphetamine', 'ING-dextroamphetamine']);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
