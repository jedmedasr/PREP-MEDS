import { describe, expect, it } from 'vitest';
import { evaluateDecision, type ModifierValue, type ProcedureCode } from '@prep-meds/clinical-engine';
import {
  diabetesInsulinProductEvidence, diabetesHumanInsulinEvidence, diabetesWorkflowEvidence,
  humanInsulinAtoms, humanInsulinProductDefinitions, humanInsulinSources,
} from '@prep-meds/clinical-content';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { clinicalReviewRules, terminologyDataset } from '../content';
import { diabetesProductIdentities, diabetesProductMedications } from '../diabetes-insulin-products';
import { diabetesHumanInsulinAudit, diabetesHumanInsulinIdentities, diabetesHumanInsulinMedications } from '../diabetes-human-insulin';

const index = new TerminologyIndex(terminologyDataset);
const procedures: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'];
const known = (modifierId: string, value: unknown): ModifierValue => ({ modifierId, state: 'KNOWN', value });
function evaluate(id: string, procedureCode: ProcedureCode, type: string, delivery: string, confirmation: ModifierValue) {
  const medication = index.getMedicationById(id);
  if (!medication) throw new Error(`Missing human-insulin fixture ${id}`);
  return evaluateDecision({
    decisionEventId: `DEC-SYNTHETIC-HUMAN-${id}`, occurredAt: '2026-09-18T22:41:42Z',
    engineVersion: 'human-insulin-regression', mode: 'VALIDATION',
    context: {
      organizationId: 'ORG-SYNTHETIC-HUMAN', procedureCode,
      medication: { medicationId: id, ingredientIds: medication.ingredientIds, drugClassIds: medication.drugClassIds ?? [] },
      modifiers: [known('MOD-diabetes-type', type), known('MOD-current-insulin-plan-confirmed', true),
        confirmation, known('MOD-pump-aid-system-type', delivery), known('MOD-current-oral-intake-state', 'FASTING')],
    },
    rules: clinicalReviewRules, policies: [],
  }).event;
}

describe('human-insulin product identity', () => {
  it('assembles 52 concepts with 24 source-linked identities, preserving all earlier concepts', () => {
    expect(diabetesProductMedications).toHaveLength(45);
    expect(diabetesHumanInsulinMedications).toHaveLength(52);
    expect(diabetesHumanInsulinAudit.searchableConceptCount).toBe(52);
    expect(diabetesHumanInsulinAudit.sourceLinkedIdentityCount).toBe(24);
    expect(humanInsulinProductDefinitions).toHaveLength(7);
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    for (const earlier of diabetesProductMedications) expect(index.getMedicationById(earlier.id)).not.toBeNull();
  });
  it.each([
    ['Humulin N', 'MED-insulin-nph-humulin-u100'],
    ['Novolin N', 'MED-insulin-nph-novolin-u100'],
    ['ReliOn Novolin N', 'MED-insulin-nph-novolin-u100'],
    ['Humulin R U-100', 'MED-insulin-regular-humulin-u100'],
    ['Humulin R 500 units/mL', 'MED-insulin-regular-humulin-u500'],
    ['Humulin R U-500', 'MED-insulin-regular-humulin-u500'],
    ['Humulin R U-500 KwikPen', 'MED-insulin-regular-humulin-u500'],
    ['Novolin R', 'MED-insulin-regular-novolin-u100'],
    ['ReliOn Novolin R', 'MED-insulin-regular-novolin-u100'],
    ['Humulin 70/30', 'MED-insulin-human-70-30-humulin-u100'],
    ['Novolin 70/30', 'MED-insulin-human-70-30-novolin-u100'],
    ['ReliOn Novolin 70/30', 'MED-insulin-human-70-30-novolin-u100'],
    ['NovoLog Mix 70/30', 'MED-insulin-aspart-70-30'],
  ])('recognizes the explicitly named %s without prescribing a dose', (query, id) => {
    expect(index.resolve(query).medication?.id).toBe(id);
    expect(diabetesHumanInsulinIdentities[id]?.allowsDoseCalculation).toBe(false);
  });
  it.each(['Humulin R', '70/30', '70/30 insulin', 'human insulin 70/30', 'concentrated insulin', 'ReliOn',
    'NPH U-100', 'regular insulin U-100', 'insulin human U-500'])('does not select one product from %s', (query) => {
    for (const limit of [1, 10]) {
      const result = index.resolve(query, { limit });
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
    }
  });
  it.each(['Humulin N U-500', 'Novolin R U-500', 'Humulin R U-200', 'Novolin 30/70',
    'Humulin R U-100 999 units', 'Humulin 70/30 U-500'])('does not discard unsupported numeric details in %s', (query) => {
    expect(index.resolve(query, { limit: 1 }).status).not.toBe('RESOLVED');
    expect(index.resolve(query, { limit: 1 }).medication).toBeUndefined();
  });
  it('keeps the known U-500 concentration distinct from a verified branded product', () => {
    const historical = diabetesProductMedications.find((med) => med.id === 'MED-regular-insulin-u500');
    expect(historical?.brandNames).toEqual(['Humulin R U-500']);
    expect(diabetesProductIdentities['MED-regular-insulin-u500']?.state).toBe('PRODUCT_DETAIL_NOT_VERIFIED');
    const unspecified = diabetesHumanInsulinIdentities['MED-regular-insulin-u500'];
    expect(unspecified?.state).toBe('UNSPECIFIED');
    expect(unspecified?.version).toBe(2);
    expect(unspecified?.concentration).toEqual({ value: 500, unit: 'units/mL' });
    expect(index.getMedicationById('MED-regular-insulin-u500')?.brandNames).toEqual([]);
    expect(index.getMedicationById('MED-insulin-regular-humulin-u500')?.drugClassIds).toEqual(['CLS-concentrated-insulin']);
  });
  it('distinguishes suspensions, solutions and human-versus-analog premixes', () => {
    expect(diabetesHumanInsulinIdentities['MED-insulin-nph-humulin-u100']?.preparation).toBe('NPH_SUSPENSION');
    expect(diabetesHumanInsulinIdentities['MED-insulin-regular-humulin-u100']?.preparation).toBe('REGULAR_SOLUTION');
    for (const id of ['MED-insulin-human-70-30-humulin-u100', 'MED-insulin-human-70-30-novolin-u100']) {
      const identity = diabetesHumanInsulinIdentities[id];
      expect(identity?.components).toEqual([
        { name: 'Insulin isophane human (NPH)', proportionPercent: 70 },
        { name: 'Regular insulin human', proportionPercent: 30 },
      ]);
      expect(identity?.independentlyAdjustableComponents).toBe(false);
      expect(identity?.preparation).toBe('HUMAN_PREMIX_SUSPENSION');
      expect(index.getMedicationById(id)?.ingredientIds).toEqual(['ING-insulin-nph', 'ING-insulin-regular']);
    }
    expect(index.getMedicationById('MED-insulin-aspart-70-30')?.ingredientIds).toEqual(['ING-insulin-aspart']);
  });
});

describe('human-insulin evidence boundaries', () => {
  it('appends seven sources and seven claims without changing historical records', () => {
    expect(humanInsulinSources).toHaveLength(7);
    expect(humanInsulinAtoms).toHaveLength(7);
    expect(diabetesHumanInsulinEvidence.sources).toHaveLength(diabetesInsulinProductEvidence.sources.length + 7);
    expect(diabetesHumanInsulinEvidence.atoms).toHaveLength(diabetesInsulinProductEvidence.atoms.length + 7);
    for (const source of diabetesInsulinProductEvidence.sources) {
      expect(diabetesHumanInsulinEvidence.sources.find((item) => item.id === source.id && item.version === source.version)).toEqual(source);
    }
    for (const atom of diabetesInsulinProductEvidence.atoms) {
      expect(diabetesHumanInsulinEvidence.atoms.find((item) => item.id === atom.id && item.version === atom.version)).toEqual(atom);
    }
    expect(validateEvidenceBundle(diabetesHumanInsulinEvidence)).toEqual([]);
    expect(validateEvidenceBundle(diabetesWorkflowEvidence)).toEqual([]);
    expect(diabetesWorkflowEvidence).not.toBe(diabetesHumanInsulinEvidence);
    expect(diabetesWorkflowEvidence.sources.slice(0, diabetesHumanInsulinEvidence.sources.length)).toEqual(diabetesHumanInsulinEvidence.sources);
    expect(diabetesWorkflowEvidence.atoms.slice(0, diabetesHumanInsulinEvidence.atoms.length)).toEqual(diabetesHumanInsulinEvidence.atoms);
  });
  it.each([
    ['HUMULIN-N', 'f6edd793-440b-40c2-96b5-c16133b7a921', 50, '2025-12-19'],
    ['NOVOLIN-N', '82f1445c-b2c6-445a-82cf-ba8825fac776', 17, '2022-11-23'],
    ['HUMULIN-R-U100', 'b519bd83-038c-4ec5-a231-a51ec5cc291f', 35, '2026-06-16'],
    ['NOVOLIN-R', 'aee7f1f3-612c-4027-8ce9-4fd1f41eed71', 19, '2022-11-23'],
    ['HUMULIN-R-U500', 'b60e8dd0-1d48-4dc9-87fd-e14675255e8c', 40, '2024-02-22'],
    ['HUMULIN-70-30', 'e245e0c5-b2d6-418b-baa4-1c3324292885', 48, '2024-12-10'],
    ['NOVOLIN-70-30', '508a2763-3cb7-4be5-9e53-544e84cd9b1f', 18, '2022-11-23'],
  ])('pins the %s manufacturer source without inferring publication or availability', (key, setId, version, effectiveDate) => {
    const source = humanInsulinSources.find((item) => item.id === `SRC-B2-HUMAN-${key}`);
    expect(source?.metadata?.setId).toBe(setId);
    expect(source?.metadata?.splVersion).toBe(version);
    expect(source?.effectiveDate).toBe(effectiveDate);
    expect(source?.publicationDate).toBeUndefined();
    expect(source?.metadata?.currentMarketAvailabilityAsserted).toBe(false);
    expect(source?.lifecycle).toBe('DRAFT');
  });
  it('separates literature revision from the SPL effective date', () => {
    expect(humanInsulinSources.find((source) => source.id === 'SRC-B2-HUMAN-HUMULIN-R-U100')?.metadata?.uspiLiteratureRevision).toBe('2023-06');
    expect(humanInsulinSources.find((source) => source.id === 'SRC-B2-HUMAN-HUMULIN-70-30')?.metadata?.uspiLiteratureRevision).toBe('2022-06');
  });
  it('links each product to its own descriptive source, not to a hold or restart action', () => {
    const ruleRefs = new Set(clinicalReviewRules.flatMap((rule) => rule.evidenceRefs.map((ref) => ref.id)));
    for (const product of humanInsulinProductDefinitions) {
      const identity = diabetesHumanInsulinIdentities[product.medicationId];
      expect(identity?.evidenceRefs).toHaveLength(1);
      const ref = identity?.evidenceRefs[0];
      const atom = humanInsulinAtoms.find((item) => item.id === ref?.id && item.version === ref?.version);
      expect(atom?.applicability.medicationIds).toEqual([product.medicationId]);
      expect(atom?.applicability.drugClassIds).toBeUndefined();
      expect(atom?.locator.section).toContain('3 Dosage Forms and Strengths');
      expect(atom?.stance).toBe('DESCRIPTIVE');
      expect(atom?.evidenceStrength).toBe('NOT_GRADED');
      expect(atom?.lifecycle).toBe('DRAFT');
      expect(ruleRefs.has(ref?.id ?? '')).toBe(false);
      expect(identity?.allowsDoseCalculation).toBe(false);
      expect(identity?.substitutionAuthorized).toBe(false);
      expect(identity?.deviceCompatibilityAuthorized).toBe(false);
    }
    expect(diabetesHumanInsulinAudit.marketAvailabilityAsserted).toBe(false);
  });
});

describe('human-insulin clinical review safeguards', () => {
  it.each(humanInsulinProductDefinitions.map((product) => product.medicationId))(
    'preserves review-only, type-1, pump and missing-input behavior for %s', (id) => {
      for (const procedure of procedures) {
        const confirmation = known('MOD-insulin-formulation-confirmed', true);
        const routine = evaluate(id, procedure, 'TYPE_2', 'NOT_USING_PUMP', confirmation);
        expect(routine.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
        expect(routine.outputSnapshot.timingRule).toBeUndefined();
        const typeOne = evaluate(id, procedure, 'TYPE_1', 'NOT_USING_PUMP', confirmation);
        expect(typeOne.reasonCodes).toContain('TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE');
        expect(typeOne.outputSnapshot.timingRule).toBeUndefined();
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
