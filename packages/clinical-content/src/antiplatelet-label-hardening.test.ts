import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antithromboticCandidateRules, antithromboticEvidence } from './antithrombotics.js';

const cases = [
  ['MED-aspirin', 'EVD-B1-FDA-ASPIRIN-OTC-BLEEDING-LIMITATION'],
  ['MED-dipyridamole', 'EVD-B1-FDA-DIPYRIDAMOLE-VALVE-ADJUNCT'],
  ['MED-aspirin-dipyridamole', 'EVD-B1-FDA-AGGRENOX-WHOLE-PRODUCT'],
  ['MED-cilostazol', 'EVD-B1-FDA-CILOSTAZOL-INDICATION-HF'],
  ['MED-ticlopidine', 'EVD-B1-FDA-TICLOPIDINE-INDICATION-HEMATOLOGIC'],
] as const;

describe('antiplatelet direct-label hardening', () => {
  it('keeps all added evidence valid, draft, and medication-specific', () => {
    expect(validateEvidenceBundle(antithromboticEvidence)).toEqual([]);
    for (const [medicationId, atomId] of cases) {
      const atom = antithromboticEvidence.atoms.find((candidate) => candidate.id === atomId);
      expect(atom?.applicability.medicationIds).toEqual([medicationId]);
      expect(atom?.lifecycle).toBe('DRAFT');
      expect(antithromboticEvidence.sources.find((source) => source.id === atom?.source.id)?.lifecycle).toBe('DRAFT');
    }
  });

  it('links direct evidence without adding autonomous timing', () => {
    for (const [medicationId, atomId] of cases) {
      const rule = antithromboticCandidateRules.find((candidate) =>
        candidate.scope.medicationIds?.includes(medicationId),
      );
      expect(rule?.evidenceRefs).toContainEqual({ id: atomId, version: 1 });
      expect(rule?.status).toBe('CLINICAL_REVIEW');
      expect(rule?.timingRule).toBeUndefined();
    }
  });

  it('keeps aspirin secondary prevention narrower than all aspirin use', () => {
    const rule = antithromboticCandidateRules.find((candidate) => candidate.id === 'RULE-B1-ASPIRIN-SECONDARY-MONOTHERAPY');
    expect(rule?.requiredModifierIds).toEqual(expect.arrayContaining([
      'MOD-aspirin-indication', 'MOD-dual-antiplatelet-therapy', 'MOD-concomitant-antithrombotic',
    ]));
    expect(rule?.hardStops?.map((stop) => stop.reasonCode)).toContain('ASPIRIN_NOT_CONFIRMED_SECONDARY_PREVENTION');
  });

  it('preserves AGGRENOX as a non-interchangeable whole-product identity', () => {
    const atom = antithromboticEvidence.atoms.find((candidate) => candidate.id === 'EVD-B1-FDA-AGGRENOX-WHOLE-PRODUCT');
    expect(atom?.claim).toContain('not interchangeable');
    expect(atom?.claim).toContain('extended-release dipyridamole');
  });
});
