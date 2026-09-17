export type VersionedRef = { id: string; version: number };

export type ProcedureCode = 'EGD' | 'COLONOSCOPY' | 'EGD_COLONOSCOPY';

export type ResearchStatus =
  | 'NOT_RESEARCHED'
  | 'EVIDENCE_COLLECTION'
  | 'EVIDENCE_COMPLETE'
  | 'RULES_DRAFTED'
  | 'TESTS_DRAFTED'
  | 'TECHNICALLY_TESTED'
  | 'READY_FOR_CLINICAL_REVIEW'
  | 'CLINICAL_REVIEW'
  | 'LOCAL_POLICY_REVIEW'
  | 'VALIDATED'
  | 'NEEDS_UPDATE'
  | 'BLOCKED'
  | 'RETIRED';

export type PipelineActorRole =
  | 'AUTOMATION'
  | 'CONTENT_REVIEWER'
  | 'CLINICAL_GOVERNANCE'
  | 'LOCAL_POLICY_GOVERNANCE'
  | 'SYSTEM';

export type KnowledgeTargetType = 'MEDICATION' | 'INGREDIENT' | 'DRUG_CLASS';

export interface KnowledgeTarget {
  type: KnowledgeTargetType;
  id?: string;
  canonicalName: string;
  externalCodes?: Array<{
    system: string;
    code: string;
    display?: string;
    version?: string;
  }>;
}

export interface ResearchBacklogItem {
  id: string;
  target: KnowledgeTarget;
  tier: 1 | 2 | 3;
  priority: number;
  status: ResearchStatus;
  procedureCodes: ProcedureCode[];
  dependencyIds?: string[];
  blockedReason?: string;
  claimedBy?: string;
  claimToken?: string;
  claimExpiresAt?: string;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  lastCompletedPacketRef?: VersionedRef;
  lastEvidenceReviewAt?: string;
  nextEvidenceReviewDueAt?: string;
}

export type EvidenceSourceCategory =
  | 'US_GI_GUIDELINE'
  | 'PERIOPERATIVE_ANESTHESIA_GUIDANCE'
  | 'FDA_LABEL'
  | 'OTHER_REGULATOR'
  | 'SYSTEMATIC_REVIEW'
  | 'RANDOMIZED_TRIAL'
  | 'OBSERVATIONAL_STUDY'
  | 'INSTITUTIONAL_POLICY'
  | 'OTHER';

export interface SourceSearchPlanEntry {
  category: EvidenceSourceCategory;
  required: boolean;
  rationale: string;
  searchTerms: string[];
}

export interface ResearchPlan {
  target: KnowledgeTarget;
  procedureCodes: ProcedureCode[];
  sourcePlan: SourceSearchPlanEntry[];
  questionsToResolve: string[];
  expectedModifierDomains: string[];
}

export type PacketLifecycle =
  | 'DRAFT'
  | 'TECHNICALLY_VALIDATED'
  | 'READY_FOR_CLINICAL_REVIEW'
  | 'CLINICALLY_REVIEWED'
  | 'LOCAL_POLICY_REVIEWED'
  | 'VALIDATED'
  | 'SUPERSEDED'
  | 'RETIRED';

export interface EvidenceFinding {
  evidenceRef: VersionedRef;
  category: EvidenceSourceCategory;
  relevance: 'PRIMARY' | 'SUPPORTING' | 'CONTEXT_ONLY';
  applicabilitySummary: string;
  limitations: string[];
}

export interface EvidenceConflictSummary {
  conflictId: string;
  evidenceRefs: VersionedRef[];
  topic: string;
  description: string;
  unresolved: boolean;
}

export interface ProcedureResearchSummary {
  procedureCode: ProcedureCode;
  evidenceFindingRefs: VersionedRef[];
  draftDisposition?: string;
  requiredModifierIds: string[];
  hardStopConcepts: string[];
  restartOwnerConcept?: string;
  unresolvedQuestions: string[];
}

export interface MedicationEvidencePacket {
  id: string;
  version: number;
  supersedes?: VersionedRef;
  backlogItemId: string;
  target: KnowledgeTarget;
  lifecycle: PacketLifecycle;
  createdAt: string;
  updatedAt: string;
  researchPlan: ResearchPlan;
  evidenceFindings: EvidenceFinding[];
  conflicts: EvidenceConflictSummary[];
  procedureSummaries: ProcedureResearchSummary[];
  requiredModifierIds: string[];
  draftRuleRefs: VersionedRef[];
  draftTestCaseRefs: VersionedRef[];
  localPolicyQuestions: string[];
  openQuestions: string[];
  reviewerNotes: string[];
  sourceCoverage: Array<{
    category: EvidenceSourceCategory;
    searched: boolean;
    evidenceFound: boolean;
    notes?: string;
  }>;
  provenance: {
    createdBy: string;
    creationRole: PipelineActorRole;
    retrievalRunIds: string[];
    contentHash?: string;
  };
}

export interface ResearchRun {
  id: string;
  backlogItemId: string;
  packetRef?: VersionedRef;
  actorId: string;
  actorRole: PipelineActorRole;
  startedAt: string;
  completedAt?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  sourceQueries: Array<{
    category: EvidenceSourceCategory;
    query: string;
  }>;
  retrievedSourceRefs: VersionedRef[];
  generatedArtifactRefs: VersionedRef[];
  warnings: string[];
  errors: string[];
}

export interface TransitionContext {
  actorId: string;
  role: PipelineActorRole;
  at: string;
  reason?: string;
}

export interface ResearchTransition {
  from: ResearchStatus;
  to: ResearchStatus;
  allowed: boolean;
  reason?: string;
}

export interface PacketValidationIssue {
  code: string;
  path: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}
