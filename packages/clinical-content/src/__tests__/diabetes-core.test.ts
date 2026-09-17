import { describe, expect, it } from 'vitest';
import { evaluateDecision, type MedicationContext, type ModifierValue } from '@prep-meds/clinical-engine';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { diabetesCoreEvidence, diabetesCoreReleaseMetadata } from '../diabetes-core.js';
import { diabetesCoreShadowRules } from '../diabetes-core-shadow.js';

const recordedAt = '2026-09-17T03:00:00Z';

function known(modifierId: string, value: unknown): ModifierValue {
  return {
    modifierId,
    state: 'KNOWN',
    value,
    provenance: { sourceType: 'USER_ENTERED', recordedAt, confirmationStatus: 'CONFIRMED' },
  };
}

function medication(id: string, classId: string): MedicationContext {
  return { medicationId: id, ingredientIds: [], drugClassIds: [classId] };
}

function evaluate(med: MedicationContext, modifiers: ModifierValue[]) {
  return evaluateDecision({
    decisionEventId: `DEC-B2-${med.medicationId}`,
    occurredAt: recordedAt,
    actorRole: 'SYSTEM',
    engineVersion: 'med-batch-02-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SHADOW-TEST',
      procedureCode: 'COLONOSCOPY',
      medication: med,
      modifiers,
    },
    rules: diabetesCoreShadowRules,
    policies: [],
  });
}

describe('diabetes core evidence governance', () => {
  it('keeps evidence structurally valid and draft-only', () => {
    expect(validateEvidenceBundle(diabetesCoreEvidence)).toEqual([]);
    expect(diabetesCoreEvidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(diabetesCoreEvidence.atoms.every((atom) => atom.lifecycle === 'DRAFT')).toBe(true);
  });

  it('resolves every shadow-rule evidence reference and activates nothing', () => {
    const refs = new Set(diabetesCoreEvidence.atoms.map((atom) => `${atom.id}@${atom.version}`));
    for (const rule of diabetesCoreShadowRules) {
      for (const evidenceRef of rule.evidenceRefs) {
        expect(refs.has(`${evidenceRef.id}@${evidenceRef.version}`)).toBe(true);
      }
      expect(['APPROVED', 'ACTIVE']).not.toContain(rule.status);
    }
    expect(diabetesCoreReleaseMetadata.status).toBe('CLINICAL_REVIEW_REQUIRED');
  });
});

describe('oral glucose-lowering pathways', () => {
  const diabetesIndication = [known('MOD-diabetes-medication-indication', 'DIABETES')];

  it('encodes only a procedure-day hold for metformin and does not invent preprocedure or restart timing', () => {
    const result = evaluate(medication('MED-metformin', 'CLS-metformin'), diabetesIndication);
    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.outputSnapshot.timingRule?.procedureDay).toEqual({ takeMedication: false });
    expect(result.event.outputSnapshot.timingRule?.preProcedure).toBeUndefined();
    expect(result.event.outputSnapshot.timingRule?.restart).toBeUndefined();
    expect(result.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });

  it('applies the procedure-day pathway across core oral glucose-lowering classes', () => {
    const samples: Array<[string, string]> = [
      ['MED-glipizide', 'CLS-sulfonylurea'],
      ['MED-repaglinide', 'CLS-meglitinide'],
      ['MED-sitagliptin', 'CLS-dpp4-inhibitor'],
      ['MED-pioglitazone', 'CLS-thiazolidinedione'],
      ['MED-acarbose', 'CLS-alpha-glucosidase-inhibitor'],
      ['MED-bromocriptine-qr', 'CLS-dopamine-agonist-diabetes'],
      ['MED-colesevelam-diabetes', 'CLS-bile-acid-sequestrant-diabetes'],
    ];
    for (const [id, classId] of samples) {
      expect(evaluate(medication(id, classId), diabetesIndication).event.disposition).toBe('HOLD_STANDARD');
    }
  });

  it('fails closed when the medication indication is not confirmed as diabetes', () => {
    const result = evaluate(medication('MED-metformin', 'CLS-metformin'), [known('MOD-diabetes-medication-indication', 'OTHER')]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('NON_DIABETES_INDICATION_REQUIRES_CLINICIAN_REVIEW');
  });
});

describe('insulin safety pathways', () => {
  const type2 = [known('MOD-diabetes-type', 'TYPE_2'), known('MOD-current-insulin-plan-confirmed', true)];

  it('never emits a calculated patient-specific basal-insulin dose', () => {
    const result = evaluate(medication('MED-insulin-glargine', 'CLS-basal-insulin'), type2);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.outputSnapshot.timingRule).toBeUndefined();
  });

  it('surfaces type 1 diabetes as a basal-insulin safety hard stop', () => {
    const result = evaluate(medication('MED-insulin-degludec', 'CLS-basal-insulin'), [
      known('MOD-diabetes-type', 'TYPE_1'),
      known('MOD-current-insulin-plan-confirmed', true),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
  });

  it('requires oral-intake context for prandial insulin', () => {
    const med = medication('MED-insulin-lispro', 'CLS-prandial-insulin');
    const missing = evaluate(med, type2);
    expect(missing.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(missing.event.missingModifierIds).toContain('MOD-current-oral-intake-state');

    const complete = evaluate(med, [...type2, known('MOD-current-oral-intake-state', 'FASTING')]);
    expect(complete.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });

  it('keeps premixed and concentrated insulin in clinician review without dose arithmetic', () => {
    expect(evaluate(medication('MED-insulin-human-70-30', 'CLS-premixed-insulin'), type2).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    const concentrated = evaluate(medication('MED-regular-insulin-u500', 'CLS-concentrated-insulin'), type2);
    expect(concentrated.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(concentrated.event.outputSnapshot.timingRule).toBeUndefined();
  });

  it('routes pump/AID management to local policy for type 2 diabetes', () => {
    const result = evaluate(medication('MED-insulin-pump-aid', 'CLS-insulin-pump-aid'), [
      ...type2,
      known('MOD-pump-aid-system-type', 'AID'),
    ]);
    expect(result.event.disposition).toBe('LOCAL_POLICY_REQUIRED');
  });
});

describe('pramlintide pathway', () => {
  it('requires mealtime-insulin context and clinician review', () => {
    const result = evaluate(medication('MED-pramlintide', 'CLS-amylin-analog'), [
      known('MOD-diabetes-type', 'TYPE_2'),
      known('MOD-mealtime-insulin-use', true),
      known('MOD-current-insulin-plan-confirmed', true),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });
});
