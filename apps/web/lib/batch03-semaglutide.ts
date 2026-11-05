import { batch03SemaglutideIdentityDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';

export const batch03SemaglutideBaseMedication: MedicationRecord = {
  id: 'MED-semaglutide',
  canonicalName: 'Semaglutide (product/route unspecified)',
  genericName: 'semaglutide',
  brandNames: [],
  aliases: ['semiglutide'],
  ingredientIds: ['ING-semaglutide'],
  drugClassIds: ['CLS-glp1-receptor-agonist'],
};

export const batch03SemaglutideExplicitMedications: MedicationRecord[] =
  batch03SemaglutideIdentityDefinitions.map((product) => ({
    id: product.medicationId,
    canonicalName: `${product.brandName} semaglutide ${product.route === 'ORAL' ? 'oral tablet' : 'subcutaneous injection'}`,
    genericName: product.genericName,
    brandNames: [product.brandName],
    aliases: product.aliases,
    ingredientIds: [product.ingredientId],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  }));

export const batch03SemaglutideSearchMedications: MedicationRecord[] = [
  batch03SemaglutideBaseMedication,
  ...batch03SemaglutideExplicitMedications,
];

export const batch03SemaglutideTerminologyAudit = {
  status: 'CLINICAL_REVIEW_REQUIRED',
  genericUnspecifiedMedicationId: 'MED-semaglutide',
  explicitMedicationIds: batch03SemaglutideIdentityDefinitions.map((item) => item.medicationId),
  limitations: [
    'Bare semaglutide is intentionally ambiguous across the product/route-specific identities.',
    'Ozempic and Wegovy brand-only wording is intentionally ambiguous because current labeling contains both oral and subcutaneous formulations.',
    'Rybelsus is source-linked to the oral semaglutide identity.',
    'Search resolution does not authorize substitution, dose conversion, peri-procedural hold/continue/restart instructions, or clinical approval.',
  ],
} as const;
