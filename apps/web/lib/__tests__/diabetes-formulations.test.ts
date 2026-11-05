import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue } from '@prep-meds/clinical-engine';
import { diabetesFormulationAtoms, diabetesFormulationSources, diabetesWorkflowEvidence } from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesCoreMedications } from '../diabetes-core-terminology';
import { diabetesFormulationAudit, diabetesFormulationIdentities, diabetesFormulationMedications } from '../diabetes-formulations';

const index = new TerminologyIndex(terminologyDataset);
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
function replace(input: ModifierValue[], modifier: ModifierValue): ModifierValue[] {
  return [...input.filter((item) => item.modifierId !== modifier.modifierId), modifier];
}
function evaluate(medicationId: string, modifiers: ModifierValue[]) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing fixture ${medicationId}`);
  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-FORMULATION-${medicationId}`,
    occurredAt: '2026-09-18T01:45:00Z',
    engineVersion: 'formulation-regression', mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-FORMULATION', procedureCode: 'COLONOSCOPY',
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers,
    },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('formulation-specific recognition', () => {
  it.each([
    ['Lantus', 'MED-insulin-glargine-u100'], ['Toujeo', 'MED-insulin-glargine-u300'],
    ['Tresiba U-100', 'MED-insulin-degludec-u100'], ['Tresiba U-200', 'MED-insulin-degludec-u200'],
    ['Humalog U-100', 'MED-insulin-lispro-humalog-u100'], ['Humalog U-200', 'MED-insulin-lispro-humalog-u200'],
    ['Cycloset', 'MED-bromocriptine-qr'], ['Parlodel', 'MED-bromocriptine-parlodel'],
  ])('recognizes the explicit %s product without an insulin dose calculation', (query, id) => {
    expect(index.resolve(query).medication?.id).toBe(id);
    expect(diabetesFormulationIdentities[id]?.allowsDoseCalculation).toBe(false);
  });
  it.each(['Tresiba', 'Humalog', 'bromocriptine'])('does not choose a formulation from ambiguous %s alone', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each(['MED-insulin-glargine', 'MED-insulin-degludec', 'MED-insulin-lispro', 'MED-bromocriptine-unspecified'])(
    'retains uncertainty for the ingredient-level %s record', (id) => {
      expect(diabetesFormulationIdentities[id]?.state).toBe('UNSPECIFIED');
      expect(diabetesFormulationIdentities[id]?.concentration).toBeUndefined();
    },
  );
  it('links every source-verified identity to exact draft evidence with matching medication applicability', () => {
    const identities = Object.values(diabetesFormulationIdentities).filter((item) => item.state === 'SOURCE_LINKED_IDENTITY');
    expect(identities).toHaveLength(11);
    expect(diabetesFormulationAtoms).toHaveLength(8);
    expect(diabetesFormulationSources).toHaveLength(8);
    expect(validateEvidenceBundle(diabetesWorkflowEvidence)).toEqual([]);
    for (const identity of identities) {
      expect(identity.evidenceRefs.length).toBeGreaterThan(0);
      for (const ref of identity.evidenceRefs) {
        const atom = diabetesFormulationAtoms.find((item) => item.id === ref.id && item.version === ref.version);
        expect(atom?.applicability.medicationIds).toContain(identity.medicationId);
        expect(atom?.lifecycle).toBe('DRAFT');
        expect(atom?.evidenceStrength).toBe('NOT_GRADED');
        const source = diabetesFormulationSources.find((item) => item.id === atom?.source.id && item.version === atom?.source.version);
        expect(source?.metadata?.setId).toBeTruthy();
        expect(source?.metadata?.splVersion).toBeGreaterThan(0);
        expect(source?.lifecycle).toBe('DRAFT');
      }
    }
  });
  it.each([
    ['MED-insulin-lispro-75-25', [75, 25]],
    ['MED-insulin-lispro-50-50', [50, 50]],
    ['MED-insulin-aspart-70-30', [70, 30]],
  ] as const)('preserves fixed component proportions for %s as identity metadata only', (id, proportions) => {
    const identity = diabetesFormulationIdentities[id];
    expect(identity?.components?.map((part) => part.proportionPercent)).toEqual(proportions);
    expect(identity?.components?.[0]?.name).toContain('protamine');
    expect(identity?.concentration).toEqual({ value: 100, unit: 'units/mL' });
    expect(identity?.allowsDoseCalculation).toBe(false);
    expect(index.getMedicationById(id)?.ingredientIds.some((ingredient) => ingredient === 'ING-protamine')).toBe(false);
  });
  it('does not rewrite historical catalog records or claim current availability', () => {
    const original = diabetesCoreMedications.find((item) => item.id === 'MED-insulin-glargine');
    expect(original?.brandNames).toContain('Toujeo');
    expect(original?.brandNames).toContain('Lantus');
    expect(diabetesFormulationMedications.find((item) => item.id === 'MED-insulin-glargine')?.brandNames).not.toContain('Toujeo');
    expect(diabetesCoreMedications.find((item) => item.id === 'MED-insulin-detemir')?.active).toBe(false);
    expect(diabetesFormulationMedications.find((item) => item.id === 'MED-insulin-detemir')?.active).toBeUndefined();
    expect(diabetesFormulationAudit.marketAvailabilityAsserted).toBe(false);
    expect(diabetesFormulationMedications.every((item) => (item.externalCodes ?? []).length === 0)).toBe(true);
  });
});

describe('bromocriptine indication and product boundaries', () => {
  it.each(['MED-bromocriptine-unspecified', 'MED-bromocriptine-parlodel'])(
    'never applies an oral-diabetes hold to %s even when diabetes is supplied', (id) => {
      for (const phase of ['PREP_DAY', 'PROCEDURE_DAY', 'RECOVERY']) {
        const input = replace(oralPlan, known('MOD-diabetes-care-phase', phase));
        const result = evaluate(id, [...input, known('MOD-bromocriptine-formulation', 'CYCLOSET_QR')]);
        expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(result.outputSnapshot.timingRule).toBeUndefined();
      }
    },
  );
  it('requires actual Cycloset-formulation confirmation, not just the search selection', () => {
    const result = evaluate('MED-bromocriptine-qr', oralPlan);
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.missingModifierIds).toContain('MOD-bromocriptine-formulation');
  });
  it.each(['PARLODEL', 'OTHER'])('blocks the Cycloset pathway for a %s product response', (value) => {
    const result = evaluate('MED-bromocriptine-qr', [...oralPlan, known('MOD-bromocriptine-formulation', value)]);
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.reasonCodes).toContain('BROMOCRIPTINE_DIABETES_FORMULATION_NOT_CONFIRMED');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
  it('retains the bounded shadow-only oral candidate after both product and indication confirmation', () => {
    const plan = [...oralPlan, known('MOD-bromocriptine-formulation', 'CYCLOSET_QR')];
    expect(evaluate('MED-bromocriptine-qr', plan).disposition).toBe('HOLD_STANDARD');
    const result = evaluate('MED-bromocriptine-qr', replace(plan, known('MOD-diabetes-medication-indication', 'OTHER')));
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
});

describe('formulation recognition never authorizes insulin dosing', () => {
  it.each([
    'MED-insulin-glargine-u100', 'MED-insulin-glargine-u300',
    'MED-insulin-degludec-u100', 'MED-insulin-degludec-u200',
    'MED-insulin-lispro-humalog-u100', 'MED-insulin-lispro-humalog-u200',
  ])('preserves type-1 basal-coverage review for %s', (id) => {
    const result = evaluate(id, replace(insulinPlan, known('MOD-diabetes-type', 'TYPE_1')));
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
  it('does not issue a pump rate or compatible-device claim for Humalog U-200', () => {
    const result = evaluate('MED-insulin-lispro-humalog-u200', replace(insulinPlan, known('MOD-pump-aid-system-type', 'AID')));
    expect(result.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
  it.each(['UNKNOWN', 'CONFLICTING'] as const)('fails closed when formulation confirmation is %s', (state) => {
    const result = evaluate('MED-insulin-glargine-u300', replace(insulinPlan, { modifierId: 'MOD-insulin-formulation-confirmed', state }));
    expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.outputSnapshot.timingRule).toBeUndefined();
  });
});
