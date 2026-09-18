import type { MedicationRecord } from '@prep-meds/terminology';
import { diabetesInsulinProductDefinitions } from '@prep-meds/clinical-content';
import {
  diabetesFormulationIdentities, diabetesFormulationMedications,
  type DiabetesFormulationIdentity,
} from './diabetes-formulations';

/** A numeric ingredient query may narrow concentration, but must not manufacture a brand identity. */
function strengthAliases(name: string, strengths: number[]): string[] {
  return strengths.flatMap((strength) => [
    `${name} U-${strength}`, `${name} U${strength}`, `${name} ${strength} units/mL`,
  ]);
}
const replacements: Record<string, Partial<MedicationRecord>> = {
  'MED-insulin-lispro': {
    brandNames: [],
    aliases: ['lispro', 'rapid acting insulin', ...strengthAliases('insulin lispro', [100, 200]), ...strengthAliases('lispro', [100, 200])],
  },
  'MED-insulin-glargine': {
    brandNames: [],
    aliases: [
      'glargine', 'basal insulin', 'insulin glargine-yfgn', 'glargine-yfgn',
      ...strengthAliases('insulin glargine', [100, 300]), ...strengthAliases('glargine', [100, 300]),
      ...strengthAliases('insulin glargine-yfgn', [100]), ...strengthAliases('glargine-yfgn', [100]),
    ],
  },
  'MED-insulin-aspart': {
    canonicalName: 'Insulin aspart (product/presentation unspecified)',
    brandNames: ['NovoLog'],
    aliases: ['aspart', 'rapid acting insulin', ...strengthAliases('insulin aspart', [100]), ...strengthAliases('aspart', [100])],
  },
};

export const additionalInsulinProductMedications: MedicationRecord[] = diabetesInsulinProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: `${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName: `${product.labelledActiveName} U-${product.concentration}`,
  brandNames: [product.brand],
  aliases: [`${product.brand} U-${product.concentration}`, ...product.aliases],
  ingredientIds: [product.ingredientId], drugClassIds: [product.drugClassId],
}));

/** Do not modify the earlier 39-concept release or its evidence/identity records. */
export const diabetesProductMedications: MedicationRecord[] = [
  ...diabetesFormulationMedications.map((medication) => ({ ...medication, ...(replacements[medication.id] ?? {}) })),
  ...additionalInsulinProductMedications,
];

export interface InsulinProductIdentity extends DiabetesFormulationIdentity {
  labelledActiveName?: string;
  ingredientMapping?: 'ACTIVE_MOIETY_ONLY';
  presentationConfirmed?: false;
  deviceCompatibilityAuthorized?: false;
}
export const diabetesProductIdentities: Record<string, InsulinProductIdentity> = {
  ...diabetesFormulationIdentities,
  ...Object.fromEntries(diabetesInsulinProductDefinitions.map((product): [string, InsulinProductIdentity] => [
    product.medicationId,
    {
      medicationId: product.medicationId, version: 1, state: 'SOURCE_LINKED_IDENTITY',
      labelledActiveName: product.labelledActiveName, ingredientMapping: 'ACTIVE_MOIETY_ONLY',
      concentration: { value: product.concentration, unit: 'units/mL' },
      evidenceRefs: [{ id: `EVD-B2-PRODUCT-${product.family}`, version: 1 }],
      allowsDoseCalculation: false, presentationConfirmed: false, deviceCompatibilityAuthorized: false,
    },
  ])),
};

export const diabetesProductAudit = {
  version: 2,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedFamilies: ['LYUMJEV', 'ADMELOG', 'FIASP', 'BASAGLAR', 'SEMGLEE'],
  searchableConceptCount: diabetesProductMedications.length,
  sourceLinkedIdentityCount: Object.values(diabetesProductIdentities).filter((identity) => identity.state === 'SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted: false,
  limitations: [
    'Product plus concentration does not establish presentation, current prescription, interchangeability or device compatibility.',
    'Lispro-aabc and glargine-yfgn names are preserved; shared ingredient IDs are local active-moiety groupings only.',
    'Generic ingredient-plus-concentration queries must not uniquely select a labelled manufacturer.',
    'Original human-insulin, inhaled-insulin, other insulin-product and oral release-variant audits remain incomplete.',
  ],
} as const;
