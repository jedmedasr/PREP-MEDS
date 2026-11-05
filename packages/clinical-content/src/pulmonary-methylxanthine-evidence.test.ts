import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { pulmonaryMethylxanthineIdentityDefinitions as definitions, pulmonaryMethylxanthineIdentityEvidence as evidence, pulmonaryMethylxanthineReviewRules as rules } from './pulmonary-methylxanthine-evidence.js';

describe('pulmonary methylxanthine evidence', () => {
  it('validates four bounded direct-label route/form/release identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(evidence.sources).toHaveLength(4);
    expect(evidence.atoms).toHaveLength(4);
  });
  it('preserves route, dosage-form, release, and ingredient distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(4);
    expect(new Set(definitions.map((item) => item.releaseFormContext))).toEqual(new Set(['ORAL_SOLUTION_NON_EXTENDED_RELEASE', 'EXTENDED_RELEASE_TABLET', 'EXTENDED_RELEASE_CAPSULE', 'PARENTERAL_INJECTION']));
    expect(definitions.filter((item) => item.routeContext === 'ORAL')).toHaveLength(3);
    expect(definitions.filter((item) => item.routeContext === 'INTRAVENOUS')).toHaveLength(1);
    expect(definitions.find((item) => item.medicationId === 'MED-aminophylline-intravenous-injection')?.ingredientContext).toBe('AMINOPHYLLINE_DIHYDRATE');
  });
  it('keeps review routing draft and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
  });
});
