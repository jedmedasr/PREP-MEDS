import { humanInsulinProductDefinitions, type HumanInsulinProductDefinition } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import { diabetesProductIdentities, diabetesProductMedications, type InsulinProductIdentity } from './diabetes-insulin-products';

const strengthAliases = (name: string, strength: number): string[] => [
  `${name} U-${strength}`, `${name} U${strength}`, `${name} ${strength} units/mL`,
];

const replacements: Record<string, Partial<MedicationRecord>> = {
  'MED-insulin-nph': {
    canonicalName: 'Human NPH insulin (product/concentration unspecified)', brandNames: [],
    aliases: ['NPH', 'NPH insulin', 'intermediate acting insulin', ...strengthAliases('NPH', 100), ...strengthAliases('NPH insulin', 100), ...strengthAliases('insulin isophane human', 100)],
  },
  'MED-regular-insulin': {
    canonicalName: 'Regular human insulin (product/concentration unspecified)', brandNames: [],
    aliases: ['regular insulin', 'short acting insulin', ...strengthAliases('regular insulin', 100), ...strengthAliases('insulin human', 100), ...strengthAliases('insulin human regular', 100)],
  },
  'MED-regular-insulin-u500': {
    canonicalName: 'Regular human insulin U-500 (product/presentation unspecified)', brandNames: [],
    aliases: ['U500 insulin', 'U-500 insulin', 'concentrated insulin', ...strengthAliases('regular insulin', 500), ...strengthAliases('insulin human', 500), ...strengthAliases('insulin human regular', 500)],
  },
  'MED-insulin-human-70-30': {
    canonicalName: 'Human NPH/regular 70/30 (product/concentration unspecified)', brandNames: [],
    aliases: ['human insulin 70/30', '70/30 insulin', '70/30', 'premixed insulin'],
  },
};

export const humanInsulinProductMedications: MedicationRecord[] = humanInsulinProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: `${product.brand} U-${product.concentration} (${product.labelledActiveName})`,
  genericName: `${product.labelledActiveName} U-${product.concentration}`,
  // HUMULIN R is deliberately shared by its U-100 and U-500 product identities.
  brandNames: [product.brand],
  aliases: [...strengthAliases(product.brand, product.concentration), ...product.aliases],
  ingredientIds: [...product.ingredientIds], drugClassIds: [product.drugClassId],
}));

/** Preserve all 45 earlier concepts. Broad family terms cannot identify one product. */
export const diabetesHumanInsulinMedications: MedicationRecord[] = [
  ...diabetesProductMedications.map((medication) => {
    const updated = { ...medication, ...(replacements[medication.id] ?? {}) };
    const concentration = diabetesProductIdentities[medication.id]?.concentration?.value;
    const broadAliases: string[] = [];
    if (concentration !== undefined && concentration > 100) broadAliases.push('concentrated insulin');
    if (medication.id === 'MED-insulin-aspart-70-30') broadAliases.push('70/30 insulin', '70/30');
    return { ...updated, aliases: [...new Set([...(updated.aliases ?? []), ...broadAliases])] };
  }),
  ...humanInsulinProductMedications.map((medication) => ({
    ...medication,
    aliases: [...(medication.aliases ?? []), ...(medication.id === 'MED-insulin-regular-humulin-u500' ? ['concentrated insulin'] : [])],
  })),
];

export interface HumanInsulinIdentity extends Omit<InsulinProductIdentity, 'version'> {
  version: number;
  preparation?: HumanInsulinProductDefinition['preparation'];
  independentlyAdjustableComponents?: false;
  substitutionAuthorized?: false;
}

const unspecifiedIdentity = (medicationId: string): HumanInsulinIdentity => ({
  medicationId, version: 2, state: 'UNSPECIFIED', evidenceRefs: [], allowsDoseCalculation: false,
  presentationConfirmed: false, deviceCompatibilityAuthorized: false, substitutionAuthorized: false,
});

export const diabetesHumanInsulinIdentities: Record<string, HumanInsulinIdentity> = {
  ...diabetesProductIdentities,
  'MED-insulin-nph': unspecifiedIdentity('MED-insulin-nph'),
  'MED-regular-insulin': unspecifiedIdentity('MED-regular-insulin'),
  'MED-insulin-human-70-30': unspecifiedIdentity('MED-insulin-human-70-30'),
  'MED-regular-insulin-u500': {
    ...unspecifiedIdentity('MED-regular-insulin-u500'),
    // Known concentration does not supply the missing branded product/presentation.
    concentration: { value: 500, unit: 'units/mL' },
  },
  ...Object.fromEntries(humanInsulinProductDefinitions.map((product): [string, HumanInsulinIdentity] => [
    product.medicationId,
    {
      medicationId: product.medicationId, version: 1, state: 'SOURCE_LINKED_IDENTITY',
      labelledActiveName: product.labelledActiveName, preparation: product.preparation,
      concentration: { value: product.concentration, unit: 'units/mL' },
      evidenceRefs: [{ id: `EVD-B2-HUMAN-${product.labelKey}`, version: 1 }],
      ...(product.components ? {
        components: product.components.map((component) => ({ ...component })),
        independentlyAdjustableComponents: false as const,
      } : {}),
      allowsDoseCalculation: false, presentationConfirmed: false,
      deviceCompatibilityAuthorized: false, substitutionAuthorized: false,
    },
  ])),
};

export const diabetesHumanInsulinAudit = {
  version: 3,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem: 'B_HUMAN_INSULIN_PRODUCTS_01',
  searchableConceptCount: diabetesHumanInsulinMedications.length,
  sourceLinkedIdentityCount: Object.values(diabetesHumanInsulinIdentities).filter((identity) => identity.state === 'SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted: false,
  limitations: [
    'Product and concentration are catalog metadata, not prescription, presentation, regimen or device confirmation.',
    'U-500 remains in the concentrated-insulin review pathway; no conversion or U-100 prandial instruction is applied.',
    'Human 70/30 and analog 70/30 are distinct formulations. Fixed mixture fractions do not yield separate patient instructions.',
    'Original ingredient-level concepts and earlier catalog/evidence snapshots remain available for audit.',
    'Inhaled insulin, remaining insulin products, oral release variants and whole-regimen validation are still open.',
  ],
} as const;
