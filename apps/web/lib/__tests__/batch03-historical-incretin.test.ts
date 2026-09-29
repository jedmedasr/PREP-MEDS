import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const historicalIds = [
  'MED-lixisenatide-adlyxin',
  'MED-albiglutide-tanzeum',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing historical incretin fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-HISTORICAL-INCRETIN-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-29T06:35:00Z',
    engineVersion: 'batch-03-historical-incretin-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-HISTORICAL-INCRETIN',
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

describe('Batch 03 historical standalone incretin terminology', () => {
  it('assembles a valid catalog with lixisenatide and albiglutide ingredient identity', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.some((ingredient) => ingredient.id === 'ING-lixisenatide')).toBe(true);
    expect(terminologyDataset.ingredients.some((ingredient) => ingredient.id === 'ING-albiglutide')).toBe(true);
  });

  it.each(['lixisenatide', 'albiglutide'])(
    'keeps bare %s product identity ambiguous',
    (query) => {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        expect(result.status).toBe('AMBIGUOUS');
        expect(result.medication).toBeUndefined();
        expect(result.ingredientIds).toEqual([]);
      }
    },
  );

  it.each([
    ['Adlyxin', 'MED-lixisenatide-adlyxin'],
    ['Adlyxin lixisenatide', 'MED-lixisenatide-adlyxin'],
    ['Tanzeum', 'MED-albiglutide-tanzeum'],
    ['Tanzeum albiglutide', 'MED-albiglutide-tanzeum'],
  ])('resolves explicit historical product wording %s to %s', (query, expectedId) => {
    expect(index.resolve(query).medication?.id).toBe(expectedId);
  });

  it('preserves component identity without implying current availability', () => {
    expect(index.getMedicationById('MED-lixisenatide-adlyxin')?.ingredientIds).toEqual(['ING-lixisenatide']);
    expect(index.getMedicationById('MED-albiglutide-tanzeum')?.ingredientIds).toEqual(['ING-albiglutide']);
  });
});

describe('Batch 03 historical standalone incretins remain review-only', () => {
  it('keeps production rules empty and the historical guard timing-free', () => {
    expect(activeRules).toEqual([]);
    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B3-HISTORICAL-GLP1-PRODUCT-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...historicalIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-GLP1-HIGH-RISK-REVIEW-2024', version: 1 },
    ]);
  });

  it.each(procedures)('routes both historical products to review for %s with no timing', (procedureCode) => {
    for (const medicationId of historicalIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({
        id: 'RULE-B3-HISTORICAL-GLP1-PRODUCT-REVIEW-001',
        version: 1,
      });
    }
  });
});
