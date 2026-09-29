import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const arbIds = [
  'MED-losartan',
  'MED-valsartan',
  'MED-irbesartan',
  'MED-candesartan',
  'MED-olmesartan',
  'MED-telmisartan',
] as const;
const arniIds = [
  'MED-sacubitril-valsartan',
  'MED-sacubitril-valsartan-entresto-tablet',
  'MED-sacubitril-valsartan-entresto-sprinkle',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 ARB/ARNI fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-RAAS-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T08:00:00Z',
    engineVersion: 'batch-04-arb-arni-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-RAAS',
      procedureCode,
      medication: {
        medicationId,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers: [{ modifierId: 'MOD-raas-indication', state: 'KNOWN', value: 'OTHER_UNCLEAR' }],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 ARB/ARNI terminology', () => {
  it('assembles valid terminology with three indivisible ARNI source/form identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of arbIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-arb');
    }
    for (const medicationId of arniIds) {
      const medication = index.getMedicationById(medicationId);
      expect(medication?.ingredientIds).toEqual(['ING-sacubitril', 'ING-valsartan']);
      expect(medication?.drugClassIds).toEqual(['CLS-arni']);
    }
  });

  it.each([
    ['losartan potassium', 'MED-losartan'],
    ['valsartan', 'MED-valsartan'],
    ['irbesartan', 'MED-irbesartan'],
    ['candesartan cilexetil', 'MED-candesartan'],
    ['olmesartan medoxomil', 'MED-olmesartan'],
    ['telmisartan', 'MED-telmisartan'],
  ])('resolves generic ARB wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });

  it('fails source/formulation-unspecified ARNI wording closed', () => {
    for (const query of ['Entresto', 'sacubitril and valsartan', 'sacubitril/valsartan']) {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        expect(result.status).toBe('AMBIGUOUS');
        expect(result.medication).toBeUndefined();
        expect(result.ingredientIds).toEqual([]);
      }
    }
  });

  it.each([
    ['Novugen sacubitril valsartan tablet', 'MED-sacubitril-valsartan'],
    ['ANDA213611', 'MED-sacubitril-valsartan'],
    ['Entresto tablet', 'MED-sacubitril-valsartan-entresto-tablet'],
    ['NDA207620', 'MED-sacubitril-valsartan-entresto-tablet'],
    ['Entresto Sprinkle', 'MED-sacubitril-valsartan-entresto-sprinkle'],
    ['Entresto oral pellets', 'MED-sacubitril-valsartan-entresto-sprinkle'],
    ['NDA218591', 'MED-sacubitril-valsartan-entresto-sprinkle'],
  ])('resolves explicit ARNI source/formulation wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 ARB/ARNI review routing', () => {
  it('keeps production empty and both class/product guards timing-free', () => {
    expect(activeRules).toEqual([]);
    const arb = clinicalReviewRules.find((rule) => rule.id === 'RULE-B4-ARB-POLICY-REVIEW-001');
    expect(arb?.scope.medicationIds).toEqual([...arbIds]);
    expect(arb?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arb?.timingRule).toBeUndefined();
    expect(arb?.policyDependencyIds).toEqual(['POLICY-ANESTHESIA-RAAS']);

    const arni = clinicalReviewRules.find((rule) => rule.id === 'RULE-B4-ARNI-POLICY-REVIEW-001');
    expect(arni?.scope.medicationIds).toEqual([...arniIds]);
    expect(arni?.disposition).toBe('LOCAL_POLICY_REQUIRED');
    expect(arni?.timingRule).toBeUndefined();
    expect(arni?.policyDependencyIds).toEqual(['POLICY-ANESTHESIA-RAAS']);
  });

  it.each(procedures)('routes every ARB to local-policy review for %s', (procedureCode) => {
    for (const medicationId of arbIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('LOCAL_POLICY_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-ARB-POLICY-REVIEW-001', version: 1 });
    }
  });

  it.each(procedures)('routes every source/formulation-specific ARNI identity to local-policy review for %s', (procedureCode) => {
    for (const medicationId of arniIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('LOCAL_POLICY_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-ARNI-POLICY-REVIEW-001', version: 1 });
    }
  });
});
