import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antithromboticCandidateRules, antithromboticEvidence } from './antithrombotics.js';

const expected = [
  {
    medicationId: 'MED-dabigatran',
    sourceId: 'SRC-FDA-DABIGATRAN-CAPSULE-LABEL-2026',
    atomId: 'EVD-B1-FDA-DABIGATRAN-CAPSULE-DISCONTINUATION-RENAL',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-recent-thrombotic-event', 'MOD-concomitant-antithrombotic', 'MOD-verified-crcl-band'],
  },
  {
    medicationId: 'MED-edoxaban',
    sourceId: 'SRC-FDA-EDOXABAN-SAVAYSA-LABEL-2023',
    atomId: 'EVD-B1-FDA-EDOXABAN-DISCONTINUATION-RENAL',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-recent-thrombotic-event', 'MOD-concomitant-antithrombotic', 'MOD-verified-crcl-band'],
  },
  {
    medicationId: 'MED-warfarin',
    sourceId: 'SRC-FDA-WARFARIN-TABLET-LABEL-2022',
    atomId: 'EVD-B1-FDA-WARFARIN-INDICATION-MONITORING',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-recent-thrombotic-event', 'MOD-concomitant-antithrombotic', 'MOD-mechanical-heart-valve'],
  },
] as const;

describe('oral anticoagulant direct-label hardening', () => {
  it('keeps the expanded evidence bundle valid and draft-only', () => {
    expect(validateEvidenceBundle(antithromboticEvidence)).toEqual([]);
    for (const item of expected) {
      expect(antithromboticEvidence.sources.find((source) => source.id === item.sourceId)?.lifecycle).toBe('DRAFT');
      const atom = antithromboticEvidence.atoms.find((candidate) => candidate.id === item.atomId);
      expect(atom?.source.id).toBe(item.sourceId);
      expect(atom?.applicability.medicationIds).toEqual([item.medicationId]);
      expect(atom?.lifecycle).toBe('DRAFT');
    }
  });

  it('links each label only to its matching review pathway and preserves safety modifiers', () => {
    for (const item of expected) {
      const rule = antithromboticCandidateRules.find((candidate) =>
        candidate.scope.medicationIds?.includes(item.medicationId),
      );
      expect(rule?.evidenceRefs).toContainEqual({ id: item.atomId, version: 1 });
      expect(rule?.requiredModifierIds).toEqual(expect.arrayContaining([...item.modifiers]));
      expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(rule?.status).toBe('CLINICAL_REVIEW');
      expect(rule?.timingRule).toBeUndefined();
    }
  });

  it('does not cross-apply the formulation-specific dabigatran capsule atom', () => {
    const atom = antithromboticEvidence.atoms.find(
      (candidate) => candidate.id === 'EVD-B1-FDA-DABIGATRAN-CAPSULE-DISCONTINUATION-RENAL',
    );
    expect(atom?.applicability.medicationIds).toEqual(['MED-dabigatran']);
    expect(atom?.claim).toContain('not milligram-for-milligram substitutable');
  });
});
