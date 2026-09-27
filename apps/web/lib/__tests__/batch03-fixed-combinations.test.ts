import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const fixedCombinationIds = [
  'MED-insulin-glargine-lixisenatide-soliqua',
  'MED-insulin-degludec-liraglutide-xultophy',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing Batch 03 fixed-combination fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-FIXED-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-27T10:05:00Z',
    engineVersion: 'batch-03-fixed-combination-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-FIXED',
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

describe('Batch 03 fixed insulin/GLP-1 combination terminology', () => {
  it('assembles valid terminology with lixisenatide and source-linked fixed combinations', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(terminologyDataset.ingredients.some((item) => item.id === 'ING-lixisenatide')).toBe(true);

    expect(index.resolve('Soliqua').medication?.id).toBe('MED-insulin-glargine-lixisenatide-soliqua');
    expect(index.resolve('Soliqua 100/33').medication?.id).toBe('MED-insulin-glargine-lixisenatide-soliqua');
    expect(index.resolve('Xultophy').medication?.id).toBe('MED-insulin-degludec-liraglutide-xultophy');
    expect(index.resolve('Xultophy 100/3.6').medication?.id).toBe('MED-insulin-degludec-liraglutide-xultophy');
  });

  it('preserves both ingredients and both clinical class boundaries per fixed product', () => {
    expect(index.getMedicationById('MED-insulin-glargine-lixisenatide-soliqua')?.ingredientIds).toEqual([
      'ING-insulin-glargine',
      'ING-lixisenatide',
    ]);
    expect(index.getMedicationById('MED-insulin-degludec-liraglutide-xultophy')?.ingredientIds).toEqual([
      'ING-insulin-degludec',
      'ING-liraglutide',
    ]);

    for (const id of fixedCombinationIds) {
      expect(index.getMedicationById(id)?.drugClassIds).toEqual([
        'CLS-basal-insulin',
        'CLS-glp1-receptor-agonist',
      ]);
    }
  });
});

describe('Batch 03 fixed insulin/GLP-1 combinations cannot bypass review', () => {
  it('keeps production rules empty and the guard timing-free', () => {
    expect(activeRules).toEqual([]);
    const guard = clinicalReviewRules.find(
      (rule) => rule.id === 'RULE-B3-FIXED-INSULIN-GLP1-PRODUCT-REVIEW-001',
    );
    expect(guard?.scope.medicationIds).toEqual([...fixedCombinationIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-B3-SOLIQUA-PROCEDURE-REVIEW', version: 1 },
      { id: 'EVD-B3-XULTOPHY-PROCEDURE-REVIEW', version: 1 },
    ]);
  });

  it.each(procedures)('routes both fixed combinations to review for %s without timing', (procedureCode) => {
    for (const medicationId of fixedCombinationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
