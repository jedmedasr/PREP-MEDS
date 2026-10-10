import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue } from '@prep-meds/clinical-engine';
import { clinicalReviewRules, modifierDefinitions } from '../content';

function known(modifierId: string, value: unknown): ModifierValue {
  return {
    modifierId,
    state: 'KNOWN',
    value,
    provenance: {
      sourceType: 'USER_ENTERED',
      recordedAt: '2026-10-10T00:00:00Z',
      confirmationStatus: 'CONFIRMED',
    },
  };
}

function evaluateApixaban(bleedingRisk: 'LOW_MODERATE' | 'HIGH', recentThrombosis = false) {
  return evaluateDecision({
    decisionEventId: 'DEC-apixaban-integration',
    occurredAt: '2026-10-10T00:00:00Z',
    actorRole: 'CLINICIAN',
    engineVersion: 'web-integration-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-test',
      procedureCode: 'EGD_COLONOSCOPY',
      medication: {
        medicationId: 'MED-apixaban',
        ingredientIds: ['ING-apixaban'],
        drugClassIds: ['CLS-doac-factor-xa'],
      },
      modifiers: [
        known('MOD-anticoagulation-indication', 'ATRIAL_FIBRILLATION'),
        known('MOD-concomitant-antithrombotic', false),
        known('MOD-recent-thrombotic-event', recentThrombosis),
        known('MOD-procedure-bleeding-risk', bleedingRisk),
      ],
    },
    rules: clinicalReviewRules,
    policies: [],
  });
}

describe('assembled web antithrombotic actionability', () => {
  it('does not expose the stale generic apixaban indication placeholder', () => {
    const apixabanRules = clinicalReviewRules.filter((rule) => rule.scope.medicationIds?.includes('MED-apixaban'));
    const required = new Set(apixabanRules.flatMap((rule) => rule.requiredModifierIds));

    expect(apixabanRules.some((rule) => rule.id === 'RULE-APIXABAN-REVIEW-001')).toBe(false);
    expect(required.has('MOD-indication')).toBe(false);
    expect(required.has('MOD-anticoagulation-indication')).toBe(true);
    expect(required.has('MOD-procedure-bleeding-risk')).toBe(true);
    expect(modifierDefinitions['MOD-procedure-bleeding-risk']).toBeDefined();
  });

  it('returns a one-full-day hold candidate for low-to-moderate bleeding risk', () => {
    const result = evaluateApixaban('LOW_MODERATE');
    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.missingModifierIds).toEqual([]);
    expect(result.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 1,
      intervalDefinition: 'FULL_DAYS_BEFORE_PROCEDURE_WITH_NO_DOAC_DOSES',
    });
    expect(result.event.outputSnapshot.timingRule?.procedureDay).toMatchObject({ takeMedication: false });
    expect(result.event.outputSnapshot.restartOwner).toBe('ENDOSCOPIST');
  });

  it('returns a two-full-day hold candidate for high bleeding risk', () => {
    const result = evaluateApixaban('HIGH');
    expect(result.event.disposition).toBe('HOLD_STANDARD');
    expect(result.event.missingModifierIds).toEqual([]);
    expect(result.event.outputSnapshot.timingRule?.preProcedure).toMatchObject({
      medicationFreeIntervalDaysBeforeProcedure: 2,
    });
  });

  it('fails closed instead of issuing timing after a recent thrombotic event', () => {
    const result = evaluateApixaban('LOW_MODERATE', true);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW');
    expect(result.event.outputSnapshot.timingRule).toBeUndefined();
  });
});
