/** Research review gate. No patient-facing instruction or prescribing authorization. */
export type ClinicalEvidenceReview = {
  groupId: string;
  evidenceHash: string;
  reviewerId: string;
  reviewedAt: string;
  sourceLinks: string[];
  mappedMedicationIds: string[];
  decision: 'APPROVED' | 'REJECTED';
};
export type EvidenceReviewCandidate = {
  groupId: string;
  evidenceHash: string;
  sourceLinks: string[];
  mappedMedicationIds: string[];
  formulationAdjudicated: boolean;
  evidenceTestsPassed: boolean;
  unresolvedBlockingIssues: string[];
};
/** Explicit review of the exact evidence revision is necessary but does not authorize release. */
export function canMarkClinicallyReviewed(candidate: EvidenceReviewCandidate, review: ClinicalEvidenceReview | null): boolean {
  if (!review || review.decision !== 'APPROVED' || !review.reviewerId.trim()) return false;
  if (!Number.isFinite(Date.parse(review.reviewedAt)) || !/^\d{4}-\d{2}-\d{2}T/.test(review.reviewedAt)) return false;
  if (!candidate.groupId.trim() || candidate.groupId !== review.groupId || !/^[a-f0-9]{64}$/i.test(candidate.evidenceHash) || candidate.evidenceHash !== review.evidenceHash) return false;
  if (!candidate.formulationAdjudicated || !candidate.evidenceTestsPassed || candidate.unresolvedBlockingIssues.length) return false;
  const validLinks = (links: string[]) => links.length > 0 && links.every(link => {
    try { const url = new URL(link); return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password && !url.hash && !['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase()); } catch { return false; }
  });
  if (!validLinks(candidate.sourceLinks) || !validLinks(review.sourceLinks)) return false;
  if (new Set(candidate.mappedMedicationIds).size !== candidate.mappedMedicationIds.length || !candidate.mappedMedicationIds.length) return false;
  if (new Set(review.mappedMedicationIds).size !== review.mappedMedicationIds.length) return false;
  return [...candidate.mappedMedicationIds].sort().join('|') === [...review.mappedMedicationIds].sort().join('|') &&
    [...candidate.sourceLinks].sort().join('|') === [...review.sourceLinks].sort().join('|');
}
