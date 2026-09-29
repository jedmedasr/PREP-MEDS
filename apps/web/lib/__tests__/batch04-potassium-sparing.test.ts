import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const medicationIds = ['MED-spironolactone-tablet','MED-spironolactone-carospir-suspension','MED-eplerenone-tablet','MED-amiloride-tablet','MED-triamterene-dyrenium-capsule','MED-spironolactone-hydrochlorothiazide-tablet','MED-amiloride-hydrochlorothiazide-tablet','MED-triamterene-hydrochlorothiazide-capsule','MED-triamterene-hydrochlorothiazide-tablet'] as const;
function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 potassium-sparing/MRA fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-KSPARING-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T10:46:00Z', engineVersion: 'batch-04-potassium-sparing-review-test', mode: 'VALIDATION',
    context: { organizationId: 'ORG-SYNTHETIC-B4-KSPARING', procedureCode, medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] }, modifiers: [] },
    rules: clinicalReviewRules, policies: [],
  }).event;
}
describe('Batch 04 potassium-sparing/MRA terminology', () => {
  it('assembles valid terminology and preserves nine identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of medicationIds) expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-potassium-sparing-diuretic');
  });
  it.each(['spironolactone', 'amiloride', 'triamterene'])('fails bare wording %s closed across products', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS'); expect(result.medication).toBeUndefined(); expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each([
    ['spironolactone tablet','MED-spironolactone-tablet'],['CAROSPIR','MED-spironolactone-carospir-suspension'],['eplerenone','MED-eplerenone-tablet'],
    ['amiloride tablet','MED-amiloride-tablet'],['DYRENIUM','MED-triamterene-dyrenium-capsule'],['spironolactone/HCTZ','MED-spironolactone-hydrochlorothiazide-tablet'],
    ['amiloride/HCTZ','MED-amiloride-hydrochlorothiazide-tablet'],['triamterene/HCTZ capsule','MED-triamterene-hydrochlorothiazide-capsule'],['triamterene/HCTZ tablet','MED-triamterene-hydrochlorothiazide-tablet'],
  ])('resolves explicit wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query); expect(result.status).toBe('RESOLVED'); expect(result.medication?.id).toBe(expectedId);
  });
  it('keeps bare HCTZ on the existing single-ingredient identity', () => {
    expect(index.resolve('HCTZ').medication?.id).toBe('MED-hydrochlorothiazide');
  });
});
describe('Batch 04 potassium-sparing/MRA review routing', () => {
  it('keeps production rules empty and review routing timing-free', () => {
    expect(activeRules).toEqual([]);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-POTASSIUM-SPARING-MRA-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...medicationIds]); expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rule?.timingRule).toBeUndefined();
  });
  it.each(procedures)('routes every explicit identity to clinician review for %s', (procedureCode) => {
    for (const medicationId of medicationIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-POTASSIUM-SPARING-MRA-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
