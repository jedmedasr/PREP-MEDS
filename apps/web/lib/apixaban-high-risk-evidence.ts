/**
 * Evidence reconciliation ledger, not clinical signoff.
 * Recommendations are retained separately; no automatic selection or patient output.
 */
export const apixabanHighRiskEvidence = {
  ingredientId: 'ING-apixaban',
  scope: 'elective high-bleeding-risk gastrointestinal endoscopy',
  reviewStatus: 'IN_PROGRESS',
  clinicalApproval: false,
  sources: [
    {
      id: 'ASGE_2016',
      publishedYear: 2016,
      url: 'https://doi.org/10.1016/j.gie.2015.09.035',
      location: 'Table 4: apixaban interruption before high-risk endoscopic procedures',
      timing: 'CrCl >60: 1–2 days; CrCl 30–59: 3 days; CrCl 15–29: 4 days',
      timingKind: 'RENAL_STRATIFIED_SOURCE_TABLE',
      evidenceStrength: 'See original ASGE document; do not infer GRADE strength from this extraction',
    },
    {
      id: 'ACG_CAG_2022',
      publishedYear: 2022,
      url: 'https://doi.org/10.14309/ajg.0000000000001627',
      location: 'Elective endoscopy DOAC interruption and resumption recommendations',
      timing: 'Suggest temporary interruption; no universally mandated apixaban/CrCl-specific hold-day interval. No recommendation for same-day vs 1–7-day resumption.',
      timingKind: 'NO_EXACT_AGENT_SPECIFIC_INTERVAL',
      evidenceStrength: 'Conditional interruption recommendation, very low certainty',
    },
    {
      id: 'BSG_ESGE_2021',
      publishedYear: 2021,
      url: 'https://doi.org/10.1136/gutjnl-2021-325154',
      location: 'High-risk endoscopic procedures, direct oral anticoagulants',
      timing: 'Last DOAC dose 3 days before high-risk procedure; special renal guidance applies to dabigatran, not automatically to apixaban.',
      timingKind: 'SOURCE_SPECIFIC_LAST_DOSE_DAY',
      evidenceStrength: 'Consult source for recommendation grade',
    },
  ],
  conflicts: [
    'ASGE 2016 provides renal-stratified apixaban high-risk interruption days; BSG/ESGE 2021 generally uses last dose 3 days before high-risk endoscopy.',
    'ACG–CAG 2022 supports temporary DOAC interruption but does not supply a universally applicable agent-specific day-count.',
  ],
  outstanding: [
    'Verify original source tables and boundary definitions independently before clinical review',
    'Review formulation, indication, thrombotic risk, DAPT, hepatic function, bridging and concurrent antithrombotics',
    'Verify restart timing and procedure-specific hemostasis requirements',
    'Validate exact last-dose clock-time interpretation and procedure rescheduling',
    'Compare CHEST/ACC/AHA and current FDA labeling',
    'Map all apixaban canonical IDs and clinically distinct formulations before signoff',
  ],
} as const;
