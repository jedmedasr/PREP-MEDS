import { describe, expect, it } from 'vitest';
import { canMarkClinicallyReviewed, type ClinicalEvidenceReview, type EvidenceReviewCandidate } from '../clinical-evidence-review-gate';
const candidate: EvidenceReviewCandidate = { groupId: 'ING-apixaban:oral', evidenceHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', sourceLinks: ['https://doi.org/10.1016/j.gie.2015.09.035'], mappedMedicationIds: ['MED-1','MED-2'], formulationAdjudicated: true, evidenceTestsPassed: true, unresolvedBlockingIssues: [] };
const approval: ClinicalEvidenceReview = { groupId: candidate.groupId, evidenceHash: candidate.evidenceHash, reviewerId: 'clinician-1', reviewedAt: '2026-11-08T11:00:00Z', sourceLinks: [...candidate.sourceLinks], mappedMedicationIds: [...candidate.mappedMedicationIds], decision: 'APPROVED' };
describe('clinician evidence approval fail-closed contract', () => {
  it('requires an explicit exact-version approval', () => {
    expect(canMarkClinicallyReviewed(candidate, null)).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, approval)).toBe(true);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, decision: 'REJECTED' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, evidenceHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewerId: '' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: 'invalid' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: '2026-11-08T11:00:00' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: '2026-11-08' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, reviewedAt: '2026-11-08T11:00:00-05:00' })).toBe(true);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, evidenceHash: 'sha256:abc' })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, evidenceHash: 'abc' })).toBe(false);
  });
  it('rejects missing primary source links, unresolved evidence and untested formulations', () => {
    expect(canMarkClinicallyReviewed({ ...candidate, sourceLinks: [] }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, sourceLinks: ['http://example.com'] }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, sourceLinks: [candidate.sourceLinks[0], candidate.sourceLinks[0]] }, { ...approval, sourceLinks: [candidate.sourceLinks[0], candidate.sourceLinks[0]] })).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, evidenceTestsPassed: false }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, formulationAdjudicated: false }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, unresolvedBlockingIssues: ['renal threshold'] }, approval)).toBe(false);
  });
  it('rejects stale source revisions and changed canonical mapping', () => {
    expect(canMarkClinicallyReviewed({ ...candidate, sourceLinks: ['https://doi.org/changed'] }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, mappedMedicationIds: ['MED-1','MED-3'] }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, mappedMedicationIds: ['MED-1','MED-1'] }, approval)).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, mappedMedicationIds: ['MED-1', ''] }, { ...approval, mappedMedicationIds: ['MED-1', ''] })).toBe(false);
    expect(canMarkClinicallyReviewed({ ...candidate, mappedMedicationIds: ['MED-1', 'ING-apixaban'] }, { ...approval, mappedMedicationIds: ['MED-1', 'ING-apixaban'] })).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, { ...approval, mappedMedicationIds: ['MED-1'] })).toBe(false);
  });
});
