import {
  shadowReviewPackets,
  syntheticShadowCases,
  type ShadowCandidatePathway,
  type ShadowReviewDomain,
  type ShadowReviewRole,
} from '@prep-meds/clinical-content';
import type { VersionedRef } from '@prep-meds/clinical-engine';
import {
  executeAllSyntheticShadowCases,
  type ShadowResolutionAudit,
  type SyntheticShadowExecution,
} from './shadow-validation-runner';

export interface ReviewEvidenceLink {
  evidenceRef: VersionedRef;
  sourceRef: VersionedRef;
  sourceLifecycle: string;
}

export interface DomainCaseReviewExport {
  caseId: string;
  procedureCode: string;
  procedureBleedingRisk: string;
  medicationInputs: readonly string[];
  scenarioTags: readonly string[];
  resolutions: readonly ShadowResolutionAudit[];
  candidatePathways: readonly ShadowCandidatePathway[];
  evidenceLinks: readonly ReviewEvidenceLink[];
  unresolvedModifierIds: readonly string[];
  reasonCodes: readonly string[];
  reviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' | 'LOCAL_POLICY_REQUIRED';
  patientInstructions: null;
}

export interface DomainReviewExport {
  schemaVersion: '1.0.0';
  exportMode: 'ACCOUNTABLE_HUMAN_REVIEW_ONLY';
  packetId: string;
  domain: ShadowReviewDomain;
  status: 'DRAFT_REVIEW_REQUIRED';
  reviewerRoles: readonly ShadowReviewRole[];
  evidenceProvenanceRequirements: readonly string[];
  unresolvedLocalPolicyQuestions: readonly string[];
  cases: readonly DomainCaseReviewExport[];
  governance: {
    patientInstructionsEnabled: false;
    clinicalApprovalGranted: false;
    localPolicyApprovalGranted: false;
    productionActivationGranted: false;
  };
}

export interface HumanDecisionRegisterEntry {
  id: string;
  domain: ShadowReviewDomain;
  question: string;
  accountableReviewerRoles: readonly ShadowReviewRole[];
  status: 'PENDING_HUMAN_DECISION';
  activationBlocking: true;
  engineeringInferenceProhibited: true;
}

export interface ShadowReviewHandoff {
  schemaVersion: '1.0.0';
  status: 'ENGINEERING_COMPLETE_HUMAN_REVIEW_REQUIRED';
  domainExports: readonly DomainReviewExport[];
  humanDecisionRegister: readonly HumanDecisionRegisterEntry[];
  productionActivationStatus: 'NOT_ACTIVE';
  patientInstructionsEnabled: false;
}

function refKey(ref: VersionedRef): string {
  return ref.id + '@' + ref.version;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function evidenceLinks(execution: SyntheticShadowExecution): ReviewEvidenceLink[] {
  const byEvidence = new Map<string, ReviewEvidenceLink>();
  for (const decision of execution.decisionTraces) {
    for (const provenance of decision.evidenceProvenance) {
      if (!provenance.atomFound || !provenance.sourceFound || !provenance.sourceRef) continue;
      byEvidence.set(refKey(provenance.evidenceRef), {
        evidenceRef: { ...provenance.evidenceRef },
        sourceRef: { ...provenance.sourceRef },
        sourceLifecycle: provenance.sourceLifecycle ?? 'UNKNOWN',
      });
    }
  }
  return [...byEvidence.values()].sort((a, b) => refKey(a.evidenceRef).localeCompare(refKey(b.evidenceRef)));
}

function caseExport(execution: SyntheticShadowExecution): DomainCaseReviewExport {
  const definition = syntheticShadowCases.find((item) => item.id === execution.caseId);
  if (!definition) throw new Error('Missing synthetic case definition for ' + execution.caseId);
  return {
    caseId: definition.id,
    procedureCode: definition.procedureCode,
    procedureBleedingRisk: definition.procedureBleedingRisk,
    medicationInputs: [...definition.medicationInputs],
    scenarioTags: [...definition.scenarioTags].sort((a, b) => a.localeCompare(b)),
    resolutions: execution.resolutions,
    candidatePathways: execution.audit.candidatePathways,
    evidenceLinks: evidenceLinks(execution),
    unresolvedModifierIds: uniqueSorted(
      execution.audit.candidatePathways.flatMap((pathway) => pathway.missingModifierIds),
    ),
    reasonCodes: uniqueSorted(
      execution.audit.candidatePathways.flatMap((pathway) => pathway.reasonCodes),
    ),
    reviewDisposition: execution.audit.reviewDisposition,
    patientInstructions: null,
  };
}

export function generateDomainReviewExports(): readonly DomainReviewExport[] {
  const executions = executeAllSyntheticShadowCases(syntheticShadowCases);
  const executionByCase = new Map(executions.map((execution) => [execution.caseId, execution]));

  return [...shadowReviewPackets]
    .sort((a, b) => a.domain.localeCompare(b.domain))
    .map((packet): DomainReviewExport => {
      const cases = syntheticShadowCases
        .filter((item) => item.domain === packet.domain)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((definition) => {
          const execution = executionByCase.get(definition.id);
          if (!execution) throw new Error('Missing shadow execution for ' + definition.id);
          return caseExport(execution);
        });
      return {
        schemaVersion: '1.0.0',
        exportMode: 'ACCOUNTABLE_HUMAN_REVIEW_ONLY',
        packetId: packet.id,
        domain: packet.domain,
        status: packet.status,
        reviewerRoles: [...packet.reviewerRoles],
        evidenceProvenanceRequirements: [...packet.evidenceProvenanceRequirements],
        unresolvedLocalPolicyQuestions: [...packet.unresolvedLocalPolicyQuestions],
        cases,
        governance: {
          patientInstructionsEnabled: false,
          clinicalApprovalGranted: false,
          localPolicyApprovalGranted: false,
          productionActivationGranted: false,
        },
      };
    });
}

export function generateHumanDecisionRegister(): readonly HumanDecisionRegisterEntry[] {
  return [...shadowReviewPackets]
    .sort((a, b) => a.domain.localeCompare(b.domain))
    .flatMap((packet) =>
      packet.unresolvedLocalPolicyQuestions.map((question, index): HumanDecisionRegisterEntry => ({
        id: packet.id + '-DECISION-' + String(index + 1).padStart(2, '0'),
        domain: packet.domain,
        question,
        accountableReviewerRoles: [...packet.reviewerRoles],
        status: 'PENDING_HUMAN_DECISION',
        activationBlocking: true,
        engineeringInferenceProhibited: true,
      })),
    );
}

export function generateShadowReviewHandoff(): ShadowReviewHandoff {
  return {
    schemaVersion: '1.0.0',
    status: 'ENGINEERING_COMPLETE_HUMAN_REVIEW_REQUIRED',
    domainExports: generateDomainReviewExports(),
    humanDecisionRegister: generateHumanDecisionRegister(),
    productionActivationStatus: 'NOT_ACTIVE',
    patientInstructionsEnabled: false,
  };
}

export function serializeShadowReviewHandoff(): string {
  return JSON.stringify(generateShadowReviewHandoff(), null, 2) + '\n';
}
