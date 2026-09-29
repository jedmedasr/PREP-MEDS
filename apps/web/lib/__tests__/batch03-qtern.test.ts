import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-dapagliflozin-saxagliptin-qtern',
  'MED-dapagliflozin-saxagliptin-generic-anda211533',
  'MED-dapagliflozin-saxagliptin-generic-anda211537',
] as const;
const qternmetMedicationId = 'MED-dapagliflozin-saxagliptin-metformin-qternmet-xr' as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing QTERN reconciliation fixture: ${medicationId}`);
  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-QTERN-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-29T02:21:25Z',
    engineVersion: 'batch-03-qtern-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-QTERN',
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

describe('Batch 03 QTERN / dapagliflozin+saxagliptin terminology', () => {
  it('assembles valid terminology and resolves explicit source identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(index.resolve('Qtern').medication?.id).toBe('MED-dapagliflozin-saxagliptin-qtern');
    expect(index.resolve('ANDA211533').medication?.id).toBe('MED-dapagliflozin-saxagliptin-generic-anda211533');
    expect(index.resolve('ANDA211537').medication?.id).toBe('MED-dapagliflozin-saxagliptin-generic-anda211537');
    expect(index.resolve('Torrent dapagliflozin saxagliptin').medication?.id).toBe('MED-dapagliflozin-saxagliptin-generic-anda211537');
  });

  it('fails closed for product-unspecified dapagliflozin+saxagliptin wording', () => {
    const generic = index.resolve('dapagliflozin and saxagliptin');
    expect(generic.status).toBe('AMBIGUOUS');
    for (const medicationId of medicationIds) {
      expect(index.getMedicationById(medicationId)?.ingredientIds).toEqual(['ING-dapagliflozin', 'ING-saxagliptin']);
    }
  });

  it('resolves explicit QTERNMET XR while release-unspecified triple-combination wording fails closed', () => {
    expect(index.resolve('Qternmet XR').medication?.id).toBe(qternmetMedicationId);
    expect(index.resolve('dapagliflozin, saxagliptin, and metformin hydrochloride extended-release').medication?.id).toBe(qternmetMedicationId);
    expect(index.resolve('dapagliflozin saxagliptin metformin').status).toBe('AMBIGUOUS');
    expect(index.getMedicationById(qternmetMedicationId)?.ingredientIds).toEqual(['ING-dapagliflozin', 'ING-saxagliptin', 'ING-metformin']);
  });
});

describe('Batch 03 QTERN reconciliation remains review-only', () => {
  it('keeps production rules empty and both QTERN guards timing-free', () => {
    expect(activeRules).toEqual([]);
    const guard = clinicalReviewRules.find((rule) => rule.id === 'RULE-B3-DAPA-SAXA-PRODUCT-REVIEW-001');
    expect(guard?.scope.medicationIds).toEqual([...medicationIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    const qternmetGuard = clinicalReviewRules.find((rule) => rule.id === 'RULE-B3-QTERNMET-XR-PRODUCT-REVIEW-001');
    expect(qternmetGuard?.scope.medicationIds).toEqual([qternmetMedicationId]);
    expect(qternmetGuard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(qternmetGuard?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes all reconciled identities to review for %s with no timing', (procedureCode) => {
    for (const medicationId of [...medicationIds, qternmetMedicationId]) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });
});
