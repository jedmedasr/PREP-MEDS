import {
  batch03QternIdentityDefinitions,
  batch03Sglt2CombinationIdentityDefinitions,
} from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch03Sglt2CombinationIngredients: IngredientRecord[] = [
  { id: 'ING-dapagliflozin', canonicalName: 'Dapagliflozin' },
  { id: 'ING-ertugliflozin', canonicalName: 'Ertugliflozin' },
  { id: 'ING-canagliflozin', canonicalName: 'Canagliflozin' },
];

const classesByMedication: Record<string,string[]> = {
  'MED-empagliflozin-linagliptin-glyxambi': ['CLS-sglt2-inhibitor','CLS-dpp4-inhibitor'],
  'MED-dapagliflozin-metformin-xigduo-xr': ['CLS-sglt2-inhibitor','CLS-metformin'],
  'MED-ertugliflozin-metformin-segluromet': ['CLS-sglt2-inhibitor','CLS-metformin'],
  'MED-ertugliflozin-sitagliptin-steglujan': ['CLS-sglt2-inhibitor','CLS-dpp4-inhibitor'],
  'MED-empagliflozin-metformin-synjardy': ['CLS-sglt2-inhibitor','CLS-metformin'],
  'MED-empagliflozin-metformin-synjardy-xr': ['CLS-sglt2-inhibitor','CLS-metformin'],
  'MED-empagliflozin-linagliptin-metformin-trijardy-xr': ['CLS-sglt2-inhibitor','CLS-dpp4-inhibitor','CLS-metformin'],
  'MED-canagliflozin-metformin-invokamet': ['CLS-sglt2-inhibitor','CLS-metformin'],
  'MED-canagliflozin-metformin-invokamet-xr': ['CLS-sglt2-inhibitor','CLS-metformin'],
};

const aliasesByMedication: Record<string,string[]> = {
  'MED-empagliflozin-linagliptin-glyxambi': ['Glyxambi empagliflozin linagliptin'],
  'MED-dapagliflozin-metformin-xigduo-xr': ['Xigduo','Xigduo XR dapagliflozin metformin','dapagliflozin metformin XR'],
  'MED-ertugliflozin-metformin-segluromet': ['Segluromet ertugliflozin metformin'],
  'MED-ertugliflozin-sitagliptin-steglujan': ['Steglujan ertugliflozin sitagliptin'],
  'MED-empagliflozin-metformin-synjardy': ['Synjardy empagliflozin metformin','empagliflozin metformin immediate release'],
  'MED-empagliflozin-metformin-synjardy-xr': ['Synjardy XR empagliflozin metformin','empagliflozin metformin XR'],
  'MED-empagliflozin-linagliptin-metformin-trijardy-xr': ['Trijardy','Trijardy XR empagliflozin linagliptin metformin'],
  'MED-canagliflozin-metformin-invokamet': ['Invokamet canagliflozin metformin','canagliflozin metformin immediate release'],
  'MED-canagliflozin-metformin-invokamet-xr': ['Invokamet XR canagliflozin metformin','canagliflozin metformin XR'],
};

const verifiedSglt2CombinationMedications: MedicationRecord[] =
  batch03Sglt2CombinationIdentityDefinitions.map((product) => ({
    id: product.medicationId,
    canonicalName: product.brandName,
    genericName: product.genericName,
    brandNames: [product.brandName],
    aliases: aliasesByMedication[product.medicationId] ?? [],
    ingredientIds: [...product.ingredientIds],
    drugClassIds: classesByMedication[product.medicationId] ?? ['CLS-sglt2-inhibitor'],
  }));

const qternReconciliationMedications: MedicationRecord[] = batch03QternIdentityDefinitions.map((product) => ({
  id: product.medicationId,
  canonicalName: product.canonicalName,
  genericName: product.genericName,
  brandNames: [...product.brandNames],
  aliases: [...product.aliases],
  ingredientIds: [...product.ingredientIds],
  drugClassIds: ['CLS-sglt2-inhibitor', 'CLS-dpp4-inhibitor'],
}));

export const batch03Sglt2CombinationMedications: MedicationRecord[] = [
  ...verifiedSglt2CombinationMedications,
  ...qternReconciliationMedications,
];

export const batch03Sglt2CombinationTerminologyAudit = {
  status: 'CLINICAL_REVIEW_REQUIRED',
  limitations: [
    'Each record preserves the source-defined fixed combination and authenticated product/application identity.',
    'Search resolution does not authorize component splitting, substitution, patient-specific dosing, commercial-availability inference, or peri-procedural timing.',
    'Bare dapagliflozin+saxagliptin wording remains ambiguous across branded and generic application identities.',
  ],
} as const;
