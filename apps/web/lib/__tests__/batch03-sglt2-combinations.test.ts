import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD','COLONOSCOPY','EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-empagliflozin-linagliptin-glyxambi',
  'MED-dapagliflozin-metformin-xigduo-xr',
  'MED-ertugliflozin-metformin-segluromet',
  'MED-ertugliflozin-sitagliptin-steglujan',
  'MED-empagliflozin-metformin-synjardy',
  'MED-empagliflozin-metformin-synjardy-xr',
  'MED-empagliflozin-linagliptin-metformin-trijardy-xr',
  'MED-canagliflozin-metformin-invokamet',
  'MED-canagliflozin-metformin-invokamet-xr',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing SGLT2 combination fixture: ${medicationId}`);
  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-SGLT2-COMBO-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-29T02:01:30Z',
    engineVersion: 'batch-03-sglt2-combination-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-SGLT2-COMBO',
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

describe('Batch 03 verified SGLT2 combinations', () => {
  it('assembles valid terminology and resolves explicit brands', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(index.resolve('Glyxambi').medication?.id).toBe('MED-empagliflozin-linagliptin-glyxambi');
    expect(index.resolve('Xigduo XR').medication?.id).toBe('MED-dapagliflozin-metformin-xigduo-xr');
    expect(index.resolve('Segluromet').medication?.id).toBe('MED-ertugliflozin-metformin-segluromet');
    expect(index.resolve('Steglujan').medication?.id).toBe('MED-ertugliflozin-sitagliptin-steglujan');
    expect(index.resolve('Synjardy').medication?.id).toBe('MED-empagliflozin-metformin-synjardy');
    expect(index.resolve('Synjardy XR').medication?.id).toBe('MED-empagliflozin-metformin-synjardy-xr');
    expect(index.resolve('Trijardy XR').medication?.id).toBe('MED-empagliflozin-linagliptin-metformin-trijardy-xr');
    expect(index.resolve('Invokamet').medication?.id).toBe('MED-canagliflozin-metformin-invokamet');
    expect(index.resolve('Invokamet XR').medication?.id).toBe('MED-canagliflozin-metformin-invokamet-xr');
  });

  it('preserves formulation/component identity and fails closed for generic release-unspecified INVOKAMET wording', () => {
    expect(index.getMedicationById('MED-dapagliflozin-metformin-xigduo-xr')?.ingredientIds).toEqual(['ING-dapagliflozin','ING-metformin']);
    expect(index.getMedicationById('MED-ertugliflozin-metformin-segluromet')?.ingredientIds).toEqual(['ING-ertugliflozin','ING-metformin']);
    expect(index.getMedicationById('MED-empagliflozin-linagliptin-glyxambi')?.ingredientIds).toEqual(['ING-empagliflozin','ING-linagliptin']);
    expect(index.getMedicationById('MED-ertugliflozin-sitagliptin-steglujan')?.ingredientIds).toEqual(['ING-ertugliflozin','ING-sitagliptin']);
    expect(index.getMedicationById('MED-empagliflozin-metformin-synjardy')?.ingredientIds).toEqual(['ING-empagliflozin','ING-metformin']);
    expect(index.getMedicationById('MED-empagliflozin-metformin-synjardy-xr')?.ingredientIds).toEqual(['ING-empagliflozin','ING-metformin']);
    expect(index.getMedicationById('MED-empagliflozin-linagliptin-metformin-trijardy-xr')?.ingredientIds).toEqual(['ING-empagliflozin','ING-linagliptin','ING-metformin']);
    expect(index.getMedicationById('MED-canagliflozin-metformin-invokamet')?.ingredientIds).toEqual(['ING-canagliflozin','ING-metformin']);
    expect(index.getMedicationById('MED-canagliflozin-metformin-invokamet-xr')?.ingredientIds).toEqual(['ING-canagliflozin','ING-metformin']);
    expect(index.resolve('canagliflozin and metformin hydrochloride').status).toBe('AMBIGUOUS');
  });
});

describe('Batch 03 SGLT2 combinations remain review-only', () => {
  it('keeps production rules empty and review guard timing-free', () => {
    expect(activeRules).toEqual([]);
    const guard = clinicalReviewRules.find((r) => r.id === 'RULE-B3-SGLT2-COMBINATION-PRODUCT-REVIEW-001');
    expect(guard?.scope.medicationIds).toEqual([...medicationIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes all nine products to review for %s with no timing', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event=evaluate(medicationId,procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
