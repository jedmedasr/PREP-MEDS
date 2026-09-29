import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const currentExpansionIds = [
  'MED-exenatide-generic-anda206697',
  'MED-orforglipron-foundayo',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing current incretin expansion fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-CURRENT-INCRETIN-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-29T07:00:00Z',
    engineVersion: 'batch-03-current-incretin-expansion-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-CURRENT-INCRETIN',
      procedureCode,
      medication: {
        medicationId,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers: [],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 03 current incretin expansion terminology', () => {
  it('assembles valid terminology with orforglipron identity', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.some((ingredient) => ingredient.id === 'ING-orforglipron')).toBe(true);
  });

  it('keeps bare exenatide and orforglipron product identity ambiguous', () => {
    for (const query of ['exenatide', 'orforglipron']) {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        expect(result.status).toBe('AMBIGUOUS');
        expect(result.medication).toBeUndefined();
        expect(result.ingredientIds).toEqual([]);
      }
    }
  });

  it.each([
    ['Amneal exenatide', 'MED-exenatide-generic-anda206697'],
    ['ANDA206697', 'MED-exenatide-generic-anda206697'],
    ['Foundayo', 'MED-orforglipron-foundayo'],
    ['Foundayo orforglipron', 'MED-orforglipron-foundayo'],
  ])('resolves explicit source-linked product wording %s to %s', (query, expectedId) => {
    expect(index.resolve(query).medication?.id).toBe(expectedId);
  });

  it('preserves route and ingredient distinctions', () => {
    expect(index.getMedicationById('MED-exenatide-generic-anda206697')?.ingredientIds).toEqual(['ING-exenatide']);
    expect(index.getMedicationById('MED-orforglipron-foundayo')?.ingredientIds).toEqual(['ING-orforglipron']);
  });
});

describe('Batch 03 current incretin expansion remains review-only', () => {
  it('keeps production rules empty and the product guard timing-free', () => {
    expect(activeRules).toEqual([]);
    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B3-CURRENT-INCRETIN-EXPANSION-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...currentExpansionIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-B3-EXENATIDE-ANDA206697-PROCEDURE-REVIEW', version: 1 },
      { id: 'EVD-B3-FOUNDAYO-PROCEDURE-REVIEW', version: 1 },
    ]);
  });

  it.each(procedures)('routes both products to review for %s with no timing', (procedureCode) => {
    for (const medicationId of currentExpansionIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({
        id: 'RULE-B3-CURRENT-INCRETIN-EXPANSION-REVIEW-001',
        version: 1,
      });
    }
  });
});
