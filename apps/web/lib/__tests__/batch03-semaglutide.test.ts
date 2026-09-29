import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const explicitIds = [
  'MED-semaglutide-ozempic-injection',
  'MED-semaglutide-ozempic-oral',
  'MED-semaglutide-rybelsus-oral',
  'MED-semaglutide-wegovy-injection',
  'MED-semaglutide-wegovy-oral',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error(`Missing semaglutide fixture: ${medicationId}`);

  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-B3-SEMAGLUTIDE-${medicationId}-${procedureCode}`,
    occurredAt: '2026-09-27T06:20:00Z',
    engineVersion: 'batch-03-semaglutide-guard-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B3-SEMAGLUTIDE',
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

describe('Batch 03 semaglutide terminology ambiguity', () => {
  it('assembles a valid catalog while preserving bare semaglutide ambiguity', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    const result = index.resolve('semaglutide');
    expect(result.status).toBe('AMBIGUOUS');
    expect(result.medication).toBeUndefined();
    expect(result.ingredientIds).toEqual([]);
  });

  it.each(['Ozempic', 'Wegovy'])('keeps route-unspecified brand %s ambiguous', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
    }
  });

  it('resolves the uniquely oral Rybelsus identity', () => {
    expect(index.resolve('Rybelsus').medication?.id).toBe('MED-semaglutide-rybelsus-oral');
    expect(index.resolve('Rybelsus oral').medication?.id).toBe('MED-semaglutide-rybelsus-oral');
  });

  it.each([
    ['Ozempic injection', 'MED-semaglutide-ozempic-injection'],
    ['Ozempic oral', 'MED-semaglutide-ozempic-oral'],
    ['Wegovy injection', 'MED-semaglutide-wegovy-injection'],
    ['Wegovy oral', 'MED-semaglutide-wegovy-oral'],
  ])('resolves explicit product/route wording %s', (query, expectedId) => {
    expect(index.resolve(query).medication?.id).toBe(expectedId);
  });
});

describe('Batch 03 semaglutide explicit products cannot bypass GLP-1 review', () => {
  it('keeps production rules empty', () => {
    expect(activeRules).toEqual([]);
  });

  it('scopes the review guard to every explicit semaglutide product identity', () => {
    const guard = clinicalReviewRules.find((rule) => rule.id === 'RULE-B3-SEMAGLUTIDE-PRODUCT-REVIEW-001');
    expect(guard?.scope.medicationIds).toEqual([...explicitIds]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.status).toBe('TECHNICALLY_TESTED');
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of explicitIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B3-SEMAGLUTIDE-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
