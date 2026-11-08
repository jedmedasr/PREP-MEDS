import { buildAntithromboticAuditQueue } from './antithrombotic-audit-queue';
import { anticoagulantSourceComparisons } from './antithrombotic-primary-source-comparisons';

/** Research-only inventory join. Comparison progress is NOT a clinical approval. */
export function buildAntithromboticComparisonCoverage() {
  const inventory = buildAntithromboticAuditQueue();
  const byIngredient = new Map(anticoagulantSourceComparisons.map(entry => [entry.ingredientId, entry]));
  if (byIngredient.size !== anticoagulantSourceComparisons.length) throw new Error('DUPLICATE_RESEARCH_COMPARATOR');
  const medications = inventory.medications.map(medication => {
    const constituentComparisons = medication.ingredientIds.map(ingredientId => {
      const evidence = byIngredient.get(ingredientId);
      return { ingredientId, comparisonStatus: evidence ? 'IN_PROGRESS' as const : 'NOT_STARTED' as const,
        asge2016Doi: evidence?.asge2016.doi ?? null,
        sourceTable: evidence?.asge2016.table ?? null };
    });
    return { medicationId: medication.medicationId, provisionalGroupKey: medication.provisionalGroupKey,
      constituentComparisons, asgeCoverageComplete: false as const, clinicalApproval: false as const };
  });
  return { canonicalMedicationIds: inventory.counts.canonicalMedicationIds,
    provisionalGroups: inventory.counts.provisionalIngredientGroups,
    inProgressCanonicalIds: medications.filter(m => m.constituentComparisons.every(c => c.comparisonStatus === 'IN_PROGRESS')).length,
    completedAsgeCanonicalIds: 0 as const, clinicallyApprovedCanonicalIds: 0 as const, medications };
}
