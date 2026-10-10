import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = [
  'MED-digoxin-tablet', 'MED-digoxin-oral-solution', 'MED-digoxin-injection-solution',
  'MED-ivabradine-film-coated-tablet', 'MED-ivabradine-oral-solution',
  'MED-nitroglycerin-sublingual-tablet', 'MED-nitroglycerin-lingual-spray',
  'MED-nitroglycerin-transdermal-patch', 'MED-nitroglycerin-topical-ointment',
  'MED-isosorbide-dinitrate-oral-tablet', 'MED-isosorbide-dinitrate-sublingual-tablet',
  'MED-isosorbide-mononitrate-er-tablet', 'MED-ranolazine-er-tablet',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 05 other-cardiac fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B5-OTHER-CARDIAC-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T16:58:00Z', engineVersion: 'batch-05-other-cardiac-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-B5-OTHER-CARDIAC', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Batch 05 other-cardiac terminology', () => {
  it('assembles valid terminology and preserves thirteen identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)).toBeDefined();
  });

  it.each(['digoxin', 'ivabradine', 'Corlanor', 'nitroglycerin', 'isosorbide dinitrate', 'ISDN'])('fails bare %s closed across route/form identities', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['digoxin tablet', 'MED-digoxin-tablet'], ['digoxin oral solution', 'MED-digoxin-oral-solution'],
    ['digoxin injection', 'MED-digoxin-injection-solution'], ['Corlanor tablet', 'MED-ivabradine-film-coated-tablet'],
    ['Corlanor oral solution', 'MED-ivabradine-oral-solution'], ['Nitrostat', 'MED-nitroglycerin-sublingual-tablet'],
    ['nitroglycerin lingual spray', 'MED-nitroglycerin-lingual-spray'], ['nitroglycerin patch', 'MED-nitroglycerin-transdermal-patch'],
    ['Nitro-Bid', 'MED-nitroglycerin-topical-ointment'], ['isosorbide dinitrate oral tablet', 'MED-isosorbide-dinitrate-oral-tablet'],
    ['ISDN sublingual', 'MED-isosorbide-dinitrate-sublingual-tablet'], ['isosorbide mononitrate ER', 'MED-isosorbide-mononitrate-er-tablet'],
    ['ranolazine ER', 'MED-ranolazine-er-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 05 other-cardiac review routing', () => {
  it('keeps production rules empty and routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B5-OTHER-CARDIAC-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B5-OTHER-CARDIAC-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
