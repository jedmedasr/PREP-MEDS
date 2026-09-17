import { describe, expect, it } from 'vitest';
import {
  buildDraftPacket,
  buildReviewQueue,
  canTransitionStatus,
  markReadyForClinicalReview,
  markTechnicallyComplete,
  nextResearchItem,
  transitionBacklogItem,
  validateBacklog,
  validateEvidencePacket,
} from '../index.js';
import type { EvidencePacket, MedicationBacklogItem } from '../types.js';

const item: MedicationBacklogItem = {
  medicationId: 'MED-synthetic-a',
  canonicalName: 'Synthetic Medication A',
  ingredientIds: ['ING-synthetic-a'],
  classIds: ['CLS-synthetic'],
  priorityTier: 'TIER_1',
  researchStatus: 'NOT_RESEARCHED',
  procedures: ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'],
};

const packet = buildDraftPacket({
  item,
  packetId: 'PKT-synthetic-a-v1',
  generatedAt: '2026-09-16T00:00:00Z',
  sources: [
    {
      sourceId: 'SRC-synthetic-guideline',
      sourceKind: 'US_GI_GUIDELINE',
      title: 'Synthetic Guideline',
      publisher: 'Synthetic Society',
      retrievedAt: '2026-09-16T00:00:00Z',
      authoritative: true,
      currentAsOfRetrieval: true,
      relevance: 'PRIMARY',
    },
  ],
  findings: [
    {
      findingId: 'FIND-synthetic-1',
      sourceId: 'SRC-synthetic-guideline',
      statement: 'Synthetic software-only finding.',
      procedureCodes: ['COLONOSCOPY'],
      medicationIds: ['MED-synthetic-a'],
      limitations: ['Not clinical evidence.'],
    },
  ],
  ruleDrafts: [
    {
      ruleDraftId: 'RULEDRAFT-synthetic-1',
      medicationId: 'MED-synthetic-a',
      procedureCode: 'COLONOSCOPY',
      proposedDisposition: 'CLINICIAN_REVIEW_REQUIRED',
      decisionRequirements: [],
      hardStops: [],
      evidenceFindingIds: ['FIND-synthetic-1'],
    },
  ],
  syntheticCases: [
    {
      testCaseId: 'TEST-synthetic-1',
      ruleDraftId: 'RULEDRAFT-synthetic-1',
      scenarioType: 'ORDINARY',
      description: 'Synthetic case only.',
      expectedDisposition: 'CLINICIAN_REVIEW_REQUIRED',
    },
  ],
});

describe('knowledge pipeline', () => {
  it('prioritizes tier 1 backlog items deterministically', () => {
    const later: MedicationBacklogItem = { ...item, medicationId: 'MED-z', canonicalName: 'Zeta', priorityTier: 'TIER_2' };
    expect(nextResearchItem([later, item])?.medicationId).toBe(item.medicationId);
  });

  it('blocks automation from validating clinical content', () => {
    expect(canTransitionStatus('CLINICAL_REVIEW', 'VALIDATED', 'AUTOMATION')).toBe(false);
    expect(canTransitionStatus('CLINICAL_REVIEW', 'VALIDATED', 'CLINICAL_GOVERNANCE')).toBe(true);
  });

  it('records research transitions', () => {
    const transitioned = transitionBacklogItem(item, {
      to: 'EVIDENCE_COLLECTION',
      actorRole: 'AUTOMATION',
      occurredAt: '2026-09-16T01:00:00Z',
    });
    expect(transitioned.item.researchStatus).toBe('EVIDENCE_COLLECTION');
    expect(transitioned.transition.from).toBe('NOT_RESEARCHED');
  });

  it('validates referential integrity in evidence packets', () => {
    expect(validateEvidencePacket(packet)).toEqual([]);
    const invalid: EvidencePacket = {
      ...packet,
      findings: [{ ...packet.findings[0]!, sourceId: 'SRC-missing' }],
    };
    expect(validateEvidencePacket(invalid).some((issue) => issue.code === 'UNKNOWN_SOURCE_REFERENCE')).toBe(true);
  });

  it('allows technical completion but keeps clinical validation separate', () => {
    const technicallyComplete = markTechnicallyComplete(packet);
    expect(technicallyComplete.status).toBe('TECHNICALLY_COMPLETE');
    const ready = markReadyForClinicalReview(technicallyComplete);
    expect(ready.status).toBe('READY_FOR_CLINICAL_REVIEW');
  });

  it('rejects review-ready packets with unresolved questions', () => {
    const unresolved = { ...packet, unresolvedQuestions: ['Resolve synthetic conflict.'] };
    expect(() => markReadyForClinicalReview(unresolved)).toThrow(/UNRESOLVED_QUESTIONS_REMAIN/);
  });

  it('builds human review queues from research state', () => {
    const technicallyTested: MedicationBacklogItem = { ...item, researchStatus: 'TECHNICALLY_TESTED' };
    const queue = buildReviewQueue([technicallyTested], [packet]);
    expect(queue[0]?.queue).toBe('CLINICAL_RULE_REVIEW');
  });

  it('detects duplicate backlog identities', () => {
    expect(validateBacklog([item, { ...item }]).some((issue) => issue.code === 'DUPLICATE_MEDICATION_ID')).toBe(true);
  });
});
