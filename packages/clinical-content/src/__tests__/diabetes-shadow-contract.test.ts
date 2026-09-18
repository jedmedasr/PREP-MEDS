import { describe, expect, it } from 'vitest';
import type { ClinicalRule } from '@prep-meds/clinical-engine';
import { diabetesCoreCandidateRules } from '../diabetes-core.js';
import { diabetesCoreShadowRules, toDiabetesShadowRule } from '../diabetes-core-shadow.js';

function fixture(): ClinicalRule {
  return {
    id: 'SYNTHETIC-B2-OPTIONAL-TIMING', version: 1, name: 'Synthetic serialization fixture',
    scope: {}, requiredModifierIds: [], disposition: 'HOLD_STANDARD', evidenceRefs: [],
    status: 'DRAFT', timingRule: { restart: { synthetic: true } },
  };
}

describe('diabetes shadow conversion contract', () => {
  it('does not manufacture an undefined instructionCode when it is absent', () => {
    const shadow = toDiabetesShadowRule(fixture());
    expect(shadow.timingRule).toEqual({});
    expect(Object.hasOwn(shadow.timingRule ?? {}, 'instructionCode')).toBe(false);
    expect(JSON.parse(JSON.stringify(shadow))).toStrictEqual(shadow);
  });
  it('does not mutate the original rule or its restart directive', () => {
    const source = fixture();
    const snapshot = JSON.stringify(source);
    const shadow = toDiabetesShadowRule(source);
    expect(JSON.stringify(source)).toBe(snapshot);
    expect(shadow).not.toBe(source);
    expect(shadow.timingRule).not.toBe(source.timingRule);
    expect(shadow.restartOwner).toBe('CLINICIAN_REVIEW');
  });
  it('preserves supplied procedure-day timing but removes restart details', () => {
    const source = fixture();
    source.timingRule = {
      instructionCode: 'SYNTHETIC', procedureDay: { synthetic: true },
      restart: { synthetic: true },
    };
    expect(toDiabetesShadowRule(source).timingRule).toEqual({
      instructionCode: 'SYNTHETIC', procedureDay: { synthetic: true },
    });
  });
  it('preserves the source disposition and lifecycle without manufacturing timing', () => {
    const source = fixture();
    delete source.timingRule;
    source.disposition = 'CLINICIAN_REVIEW_REQUIRED';
    const shadow = toDiabetesShadowRule(source);
    expect(shadow).toStrictEqual(source);
    expect(shadow).not.toBe(source);
    expect(Object.hasOwn(shadow, 'timingRule')).toBe(false);
    expect(Object.hasOwn(shadow, 'restartOwner')).toBe(false);
  });
  it('does not activate any real candidate or alter its structured disposition', () => {
    expect(diabetesCoreShadowRules).toHaveLength(diabetesCoreCandidateRules.length);
    for (const source of diabetesCoreCandidateRules) {
      const shadow = diabetesCoreShadowRules.find((rule) => rule.id === source.id);
      expect(shadow?.disposition).toBe(source.disposition);
      expect(shadow?.status).toBe(source.status);
      expect(['APPROVED', 'ACTIVE']).not.toContain(shadow?.status);
      expect(shadow?.timingRule?.restart).toBeUndefined();
    }
  });
});
