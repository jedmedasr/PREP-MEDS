import type { ResearchBacklogItem } from './types.js';

export interface QueueSelection {
  selected?: ResearchBacklogItem;
  skipped: Array<{ id: string; reason: string }>;
}

function isExpired(iso: string | undefined, now: Date): boolean {
  if (!iso) return true;
  const timestamp = Date.parse(iso);
  return Number.isNaN(timestamp) || timestamp <= now.getTime();
}

function dependenciesSatisfied(item: ResearchBacklogItem, items: ResearchBacklogItem[]): boolean {
  if (!item.dependencyIds?.length) return true;
  const byId = new Map(items.map((candidate) => [candidate.id, candidate]));
  return item.dependencyIds.every((id) => byId.get(id)?.status === 'VALIDATED');
}

function queueEligible(item: ResearchBacklogItem, now: Date): boolean {
  if (!['NOT_RESEARCHED', 'NEEDS_UPDATE', 'EVIDENCE_COLLECTION'].includes(item.status)) return false;
  if (item.status === 'EVIDENCE_COLLECTION' && !isExpired(item.claimExpiresAt, now)) return false;
  if (item.status === 'BLOCKED' || item.status === 'RETIRED') return false;
  return true;
}

export function selectNextBacklogItem(
  items: ResearchBacklogItem[],
  now: Date = new Date(),
): QueueSelection {
  const skipped: QueueSelection['skipped'] = [];
  const eligible = items.filter((item) => {
    if (!queueEligible(item, now)) {
      skipped.push({ id: item.id, reason: 'STATUS_OR_ACTIVE_CLAIM' });
      return false;
    }
    if (!dependenciesSatisfied(item, items)) {
      skipped.push({ id: item.id, reason: 'DEPENDENCY_NOT_VALIDATED' });
      return false;
    }
    return true;
  });

  eligible.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const aReview = a.nextEvidenceReviewDueAt ? Date.parse(a.nextEvidenceReviewDueAt) : Number.POSITIVE_INFINITY;
    const bReview = b.nextEvidenceReviewDueAt ? Date.parse(b.nextEvidenceReviewDueAt) : Number.POSITIVE_INFINITY;
    if (aReview !== bReview) return aReview - bReview;
    return a.id.localeCompare(b.id);
  });

  return { selected: eligible[0], skipped };
}

export function claimBacklogItem(
  item: ResearchBacklogItem,
  actorId: string,
  claimToken: string,
  claimedAt: Date,
  leaseMinutes = 55,
): ResearchBacklogItem {
  const expires = new Date(claimedAt.getTime() + leaseMinutes * 60_000).toISOString();
  return {
    ...item,
    status: 'EVIDENCE_COLLECTION',
    claimedBy: actorId,
    claimToken,
    claimExpiresAt: expires,
    attemptCount: item.attemptCount + 1,
    updatedAt: claimedAt.toISOString(),
  };
}

export function releaseBacklogClaim(
  item: ResearchBacklogItem,
  updatedAt: string,
): ResearchBacklogItem {
  const { claimedBy: _claimedBy, claimToken: _claimToken, claimExpiresAt: _claimExpiresAt, ...rest } = item;
  return { ...rest, updatedAt };
}
