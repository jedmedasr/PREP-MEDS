import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antithromboticCandidateRules, antithromboticEvidence } from './antithrombotics.js';

const cases = [
  {
    medicationId: 'MED-enoxaparin',
    atomId: 'EVD-B1-FDA-ENOXAPARIN-INTENT-RENAL-NONSUBSTITUTION',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'],
  },
  {
    medicationId: 'MED-heparin',
    atomId: 'EVD-B1-FDA-UFH-ROUTE-INTENT-MONITORING',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event'],
  },
  {
    medicationId: 'MED-fondaparinux',
    atomId: 'EVD-B1-FDA-FONDAPARINUX-INTENT-RENAL',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'],
  },
  {
    medicationId: 'MED-dalteparin',
    atomId: 'EVD-B1-FDA-DALTEPARIN-INTENT-CONTEXT',
    modifiers: ['MOD-anticoagulation-indication', 'MOD-anticoagulant-intent', 'MOD-recent-thrombotic-event', 'MOD-verified-crcl-band'],
  },
] as const;

describe('injectable anticoagulant direct-label hardening', () => {
  it('keeps all direct-label evidence valid, draft, and medication-specific', () => {
    expect(validateEvidenceBundle(antithromboticEvidence)).toEqual([]);
    for (const item of cases) {
      const atom = antithromboticEvidence.atoms.find((candidate) => candidate.id === item.atomId);
      expect(atom?.applicability.medicationIds).toEqual([item.medicationId]);
      expect(atom?.lifecycle).toBe('DRAFT');
      expect(antithromboticEvidence.sources.find((source) => source.id === atom?.source.id)?.lifecycle).toBe('DRAFT');
    }
  });

  it('preserves intent and renal modifiers while remaining timing-free review-only', () => {
    for (const item of cases) {
      const rule = antithromboticCandidateRules.find((candidate) =>
        candidate.scope.medicationIds?.includes(item.medicationId),
      );
      expect(rule?.evidenceRefs).toContainEqual({ id: item.atomId, version: 1 });
      expect(rule?.requiredModifierIds).toEqual(expect.arrayContaining([...item.modifiers]));
      expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(rule?.status).toBe('CLINICAL_REVIEW');
      expect(rule?.timingRule).toBeUndefined();
      expect(rule?.restartOwner).toBe('CLINICIAN_REVIEW');
    }
  });

  it('preserves route and product distinctions without substitution', () => {
    const ufh = antithromboticEvidence.atoms.find((atom) => atom.id === 'EVD-B1-FDA-UFH-ROUTE-INTENT-MONITORING');
    expect(ufh?.claim).toContain('intravenous or deep subcutaneous');
    const enoxaparin = antithromboticEvidence.atoms.find((atom) => atom.id === 'EVD-B1-FDA-ENOXAPARIN-INTENT-RENAL-NONSUBSTITUTION');
    expect(enoxaparin?.claim).toContain('not interchangeable unit-for-unit');
  });
});
