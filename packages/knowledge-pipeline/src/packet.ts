import type {
  EvidenceFinding,
  EvidencePacket,
  MedicationBacklogItem,
  RuleDraftSummary,
  SourceCandidate,
  SyntheticCaseDraft,
} from './types.js';
import { validateEvidencePacket } from './validate.js';

export interface PacketBuildInput {
  item: MedicationBacklogItem;
  packetId: string;
  generatedAt: string;
  sources: SourceCandidate[];
  findings: EvidenceFinding[];
  ruleDrafts?: RuleDraftSummary[];
  syntheticCases?: SyntheticCaseDraft[];
  unresolvedQuestions?: string[];
  conflicts?: string[];
}

export function buildDraftPacket(input: PacketBuildInput): EvidencePacket {
  return {
    packetId: input.packetId,
    medicationId: input.item.medicationId,
    canonicalName: input.item.canonicalName,
    generatedAt: input.generatedAt,
    sourceCandidates: [...input.sources],
    findings: [...input.findings],
    unresolvedQuestions: [...(input.unresolvedQuestions ?? [])],
    conflicts: [...(input.conflicts ?? [])],
    ruleDrafts: [...(input.ruleDrafts ?? [])],
    syntheticCases: [...(input.syntheticCases ?? [])],
    status: 'DRAFT',
  };
}

export function markTechnicallyComplete(packet: EvidencePacket): EvidencePacket {
  const candidate = { ...packet, status: 'TECHNICALLY_COMPLETE' as const };
  const issues = validateEvidencePacket(candidate);
  if (issues.length > 0) {
    throw new Error(`Cannot mark packet technically complete:\n${issues.map((issue) => `${issue.code}: ${issue.message}`).join('\n')}`);
  }
  return candidate;
}

export function markReadyForClinicalReview(packet: EvidencePacket): EvidencePacket {
  const candidate = { ...packet, status: 'READY_FOR_CLINICAL_REVIEW' as const };
  const issues = validateEvidencePacket(candidate);
  if (issues.length > 0) {
    throw new Error(`Cannot mark packet ready for clinical review:\n${issues.map((issue) => `${issue.code}: ${issue.message}`).join('\n')}`);
  }
  return candidate;
}
