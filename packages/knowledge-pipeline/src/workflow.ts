import type { MedicationBacklogItem, PipelineTransition, ResearchStatus } from './types.js';

const allowedTransitions: Record<ResearchStatus, ResearchStatus[]> = {
  NOT_RESEARCHED: ['EVIDENCE_COLLECTION', 'RETIRED'],
  EVIDENCE_COLLECTION: ['EVIDENCE_PACKET_READY', 'NEEDS_UPDATE', 'RETIRED'],
  EVIDENCE_PACKET_READY: ['RULE_DRAFTED', 'EVIDENCE_COLLECTION', 'NEEDS_UPDATE'],
  RULE_DRAFTED: ['TECHNICALLY_TESTED', 'EVIDENCE_COLLECTION', 'NEEDS_UPDATE'],
  TECHNICALLY_TESTED: ['CLINICAL_REVIEW', 'LOCAL_POLICY_REVIEW', 'NEEDS_UPDATE'],
  CLINICAL_REVIEW: ['LOCAL_POLICY_REVIEW', 'VALIDATED', 'NEEDS_UPDATE'],
  LOCAL_POLICY_REVIEW: ['CLINICAL_REVIEW', 'VALIDATED', 'NEEDS_UPDATE'],
  VALIDATED: ['NEEDS_UPDATE', 'RETIRED'],
  NEEDS_UPDATE: ['EVIDENCE_COLLECTION', 'RETIRED'],
  RETIRED: [],
};

const humanOnlyTargets = new Set<ResearchStatus>(['VALIDATED']);

export function canTransitionStatus(
  from: ResearchStatus,
  to: ResearchStatus,
  actorRole: PipelineTransition['actorRole'],
): boolean {
  if (!allowedTransitions[from].includes(to)) return false;
  if (humanOnlyTargets.has(to) && actorRole !== 'CLINICAL_GOVERNANCE') return false;
  return true;
}

export function transitionBacklogItem(
  item: MedicationBacklogItem,
  transition: Omit<PipelineTransition, 'medicationId' | 'from'>,
): { item: MedicationBacklogItem; transition: PipelineTransition } {
  if (!canTransitionStatus(item.researchStatus, transition.to, transition.actorRole)) {
    throw new Error(
      `Disallowed research transition ${item.researchStatus} -> ${transition.to} for ${transition.actorRole}`,
    );
  }

  const audit: PipelineTransition = {
    medicationId: item.medicationId,
    from: item.researchStatus,
    ...transition,
  };

  return {
    item: {
      ...item,
      researchStatus: transition.to,
      ...(transition.to === 'VALIDATED' ? { lastReviewedAt: transition.occurredAt } : {}),
    },
    transition: audit,
  };
}

export function nextResearchItem(items: MedicationBacklogItem[]): MedicationBacklogItem | undefined {
  const rank: Record<PriorityTierKey, number> = { TIER_1: 1, TIER_2: 2, TIER_3: 3 };
  return [...items]
    .filter((item) => ['NOT_RESEARCHED', 'NEEDS_UPDATE'].includes(item.researchStatus))
    .sort((a, b) => {
      const priority = rank[a.priorityTier] - rank[b.priorityTier];
      if (priority !== 0) return priority;
      return a.canonicalName.localeCompare(b.canonicalName);
    })[0];
}

type PriorityTierKey = MedicationBacklogItem['priorityTier'];
