import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  diabetesInsulinProductAtoms, diabetesInsulinProductDefinitions, diabetesInsulinProductSources,
  diabetesWorkflowEvidence,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesFormulationMedications } from '../diabetes-formulations';
import { diabetesProductAudit, diabetesProductIdentities, diabetesProductMedications } from '../diabetes-insulin-products';

const index = new TerminologyIndex(terminologyDataset);
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
function evaluate(id: string, procedureCode: ProcedureCode, type: string, delivery: string, confirmation: ModifierValue) {
  const medication = index.getMedicationById(id);
  if (!medication) throw new Error(`Missing product fixture ${id}`);
  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-PRODUCT-${id}`, occurredAt: '2026-09-18T17:47:14Z',
    engineVersion: 'insulin-product-regression', mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-PRODUCT', procedureCode,
      medication: { medicationId: id, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [
        known('MOD-diabetes-type', type), known('MOD-current-insulin-plan-confirmed', true),
        confirmation, known('MOD-pump-aid-system-type', delivery), known('MOD-current-oral-intake-state', 'FASTING'),
      ],
    },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('named insulin products and preserved uncertainty', () => {
  it('assembles 45 medication concepts with 17 source-linked identities', () => {
    expect(diabetesProductMedications).toHaveLength(45);
    expect(diabetesProductAudit.searchableConceptCount).toBe(45);
    expect(diabetesProductAudit.sourceLinkedIdentityCount).toBe(17);
    expect(diabetesInsulinProductDefinitions).toHaveLength(6);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
  });
  it.each([
    ['Lyumjev U-100', 'MED-insulin-lispro-lyumjev-u100'],
    ['Lyumjev U-200', 'MED-insulin-lispro-lyumjev-u200'],
    ['Lyumjev Junior KwikPen', 'MED-insulin-lispro-lyumjev-u100'],
    ['Lyumjev 200 units/mL', 'MED-insulin-lispro-lyumjev-u200'],
    ['Admelog', 'MED-insulin-lispro-admelog-u100'],
    ['Fiasp', 'MED-insulin-aspart-fiasp-u100'],
    ['Basaglar', 'MED-insulin-glargine-basaglar-u100'],
    ['Semglee', 'MED-insulin-glargine-semglee-u100'],
  ])('recognizes %s without implying a presentation, dose or compatible device', (query, id) => {
    expect(index.resolve(query).medication?.id).toBe(id);
    const identity = diabetesProductIdentities[id];
    expect(identity?.state).toBe('SOURCE_LINKED_IDENTITY');
    expect(identity?.allowsDoseCalculation).toBe(false);
    expect(identity?.presentationConfirmed).toBe(false);
    expect(identity?.deviceCompatibilityAuthorized).toBe(false);
  });
  it.each([
    'Lyumjev', 'Lyumjev KwikPen', 'insulin lispro-aabc', 'Humalog',
    'insulin lispro U-100', 'insulin lispro U-200', 'insulin glargine U-100',
    'insulin glargine U-300', 'insulin aspart U-100', 'insulin glargine-yfgn U-100',
  ])('does not manufacture a unique product from %s', (query) => {
    for (const limit of [1, 10]) {
      const resolution = index.resolve(query, { limit });
      expect(resolution.status).toBe('AMBIGUOUS');
      expect(resolution.medication).toBeUndefined();
      expect(resolution.ingredientIds).toEqual([]);
    }
  });
  it.each([
    'Admelog U-200', 'Fiasp U-200', 'Basaglar U-300', 'Semglee U-300',
    'Lyumjev U-500', 'Lantus 300 units/mL', 'Lyumjev U-100 999 units',
  ])('does not discard unsupported numeric details in %s', (query) => {
    const resolution = index.resolve(query, { limit: 1 });
    expect(resolution.status).not.toBe('RESOLVED');
    expect(resolution.medication).toBeUndefined();
    expect(resolution.ingredientIds).toEqual([]);
    expect(index.search(query).length).toBeGreaterThan(0);
  });
  it('preserves labelled biologic names without treating formulation excipients as medication components', () => {
    expect(diabetesProductIdentities['MED-insulin-lispro-lyumjev-u100']?.labelledActiveName).toBe('insulin lispro-aabc');
    expect(diabetesProductIdentities['MED-insulin-glargine-semglee-u100']?.labelledActiveName).toBe('insulin glargine-yfgn');
    expect(index.getMedicationById('MED-insulin-lispro-lyumjev-u100')?.ingredientIds).toEqual(['ING-insulin-lispro']);
    expect(index.getMedicationById('MED-insulin-aspart-fiasp-u100')?.ingredientIds).toEqual(['ING-insulin-aspart']);
  });
  it('does not rewrite the previous catalog or assert commercial availability', () => {
    expect(diabetesFormulationMedications).toHaveLength(39);
    expect(diabetesFormulationMedications.find((med) => med.id === 'MED-insulin-lispro')?.brandNames).toContain('Lyumjev');
    expect(diabetesFormulationMedications.find((med) => med.id === 'MED-insulin-glargine')?.brandNames).toContain('Semglee');
    expect(index.getMedicationById('MED-insulin-lispro')?.brandNames).toEqual([]);
    expect(diabetesProductAudit.marketAvailabilityAsserted).toBe(false);
    expect(diabetesProductMedications.every((med) => (med.externalCodes ?? []).length === 0)).toBe(true);
  });
});

describe('product-level source provenance', () => {
  it('pins five draft sources and does not infer the Fiasp effective date from its posting date', () => {
    expect(diabetesInsulinProductSources).toHaveLength(5);
    expect(diabetesInsulinProductAtoms).toHaveLength(5);
    expect(validateEvidenceBundle(diabetesWorkflowEvidence)).toEqual([]);
    const source = diabetesInsulinProductSources.find((item) => item.id === 'SRC-B2-PRODUCT-FIASP');
    expect(source?.metadata?.setId).toBe('834e7efc-393f-4c55-9125-628562a8a5cf');
    expect(source?.metadata?.splVersion).toBe(18);
    expect(source?.publicationDate).toBe('2023-07-25');
    expect(source?.effectiveDate).toBeUndefined();
    expect(diabetesInsulinProductSources.find((item) => item.id === 'SRC-B2-PRODUCT-BASAGLAR')?.metadata?.splVersion).toBe(35);
  });
  it('links each added product to its exact label, without using identity evidence as a hold rule', () => {
    const ruleEvidenceIds = new Set(clinicalReviewRules.flatMap((rule) => rule.evidenceRefs.map((ref) => ref.id)));
    for (const product of diabetesInsulinProductDefinitions) {
      const identity = diabetesProductIdentities[product.medicationId];
      expect(identity?.concentration).toEqual({ value: product.concentration, unit: 'units/mL' });
      for (const ref of identity?.evidenceRefs ?? []) {
        const atom = diabetesInsulinProductAtoms.find((item) => item.id === ref.id && item.version === ref.version);
        expect(atom?.applicability.medicationIds).toContain(product.medicationId);
        expect(atom?.lifecycle).toBe('DRAFT');
        expect(atom?.evidenceStrength).toBe('NOT_GRADED');
        expect(ruleEvidenceIds.has(ref.id)).toBe(false);
        const source = diabetesInsulinProductSources.find((item) => item.id === atom?.source.id && item.version === atom?.source.version);
        expect(source?.metadata?.setId).toBeTruthy();
        expect(source?.lifecycle).toBe('DRAFT');
      }
    }
  });
});

describe('new insulin identities retain clinical-review boundaries', () => {
  it.each(diabetesInsulinProductDefinitions.map((product) => product.medicationId))(
    'preserves review, type-1 basal coverage, pump and missing-input safeguards for %s', (id) => {
      for (const procedure of procedures) {
        const confirmation = known('MOD-insulin-formulation-confirmed', true);
        const routine = evaluate(id, procedure, 'TYPE_2', 'NOT_USING_PUMP', confirmation);
        expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(routine.outputSnapshot.timingRule).toBeUndefined();
        const typeOne = evaluate(id, procedure, 'TYPE_1', 'NOT_USING_PUMP', confirmation);
        expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
        const pump = evaluate(id, procedure, 'TYPE_2', 'AID', confirmation);
        expect(pump.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(pump.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
        expect(pump.outputSnapshot.timingRule).toBeUndefined();
        for (const state of ['UNKNOWN', 'CONFLICTING'] as const) {
          const missing = evaluate(id, procedure, 'TYPE_2', 'NOT_USING_PUMP', { modifierId: 'MOD-insulin-formulation-confirmed', state });
          expect(missing.disposition).toBe('INSUFFICIENT_INFORMATION');
          expect(missing.outputSnapshot.timingRule).toBeUndefined();
        }
      }
    },
  );
});
