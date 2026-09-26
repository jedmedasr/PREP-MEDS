import { afterEach, describe, expect, it, vi } from 'vitest';
import { evaluateDecision, scopeMatches, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import { diabetesWorkflowRules } from '@prep-meds/clinical-content';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import {
  activePolicies, activeRules, clinicalReviewRules, clinicalReviewEvidenceBundles,
  decisionRules, modifierDefinitions, terminologyDataset,
} from '../content';
import { diabetesSearchMedications } from '../diabetes-workflow-content';
import { blockedShadowPatientInstruction, deriveRequiredQuestions } from '../workflow';

const index = new TerminologyIndex(terminologyDataset);
const recordedAt = '2026-09-17T12:00:00Z';
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });
function context(medicationId: string, procedureCode: ProcedureCode = 'COLONOSCOPY') {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing fixture: ${medicationId}`);
  return {
    organizationId: 'ORG-SYNTHETIC-INTEGRATION', procedureCode,
    medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
    modifiers: [] as ModifierValue[],
  };
}
function evaluate(medicationId: string, modifiers: ModifierValue[], procedureCode: ProcedureCode = 'COLONOSCOPY') {
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-DIABETES-INTEGRATION', occurredAt: recordedAt,
    engineVersion: 'test', mode: 'VALIDATION',
    context: { ...context(medicationId, procedureCode), modifiers }, rules: clinicalReviewRules, policies: [],
  }).event;
}
const oralPlan = [
  known('MOD-diabetes-medication-indication', 'DIABETES'),
  known('MOD-diabetes-care-phase', 'PROCEDURE_DAY'),
  known('MOD-diabetes-medication-plan-confirmed', true),
];
const insulinPlan = [
  known('MOD-diabetes-type', 'TYPE_2'), known('MOD-current-insulin-plan-confirmed', true),
  known('MOD-insulin-formulation-confirmed', true), known('MOD-pump-aid-system-type', 'NOT_USING_PUMP'),
  known('MOD-current-oral-intake-state', 'FASTING'),
];

afterEach(() => vi.unstubAllEnvs());

describe('diabetes catalog integration', () => {
  it('assembles a valid nonduplicated catalog and does not fabricate a pump ingredient', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(diabetesSearchMedications).toHaveLength(61);
    expect(terminologyDataset.medications.filter((med) => med.id === 'MED-insulin-glargine')).toHaveLength(1);
    expect(index.getMedicationById('MED-insulin-pump-aid')).toBeNull();
  });
  it.each([
    ['Glucophage', 'MED-metformin'], ['Januvia', 'MED-sitagliptin'], ['Symlin', 'MED-pramlintide'],
    ['Lantus', 'MED-insulin-glargine-u100'], ['Humulin R U-500', 'MED-insulin-regular-humulin-u500'],
    ['Humalog Mix 75/25', 'MED-insulin-lispro-75-25'], ['Afrezza 4 unit cartridge', 'MED-afrezza-4-unit-cartridge'],
    ['Apidra SoloStar U-100', 'MED-insulin-glulisine-apidra-u100'], ['Levemir FlexPen U-100', 'MED-insulin-detemir-levemir-u100'], ['NovoLog FlexPen U-100', 'MED-insulin-aspart-novolog-u100'],
    ['Humalog U-100', 'MED-insulin-lispro-humalog-u100'], ['Humalog U-200', 'MED-insulin-lispro-humalog-u200'],
  ])('finds %s without guessing a dosing plan', (query, medicationId) => {
    expect(index.search(query)[0]?.medicationId).toBe(medicationId);
  });
  it('exposes every required question for every indexed diabetes medication and procedure', () => {
    for (const med of diabetesSearchMedications) {
      for (const procedureCode of procedures) {
        const ctx = context(med.id, procedureCode);
        const applicable = diabetesWorkflowRules.filter((rule) => scopeMatches(rule.scope, ctx));
        expect(applicable.length).toBeGreaterThan(0);
        const ids = new Set(deriveRequiredQuestions({
          rules: clinicalReviewRules, medication: ctx.medication, procedureCode,
          definitions: modifierDefinitions, includeReviewCandidates: true,
        }).map((question) => question.id));
        for (const rule of applicable) for (const id of rule.requiredModifierIds) {
          expect(modifierDefinitions[id]).toBeDefined();
          expect(ids.has(id)).toBe(true);
        }
      }
    }
  });
  it('resolves every workflow evidence reference to its exact version', () => {
    const refs = new Set(clinicalReviewEvidenceBundles.flatMap((bundle) => bundle.atoms.map((atom) => `${atom.id}@${atom.version}`)));
    for (const rule of diabetesWorkflowRules) for (const ref of rule.evidenceRefs) {
      expect(refs.has(`${ref.id}@${ref.version}`)).toBe(true);
    }
  });
});

describe('phase and regimen guards', () => {
  it.each(procedures)('restricts oral-agent candidates to confirmed procedure-day context for %s', (procedureCode) => {
    const result = evaluate('MED-metformin', oralPlan, procedureCode);
    expect(result.disposition).toBe('HOLD_STANDARD');
    expect(result.outputSnapshot.timingRule?.procedureDay).toEqual({ takeMedication: false });
    expect(result.outputSnapshot.timingRule?.preProcedure).toBeUndefined();
    expect(result.outputSnapshot.timingRule?.restart).toBeUndefined();
    expect(result.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });
  it.each(['PREP_DAY', 'RECOVERY', 'OTHER'])('does not extend a procedure-day action to %s', (phase) => {
    const input = oralPlan.map((value) => value.modifierId === 'MOD-diabetes-care-phase' ? known(value.modifierId, phase) : value);
    const result = evaluate('MED-metformin', input);
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.reasonCodes).toContain('PROCEDURE_DAY_ONLY_RULE_REQUIRES_SEPARATE_PHASE_PLAN');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
  it('fails closed when a required phase is absent', () => {
    const result = evaluate('MED-glipizide', oralPlan.filter((value) => value.modifierId !== 'MOD-diabetes-care-phase'));
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-diabetes-care-phase');
  });
  it('does not treat an unconfirmed medication plan as approved', () => {
    const result = evaluate('MED-sitagliptin', oralPlan.map((value) =>
      value.modifierId === 'MOD-diabetes-medication-plan-confirmed' ? known(value.modifierId, false) : value,
    ));
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });
  it('uses the guarded glargine pathway rather than the old seed rule', () => {
    const result = evaluate('MED-insulin-glargine', insulinPlan);
    expect(result.ruleRefs.some((ref) => ref.id === 'RULE-B2-BASAL-INSULIN-REVIEW-WORKFLOW')).toBe(true);
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
  it.each(['MED-insulin-glargine', 'MED-insulin-nph', 'MED-insulin-lispro', 'MED-regular-insulin-u500', 'MED-insulin-human-70-30'])(
    'preserves the type-1 basal-insulin safeguard for %s without dose arithmetic', (medicationId) => {
      const result = evaluate(medicationId, insulinPlan.map((value) =>
        value.modifierId === 'MOD-diabetes-type' ? known(value.modifierId, 'TYPE_1') : value,
      ));
      expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(result.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
      expect(result.outputSnapshot.timingRule).toBeUndefined();
    },
  );
  it('captures pump use on the actual insulin and requires device/backup-plan review', () => {
    const result = evaluate('MED-insulin-aspart', insulinPlan.map((value) =>
      value.modifierId === 'MOD-pump-aid-system-type' ? known(value.modifierId, 'AID') : value,
    ));
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
  });
});

describe('production isolation', () => {
  it('never loads this unapproved release into production', () => {
    vi.stubEnv('PREP_MEDS_CONTENT_MODE', 'production');
    expect(activeRules).toEqual([]);
    expect(activePolicies).toEqual([]);
    expect(decisionRules()).toEqual([]);
    for (const rule of diabetesWorkflowRules) expect(rule.status).toBe('CLINICAL_REVIEW');
  });
  it('requires shadow mode and retains the patient-output block', () => {
    vi.stubEnv('PREP_MEDS_CONTENT_MODE', 'shadow');
    expect(decisionRules()).toContain(diabetesWorkflowRules[0]);
    expect(blockedShadowPatientInstruction().allowed).toBe(false);
  });
});
