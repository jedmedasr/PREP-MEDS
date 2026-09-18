import type { ClinicalRule, HardStop } from '@prep-meds/clinical-engine';
import { diabetesCoreShadowRules } from './diabetes-core-shadow.js';
import { diabetesAuditedEvidenceRef } from './diabetes-evidence-audit.js';

const insulinClasses = new Set([
  'CLS-basal-insulin', 'CLS-prandial-insulin', 'CLS-premixed-insulin', 'CLS-concentrated-insulin',
]);

function reviewUnless(reasonCode: string, modifierId: string, expected: string | boolean): HardStop {
  return {
    reasonCode,
    condition: { op: 'NOT_EQUALS', field: `modifier:${modifierId}`, value: expected },
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
  };
}

/**
 * Version 3 uses an explicit, audited draft evidence set. A product label is not
 * direct support for other members of a class or a different release formulation.
 * These are shadow candidates, not approved patient medication instructions.
 */
export const diabetesWorkflowRules: ClinicalRule[] = diabetesCoreShadowRules
  .filter((rule) => rule.id !== 'RULE-B2-INSULIN-PUMP-AID-POLICY')
  .map((rule): ClinicalRule => {
    const requiredModifierIds = new Set(rule.requiredModifierIds);
    const hardStops = [...(rule.hardStops ?? [])];
    const classes = new Set(rule.scope.drugClassIds ?? []);
    const evidenceRefs = rule.evidenceRefs.filter((ref) => {
      if (classes.has('CLS-metformin') && ref.id === 'EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS') return false;
      if (classes.has('CLS-meglitinide') && ref.id === 'EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED') return false;
      return true;
    });
    const isInsulin = [...classes].some((id) => insulinClasses.has(id));

    if (rule.disposition === 'HOLD_STANDARD') {
      requiredModifierIds.add('MOD-diabetes-care-phase');
      requiredModifierIds.add('MOD-diabetes-medication-plan-confirmed');
      hardStops.push(
        reviewUnless('PROCEDURE_DAY_ONLY_RULE_REQUIRES_SEPARATE_PHASE_PLAN', 'MOD-diabetes-care-phase', 'PROCEDURE_DAY'),
        reviewUnless('DIABETES_MEDICATION_PLAN_REQUIRES_CLINICIAN_CONFIRMATION', 'MOD-diabetes-medication-plan-confirmed', true),
      );
    }

    if (isInsulin) {
      requiredModifierIds.add('MOD-insulin-formulation-confirmed');
      requiredModifierIds.add('MOD-pump-aid-system-type');
      hardStops.push(
        reviewUnless('INSULIN_PLAN_NOT_CONFIRMED', 'MOD-current-insulin-plan-confirmed', true),
        reviewUnless('INSULIN_FORMULATION_NOT_CONFIRMED', 'MOD-insulin-formulation-confirmed', true),
        reviewUnless('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW', 'MOD-pump-aid-system-type', 'NOT_USING_PUMP'),
      );
      for (const id of ['EVD-B2-ADA-T1D-BASAL-MUST-CONTINUE', 'EVD-B2-ADA-PUMP-INSTITUTIONAL-POLICY']) {
        if (!evidenceRefs.some((ref) => ref.id === id && ref.version === 1)) evidenceRefs.push({ id, version: 1 });
      }
    }

    return {
      ...rule,
      id: `${rule.id}-WORKFLOW`,
      version: 3,
      name: `${rule.name} (guarded shadow workflow)`,
      requiredModifierIds: [...requiredModifierIds],
      hardStops,
      evidenceRefs: evidenceRefs.map(diabetesAuditedEvidenceRef),
      status: 'CLINICAL_REVIEW',
    };
  });

export const diabetesWorkflowMetadata = {
  releaseId: 'PREP-MEDS-BATCH-02-GUARDED-WORKFLOW',
  version: 3,
  status: 'CLINICAL_REVIEW_REQUIRED',
  intendedUse: 'SHADOW_VALIDATION_ONLY',
  limitations: [
    'Oral-agent action is limited to a confirmed procedure-day plan; preparation and recovery remain review-only.',
    'The descriptive sulfonylurea-class safety warning is not a shared product dosing or interruption schedule.',
    'Generic metformin and meglitinide rules do not inherit product-specific ER or repaglinide labeling.',
    'Insulin identity does not authorize dosing; formulation and individualized-plan review remain mandatory.',
    'Pump compatibility, rates, backup therapy and local policy require review.',
    'Clinical approval, complete contraindication/interaction checking and full prep/restart protocols are not provided.',
  ],
} as const;
