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
}): WorkflowQuestion[] {
  const context = {
    organizationId: 'question-discovery',
    procedureCode: args.procedureCode,
    medication: args.medication,
    modifiers: args.existingModifiers ?? [],
  };

  const requiredIds = new Set<string>();
  for (const rule of args.rules) {
    if (rule.status !== 'ACTIVE') continue;
    if (!scopeMatches(rule.scope, context)) continue;
    rule.requiredModifierIds.forEach((id) => requiredIds.add(id));
  }

  return [...requiredIds]
    .sort((a, b) => a.localeCompare(b))
    .map((id) => args.definitions[id])
    .filter((definition): definition is UiModifierDefinition => Boolean(definition))
    .map((definition) => ({ ...definition, required: true as const }));
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

export function renderPatientInstruction(event: DecisionEvent): PatientInstructionView {
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
