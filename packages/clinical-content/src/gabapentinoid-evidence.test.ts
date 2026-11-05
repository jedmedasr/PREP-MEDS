import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { gabapentinoidIdentityDefinitions as definitions, gabapentinoidIdentityEvidence as evidence, gabapentinoidReviewRules as rules } from './gabapentinoid-evidence.js';

describe('gabapentinoid evidence', () => {
  it('validates bounded direct-label identities plus FDA respiratory-risk context', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(8);
    expect(evidence.sources).toHaveLength(6);
    expect(evidence.atoms).toHaveLength(9);
  });
  it('preserves ingredient, prodrug, dosage-form, release, and whole-product distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(8);
    expect(new Set(definitions.flatMap((item) => item.ingredientIds))).toEqual(new Set(['ING-gabapentin', 'ING-gabapentin-enacarbil', 'ING-pregabalin']));
    expect(new Set(definitions.map((item) => item.releaseContext))).toEqual(new Set(['IMMEDIATE_RELEASE', 'EXTENDED_RELEASE']));
  });
  it('keeps review routing draft and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
  });
});
