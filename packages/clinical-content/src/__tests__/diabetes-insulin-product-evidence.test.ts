import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { diabetesFormulationEvidence } from '../diabetes-formulation-evidence.js';
import { diabetesInsulinProductEvidence, diabetesInsulinProductAtoms, diabetesInsulinProductSources } from '../diabetes-insulin-product-evidence.js';

describe('append-only insulin product evidence increment', () => {
  it('retains all prior source versions, claims, retrieval dates and lifecycle states', () => {
    for (const source of diabetesFormulationEvidence.sources) {
      expect(diabetesInsulinProductEvidence.sources.find((item) => item.id === source.id && item.version === source.version)).toEqual(source);
    }
    for (const atom of diabetesFormulationEvidence.atoms) {
      expect(diabetesInsulinProductEvidence.atoms.find((item) => item.id === atom.id && item.version === atom.version)).toEqual(atom);
    }
    expect(diabetesInsulinProductEvidence.sources).toHaveLength(diabetesFormulationEvidence.sources.length + 5);
    expect(diabetesInsulinProductEvidence.atoms).toHaveLength(diabetesFormulationEvidence.atoms.length + 5);
    expect(validateEvidenceBundle(diabetesInsulinProductEvidence)).toEqual([]);
  });
  it('keeps descriptive identity evidence separate from clinical approval', () => {
    for (const source of diabetesInsulinProductSources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.currentMarketAvailabilityAsserted).toBe(false);
    }
    for (const atom of diabetesInsulinProductAtoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.reviewedBy).toBeUndefined();
      expect(atom.applicability.drugClassIds).toBeUndefined();
      expect(atom.locator.section).toContain('Dosage Forms and Strengths');
    }
  });
});
