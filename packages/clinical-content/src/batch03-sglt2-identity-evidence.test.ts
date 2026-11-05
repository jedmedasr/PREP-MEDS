import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03Sglt2IdentityAtoms,
  batch03Sglt2IdentityDefinitions,
  batch03Sglt2IdentityEvidence,
  batch03Sglt2IdentitySources,
} from './batch03-sglt2-identity-evidence.js';

describe('Batch 03 SGLT2 identity evidence', () => {
  it('validates the append-only evidence bundle and expected current product count', () => {
    expect(validateEvidenceBundle(batch03Sglt2IdentityEvidence)).toEqual([]);
    expect(batch03Sglt2IdentityDefinitions).toHaveLength(5);
    expect(batch03Sglt2IdentitySources).toHaveLength(7);
    expect(batch03Sglt2IdentityAtoms).toHaveLength(7);
  });

  it('pins current manufacturer label versions while retaining historical source records', () => {
    const byId = new Map(batch03Sglt2IdentitySources.map((source) => [source.id, source]));

    expect(byId.get('SRC-B3-JARDIANCE-SPL31')?.metadata?.splVersion).toBe(31);
    expect(byId.get('SRC-B3-FARXIGA-SPL49')?.metadata?.splVersion).toBe(49);
    expect(byId.get('SRC-B3-STEGLATRO-SPL17')?.metadata?.splVersion).toBe(17);
    expect(byId.get('SRC-B3-BRENZAVVY-SPL9')?.metadata?.splVersion).toBe(9);
    expect(byId.get('SRC-B3-INVOKANA-SPL32')?.metadata?.splVersion).toBe(32);

    expect(byId.get('SRC-B3-FARXIGA-SPL46')?.metadata?.splVersion).toBe(46);
    expect(byId.get('SRC-B3-BEXAGLIFLOZIN-SPL3')?.metadata?.splVersion).toBe(3);
  });

  it('links current definitions to exact current evidence versions', () => {
    const byMedication = new Map(batch03Sglt2IdentityDefinitions.map((item) => [item.medicationId, item]));

    expect(byMedication.get('MED-empagliflozin')?.evidenceRef).toEqual({
      id: 'EVD-B3-JARDIANCE-IDENTITY',
      version: 1,
    });
    expect(byMedication.get('MED-dapagliflozin')?.evidenceRef).toEqual({
      id: 'EVD-B3-FARXIGA-IDENTITY',
      version: 2,
    });
    expect(byMedication.get('MED-ertugliflozin')?.evidenceRef).toEqual({
      id: 'EVD-B3-STEGLATRO-IDENTITY',
      version: 1,
    });
    expect(byMedication.get('MED-bexagliflozin')?.evidenceRef).toEqual({
      id: 'EVD-B3-BEXAGLIFLOZIN-IDENTITY',
      version: 2,
    });
    expect(byMedication.get('MED-canagliflozin')?.evidenceRef).toEqual({
      id: 'EVD-B3-INVOKANA-IDENTITY',
      version: 1,
    });
  });

  it('preserves superseded FARXIGA and bexagliflozin atoms instead of rewriting history', () => {
    const atom = (id: string, version: number) =>
      batch03Sglt2IdentityAtoms.find((item) => item.id === id && item.version === version);

    expect(atom('EVD-B3-FARXIGA-IDENTITY', 1)?.source.id).toBe('SRC-B3-FARXIGA-SPL46');
    expect(atom('EVD-B3-FARXIGA-IDENTITY', 2)?.source.id).toBe('SRC-B3-FARXIGA-SPL49');
    expect(atom('EVD-B3-FARXIGA-IDENTITY', 2)?.supersedes).toEqual({
      id: 'EVD-B3-FARXIGA-IDENTITY',
      version: 1,
    });

    expect(atom('EVD-B3-BEXAGLIFLOZIN-IDENTITY', 1)?.source.id).toBe('SRC-B3-BEXAGLIFLOZIN-SPL3');
    expect(atom('EVD-B3-BEXAGLIFLOZIN-IDENTITY', 2)?.source.id).toBe('SRC-B3-BRENZAVVY-SPL9');
    expect(atom('EVD-B3-BEXAGLIFLOZIN-IDENTITY', 2)?.supersedes).toEqual({
      id: 'EVD-B3-BEXAGLIFLOZIN-IDENTITY',
      version: 1,
    });
  });

  it('keeps all identity atoms descriptive, draft, and non-action-authorizing', () => {
    for (const atom of batch03Sglt2IdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No substitution, dose, peri-procedural action, or restart instruction is authorized by this identity atom.',
      );
    }
  });
});
