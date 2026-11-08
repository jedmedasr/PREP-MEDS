/** Research-only source comparison; never consumed by patient instructions. */
export const anticoagulantSourceComparisons = [
  {
    ingredientId: 'ING-apixaban',
    status: 'IN_PROGRESS', clinicalApproval: false,
    asge2016: { doi: '10.1016/j.gie.2015.09.035', table: 'Table 7', highRiskCrClDays: [
      { minExclusive: 60, maxInclusive: null, days: [1, 2] },
      { minInclusive: 30, maxInclusive: 59, days: [3] },
      { minInclusive: 15, maxInclusive: 29, days: [4] },
    ], note: 'Table intervals are days; 1 or 2 is a range, not a unique last-dose timestamp.' },
    bsgEsge2021: { doi: '10.1136/gutjnl-2021-325184', highRiskLastDoseDaysBefore: 3, strength: 'strong', certainty: 'low', note: 'Stable renal function assumed; rapidly deteriorating renal function requires specialist assessment.' },
    acgCag2022: { doi: '10.14309/ajg.0000000000001627', action: 'TEMPORARILY_INTERRUPT', strength: 'conditional', certainty: 'very low', exactHighRiskLastDoseDays: null },
    unresolved: ['ASGE 2016 and BSG/ESGE 2021 high-risk timing differ for preserved renal function', 'FDA April 2025 label, CHEST 2022 and AHA/ACC 2024 are reconciled in docs/antithrombotic-source-reconciliation.md; current 2026 FDA revision and structured per-scenario extraction pending', 'Formulation/indication, bleeding and thrombotic risks, restart and governance pending'],
  },
  {
    ingredientId: 'ING-rivaroxaban',
    status: 'IN_PROGRESS', clinicalApproval: false,
    asge2016: { doi: '10.1016/j.gie.2015.09.035', table: 'Table 8', highRiskCrClDays: [
      { minExclusive: 90, maxInclusive: null, days: [1], minimumDays: true },
      { minInclusive: 60, maxInclusive: 90, days: [2] },
      { minInclusive: 30, maxInclusive: 59, days: [3] },
      { minInclusive: 15, maxInclusive: 29, days: [4] },
    ], note: 'ASGE >90 stratum is >=1 day, not exactly 1 day.' },
    bsgEsge2021: { doi: '10.1136/gutjnl-2021-325184', highRiskLastDoseDaysBefore: 3, strength: 'strong', certainty: 'low' },
    acgCag2022: { doi: '10.14309/ajg.0000000000001627', action: 'TEMPORARILY_INTERRUPT', strength: 'conditional', certainty: 'very low', exactHighRiskLastDoseDays: null },
    unresolved: ['ASGE 2016 and BSG/ESGE 2021 differ by renal stratum', 'FDA labeling and CHEST/AHA/ACC source comparisons documented in clinical ledger; current label revision and structured per-scenario extraction pending', 'Regimen, thrombotic risk, restart and clinical approval pending'],
  },
] as const;

/** Never turn an evidence comparison into a prescribing or timing recommendation. */
export function getResearchOnlyAnticoagulantComparison(ingredientId: string) {
  return anticoagulantSourceComparisons.find(entry => entry.ingredientId === ingredientId) ?? null;
}

/**
 * Research-only ASGE table lookup. No patient-facing date/time calculation.
 * A boundary gap, overlapping stratum, or incomplete evidence MUST remain unresolved.
 */
export function findAsge2016ResearchStratum(ingredientId: string, creatinineClearance: number) {
  if (!Number.isFinite(creatinineClearance) || creatinineClearance <= 0) return null;
  const comparison = getResearchOnlyAnticoagulantComparison(ingredientId);
  if (!comparison || comparison.clinicalApproval !== false) return null;
  const matching = comparison.asge2016.highRiskCrClDays.filter(stratum => {
    const lower = 'minInclusive' in stratum ? creatinineClearance >= stratum.minInclusive :
      'minExclusive' in stratum ? creatinineClearance > stratum.minExclusive : false;
    const upper = stratum.maxInclusive === null || creatinineClearance <= stratum.maxInclusive;
    return lower && upper;
  });
  // Do not infer what the guideline intended at a missing boundary (e.g. apixaban CrCl 60).
  return matching.length === 1 ? matching[0] : null;
}

/**
 * Historical ASGE 2016 high-risk endoscopy research lookup.
 * Intentionally returns null for diagnostic/biopsy-only cases, unknown intervention,
 * unadjudicated formulation, or any renal gap. Never produces a patient hold order.
 */
export function findAsge2016HighRiskEndoscopyEvidence(input: {
  ingredientId: string;
  creatinineClearance: number;
  procedure: 'EGD' | 'COLONOSCOPY' | 'COMBINED';
  interventionRisk: 'LOW' | 'HIGH' | 'UNKNOWN';
  formulation: 'ADULT_ORAL' | 'PEDIATRIC_ORAL' | 'UNKNOWN';
}) {
  if (input.interventionRisk !== 'HIGH' || input.formulation !== 'ADULT_ORAL') return null;
  return findAsge2016ResearchStratum(input.ingredientId, input.creatinineClearance);
}
