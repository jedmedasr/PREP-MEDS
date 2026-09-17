import type { ClinicalRule } from '@prep-meds/clinical-engine';
import { diabetesCoreCandidateRules } from './diabetes-core.js';

/**
 * Shadow-mode rules deliberately remove any unreviewed restart directive.
 * Oral-agent candidates retain only the evidence-supported procedure-day action.
 * Insulin candidates remain review/policy pathways and contain no dose arithmetic.
 */
export const diabetesCoreShadowRules: ClinicalRule[] = diabetesCoreCandidateRules.map((rule) => {
  if (rule.disposition !== 'HOLD_STANDARD' || !rule.timingRule) return rule;

  return {
    ...rule,
    timingRule: {
      instructionCode: rule.timingRule.instructionCode,
      ...(rule.timingRule.preProcedure ? { preProcedure: rule.timingRule.preProcedure } : {}),
      ...(rule.timingRule.procedureDay ? { procedureDay: rule.timingRule.procedureDay } : {}),
    },
    restartOwner: 'CLINICIAN_REVIEW',
  };
});
