import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04ArbArniIdentityAtoms,
  batch04ArbArniIdentityDefinitions,
  batch04ArbArniIdentityEvidence,
  batch04ArbArniIdentitySources,
  batch04ArbArniReviewRules,
  batch04RaasPolicyAtoms,
} from './batch04-arb-arni-evidence.js';

describe('Batch 04 ARB/ARNI evidence', () => {
  it('validates nine identity records plus three RAAS policy atoms', () => {
    expect(validateEvidenceBundle(batch04ArbArniIdentityEvidence)).toEqual([]);
    expect(batch04ArbArniIdentityDefinitions).toHaveLength(9);
    expect(batch04ArbArniIdentitySources).toHaveLength(11);
    expect(batch04ArbArniIdentityAtoms).toHaveLength(9);
    expect(batch04RaasPolicyAtoms).toHaveLength(3);
    expect(batch04ArbArniReviewRules).toHaveLength(2);
  });

  it('pins direct current ARB source provenance without asserting availability', () => {
    const byId = new Map(batch04ArbArniIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-LOSARTAN-ZYDUS-SPL22')?.metadata).toMatchObject({
      setId: '3233c707-70b6-4c29-8210-913eeb2a38ed', splVersion: 22, applicationNumber: 'ANDA078243', route: 'ORAL', dosageForm: 'TABLET, FILM COATED',
    });
    expect(byId.get('SRC-B4-VALSARTAN-MYLAN-SPL16')?.metadata).toMatchObject({
      setId: '73e01dc6-7dd4-421a-a4f6-137e75f69f9a', splVersion: 16, applicationNumber: 'ANDA090866', route: 'ORAL', dosageForm: 'TABLET, FILM COATED',
    });
    expect(byId.get('SRC-B4-IRBESARTAN-MACLEODS-SPL13')?.metadata).toMatchObject({
      setId: 'e8635a1c-ae06-4e23-99f7-e704f91d6f43', splVersion: 13, applicationNumber: 'ANDA202254', route: 'ORAL', dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-CANDESARTAN-VIONA-SPL4')?.metadata).toMatchObject({
      setId: '9da86c48-5911-4512-8c71-eca4a6418cf6', splVersion: 4, applicationNumber: 'ANDA091390', route: 'ORAL', dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-OLMESARTAN-AUROBINDO-SPL9')?.metadata).toMatchObject({
      setId: '8c94d403-809b-43b9-834f-3ecd330d2dd9', splVersion: 9, applicationNumber: 'ANDA204798', route: 'ORAL', dosageForm: 'TABLET, FILM COATED',
    });
    expect(byId.get('SRC-B4-TELMISARTAN-ALEMBIC-SPL11')?.metadata).toMatchObject({
      setId: 'c62d424c-7630-413c-be2c-3932831c3f1d', splVersion: 11, applicationNumber: 'ANDA202130', route: 'ORAL', dosageForm: 'TABLET',
    });

    for (const id of [
      'SRC-B4-LOSARTAN-ZYDUS-SPL22',
      'SRC-B4-VALSARTAN-MYLAN-SPL16',
      'SRC-B4-IRBESARTAN-MACLEODS-SPL13',
      'SRC-B4-CANDESARTAN-VIONA-SPL4',
      'SRC-B4-OLMESARTAN-AUROBINDO-SPL9',
      'SRC-B4-TELMISARTAN-ALEMBIC-SPL11',
    ]) {
      expect(byId.get(id)?.lifecycle).toBe('DRAFT');
      expect(byId.get(id)?.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(byId.get(id)?.metadata?.substitutionAuthorized).toBe(false);
      expect(byId.get(id)?.metadata?.clinicalApprovalGranted).toBe(false);
      expect(byId.get(id)?.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('preserves generic and branded sacubitril/valsartan source/formulation identities', () => {
    const byId = new Map(batch04ArbArniIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2')?.metadata).toMatchObject({
      setId: '747eeb5c-ac2f-474f-b6d2-0586d12653a6', splVersion: 2, applicationNumber: 'ANDA213611', route: 'ORAL', dosageForm: 'TABLET, FILM COATED',
    });
    expect(byId.get('SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2')?.effectiveDate).toBe('2026-03-17');

    const tablet = byId.get('SRC-B4-ENTRESTO-TABLET-SPL25');
    expect(tablet?.metadata).toMatchObject({
      setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', splVersion: 25, applicationNumber: 'NDA207620', route: 'ORAL', dosageForm: 'TABLET, FILM COATED',
    });
    expect(tablet?.effectiveDate).toBe('2026-07-06');

    const sprinkle = byId.get('SRC-B4-ENTRESTO-SPRINKLE-SPL25');
    expect(sprinkle?.metadata).toMatchObject({
      setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', splVersion: 25, applicationNumber: 'NDA218591', route: 'ORAL', dosageForm: 'PELLET',
    });
    expect(sprinkle?.effectiveDate).toBe('2026-07-06');

    for (const source of [byId.get('SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2'), tablet, sprinkle]) {
      expect(source?.lifecycle).toBe('DRAFT');
      expect(source?.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source?.metadata?.substitutionAuthorized).toBe(false);
      expect(source?.metadata?.componentSplittingAuthorized).toBe(false);
      expect(source?.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source?.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps identity and policy evidence non-action-authorizing', () => {
    for (const atom of batch04ArbArniIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    for (const atom of batch04RaasPolicyAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations.some((limitation) => limitation.includes('autonomous') || limitation.includes('outpatient endoscopy'))).toBe(true);
    }
  });

  it('defines timing-free local-policy guards for ARBs and all three ARNI identities', () => {
    const arb = batch04ArbArniReviewRules.find((rule) => rule.id === 'RULE-B4-ARB-POLICY-REVIEW-001');
    expect(arb?.scope.medicationIds).toHaveLength(6);
    expect(arb?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arb?.timingRule).toBeUndefined();

    const arni = batch04ArbArniReviewRules.find((rule) => rule.id === 'RULE-B4-ARNI-POLICY-REVIEW-001');
    expect(arni?.scope.medicationIds).toEqual([
      'MED-sacubitril-valsartan',
      'MED-sacubitril-valsartan-entresto-tablet',
      'MED-sacubitril-valsartan-entresto-sprinkle',
    ]);
    expect(arni?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arni?.timingRule).toBeUndefined();
    expect(arni?.policyDependencyIds).toEqual(['POLICY-ANESTHESIA-RAAS']);
  });
});
