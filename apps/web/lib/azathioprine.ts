import { azathioprineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const azathioprineIngredients: IngredientRecord[] = [
  { id: 'ING-azathioprine', canonicalName: 'Azathioprine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-imuran-azathioprine-oral-tablet': { canonicalName: 'IMURAN azathioprine oral tablet', genericName: 'azathioprine oral tablet', brandNames: ['Imuran'], aliases: ['azathioprine', 'azathioprine tablet', 'Imuran', 'Imuran tablet'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
  'MED-azathioprine-sodium-intravenous-injection': { canonicalName: 'Azathioprine sodium intravenous injection', genericName: 'azathioprine sodium intravenous injection', aliases: ['azathioprine', 'azathioprine injection', 'azathioprine sodium injection', 'IV azathioprine'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
};

export const azathioprineMedications: MedicationRecord[] =
  azathioprineIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: ['ING-azathioprine'],
  }));
