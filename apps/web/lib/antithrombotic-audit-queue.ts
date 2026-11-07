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
    }))
    .sort((a,b) => a.medicationId.localeCompare(b.medicationId));
  const groups = [...new Set(medications.map(m => m.provisionalGroupKey))].sort();
  return {
    warning: 'Queue discovery only. All ASGE comparators are NOT_STARTED; no medication is clinically reviewed or approved.',
    counts: { canonicalMedicationIds: medications.length, provisionalIngredientGroups: groups.length, completedAsgeComparisons: 0, clinicallyReviewedGroups: 0 },
    medications,
    groups,
  };
}
