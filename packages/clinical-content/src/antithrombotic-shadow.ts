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
 * Shadow-validation rules intentionally remove unresolved policy dependencies from execution.
 * The candidate remains non-actionable and clinician-review only; this lets reviewers see the
 * patient-specific safety stop before governance chooses an operational timing policy.
 */
export const antithromboticShadowRules: ClinicalRule[] = antithromboticCandidateRules.map((rule) => {
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

  return {
    ...reviewRule,
    requiredModifierIds,
    evidenceRefs: auditedEvidenceRefs(rule),
    hardStops: [...(rule.hardStops ?? []), ...extraStops],
    disposition: rule.disposition,
    restartOwner: forceClinicianRestart && rule.disposition !== 'CONTINUE'
      ? 'CLINICIAN_REVIEW'
      : rule.restartOwner,
    status: 'CLINICAL_REVIEW',
  };
});
