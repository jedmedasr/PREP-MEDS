import { parkinsonOralDopamineAgonistIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const parkinsonOralDopamineAgonistIngredients: IngredientRecord[] = [
  { id: 'ING-pramipexole', canonicalName: 'Pramipexole' },
  { id: 'ING-ropinirole', canonicalName: 'Ropinirole' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-pramipexole-dihydrochloride-ir-oral-tablet': { canonicalName: 'Pramipexole dihydrochloride immediate-release oral tablet', genericName: 'pramipexole dihydrochloride immediate release', aliases: ['pramipexole', 'pramipexole tablet', 'pramipexole immediate-release tablet', 'pramipexole IR tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-dopamine-agonist'] },
  'MED-pramipexole-dihydrochloride-er-oral-tablet': { canonicalName: 'Pramipexole dihydrochloride extended-release oral tablet', genericName: 'pramipexole dihydrochloride extended release', aliases: ['pramipexole', 'pramipexole tablet', 'pramipexole extended-release tablet', 'pramipexole ER tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-dopamine-agonist'] },
  'MED-ropinirole-hydrochloride-ir-film-coated-tablet': { canonicalName: 'Ropinirole hydrochloride immediate-release film-coated oral tablet', genericName: 'ropinirole hydrochloride immediate release', aliases: ['ropinirole', 'ropinirole tablet', 'ropinirole immediate-release tablet', 'ropinirole IR tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-dopamine-agonist'] },
  'MED-ropinirole-hydrochloride-er-film-coated-tablet': { canonicalName: 'Ropinirole hydrochloride extended-release film-coated oral tablet', genericName: 'ropinirole hydrochloride extended release', aliases: ['ropinirole', 'ropinirole tablet', 'ropinirole extended-release tablet', 'ropinirole ER tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-dopamine-agonist'] },
};

export const parkinsonOralDopamineAgonistMedications: MedicationRecord[] =
  parkinsonOralDopamineAgonistIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
