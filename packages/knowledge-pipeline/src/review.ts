import type { EvidencePacket, MedicationBacklogItem, ReviewQueueItem } from './types.js';

export function buildReviewQueueItem(
  item: MedicationBacklogItem,
  packet?: EvidencePacket,
): ReviewQueueItem | undefined {
  if (item.researchStatus === 'TECHNICALLY_TESTED') {
    return {
      medicationId: item.medicationId,
      canonicalName: item.canonicalName,
      queue: 'CLINICAL_RULE_REVIEW',
      blockers: packet?.unresolvedQuestions ?? [],
      ...(packet ? { packetId: packet.packetId } : {}),
    };
  }

  if (item.researchStatus === 'LOCAL_POLICY_REVIEW') {
    return {
      medicationId: item.medicationId,
      canonicalName: item.canonicalName,
      queue: 'LOCAL_POLICY_REVIEW',
      blockers: packet?.conflicts ?? [],
      ...(packet ? { packetId: packet.packetId } : {}),
    };
  }

  if (item.researchStatus === 'NEEDS_UPDATE') {
    return {
      medicationId: item.medicationId,
      canonicalName: item.canonicalName,
      queue: 'UPDATE_REVIEW',
      blockers: [],
      ...(packet ? { packetId: packet.packetId } : {}),
    };
  }

  if (item.researchStatus === 'EVIDENCE_PACKET_READY' || item.researchStatus === 'RULE_DRAFTED') {
    return {
      medicationId: item.medicationId,
      canonicalName: item.canonicalName,
      queue: 'EVIDENCE_REVIEW',
      blockers: packet?.unresolvedQuestions ?? [],
      ...(packet ? { packetId: packet.packetId } : {}),
    };
  }

  return undefined;
}

export function buildReviewQueue(
  items: MedicationBacklogItem[],
  packets: EvidencePacket[] = [],
): ReviewQueueItem[] {
  const packetByMedication = new Map(packets.map((packet) => [packet.medicationId, packet]));
  return items
    .map((item) => buildReviewQueueItem(item, packetByMedication.get(item.medicationId)))
    .filter((item): item is ReviewQueueItem => item !== undefined)
    .sort((a, b) => {
      const queueRank = {
        UPDATE_REVIEW: 1,
        CLINICAL_RULE_REVIEW: 2,
        LOCAL_POLICY_REVIEW: 3,
        EVIDENCE_REVIEW: 4,
      } as const;
      const rank = queueRank[a.queue] - queueRank[b.queue];
      return rank !== 0 ? rank : a.canonicalName.localeCompare(b.canonicalName);
    });
}
