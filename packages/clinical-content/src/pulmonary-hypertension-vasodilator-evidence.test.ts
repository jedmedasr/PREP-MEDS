import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { pulmonaryHypertensionVasodilatorIdentityDefinitions as definitions, pulmonaryHypertensionVasodilatorIdentityEvidence as evidence, pulmonaryHypertensionVasodilatorReviewRules as rules } from './pulmonary-hypertension-vasodilator-evidence.js';

describe('remaining pulmonary hypertension therapy evidence', () => {
  it('validates thirteen bounded direct-label identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(13);
    expect(evidence.sources).toHaveLength(10);
    expect(evidence.atoms).toHaveLength(13);
  });
  it('preserves route, form, fixed-combination, and indication boundaries', () => {
    expect(definitions.filter((item) => item.ingredientIds.includes('ING-sildenafil'))).toHaveLength(3);
    expect(definitions.filter((item) => item.ingredientIds.includes('ING-bosentan'))).toHaveLength(2);
    expect(definitions.find((item) => item.medicationId === 'MED-opsynvi-macitentan-tadalafil-oral-tablet')?.ingredientIds).toEqual(['ING-macitentan', 'ING-tadalafil']);
    expect(definitions.filter((item) => item.ingredientIds.includes('ING-iloprost'))).toHaveLength(2);
    expect(definitions.find((item) => item.medicationId === 'MED-aurlumyn-iloprost-intravenous-injection')?.productContext).toBe('NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD');
  });
  it('keeps all routing draft, review-only, and timing-free', () => {
    expect(rules).toHaveLength(2);
    expect(rules.every((rule) => rule.disposition === 'CLINICIAN_REVIEW_REQUIRED')).toBe(true);
    expect(rules.every((rule) => rule.timingRule === undefined)).toBe(true);
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(evidence.sources.every((source) => source.metadata?.clinicalApprovalGranted === false)).toBe(true);
  });
});
