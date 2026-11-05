import { apidraProductDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import {
  diabetesAfrezzaIdentities, diabetesAfrezzaMedications,
  type AfrezzaIdentity,
} from './diabetes-afrezza';

const strengthAliases = (name: string): string[] => [
  `${name} U-100`, `${name} U100`, `${name} 100 units/mL`,
];

const replacements: Record<string, Partial<MedicationRecord>> = {
  'MED-insulin-glulisine': {
    canonicalName: 'Insulin glulisine (product/concentration unspecified)',
    brandNames: [],
    aliases: [
      'glulisine', 'rapid acting insulin',
      ...strengthAliases('insulin glulisine'),
      ...strengthAliases('glulisine'),
    ],
  },
};

export const apidraMedications: MedicationRecord[] = apidraProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: `${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName: `${product.labelledActiveName} U-${product.concentration}`,
  brandNames: [product.brand],
  aliases: [`${product.brand} U-${product.concentration}`, ...product.aliases],
  ingredientIds: [product.ingredientId],
  drugClassIds: [product.drugClassId],
}));

/** Keep the 56-concept Afrezza snapshot intact; only the assembled current release detaches Apidra from the generic glulisine record. */
export const diabetesApidraMedications: MedicationRecord[] = [
  ...diabetesAfrezzaMedications.map((medication) => ({ ...medication, ...(replacements[medication.id] ?? {}) })),
  ...apidraMedications,
];

export interface ApidraIdentity extends AfrezzaIdentity {
  substitutionAuthorized?: false;
}

const unspecifiedGlulisine: ApidraIdentity = {
  medicationId: 'MED-insulin-glulisine',
  version: 2,
  state: 'UNSPECIFIED',
  evidenceRefs: [],
  allowsDoseCalculation: false,
  presentationConfirmed: false,
  deviceCompatibilityAuthorized: false,
  substitutionAuthorized: false,
};

export const diabetesApidraIdentities: Record<string, ApidraIdentity> = {
  ...diabetesAfrezzaIdentities,
  'MED-insulin-glulisine': unspecifiedGlulisine,
  ...Object.fromEntries(apidraProductDefinitions.map((product): [string, ApidraIdentity] => [
    product.medicationId,
    {
      medicationId: product.medicationId,
      version: 1,
      state: 'SOURCE_LINKED_IDENTITY',
      labelledActiveName: product.labelledActiveName,
      concentration: { value: product.concentration, unit: 'units/mL' },
      evidenceRefs: [{ id: 'EVD-B2-APIDRA-PRODUCT-IDENTITY', version: 1 }],
      allowsDoseCalculation: false,
      presentationConfirmed: false,
      deviceCompatibilityAuthorized: false,
      substitutionAuthorized: false,
    },
  ])),
};

export const diabetesApidraAudit = {
  version: 5,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem: 'B_APIDRA_PRODUCT_IDENTITY_01',
  searchableConceptCount: diabetesApidraMedications.length,
  sourceLinkedIdentityCount: Object.values(diabetesApidraIdentities).filter((identity) => identity.state === 'SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted: false,
  limitations: [
    'The source-linked U-100 product identity does not authenticate a patient prescription or presentation.',
    'Generic insulin glulisine plus concentration does not establish the Apidra manufacturer identity.',
    'Vial and SoloStar label passages are evidence metadata, not automatic presentation selection or device authorization.',
    'No dose arithmetic, insulin conversion, substitution, hold/restart instruction or clinical approval is encoded.',
    'NovoLog/aspart, detemir/Levemir, Humalog reconciliation, oral release variants and whole-regimen validation remain open.',
  ],
} as const;
