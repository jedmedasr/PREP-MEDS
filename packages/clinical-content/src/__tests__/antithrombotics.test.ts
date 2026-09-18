import { describe, expect, it } from 'vitest';
import {
  evaluateDecision,
  type MedicationContext,
  type ModifierValue,
} from '@prep-meds/clinical-engine';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antithromboticEvidence, antithromboticReleaseMetadata } from '../antithrombotics.js';
import { antithromboticShadowRules } from '../antithrombotic-shadow.js';

const recordedAt = '2026-09-17T02:00:00Z';

function medication(id: string, classId: string): MedicationContext {
  return { medicationId: id, ingredientIds: [`ING-${id.slice(4)}`], drugClassIds: [classId] };
}

function known(modifierId: string, value: unknown): ModifierValue {
  return {
    modifierId,
    state: 'KNOWN',
    value,
    provenance: { sourceType: 'USER_ENTERED', recordedAt, confirmationStatus: 'CONFIRMED' },
  };
}

function evaluate(med: MedicationContext, modifiers: ModifierValue[]) {
  return evaluateDecision({
    decisionEventId: `DEC-B1-${med.medicationId}`,
    occurredAt: recordedAt,
    actorRole: 'SYSTEM',
    engineVersion: 'med-batch-01-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SHADOW-TEST',
      procedureCode: 'COLONOSCOPY',
      medication: med,
      modifiers,
    },
    rules: antithromboticShadowRules,
    policies: [],
  });
}

const anticoagContext = [
  known('MOD-anticoagulation-indication', 'ATRIAL_FIBRILLATION'),
  known('MOD-recent-thrombotic-event', false),
  known('MOD-concomitant-antithrombotic', false),
];

const p2y12Context = [
  known('MOD-antiplatelet-indication', 'PRIOR_MI_OR_CAD'),
  known('MOD-dual-antiplatelet-therapy', false),
  known('MOD-recent-coronary-stent-or-acs', false),
  known('MOD-concomitant-antithrombotic', false),
];

describe('antithrombotic evidence governance', () => {
  it('keeps the evidence bundle structurally valid and draft-only', () => {
    expect(validateEvidenceBundle(antithromboticEvidence)).toEqual([]);
    expect(antithromboticEvidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(antithromboticEvidence.atoms.every((atom) => atom.lifecycle === 'DRAFT')).toBe(true);
    expect(antithromboticEvidence.conflicts?.some((conflict) => conflict.conflictGroup === 'CONFLICT-ENDOSCOPY-ANTITHROMBOTIC-TIMING')).toBe(true);
  });

  it('resolves every shadow-rule evidence reference exactly and activates nothing', () => {
    const refs = new Set(antithromboticEvidence.atoms.map((atom) => `${atom.id}@${atom.version}`));
    for (const rule of antithromboticShadowRules) {
      for (const evidenceRef of rule.evidenceRefs) {
        expect(refs.has(`${evidenceRef.id}@${evidenceRef.version}`)).toBe(true);
      }
      expect(['APPROVED', 'ACTIVE']).not.toContain(rule.status);
    }
    expect(antithromboticReleaseMetadata.status).toBe('CLINICAL_REVIEW_REQUIRED');
  });

  it('does not reuse P2Y12 or DOAC-bridging evidence as direct support for unrelated review pathways', () => {
    const byMedication = new Map(
      antithromboticShadowRules.flatMap((rule) =>
        (rule.scope.medicationIds ?? []).map((medicationId) => [medicationId, rule] as const),
      ),
    );

    for (const medicationId of ['MED-heparin', 'MED-fondaparinux', 'MED-dipyridamole']) {
      const rule = byMedication.get(medicationId);
      expect(rule).toBeDefined();
      expect(rule?.evidenceRefs).toEqual([{ id: 'EVD-B1-BSG-LOW-HIGH-RISK-ENDOSCOPY', version: 1 }]);
    }
  });
});

describe('oral anticoagulant shadow pathways', () => {
  it('fails closed when required anticoagulation context is missing', () => {
    const result = evaluate(medication('MED-apixaban', 'CLS-doac-factor-xa'), [
      known('MOD-recent-thrombotic-event', false),
      known('MOD-concomitant-antithrombotic', false),
    ]);
    expect(result.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.event.missingModifierIds).toContain('MOD-anticoagulation-indication');
  });

  it('routes factor-Xa DOACs to clinician review without an autonomous hold or restart interval', () => {
    for (const id of ['MED-apixaban', 'MED-rivaroxaban', 'MED-edoxaban']) {
      const result = evaluate(medication(id, 'CLS-doac-factor-xa'), anticoagContext);
      expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(result.event.outputSnapshot.timingRule).toBeUndefined();
      expect(result.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
    }
  });

  it('requires a verified CrCl band before dabigatran review can be finalized', () => {
    const med = medication('MED-dabigatran', 'CLS-direct-thrombin-inhibitor');
    const missingRenal = evaluate(med, anticoagContext);
    expect(missingRenal.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(missingRenal.event.missingModifierIds).toContain('MOD-verified-crcl-band');

    const complete = evaluate(med, [...anticoagContext, known('MOD-verified-crcl-band', 'GE_50')]);
    expect(complete.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(complete.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });

  it('surfaces recent thrombosis as a hard-stop reason', () => {
    const result = evaluate(medication('MED-rivaroxaban', 'CLS-doac-factor-xa'), [
      known('MOD-anticoagulation-indication', 'VTE'),
      known('MOD-recent-thrombotic-event', true),
      known('MOD-concomitant-antithrombotic', false),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW');
  });

  it('requires mechanical-valve status and keeps warfarin non-actionable', () => {
    const med = medication('MED-warfarin', 'CLS-vitamin-k-antagonist');
    expect(evaluate(med, anticoagContext).event.disposition).toBe('INSUFFICIENT_INFORMATION');

    const complete = evaluate(med, [...anticoagContext, known('MOD-mechanical-heart-valve', false)]);
    expect(complete.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(complete.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });

  it('flags a mechanical-valve indication even when the separate boolean is inconsistent', () => {
    const med = medication('MED-warfarin', 'CLS-vitamin-k-antagonist');
    const result = evaluate(med, [
      known('MOD-anticoagulation-indication', 'MECHANICAL_HEART_VALVE'),
      known('MOD-recent-thrombotic-event', false),
      known('MOD-concomitant-antithrombotic', false),
      known('MOD-mechanical-heart-valve', false),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('MECHANICAL_HEART_VALVE_INDICATION_REQUIRES_CLINICIAN_REVIEW');
  });
});

describe('injectable anticoagulant shadow pathways', () => {
  const injectableContext = [
    known('MOD-anticoagulation-indication', 'VTE'),
    known('MOD-anticoagulant-intent', 'THERAPEUTIC'),
    known('MOD-recent-thrombotic-event', false),
    known('MOD-verified-crcl-band', 'GE_50'),
    known('MOD-concomitant-antithrombotic', false),
  ];

  it('requires whole-list antithrombotic context before review', () => {
    const incomplete = injectableContext.filter((modifier) => modifier.modifierId !== 'MOD-concomitant-antithrombotic');
    const result = evaluate(medication('MED-enoxaparin', 'CLS-lmwh'), incomplete);
    expect(result.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(result.event.missingModifierIds).toContain('MOD-concomitant-antithrombotic');
  });

  it('distinguishes injectable anticoagulant intent and remains clinician-reviewed', () => {
    expect(evaluate(medication('MED-enoxaparin', 'CLS-lmwh'), injectableContext).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(evaluate(medication('MED-dalteparin', 'CLS-lmwh'), injectableContext).event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
  });

  it('surfaces recent thrombosis for injectable anticoagulants', () => {
    const recent = injectableContext.map((modifier) =>
      modifier.modifierId === 'MOD-recent-thrombotic-event'
        ? known('MOD-recent-thrombotic-event', true)
        : modifier,
    );
    const result = evaluate(medication('MED-enoxaparin', 'CLS-lmwh'), recent);
    expect(result.event.reasonCodes).toContain('RECENT_THROMBOTIC_EVENT_REQUIRES_CLINICIAN_REVIEW');
  });
});

describe('antiplatelet shadow pathways', () => {
  it('continues aspirin only when secondary-prevention monotherapy and no other antithrombotic are confirmed', () => {
    const med = medication('MED-aspirin', 'CLS-antiplatelet');
    const result = evaluate(med, [
      known('MOD-aspirin-indication', 'SECONDARY_CV_PREVENTION'),
      known('MOD-dual-antiplatelet-therapy', false),
      known('MOD-concomitant-antithrombotic', false),
    ]);
    expect(result.event.disposition).toBe('CONTINUE');
  });

  it('blocks aspirin continuation when another antithrombotic is present', () => {
    const med = medication('MED-aspirin', 'CLS-antiplatelet');
    const result = evaluate(med, [
      known('MOD-aspirin-indication', 'SECONDARY_CV_PREVENTION'),
      known('MOD-dual-antiplatelet-therapy', false),
      known('MOD-concomitant-antithrombotic', true),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.reasonCodes).toContain('ASPIRIN_WITH_OTHER_ANTITHROMBOTIC_REQUIRES_REVIEW');
  });

  it('routes all encoded P2Y12 agents to clinician review and surfaces recent stent/ACS', () => {
    for (const id of ['MED-clopidogrel', 'MED-prasugrel', 'MED-ticagrelor', 'MED-ticlopidine']) {
      const result = evaluate(medication(id, 'CLS-p2y12-inhibitor'), p2y12Context);
      expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(result.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
    }

    const recentStent = p2y12Context.map((modifier) =>
      modifier.modifierId === 'MOD-recent-coronary-stent-or-acs'
        ? known('MOD-recent-coronary-stent-or-acs', true)
        : modifier,
    );
    const result = evaluate(medication('MED-clopidogrel', 'CLS-p2y12-inhibitor'), recentStent);
    expect(result.event.reasonCodes).toContain('RECENT_STENT_OR_ACS_REQUIRES_CLINICIAN_REVIEW');
  });

  it('surfaces DAPT as an explicit component/stent-risk review reason', () => {
    const dapt = p2y12Context.map((modifier) =>
      modifier.modifierId === 'MOD-dual-antiplatelet-therapy'
        ? known('MOD-dual-antiplatelet-therapy', true)
        : modifier,
    );
    const result = evaluate(medication('MED-ticagrelor', 'CLS-p2y12-inhibitor'), dapt);
    expect(result.event.reasonCodes).toContain('DAPT_REQUIRES_COMPONENT_AND_STENT_RISK_REVIEW');
  });

  it('keeps aspirin/dipyridamole combination therapy clinician-reviewed', () => {
    const med: MedicationContext = {
      medicationId: 'MED-aspirin-dipyridamole',
      ingredientIds: ['ING-aspirin', 'ING-dipyridamole'],
      drugClassIds: ['CLS-antiplatelet-combination'],
    };
    const result = evaluate(med, [
      known('MOD-antiplatelet-indication', 'CEREBROVASCULAR'),
      known('MOD-concomitant-antithrombotic', false),
    ]);
    expect(result.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(result.event.outputSnapshot.restartOwner).toBe('CLINICIAN_REVIEW');
  });
});
