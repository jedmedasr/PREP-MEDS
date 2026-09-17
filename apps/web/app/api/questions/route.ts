import { NextResponse } from 'next/server';
import type { MedicationContext, ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex } from '@prep-meds/terminology';
import { activeRules, modifierDefinitions, terminologyDataset } from '@/lib/content';
import { deriveRequiredQuestions } from '@/lib/workflow';

const index = new TerminologyIndex(terminologyDataset);
const procedures = new Set<ProcedureCode>(['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY']);

interface QuestionRequest {
  medicationId?: string;
  procedureCode?: ProcedureCode;
}

export async function POST(request: Request) {
  const body = (await request.json()) as QuestionRequest;
  const medication = body.medicationId ? index.getMedicationById(body.medicationId) : null;

  if (!medication || !body.procedureCode || !procedures.has(body.procedureCode)) {
    return NextResponse.json({ error: 'INVALID_WORKFLOW_CONTEXT' }, { status: 400 });
  }

  const medicationContext: MedicationContext = {
    medicationId: medication.id,
    ingredientIds: medication.ingredientIds,
    drugClassIds: medication.drugClassIds ?? [],
  };

  const questions = deriveRequiredQuestions({
    rules: activeRules,
    medication: medicationContext,
    procedureCode: body.procedureCode,
    definitions: modifierDefinitions,
  });

  return NextResponse.json({
    questions,
    contentState: activeRules.length === 0 ? 'NO_ACTIVE_CLINICAL_RULES' : 'ACTIVE_RULES_AVAILABLE',
  });
}
