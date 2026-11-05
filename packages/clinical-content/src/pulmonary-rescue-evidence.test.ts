import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { pulmonaryRescueIdentityDefinitions as definitions, pulmonaryRescueIdentityEvidence as evidence, pulmonaryRescueReviewRules as rules } from './pulmonary-rescue-evidence.js';

describe('pulmonary rescue evidence', () => {
  it('validates eight bounded direct-label identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(8);
    expect(evidence.sources).toHaveLength(8);
    expect(evidence.atoms).toHaveLength(8);
  });
  it('preserves ingredient, device, form, and whole-combination distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(8);
    expect(new Set(definitions.flatMap((item) => item.ingredientIds))).toEqual(new Set(['ING-albuterol', 'ING-levalbuterol', 'ING-ipratropium']));
    expect(new Set(definitions.map((item) => item.deliveryContext))).toEqual(new Set(['PRESSURIZED_METERED_DOSE_INHALER', 'NEBULIZER', 'RESPIMAT']));
    expect(definitions.filter((item) => item.ingredientIds.length === 2)).toHaveLength(2);
  });
  it('keeps review routing draft and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
  });
});
