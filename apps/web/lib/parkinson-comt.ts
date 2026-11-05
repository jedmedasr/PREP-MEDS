import { parkinsonComtIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const parkinsonComtIngredients: IngredientRecord[] = [
  { id: 'ING-entacapone', canonicalName: 'Entacapone' },
  { id: 'ING-tolcapone', canonicalName: 'Tolcapone' },
  { id: 'ING-opicapone', canonicalName: 'Opicapone' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-entacapone-oral-tablet': { canonicalName: 'Entacapone oral tablet', genericName: 'entacapone', aliases: ['entacapone', 'entacapone tablet', 'entacapone oral tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-comt-inhibitor', 'CLS-parkinson-therapy'] },
  'MED-tolcapone-oral-tablet': { canonicalName: 'Tolcapone oral tablet', genericName: 'tolcapone', aliases: ['tolcapone', 'tolcapone tablet', 'tolcapone oral tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-comt-inhibitor', 'CLS-parkinson-therapy'] },
  'MED-ongentys-opicapone-oral-capsule': { canonicalName: 'ONGENTYS opicapone oral capsule', genericName: 'opicapone', brandNames: ['Ongentys'], aliases: ['opicapone', 'opicapone capsule', 'Ongentys', 'Ongentys capsule'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-comt-inhibitor', 'CLS-parkinson-therapy'] },
  'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet': { canonicalName: 'Carbidopa/levodopa/entacapone film-coated oral tablet', genericName: 'carbidopa/levodopa/entacapone', aliases: ['entacapone', 'carbidopa levodopa entacapone', 'carbidopa/levodopa/entacapone tablet', 'carbidopa levodopa entacapone tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-carbidopa-levodopa', 'CLS-comt-inhibitor'] },
};

export const parkinsonComtMedications: MedicationRecord[] = parkinsonComtIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
