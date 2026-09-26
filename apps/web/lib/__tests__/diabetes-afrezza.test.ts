import { beforeEach, describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  afrezzaProductDefinitions, afrezzaSources, afrezzaAtoms,
  diabetesAfrezzaEvidence, diabetesHumanInsulinEvidence, diabetesWorkflowEvidence,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, modifierDefinitions, terminologyDataset } from '../content';
import { diabetesHumanInsulinMedications } from '../diabetes-human-insulin';
import { diabetesAfrezzaAudit, diabetesAfrezzaIdentities, diabetesAfrezzaMedications } from '../diabetes-afrezza';

let index: TerminologyIndex;
// Each case evaluates the assembled release, not a retained index from an earlier catalog snapshot.
// The independent generic-identity suite also tests a module-level index and repeated searches.
beforeEach(() => {
  index = new TerminologyIndex(terminologyDataset);
  expect(index.getMedicationById('MED-inhaled-insulin')?.genericName).toBe('insulin human inhalation powder');
  expect(index.getMedicationById('MED-afrezza-strength-unspecified')?.genericName).toBe('insulin human inhalation powder');
});
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
function evaluate(id: string, procedureCode: ProcedureCode, overrides: ModifierValue[] = []) {
  const medication = index.getMedicationById(id);
  if (!medication) throw new Error(`Missing Afrezza fixture ${id}`);
  const values = [
    known('MOD-diabetes-type', 'TYPE_2'), known('MOD-current-insulin-plan-confirmed', true),
    known('MOD-insulin-formulation-confirmed', true), known('MOD-pump-aid-system-type', 'NOT_USING_PUMP'),
    known('MOD-current-oral-intake-state', 'FASTING'),
  ];
  const modifiers = new Map(values.map((value) => [value.modifierId, value]));
  for (const value of overrides) modifiers.set(value.modifierId, value);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-AFREZZA', occurredAt: '2026-09-20T21:21:21Z',
    engineVersion: 'afrezza-identity-test', mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-AFREZZA', procedureCode,
      medication: { medicationId: id, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [...modifiers.values()],
    },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('Afrezza identity, cartridge strength and prescribed dose are separate', () => {
  it('adds four identities without altering the earlier 52-concept snapshot', () => {
    expect(diabetesAfrezzaMedications).toHaveLength(56);
    expect(afrezzaProductDefinitions).toHaveLength(4);
    expect(diabetesAfrezzaAudit.searchableConceptCount).toBe(56);
    expect(diabetesAfrezzaAudit.sourceLinkedIdentityCount).toBe(28);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(diabetesHumanInsulinMedications).toHaveLength(52);
    expect(diabetesHumanInsulinMedications.find((med) => med.id === 'MED-inhaled-insulin')?.brandNames).toEqual(['Afrezza']);
    expect(index.getMedicationById('MED-inhaled-insulin')?.brandNames).toEqual([]);
    expect(diabetesAfrezzaIdentities['MED-inhaled-insulin']?.state).toBe('UNSPECIFIED');
  });
  it.each([4, 8, 12] as const)('recognizes explicit %s-unit cartridge labels without supplying a dose', (units) => {
    const id = `MED-afrezza-${units}-unit-cartridge`;
    for (const query of [`Afrezza ${units} unit cartridge`, `Afrezza ${units} units per cartridge`, `Afrezza ${units} units/cartridge`]) {
      expect(index.resolve(query).medication?.id).toBe(id);
    }
    const identity = diabetesAfrezzaIdentities[id];
    expect(identity?.labelledCartridgeStrength).toEqual({ value: units, unit: 'AFREZZA_LABEL_UNITS_PER_CARTRIDGE' });
    expect(identity?.concentration).toBeUndefined();
    expect(identity?.route).toBe('ORAL_INHALATION');
    expect(identity?.dosageForm).toBe('INHALATION_POWDER');
    expect(identity?.prescribedDoseConfirmed).toBe(false);
    expect(identity?.cartridgeSelectionAuthorized).toBe(false);
    expect(identity?.substitutionAuthorized).toBe(false);
    expect(identity?.deviceCompatibilityAuthorized).toBe(false);
    expect(identity?.allowsDoseCalculation).toBe(false);
    expect(index.getMedicationById(id)?.ingredientIds).toEqual(['ING-inhaled-human-insulin']);
  });
  it.each(['Afrezza', 'insulin human inhalation powder', 'inhaled insulin 4 units per cartridge', 'insulin human inhalation powder 8 units per cartridge'])(
    'does not manufacture one cartridge product from %s', (query) => {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        const diagnostic = JSON.stringify({
          query, limit, result,
          allCandidates: index.search(query, { limit: terminologyDataset.medications.length }),
          generic: index.getMedicationById('MED-inhaled-insulin'),
          branded: index.getMedicationById('MED-afrezza-strength-unspecified'),
          freshResult: new TerminologyIndex(terminologyDataset).resolve(query, { limit }),
        });
        expect(result.status, diagnostic).toBe('AMBIGUOUS');
        expect(result.medication).toBeUndefined();
        expect(result.ingredientIds).toEqual([]);
      }
    },
  );
  it('retains unspecified cartridge strength for a titration-pack query', () => {
    const result = index.resolve('Afrezza titration pack');
    expect(result.medication?.id).toBe('MED-afrezza-strength-unspecified');
    const identity = diabetesAfrezzaIdentities['MED-afrezza-strength-unspecified'];
    expect(identity?.cartridgeStrengthState).toBe('UNSPECIFIED');
    expect(identity?.labelledCartridgeStrength).toBeUndefined();
    expect(identity?.concentration).toBeUndefined();
    expect(identity?.prescribedDoseConfirmed).toBe(false);
    expect(identity?.cartridgeSelectionAuthorized).toBe(false);
  });
  it.each([
    'Afrezza 4 units', 'Afrezza 8 units', 'Afrezza 16 units', 'Afrezza 16 unit cartridge',
    'Afrezza U-100', 'Afrezza 4 units/mL', 'Afrezza 4 mg cartridge',
    'Afrezza 4 unit cartridge 8 units twice daily', 'Afrezza 4 unit cartridge injection',
  ])('requires reconciliation rather than discarding numeric or route detail in %s', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).not.toBe('RESOLVED');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it('does not turn a cartridge, carrier ingredient or inhaler into an additional medication', () => {
    for (const product of afrezzaProductDefinitions) {
      expect(index.getMedicationById(product.medicationId)?.ingredientIds).toEqual(['ING-inhaled-human-insulin']);
      expect(index.getMedicationById(product.medicationId)?.externalCodes ?? []).toEqual([]);
    }
    expect(diabetesAfrezzaAudit.marketAvailabilityAsserted).toBe(false);
  });
  it('asks for strength and route reconciliation, without implying inhaled powder can fill a pump', () => {
    expect(modifierDefinitions['MOD-insulin-formulation-confirmed']?.description).toContain('cartridge label strength');
    expect(modifierDefinitions['MOD-pump-aid-system-type']?.description).toContain('not putting inhaled powder into a pump');
  });
});

describe('Afrezza provenance and clinical-review boundary', () => {
  it('pins the May 2026 manufacturer version instead of an older indexed label', () => {
    expect(afrezzaSources).toHaveLength(1);
    expect(afrezzaAtoms).toHaveLength(3);
    const source = afrezzaSources[0];
    expect(source?.metadata?.setId).toBe('29f4637b-e204-425b-b89c-7238008d8c10');
    expect(source?.metadata?.splVersion).toBe(17);
    expect(source?.metadata?.documentId).toBe('51ca8d95-025a-6342-e063-6294a90a94ee');
    expect(source?.effectiveDate).toBe('2026-05-30');
    expect(source?.metadata?.labelRevision).toBe('2026-05');
    expect(source?.lifecycle).toBe('DRAFT');
    expect(validateEvidenceBundle(diabetesAfrezzaEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesWorkflowEvidence)).toEqual([]);
    expect(diabetesWorkflowEvidence).not.toBe(diabetesAfrezzaEvidence);
    expect(diabetesWorkflowEvidence.sources.slice(0, diabetesAfrezzaEvidence.sources.length)).toEqual(diabetesAfrezzaEvidence.sources);
    expect(diabetesWorkflowEvidence.atoms.slice(0, diabetesAfrezzaEvidence.atoms.length)).toEqual(diabetesAfrezzaEvidence.atoms);
  });
  it('preserves historical records and keeps label identity outside medication-action rules', () => {
    expect(diabetesAfrezzaEvidence.sources.slice(0, diabetesHumanInsulinEvidence.sources.length)).toEqual(diabetesHumanInsulinEvidence.sources);
    expect(diabetesAfrezzaEvidence.atoms.slice(0, diabetesHumanInsulinEvidence.atoms.length)).toEqual(diabetesHumanInsulinEvidence.atoms);
    const actionEvidence = new Set(clinicalReviewRules.flatMap((rule) => rule.evidenceRefs.map((ref) => ref.id)));
    for (const atom of afrezzaAtoms) {
      expect(atom.source).toEqual({ id: 'SRC-B2-AFREZZA-SPL17', version: 1 });
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.locator?.section).toBeTruthy();
      expect(actionEvidence.has(atom.id)).toBe(false);
    }
    for (const product of afrezzaProductDefinitions) {
      for (const ref of diabetesAfrezzaIdentities[product.medicationId]?.evidenceRefs ?? []) {
        const atom = afrezzaAtoms.find((item) => item.id === ref.id && item.version === ref.version);
        expect(atom?.applicability.medicationIds).toContain(product.medicationId);
      }
    }
  });
  it.each(['MED-inhaled-insulin', ...afrezzaProductDefinitions.map((product) => product.medicationId)])(
    'retains review-only, type-1 and unknown-input safeguards for %s', (id) => {
      for (const procedure of procedures) {
        const routine = evaluate(id, procedure);
        expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(routine.outputSnapshot.timingRule).toBeUndefined();
        const typeOne = evaluate(id, procedure, [known('MOD-diabetes-type', 'TYPE_1')]);
        expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
        const pump = evaluate(id, procedure, [known('MOD-pump-aid-system-type', 'AID')]);
        expect(pump.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(pump.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
        expect(pump.outputSnapshot.timingRule).toBeUndefined();
        const unconfirmed = evaluate(id, procedure, [known('MOD-insulin-formulation-confirmed', false)]);
        expect(unconfirmed.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        for (const state of ['UNKNOWN', 'CONFLICTING'] as const) {
          const result = evaluate(id, procedure, [{ modifierId: 'MOD-insulin-formulation-confirmed', state }]);
          expect(result.disposition).toBe('INSUFFICIENT_INFORMATION');
          expect(result.outputSnapshot.timingRule).toBeUndefined();
        }
      }
    },
  );
});
