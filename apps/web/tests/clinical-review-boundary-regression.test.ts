import { describe, expect, it } from 'vitest';
import { canMarkClinicallyReviewed, type EvidenceReviewCandidate, type ClinicalEvidenceReview } from '../lib/clinical-evidence-review-gate';

const hash = 'a'.repeat(64);
const candidate: EvidenceReviewCandidate = {
  groupId: 'apixaban-adult-oral', evidenceHash: hash,
  sourceLinks: ['https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics', 'https://gut.bmj.com/content/70/9/1611'],
  mappedMedicationIds: ['MED-apixaban'], formulationAdjudicated: true,
  evidenceTestsPassed: true, unresolvedBlockingIssues: [],
};
const review: ClinicalEvidenceReview = {
  groupId: candidate.groupId, evidenceHash: hash, reviewerId: 'authenticated-clinician-placeholder',
  reviewedAt: '2026-11-08T12:00:00-05:00', sourceLinks: [...candidate.sourceLinks],
  mappedMedicationIds: ['MED-apixaban'], decision: 'APPROVED',
};
describe('clinician evidence revision and canonical mapping fail-closed regression', () => {
  it('accepts a matching, explicitly approved evidence revision only at the pure predicate layer', () => {
    expect(canMarkClinicallyReviewed(candidate, review)).toBe(true);
  });
  it('rejects a stale evidence revision after an evidence change', () => {
    expect(canMarkClinicallyReviewed({...candidate, evidenceHash: 'b'.repeat(64)}, review)).toBe(false);
  });
  it('rejects an ASGE source omission or source substitution', () => {
    expect(canMarkClinicallyReviewed({...candidate, sourceLinks: candidate.sourceLinks.slice(1)}, review)).toBe(false);
    expect(canMarkClinicallyReviewed({...candidate, sourceLinks: ['https://example.org/other', candidate.sourceLinks[1]]}, review)).toBe(false);
  });
  it('rejects missing or mismatched canonical medication IDs', () => {
    expect(canMarkClinicallyReviewed({...candidate, mappedMedicationIds: []}, review)).toBe(false);
    expect(canMarkClinicallyReviewed({...candidate, mappedMedicationIds: ['MED-rivaroxaban']}, review)).toBe(false);
  });
  it('rejects unresolved research, unadjudicated formulation, or unexecuted evidence tests', () => {
    expect(canMarkClinicallyReviewed({...candidate, unresolvedBlockingIssues: ['CrCl 60 boundary']}, review)).toBe(false);
    expect(canMarkClinicallyReviewed({...candidate, formulationAdjudicated: false}, review)).toBe(false);
    expect(canMarkClinicallyReviewed({...candidate, evidenceTestsPassed: false}, review)).toBe(false);
  });
  it('rejects self-attested approval with no reviewer identity or a rejection decision', () => {
    expect(canMarkClinicallyReviewed(candidate, {...review, reviewerId: ' '})).toBe(false);
    expect(canMarkClinicallyReviewed(candidate, {...review, decision: 'REJECTED'})).toBe(false);
  });
});
