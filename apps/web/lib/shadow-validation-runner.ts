import {
  buildShadowAudit,
  type ShadowAuditOutput,
  type ShadowCandidatePathway,
  type SyntheticShadowCase,
} from '@prep-meds/clinical-content';
import {
  evaluateDecision,
  type DecisionTrace,
  type Disposition,
  type VersionedRef,
} from '@prep-meds/clinical-engine';
import { TerminologyIndex, type ResolutionStatus } from '@prep-meds/terminology';
import {
  activePolicies,
  clinicalReviewEvidenceBundles,
  clinicalReviewRules,
  terminologyDataset,
} from './content';

export interface ShadowResolutionAudit {
  input: string;
  status: ResolutionStatus;
  reason: string;
  resolvedMedicationId: string | null;
  candidateMedicationIds: readonly string[];
}

export interface ShadowEvidenceProvenanceAudit {
  evidenceRef: VersionedRef;
  atomFound: boolean;
  sourceRef: VersionedRef | null;
  sourceFound: boolean;
  sourceLifecycle: string | null;
}

export interface ShadowDecisionTraceAudit {
  input: string;
  medicationId: string;
  candidateDisposition: Disposition;
  trace: DecisionTrace | null;
  evidenceProvenance: readonly ShadowEvidenceProvenanceAudit[];
}

export interface SyntheticShadowExecution {
  caseId: string;
  resolutions: readonly ShadowResolutionAudit[];
  decisionTraces: readonly ShadowDecisionTraceAudit[];
  audit: ShadowAuditOutput;
}

const index = new TerminologyIndex(terminologyDataset);

const atomByKey = new Map(
  clinicalReviewEvidenceBundles.flatMap((bundle) =>
    bundle.atoms.map((atom) => [atom.id + '@' + atom.version, atom] as const),
  ),
);

const sourceByKey = new Map(
  clinicalReviewEvidenceBundles.flatMap((bundle) =>
    bundle.sources.map((source) => [source.id + '@' + source.version, source] as const),
  ),
);

function provenanceFor(refs: readonly VersionedRef[]): ShadowEvidenceProvenanceAudit[] {
  return refs.map((evidenceRef) => {
    const atom = atomByKey.get(evidenceRef.id + '@' + evidenceRef.version);
    const sourceRef = atom ? { id: atom.source.id, version: atom.source.version } : null;
    const source = sourceRef ? sourceByKey.get(sourceRef.id + '@' + sourceRef.version) : undefined;
    return {
      evidenceRef: { ...evidenceRef },
      atomFound: Boolean(atom),
      sourceRef,
      sourceFound: Boolean(source),
      sourceLifecycle: source ? String(source.lifecycle) : null,
    };
  });
}

function unresolvedCandidate(input: string, status: ResolutionStatus): ShadowCandidatePathway {
  return {
    medicationId: 'UNRESOLVED:' + input,
    candidateDisposition: 'INSUFFICIENT_INFORMATION',
    ruleRefs: [],
    evidenceRefs: [],
    missingModifierIds: [],
    reasonCodes: [status === 'AMBIGUOUS' ? 'TERMINOLOGY_AMBIGUOUS_FAIL_CLOSED' : 'TERMINOLOGY_NOT_FOUND_FAIL_CLOSED'],
  };
}

export function executeSyntheticShadowCase(caseDefinition: SyntheticShadowCase): SyntheticShadowExecution {
  const resolutions: ShadowResolutionAudit[] = [];
  const decisionTraces: ShadowDecisionTraceAudit[] = [];
  const candidatePathways: ShadowCandidatePathway[] = [];

  for (const [inputIndex, input] of caseDefinition.medicationInputs.entries()) {
    const resolution = index.resolve(input);
    resolutions.push({
      input,
      status: resolution.status,
      reason: resolution.reason,
      resolvedMedicationId: resolution.medication?.id ?? null,
      candidateMedicationIds: resolution.candidates.map((candidate) => candidate.medicationId),
    });

    const medication = resolution.medication;
    if (resolution.status !== 'RESOLVED' || !medication) {
      const candidate = unresolvedCandidate(input, resolution.status);
      candidatePathways.push(candidate);
      decisionTraces.push({
        input,
        medicationId: candidate.medicationId,
        candidateDisposition: candidate.candidateDisposition,
        trace: null,
        evidenceProvenance: [],
      });
      continue;
    }

    const execution = evaluateDecision({
      decisionEventId: caseDefinition.id + '-' + inputIndex,
      caseId: caseDefinition.id,
      occurredAt: '2026-10-07T11:30:00Z',
      actorRole: 'SYSTEM',
      engineVersion: 'shadow-validation-v1',
      mode: 'VALIDATION',
      context: {
        organizationId: 'ORG-SYNTHETIC-SHADOW-VALIDATION',
        procedureCode: caseDefinition.procedureCode,
        medication: {
          medicationId: medication.id,
          ingredientIds: medication.ingredientIds,
          drugClassIds: medication.drugClassIds ?? [],
        },
        modifiers: [],
      },
      rules: clinicalReviewRules,
      policies: activePolicies,
    });

    const candidate: ShadowCandidatePathway = {
      medicationId: medication.id,
      candidateDisposition: execution.event.disposition,
      ruleRefs: execution.event.ruleRefs,
      evidenceRefs: execution.event.evidenceRefs,
      missingModifierIds: execution.event.missingModifierIds,
      reasonCodes: execution.event.reasonCodes,
    };
    candidatePathways.push(candidate);
    decisionTraces.push({
      input,
      medicationId: medication.id,
      candidateDisposition: execution.event.disposition,
      trace: execution.trace,
      evidenceProvenance: provenanceFor(execution.event.evidenceRefs),
    });
  }

  return {
    caseId: caseDefinition.id,
    resolutions,
    decisionTraces,
    audit: buildShadowAudit(caseDefinition, candidatePathways),
  };
}

export function executeAllSyntheticShadowCases(
  cases: readonly SyntheticShadowCase[],
): readonly SyntheticShadowExecution[] {
  return cases.map(executeSyntheticShadowCase);
}
