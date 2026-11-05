import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04AceIdentityAtoms,
  batch04AceIdentityDefinitions,
  batch04AceIdentityEvidence,
  batch04AceIdentitySources,
  batch04AceReviewRules,
} from './batch04-ace-inhibitor-evidence.js';

describe('Batch 04 ACE inhibitor evidence', () => {
  it('validates five direct-label generic identity records', () => {
    expect(validateEvidenceBundle(batch04AceIdentityEvidence)).toEqual([]);
    expect(batch04AceIdentityDefinitions).toHaveLength(5);
    expect(batch04AceIdentitySources).toHaveLength(5);
    expect(batch04AceIdentityAtoms).toHaveLength(5);
  });

  it('pins current direct DailyMed provenance', () => {
    const byId = new Map(batch04AceIdentitySources.map((source) => [source.id, source]));

    expect(byId.get('SRC-B4-LISINOPRIL-AUROBINDO-SPL27')?.metadata).toMatchObject({
      setId: '0e6364a4-6d66-4151-8197-d45e2a762895',
      splVersion: 27,
      applicationNumber: 'ANDA077622',
      route: 'ORAL',
      dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-LISINOPRIL-AUROBINDO-SPL27')?.effectiveDate).toBe('2026-07-21');

    expect(byId.get('SRC-B4-ENALAPRIL-SUN-SPL14')?.metadata).toMatchObject({
      setId: 'f103b9f9-e081-419d-a2d8-b86acda834dd',
      splVersion: 14,
      applicationNumber: 'ANDA075657',
      route: 'ORAL',
      dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-ENALAPRIL-SUN-SPL14')?.effectiveDate).toBe('2026-07-14');

    expect(byId.get('SRC-B4-BENAZEPRIL-ANI-SPL2')?.metadata).toMatchObject({
      setId: 'ff732cfa-9ded-4226-b464-19c90a6865ae',
      splVersion: 2,
      applicationNumber: 'ANDA076333',
      route: 'ORAL',
      dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-BENAZEPRIL-ANI-SPL2')?.effectiveDate).toBe('2026-08-19');

    expect(byId.get('SRC-B4-RAMIPRIL-LUPIN-SPL21')?.metadata).toMatchObject({
      setId: 'a8cdec12-81d1-4ef4-82c0-d05d93c37a07',
      splVersion: 21,
      applicationNumber: 'ANDA077626',
      route: 'ORAL',
      dosageForm: 'CAPSULE',
    });
    expect(byId.get('SRC-B4-RAMIPRIL-LUPIN-SPL21')?.effectiveDate).toBe('2026-08-24');

    expect(byId.get('SRC-B4-CAPTOPRIL-SOLCO-SPL2')?.metadata).toMatchObject({
      setId: '2d3779b0-83d9-4b6f-a043-f7768cd7fce6',
      splVersion: 2,
      applicationNumber: 'ANDA074477',
      route: 'ORAL',
      dosageForm: 'TABLET',
    });
    expect(byId.get('SRC-B4-CAPTOPRIL-SOLCO-SPL2')?.effectiveDate).toBe('2025-12-25');

    for (const source of batch04AceIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.representativeGenericIdentityOnly).toBe(true);
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps identity evidence descriptive and non-action-authorizing', () => {
    for (const atom of batch04AceIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No dose, substitution, conversion, peri-procedural hold/continue/restart interval, or local anesthesia policy is authorized by this identity atom.',
      );
    }
  });

  it('defines one timing-free local-policy guard for the ACE inhibitor core', () => {
    const guard = batch04AceReviewRules[0];
    expect(guard?.scope.medicationIds).toEqual([
      'MED-lisinopril',
      'MED-enalapril',
      'MED-benazepril',
      'MED-ramipril',
      'MED-captopril',
    ]);
    expect(guard?.requiredModifierIds).toEqual(['MOD-raas-indication']);
    expect(guard?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.policyDependencyIds).toEqual(['POLICY-ANESTHESIA-RAAS']);
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-AHA-RAAS-HTN-OMIT-2024', version: 1 },
      { id: 'EVD-AHA-RAAS-HF-CONTINUE-2024', version: 1 },
      { id: 'EVD-STOPORNOT-RAAS-2024', version: 1 },
    ]);
  });
});
