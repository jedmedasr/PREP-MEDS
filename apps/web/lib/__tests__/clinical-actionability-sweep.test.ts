import { describe, expect, it } from 'vitest';
import { scopeMatches, type ProcedureCode } from '@prep-meds/clinical-engine';
import { clinicalReviewRules, modifierDefinitions, terminologyDataset } from '../content';

const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const actionable = new Set(['CONTINUE', 'HOLD_STANDARD', 'CONDITIONAL']);

describe('repository-wide clinical actionability sweep', () => {
  it('emits a machine-readable medication/procedure actionability matrix and validates question definitions', () => {
    const medications = [...new Map(terminologyDataset.medications.map((m) => [m.id, m])).values()];
    const rows = medications.flatMap((medication) =>
      procedures.map((procedureCode) => {
        const context = {
          organizationId: 'ACTIONABILITY_AUDIT',
          procedureCode,
          medication: {
            medicationId: medication.id,
            ingredientIds: medication.ingredientIds,
            drugClassIds: medication.drugClassIds ?? [],
          },
          modifiers: [],
        };
        const rules = clinicalReviewRules.filter((rule) => scopeMatches(rule.scope, context));
        const missingDefinitions = [...new Set(rules.flatMap((rule) => rule.requiredModifierIds))]
          .filter((id) => !modifierDefinitions[id])
          .sort();
        const dispositions = [...new Set(rules.map((rule) => rule.disposition))].sort();
        const statuses = [...new Set(rules.map((rule) => rule.status))].sort();
        const evidenceRefs = [...new Set(rules.flatMap((rule) => rule.evidenceRefs.map((ref) => `${ref.id}@${ref.version}`)))].sort();
        let classification = 'NO_RULE';
        if (rules.some((rule) => rule.disposition === 'CONTINUE')) classification = 'ACTIONABLE_CONTINUE_CANDIDATE';
        else if (rules.some((rule) => rule.disposition === 'HOLD_STANDARD')) classification = 'ACTIONABLE_HOLD_CANDIDATE';
        else if (rules.some((rule) => rule.disposition === 'CONDITIONAL')) classification = 'ACTIONABLE_CONDITIONAL_CANDIDATE';
        else if (rules.some((rule) => rule.disposition === 'LOCAL_POLICY_REQUIRED')) classification = 'JUSTIFIED_LOCAL_POLICY_CANDIDATE';
        else if (rules.some((rule) => rule.disposition === 'CLINICIAN_REVIEW_REQUIRED')) classification = 'REVIEW_ONLY_CANDIDATE';
        return {
          medicationId: medication.id,
          canonicalName: medication.canonicalName,
          procedureCode,
          classification,
          candidateRuleIds: rules.map((rule) => rule.id).sort(),
          dispositions,
          statuses,
          missingModifierDefinitions: missingDefinitions,
          evidenceRefs,
        };
      }),
    );

    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.classification] = (acc[row.classification] ?? 0) + 1;
      return acc;
    }, {});
    const recognizedMedicationCount = medications.length;
    const noRule = rows.filter((row) => row.classification === 'NO_RULE');
    const missingQuestionDefinitions = rows.filter((row) => row.missingModifierDefinitions.length > 0);
    const reviewOnly = rows.filter((row) => row.classification === 'REVIEW_ONLY_CANDIDATE');

    console.log('ACTIONABILITY_REPORT_JSON=' + JSON.stringify({
      generatedFor: 'PREP-MEDS shadow clinical-review assembly',
      recognizedMedicationCount,
      medicationProcedurePairCount: rows.length,
      counts,
      noRule,
      missingQuestionDefinitions,
      reviewOnly,
      rows,
    }));

    expect(missingQuestionDefinitions).toEqual([]);
    expect(rows.length).toBe(recognizedMedicationCount * procedures.length);
    expect(rows.filter((row) => actionable.has(row.dispositions[0] ?? '')).length).toBeGreaterThan(0);
  });
});
