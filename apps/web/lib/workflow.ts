import {
  scopeMatches,
  type ClinicalRule,
  type DecisionEvent,
  type MedicationContext,
  type ModifierValue,
  type ProcedureCode,
} from '@prep-meds/clinical-engine';
import type { UiModifierDefinition } from './content';

export interface WorkflowQuestion extends UiModifierDefinition {
  required: true;
}

export function deriveRequiredQuestions(args: {
  rules: ClinicalRule[];
  medication: MedicationContext;
  procedureCode: ProcedureCode;
  definitions: Record<string, UiModifierDefinition>;
  existingModifiers?: ModifierValue[];
  includeReviewCandidates?: boolean;
}): WorkflowQuestion[] {
  const context = {
    organizationId: 'question-discovery',
    procedureCode: args.procedureCode,
    medication: args.medication,
    modifiers: args.existingModifiers ?? [],
  };

  const requiredIds = new Set<string>();
  for (const rule of args.rules) {
    const eligibleStatus = args.includeReviewCandidates
      ? !['SUPERSEDED', 'RETIRED'].includes(rule.status)
      : rule.status === 'ACTIVE';
    if (!eligibleStatus) continue;
    if (!scopeMatches(rule.scope, context)) continue;
    rule.requiredModifierIds.forEach((id) => requiredIds.add(id));
  }

  return [...requiredIds]
    .sort((a, b) => a.localeCompare(b))
    .map((id) => args.definitions[id])
    .filter((definition): definition is UiModifierDefinition => Boolean(definition))
    .map((definition) => ({ ...definition, required: true as const }));
}

export function normalizeModifierValues(
  modifiers: ModifierValue[],
  definitions: Record<string, UiModifierDefinition>,
): ModifierValue[] {
  return modifiers.map((modifier) => {
    if (modifier.state !== 'KNOWN') return modifier;
    const definition = definitions[modifier.modifierId];
    if (!definition) return modifier;

    if (definition.inputType === 'number') {
      const parsed = typeof modifier.value === 'number' ? modifier.value : Number(modifier.value);
      if (!Number.isFinite(parsed)) {
        return {
          ...modifier,
          state: 'UNKNOWN',
          value: undefined,
          provenance: modifier.provenance
            ? { ...modifier.provenance, confirmationStatus: 'UNCONFIRMED' }
            : undefined,
        } as ModifierValue;
      }
      return { ...modifier, value: parsed };
    }

    if (definition.inputType === 'boolean' && typeof modifier.value === 'string') {
      if (modifier.value === 'true') return { ...modifier, value: true };
      if (modifier.value === 'false') return { ...modifier, value: false };
      return {
        ...modifier,
        state: 'UNKNOWN',
        value: undefined,
        provenance: modifier.provenance
          ? { ...modifier.provenance, confirmationStatus: 'UNCONFIRMED' }
          : undefined,
      } as ModifierValue;
    }

    return modifier;
  });
}

export function isActionableDisposition(disposition: DecisionEvent['disposition']): boolean {
  return disposition === 'CONTINUE' || disposition === 'HOLD_STANDARD' || disposition === 'CONDITIONAL';
}

export interface PatientInstructionView {
  allowed: boolean;
  heading: string;
  body: string;
  reason?: string;
}

export function blockedShadowPatientInstruction(): PatientInstructionView {
  return {
    allowed: false,
    heading: 'Patient instruction disabled in shadow mode',
    body: 'This result comes from clinical-review candidate content and must not be used as a finalized patient medication instruction.',
    reason: 'SHADOW_CONTENT_NOT_CLINICALLY_APPROVED',
  };
}

export function renderPatientInstruction(event: Readonly<DecisionEvent>): PatientInstructionView {
  if (!isActionableDisposition(event.disposition)) {
    return {
      allowed: false,
      heading: 'Patient instruction not available',
      body: 'A finalized medication instruction cannot be generated from this result.',
      reason: event.reasonCodes.join(', ') || event.disposition,
    };
  }

  if (event.disposition === 'HOLD_STANDARD' && !event.outputSnapshot.timingRule?.instructionCode) {
    return {
      allowed: false,
      heading: 'Patient instruction not available',
      body: 'The structured decision does not include an approved timing instruction.',
      reason: 'MISSING_TIMING_INSTRUCTION',
    };
  }

  if (event.disposition === 'CONTINUE') {
    return {
      allowed: true,
      heading: 'Medication instruction',
      body: 'Continue this medication according to the approved PREP-MEDS protocol shown in the clinical plan.',
    };
  }

  return {
    allowed: true,
    heading: 'Medication instruction',
    body: `Follow the approved medication plan identified by ${event.outputSnapshot.timingRule?.instructionCode ?? 'the structured clinical rule'}.`,
  };
}

export function modifierValueFromForm(args: {
  modifierId: string;
  rawValue: string | boolean | number | null;
  recordedAt: string;
}): ModifierValue {
  if (args.rawValue === null || args.rawValue === '') {
    return {
      modifierId: args.modifierId,
      state: 'UNKNOWN',
      provenance: {
        sourceType: 'USER_ENTERED',
        recordedAt: args.recordedAt,
        confirmationStatus: 'UNCONFIRMED',
      },
    };
  }

  return {
    modifierId: args.modifierId,
    state: 'KNOWN',
    value: args.rawValue,
    provenance: {
      sourceType: 'USER_ENTERED',
      recordedAt: args.recordedAt,
      confirmationStatus: 'CONFIRMED',
    },
  };
}
