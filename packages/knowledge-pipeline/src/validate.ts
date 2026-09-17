import type { EvidencePacket, MedicationBacklogItem, RuleDraftSummary, SourceCandidate } from './types.js';

export interface PipelineValidationIssue {
  code: string;
  message: string;
  path?: string;
}

function validateSource(source: SourceCandidate, index: number): PipelineValidationIssue[] {
  const issues: PipelineValidationIssue[] = [];
  if (!source.sourceId) issues.push({ code: 'SOURCE_ID_REQUIRED', message: 'Source ID is required.', path: `sourceCandidates[${index}]` });
  if (!source.title.trim()) issues.push({ code: 'SOURCE_TITLE_REQUIRED', message: 'Source title is required.', path: `sourceCandidates[${index}]` });
  if (!source.publisher.trim()) issues.push({ code: 'SOURCE_PUBLISHER_REQUIRED', message: 'Source publisher is required.', path: `sourceCandidates[${index}]` });
  return issues;
}

function validateRuleDraft(rule: RuleDraftSummary, packet: EvidencePacket, index: number): PipelineValidationIssue[] {
  const issues: PipelineValidationIssue[] = [];
  const findingIds = new Set(packet.findings.map((finding) => finding.findingId));
  for (const evidenceId of rule.evidenceFindingIds) {
    if (!findingIds.has(evidenceId)) {
      issues.push({
        code: 'UNKNOWN_FINDING_REFERENCE',
        message: `Rule draft ${rule.ruleDraftId} references unknown finding ${evidenceId}.`,
        path: `ruleDrafts[${index}]`,
      });
    }
  }
  if (rule.medicationId !== packet.medicationId) {
    issues.push({
      code: 'RULE_MEDICATION_MISMATCH',
      message: `Rule draft ${rule.ruleDraftId} does not match packet medication.`,
      path: `ruleDrafts[${index}]`,
    });
  }
  return issues;
}

export function validateEvidencePacket(packet: EvidencePacket): PipelineValidationIssue[] {
  const issues: PipelineValidationIssue[] = [];
  if (!packet.packetId) issues.push({ code: 'PACKET_ID_REQUIRED', message: 'Packet ID is required.' });
  if (!packet.medicationId) issues.push({ code: 'MEDICATION_ID_REQUIRED', message: 'Medication ID is required.' });
  packet.sourceCandidates.forEach((source, index) => issues.push(...validateSource(source, index)));

  const sourceIds = new Set(packet.sourceCandidates.map((source) => source.sourceId));
  for (const [index, finding] of packet.findings.entries()) {
    if (!sourceIds.has(finding.sourceId)) {
      issues.push({
        code: 'UNKNOWN_SOURCE_REFERENCE',
        message: `Finding ${finding.findingId} references unknown source ${finding.sourceId}.`,
        path: `findings[${index}]`,
      });
    }
  }

  packet.ruleDrafts.forEach((rule, index) => issues.push(...validateRuleDraft(rule, packet, index)));

  const ruleIds = new Set(packet.ruleDrafts.map((rule) => rule.ruleDraftId));
  for (const [index, testCase] of packet.syntheticCases.entries()) {
    if (!ruleIds.has(testCase.ruleDraftId)) {
      issues.push({
        code: 'UNKNOWN_RULE_DRAFT_REFERENCE',
        message: `Synthetic test ${testCase.testCaseId} references unknown rule draft ${testCase.ruleDraftId}.`,
        path: `syntheticCases[${index}]`,
      });
    }
  }

  if (packet.status !== 'DRAFT') {
    const primarySources = packet.sourceCandidates.filter((source) => source.relevance === 'PRIMARY');
    if (primarySources.length === 0) {
      issues.push({
        code: 'PRIMARY_SOURCE_REQUIRED',
        message: 'A technically complete packet requires at least one primary source.',
      });
    }
    if (packet.findings.length === 0) {
      issues.push({ code: 'FINDINGS_REQUIRED', message: 'A technically complete packet requires evidence findings.' });
    }
  }

  if (packet.status === 'READY_FOR_CLINICAL_REVIEW' && packet.unresolvedQuestions.length > 0) {
    issues.push({
      code: 'UNRESOLVED_QUESTIONS_REMAIN',
      message: 'Packet cannot be marked ready for clinical review while unresolved evidence questions remain.',
    });
  }

  return issues;
}

export function validateBacklog(items: MedicationBacklogItem[]): PipelineValidationIssue[] {
  const issues: PipelineValidationIssue[] = [];
  const ids = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (ids.has(item.medicationId)) {
      issues.push({ code: 'DUPLICATE_MEDICATION_ID', message: `Duplicate medication ${item.medicationId}.`, path: `[${index}]` });
    }
    ids.add(item.medicationId);
    if (item.procedures.length === 0) {
      issues.push({ code: 'PROCEDURE_SCOPE_REQUIRED', message: `Medication ${item.medicationId} has no procedure scope.`, path: `[${index}]` });
    }
  }
  return issues;
}

export function assertValidEvidencePacket(packet: EvidencePacket): void {
  const issues = validateEvidencePacket(packet);
  if (issues.length > 0) throw new Error(issues.map((issue) => `${issue.code}: ${issue.message}`).join('\n'));
}
