import type { ClinicalRule } from '@prep-meds/clinical-engine';
import { diabetesCoreCandidateRules } from './diabetes-core.js';

/** Remove an unreviewed restart directive without synthesizing absent timing fields. */
export function toDiabetesShadowRule(rule: ClinicalRule): ClinicalRule {
  if (rule.disposition !== 'HOLD_STANDARD' || !rule.timingRule) return { ...rule };
  const { restart: _unreviewedRestart, ...timingRule } = rule.timingRule;
  return {
    ...rule,
    timingRule,
    restartOwner: 'CLINICIAN_REVIEW',
  };
}

// These are review candidates only; callers must still enforce shadow-mode isolation.
export const diabetesCoreShadowRules: ClinicalRule[] = diabetesCoreCandidateRules.map(toDiabetesShadowRule);
