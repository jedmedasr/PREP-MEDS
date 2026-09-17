import type { ClinicalRule, HardStop } from '@prep-meds/clinical-engine';
import { antithromboticCandidateRules } from './antithrombotics.js';

const oralAnticoagulants = new Set([
  'MED-apixaban',
  'MED-rivaroxaban',
  'MED-edoxaban',
  'MED-dabigatran',
  'MED-warfarin',
]);

const p2y12Agents = new Set([
  'MED-clopidogrel',
  'MED-prasugrel',
  'MED-ticagrelor',
  'MED-ticlopidine',
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

/**
 * Shadow-validation rules intentionally remove unresolved policy dependencies from execution.
 * The candidate remains non-actionable and clinician-review only; this lets reviewers see the
 * patient-specific safety stop before governance chooses an operational timing policy.
 */
export const antithromboticShadowRules: ClinicalRule[] = antithromboticCandidateRules.map((rule) => {
  const extraStops: HardStop[] = [];

  if (containsMedication(rule, oralAnticoagulants)) {
    extraStops.push(hardStop('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-thrombotic-event'));
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  if ((rule.scope.medicationIds ?? []).includes('MED-warfarin')) {
    extraStops.push(hardStop('MECHANICAL_HEART_VALVE_REQUIRES_CLINICIAN_REVIEW', 'MOD-mechanical-heart-valve'));
  }

  if (containsMedication(rule, p2y12Agents)) {
    extraStops.push(hardStop('RECENT_STENT_OR_ACS_REQUIRES_CLINICIAN_REVIEW', 'MOD-recent-coronary-stent-or-acs'));
    extraStops.push(hardStop('CONCOMITANT_ANTITHROMBOTIC_REQUIRES_CLINICIAN_REVIEW', 'MOD-concomitant-antithrombotic'));
  }

  const { policyDependencyIds: _deferredPolicyDependencies, ...reviewRule } = rule;

  return {
    ...reviewRule,
    hardStops: [...(rule.hardStops ?? []), ...extraStops],
    disposition: rule.disposition,
    status: 'CLINICAL_REVIEW',
  };
});
