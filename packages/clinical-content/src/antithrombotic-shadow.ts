import type { ClinicalRule, HardStop } from '@prep-meds/clinical-engine';
import { antithromboticCandidateRules } from './antithrombotics.js';

const oralAnticoagulants = new Set([
  'MED-apixaban',
  'MED-rivaroxaban',
  'MED-edoxaban',
  'MED-dabigatran',
  'MED-warfarin',
]);

const injectableAnticoagulants = new Set([
  'MED-enoxaparin',
  'MED-dalteparin',
  'MED-heparin',
  'MED-fondaparinux',
]);

const p2y12Agents = new Set([
  'MED-clopidogrel',
  'MED-prasugrel',
  'MED-ticagrelor',
  'MED-ticlopidine',
]);

const otherAntiplatelets = new Set([
  'MED-dipyridamole',
  'MED-cilostazol',
  'MED-aspirin-dipyridamole',
]);

function containsMedication(rule: ClinicalRule, medicationIds: Set<string>): boolean {
  return (rule.scope.medicationIds ?? []).some((id) => medicationIds.has(id));
}

function hardStop(reasonCode: string, modifierId: string): HardStop {
  return {
    reasonCode,
    condition: { op: 'EQUALS', field: `modifier:${modifierId}`, value: true },
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
  };
}

function hardStopEquals(reasonCode: string, modifierId: string, value: string): HardStop {
  return {
    reasonCode,
    condition: { op: 'EQUALS', field: `modifier:${modifierId}`, value },
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
  };
}

function dedupeEvidenceRefs(rule: ClinicalRule): ClinicalRule['evidenceRefs'] {
  const seen = new Set<string>();
  return rule.evidenceRefs.filter((ref) => {
    const key = `${ref.id}@${ref.version}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function auditedEvidenceRefs(rule: ClinicalRule): ClinicalRule['evidenceRefs'] {
  const medicationIds = new Set(rule.scope.medicationIds ?? []);

  // These review-only pathways had overly specific evidence links in the initial one-shot batch.
  // Use the general endoscopy risk framework rather than implying that DOAC-bridging or P2Y12
  // monotherapy evidence directly governs heparin, fondaparinux, or dipyridamole.
  if (medicationIds.has('MED-heparin') || medicationIds.has('MED-fondaparinux') || medicationIds.has('MED-dipyridamole')) {
    return [{ id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 }];
  }

  const refs = dedupeEvidenceRefs(rule);
  if (containsMedication(rule, oralAnticoagulants) || containsMedication(rule, p2y12Agents)) {
    const restartRef = { id: 'EVD-B1-ACG-RESTART-UNCERTAIN', version: 1 } as const;
    if (!refs.some((ref) => ref.id === restartRef.id && ref.version === restartRef.version)) {
      return [...refs, restartRef];
    }
  }
  return refs;
}

/**
 * Shadow-validation rules intentionally remain CLINICAL_REVIEW content.
 *
 * The high-impact DOAC pathways below are intentionally actionable in VALIDATION mode so the
 * product can test its core job: provide a concrete pre-procedure hold recommendation when the
 * required clinical context is known. They are not ACTIVE production rules, patient-facing output
 * remains blocked, and restart timing remains endoscopist-owned because GI-specific evidence does
 * not support one universal post-procedure interval.
 */

const actionableDoacMedicationIds = new Set([
  'MED-apixaban',
  'MED-rivaroxaban',
  'MED-edoxaban',
  'MED-dabigatran',
]);

const commonDoacRequiredModifiers = [
  'MOD-anticoagulation-indication',
  'MOD-recent-thrombotic-event',
  'MOD-concomitant-antithrombotic',
  'MOD-doac-prolonged-clearance-risk',
  'MOD-procedure-bleeding-risk',
];

function actionableDoacHardStops(): HardStop[] {
  return [
    hardStop('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-thrombotic-event'),
    hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'),
    hardStop('PROLONGED_DOAC_CLEARANCE_RISK_REQUIRES_CLINICIAN_REVIEW', 'MOD-doac-prolonged-clearance-risk'),
    hardStopEquals(
      'MECHANICAL_HEART_VALVE_REQUIRES_CLINICIAN_REVIEW',
      'MOD-anticoagulation-indication',
      'MECHANICAL_HEART_VALVE',
    ),
    hardStopEquals(
      'OTHER_OR_UNCLEAR_ANTICOAGULATION_INDICATION_REQUIRES_CLINICIAN_REVIEW',
      'MOD-anticoagulation-indication',
      'OTHER_UNCLEAR',
    ),
  ];
}

function sourceCandidateFor(medicationId: string): ClinicalRule {
  const source = antithromboticCandidateRules.find((rule) => rule.scope.medicationIds?.includes(medicationId));
  if (!source) throw new Error(`Missing antithrombotic source candidate for ${medicationId}`);
  return source;
}

function actionableEvidenceRefs(
  medicationId: string,
  timingEvidenceId: 'EVD-B1-CHEST-FXA-DOAC-BLEED-RISK-TIMING' | 'EVD-B1-CHEST-DABIGATRAN-BLEED-RISK-RENAL-TIMING',
): ClinicalRule['evidenceRefs'] {
  void medicationId;
  const refs = [
    { id: 'EVD-B1-ACG-DOAC-INTERRUPT', version: 1 },
    { id: 'EVD-B1-ACG-DOAC-1-2-DAY-WINDOW', version: 1 },
    { id: timingEvidenceId, version: 1 },
    { id: 'EVD-B1-ACG-RESTART-UNCERTAIN', version: 1 },
  ];
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.id}@${ref.version}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function holdTiming(days: number, instructionCode: string): NonNullable<ClinicalRule['timingRule']> {
  return {
    instructionCode,
    preProcedure: {
      medicationFreeIntervalDaysBeforeProcedure: days,
      intervalDefinition: 'FULL_DAYS_BEFORE_PROCEDURE_WITH_NO_DOAC_DOSES',
    },
    procedureDay: { takeMedication: false },
    restart: {
      criterionCode: 'RESTART_AFTER_PROCEDURE_HEMOSTASIS_AND_ENDOSCOPIST_REVIEW',
      autonomousTimingAuthorized: false,
    },
  };
}

function factorXaActionRule(args: {
  medicationId: 'MED-apixaban' | 'MED-rivaroxaban' | 'MED-edoxaban';
  displayName: string;
  bleedingRisk: 'LOW_MODERATE' | 'HIGH';
  holdDays: 1 | 2;
}): ClinicalRule {
  const riskLabel = args.bleedingRisk === 'LOW_MODERATE' ? 'low-to-moderate' : 'high';
  return {
    id: `RULE-SHADOW-${args.medicationId.replace('MED-', '').toUpperCase()}-${args.bleedingRisk}-HOLD`,
    version: 1,
    name: `${args.displayName} ${riskLabel}-bleeding-risk interruption candidate`,
    scope: { medicationIds: [args.medicationId], procedureCodes: ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] },
    requiredModifierIds: [...commonDoacRequiredModifiers],
    applicability: {
      op: 'EQUALS',
      field: 'modifier:MOD-procedure-bleeding-risk',
      value: args.bleedingRisk,
    },
    hardStops: actionableDoacHardStops(),
    disposition: 'HOLD_STANDARD',
    timingRule: holdTiming(
      args.holdDays,
      `${args.medicationId.replace('MED-', '').toUpperCase()}_WITHHOLD_${args.holdDays}_FULL_DAY${args.holdDays === 1 ? '' : 'S'}_BEFORE_PROCEDURE`,
    ),
    restartOwner: 'ENDOSCOPIST',
    evidenceRefs: actionableEvidenceRefs(args.medicationId, 'EVD-B1-CHEST-FXA-DOAC-BLEED-RISK-TIMING'),
    status: 'CLINICAL_REVIEW',
    priority: 20,
  };
}

function dabigatranActionRule(args: {
  bleedingRisk: 'LOW_MODERATE' | 'HIGH';
  crclBand: 'GE_50' | 'LT_50';
  holdDays: 1 | 2 | 4;
}): ClinicalRule {
  const riskLabel = args.bleedingRisk === 'LOW_MODERATE' ? 'low-to-moderate' : 'high';
  return {
    id: `RULE-SHADOW-DABIGATRAN-${args.bleedingRisk}-${args.crclBand}-HOLD`,
    version: 1,
    name: `Dabigatran ${riskLabel}-bleeding-risk renal-sensitive interruption candidate`,
    scope: { medicationIds: ['MED-dabigatran'], procedureCodes: ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] },
    requiredModifierIds: [...commonDoacRequiredModifiers, 'MOD-verified-crcl-band'],
    applicability: {
      op: 'ALL',
      conditions: [
        { op: 'EQUALS', field: 'modifier:MOD-procedure-bleeding-risk', value: args.bleedingRisk },
        { op: 'EQUALS', field: 'modifier:MOD-verified-crcl-band', value: args.crclBand },
      ],
    },
    hardStops: actionableDoacHardStops(),
    disposition: 'HOLD_STANDARD',
    timingRule: holdTiming(
      args.holdDays,
      `DABIGATRAN_WITHHOLD_${args.holdDays}_FULL_DAY${args.holdDays === 1 ? '' : 'S'}_BEFORE_PROCEDURE`,
    ),
    restartOwner: 'ENDOSCOPIST',
    evidenceRefs: actionableEvidenceRefs('MED-dabigatran', 'EVD-B1-CHEST-DABIGATRAN-BLEED-RISK-RENAL-TIMING'),
    status: 'CLINICAL_REVIEW',
    priority: 20,
  };
}

export const actionableDoacShadowRules: ClinicalRule[] = [
  factorXaActionRule({ medicationId: 'MED-apixaban', displayName: 'Apixaban', bleedingRisk: 'LOW_MODERATE', holdDays: 1 }),
  factorXaActionRule({ medicationId: 'MED-apixaban', displayName: 'Apixaban', bleedingRisk: 'HIGH', holdDays: 2 }),
  factorXaActionRule({ medicationId: 'MED-rivaroxaban', displayName: 'Rivaroxaban', bleedingRisk: 'LOW_MODERATE', holdDays: 1 }),
  factorXaActionRule({ medicationId: 'MED-rivaroxaban', displayName: 'Rivaroxaban', bleedingRisk: 'HIGH', holdDays: 2 }),
  factorXaActionRule({ medicationId: 'MED-edoxaban', displayName: 'Edoxaban', bleedingRisk: 'LOW_MODERATE', holdDays: 1 }),
  factorXaActionRule({ medicationId: 'MED-edoxaban', displayName: 'Edoxaban', bleedingRisk: 'HIGH', holdDays: 2 }),
  dabigatranActionRule({ bleedingRisk: 'LOW_MODERATE', crclBand: 'GE_50', holdDays: 1 }),
  dabigatranActionRule({ bleedingRisk: 'LOW_MODERATE', crclBand: 'LT_50', holdDays: 2 }),
  dabigatranActionRule({ bleedingRisk: 'HIGH', crclBand: 'GE_50', holdDays: 2 }),
  dabigatranActionRule({ bleedingRisk: 'HIGH', crclBand: 'LT_50', holdDays: 4 }),
];

const reviewOnlySourceRules = antithromboticCandidateRules.filter(
  (rule) => !(rule.scope.medicationIds ?? []).some((id) => actionableDoacMedicationIds.has(id)),
);

const transformedReviewOnlyRules: ClinicalRule[] = reviewOnlySourceRules.map((rule): ClinicalRule => {
  const extraStops: HardStop[] = [];
  const requiredModifierIds = [...rule.requiredModifierIds];

  if (containsMedication(rule, oralAnticoagulants)) {
    extraStops.push(hardStop('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-thrombotic-event'));
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  if (containsMedication(rule, injectableAnticoagulants)) {
    extraStops.push(hardStop('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-thrombotic-event'));
    if (!requiredModifierIds.includes('MOD-concomitant-antithrombotic')) {
      requiredModifierIds.push('MOD-concomitant-antithrombotic');
    }
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  if ((rule.scope.medicationIds ?? []).includes('MED-warfarin')) {
    extraStops.push(hardStop('MECHANICAL_HEART_VALVE_REQUIRES_CLINICIAN_REVIEW', 'MOD-mechanical-heart-valve'));
    extraStops.push(hardStopEquals(
      'MECHANICAL_HEART_VALVE_INDICATION_REQUIRES_CLINICIAN_REVIEW',
      'MOD-anticoagulation-indication',
      'MECHANICAL_HEART_VALVE',
    ));
  }

  if (containsMedication(rule, p2y12Agents)) {
    extraStops.push(hardStop('RECENT_STENT_OR_ACS_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-coronary-stent-or-acs'));
    extraStops.push(hardStop('DAPT_REQUIRES_COMPONENT_AND_STENT_RISK_REVIEW', 'MOD-dual-antiplatelet-therapy'));
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  if (containsMedication(rule, otherAntiplatelets)) {
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  const { policyDependencyIds: _deferredPolicyDependencies, ...reviewRule } = rule;
  const forceClinicianRestart =
    containsMedication(rule, oralAnticoagulants)
    || containsMedication(rule, injectableAnticoagulants)
    || containsMedication(rule, p2y12Agents)
    || containsMedication(rule, otherAntiplatelets);

  const auditedRule: ClinicalRule = {
    ...reviewRule,
    requiredModifierIds,
    evidenceRefs: auditedEvidenceRefs(rule),
    hardStops: [...(rule.hardStops ?? []), ...extraStops],
    disposition: rule.disposition,
    status: 'CLINICAL_REVIEW',
  };

  if (forceClinicianRestart && rule.disposition !== 'CONTINUE') {
    auditedRule.restartOwner = 'CLINICIAN_REVIEW';
  }
  return auditedRule;
});

export const antithromboticShadowRules: ClinicalRule[] = [
  ...actionableDoacShadowRules,
  ...transformedReviewOnlyRules,
];
