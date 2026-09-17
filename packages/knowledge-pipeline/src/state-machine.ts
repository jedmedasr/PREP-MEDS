import type {
  PipelineActorRole,
  ResearchStatus,
  ResearchTransition,
  TransitionContext,
} from './types.js';

const FORWARD_TRANSITIONS: Record<ResearchStatus, ResearchStatus[]> = {
  NOT_RESEARCHED: ['EVIDENCE_COLLECTION', 'BLOCKED', 'RETIRED'],
  EVIDENCE_COLLECTION: ['EVIDENCE_COMPLETE', 'BLOCKED', 'NEEDS_UPDATE'],
  EVIDENCE_COMPLETE: ['RULES_DRAFTED', 'BLOCKED', 'NEEDS_UPDATE'],
  RULES_DRAFTED: ['TESTS_DRAFTED', 'BLOCKED', 'NEEDS_UPDATE'],
  TESTS_DRAFTED: ['TECHNICALLY_TESTED', 'BLOCKED', 'NEEDS_UPDATE'],
  TECHNICALLY_TESTED: ['READY_FOR_CLINICAL_REVIEW', 'BLOCKED', 'NEEDS_UPDATE'],
  READY_FOR_CLINICAL_REVIEW: ['CLINICAL_REVIEW', 'BLOCKED', 'NEEDS_UPDATE'],
  CLINICAL_REVIEW: ['LOCAL_POLICY_REVIEW', 'VALIDATED', 'BLOCKED', 'NEEDS_UPDATE'],
  LOCAL_POLICY_REVIEW: ['VALIDATED', 'BLOCKED', 'NEEDS_UPDATE'],
  VALIDATED: ['NEEDS_UPDATE', 'RETIRED'],
  NEEDS_UPDATE: ['EVIDENCE_COLLECTION', 'BLOCKED', 'RETIRED'],
  BLOCKED: ['EVIDENCE_COLLECTION', 'NEEDS_UPDATE', 'RETIRED'],
  RETIRED: [],
};

const HUMAN_ONLY_DESTINATIONS = new Set<ResearchStatus>([
  'CLINICAL_REVIEW',
  'LOCAL_POLICY_REVIEW',
  'VALIDATED',
]);

const CLINICAL_ROLES = new Set<PipelineActorRole>([
  'CLINICAL_GOVERNANCE',
  'LOCAL_POLICY_GOVERNANCE',
]);

export function canTransitionResearchStatus(
  from: ResearchStatus,
  to: ResearchStatus,
  context: Pick<TransitionContext, 'role'>,
): ResearchTransition {
  if (from === to) return { from, to, allowed: true };
  const allowedDestinations = FORWARD_TRANSITIONS[from] ?? [];
  if (!allowedDestinations.includes(to)) {
    return { from, to, allowed: false, reason: 'INVALID_WORKFLOW_TRANSITION' };
  }

  if (HUMAN_ONLY_DESTINATIONS.has(to)) {
    if (!CLINICAL_ROLES.has(context.role)) {
      return { from, to, allowed: false, reason: 'CLINICAL_GOVERNANCE_REQUIRED' };
    }
  }

  if (to === 'VALIDATED' && context.role !== 'CLINICAL_GOVERNANCE') {
    return { from, to, allowed: false, reason: 'CLINICAL_GOVERNANCE_REQUIRED' };
  }

  return { from, to, allowed: true };
}

export function assertResearchTransition(
  from: ResearchStatus,
  to: ResearchStatus,
  context: Pick<TransitionContext, 'role'>,
): void {
  const result = canTransitionResearchStatus(from, to, context);
  if (!result.allowed) {
    throw new Error(`${result.reason ?? 'TRANSITION_NOT_ALLOWED'}: ${from} -> ${to}`);
  }
}
