import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03SemaglutideIdentityAtoms,
  batch03SemaglutideIdentityDefinitions,
  batch03SemaglutideIdentityEvidence,
  batch03SemaglutideIdentitySources,
} from './batch03-semaglutide-identity-evidence.js';

describe('Batch 03 semaglutide product and route identity evidence', () => {
  it('validates five explicit product/route identities from three current manufacturer sources', () => {
    expect(validateEvidenceBundle(batch03SemaglutideIdentityEvidence)).toEqual([]);
    expect(batch03SemaglutideIdentityDefinitions).toHaveLength(5);
    expect(batch03SemaglutideIdentitySources).toHaveLength(3);
    expect(batch03SemaglutideIdentityAtoms).toHaveLength(5);
  });

  it('pins exact current manufacturer label versions', () => {
    const byId = new Map(batch03SemaglutideIdentitySources.map((source) => [source.id, source]));

    expect(byId.get('SRC-B3-OZEMPIC-INJECTION-SPL20')?.metadata?.setId).toBe(
      'adec4fd2-6858-4c99-91d4-531f5f2a2d79',
    );
    expect(byId.get('SRC-B3-OZEMPIC-INJECTION-SPL20')?.metadata?.splVersion).toBe(20);
    expect(byId.get('SRC-B3-OZEMPIC-INJECTION-SPL20')?.effectiveDate).toBe('2026-06-01');

    expect(byId.get('SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13')?.metadata?.setId).toBe(
      '27f15fac-7d98-4114-a2ec-92494a91da98',
    );
    expect(byId.get('SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13')?.metadata?.splVersion).toBe(13);
    expect(byId.get('SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13')?.effectiveDate).toBe('2026-01-30');

    expect(byId.get('SRC-B3-WEGOVY-SPL19')?.metadata?.setId).toBe(
      'ee06186f-2aa3-4990-a760-757579d8f77b',
    );
    expect(byId.get('SRC-B3-WEGOVY-SPL19')?.metadata?.splVersion).toBe(19);
    expect(byId.get('SRC-B3-WEGOVY-SPL19')?.effectiveDate).toBe('2026-06-18');
  });

  it('keeps brand-only ambiguity visible in the evidence model', () => {
    const ozempic = batch03SemaglutideIdentityDefinitions.filter((item) => item.brandName === 'Ozempic');
    const wegovy = batch03SemaglutideIdentityDefinitions.filter((item) => item.brandName === 'Wegovy');
    const rybelsus = batch03SemaglutideIdentityDefinitions.filter((item) => item.brandName === 'Rybelsus');

    expect(new Set(ozempic.map((item) => item.route))).toEqual(new Set(['SUBCUTANEOUS', 'ORAL']));
    expect(new Set(wegovy.map((item) => item.route))).toEqual(new Set(['SUBCUTANEOUS', 'ORAL']));
    expect(rybelsus.map((item) => item.route)).toEqual(['ORAL']);
  });

  it('does not encode dose, substitution, availability, or peri-procedural actions', () => {
    for (const atom of batch03SemaglutideIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
      );
    }

    for (const source of batch03SemaglutideIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
    }
  });
});
