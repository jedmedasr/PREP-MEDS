import {
  batch03CurrentIncretinExpansionDefinitions,
  batch03HistoricalIncretinIdentityDefinitions,
  batch03IncretinIdentityDefinitions,
} from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

const allIncretinIdentityDefinitions = [
  ...batch03IncretinIdentityDefinitions,
  ...batch03HistoricalIncretinIdentityDefinitions,
  ...batch03CurrentIncretinExpansionDefinitions,
];

export const batch03IncretinIngredients: IngredientRecord[] = [
  { id: 'ING-tirzepatide', canonicalName: 'Tirzepatide' },
  { id: 'ING-exenatide', canonicalName: 'Exenatide' },
  { id: 'ING-liraglutide', canonicalName: 'Liraglutide' },
  { id: 'ING-dulaglutide', canonicalName: 'Dulaglutide' },
  // ING-lixisenatide is already assembled by the SOLIQUA fixed-combination module.
  { id: 'ING-albiglutide', canonicalName: 'Albiglutide' },
  { id: 'ING-orforglipron', canonicalName: 'Orforglipron' },
];

const classByIngredient: Record<string, string[]> = {
  'ING-tirzepatide': ['CLS-gip-glp1-receptor-agonist'],
  'ING-exenatide': ['CLS-glp1-receptor-agonist'],
  'ING-liraglutide': ['CLS-glp1-receptor-agonist'],
  'ING-dulaglutide': ['CLS-glp1-receptor-agonist'],
  'ING-lixisenatide': ['CLS-glp1-receptor-agonist'],
  'ING-albiglutide': ['CLS-glp1-receptor-agonist'],
  'ING-orforglipron': ['CLS-glp1-receptor-agonist'],
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
  {
    id: 'MED-lixisenatide',
    canonicalName: 'Lixisenatide (product identity unspecified)',
    genericName: 'lixisenatide',
    brandNames: [],
    ingredientIds: ['ING-lixisenatide'],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  },
  {
    id: 'MED-albiglutide',
    canonicalName: 'Albiglutide (product identity unspecified)',
    genericName: 'albiglutide',
    brandNames: [],
    ingredientIds: ['ING-albiglutide'],
    drugClassIds: ['CLS-glp1-receptor-agonist'],
  },
  {
    id: 'MED-orforglipron',
    canonicalName: 'Orforglipron (product identity unspecified)',
    genericName: 'orforglipron',
    brandNames: [],
    ingredientIds: ['ING-orforglipron'],
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
  'MED-lixisenatide-adlyxin': ['Adlyxin lixisenatide', 'lixisenatide Adlyxin', 'BLA208471'],
  'MED-albiglutide-tanzeum': ['Tanzeum albiglutide', 'albiglutide Tanzeum', 'BLA125431'],
  'MED-exenatide-generic-anda206697': ['Amneal exenatide', 'exenatide ANDA206697', 'ANDA206697'],
  'MED-orforglipron-foundayo': ['Foundayo orforglipron', 'orforglipron Foundayo', 'NDA220934'],
};

export const batch03IncretinExplicitMedications: MedicationRecord[] =
  allIncretinIdentityDefinitions.map((product) => ({
    id: product.medicationId,
    canonicalName:
      product.brandName
        ? `${product.brandName} ${product.genericName}${product.formulation === 'EXTENDED_RELEASE' ? ' extended release' : product.formulation === 'IMMEDIATE_RELEASE' ? ' immediate release' : ''}`
        : product.genericName === 'liraglutide'
          ? 'Liraglutide injection (weight-management labeling)'
          : product.medicationId === 'MED-exenatide-generic-anda206697'
            ? 'Exenatide injection (ANDA206697)'
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
  explicitMedicationIds: allIncretinIdentityDefinitions.map((item) => item.medicationId),
  limitations: [
    'Bare tirzepatide is intentionally ambiguous across Mounjaro and Zepbound product/indication identities.',
    'Bare exenatide is intentionally ambiguous across Byetta, Bydureon BCise, and the source-distinct current ANDA206697 product identity.',
    'Bare liraglutide is intentionally ambiguous across current diabetes and weight-management identities, including Victoza, Saxenda, and current generic liraglutide labeling.',
    'Bare dulaglutide remains product-unspecified; explicit Trulicity wording resolves only to the source-linked manufacturer identity.',
    'Bare lixisenatide and albiglutide remain product-unspecified; explicit Adlyxin and Tanzeum wording resolves only to their historical source-linked product identities.',
    'Bare orforglipron remains product-unspecified; explicit Foundayo wording resolves only to the source-linked oral product identity.',
    'FDA Purple Book Disc status for Adlyxin and Tanzeum is regulatory marketing-status provenance and is not treated as a real-time pharmacy-inventory or availability assertion.',
    'Product identity does not authorize substitution, dose conversion, peri-procedural hold/continue/restart instructions, or clinical approval.',
  ],
} as const;
