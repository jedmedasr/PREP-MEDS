import { describe, expect, test } from 'vitest';

import {
  EvidenceRepository,
  assertValidEvidenceBundle,
  buildRetrievalDocuments,
  canTransitionEvidence,
  detectEvidenceConflicts,
  transitionAtom,
  validateEvidenceBundle,
} from '../index.js';
import type { EvidenceBundle } from '../types.js';

const bundle: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-09-16T00:00:00Z',
  sources: [
    {
      id: 'src_synthetic_guideline',
      version: 1,
      sourceType: 'GUIDELINE',
      title: 'Synthetic Guideline for Software Testing Only',
      publisher: 'PREP-MEDS Test Fixture',
      language: 'en',
      retrievedAt: '2026-09-16T00:00:00Z',
      lifecycle: 'REVIEWED',
    },
    {
      id: 'src_synthetic_study',
      version: 1,
      sourceType: 'PEER_REVIEWED_STUDY',
      title: 'Synthetic Study for Software Testing Only',
      publisher: 'PREP-MEDS Test Fixture',
      language: 'en',
      retrievedAt: '2026-09-16T00:00:00Z',
      lifecycle: 'REVIEWED',
    },
  ],
  atoms: [
    {
      id: 'ev_synthetic_001',
      version: 1,
      source: { id: 'src_synthetic_guideline', version: 1 },
      claim: 'Synthetic source supports a fictional workflow option.',
      normalizedTopic: 'synthetic-workflow',
      stance: 'SUPPORTS',
      evidenceStrength: 'NOT_GRADED',
      applicability: {
        medicationIds: ['med_synthetic_a'],
        procedureCodes: ['COLONOSCOPY'],
      },
      locator: { section: 'Test Section' },
      limitations: ['Not clinical evidence. Software test fixture only.'],
      conflictGroup: 'synthetic-workflow-choice',
      retrieval: {
        title: 'Synthetic workflow support',
        summary: 'Software-only fixture representing one side of an evidence conflict.',
        keywords: ['synthetic', 'workflow'],
        concepts: ['test-evidence'],
        sourceAuthorityRank: 10,
      },
      lifecycle: 'REVIEWED',
      createdAt: '2026-09-16T00:00:00Z',
    },
    {
      id: 'ev_synthetic_002',
      version: 1,
      source: { id: 'src_synthetic_study', version: 1 },
      claim: 'Synthetic source opposes the same fictional workflow option.',
      normalizedTopic: 'synthetic-workflow',
      stance: 'OPPOSES',
      evidenceStrength: 'NOT_GRADED',
      applicability: {
        medicationIds: ['med_synthetic_a'],
        procedureCodes: ['COLONOSCOPY'],
      },
      locator: { section: 'Test Section' },
      limitations: ['Not clinical evidence. Software test fixture only.'],
      conflictGroup: 'synthetic-workflow-choice',
      retrieval: {
        title: 'Synthetic workflow opposition',
        summary: 'Software-only fixture representing the other side of an evidence conflict.',
        keywords: ['synthetic', 'workflow'],
        concepts: ['test-evidence'],
        sourceAuthorityRank: 20,
      },
      lifecycle: 'REVIEWED',
      createdAt: '2026-09-16T00:00:00Z',
    },
  ],
};

describe('evidence knowledge system', () => {
  test('validates a well-formed evidence bundle', () => {
    expect(() => assertValidEvidenceBundle(bundle)).not.toThrow();
    expect(validateEvidenceBundle(bundle)).toEqual([]);
  });

  test('detects a missing exact source version', () => {
    const invalid = structuredClone(bundle);
    invalid.atoms[0]!.source.version = 99;
    const issues = validateEvidenceBundle(invalid);
    expect(issues.some((issue) => issue.code === 'UNKNOWN_SOURCE_REFERENCE')).toBe(true);
  });

  test('repository retrieves exact historical versions', () => {
    const repository = new EvidenceRepository(bundle);
    const atom = repository.getAtom({ id: 'ev_synthetic_001', version: 1 });
    expect(atom?.claim).toBe('Synthetic source supports a fictional workflow option.');
    expect(repository.getAtom({ id: 'ev_synthetic_001', version: 2 })).toBeUndefined();
  });

  test('repository query is deterministic and applicability-aware', () => {
    const repository = new EvidenceRepository(bundle);
    const results = repository.queryAtoms({
      medicationIds: ['med_synthetic_a'],
      procedureCodes: ['COLONOSCOPY'],
      lifecycle: ['REVIEWED'],
    });
    expect(results.map((item) => item.id)).toEqual(['ev_synthetic_001', 'ev_synthetic_002']);
  });

  test('detects explicit opposing evidence inside one conflict group', () => {
    const conflicts = detectEvidenceConflicts(bundle.atoms);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.reason).toBe('OPPOSING_STANCE');
    expect(conflicts[0]!.conflictGroup).toBe('synthetic-workflow-choice');
  });

  test('builds retrieval documents with exact source provenance', () => {
    const docs = buildRetrievalDocuments(bundle.atoms, bundle.sources);
    expect(docs).toHaveLength(2);
    expect(docs[0]!.sourceRef).toEqual({ id: 'src_synthetic_guideline', version: 1 });
    expect(docs[0]!.body).toMatch(/Synthetic/);
  });

  test('automation cannot promote evidence to reviewed/current', () => {
    expect(
      canTransitionEvidence('DRAFT', 'REVIEWED', { actorId: 'bot', role: 'AUTOMATION' }),
    ).toBe(false);
    expect(
      canTransitionEvidence('REVIEWED', 'CURRENT', { actorId: 'bot', role: 'AUTOMATION' }),
    ).toBe(false);
  });

  test('clinical governance may promote reviewed evidence to current', () => {
    const reviewed = bundle.atoms[0]!;
    const current = transitionAtom(
      reviewed,
      'CURRENT',
      { actorId: 'clinician-1', role: 'CLINICAL_GOVERNANCE' },
      '2026-09-16T01:00:00Z',
    );
    expect(current.lifecycle).toBe('CURRENT');
    expect(current.reviewedBy).toBe('clinician-1');
  });
});
