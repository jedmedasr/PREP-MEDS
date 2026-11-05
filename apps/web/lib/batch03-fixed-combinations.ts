import { batch03FixedCombinationIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch03FixedCombinationIngredients: IngredientRecord[] = [
  { id: 'ING-lixisenatide', canonicalName: 'Lixisenatide' },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-insulin-glargine-lixisenatide-soliqua': [
    'Soliqua',
    'Soliqua 100/33 insulin glargine lixisenatide',
    'insulin glargine lixisenatide',
    'iGlarLixi',
  ],
  'MED-insulin-degludec-liraglutide-xultophy': [
    'Xultophy',
    'Xultophy 100/3.6 insulin degludec liraglutide',
    'insulin degludec liraglutide',
    'IDegLira',
  ],
};

export const batch03FixedCombinationMedications: MedicationRecord[] =
  batch03FixedCombinationIdentityDefinitions.map((product) => ({
    id: product.medicationId,
    canonicalName: product.brandName,
    genericName: product.genericName,
    brandNames: [product.brandName],
    aliases: aliasesByMedication[product.medicationId] ?? [],
    ingredientIds: [...product.ingredientIds],
    drugClassIds: ['CLS-basal-insulin', 'CLS-glp1-receptor-agonist'],
  }));

export const batch03FixedCombinationTerminologyAudit = {
  status: 'CLINICAL_REVIEW_REQUIRED',
  explicitMedicationIds: batch03FixedCombinationMedications.map((item) => item.id),
  limitations: [
    'Each record is an indivisible fixed-combination product identity containing both a basal-insulin and a GLP-1 receptor agonist component.',
    'Search resolution does not authorize splitting a fixed combination into independently inferred component instructions.',
    'Product identity does not authorize insulin dose arithmetic, dose conversion, device settings, substitution, peri-procedural hold/continue/restart instructions, or clinical approval.',
  ],
} as const;
