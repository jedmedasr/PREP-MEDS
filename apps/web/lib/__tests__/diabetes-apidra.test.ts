import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  apidraAtoms, apidraProductDefinitions, apidraSources,
  diabetesAfrezzaEvidence, diabetesApidraEvidence, diabetesWorkflowEvidence,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesAfrezzaMedications } from '../diabetes-afrezza';
import { diabetesApidraAudit, diabetesApidraIdentities, diabetesApidraMedications } from '../diabetes-apidra';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });

function evaluate(id: string, procedureCode: ProcedureCode, overrides: ModifierValue[] = []) {
  const medication = index.getMedicationById(id);
  if (!medication) throw new Error(`Missing Apidra fixture ${id}`);
  const values = [
    known('MOD-diabetes-type', 'TYPE_2'),
    known('MOD-current-insulin-plan-confirmed', true),
    known('MOD-insulin-formulation-confirmed', true),
    known('MOD-pump-aid-system-type', 'NOT_USING_PUMP'),
    known('MOD-current-oral-intake-state', 'FASTING'),
  ];
  const modifiers = new Map(values.map((value) => [value.modifierId, value]));
  for (const value of overrides) modifiers.set(value.modifierId, value);
  return evaluateDecision({
    decisionEventId: 'DEC-SYNTHETIC-APIDRA',
    occurredAt: '2026-09-26T02:45:00Z',
    engineVersion: 'apidra-identity-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-APIDRA',
      procedureCode,
      medication: {
        medicationId: id,
        ingredientIds: medication.ingredientIds,
        drugClassIds: medication.drugClassIds ?? [],
      },
      modifiers: [...modifiers.values()],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Apidra product identity and preserved generic uncertainty', () => {
  it('adds one source-linked product identity without changing the 56-concept Afrezza snapshot', () => {
    expect(diabetesAfrezzaMedications).toHaveLength(56);
    expect(diabetesApidraMedications).toHaveLength(57);
    expect(apidraProductDefinitions).toHaveLength(1);
    expect(diabetesApidraAudit.searchableConceptCount).toBe(57);
    expect(diabetesApidraAudit.sourceLinkedIdentityCount).toBe(29);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
  });

  it.each(['Apidra', 'Apidra U-100', 'Apidra 100 units/mL', 'Apidra SoloStar', 'Apidra SoloStar U-100'])(
    'recognizes explicit product wording %s without confirming regimen or presentation', (query) => {
      const result = index.resolve(query);
      expect(result.medication?.id).toBe('MED-insulin-glulisine-apidra-u100');
      const identity = diabetesApidraIdentities['MED-insulin-glulisine-apidra-u100'];
      expect(identity?.concentration).toEqual({ value: 100, unit: 'units/mL' });
      expect(identity?.allowsDoseCalculation).toBe(false);
      expect(identity?.presentationConfirmed).toBe(false);
      expect(identity?.deviceCompatibilityAuthorized).toBe(false);
      expect(identity?.substitutionAuthorized).toBe(false);
    },
  );

  it.each(['insulin glulisine U-100', 'insulin glulisine 100 units/mL', 'glulisine U100'])(
    'does not authenticate a branded manufacturer from generic wording %s', (query) => {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        expect(result.status).toBe('AMBIGUOUS');
        expect(result.medication).toBeUndefined();
        expect(result.ingredientIds).toEqual([]);
      }
    },
  );

  it('keeps bare insulin glulisine as a non-branded unspecified product record', () => {
    const result = index.resolve('insulin glulisine');
    expect(result.medication?.id).toBe('MED-insulin-glulisine');
    expect(index.getMedicationById('MED-insulin-glulisine')?.brandNames).toEqual([]);
    expect(diabetesApidraIdentities['MED-insulin-glulisine']?.state).toBe('UNSPECIFIED');
    expect(diabetesApidraIdentities['MED-insulin-glulisine']?.concentration).toBeUndefined();
  });

  it.each(['Apidra U-200', 'Apidra 200 units/mL', 'Apidra SoloStar U-200', 'Apidra U-500'])(
    'does not discard unsupported concentration detail in %s', (query) => {
      const result = index.resolve(query, { limit: 1 });
      expect(result.status).not.toBe('RESOLVED');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    },
  );

  it('does not assert market availability or manufacture external codes', () => {
    expect(diabetesApidraAudit.marketAvailabilityAsserted).toBe(false);
    expect(index.getMedicationById('MED-insulin-glulisine-apidra-u100')?.externalCodes ?? []).toEqual([]);
  });
});

describe('Apidra source provenance and append-only evidence', () => {
  it('pins the current manufacturer SPL while keeping the PI revision date distinct', () => {
    expect(apidraSources).toHaveLength(1);
    expect(apidraAtoms).toHaveLength(1);
    const source = apidraSources[0];
    expect(source?.metadata?.setId).toBe('e7af6a7a-8046-4fb4-9979-4ec4230b23aa');
    expect(source?.metadata?.splVersion).toBe(28);
    expect(source?.metadata?.documentId).toBe('6be54063-6912-4810-b1c7-dfca969224d8');
    expect(source?.effectiveDate).toBe('2025-11-25');
    expect(source?.metadata?.labelRevision).toBe('2025-05');
    expect(source?.metadata?.currentMarketAvailabilityAsserted).toBe(false);
    expect(source?.lifecycle).toBe('DRAFT');
  });

  it('appends to Afrezza without mutating the historical evidence bundle', () => {
    expect(validateEvidenceBundle(diabetesAfrezzaEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesApidraEvidence)).toEqual([]);
    expect(diabetesWorkflowEvidence).toBe(diabetesApidraEvidence);
    expect(diabetesApidraEvidence.sources.slice(0, diabetesAfrezzaEvidence.sources.length)).toEqual(diabetesAfrezzaEvidence.sources);
    expect(diabetesApidraEvidence.atoms.slice(0, diabetesAfrezzaEvidence.atoms.length)).toEqual(diabetesAfrezzaEvidence.atoms);
    expect(diabetesApidraEvidence.sources).toHaveLength(diabetesAfrezzaEvidence.sources.length + 1);
    expect(diabetesApidraEvidence.atoms).toHaveLength(diabetesAfrezzaEvidence.atoms.length + 1);
  });

  it('keeps Apidra identity evidence descriptive and outside medication-action rules', () => {
    const ruleEvidenceIds = new Set(clinicalReviewRules.flatMap((rule) => rule.evidenceRefs.map((ref) => ref.id)));
    const atom = apidraAtoms[0];
    expect(atom?.source).toEqual({ id: 'SRC-B2-APIDRA-SPL28', version: 1 });
    expect(atom?.applicability.medicationIds).toEqual(['MED-insulin-glulisine-apidra-u100']);
    expect(atom?.stance).toBe('DESCRIPTIVE');
    expect(atom?.evidenceStrength).toBe('NOT_GRADED');
    expect(atom?.lifecycle).toBe('DRAFT');
    expect(ruleEvidenceIds.has(atom?.id ?? '')).toBe(false);
  });
});

describe('Apidra retains existing insulin clinical-review safeguards', () => {
  it.each(apidraProductDefinitions.map((product) => product.medicationId))(
    'keeps review-only behavior and missing-input safeguards for %s', (id) => {
      for (const procedure of procedures) {
        const routine = evaluate(id, procedure);
        expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(routine.outputSnapshot.timingRule).toBeUndefined();

        const typeOne = evaluate(id, procedure, [known('MOD-diabetes-type', 'TYPE_1')]);
        expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
        expect(typeOne.outputSnapshot.timingRule).toBeUndefined();

        const pump = evaluate(id, procedure, [known('MOD-pump-aid-system-type', 'AID')]);
        expect(pump.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(pump.reasonCodes).toContain('PUMP_THERAPY_REQUIRES_DEVICE_AND_BACKUP_PLAN_REVIEW');
        expect(pump.outputSnapshot.timingRule).toBeUndefined();

        for (const state of ['UNKNOWN', 'CONFLICTING'] as const) {
          const missing = evaluate(id, procedure, [{ modifierId: 'MOD-insulin-formulation-confirmed', state }]);
          expect(missing.disposition).toBe('INSUFFICIENT_INFORMATION');
          expect(missing.outputSnapshot.timingRule).toBeUndefined();
        }
      }
    },
  );
});
