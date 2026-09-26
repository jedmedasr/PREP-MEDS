import { oralReleaseProductDefinitions, type OralReleaseProductDefinition } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import { diabetesHumalogAudit, diabetesHumalogMedications } from './diabetes-humalog';

const baseReplacements: Record<string, Partial<MedicationRecord>> = {
  'MED-metformin': {
    canonicalName: 'Metformin (release formulation unspecified)',
    genericName: 'metformin',
    brandNames: ['Glucophage'],
    aliases: [],
  },
  'MED-glipizide': {
    canonicalName: 'Glipizide (release formulation unspecified)',
    genericName: 'glipizide',
    brandNames: ['Glucotrol'],
    aliases: [],
  },
};

const reconciledBase = diabetesHumalogMedications.map((medication) => ({
  ...medication,
  ...(baseReplacements[medication.id] ?? {}),
}));

const explicitVariants: MedicationRecord[] = oralReleaseProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: `${product.genericName === 'metformin' ? 'Metformin' : 'Glipizide'} ${product.releaseForm === 'IMMEDIATE_RELEASE' ? 'immediate release' : 'extended release'}`,
  genericName: product.genericName,
  brandNames: product.brandNames,
  aliases: product.aliases,
  ingredientIds: [product.ingredientId],
  drugClassIds: [product.drugClassId],
}));

export const diabetesOralReleaseMedications: MedicationRecord[] = [...reconciledBase, ...explicitVariants];

export interface OralReleaseIdentity {
  medicationId: 'MED-metformin' | 'MED-metformin-ir' | 'MED-metformin-er' | 'MED-glipizide' | 'MED-glipizide-ir' | 'MED-glipizide-er';
  version: number;
  state: 'RELEASE_UNSPECIFIED' | 'SOURCE_LINKED_IDENTITY';
  releaseForm?: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  dosageForm?: 'TABLET';
  route?: 'ORAL';
  evidenceRefs: Array<{ id: string; version: number }>;
  allowsDoseCalculation: false;
  substitutionAuthorized: false;
  periProceduralActionAuthorized: false;
  marketAvailabilityAsserted: false;
}

const unspecified = (medicationId: 'MED-metformin' | 'MED-glipizide'): OralReleaseIdentity => ({
  medicationId, version: 1, state: 'RELEASE_UNSPECIFIED', evidenceRefs: [],
  allowsDoseCalculation: false, substitutionAuthorized: false, periProceduralActionAuthorized: false, marketAvailabilityAsserted: false,
});

const linked = (product: OralReleaseProductDefinition): OralReleaseIdentity => ({
  medicationId: product.medicationId,
  version: 1,
  state: 'SOURCE_LINKED_IDENTITY',
  releaseForm: product.releaseForm,
  dosageForm: product.dosageForm,
  route: product.route,
  evidenceRefs: product.evidenceRefs,
  allowsDoseCalculation: false,
  substitutionAuthorized: false,
  periProceduralActionAuthorized: false,
  marketAvailabilityAsserted: false,
});

export const diabetesOralReleaseIdentities: Record<string, OralReleaseIdentity> = {
  'MED-metformin': unspecified('MED-metformin'),
  'MED-glipizide': unspecified('MED-glipizide'),
  ...Object.fromEntries(oralReleaseProductDefinitions.map((product) => [product.medicationId, linked(product)])),
};

export const diabetesOralReleaseAudit = {
  version: 1,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem: 'B_ORAL_RELEASE_VARIANTS_01',
  searchableConceptCount: diabetesOralReleaseMedications.length,
  sourceLinkedIdentityCount: diabetesHumalogAudit.sourceLinkedIdentityCount + oralReleaseProductDefinitions.length,
  marketAvailabilityAsserted: false,
  limitations: [
    'Bare metformin and glipizide are intentionally release-form ambiguous and cannot resolve to IR or ER automatically.',
    'Legacy Glucophage and Glucotrol aliases remain mapped to release-unspecified base concepts; no release form is inferred from those unqualified brand names.',
    'Explicit ER/XR/XL and immediate-release wording can identify a release-form record but does not establish a patient dose or schedule.',
    'GLUCOTROL XL is authenticated only when the XL branding is explicit.',
    'No dose arithmetic, conversion, substitution, hold/restart instruction, pharmacy-inventory claim or clinical approval is encoded.',
    'Whole-regimen and malformed-input validation remain open.',
  ],
} as const;
