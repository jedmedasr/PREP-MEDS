import { afrezzaProductDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';
import {
  diabetesHumanInsulinIdentities, diabetesHumanInsulinMedications,
  type HumanInsulinIdentity,
} from './diabetes-human-insulin';

const genericStrengthAliases = [4, 8, 12].flatMap((units) => [
  `insulin human inhalation powder ${units} units per cartridge`,
  `inhaled insulin ${units} units per cartridge`,
]);

export const afrezzaMedications: MedicationRecord[] = afrezzaProductDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: product.labelledCartridgeUnits === undefined
    ? 'Afrezza (cartridge strength unspecified)'
    : `Afrezza ${product.labelledCartridgeUnits} unit cartridge`,
  genericName: product.labelledCartridgeUnits === undefined
    ? 'insulin human inhalation powder'
    : `insulin human inhalation powder ${product.labelledCartridgeUnits} units per cartridge`,
  // A bare brand must not choose a cartridge or prescribe a mealtime dose.
  brandNames: [product.brand],
  aliases: [
    ...product.aliases,
    ...(product.labelledCartridgeUnits === undefined ? [] : [`inhaled insulin ${product.labelledCartridgeUnits} units per cartridge`]),
  ],
  ingredientIds: [product.ingredientId], drugClassIds: [product.drugClassId],
}));

/** Keep all 52 earlier concepts, but detach Afrezza from the unspecified inhaled-insulin record. */
export const diabetesAfrezzaMedications: MedicationRecord[] = [
  ...diabetesHumanInsulinMedications.map((medication): MedicationRecord => medication.id === 'MED-inhaled-insulin'
    ? {
      ...medication, canonicalName: 'Inhaled human insulin (product/strength unspecified)',
      brandNames: [], aliases: ['inhaled insulin', 'insulin human inhalation powder', ...genericStrengthAliases],
    }
    : { ...medication }),
  ...afrezzaMedications,
];

export interface AfrezzaIdentity extends HumanInsulinIdentity {
  route?: 'ORAL_INHALATION';
  dosageForm?: 'INHALATION_POWDER';
  labelledCartridgeStrength?: { value: 4 | 8 | 12; unit: 'AFREZZA_LABEL_UNITS_PER_CARTRIDGE' };
  cartridgeStrengthState?: 'LABEL_STRENGTH_KNOWN' | 'UNSPECIFIED';
  prescribedDoseConfirmed?: false;
  cartridgeSelectionAuthorized?: false;
}

export const diabetesAfrezzaIdentities: Record<string, AfrezzaIdentity> = {
  ...diabetesHumanInsulinIdentities,
  'MED-inhaled-insulin': {
    medicationId: 'MED-inhaled-insulin', version: 2, state: 'UNSPECIFIED',
    evidenceRefs: [], allowsDoseCalculation: false, presentationConfirmed: false,
    deviceCompatibilityAuthorized: false, substitutionAuthorized: false,
  },
  ...Object.fromEntries(afrezzaProductDefinitions.map((product): [string, AfrezzaIdentity] => [
    product.medicationId,
    {
      medicationId: product.medicationId, version: 1, state: 'SOURCE_LINKED_IDENTITY',
      labelledActiveName: product.labelledActiveName, route: product.route, dosageForm: product.dosageForm,
      cartridgeStrengthState: product.labelledCartridgeUnits === undefined ? 'UNSPECIFIED' : 'LABEL_STRENGTH_KNOWN',
      ...(product.labelledCartridgeUnits === undefined ? {} : {
        labelledCartridgeStrength: { value: product.labelledCartridgeUnits, unit: 'AFREZZA_LABEL_UNITS_PER_CARTRIDGE' as const },
      }),
      evidenceRefs: [
        { id: 'EVD-B2-AFREZZA-CARTRIDGE-IDENTITY', version: 1 },
        { id: 'EVD-B2-AFREZZA-ROUTE-DEVICE-IDENTITY', version: 1 },
      ],
      allowsDoseCalculation: false, presentationConfirmed: false, deviceCompatibilityAuthorized: false,
      substitutionAuthorized: false, prescribedDoseConfirmed: false, cartridgeSelectionAuthorized: false,
    },
  ])),
};

export const diabetesAfrezzaAudit = {
  version: 4,
  status: 'PARTIAL_PRODUCT_AUDIT_CLINICAL_REVIEW_REQUIRED',
  completedWorkItem: 'B_AFREZZA_PRODUCT_IDENTITY_01',
  searchableConceptCount: diabetesAfrezzaMedications.length,
  sourceLinkedIdentityCount: Object.values(diabetesAfrezzaIdentities).filter((identity) => identity.state === 'SOURCE_LINKED_IDENTITY').length,
  marketAvailabilityAsserted: false,
  limitations: [
    'A family identity and three cartridge-strength identities are not four separate active ingredients.',
    'Cartridge label units are distinct from liquid concentration, package count and prescribed mealtime dose.',
    'Bare Afrezza is ambiguous; a titration-pack query retains unspecified cartridge strength.',
    'There is no automatic cartridge selection, dose arithmetic, insulin substitution or clinical approval.',
    'The selected label safety passages remain descriptive; full contraindication screening and pediatric workflow expansion are not implemented.',
    'Remaining insulin products, oral release variants and whole-regimen validation are still open.',
  ],
} as const;
