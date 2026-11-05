import { parkinsonCoreIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const parkinsonCoreIngredients: IngredientRecord[] = [
  { id: 'ING-carbidopa', canonicalName: 'Carbidopa' },
  { id: 'ING-levodopa', canonicalName: 'Levodopa', aliases: ['L-DOPA'] },
  { id: 'ING-rotigotine', canonicalName: 'Rotigotine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-carbidopa-levodopa-ir-oral-tablet': { canonicalName: 'Carbidopa/levodopa immediate-release oral tablet', genericName: 'carbidopa/levodopa immediate release', aliases: ['carbidopa levodopa', 'levodopa', 'carbidopa levodopa tablet', 'carbidopa levodopa immediate-release tablet', 'carbidopa levodopa IR tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa'] },
  'MED-carbidopa-levodopa-er-oral-tablet': { canonicalName: 'Carbidopa/levodopa extended-release oral tablet', genericName: 'carbidopa/levodopa extended release', aliases: ['carbidopa levodopa', 'levodopa', 'carbidopa levodopa tablet', 'carbidopa levodopa extended-release tablet', 'carbidopa levodopa ER tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa'] },
  'MED-rytary-carbidopa-levodopa-er-capsule': { canonicalName: 'RYTARY carbidopa/levodopa extended-release oral capsule', genericName: 'carbidopa/levodopa extended release', brandNames: ['Rytary'], aliases: ['Rytary', 'Rytary capsule', 'carbidopa levodopa', 'levodopa', 'carbidopa levodopa extended-release capsule'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa'] },
  'MED-crexont-carbidopa-levodopa-er-capsule': { canonicalName: 'CREXONT carbidopa/levodopa extended-release oral capsule', genericName: 'carbidopa/levodopa extended release', brandNames: ['Crexont'], aliases: ['Crexont', 'Crexont capsule', 'carbidopa levodopa', 'levodopa', 'carbidopa levodopa extended-release capsule'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa'] },
  'MED-duopa-carbidopa-levodopa-enteral-suspension': { canonicalName: 'DUOPA carbidopa/levodopa enteral suspension', genericName: 'carbidopa/levodopa enteral suspension', brandNames: ['Duopa'], aliases: ['Duopa', 'Duopa suspension', 'carbidopa levodopa', 'levodopa', 'carbidopa levodopa enteral suspension'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa', 'CLS-enteral-pump-therapy'] },
  'MED-inbrija-levodopa-inhalation-capsule': { canonicalName: 'INBRIJA levodopa inhalation powder capsule', genericName: 'levodopa inhalation powder', brandNames: ['Inbrija'], aliases: ['Inbrija', 'Inbrija inhaler', 'levodopa', 'levodopa inhalation powder', 'levodopa capsule for inhalation'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-inhaled-levodopa'] },
  'MED-neupro-rotigotine-er-transdermal-patch': { canonicalName: 'NEUPRO rotigotine extended-release transdermal patch', genericName: 'rotigotine extended release', brandNames: ['Neupro'], aliases: ['Neupro', 'Neupro patch', 'rotigotine', 'rotigotine patch', 'rotigotine transdermal patch'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-dopamine-agonist'] },
};

export const parkinsonCoreMedications: MedicationRecord[] =
  parkinsonCoreIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
