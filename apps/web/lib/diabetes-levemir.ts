import { levemirProductDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import {
  diabetesApidraIdentities, diabetesApidraMedications,
  type ApidraIdentity,
} from './diabetes-apidra';

const strengthAliases = (name: string): string[] => [
  `${name} U-100`, `${name} U100`, `${name} 100 units/mL`,
];

const replacements: Record<string, Partial<MedicationRecord>> = {
  'MED-insulin-detemir': {
    canonicalName: 'Insulin detemir (product/concentration unspecified)',
    brandNames: [],
    aliases: ['detemir', 'basal insulin', ...strengthAliases('insulin detemir'), ...strengthAliases('detemir')],
  },
};

export const levemirMedications: MedicationRecord[] = levemirProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: `${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName: `${product.labelledActiveName} U-${product.concentration}`,
  brandNames: [product.brand],
  aliases: [`${product.brand} U-${product.concentration}`, ...product.aliases],
  ingredientIds: [product.ingredientId],
  drugClassIds: [product.drugClassId],
}));

export const diabetesLevemirMedications: MedicationRecord[] = [
  ...diabetesApidraMedications.map((medication) => ({ ...medication, ...(replacements[medication.id] ?? {}) })),
  ...levemirMedications,
];

export interface LevemirIdentity extends ApidraIdentity {
  usMarketingStatus?: 'DISCONTINUED';
  marketingStatusEvidenceRefs?: Array<{ id: string; version: number }>;
  marketingStatusDatabaseUpdatedAt?: string;
}

const unspecifiedDetemir: LevemirIdentity = {
  medicationId: 'MED-insulin-detemir',
  version: 2,
  state: 'UNSPECIFIED',
  evidenceRefs: [],
  allowsDoseCalculation: false,
  presentationConfirmed: false,
  deviceCompatibilityAuthorized: false,
  substitutionAuthorized: false,
};

export const diabetesLevemirIdentities: Record<string, LevemirIdentity> = {
  ...diabetesApidraIdentities,
  'MED-insulin-detemir': unspecifiedDetemir,
  ...Object.fromEntries(levemirProductDefinitions.map((product): [string, LevemirIdentity] => [
    product.medicationId,
    {
      medicationId: product.medicationId,
      version: 1,
      state: 'SOURCE_LINKED_IDENTITY',
      labelledActiveName: product.labelledActiveName,
      concentration: { value: product.concentration, unit: 'units/mL' },
      evidenceRefs: [{ id: 'EVD-B2-LEVEMIR-PRODUCT-IDENTITY', version: 1 }],
      usMarketingStatus: 'DISCONTINUED',
      marketingStatusEvidenceRefs: [{ id: 'EVD-B2-LEVEMIR-US-MARKETING-STATUS', version: 1 }],
      marketingStatusDatabaseUpdatedAt: '2026-09-11',
      allowsDoseCalculation: false,
      presentationConfirmed: false,
      deviceCompatibilityAuthorized: false,
      substitutionAuthorized: false,
    },
  ])),
};

export const diabetesLevemirAudit = {
  version: 6,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem: 'B_LEVEMIR_PRODUCT_IDENTITY_01',
  searchableConceptCount: diabetesLevemirMedications.length,
  sourceLinkedIdentityCount: Object.values(diabetesLevemirIdentities).filter((identity) => identity.state === 'SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted: false,
  marketingStatusVerified: true,
  discontinuedBrandedProductCount: 1,
  limitations: [
    'FDA Purple Book marketing status Disc is encoded separately from the historical branded product identity.',
    'Discontinued marketing status is not an assertion that no pharmacy, patient or repackager inventory remains.',
    'Generic insulin detemir plus concentration does not authenticate the Levemir manufacturer identity.',
    'Vial and pen presentation history does not confirm a patient presentation or authorize a device.',
    'No dose arithmetic, insulin conversion, substitution, transition, hold/restart instruction or clinical approval is encoded.',
    'NovoLog/aspart, Humalog reconciliation, oral release variants and whole-regimen validation remain open.',
  ],
} as const;
