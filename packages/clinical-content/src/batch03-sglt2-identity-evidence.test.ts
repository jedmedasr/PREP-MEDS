import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03Sglt2IdentityAtoms,
  batch03Sglt2IdentityDefinitions,
  batch03Sglt2IdentityEvidence,
  batch03Sglt2IdentitySources,
} from './batch03-sglt2-identity-evidence.js';

describe('Batch 03 SGLT2 identity evidence', () => {
  it('validates the evidence bundle and expected product count', () => {
    expect(validateEvidenceBundle(batch03Sglt2IdentityEvidence)).toEqual([]);
    expect(batch03Sglt2IdentityDefinitions).toHaveLength(4);
    expect(batch03Sglt2IdentitySources).toHaveLength(4);
    expect(batch03Sglt2IdentityAtoms).toHaveLength(4);
  });

  it('pins exact current label versions', () => {
    const byId = new Map(batch03Sglt2IdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B3-JARDIANCE-SPL31')?.metadata?.splVersion).toBe(31);
    expect(byId.get('SRC-B3-FARXIGA-SPL46')?.metadata?.splVersion).toBe(46);
    expect(byId.get('SRC-B3-STEGLATRO-SPL17')?.metadata?.splVersion).toBe(17);
    expect(byId.get('SRC-B3-BEXAGLIFLOZIN-SPL3')?.metadata?.splVersion).toBe(3);
  });

  it('keeps all identity atoms descriptive and draft', () => {
    for (const atom of batch03Sglt2IdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
    }
  });
});
