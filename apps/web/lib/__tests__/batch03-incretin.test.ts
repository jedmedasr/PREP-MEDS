import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];

const tirzepatideIds = [
  'MED-tirzepatide-mounjaro',
  'MED-tirzepatide-zepbound',
] as const;

const glp1Ids = [
  'MED-exenatide-byetta',
  'MED-exenatide-bydureon-bcise',
  'MED-liraglutide-victoza',
  'MED-liraglutide-saxenda',
  'MED-liraglutide-generic-weight-management',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing Batch 03 incretin fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-INCRETIN-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-27T06:35:00Z',
    engineVersion: 'batch-03-incretin-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-INCRETIN',
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

describe('Batch 03 incretin terminology ambiguity', () => {
  it('assembles a valid terminology dataset with new ingredient records', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const ingredientId of ['ING-tirzepatide', 'ING-exenatide', 'ING-liraglutide']) {
      expect(terminologyDataset.ingredients.some((ingredient) => ingredient.id === ingredientId)).toBe(true);
    }
  });

  it.each(['tirzepatide', 'exenatide', 'liraglutide'])(
    'keeps bare %s product/formulation identity ambiguous',
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
    ['Mounjaro', 'MED-tirzepatide-mounjaro'],
    ['Zepbound', 'MED-tirzepatide-zepbound'],
    ['Byetta', 'MED-exenatide-byetta'],
    ['Bydureon BCise', 'MED-exenatide-bydureon-bcise'],
    ['Victoza', 'MED-liraglutide-victoza'],
    ['Saxenda', 'MED-liraglutide-saxenda'],
    ['liraglutide weight management', 'MED-liraglutide-generic-weight-management'],
  ])('resolves explicit product wording %s to %s', (query, expectedId) => {
    expect(index.resolve(query).medication?.id).toBe(expectedId);
  });

  it('preserves exenatide immediate- versus extended-release distinction', () => {
    expect(index.resolve('exenatide immediate release').medication?.id).toBe('MED-exenatide-byetta');
    expect(index.resolve('exenatide extended release').medication?.id).toBe('MED-exenatide-bydureon-bcise');
  });
});

describe('Batch 03 incretin products cannot bypass review', () => {
  it('keeps production rules empty', () => {
    expect(activeRules).toEqual([]);
  });

  it('uses tirzepatide-specific label evidence for the tirzepatide guard', () => {
    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B3-TIRZEPATIDE-PRODUCT-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...tirzepatideIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-B3-MOUNJARO-PROCEDURE-REVIEW', version: 1 },
      { id: 'EVD-B3-ZEPBOUND-PROCEDURE-REVIEW', version: 1 },
    ]);
  });

  it('uses the multisociety GLP-1 review evidence only for GLP-1 product identities', () => {
    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B3-GLP1-PRODUCT-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...glp1Ids]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-GLP1-HIGH-RISK-REVIEW-2024', version: 1 },
    ]);
  });

  it.each(procedures)('routes every explicit incretin identity to review for %s', (procedureCode) => {
    for (const medicationId of [...tirzepatideIds, ...glp1Ids]) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
