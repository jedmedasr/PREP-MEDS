import { describe, expect, it } from 'vitest';

import {
  evaluateCondition,
  evaluateDecision,
  resolvePolicies,
  validateEngineArtifacts,
} from '../index.js';
import type {
  ClinicalRule,
  DecisionContext,
  EngineRequest,
  PolicyOverlay,
} from '../types.js';

const evidenceRef = { id: 'EVD-SYNTHETIC-001', version: 1 };

function context(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    organizationId: 'ORG-TEST',
    siteId: 'SITE-A',
    procedureCode: 'COLONOSCOPY',
    medication: {
      medicationId: 'MED-SYNTHETIC-A',
      ingredientIds: ['ING-SYNTHETIC-A'],
      drugClassIds: ['CLS-SYNTHETIC'],
    },
    modifiers: [],
    ...overrides,
  };
}

function rule(overrides: Partial<ClinicalRule> = {}): ClinicalRule {
  return {
    id: 'RULE-SYNTHETIC-001',
    version: 1,
    name: 'Synthetic software-test rule',
    scope: {
      medicationIds: ['MED-SYNTHETIC-A'],
      procedureCodes: ['COLONOSCOPY'],
    },
    requiredModifierIds: [],
    disposition: 'CONTINUE',
    evidenceRefs: [evidenceRef],
    status: 'ACTIVE',
    priority: 10,
    ...overrides,
  };
}

function request(overrides: Partial<EngineRequest> = {}): EngineRequest {
  return {
    decisionEventId: 'DEC-SYNTHETIC-001',
    caseId: 'CASE-SYNTHETIC-001',
    occurredAt: '2026-09-16T20:00:00Z',
    actorRole: 'SYSTEM',
    engineVersion: '0.1.0-test',
    mode: 'PRODUCTION',
    context: context(),
    rules: [rule()],
    policies: [],
    ...overrides,
  };
}

function policy(overrides: Partial<PolicyOverlay> = {}): PolicyOverlay {
  return {
    id: 'POL-SYNTHETIC-001',
    version: 1,
    organizationId: 'ORG-TEST',
    scopeLevel: 'ORGANIZATION',
    name: 'Synthetic organization policy',
    status: 'ACTIVE',
    scope: {
      medicationIds: ['MED-SYNTHETIC-A'],
      procedureCodes: ['COLONOSCOPY'],
    },
    effect: {
      dispositionOverride: 'CONDITIONAL',
      reasonCodes: ['SYNTHETIC_POLICY_APPLIED'],
    },
    priority: 10,
    ...overrides,
  };
}

describe('condition evaluation', () => {
  it('propagates unknown modifier values instead of treating them as false', () => {
    const ctx = context({
      modifiers: [
        {
          modifierId: 'MOD-SYNTHETIC-FLAG',
          state: 'UNKNOWN',
          provenance: { sourceType: 'USER_ENTERED', recordedAt: '2026-09-16T20:00:00Z' },
        },
      ],
    });
    const result = evaluateCondition(
      { op: 'EQUALS', field: 'modifier:MOD-SYNTHETIC-FLAG', value: true },
      ctx,
    );
    expect(result.state).toBe('UNKNOWN');
    expect(result.unresolvedFields).toEqual(['modifier:MOD-SYNTHETIC-FLAG']);
  });
});

describe('decision engine fail-closed behavior', () => {
  it('returns the selected routine rule only when required inputs are known', () => {
    const execution = evaluateDecision(request());
    expect(execution.event.disposition).toBe('CONTINUE');
    expect(execution.event.ruleRefs).toEqual([{ id: 'RULE-SYNTHETIC-001', version: 1 }]);
    expect(execution.event.evidenceRefs).toEqual([evidenceRef]);
  });

  it('returns insufficient information for a missing required modifier', () => {
    const execution = evaluateDecision(
      request({ rules: [rule({ requiredModifierIds: ['MOD-SYNTHETIC-REQUIRED'] })] }),
    );
    expect(execution.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(execution.event.missingModifierIds).toEqual(['MOD-SYNTHETIC-REQUIRED']);
  });

  it('returns insufficient information for conflicting required data', () => {
    const ctx = context({
      modifiers: [
        {
          modifierId: 'MOD-SYNTHETIC-REQUIRED',
          state: 'CONFLICTING',
          provenance: { sourceType: 'EHR', recordedAt: '2026-09-16T20:00:00Z' },
        },
      ],
    });
    const execution = evaluateDecision(
      request({
        context: ctx,
        rules: [rule({ requiredModifierIds: ['MOD-SYNTHETIC-REQUIRED'] })],
      }),
    );
    expect(execution.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(execution.event.reasonCodes).toContain('CONFLICTING_REQUIRED_INPUT');
  });

  it('escalates when a hard stop is true', () => {
    const ctx = context({
      modifiers: [
        {
          modifierId: 'MOD-SYNTHETIC-RISK',
          state: 'KNOWN',
          value: true,
          provenance: { sourceType: 'USER_ENTERED', recordedAt: '2026-09-16T20:00:00Z' },
        },
      ],
    });
    const execution = evaluateDecision(
      request({
        context: ctx,
        rules: [
          rule({
            hardStops: [
              {
                reasonCode: 'SYNTHETIC_HIGH_RISK',
                condition: { op: 'EQUALS', field: 'modifier:MOD-SYNTHETIC-RISK', value: true },
                disposition: 'CLINICIAN_REVIEW_REQUIRED',
              },
            ],
          }),
        ],
      }),
    );
    expect(execution.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(execution.event.reasonCodes).toContain('SYNTHETIC_HIGH_RISK');
  });

  it('does not assume a hard stop is absent when its input is unknown', () => {
    const ctx = context({
      modifiers: [
        {
          modifierId: 'MOD-SYNTHETIC-RISK',
          state: 'UNKNOWN',
          provenance: { sourceType: 'USER_ENTERED', recordedAt: '2026-09-16T20:00:00Z' },
        },
      ],
    });
    const execution = evaluateDecision(
      request({
        context: ctx,
        rules: [
          rule({
            hardStops: [
              {
                reasonCode: 'SYNTHETIC_HIGH_RISK',
                condition: { op: 'EQUALS', field: 'modifier:MOD-SYNTHETIC-RISK', value: true },
                disposition: 'CLINICIAN_REVIEW_REQUIRED',
              },
            ],
          }),
        ],
      }),
    );
    expect(execution.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(execution.event.reasonCodes).toContain('HARD_STOP_STATUS_UNRESOLVED');
  });

  it('escalates rather than silently choosing between tied rules', () => {
    const competing = rule({ id: 'RULE-SYNTHETIC-002', disposition: 'HOLD_STANDARD' });
    const execution = evaluateDecision(request({ rules: [rule(), competing] }));
    expect(execution.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(execution.event.reasonCodes).toContain('RULE_AMBIGUITY');
  });

  it('returns out of scope when production has no active applicable rule', () => {
    const draft = rule({ status: 'DRAFT' });
    const execution = evaluateDecision(request({ rules: [draft] }));
    expect(execution.event.disposition).toBe('OUT_OF_SCOPE');
  });

  it('permits draft synthetic rules only in validation mode', () => {
    const draft = rule({ status: 'DRAFT' });
    const execution = evaluateDecision(request({ mode: 'VALIDATION', rules: [draft] }));
    expect(execution.event.disposition).toBe('CONTINUE');
  });

  it('requires a declared local policy dependency before finalization', () => {
    const dependent = rule({ policyDependencyIds: ['POL-REQUIRED-001'] });
    const execution = evaluateDecision(request({ rules: [dependent] }));
    expect(execution.event.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(execution.event.reasonCodes).toContain('MISSING_POLICY:POL-REQUIRED-001');
  });
});

describe('policy overlay resolution', () => {
  it('applies an active governed policy and records policy provenance', () => {
    const execution = evaluateDecision(request({ policies: [policy()] }));
    expect(execution.event.disposition).toBe('CONDITIONAL');
    expect(execution.event.reasonCodes).toContain('SYNTHETIC_POLICY_APPLIED');
    expect(execution.event.policyRefs).toEqual([{ id: 'POL-SYNTHETIC-001', version: 1 }]);
  });

  it('allows a more-specific site policy to override organization policy', () => {
    const organizationPolicy = policy({
      id: 'POL-SYNTHETIC-ORG',
      effect: { dispositionOverride: 'CONDITIONAL' },
    });
    const sitePolicy = policy({
      id: 'POL-SYNTHETIC-SITE',
      siteId: 'SITE-A',
      scopeLevel: 'SITE',
      effect: { dispositionOverride: 'HOLD_STANDARD' },
    });
    const execution = evaluateDecision(request({ policies: [organizationPolicy, sitePolicy] }));
    expect(execution.event.disposition).toBe('HOLD_STANDARD');
    expect(execution.event.policyRefs).toContainEqual({ id: 'POL-SYNTHETIC-SITE', version: 1 });
  });

  it('escalates conflicting equal-precedence policies', () => {
    const first = policy({ id: 'POL-SYNTHETIC-A', effect: { dispositionOverride: 'CONTINUE' } });
    const second = policy({ id: 'POL-SYNTHETIC-B', effect: { dispositionOverride: 'HOLD_STANDARD' } });
    const execution = evaluateDecision(request({ policies: [first, second] }));
    expect(execution.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(execution.event.reasonCodes).toContain('POLICY_CONFLICT');
  });

  it('will not let policy downgrade a rule-level clinician review', () => {
    const reviewRule = rule({ disposition: 'CLINICIAN_REVIEW_REQUIRED' });
    const execution = evaluateDecision(
      request({ rules: [reviewRule], policies: [policy({ effect: { dispositionOverride: 'CONTINUE' } })] }),
    );
    expect(execution.event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(execution.event.reasonCodes).toContain('POLICY_CANNOT_DOWNGRADE_CLINICIAN_REVIEW');
  });

  it('marks unknown policy applicability as insufficient information', () => {
    const unresolvedPolicy = policy({
      appliesWhen: { op: 'EQUALS', field: 'modifier:MOD-SYNTHETIC-POLICY', value: true },
    });
    const execution = evaluateDecision(request({ policies: [unresolvedPolicy] }));
    expect(execution.event.disposition).toBe('INSUFFICIENT_INFORMATION');
    expect(execution.event.missingModifierIds).toEqual(['MOD-SYNTHETIC-POLICY']);
  });

  it('resolves policy queries deterministically', () => {
    const result = resolvePolicies([policy()], context(), 'PRODUCTION');
    expect(result.kind).toBe('RESOLVED');
    expect(result.effect?.policyRefs).toEqual([{ id: 'POL-SYNTHETIC-001', version: 1 }]);
  });
});

describe('auditability and artifact validation', () => {
  it('returns immutable event and trace snapshots', () => {
    const execution = evaluateDecision(request());
    expect(Object.isFrozen(execution.event)).toBe(true);
    expect(Object.isFrozen(execution.event.ruleRefs)).toBe(true);
    expect(Object.isFrozen(execution.trace)).toBe(true);
  });

  it('flags malformed clinical artifacts before activation', () => {
    const invalidRule = rule({ evidenceRefs: [], priority: -1 });
    const invalidPolicy = policy({ scopeLevel: 'SITE' });
    const issues = validateEngineArtifacts([invalidRule], [invalidPolicy]);
    expect(issues.map((issue) => issue.code)).toContain('RULE_WITHOUT_EVIDENCE');
    expect(issues.map((issue) => issue.code)).toContain('INVALID_RULE_PRIORITY');
    expect(issues.map((issue) => issue.code)).toContain('SITE_POLICY_WITHOUT_SITE');
  });
});
