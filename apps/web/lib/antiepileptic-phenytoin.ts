import { antiepilepticPhenytoinIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const antiepilepticPhenytoinIngredients: IngredientRecord[] = [
  { id: 'ING-phenytoin', canonicalName: 'Phenytoin' },
  { id: 'ING-fosphenytoin', canonicalName: 'Fosphenytoin' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-dilantin-phenytoin-sodium-er-oral-capsule': { canonicalName: 'DILANTIN extended phenytoin sodium oral capsule', genericName: 'extended phenytoin sodium', brandNames: ['Dilantin'], aliases: ['phenytoin', 'Dilantin', 'phenytoin sodium capsule', 'extended phenytoin sodium capsule', 'phenytoin extended release capsule', 'Dilantin capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-phenytoin'] },
  'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet': { canonicalName: 'DILANTIN INFATABS phenytoin chewable oral tablet', genericName: 'phenytoin', brandNames: ['Dilantin Infatabs'], aliases: ['phenytoin', 'Dilantin', 'Dilantin Infatabs', 'phenytoin chewable tablet', 'Dilantin chewable tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-phenytoin'] },
  'MED-dilantin-125-phenytoin-oral-suspension': { canonicalName: 'DILANTIN-125 phenytoin oral suspension', genericName: 'phenytoin', brandNames: ['Dilantin-125'], aliases: ['phenytoin', 'Dilantin', 'Dilantin-125', 'phenytoin oral suspension', 'Dilantin suspension', 'phenytoin liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-phenytoin'] },
  'MED-phenytoin-sodium-parenteral-injection': { canonicalName: 'phenytoin sodium parenteral injection', genericName: 'phenytoin sodium', brandNames: [], aliases: ['phenytoin', 'phenytoin sodium injection', 'IV phenytoin', 'intravenous phenytoin', 'parenteral phenytoin'], drugClassIds: ['CLS-antiepileptic', 'CLS-phenytoin'] },
  'MED-cerebyx-fosphenytoin-sodium-parenteral-injection': { canonicalName: 'CEREBYX fosphenytoin sodium parenteral injection', genericName: 'fosphenytoin sodium', brandNames: ['Cerebyx'], aliases: ['fosphenytoin', 'Cerebyx', 'fosphenytoin sodium injection', 'IV fosphenytoin', 'IM fosphenytoin', 'parenteral fosphenytoin'], drugClassIds: ['CLS-antiepileptic', 'CLS-fosphenytoin'] },
};

export const antiepilepticPhenytoinMedications: MedicationRecord[] = antiepilepticPhenytoinIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
