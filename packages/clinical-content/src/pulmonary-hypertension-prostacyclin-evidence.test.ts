import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { pulmonaryHypertensionProstacyclinIdentityDefinitions as definitions, pulmonaryHypertensionProstacyclinIdentityEvidence as evidence, pulmonaryHypertensionProstacyclinReviewRules as rules } from './pulmonary-hypertension-prostacyclin-evidence.js';

describe('pulmonary hypertension prostacyclin-pathway evidence', () => {
  it('validates seven bounded direct-label route/form/device identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(7);
    expect(evidence.sources).toHaveLength(6);
    expect(evidence.atoms).toHaveLength(7);
  });
  it('preserves infusion, inhalation, oral, and intravenous distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(7);
    expect(definitions.filter((item) => item.ingredientIds.includes('ING-treprostinil'))).toHaveLength(4);
    expect(definitions.filter((item) => item.ingredientIds.includes('ING-selexipag'))).toHaveLength(2);
    expect(definitions.find((item) => item.medicationId === 'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion')?.routeContext).toBe('SUBCUTANEOUS_OR_INTRAVENOUS');
    expect(definitions.find((item) => item.medicationId === 'MED-tyvaso-dpi-treprostinil-inhalation-powder')?.deliveryContext).toBe('DRY_POWDER_INHALER');
  });
  it('keeps review routing draft and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(evidence.sources.every((source) => source.metadata?.clinicalApprovalGranted === false)).toBe(true);
  });
});
