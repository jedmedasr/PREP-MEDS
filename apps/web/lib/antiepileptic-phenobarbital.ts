import { antiepilepticPhenobarbitalIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticPhenobarbitalIngredients: IngredientRecord[] = [
  { id: 'ING-phenobarbital', canonicalName: 'Phenobarbital' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-phenobarbital-oral-tablet': { canonicalName: 'phenobarbital oral tablet', genericName: 'phenobarbital', brandNames: [], aliases: ['phenobarbital', 'phenobarbital tablet', 'phenobarbital oral tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-barbiturate'] },
  'MED-phenobarbital-oral-solution': { canonicalName: 'phenobarbital oral solution', genericName: 'phenobarbital', brandNames: [], aliases: ['phenobarbital', 'phenobarbital oral solution', 'phenobarbital solution', 'phenobarbital liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-barbiturate'] },
  'MED-phenobarbital-sodium-parenteral-injection': { canonicalName: 'phenobarbital sodium parenteral injection', genericName: 'phenobarbital sodium', brandNames: [], aliases: ['phenobarbital', 'phenobarbital sodium injection', 'phenobarbital injection', 'IV phenobarbital', 'IM phenobarbital', 'parenteral phenobarbital'], drugClassIds: ['CLS-antiepileptic', 'CLS-barbiturate'] },
};

export const antiepilepticPhenobarbitalMedications: MedicationRecord[] = antiepilepticPhenobarbitalIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
