import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { pulmonaryControllerCombinationIdentityDefinitions as definitions, pulmonaryControllerCombinationIdentityEvidence as evidence, pulmonaryControllerCombinationReviewRules as rules } from './pulmonary-controller-combination-evidence.js';

describe('pulmonary controller combination evidence', () => {
  it('validates seven bounded direct-label whole-product identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(7);
    expect(evidence.sources).toHaveLength(7);
    expect(evidence.atoms).toHaveLength(7);
  });
  it('preserves device, ingredient, and dual-versus-triple combination distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(7);
    expect(new Set(definitions.map((item) => item.deviceContext))).toEqual(new Set(['PRESSURIZED_METERED_DOSE_INHALER', 'DISKUS_DRY_POWDER_INHALER', 'ELLIPTA_DRY_POWDER_INHALER', 'AEROSPHERE_PRESSURIZED_METERED_DOSE_INHALER']));
    expect(definitions.filter((item) => item.combinationContext === 'ICS_LABA')).toHaveLength(5);
    expect(definitions.filter((item) => item.combinationContext === 'ICS_LAMA_LABA')).toHaveLength(2);
  });
  it('keeps review routing draft and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
  });
});
