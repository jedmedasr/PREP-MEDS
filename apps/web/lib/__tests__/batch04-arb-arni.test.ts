import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const arbIds = ['MED-losartan', 'MED-valsartan', 'MED-irbesartan', 'MED-candesartan', 'MED-olmesartan', 'MED-telmisartan'] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 ARB/ARNI fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-ARB-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T07:55:00Z',
    engineVersion: 'batch-04-arb-arni-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-RAAS',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [{ modifierId: 'MOD-raas-indication', state: 'KNOWN', value: 'OTHER_UNCLEAR' }],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 ARB/ARNI terminology', () => {
  it('assembles valid terminology with an indivisible ARNI identity', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of arbIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-arb');
    }
    const arni = index.getMedicationById('MED-sacubitril-valsartan');
    expect(arni?.ingredientIds).toEqual(['ING-sacubitril', 'ING-valsartan']);
    expect(arni?.drugClassIds).toEqual(['CLS-arni']);
  });

  it.each([
    ['losartan potassium', 'MED-losartan'],
    ['valsartan', 'MED-valsartan'],
    ['irbesartan', 'MED-irbesartan'],
    ['candesartan cilexetil', 'MED-candesartan'],
    ['olmesartan medoxomil', 'MED-olmesartan'],
    ['telmisartan', 'MED-telmisartan'],
    ['sacubitril/valsartan', 'MED-sacubitril-valsartan'],
    ['sacubitril and valsartan', 'MED-sacubitril-valsartan'],
  ])('resolves %s without splitting product identity', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 ARB/ARNI review routing', () => {
  it('keeps production empty and both guards timing-free', () => {
    expect(activeRules).toEqual([]);
    const arb = clinicalReviewRules.find((rule) => rule.id === 'RULE-B4-ARB-POLICY-REVIEW-001');
    expect(arb?.scope.medicationIds).toEqual([...arbIds]);
    expect(arb?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arb?.timingRule).toBeUndefined();
    const arni = clinicalReviewRules.find((rule) => rule.id === 'RULE-B4-ARNI-PRODUCT-REVIEW-001');
    expect(arni?.scope.medicationIds).toEqual(['MED-sacubitril-valsartan']);
    expect(arni?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(arni?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every ARB to local-policy review for %s', (procedureCode) => {
    for (const medicationId of arbIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('LOCAL_POLICY_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
    }
  });

  it.each(procedures)('fails sacubitril/valsartan closed to local-policy review for %s', (procedureCode) => {
    const event = evaluate('MED-sacubitril-valsartan', procedureCode);
    expect(event.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(event.outputSnapshot.timingRule).toBeUndefined();
    expect(event.reasonCodes).toContain('REQUIRED_POLICY_NOT_RESOLVED');
    expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-ARNI-PRODUCT-REVIEW-001', version: 1 });
  });
});
