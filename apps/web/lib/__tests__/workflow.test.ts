import { describe, expect, it } from 'vitest';
import type { ClinicalRule, DecisionEvent, MedicationContext, ModifierValue } from '@prep-meds/clinical-engine';
import {
  blockedShadowPatientInstruction,
  deriveRequiredQuestions,
  normalizeModifierValues,
  renderPatientInstruction,
} from '../workflow';

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
  it('returns only fields required by active in-scope rules in production discovery', () => {
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

  it('can expose non-retired review-candidate questions only when shadow discovery is explicit', () => {
    const questions = deriveRequiredQuestions({
      rules: [{ ...activeRule, status: 'TECHNICALLY_TESTED', requiredModifierIds: ['MOD-review'] }],
      medication,
      procedureCode: 'COLONOSCOPY',
      definitions: {
        'MOD-review': { id: 'MOD-review', label: 'Review input', inputType: 'boolean' },
      },
      includeReviewCandidates: true,
    });

    expect(questions.map((question) => question.id)).toEqual(['MOD-review']);
  });
});

describe('modifier normalization', () => {
  it('converts a numeric form value to a finite number before engine evaluation', () => {
    const modifier: ModifierValue = {
      modifierId: 'MOD-number',
      state: 'KNOWN',
      value: '12.5',
      provenance: {
        sourceType: 'USER_ENTERED',
        recordedAt: '2026-09-16T00:00:00Z',
        confirmationStatus: 'CONFIRMED',
      },
    };
    const [normalized] = normalizeModifierValues([modifier], {
      'MOD-number': { id: 'MOD-number', label: 'Synthetic number', inputType: 'number' },
    });
    expect(normalized?.value).toBe(12.5);
  });

  it('fails a malformed numeric value closed to UNKNOWN', () => {
    const modifier: ModifierValue = {
      modifierId: 'MOD-number',
      state: 'KNOWN',
      value: 'not-a-number',
      provenance: {
        sourceType: 'USER_ENTERED',
        recordedAt: '2026-09-16T00:00:00Z',
        confirmationStatus: 'CONFIRMED',
      },
    };
    const [normalized] = normalizeModifierValues([modifier], {
      'MOD-number': { id: 'MOD-number', label: 'Synthetic number', inputType: 'number' },
    });
    expect(normalized?.state).toBe('UNKNOWN');
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

  it('allows a structured continue result only in the approved production renderer', () => {
    const result = renderPatientInstruction(event({ disposition: 'CONTINUE', reasonCodes: [], ruleRefs: [{ id: 'RULE-synthetic', version: 1 }] }));
    expect(result.allowed).toBe(true);
  });

  it('always blocks patient output for shadow clinical-review content', () => {
    const result = blockedShadowPatientInstruction();
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('SHADOW_CONTENT_NOT_CLINICALLY_APPROVED');
  });
});
