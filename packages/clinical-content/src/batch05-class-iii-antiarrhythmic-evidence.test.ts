import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch05ClassIIIAntiarrhythmicIdentityAtoms,
  batch05ClassIIIAntiarrhythmicIdentityDefinitions,
  batch05ClassIIIAntiarrhythmicIdentityEvidence,
  batch05ClassIIIAntiarrhythmicIdentitySources,
  batch05ClassIIIAntiarrhythmicReviewRules,
} from './batch05-class-iii-antiarrhythmic-evidence.js';

describe('Batch 05 class III antiarrhythmic evidence', () => {
  it('validates eight route/form-specific source-linked identities', () => {
    expect(validateEvidenceBundle(batch05ClassIIIAntiarrhythmicIdentityEvidence)).toEqual([]);
    expect(batch05ClassIIIAntiarrhythmicIdentityDefinitions).toHaveLength(8);
    expect(batch05ClassIIIAntiarrhythmicIdentitySources).toHaveLength(8);
    expect(batch05ClassIIIAntiarrhythmicIdentityAtoms).toHaveLength(8);
    expect(batch05ClassIIIAntiarrhythmicReviewRules).toHaveLength(1);
  });

  it('pins direct DailyMed provenance and the sotalol AF distinction without asserting availability', () => {
    const byId = new Map(batch05ClassIIIAntiarrhythmicIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B5-AMIODARONE-TARO-SPL19')?.metadata).toMatchObject({ setId: '7ccd3733-c3af-4a11-8500-0f99194c1472', splVersion: 19, route: 'ORAL' });
    expect(byId.get('SRC-B5-SOTALOL-AF-BAYSHORE-SPL2')?.metadata).toMatchObject({ setId: '2577dd8d-ab1b-4a55-990a-18c69395edfe', applicationNumber: 'ANDA207429', substitutionAuthorized: false });
    expect(byId.get('SRC-B5-MULTAQ-PTC-SPL2')?.metadata).toMatchObject({ labelNdcStatus: 'INACTIVATED', marketAvailabilityAsserted: false });
  });

  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch05ClassIIIAntiarrhythmicIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.routeConversionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    const rule = batch05ClassIIIAntiarrhythmicReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(8);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});
