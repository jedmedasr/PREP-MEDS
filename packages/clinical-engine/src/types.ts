export type ProcedureCode = 'EGD' | 'COLONOSCOPY' | 'EGD_COLONOSCOPY';

export type Disposition =
  | 'CONTINUE'
  | 'HOLD_STANDARD'
  | 'CONDITIONAL'
  | 'CLINICIAN_REVIEW_REQUIRED'
  | 'LOCAL_POLICY_REQUIRED'
  | 'INSUFFICIENT_INFORMATION'
  | 'OUT_OF_SCOPE';

export type RestartOwner =
  | 'RULE_DEFINED'
  | 'ENDOSCOPIST'
  | 'PRESCRIBER'
  | 'CLINICIAN_REVIEW'
  | 'NOT_APPLICABLE';

export type RuleStatus =
  | 'DRAFT'
  | 'EVIDENCE_REVIEWED'
  | 'TECHNICALLY_TESTED'
  | 'CLINICAL_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'RETIRED';

export type PolicyStatus =
  | 'DRAFT'
  | 'CLINICAL_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'RETIRED';

export interface VersionedRef {
  id: string;
  version: number;
}

export type ValueState = 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE' | 'CONFLICTING';

export interface ModifierValue {
  modifierId: string;
  state: ValueState;
  value?: unknown;
  unit?: string;
  provenance?: {
    sourceType:
      | 'USER_ENTERED'
      | 'PATIENT_REPORTED'
      | 'EHR'
      | 'FHIR'
      | 'AI_EXTRACTED'
      | 'CALCULATED'
      | 'OTHER';
    sourceReference?: string;
    observedAt?: string;
    recordedAt: string;
    confirmationStatus?: 'UNCONFIRMED' | 'CONFIRMED' | 'NOT_REQUIRED';
    aiConfidence?: number;
    calculatorId?: string;
    calculatorVersion?: string;
  };
}

export type Condition =
  | { op: 'ALL' | 'ANY'; conditions: Condition[] }
  | { op: 'NOT'; condition: Condition }
  | { op: 'EXISTS' | 'KNOWN'; field: string }
  | {
      op:
        | 'EQUALS'
        | 'NOT_EQUALS'
        | 'GREATER_THAN'
        | 'GREATER_THAN_OR_EQUAL'
        | 'LESS_THAN'
        | 'LESS_THAN_OR_EQUAL';
      field: string;
      value: unknown;
    }
  | { op: 'IN'; field: string; values: unknown[] };

export interface RuleScope {
  medicationIds?: string[];
  ingredientIds?: string[];
  drugClassIds?: string[];
  procedureCodes?: ProcedureCode[];
}

export interface HardStop {
  reasonCode: string;
  condition: Condition;
  disposition: 'CLINICIAN_REVIEW_REQUIRED';
}

export interface TimingRule {
  instructionCode?: string;
  preProcedure?: Record<string, unknown>;
  procedureDay?: Record<string, unknown>;
  restart?: Record<string, unknown>;
}

export interface ClinicalRule {
  id: string;
  version: number;
  name: string;
  scope: RuleScope;
  requiredModifierIds: string[];
  applicability?: Condition;
  hardStops?: HardStop[];
  disposition: Disposition;
  timingRule?: TimingRule;
  restartOwner?: RestartOwner;
  evidenceRefs: VersionedRef[];
  policyDependencyIds?: string[];
  status: RuleStatus;
  priority?: number;
}

export interface PolicyScope extends RuleScope {}

export interface PolicyEffect {
  dispositionOverride?: Exclude<Disposition, 'INSUFFICIENT_INFORMATION' | 'OUT_OF_SCOPE'>;
  reasonCodes?: string[];
  requiredModifierIds?: string[];
  timingRule?: TimingRule;
  restartOwner?: RestartOwner;
}

export interface PolicyOverlay {
  id: string;
  version: number;
  organizationId: string;
  siteId?: string;
  scopeLevel: 'ORGANIZATION' | 'SITE';
  name: string;
  status: PolicyStatus;
  scope: PolicyScope;
  appliesWhen?: Condition;
  effect: PolicyEffect;
  evidenceRefs?: VersionedRef[];
  priority?: number;
}

export interface MedicationContext {
  medicationId: string;
  ingredientIds: string[];
  drugClassIds: string[];
}

export interface DecisionContext {
  organizationId: string;
  siteId?: string;
  procedureCode: ProcedureCode;
  medication: MedicationContext;
  modifiers: ModifierValue[];
}

export type EngineMode = 'PRODUCTION' | 'VALIDATION';

export interface EngineRequest {
  decisionEventId: string;
  caseId?: string;
  occurredAt: string;
  actorRole?: 'MA' | 'NURSE' | 'CLINICIAN' | 'GOVERNANCE' | 'SYSTEM' | 'OTHER';
  engineVersion: string;
  mode?: EngineMode;
  context: DecisionContext;
  rules: ClinicalRule[];
  policies?: PolicyOverlay[];
}

export type TruthState = 'TRUE' | 'FALSE' | 'UNKNOWN';

export interface ConditionEvaluation {
  state: TruthState;
  unresolvedFields: string[];
}

export interface RuleCandidateTrace {
  ruleRef: VersionedRef;
  status: 'INELIGIBLE_STATUS' | 'SCOPE_MISMATCH' | 'APPLICABILITY_FALSE' | 'APPLICABILITY_UNKNOWN' | 'CANDIDATE';
  unresolvedFields?: string[];
  priority: number;
}

export interface HardStopTrace {
  ruleRef: VersionedRef;
  reasonCode: string;
  state: TruthState;
  unresolvedFields: string[];
}

export interface PolicyTrace {
  policyRef: VersionedRef;
  status:
    | 'INELIGIBLE_STATUS'
    | 'ORGANIZATION_MISMATCH'
    | 'SITE_MISMATCH'
    | 'SCOPE_MISMATCH'
    | 'CONDITION_FALSE'
    | 'CONDITION_UNKNOWN'
    | 'CANDIDATE'
    | 'SELECTED';
  unresolvedFields?: string[];
  priority: number;
  specificity: number;
}

export interface DecisionTrace {
  ruleCandidates: RuleCandidateTrace[];
  selectedRuleRef?: VersionedRef;
  hardStops: HardStopTrace[];
  policyCandidates: PolicyTrace[];
  selectedPolicyRef?: VersionedRef;
}

export interface DecisionEvent {
  id: string;
  caseId?: string;
  occurredAt: string;
  organizationId: string;
  siteId?: string;
  actorRole?: 'MA' | 'NURSE' | 'CLINICIAN' | 'GOVERNANCE' | 'SYSTEM' | 'OTHER';
  procedureCode: ProcedureCode;
  medicationId: string;
  modifierValues: ModifierValue[];
  disposition: Disposition;
  reasonCodes: string[];
  missingModifierIds: string[];
  ruleRefs: VersionedRef[];
  evidenceRefs: VersionedRef[];
  policyRefs: VersionedRef[];
  engineVersion: string;
  outputSnapshot: {
    timingRule?: TimingRule;
    restartOwner?: RestartOwner;
  };
}

export interface DecisionExecution {
  event: Readonly<DecisionEvent>;
  trace: Readonly<DecisionTrace>;
}
