export type ResearchStatus =
  | 'NOT_RESEARCHED'
  | 'EVIDENCE_COLLECTION'
  | 'EVIDENCE_PACKET_READY'
  | 'RULE_DRAFTED'
  | 'TECHNICALLY_TESTED'
  | 'CLINICAL_REVIEW'
  | 'LOCAL_POLICY_REVIEW'
  | 'VALIDATED'
  | 'NEEDS_UPDATE'
  | 'RETIRED';

export type PriorityTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type ProcedureCode = 'EGD' | 'COLONOSCOPY' | 'EGD_COLONOSCOPY';

export type SourceKind =
  | 'US_GI_GUIDELINE'
  | 'PERIOPERATIVE_GUIDELINE'
  | 'FDA_LABEL'
  | 'CONSENSUS'
  | 'SYSTEMATIC_REVIEW'
  | 'RANDOMIZED_TRIAL'
  | 'OBSERVATIONAL_STUDY'
  | 'LOCAL_POLICY_SOURCE'
  | 'OTHER';

export interface MedicationBacklogItem {
  medicationId: string;
  canonicalName: string;
  ingredientIds: string[];
  classIds: string[];
  priorityTier: PriorityTier;
  researchStatus: ResearchStatus;
  procedures: ProcedureCode[];
  owner?: string;
  tags?: string[];
  notes?: string[];
  lastReviewedAt?: string;
  nextReviewDueAt?: string;
}

export interface SourceCandidate {
  sourceId: string;
  sourceKind: SourceKind;
  title: string;
  publisher: string;
  publicationDate?: string;
  retrievedAt: string;
  url?: string;
  authoritative: boolean;
  currentAsOfRetrieval: boolean;
  relevance: 'PRIMARY' | 'SECONDARY' | 'BACKGROUND';
  applicabilityNotes?: string[];
}

export interface EvidenceFinding {
  findingId: string;
  sourceId: string;
  statement: string;
  procedureCodes: ProcedureCode[];
  medicationIds: string[];
  ingredientIds?: string[];
  classIds?: string[];
  qualifiers?: string[];
  limitations?: string[];
  conflictsWithFindingIds?: string[];
}

export interface DecisionRequirementDraft {
  modifierId: string;
  reason: string;
  requiredFor: string[];
}

export interface HardStopDraft {
  reasonCode: string;
  description: string;
  requiredFields: string[];
}

export interface RuleDraftSummary {
  ruleDraftId: string;
  medicationId: string;
  procedureCode: ProcedureCode;
  proposedDisposition:
    | 'CONTINUE'
    | 'HOLD_STANDARD'
    | 'CONDITIONAL'
    | 'CLINICIAN_REVIEW_REQUIRED'
    | 'LOCAL_POLICY_REQUIRED'
    | 'INSUFFICIENT_INFORMATION'
    | 'OUT_OF_SCOPE';
  decisionRequirements: DecisionRequirementDraft[];
  hardStops: HardStopDraft[];
  evidenceFindingIds: string[];
  localPolicyDependencies?: string[];
  restartOwner?: 'RULE_DEFINED' | 'ENDOSCOPIST' | 'PRESCRIBER' | 'CLINICIAN_REVIEW' | 'NOT_APPLICABLE';
  notes?: string[];
}

export interface SyntheticCaseDraft {
  testCaseId: string;
  ruleDraftId: string;
  scenarioType:
    | 'ORDINARY'
    | 'MISSING_INPUT'
    | 'CONFLICTING_INPUT'
    | 'HARD_STOP'
    | 'BOUNDARY'
    | 'POLICY_DEPENDENCY'
    | 'COMBINATION_PRODUCT'
    | 'OUT_OF_SCOPE';
  description: string;
  expectedDisposition: RuleDraftSummary['proposedDisposition'];
  expectedReasonCodes?: string[];
}

export interface EvidencePacket {
  packetId: string;
  medicationId: string;
  canonicalName: string;
  generatedAt: string;
  sourceCandidates: SourceCandidate[];
  findings: EvidenceFinding[];
  unresolvedQuestions: string[];
  conflicts: string[];
  ruleDrafts: RuleDraftSummary[];
  syntheticCases: SyntheticCaseDraft[];
  status: 'DRAFT' | 'TECHNICALLY_COMPLETE' | 'READY_FOR_CLINICAL_REVIEW';
}

export interface PipelineTransition {
  medicationId: string;
  from: ResearchStatus;
  to: ResearchStatus;
  actorRole: 'AUTOMATION' | 'ENGINEER' | 'CLINICAL_GOVERNANCE';
  occurredAt: string;
  reason?: string;
}

export interface ReviewQueueItem {
  medicationId: string;
  canonicalName: string;
  queue:
    | 'EVIDENCE_REVIEW'
    | 'CLINICAL_RULE_REVIEW'
    | 'LOCAL_POLICY_REVIEW'
    | 'UPDATE_REVIEW';
  blockers: string[];
  packetId?: string;
}
