import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ProcedureCode } from '@prep-meds/clinical-engine';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const betaBlockerIds = [
  'MED-metoprolol-tartrate',
  'MED-metoprolol-succinate-er',
  'MED-carvedilol',
  'MED-atenolol',
  'MED-propranolol',
  'MED-bisoprolol',
  'MED-nadolol',
  'MED-labetalol',
] as const;

function evaluate(medicationId: string, procedureCode: ProcedureCode) {
  const medication = index.getMedicationById(medicationId);
  if (!medication) throw new Error('Missing Batch 04 beta-blocker fixture: ' + medicationId);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-B4-BETA-' + medicationId + '-' + procedureCode,
    occurredAt: '2026-09-29T08:18:00Z',
    engineVersion: 'batch-04-beta-blocker-review-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-B4-BETA',
      procedureCode,
      medication: { medicationId, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [{ modifierId: 'MOD-stable-chronic-use', state: 'KNOWN', value: true }],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Batch 04 beta-blocker terminology', () => {
  it('assembles valid terminology and preserves all eight identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const medicationId of betaBlockerIds) {
      expect(index.getMedicationById(medicationId)?.drugClassIds).toContain('CLS-beta-blocker');
    }
  });

  it('fails bare metoprolol closed across tartrate and succinate ER', () => {
    for (const limit of [1, 10]) {
      const result = index.resolve('metoprolol', { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });

  it.each([
    ['metoprolol tartrate', 'MED-metoprolol-tartrate'],
    ['metoprolol tartrate tablet', 'MED-metoprolol-tartrate'],
    ['metoprolol succinate ER', 'MED-metoprolol-succinate-er'],
    ['metoprolol succinate extended release', 'MED-metoprolol-succinate-er'],
    ['carvedilol', 'MED-carvedilol'],
    ['atenolol', 'MED-atenolol'],
    ['propranolol', 'MED-propranolol'],
    ['bisoprolol', 'MED-bisoprolol'],
    ['nadolol', 'MED-nadolol'],
    ['labetalol', 'MED-labetalol'],
  ])('resolves explicit beta-blocker wording %s to %s', (query, expectedId) => {
    const result = index.resolve(query);
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe(expectedId);
  });
});

describe('Batch 04 beta-blocker review routing', () => {
  it('replaces the legacy metoprolol continuation candidate in assembled review content without activating production rules', () => {
    expect(activeRules).toEqual([]);
    expect(clinicalReviewRules.some((rule) => rule.id === 'RULE-METOPROLOL-CONTINUE-001')).toBe(false);
    const rule = clinicalReviewRules.find((candidate) => candidate.id === 'RULE-B4-BETA-BLOCKER-PRODUCT-REVIEW-001');
    expect(rule?.scope.medicationIds).toEqual([...betaBlockerIds]);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.requiredModifierIds).toEqual(['MOD-stable-chronic-use']);
    expect(rule?.timingRule).toBeUndefined();
  });

  it.each(procedures)('routes every explicit beta-blocker identity to timing-free clinician review for %s', (procedureCode) => {
    for (const medicationId of betaBlockerIds) {
      const event = evaluate(medicationId, procedureCode);
      expect(event.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(event.outputSnapshot.timingRule).toBeUndefined();
      expect(event.ruleRefs).toContainEqual({ id: 'RULE-B4-BETA-BLOCKER-PRODUCT-REVIEW-001', version: 1 });
    }
  });
});
