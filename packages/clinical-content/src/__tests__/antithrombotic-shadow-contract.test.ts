import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ClinicalRule, type ModifierValue } from '@prep-meds/clinical-engine';
import { antithromboticCandidateRules, antithromboticEvidence } from '../antithrombotics.js';
import { actionableDoacShadowRules, antithromboticShadowRules } from '../antithrombotic-shadow.js';

function findRule(rules: ClinicalRule[], medicationId: string): ClinicalRule {
  const rule = rules.find((candidate) => candidate.scope.medicationIds?.includes(medicationId));
  if (!rule) throw new Error(`Missing rule fixture for ${medicationId}`);
  return rule;
}

function modifier(modifierId: string, value: unknown): ModifierValue {
  return {
    modifierId,
    state: 'KNOWN',
    value,
    provenance: {
      sourceType: 'USER_ENTERED',
      recordedAt: '2026-10-08T00:00:00Z',
      confirmationStatus: 'CONFIRMED',
    },
  };
}

function evaluate(medicationId: string, modifiers: ModifierValue[]) {
  return evaluateDecision({
    decisionEventId: 'DEC-shadow-contract',
    occurredAt: '2026-10-08T00:00:00Z',
    actorRole: 'CLINICIAN',
    engineVersion: 'shadow-contract-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-test',
      procedureCode: 'EGD_COLONOSCOPY',
      medication: {
        medicationId,
        ingredientIds: [],
        drugClassIds: [],
      },
      modifiers,
    },
    rules: antithromboticShadowRules,
    policies: [],
  });
}

const standardDoacModifiers = [
  modifier('MOD-anticoagulation-indication', 'ATRIAL_FIBRILLATION'),
  modifier('MOD-recent-thrombotic-event', false),
  modifier('MOD-concomitant-antithrombotic', false),
  modifier('MOD-doac-prolonged-clearance-risk', false),
];

describe('antithrombotic shadow serialization and ownership contract', () => {
  it('does not explicitly assign undefined to optional properties', () => {
    for (const rule of antithromboticShadowRules) {
      for (const key of ['restartOwner', 'timingRule', 'priority', 'policyDependencyIds'] as const) {
        if (Object.prototype.hasOwnProperty.call(rule, key)) {
          expect(rule[key]).not.toBeUndefined();
        }
      }
      expect(JSON.parse(JSON.stringify(rule))).toStrictEqual(rule);
    }
  });

  it('retains the not-applicable restart owner for the aspirin continuation candidate', () => {
    const source = findRule(antithromboticCandidateRules, 'MED-aspirin');
    const shadow = findRule(antithromboticShadowRules, 'MED-aspirin');
    expect(source.restartOwner).toBe('NOT_APPLICABLE');
    expect(shadow.restartOwner).toBe(source.restartOwner);
    expect(shadow.disposition).toBe('CONTINUE');
    expect(shadow.status).toBe('CLINICAL_REVIEW');
  });

  it('keeps non-actionable antithrombotic review pathways clinician-owned and without timing', () => {
    const reviewRules = antithromboticShadowRules.filter((rule) => rule.disposition === 'CLINICIAN_REVIEW_REQUIRED');
    expect(reviewRules.length).toBeGreaterThan(0);
    for (const rule of reviewRules) {
      expect(rule.restartOwner).toBe('CLINICIAN_REVIEW');
      expect(rule.timingRule).toBeUndefined();
    }
  });

  it('keeps actionable DOAC content review-only while exposing deterministic timing in validation mode', () => {
    expect(actionableDoacShadowRules.length).toBeGreaterThan(0);
    for (const rule of actionableDoacShadowRules) {
      expect(rule.status).toBe('CLINICAL_REVIEW');
      expect(rule.disposition).toBe('HOLD_STANDARD');
      expect(rule.timingRule?.instructionCode).toBeTruthy();
      expect(rule.restartOwner).toBe('ENDOSCOPIST');
      expect(rule.policyDependencyIds).toBeUndefined();
    }
  });

  it('does not mutate the source apixaban candidate', () => {
    const source = findRule(antithromboticCandidateRules, 'MED-apixaban');
    expect(source.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(source.restartOwner).toBe('ENDOSCOPIST');
    expect(source.policyDependencyIds).toContain('POLICY-GI-ANTITHROMBOTIC-TIMING');
    expect(source.timingRule).toBeUndefined();
  });
});

describe('actionable DOAC evidence and source-scope safety', () => {
  it('requires a non-empty exact locator for every evidence atom referenced by an actionable DOAC rule', () => {
    const atoms = new Map(
      antithromboticEvidence.atoms.map((atom) => [`${atom.id}@${atom.version}`, atom] as const),
    );

    for (const rule of actionableDoacShadowRules) {
      for (const evidenceRef of rule.evidenceRefs) {
        const atom = atoms.get(`${evidenceRef.id}@${evidenceRef.version}`);
        expect(atom, `Missing evidence atom for ${rule.id}: ${evidenceRef.id}@${evidenceRef.version}`).toBeDefined();
        const locatorValues = Object.values(atom?.locator ?? {}).filter(
          (value) => typeof value === 'string' && value.trim().length > 0,
        );
        expect(
          locatorValues.length,
          `Actionable evidence ${evidenceRef.id}@${evidenceRef.version} used by ${rule.id} must have an exact locator`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('fails closed until prolonged-clearance risk is explicitly resolved for factor Xa DOAC timing', () => {
    const result = evaluate('MED-apixaban', [
      ...standardDoacModifiers.filter((item) => item.modifierId !== 'MOD-doac-prolonged-clearance-risk'),
      modifier('MOD-procedure-bleeding-risk', 'LOW_MODERATE'),
    ]);

    expect(result.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.event.missingModifierIds).toContain('MOD-doac-prolonged-clearance-risk');
    expect(result.event.outputSnapshot.timingRule).toBeUndefined();
  });
});

describe('actionable DOAC shadow guidance', () => {
  it('returns a one-full-day apixaban hold for low-to-moderate bleeding risk', () => {
    const result = evaluate('MED-apixaban', [
      ...standardDoacModifiers,
      modifier('MOD-procedure-bleeding-risk', 'LOW_MODERATE'),
    ]);

    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 1,
    });
    expect(result.event.outputSnapshot.timingRule?.procedureDay).toMatchObject({ takeMedication: false });
    expect(result.event.outputSnapshot.restartOwner).toBe('ENDOSCOPIST');
  });

  it('returns a two-full-day apixaban hold for high bleeding risk', () => {
    const result = evaluate('MED-apixaban', [
      ...standardDoacModifiers,
      modifier('MOD-procedure-bleeding-risk', 'HIGH'),
    ]);

    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 2,
    });
  });

  it('fails closed when apixaban procedure bleeding risk is unknown', () => {
    const result = evaluate('MED-apixaban', standardDoacModifiers);

    expect(result.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.event.missingModifierIds).toContain('MOD-procedure-bleeding-risk');
  });

  it('escalates apixaban when a recent thrombotic event is reported', () => {
    const result = evaluate('MED-apixaban', [
      modifier('MOD-anticoagulation-indication', 'ATRIAL_FIBRILLATION'),
      modifier('MOD-recent-thrombotic-event', true),
      modifier('MOD-concomitant-antithrombotic', false),
      modifier('MOD-doac-prolonged-clearance-risk', false),
      modifier('MOD-procedure-bleeding-risk', 'LOW_MODERATE'),
    ]);

    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW');
    expect(result.event.outputSnapshot.timingRule).toBeUndefined();
  });

  it('uses the verified renal-function band for dabigatran timing', () => {
    const lowRiskReducedRenal = evaluate('MED-dabigatran', [
      ...standardDoacModifiers,
      modifier('MOD-procedure-bleeding-risk', 'LOW_MODERATE'),
      modifier('MOD-verified-crcl-band', 'LT_50'),
    ]);
    const highRiskReducedRenal = evaluate('MED-dabigatran', [
      ...standardDoacModifiers,
      modifier('MOD-procedure-bleeding-risk', 'HIGH'),
      modifier('MOD-verified-crcl-band', 'LT_50'),
    ]);

    expect(lowRiskReducedRenal.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 2,
    });
    expect(highRiskReducedRenal.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 4,
    });
  });
});
