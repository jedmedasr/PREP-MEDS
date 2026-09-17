import { NextResponse } from 'next/server';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex } from '@prep-meds/terminology';
import { activePolicies, activeRules, terminologyDataset } from '@/lib/content';
import { renderPatientInstruction } from '@/lib/workflow';

const index = new TerminologyIndex(terminologyDataset);
const procedures = new Set<ProcedureCode>(['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY']);

interface DecisionRequestPayload {
  medicationId?: string;
  procedureCode?: ProcedureCode;
  organizationId?: string;
  siteId?: string;
  modifiers?: ModifierValue[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as DecisionRequestPayload;
  const medication = body.medicationId ? index.getMedicationById(body.medicationId) : null;

  if (!medication || !body.procedureCode || !procedures.has(body.procedureCode)) {
    return NextResponse.json({ error: 'INVALID_DECISION_CONTEXT' }, { status: 400 });
  }

  const occurredAt = new Date().toISOString();
  const execution = evaluateDecision({
    decisionEventId: `DEC-${crypto.randomUUID()}`,
    occurredAt,
    actorRole: 'MA',
    engineVersion: 'stage-08-web-1',
    mode: 'PRODUCTION',
    context: {
      organizationId: body.organizationId?.trim() || 'ORG-DEMO',
      ...(body.siteId?.trim() ? { siteId: body.siteId.trim() } : {}),
      procedureCode: body.procedureCode,
      medication: {
        medicationId: medication.id,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers: body.modifiers ?? [],
    },
    rules: activeRules,
    policies: activePolicies,
  });

  return NextResponse.json({
    execution,
    patientInstruction: renderPatientInstruction(execution.event),
    clinicalContentState: activeRules.length === 0 ? 'NO_ACTIVE_CLINICAL_RULES' : 'ACTIVE_RULES_AVAILABLE',
  });
}
