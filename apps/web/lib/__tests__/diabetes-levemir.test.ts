import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  diabetesApidraEvidence, diabetesLevemirEvidence, diabetesWorkflowEvidence,
  levemirAtoms, levemirProductDefinitions, levemirSources,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesApidraMedications } from '../diabetes-apidra';
import { diabetesLevemirAudit, diabetesLevemirIdentities, diabetesLevemirMedications } from '../diabetes-levemir';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });

function evaluate(id: string, procedureCode: ProcedureCode, overrides: ModifierValue[] = []) {
  const medication = index.getMedicationById(id);
  if (!medication) throw new Error(`Missing Levemir fixture ${id}`);
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
    decisionEventId: 'DEC-SYNTHETIC-LEVEMIR',
    occurredAt: '2026-09-26T02:59:33Z',
    engineVersion: 'levemir-identity-test',
    mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-LEVEMIR',
      procedureCode,
      medication: { medicationId: id, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [...modifiers.values()],
    },
    rules: clinicalReviewRules,
    policies: [],
  }).event;
}

describe('Levemir historical product identity and current marketing status', () => {
  it('adds one source-linked branded identity without changing the 57-concept Apidra snapshot', () => {
    expect(diabetesApidraMedications).toHaveLength(57);
    expect(diabetesLevemirMedications).toHaveLength(58);
    expect(levemirProductDefinitions).toHaveLength(1);
    expect(diabetesLevemirAudit.searchableConceptCount).toBe(58);
    expect(diabetesLevemirAudit.sourceLinkedIdentityCount).toBe(30);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
  });

  it.each(['Levemir', 'Levemir U-100', 'Levemir 100 units/mL', 'Levemir FlexPen', 'Levemir FlexPen U-100', 'Levemir FlexTouch U-100'])(
    'recognizes explicit historical branded wording %s without confirming presentation or regimen', (query) => {
      const result = index.resolve(query);
      expect(result.medication?.id).toBe('MED-insulin-detemir-levemir-u100');
      const identity = diabetesLevemirIdentities['MED-insulin-detemir-levemir-u100'];
      expect(identity?.concentration).toEqual({ value: 100, unit: 'units/mL' });
      expect(identity?.usMarketingStatus).toBe('DISCONTINUED');
      expect(identity?.allowsDoseCalculation).toBe(false);
      expect(identity?.presentationConfirmed).toBe(false);
      expect(identity?.deviceCompatibilityAuthorized).toBe(false);
      expect(identity?.substitutionAuthorized).toBe(false);
    },
  );

  it.each(['insulin detemir U-100', 'insulin detemir 100 units/mL', 'detemir U100'])(
    'does not authenticate Levemir from generic wording %s', (query) => {
      for (const limit of [1, 10]) {
        const result = index.resolve(query, { limit });
        expect(result.medication?.id).not.toBe('MED-insulin-detemir-levemir-u100');
        if (result.status === 'RESOLVED') {
          expect(result.medication?.id).toBe('MED-insulin-detemir');
          expect(result.medication?.brandNames).toEqual([]);
          expect(diabetesLevemirIdentities['MED-insulin-detemir']?.state).toBe('UNSPECIFIED');
        } else {
          expect(result.status).toBe('AMBIGUOUS');
          expect(result.medication).toBeUndefined();
        }
      }
    },
  );

  it.each(['Levemir U-200', 'Levemir 200 units/mL', 'Levemir U-300', 'Levemir U-500'])(
    'does not discard unsupported concentration detail in %s', (query) => {
      const result = index.resolve(query, { limit: 1 });
      expect(result.status).not.toBe('RESOLVED');
      expect(result.medication).toBeUndefined();
    },
  );

  it('separates FDA marketing status from inventory and therapy decisions', () => {
    const identity = diabetesLevemirIdentities['MED-insulin-detemir-levemir-u100'];
    expect(identity?.usMarketingStatus).toBe('DISCONTINUED');
    expect(identity?.marketingStatusDatabaseUpdatedAt).toBe('2026-09-11');
    expect(identity?.marketingStatusEvidenceRefs).toEqual([{ id: 'EVD-B2-LEVEMIR-US-MARKETING-STATUS', version: 1 }]);
    expect(diabetesLevemirAudit.marketAvailabilityAsserted).toBe(false);
    expect(diabetesLevemirAudit.marketingStatusVerified).toBe(true);
    expect(diabetesLevemirAudit.discontinuedBrandedProductCount).toBe(1);
    expect(index.getMedicationById('MED-insulin-detemir-levemir-u100')?.externalCodes ?? []).toEqual([]);
  });
});

describe('Levemir evidence provenance and append-only history', () => {
  it('pins manufacturer identity separately from FDA Purple Book market status', () => {
    expect(levemirSources).toHaveLength(2);
    expect(levemirAtoms).toHaveLength(2);
    const label = levemirSources.find((source) => source.id === 'SRC-B2-LEVEMIR-SPL30');
    expect(label?.metadata?.setId).toBe('d38d65c1-25bf-401d-9c7e-a2c3222da8af');
    expect(label?.metadata?.splVersion).toBe(30);
    expect(label?.effectiveDate).toBe('2022-12-08');
    expect(label?.metadata?.currentArchivePublishedDate).toBe('2025-12-29');
    const status = levemirSources.find((source) => source.id === 'SRC-B2-LEVEMIR-PURPLEBOOK-2026-09');
    expect(status?.metadata?.applicationNumber).toBe('BLA 021536');
    expect(status?.metadata?.databaseLastUpdated).toBe('2026-09-11');
    expect(status?.metadata?.listedProductCount).toBe(5);
    expect(status?.metadata?.listedMarketingStatus).toBe('Disc');
    expect(label?.lifecycle).toBe('DRAFT');
    expect(status?.lifecycle).toBe('DRAFT');
  });

  it('appends to Apidra without mutating its historical evidence bundle', () => {
    expect(validateEvidenceBundle(diabetesApidraEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesLevemirEvidence)).toEqual([]);
    expect(diabetesWorkflowEvidence).toBe(diabetesLevemirEvidence);
    expect(diabetesLevemirEvidence.sources.slice(0, diabetesApidraEvidence.sources.length)).toEqual(diabetesApidraEvidence.sources);
    expect(diabetesLevemirEvidence.atoms.slice(0, diabetesApidraEvidence.atoms.length)).toEqual(diabetesApidraEvidence.atoms);
    expect(diabetesLevemirEvidence.sources).toHaveLength(diabetesApidraEvidence.sources.length + 2);
    expect(diabetesLevemirEvidence.atoms).toHaveLength(diabetesApidraEvidence.atoms.length + 2);
  });

  it('keeps identity and marketing-status evidence descriptive and outside medication-action rules', () => {
    const ruleEvidenceIds = new Set(clinicalReviewRules.flatMap((rule) => rule.evidenceRefs.map((ref) => ref.id)));
    for (const atom of levemirAtoms) {
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.lifecycle).toBe('DRAFT');
      expect(ruleEvidenceIds.has(atom.id)).toBe(false);
    }
  });
});

describe('Levemir retains existing insulin clinical-review safeguards', () => {
  it.each(levemirProductDefinitions.map((product) => product.medicationId))(
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
