import type { MedicationRecord } from '@prep-meds/terminology';
import { diabetesCoreMedications } from './diabetes-core-terminology';

interface EvidenceRef { id: string; version: number }
export interface DiabetesFormulationIdentity {
  medicationId: string;
  version: 1;
  state: 'SOURCE_LINKED_IDENTITY' | 'UNSPECIFIED' | 'PRODUCT_DETAIL_NOT_VERIFIED';
  concentration?: { value: number; unit: 'units/mL' };
  tabletStrength?: { value: number; unit: 'mg' };
  components?: Array<{ name: string; proportionPercent: number }>;
  evidenceRefs: EvidenceRef[];
  allowsDoseCalculation: false;
}

// Preserve original records for audit; only this assembled release changes their search identity.
const overrides: Record<string, Partial<MedicationRecord>> = {
  'MED-insulin-glargine': {
    canonicalName: 'Insulin glargine (product/concentration unspecified)',
    brandNames: ['Basaglar', 'Semglee'],
    aliases: ['glargine', 'basal insulin'],
  },
  'MED-insulin-degludec': {
    canonicalName: 'Insulin degludec (concentration unspecified)',
    brandNames: [], aliases: ['degludec', 'basal insulin'],
  },
  'MED-insulin-lispro': {
    canonicalName: 'Insulin lispro (product/concentration unspecified)',
    brandNames: ['Admelog', 'Lyumjev'], aliases: ['lispro', 'rapid acting insulin'],
  },
  'MED-bromocriptine-qr': {
    canonicalName: 'Bromocriptine-QR (Cycloset 0.8 mg formulation)',
    genericName: 'bromocriptine quick release',
    aliases: ['bromocriptine', 'bromocriptine QR', 'bromocriptine quick release', 'bromocriptine 0.8 mg'],
  },
  'MED-insulin-lispro-75-25': { canonicalName: 'Insulin lispro mix 75/25 U-100' },
  'MED-insulin-lispro-50-50': { canonicalName: 'Insulin lispro mix 50/50 U-100' },
  'MED-insulin-aspart-70-30': { canonicalName: 'Insulin aspart mix 70/30 U-100' },
};

const added: MedicationRecord[] = [
  {
    id: 'MED-insulin-glargine-u100', canonicalName: 'Insulin glargine U-100 (Lantus)',
    genericName: 'insulin glargine U-100', brandNames: ['Lantus'],
    aliases: ['glargine U-100', 'glargine U100', 'Lantus U-100'],
    ingredientIds: ['ING-insulin-glargine'], drugClassIds: ['CLS-basal-insulin'],
  },
  {
    id: 'MED-insulin-glargine-u300', canonicalName: 'Insulin glargine U-300 (Toujeo)',
    genericName: 'insulin glargine U-300', brandNames: ['Toujeo'],
    aliases: ['glargine U-300', 'glargine U300', 'Toujeo U-300'],
    ingredientIds: ['ING-insulin-glargine'], drugClassIds: ['CLS-basal-insulin'],
  },
  {
    id: 'MED-insulin-degludec-u100', canonicalName: 'Insulin degludec U-100 (Tresiba)',
    genericName: 'insulin degludec U-100', brandNames: ['Tresiba'],
    aliases: ['degludec U-100', 'degludec U100', 'Tresiba U-100'],
    ingredientIds: ['ING-insulin-degludec'], drugClassIds: ['CLS-basal-insulin'],
  },
  {
    id: 'MED-insulin-degludec-u200', canonicalName: 'Insulin degludec U-200 (Tresiba)',
    genericName: 'insulin degludec U-200', brandNames: ['Tresiba'],
    aliases: ['degludec U-200', 'degludec U200', 'Tresiba U-200'],
    ingredientIds: ['ING-insulin-degludec'], drugClassIds: ['CLS-basal-insulin'],
  },
  {
    id: 'MED-insulin-lispro-humalog-u100', canonicalName: 'Insulin lispro U-100 (Humalog)',
    genericName: 'insulin lispro U-100', brandNames: ['Humalog'],
    aliases: ['Humalog U-100', 'Humalog U100', 'lispro U-100'],
    ingredientIds: ['ING-insulin-lispro'], drugClassIds: ['CLS-prandial-insulin'],
  },
  {
    id: 'MED-insulin-lispro-humalog-u200', canonicalName: 'Insulin lispro U-200 (Humalog)',
    genericName: 'insulin lispro U-200', brandNames: ['Humalog'],
    aliases: ['Humalog U-200', 'Humalog U200', 'lispro U-200'],
    ingredientIds: ['ING-insulin-lispro'], drugClassIds: ['CLS-prandial-insulin'],
  },
  {
    id: 'MED-bromocriptine-unspecified', canonicalName: 'Bromocriptine (product/indication unspecified)',
    genericName: 'bromocriptine', aliases: ['bromocriptine mesylate'],
    ingredientIds: ['ING-bromocriptine'], drugClassIds: ['CLS-bromocriptine-unresolved'],
  },
  {
    id: 'MED-bromocriptine-parlodel', canonicalName: 'Bromocriptine (Parlodel formulation)',
    genericName: 'bromocriptine mesylate Parlodel', brandNames: ['Parlodel'],
    aliases: ['Parlodel tablets', 'Parlodel capsules'],
    ingredientIds: ['ING-bromocriptine'], drugClassIds: ['CLS-bromocriptine-nondiabetes'],
  },
];

export const diabetesFormulationMedications: MedicationRecord[] = [
  ...diabetesCoreMedications.filter((medication) => medication.id !== 'MED-insulin-pump-aid').map((medication) => {
    // Legacy active=false is not a verified market-status statement for this release.
    const { active: _unverifiedMarketStatus, ...identity } = medication;
    return { ...identity, ...(overrides[medication.id] ?? {}) };
  }),
  ...added,
];

const ref = (key: string): EvidenceRef => ({ id: `EVD-B2-FORM-${key}`, version: 1 });
type IdentityDetail = Omit<DiabetesFormulationIdentity, 'medicationId' | 'version' | 'allowsDoseCalculation'>;
const verified: Record<string, IdentityDetail> = {
  'MED-insulin-glargine-u100': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' }, evidenceRefs: [ref('GLARGINE-CONCENTRATIONS')] },
  'MED-insulin-glargine-u300': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 300, unit: 'units/mL' }, evidenceRefs: [ref('GLARGINE-CONCENTRATIONS')] },
  'MED-insulin-degludec-u100': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' }, evidenceRefs: [ref('DEGLUDEC-CONCENTRATIONS')] },
  'MED-insulin-degludec-u200': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 200, unit: 'units/mL' }, evidenceRefs: [ref('DEGLUDEC-CONCENTRATIONS')] },
  'MED-insulin-lispro-humalog-u100': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' }, evidenceRefs: [ref('HUMALOG-CONCENTRATIONS')] },
  'MED-insulin-lispro-humalog-u200': { state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 200, unit: 'units/mL' }, evidenceRefs: [ref('HUMALOG-CONCENTRATIONS')] },
  'MED-insulin-lispro-75-25': {
    state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' },
    components: [{ name: 'Insulin lispro protamine suspension', proportionPercent: 75 }, { name: 'Soluble insulin lispro', proportionPercent: 25 }],
    evidenceRefs: [ref('LISPRO-MIX-75-25')],
  },
  'MED-insulin-lispro-50-50': {
    state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' },
    components: [{ name: 'Insulin lispro protamine suspension', proportionPercent: 50 }, { name: 'Soluble insulin lispro', proportionPercent: 50 }],
    evidenceRefs: [ref('LISPRO-MIX-50-50')],
  },
  'MED-insulin-aspart-70-30': {
    state: 'SOURCE_LINKED_IDENTITY', concentration: { value: 100, unit: 'units/mL' },
    components: [{ name: 'Insulin aspart protamine suspension', proportionPercent: 70 }, { name: 'Soluble insulin aspart', proportionPercent: 30 }],
    evidenceRefs: [ref('ASPART-MIX-70-30')],
  },
  'MED-bromocriptine-qr': { state: 'SOURCE_LINKED_IDENTITY', tabletStrength: { value: 0.8, unit: 'mg' }, evidenceRefs: [ref('CYCLOSET-IDENTITY')] },
  'MED-bromocriptine-parlodel': { state: 'SOURCE_LINKED_IDENTITY', evidenceRefs: [ref('PARLODEL-IDENTITY')] },
};
const unspecified = new Set(['MED-insulin-glargine', 'MED-insulin-degludec', 'MED-insulin-lispro', 'MED-bromocriptine-unspecified']);

/** Composition is identity metadata, never a calculation of a patient's insulin dose. */
export const diabetesFormulationIdentities: Record<string, DiabetesFormulationIdentity> = Object.fromEntries(
  diabetesFormulationMedications.map((medication) => [medication.id, {
    medicationId: medication.id,
    version: 1 as const,
    ...(verified[medication.id] ?? { state: unspecified.has(medication.id) ? 'UNSPECIFIED' as const : 'PRODUCT_DETAIL_NOT_VERIFIED' as const, evidenceRefs: [] }),
    allowsDoseCalculation: false as const,
  }]),
);

export const diabetesFormulationAudit = {
  version: 1,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  marketAvailabilityAsserted: false,
  limitations: [
    'Source-linked identity is not an interchangeability, dosing, pump compatibility or clinical approval determination.',
    'Premix protamine-associated fractions are formulation components; protamine sulfate is not added as a separately prescribed active medication.',
    'Other product aliases, devices, release variants and legacy market metadata remain unverified at product level.',
    'Admelog, Lyumjev, Fiasp, Basaglar and Semglee remain ingredient-level recognition pending independent formulation records.',
  ],
} as const;
