import { parkinsonAmantadineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const parkinsonAmantadineIngredients: IngredientRecord[] = [
  { id: 'ING-amantadine', canonicalName: 'Amantadine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-amantadine-hydrochloride-ir-oral-capsule': { canonicalName: 'Amantadine hydrochloride immediate-release oral capsule', genericName: 'amantadine hydrochloride', aliases: ['amantadine', 'amantadine capsule', 'amantadine IR capsule', 'amantadine immediate release capsule'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-amantadine', 'CLS-parkinson-therapy'] },
  'MED-amantadine-hydrochloride-ir-oral-tablet': { canonicalName: 'Amantadine hydrochloride immediate-release oral tablet', genericName: 'amantadine hydrochloride', aliases: ['amantadine', 'amantadine tablet', 'amantadine IR tablet', 'amantadine immediate release tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-amantadine', 'CLS-parkinson-therapy'] },
  'MED-amantadine-hydrochloride-oral-solution': { canonicalName: 'Amantadine hydrochloride oral solution', genericName: 'amantadine hydrochloride', aliases: ['amantadine', 'amantadine solution', 'amantadine oral solution', 'amantadine liquid'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-amantadine', 'CLS-parkinson-therapy'] },
  'MED-gocovri-amantadine-er-oral-capsule': { canonicalName: 'GOCOVRI amantadine extended-release oral capsule', genericName: 'amantadine', brandNames: ['Gocovri'], aliases: ['amantadine', 'Gocovri', 'Gocovri capsule', 'amantadine ER capsule', 'amantadine extended release capsule'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-amantadine', 'CLS-parkinson-therapy'] },
  'MED-osmolex-er-amantadine-er-oral-tablet': { canonicalName: 'OSMOLEX ER amantadine extended-release oral tablet', genericName: 'amantadine', brandNames: ['Osmolex ER'], aliases: ['amantadine', 'Osmolex ER', 'Osmolex ER tablet', 'amantadine ER tablet', 'amantadine extended release tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-amantadine', 'CLS-parkinson-therapy'] },
};

export const parkinsonAmantadineMedications: MedicationRecord[] = parkinsonAmantadineIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
