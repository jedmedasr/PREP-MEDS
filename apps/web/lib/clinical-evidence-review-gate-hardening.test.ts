import { describe, expect, it } from 'vitest';
import { canMarkClinicallyReviewed, type ClinicalEvidenceReview, type EvidenceReviewCandidate } from './clinical-evidence-review-gate';

const candidate: EvidenceReviewCandidate = {
  groupId: 'ING-apixaban', evidenceHash: 'a'.repeat(64),
  sourceLinks: ['https://doi.org/10.1016/j.gie.2015.09.035'],
  mappedMedicationIds: ['MED-1'], formulationAdjudicated: true,
  evidenceTestsPassed: true, unresolvedBlockingIssues: [],
};
const review: ClinicalEvidenceReview = {
  groupId: candidate.groupId, evidenceHash: candidate.evidenceHash,
  reviewerId: 'clinician-1', reviewedAt: '2026-11-08T12:00:00Z',
  sourceLinks: [...candidate.sourceLinks], mappedMedicationIds: [...candidate.mappedMedicationIds],
  decision: 'APPROVED',
};

describe('clinical evidence approval gate hardening', () => {
  it('accepts an explicitly reviewed, complete research record (not release authorization)', () => {
    expect(canMarkClinicallyReviewed(candidate, review)).toBe(true);
  });
  it('rejects missing digest and non-digest evidence revisions', () => {
    expect(canMarkClinicallyReviewed({...candidate, evidenceHash: 'revision-1'}, {...review, evidenceHash: 'revision-1'})).toBe(false);
  });
  it('rejects timestamps without explicit timezone', () => {
    expect(canMarkClinicallyReviewed(candidate, {...review, reviewedAt: '2026-11-08T12:00:00'})).toBe(false);
  });
  it('rejects source links with credentials or fragments', () => {
    for (const url of ['https://user:pass@doi.org/example', 'https://doi.org/example#unverified']) {
      expect(canMarkClinicallyReviewed({...candidate, sourceLinks: [url]}, {...review, sourceLinks: [url]})).toBe(false);
    }
  });
  it('rejects stale mapped medication inheritance', () => {
    expect(canMarkClinicallyReviewed({...candidate, mappedMedicationIds: ['MED-1', 'MED-2']}, review)).toBe(false);
  });
});
