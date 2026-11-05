import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex } from '@prep-meds/terminology';
import { clinicalReviewRules, modifierDefinitions, terminologyDataset } from '../content';
import { normalizeModifierValues } from '../workflow';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });

const oralPlan: ModifierValue[] = [
  known('MOD-diabetes-medication-indication', 'DIABETES'),
  known('MOD-diabetes-care-phase', 'PROCEDURE_DAY'),
  known('MOD-diabetes-medication-plan-confirmed', true),
];

const insulinPlan: ModifierValue[] = [
  known('MOD-diabetes-type', 'TYPE_2'),
  known('MOD-current-insulin-plan-confirmed', true),
  known('MOD-insulin-formulation-confirmed', true),
  known('MOD-pump-aid-system-type', 'NOT_USING_PUMP'),
  known('MOD-current-oral-intake-state', 'FASTING'),
];

function evaluate(
  medicationId: string,
  modifiers: ModifierValue[],
  procedureCode: ProcedureCode,
) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing synthetic fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-REGIMEN-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-26T21:31:00Z',
    engineVersion: 'batch-02-regimen-safety-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-REGIMEN',
      procedureCode,
      medication: {
        medicationId,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers,
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

function normalize(modifiers: ModifierValue[]) {
  return normalizeModifierValues(modifiers, modifierDefinitions);
}

describe('whole-regimen decision isolation', () => {
  it.each(procedures)('keeps oral, basal and prandial decisions independent for %s', (procedureCode) => {
    const oralIds = ['MED-metformin', 'MED-glipizide'];
    const insulinIds = ['MED-insulin-glargine', 'MED-insulin-aspart', 'MED-insulin-lispro'];

    for (const medicationId of oralIds) {
      const result = evaluate(medicationId, normalize(oralPlan), procedureCode);
      expect(result.disposition).toBe('HOLD_STANDARD');
      expect(result.outputSnapshot.timingRule?.procedureDay).toEqual({ takeMedication: false });
    }

    for (const medicationId of insulinIds) {
      const result = evaluate(medicationId, normalize(insulinPlan), procedureCode);
      expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(result.outputSnapshot.timingRule).toBeUndefined();
    }
  });

  it.each(procedures)('does not let oral-plan confirmation satisfy insulin requirements for %s', (procedureCode) => {
    const result = evaluate('MED-insulin-glargine', normalize(oralPlan), procedureCode);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-current-insulin-plan-confirmed');
  });

  it.each(procedures)('does not let insulin-plan confirmation satisfy oral-agent requirements for %s', (procedureCode) => {
    const result = evaluate('MED-metformin', normalize(insulinPlan), procedureCode);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-diabetes-medication-plan-confirmed');
    expect(result.missingModifierIds).toContain('MOD-diabetes-care-phase');
  });
});

describe('malformed workflow input fails closed end to end', () => {
  it.each(procedures)('rejects an unsupported care-phase value for %s', (procedureCode) => {
    const malformed = oralPlan.map((modifier) =>
      modifier.modifierId === 'MOD-diabetes-care-phase'
        ? known(modifier.modifierId, 'NOT_A_REAL_PHASE')
        : modifier,
    );
    const normalized = normalize(malformed);
    expect(normalized.find((item) => item.modifierId === 'MOD-diabetes-care-phase')?.state).toBe('UNKNOWN');

    const result = evaluate('MED-metformin', normalized, procedureCode);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-diabetes-care-phase');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });

  it.each(procedures)('rejects an unsupported pump/device value for %s', (procedureCode) => {
    const malformed = insulinPlan.map((modifier) =>
      modifier.modifierId === 'MOD-pump-aid-system-type'
        ? known(modifier.modifierId, 'UNSUPPORTED_DEVICE')
        : modifier,
    );
    const normalized = normalize(malformed);
    expect(normalized.find((item) => item.modifierId === 'MOD-pump-aid-system-type')?.state).toBe('UNKNOWN');

    const result = evaluate('MED-insulin-aspart', normalized, procedureCode);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-pump-aid-system-type');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });

  it.each(procedures)('rejects malformed clinician-confirmation values for %s', (procedureCode) => {
    const malformed = oralPlan.map((modifier) =>
      modifier.modifierId === 'MOD-diabetes-medication-plan-confirmed'
        ? known(modifier.modifierId, 'yes')
        : modifier,
    );
    const normalized = normalize(malformed);
    expect(normalized.find((item) => item.modifierId === 'MOD-diabetes-medication-plan-confirmed')?.state).toBe('UNKNOWN');

    const result = evaluate('MED-glipizide', normalized, procedureCode);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-diabetes-medication-plan-confirmed');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
});
