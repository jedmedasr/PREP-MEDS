import { batch03IncretinIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch03IncretinIngredients: IngredientRecord[] = [
  { id: 'ING-tirzepatide', canonicalName: 'Tirzepatide' },
  { id: 'ING-exenatide', canonicalName: 'Exenatide' },
  { id: 'ING-liraglutide', canonicalName: 'Liraglutide' },
  { id: 'ING-dulaglutide', canonicalName: 'Dulaglutide' },
];

const classByIngredient: Record<string, string[]> = {
  'ING-tirzepatide': ['CLS-gip-glp1-receptor-agonist'],
  'ING-exenatide': ['CLS-glp1-receptor-agonist'],
  'ING-liraglutide': ['CLS-glp1-receptor-agonist'],
  'ING-dulaglutide': ['CLS-glp1-receptor-agonist'],
};

export const batch03IncretinBaseMedications: MedicationRecord[] = [
  {
    id: 'MED-tirzepatide',
    canonicalName: 'Tirzepatide (product/indication unspecified)',
    genericName: 'tirzepatide',
    brandNames: [],
    ingredientIds: ['ING-tirzepatide'],
    drugClassIds: ['CLS-gip-glp1-receptor-agonist'],
  },
  {
    id: 'MED-exenatide',
    canonicalName: 'Exenatide (formulation unspecified)',
    genericName: 'exenatide',
    brandNames: [],
    ingredientIds: ['ING-exenatide'],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  },
  {
    id: 'MED-liraglutide',
    canonicalName: 'Liraglutide (product/indication unspecified)',
    genericName: 'liraglutide',
    brandNames: [],
    ingredientIds: ['ING-liraglutide'],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  },
  {
    id: 'MED-dulaglutide',
    canonicalName: 'Dulaglutide (product identity unspecified)',
    genericName: 'dulaglutide',
    brandNames: [],
    ingredientIds: ['ING-dulaglutide'],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-tirzepatide-mounjaro': ['Mounjaro tirzepatide', 'tirzepatide Mounjaro'],
  'MED-tirzepatide-zepbound': ['Zepbound tirzepatide', 'tirzepatide Zepbound'],
  'MED-exenatide-byetta': ['Byetta exenatide', 'exenatide immediate release', 'exenatide immediate-release'],
  'MED-exenatide-bydureon-bcise': ['Bydureon BCise exenatide', 'exenatide extended release', 'exenatide extended-release'],
  'MED-liraglutide-victoza': ['Victoza liraglutide', 'liraglutide Victoza'],
  'MED-liraglutide-saxenda': ['Saxenda liraglutide', 'liraglutide Saxenda'],
  'MED-liraglutide-generic-weight-management': [
    'liraglutide weight management',
    'liraglutide injection weight management',
    'generic liraglutide weight management',
  ],
  'MED-dulaglutide-trulicity': ['Trulicity dulaglutide', 'dulaglutide Trulicity'],
};

export const batch03IncretinExplicitMedications: MedicationRecord[] =
  batch03IncretinIdentityDefinitions.map((product) => ({
    id: product.medicationId,
    canonicalName:
      product.brandName
        ? `${product.brandName} ${product.genericName}${product.formulation === 'EXTENDED_RELEASE' ? ' extended release' : product.formulation === 'IMMEDIATE_RELEASE' ? ' immediate release' : ''}`
        : product.genericName === 'liraglutide'
          ? 'Liraglutide injection (weight-management labeling)'
          : `${product.genericName} ${product.dosageForm.toLowerCase()}`,
    genericName: product.genericName,
    brandNames: product.brandName ? [product.brandName] : [],
    aliases: aliasesByMedication[product.medicationId] ?? [],
    ingredientIds: [product.ingredientId],
    drugClassIds: classByIngredient[product.ingredientId] ?? [],
  }));

export const batch03IncretinSearchMedications: MedicationRecord[] = [
  ...batch03IncretinBaseMedications,
  ...batch03IncretinExplicitMedications,
];

export const batch03IncretinTerminologyAudit = {
  status: 'CLINICAL_REVIEW_REQUIRED',
  genericUnspecifiedMedicationIds: batch03IncretinBaseMedications.map((item) => item.id),
  explicitMedicationIds: batch03IncretinIdentityDefinitions.map((item) => item.medicationId),
  limitations: [
    'Bare tirzepatide is intentionally ambiguous across Mounjaro and Zepbound product/indication identities.',
    'Bare exenatide is intentionally ambiguous across immediate-release Byetta and extended-release Bydureon BCise identities.',
    'Bare liraglutide is intentionally ambiguous across current diabetes and weight-management identities, including Victoza, Saxenda, and current generic liraglutide labeling.',
    'Bare dulaglutide remains product-unspecified; explicit Trulicity wording resolves only to the source-linked manufacturer identity.',
    'Product identity does not authorize substitution, dose conversion, peri-procedural hold/continue/restart instructions, or clinical approval.',
  ],
} as const;
