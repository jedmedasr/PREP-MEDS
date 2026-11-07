import { terminologyDataset } from './content';

export const ASGE_2016_REFERENCE = {
  title: 'Management of antithrombotic agents for patients undergoing GI endoscopy',
  year: 2016,
  doi: '10.1016/j.gie.2015.09.035',
  url: 'https://doi.org/10.1016/j.gie.2015.09.035',
} as const;

export type AuditStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_CORRECTION' | 'TESTED' | 'CLINICALLY_REVIEWED';

/** A comparator placeholder is not a completed ASGE 2016 comparison. */
export function buildAntithromboticAuditQueue() {
  const classHints = /antithrombotic|anticoagulant|antiplatelet|factor-xa|thrombin|heparin|lmwh|p2y12|aspirin/i;
  const ingredientHints = /apixaban|rivaroxaban|edoxaban|dabigatran|warfarin|heparin|enoxaparin|dalteparin|fondaparinux|aspirin|clopidogrel|prasugrel|ticagrelor|ticlopidine|dipyridamole|cilostazol/i;
  const medications = terminologyDataset.medications
    .filter(m => m.drugClassIds.some(id => classHints.test(id)) || m.ingredientIds.some(id => ingredientHints.test(id)))
    .map(m => ({
      medicationId: m.id,
      canonicalName: m.canonicalName,
      ingredientIds: [...m.ingredientIds].sort(),
      provisionalGroupKey: [...m.ingredientIds].sort().join('+'),
      auditStatus: 'NOT_STARTED' as AuditStatus,
      formulationAdjudication: 'PENDING' as const,
      asge2016: { source: ASGE_2016_REFERENCE, comparisonStatus: 'NOT_STARTED' as const },
      clinicalApproval: false as const,
      lastReviewedDate: null as string | null,
      reviewCommit: null as string | null,
      testEvidence: [] as string[],
      unresolvedIssues: ['ASGE 2016 agent-specific comparison pending', 'Newer guidelines and FDA labeling pending', 'Formulation/route adjudication pending'],
      sourceVersions: [ASGE_2016_REFERENCE],
    }))
    .sort((a,b) => a.medicationId.localeCompare(b.medicationId));
  const groups = [...new Set(medications.map(m => m.provisionalGroupKey))].sort();
  return {
    warning: 'Queue discovery only. All ASGE comparators are NOT_STARTED; no medication is clinically reviewed or approved.',
    counts: { canonicalMedicationIds: medications.length, provisionalIngredientGroups: groups.length, completedAsgeComparisons: 0, clinicallyReviewedGroups: 0 },
    medications,
    groups,
    canonicalIdToProvisionalGroup: Object.fromEntries(medications.map(m => [m.medicationId, m.provisionalGroupKey])),
  };
}

/** Explicit comparator outcomes. A source link alone is never sufficient. */
export type AsgeComparator =
  | { status: 'NOT_STARTED' }
  | { status: 'IN_PROGRESS'; sourceSection: string; issues: string[] }
  | { status: 'COMPARED'; sourceSection: string; sourceVersion: 'ASGE_2016'; comparisonEvidence: string[]; reviewerId: string }
  | { status: 'NOT_ADDRESSED'; sourceSection: string; sourceVersion: 'ASGE_2016'; rationale: string; reviewerId: string };

export type GroupApprovalCandidate = {
  groupKey: string;
  canonicalMedicationIds: readonly string[];
  formulationAdjudicated: boolean;
  guidelineComparator: AsgeComparator;
  newerGuidelineEvidence: readonly string[];
  testEvidence: readonly string[];
  independentClinicalApproval: boolean;
};

/** Safety gate: never promote a provisional group or an incomplete ASGE comparator. */
export function canApproveAntithromboticGroup(candidate: GroupApprovalCandidate): boolean {
  const comparator = candidate.guidelineComparator;
  if (!candidate.groupKey || !candidate.canonicalMedicationIds.length ||
      new Set(candidate.canonicalMedicationIds).size !== candidate.canonicalMedicationIds.length ||
      !candidate.formulationAdjudicated || !candidate.independentClinicalApproval ||
      !candidate.newerGuidelineEvidence.length || !candidate.testEvidence.length) return false;
  if (comparator.status === 'COMPARED') {
    return Boolean(comparator.sourceSection.trim() && comparator.reviewerId.trim() && comparator.comparisonEvidence.length &&
      comparator.comparisonEvidence.every(item => item.trim().length > 0));
  }
  if (comparator.status === 'NOT_ADDRESSED') {
    return Boolean(comparator.sourceSection.trim() && comparator.reviewerId.trim() && comparator.rationale.trim());
  }
  return false;
}
