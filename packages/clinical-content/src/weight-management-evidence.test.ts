import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { weightManagementIdentityDefinitions as definitions, weightManagementIdentityEvidence as evidence, weightManagementIdentitySources as sources, weightManagementReviewRules as rules } from './weight-management-evidence.js';

describe('weight-management evidence', () => {
  it('validates six form/release/combination-specific identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(6);
    expect(sources).toHaveLength(6);
  });
  it('preserves release, whole-combination, and prescription-versus-OTC context', () => {
    expect(definitions.find((item) => item.medicationId.includes('qsymia'))?.ingredientIds).toEqual(['ING-phentermine', 'ING-topiramate']);
    expect(definitions.find((item) => item.medicationId.includes('contrave'))?.ingredientIds).toEqual(['ING-naltrexone', 'ING-bupropion']);
    expect(definitions.find((item) => item.medicationId.includes('alli'))?.regulatoryContext).toBe('OTC');
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, combinationDecompositionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});
