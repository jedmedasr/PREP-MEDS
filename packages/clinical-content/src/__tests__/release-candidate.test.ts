import { describe, expect, it } from 'vitest';
import {
  evaluateDecision,
  type MedicationContext,
  type ModifierValue,
  type ProcedureCode,
} from '@prep-meds/clinical-engine';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { firstClinicalContentEvidence } from '../evidence.js';
import { firstReleaseCandidateRules } from '../rules.js';

const recordedAt = '2026-09-17T01:00:00Z';

const medications: Record<string, MedicationContext> = {
  atorvastatin: { medicationId: 'MED-atorvastatin', ingredientIds: ['ING-atorvastatin'], drugClassIds: ['CLS-statin'] },
  metoprolol: { medicationId: 'MED-metoprolol', ingredientIds: ['ING-metoprolol'], drugClassIds: ['CLS-beta-blocker'] },
  aspirin: { medicationId: 'MED-aspirin', ingredientIds: ['ING-aspirin'], drugClassIds: ['CLS-antiplatelet'] },
  empagliflozin: { medicationId: 'MED-empagliflozin', ingredientIds: ['ING-empagliflozin'], drugClassIds: ['CLS-sglt2-inhibitor'] },
  semaglutide: { medicationId: 'MED-semaglutide', ingredientIds: ['ING-semaglutide'], drugClassIds: ['CLS-glp1-receptor-agonist'] },
  insulinGlargine: { medicationId: 'MED-insulin-glargine', ingredientIds: ['ING-insulin-glargine'], drugClassIds: ['CLS-basal-insulin'] },
  lisinopril: { medicationId: 'MED-lisinopril', ingredientIds: ['ING-lisinopril'], drugClassIds: ['CLS-ace-inhibitor'] },
  apixaban: { medicationId: 'MED-apixaban', ingredientIds: ['ING-apixaban'], drugClassIds: ['CLS-doac-factor-xa'] },
  warfarin: { medicationId: 'MED-warfarin', ingredientIds: ['ING-warfarin'], drugClassIds: ['CLS-vitamin-k-antagonist'] },
  clopidogrel: { medicationId: 'MED-clopidogrel', ingredientIds: ['ING-clopidogrel'], drugClassIds: ['CLS-p2y12-inhibitor'] },
};

function known(modifierId: string, value: unknown): ModifierValue {
  return {
    modifierId,
    state: 'KNOWN',
    value,
    provenance: { sourceType: 'USER_ENTERED', recordedAt, confirmationStatus: 'CONFIRMED' },
  };
}

function evaluate(medication: MedicationContext, modifiers: ModifierValue[] = [], procedureCode: ProcedureCode = 'COLONOSCOPY') {
  return evaluateDecision({
    decisionEventId: `DEC-${medication.medicationId}`,
    occurredAt: recordedAt,
    actorRole: 'SYSTEM',
    engineVersion: 'stage-08.5-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SHADOW-TEST',
      procedureCode,
      medication,
      modifiers,
    },
    rules: firstReleaseCandidateRules,
    policies: [],
  });
}

describe('first clinical content evidence bundle', () => {
  it('is structurally valid and all rule evidence references resolve exactly', () => {
    expect(validateEvidenceBundle(firstClinicalContentEvidence)).toEqual([]);
    const refs = new Set(firstClinicalContentEvidence.atoms.map((atom) => `${atom.id}@${atom.version}`));
    for (const rule of firstReleaseCandidateRules) {
      for (const evidenceRef of rule.evidenceRefs) {
        expect(refs.has(`${evidenceRef.id}@${evidenceRef.version}`)).toBe(true);
      }
    }
  });

  it('contains no reviewed/current evidence and no active clinical rules', () => {
    expect(firstClinicalContentEvidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(firstClinicalContentEvidence.atoms.every((atom) => atom.lifecycle === 'DRAFT')).toBe(true);
    expect(firstReleaseCandidateRules.some((rule) => rule.status === 'ACTIVE' || rule.status === 'APPROVED')).toBe(false);
  });
});

describe('lower-complexity continuation candidates', () => {
  it('continues stable chronic atorvastatin but escalates non-stable use', () => {
    expect(evaluate(medications.atorvastatin!, [known('MOD-stable-chronic-use', true)]).event.disposition).toBe('CONTINUE');
    expect(evaluate(medications.atorvastatin!, [known('MOD-stable-chronic-use', false)]).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });

  it('continues stable chronic metoprolol but fails closed if chronic-use status is missing', () => {
    expect(evaluate(medications.metoprolol!, [known('MOD-stable-chronic-use', true)]).event.disposition).toBe('CONTINUE');
    expect(evaluate(medications.metoprolol!).event.disposition).toBe('INSUFFICIENT_INFORMATION');
  });

  it('continues aspirin only when secondary prevention and monotherapy are confirmed', () => {
    const routine = evaluate(medications.aspirin!, [
      known('MOD-aspirin-indication', 'SECONDARY_CV_PREVENTION'),
      known('MOD-dual-antiplatelet-therapy', false),
    ]);
    expect(routine.event.disposition).toBe('CONTINUE');

    const dapt = evaluate(medications.aspirin!, [
      known('MOD-aspirin-indication', 'SECONDARY_CV_PREVENTION'),
      known('MOD-dual-antiplatelet-therapy', true),
    ]);
    expect(dapt.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');

    const primary = evaluate(medications.aspirin!, [
      known('MOD-aspirin-indication', 'PRIMARY_PREVENTION'),
      known('MOD-dual-antiplatelet-therapy', false),
    ]);
    expect(primary.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });
});

describe('diabetes and GLP-1 candidates', () => {
  it('encodes empagliflozin as a technically tested hold candidate with structured timing provenance', () => {
    const result = evaluate(medications.empagliflozin!);
    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.outputSnapshot.timingRule?.instructionCode).toBe('EMPAGLIFLOZIN_WITHHOLD_3_DAYS_BEFORE_PROCEDURE');
    expect(result.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });

  it('continues semaglutide only when all encoded gastric-risk modifiers are explicitly low risk', () => {
    const lowRisk = [
      known('MOD-glp1-escalation-phase', false),
      known('MOD-significant-gi-symptoms', false),
      known('MOD-known-delayed-gastric-emptying', false),
      known('MOD-glp1-high-dose', false),
    ];
    expect(evaluate(medications.semaglutide!, lowRisk).event.disposition).toBe('CONTINUE');

    const symptomatic = lowRisk.map((item) =>
      item.modifierId === 'MOD-significant-gi-symptoms'
        ? known('MOD-significant-gi-symptoms', true)
        : item,
    );
    expect(evaluate(medications.semaglutide!, symptomatic).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(evaluate(medications.semaglutide!, lowRisk.slice(0, 3)).event.disposition).toBe('INSUFFICIENT_INFORMATION');
  });

  it('never produces a routine insulin-glargine dose decision', () => {
    expect(evaluate(medications.insulinGlargine!, [known('MOD-diabetes-type', 'TYPE_1')]).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(evaluate(medications.insulinGlargine!, [known('MOD-diabetes-type', 'TYPE_2')]).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });
});

describe('policy-sensitive and antithrombotic candidates', () => {
  it('requires a local anesthesia policy for lisinopril', () => {
    const result = evaluate(medications.lisinopril!, [known('MOD-raas-indication', 'HYPERTENSION')]);
    expect(result.event.disposition).toBe('LOCAL_POLICY_REQUIRED');
  });

  it('routes apixaban and warfarin to clinician review after required context is collected', () => {
    const context = [known('MOD-indication', 'ATRIAL_FIBRILLATION'), known('MOD-recent-thrombotic-event', false)];
    expect(evaluate(medications.apixaban!, context).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(evaluate(medications.warfarin!, context).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });

  it('routes clopidogrel to clinician review and requires coronary-risk context', () => {
    const complete = [
      known('MOD-indication', 'CORONARY_ARTERY_DISEASE'),
      known('MOD-dual-antiplatelet-therapy', false),
      known('MOD-recent-coronary-stent-or-acs', false),
    ];
    expect(evaluate(medications.clopidogrel!, complete).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(evaluate(medications.clopidogrel!, complete.slice(0, 2)).event.disposition).toBe('INSUFFICIENT_INFORMATION');
  });
});
