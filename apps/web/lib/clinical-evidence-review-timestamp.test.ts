import { describe, expect, it, vi } from 'vitest';
import { canMarkClinicallyReviewed, type ClinicalEvidenceReview, type EvidenceReviewCandidate } from './clinical-evidence-review-gate';

const hash = 'a'.repeat(64);
const candidate: EvidenceReviewCandidate = {
  groupId: 'apixaban-adult-oral',
  evidenceHash: hash,
  sourceLinks: ['https://doi.org/10.1016/j.gie.2015.09.035'],
  mappedMedicationIds: ['MED-apixaban'],
  formulationAdjudicated: true,
  evidenceTestsPassed: true,
  unresolvedBlockingIssues: [],
};
const approval: ClinicalEvidenceReview = {
  groupId: candidate.groupId,
  evidenceHash: hash,
  reviewerId: 'clinician-1',
  reviewedAt: '2026-11-08T11:00:00-05:00',
  sourceLinks: [...candidate.sourceLinks],
  mappedMedicationIds: [...candidate.mappedMedicationIds],
  decision: 'APPROVED',
};
describe('clinician review timestamp and revision gating', () => {
  it('rejects approvals dated beyond clock-skew allowance', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-08T16:00:00Z'));
      expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: '2026-11-08T16:05:01Z' })).toBe(false);
      expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: '2026-11-08T16:05:00Z' })).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('rejects stale evidence, changed mappings and untested evidence', () => {
    expect(canMarkClinicallyReviewed(candidate, { ...approval, evidenceHash: 'b'.repeat(64) })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, mappedMedicationIds: ['MED-rivaroxaban'] })).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, evidenceTestsPassed: false }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, unresolvedBlockingIssues: ['renal boundary unresolved'] }, approval)).toBe(false);
  });
});
