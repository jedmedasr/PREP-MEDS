import { describe, expect, it } from 'vitest';
import type { ClinicalRule, DecisionEvent, MedicationContext } from '@prep-meds/clinical-engine';
import { deriveRequiredQuestions, renderPatientInstruction } from '../workflow';

const medication: MedicationContext = {
  medicationId: 'MED-synthetic',
  ingredientIds: ['ING-synthetic'],
  drugClassIds: ['CLS-synthetic'],
};

const activeRule: ClinicalRule = {
  id: 'RULE-synthetic',
  version: 1,
  name: 'Synthetic web workflow rule',
  scope: { medicationIds: ['MED-synthetic'], procedureCodes: ['COLONOSCOPY'] },
  requiredModifierIds: ['MOD-synthetic'],
  disposition: 'CONDITIONAL',
  evidenceRefs: [{ id: 'EVD-synthetic', version: 1 }],
  status: 'ACTIVE',
};

function event(overrides: Partial<DecisionEvent>): DecisionEvent {
  return {
    id: 'DEC-synthetic',
    occurredAt: '2026-09-16T00:00:00Z',
    organizationId: 'ORG-test',
    procedureCode: 'COLONOSCOPY',
    medicationId: 'MED-synthetic',
    modifierValues: [],
    disposition: 'OUT_OF_SCOPE',
    reasonCodes: ['NO_APPLICABLE_RULE'],
    missingModifierIds: [],
    ruleRefs: [],
    evidenceRefs: [],
    policyRefs: [],
    engineVersion: 'test',
    outputSnapshot: {},
    ...overrides,
  };
}

describe('progressive question discovery', () => {
  it('returns only fields required by active in-scope rules', () => {
    const questions = deriveRequiredQuestions({
      rules: [activeRule, { ...activeRule, id: 'RULE-draft', status: 'DRAFT', requiredModifierIds: ['MOD-draft'] }],
      medication,
      procedureCode: 'COLONOSCOPY',
      definitions: {
        'MOD-synthetic': { id: 'MOD-synthetic', label: 'Synthetic input', inputType: 'text' },
        'MOD-draft': { id: 'MOD-draft', label: 'Draft input', inputType: 'text' },
      },
    });

    expect(questions.map((question) => question.id)).toEqual(['MOD-synthetic']);
  });
});

describe('patient instruction guard', () => {
  it('blocks non-actionable results', () => {
    const result = renderPatientInstruction(event({ disposition: 'CLINICIAN_REVIEW_REQUIRED', reasonCodes: ['SYNTHETIC_STOP'] }));
    expect(result.allowed).toBe(false);
  });

  it('blocks hold instructions without an approved timing instruction code', () => {
    const result = renderPatientInstruction(event({ disposition: 'HOLD_STANDARD', reasonCodes: [], ruleRefs: [{ id: 'RULE-synthetic', version: 1 }] }));
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('MISSING_TIMING_INSTRUCTION');
  });

  it('allows a structured continue result', () => {
    const result = renderPatientInstruction(event({ disposition: 'CONTINUE', reasonCodes: [], ruleRefs: [{ id: 'RULE-synthetic', version: 1 }] }));
    expect(result.allowed).toBe(true);
  });
});
