import { describe, expect, it } from 'vitest';
import type { ClinicalRule } from '@prep-meds/clinical-engine';
import { antithromboticCandidateRules } from '../antithrombotics.js';
import { antithromboticShadowRules } from '../antithrombotic-shadow.js';

function findRule(rules: ClinicalRule[], medicationId: string): ClinicalRule {
  const rule = rules.find((candidate) => candidate.scope.medicationIds?.includes(medicationId));
  if (!rule) throw new Error(`Missing rule fixture for ${medicationId}`);
  return rule;
}

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

  it('keeps all review-only antithrombotic restart decisions clinician-owned', () => {
    const reviewRules = antithromboticShadowRules.filter((rule) => rule.disposition !== 'CONTINUE');
    expect(reviewRules.length).toBeGreaterThan(0);
    for (const rule of reviewRules) {
      expect(rule.restartOwner).toBe('CLINICIAN_REVIEW');
      expect(rule.timingRule).toBeUndefined();
    }
  });

  it('does not mutate the source restart ownership or policy dependencies', () => {
    const source = findRule(antithromboticCandidateRules, 'MED-apixaban');
    const shadow = findRule(antithromboticShadowRules, 'MED-apixaban');
    expect(shadow).not.toBe(source);
    expect(source.restartOwner).toBe('ENDOSCOPIST');
    expect(source.policyDependencyIds).toContain('POLICY-GI-ANTITHROMBOTIC-TIMING');
    expect(shadow.restartOwner).toBe('CLINICIAN_REVIEW');
    expect(shadow.policyDependencyIds).toBeUndefined();
    expect(shadow.requiredModifierIds).not.toBe(source.requiredModifierIds);
  });

  it('preserves dispositions and leaves all transformed content unapproved', () => {
    expect(antithromboticShadowRules).toHaveLength(antithromboticCandidateRules.length);
    for (const source of antithromboticCandidateRules) {
      const shadow = antithromboticShadowRules.find((rule) => rule.id === source.id);
      expect(shadow).toBeDefined();
      expect(shadow?.disposition).toBe(source.disposition);
      expect(shadow?.status).toBe('CLINICAL_REVIEW');
    }
  });
});
