import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch04LoopDiureticIdentityAtoms,
  batch04LoopDiureticIdentityDefinitions,
  batch04LoopDiureticIdentityEvidence,
  batch04LoopDiureticIdentitySources,
  batch04LoopDiureticMarketingStatusAtoms,
  batch04LoopDiureticReviewRules,
} from './batch04-loop-diuretic-evidence.js';

describe('Batch 04 loop-diuretic evidence', () => {
  it('validates ten route/formulation-specific identities', () => {
    expect(validateEvidenceBundle(batch04LoopDiureticIdentityEvidence)).toEqual([]);
    expect(batch04LoopDiureticIdentityDefinitions).toHaveLength(10);
    expect(batch04LoopDiureticIdentitySources).toHaveLength(10);
    expect(batch04LoopDiureticIdentityAtoms).toHaveLength(10);
    expect(batch04LoopDiureticMarketingStatusAtoms).toHaveLength(1);
    expect(batch04LoopDiureticReviewRules).toHaveLength(1);
  });

  it('pins direct DailyMed provenance without inventing the historical DEMADEX application number', () => {
    const byId = new Map(batch04LoopDiureticIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B4-FUROSEMIDE-HIKMA-TABLET-SPL19')?.metadata).toMatchObject({ setId: '9e493331-dddd-496e-abf8-61747fb67aba', splVersion: 19, route: 'ORAL', dosageForm: 'TABLET' });
    expect(byId.get('SRC-B4-FUROSCIX-READYFLOW-SPL18')?.metadata).toMatchObject({ setId: 'eac958dd-8d43-e44e-e053-2995a90a4d5e', applicationNumber: 'NDA209988', route: 'SUBCUTANEOUS', device: 'READYFLOW AUTOINJECTOR' });
    expect(byId.get('SRC-B4-TORSEMIDE-TEVA-TABLET-SPL11')?.metadata).toMatchObject({ setId: '8a95cbdb-0601-47a5-9b3a-0c3b0629ceb9', applicationNumber: 'ANDA076346', route: 'ORAL' });
    expect(byId.get('SRC-B4-DEMADEX-ROCHE-HISTORICAL-SPL1')?.metadata).toMatchObject({ applicationNumber: null, historicalLabel: true, route: 'INTRAVENOUS' });
    expect(byId.get('SRC-B4-BUMETANIDE-HIKMA-INJECTION-SPL6')?.metadata).toMatchObject({ setId: '681b5e9d-e2c7-4f29-aaad-e06d4a528c11', applicationNumber: 'ANDA079196', route: 'INTRAVENOUS, INTRAMUSCULAR' });
    expect(byId.get('SRC-B4-ENBUMYST-CORSTASIS-SPL4')?.metadata).toMatchObject({ setId: 'd6f752c5-d2bd-4f77-9611-ca2110066d1f', applicationNumber: 'NDA219500', route: 'NASAL' });
  });

  it('keeps evidence DRAFT/non-authorizing and review routing timing-free', () => {
    for (const source of batch04LoopDiureticIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.routeConversionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    for (const atom of batch04LoopDiureticIdentityEvidence.atoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.lifecycle).toBe('DRAFT');
    }
    const rule = batch04LoopDiureticReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(10);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
