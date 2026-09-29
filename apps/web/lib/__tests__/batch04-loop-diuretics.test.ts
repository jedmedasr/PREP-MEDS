import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-furosemide-tablet',
  'MED-furosemide-oral-solution',
  'MED-furosemide-injection',
  'MED-furosemide-furoscix-readyflow',
  'MED-furosemide-furoscix-on-body-infusor',
  'MED-torsemide-tablet',
  'MED-torsemide-demadex-injection',
  'MED-bumetanide-tablet',
  'MED-bumetanide-injection',
  'MED-bumetanide-enbumyst-nasal-spray',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 loop-diuretic fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-LOOP-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T09:41:00Z',
    engineVersion: 'batch-04-loop-diuretic-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-LOOP',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 loop-diuretic terminology', () => {
  it('assembles valid terminology and preserves ten route/formulation identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-loop-diuretic');
    }
  });

  it.each(['furosemide', 'torsemide', 'bumetanide'])('fails bare loop-diuretic wording %s closed across route/formulation identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['furosemide tablet', 'MED-furosemide-tablet'],
    ['furosemide oral solution', 'MED-furosemide-oral-solution'],
    ['furosemide IV injection', 'MED-furosemide-injection'],
    ['FUROSCIX ReadyFlow', 'MED-furosemide-furoscix-readyflow'],
    ['FUROSCIX on-body infusor', 'MED-furosemide-furoscix-on-body-infusor'],
    ['torsemide tablet', 'MED-torsemide-tablet'],
    ['DEMADEX injection', 'MED-torsemide-demadex-injection'],
    ['bumetanide tablet', 'MED-bumetanide-tablet'],
    ['bumetanide injection', 'MED-bumetanide-injection'],
    ['ENBUMYST', 'MED-bumetanide-enbumyst-nasal-spray'],
  ])('resolves explicit loop-diuretic wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 loop-diuretic review routing', () => {
  it('keeps production rules empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-LOOP-DIURETIC-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit loop-diuretic identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-LOOP-DIURETIC-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
