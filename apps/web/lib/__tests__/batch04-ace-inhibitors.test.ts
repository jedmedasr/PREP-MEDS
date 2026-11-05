import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const aceMedicationIds = [
  'MED-lisinopril',
  'MED-enalapril',
  'MED-benazepril',
  'MED-ramipril',
  'MED-captopril',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing Batch 04 ACE inhibitor fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B4-ACE-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-29T07:40:00Z',
    engineVersion: 'batch-04-ace-policy-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-ACE',
      procedureCode,
      medication: {
        medicationId,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers: [
        {
          modifierId: 'MOD-raas-indication',
          state: 'KNOWN',
          value: 'OTHER_UNCLEAR',
        },
      ],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 ACE inhibitor terminology', () => {
  it('assembles valid terminology for the five-drug ACE core', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of aceMedicationIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-ace-inhibitor');
    }
  });

  it.each([
    ['lisinopril', 'MED-lisinopril'],
    ['enalapril', 'MED-enalapril'],
    ['enalapril maleate', 'MED-enalapril'],
    ['benazepril', 'MED-benazepril'],
    ['benazepril hydrochloride', 'MED-benazepril'],
    ['ramipril', 'MED-ramipril'],
    ['captopril', 'MED-captopril'],
  ])('resolves generic ACE inhibitor wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 ACE inhibitor policy routing', () => {
  it('keeps production rules empty and replaces the legacy lisinopril shadow guard', () => {
    expect(activeRules).toEqual([]);
    expect(clinicalReviewRules.some((rule) => rule.id === 'RULE-LISINOPRIL-POLICY-001')).toBe(false);

    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B4-ACE-INHIBITOR-POLICY-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...aceMedicationIds]);
    expect(guard?.requiredModifierIds).toEqual(['MOD-raas-indication']);
    expect(guard?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.policyDependencyIds).toEqual(['POLICY-ANESTHESIA-RAAS']);
  });

  it.each(procedures)('routes every ACE inhibitor to local-policy review for %s with no timing', (procedureCode) => {
    for (const medicationId of aceMedicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('LOCAL_POLICY_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({
        id: 'RULE-B4-ACE-INHIBITOR-POLICY-REVIEW-001',
        version: 1,
      });
    }
  });
});
