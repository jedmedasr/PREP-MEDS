import test from 'node:test';
import assert from 'node:assert/strict';

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

test('validates a well-formed evidence bundle', () => {
  assert.doesNotThrow(() => assertValidEvidenceBundle(bundle));
  assert.deepEqual(validateEvidenceBundle(bundle), []);
});

test('detects a missing exact source version', () => {
  const invalid = structuredClone(bundle);
  invalid.atoms[0].source.version = 99;
  const issues = validateEvidenceBundle(invalid);
  assert.ok(issues.some((issue) => issue.code === 'UNKNOWN_SOURCE_REFERENCE'));
});

test('repository retrieves exact historical versions', () => {
  const repository = new EvidenceRepository(bundle);
  const atom = repository.getAtom({ id: 'ev_synthetic_001', version: 1 });
  assert.equal(atom?.claim, 'Synthetic source supports a fictional workflow option.');
  assert.equal(repository.getAtom({ id: 'ev_synthetic_001', version: 2 }), undefined);
});

test('repository query is deterministic and applicability-aware', () => {
  const repository = new EvidenceRepository(bundle);
  const results = repository.queryAtoms({
    medicationIds: ['med_synthetic_a'],
    procedureCodes: ['COLONOSCOPY'],
    lifecycle: ['REVIEWED'],
  });
  assert.deepEqual(results.map((item) => item.id), ['ev_synthetic_001', 'ev_synthetic_002']);
});

test('detects explicit opposing evidence inside one conflict group', () => {
  const conflicts = detectEvidenceConflicts(bundle.atoms);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].reason, 'OPPOSING_STANCE');
  assert.equal(conflicts[0].conflictGroup, 'synthetic-workflow-choice');
});

test('builds retrieval documents with exact source provenance', () => {
  const docs = buildRetrievalDocuments(bundle.atoms, bundle.sources);
  assert.equal(docs.length, 2);
  assert.deepEqual(docs[0].sourceRef, { id: 'src_synthetic_guideline', version: 1 });
  assert.match(docs[0].body, /Synthetic/);
});

test('automation cannot promote evidence to reviewed/current', () => {
  assert.equal(
    canTransitionEvidence('DRAFT', 'REVIEWED', { actorId: 'bot', role: 'AUTOMATION' }),
    false,
  );
  assert.equal(
    canTransitionEvidence('REVIEWED', 'CURRENT', { actorId: 'bot', role: 'AUTOMATION' }),
    false,
  );
});

test('clinical governance may promote reviewed evidence to current', () => {
  const reviewed = bundle.atoms[0];
  const current = transitionAtom(
    reviewed,
    'CURRENT',
    { actorId: 'clinician-1', role: 'CLINICAL_GOVERNANCE' },
    '2026-09-16T01:00:00Z',
  );
  assert.equal(current.lifecycle, 'CURRENT');
  assert.equal(current.reviewedBy, 'clinician-1');
});
