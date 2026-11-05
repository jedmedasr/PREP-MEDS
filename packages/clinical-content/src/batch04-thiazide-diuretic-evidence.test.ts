import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04ThiazideDiureticIdentityAtoms,
  batch04ThiazideDiureticIdentityDefinitions,
  batch04ThiazideDiureticIdentityEvidence,
  batch04ThiazideDiureticIdentitySources,
  batch04ThiazideDiureticReviewRules,
} from './batch04-thiazide-diuretic-evidence.js';

describe('Batch 04 thiazide/thiazide-like diuretic evidence', () => {
  it('validates three source-linked identities', () => {
    expect(validateEvidenceBundle(batch04ThiazideDiureticIdentityEvidence)).toEqual([]);
    expect(batch04ThiazideDiureticIdentityDefinitions).toHaveLength(3);
    expect(batch04ThiazideDiureticIdentitySources).toHaveLength(3);
    expect(batch04ThiazideDiureticIdentityAtoms).toHaveLength(3);
    expect(batch04ThiazideDiureticReviewRules).toHaveLength(1);
  });

  it('pins current direct DailyMed provenance', () => {
    const byId = new Map(batch04ThiazideDiureticIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-HCTZ-TEVA-SPL18')?.metadata).toMatchObject({ setId: 'e2270db4-2930-4ec5-ac96-2b4542aed367', splVersion: 18, applicationNumber: 'ANDA083177', route: 'ORAL', dosageForm: 'TABLET' });
    expect(byId.get('SRC-B4-CHLORTHALIDONE-AMNEAL-SPL13')?.metadata).toMatchObject({ setId: 'c4c1bfe5-b5c8-43c0-9428-62337095b2bd', splVersion: 13, applicationNumber: 'ANDA207204', route: 'ORAL', dosageForm: 'TABLET' });
    expect(byId.get('SRC-B4-INDAPAMIDE-ANI-SPL4')?.metadata).toMatchObject({ setId: 'deb83f97-6c61-4a09-bed6-18dcf1183405', splVersion: 4, applicationNumber: 'ANDA074299', route: 'ORAL', dosageForm: 'TABLET, FILM COATED' });
  });

  it('keeps all evidence DRAFT/non-authorizing and review routing timing-free', () => {
    for (const source of batch04ThiazideDiureticIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    for (const atom of batch04ThiazideDiureticIdentityAtoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
    const rule = batch04ThiazideDiureticReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(3);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
