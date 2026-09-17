import type { EvidenceAtom, EvidenceLifecycle, SourceDocument } from './types.js';

const ALLOWED_TRANSITIONS: Record<EvidenceLifecycle, ReadonlySet<EvidenceLifecycle>> = {
  DRAFT: new Set(['REVIEWED', 'RETIRED']),
  REVIEWED: new Set(['CURRENT', 'RETIRED']),
  CURRENT: new Set(['SUPERSEDED', 'RETIRED']),
  SUPERSEDED: new Set(['RETIRED']),
  RETIRED: new Set(),
};

export interface EvidenceGovernanceActor {
  actorId: string;
  role: 'AUTOMATION' | 'EVIDENCE_REVIEWER' | 'CLINICAL_GOVERNANCE';
}

export function canTransitionEvidence(
  from: EvidenceLifecycle,
  to: EvidenceLifecycle,
  actor: EvidenceGovernanceActor,
): boolean {
  if (!ALLOWED_TRANSITIONS[from].has(to)) return false;

  if (actor.role === 'AUTOMATION' && (to === 'REVIEWED' || to === 'CURRENT')) return false;
  if (to === 'CURRENT' && actor.role !== 'CLINICAL_GOVERNANCE') return false;

  return true;
}

export function transitionAtom(
  atom: EvidenceAtom,
  to: EvidenceLifecycle,
  actor: EvidenceGovernanceActor,
  timestamp: string,
): EvidenceAtom {
  if (!canTransitionEvidence(atom.lifecycle, to, actor)) {
    throw new Error(`Transition ${atom.lifecycle} -> ${to} is not permitted for role ${actor.role}.`);
  }

  const clone = structuredClone(atom);
  if (to === 'REVIEWED' || to === 'CURRENT') {
    return {
      ...clone,
      lifecycle: to,
      reviewedAt: timestamp,
      reviewedBy: actor.actorId,
    };
  }

  return {
    ...clone,
    lifecycle: to,
  };
}

export function transitionSource(
  source: SourceDocument,
  to: EvidenceLifecycle,
  actor: EvidenceGovernanceActor,
): SourceDocument {
  if (!canTransitionEvidence(source.lifecycle, to, actor)) {
    throw new Error(`Transition ${source.lifecycle} -> ${to} is not permitted for role ${actor.role}.`);
  }

  return {
    ...structuredClone(source),
    lifecycle: to,
  };
}
