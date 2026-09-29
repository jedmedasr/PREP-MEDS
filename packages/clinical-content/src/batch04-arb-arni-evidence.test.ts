import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04ArbArniIdentityAtoms,
  batch04ArbArniIdentityDefinitions,
  batch04ArbArniIdentityEvidence,
  batch04ArbArniIdentitySources,
  batch04ArbArniReviewRules,
} from './batch04-arb-arni-evidence.js';

describe('Batch 04 ARB/ARNI evidence', () => {
  it('validates seven direct-label identity records', () => {
    expect(validateEvidenceBundle(batch04ArbArniIdentityEvidence)).toEqual([]);
    expect(batch04ArbArniIdentityDefinitions).toHaveLength(7);
    expect(batch04ArbArniIdentitySources).toHaveLength(7);
    expect(batch04ArbArniIdentityAtoms).toHaveLength(7);
  });

  it('pins exact DailyMed set, version, date, and application provenance', () => {
    const expected = [
      ['1dadbe02-289c-4312-9e65-40f3314dcc31', 14, '2025-11-17', 'ANDA090428'],
      ['a8c61488-4219-dfcb-e053-2a95a90a98a4', 4, '2026-01-19', 'ANDA204011'],
      ['2113a901-2612-4557-b86d-3afc006fb8bb', 11, '2025-11-25', 'ANDA203081'],
      ['d23fe59a-2ad6-4885-a0d8-2239048f05a3', 3, '2023-01-16', 'ANDA209119'],
      ['e5dbca00-4e1b-4479-b829-021b11bc021e', 9, '2025-11-17', 'ANDA207662'],
      ['29bddc43-2809-4e1f-ae35-2865e15e9bb6', 10, '2025-04-02', 'ANDA205150'],
      ['747eeb5c-ac2f-474f-b6d2-0586d12653a6', 2, '2026-03-18', 'ANDA213611'],
    ] as const;
    batch04ArbArniIdentitySources.forEach((source, index) => {
      const [setId, splVersion, effectiveDate, applicationNumber] = expected[index]!;
      expect(source.effectiveDate).toBe(effectiveDate);
      expect(source.metadata).toMatchObject({ setId, splVersion, applicationNumber, route: 'ORAL', dosageForm: 'TABLET' });
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    });
  });

  it('keeps all atoms descriptive and preserves the ARNI as one whole product', () => {
    for (const atom of batch04ArbArniIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const arni = batch04ArbArniIdentityAtoms.find((atom) => atom.id === 'EVD-B4-SACUBITRIL-VALSARTAN-IDENTITY');
    expect(arni?.applicability.ingredientIds).toEqual(['ING-sacubitril', 'ING-valsartan']);
    expect(arni?.limitations).toContain('Sacubitril/valsartan remains one whole-product identity and must not be split into independent medication instructions.');
  });

  it('defines timing-free review-only ARB and ARNI guards', () => {
    const arb = batch04ArbArniReviewRules.find((rule) => rule.id === 'RULE-B4-ARB-POLICY-REVIEW-001');
    expect(arb?.scope.medicationIds).toHaveLength(6);
    expect(arb?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arb?.timingRule).toBeUndefined();
    const arni = batch04ArbArniReviewRules.find((rule) => rule.id === 'RULE-B4-ARNI-PRODUCT-REVIEW-001');
    expect(arni?.scope.medicationIds).toEqual(['MED-sacubitril-valsartan']);
    expect(arni?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(arni?.timingRule).toBeUndefined();
  });
});
