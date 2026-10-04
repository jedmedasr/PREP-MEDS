import { periproceduralClozapineZiprasidoneIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralClozapineZiprasidoneIngredients: IngredientRecord[] = [
  { id: 'ING-clozapine', canonicalName: 'Clozapine' },
  { id: 'ING-ziprasidone-hydrochloride', canonicalName: 'Ziprasidone hydrochloride' },
  { id: 'ING-ziprasidone-mesylate', canonicalName: 'Ziprasidone mesylate' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-clozapine-oral-tablet': { canonicalName: 'Clozapine conventional oral tablet', genericName: 'clozapine', aliases: ['clozapine tablet', 'Clozaril tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-clozapine-orally-disintegrating-tablet': { canonicalName: 'Clozapine orally disintegrating tablet', genericName: 'clozapine', aliases: ['clozapine ODT', 'Fazaclo ODT'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-versacloz-clozapine-oral-suspension': { canonicalName: 'VERSACLOZ clozapine oral suspension', genericName: 'clozapine', brandNames: ['Versacloz'], aliases: ['clozapine suspension', 'clozapine oral liquid'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-geodon-ziprasidone-hydrochloride-oral-capsule': { canonicalName: 'GEODON ziprasidone hydrochloride oral capsule', genericName: 'ziprasidone', brandNames: ['Geodon'], aliases: ['Geodon capsule', 'ziprasidone oral capsule'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-geodon-ziprasidone-mesylate-intramuscular-injection': { canonicalName: 'GEODON ziprasidone mesylate intramuscular injection', genericName: 'ziprasidone', brandNames: ['Geodon'], aliases: ['Geodon injection', 'ziprasidone IM injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
};

export const periproceduralClozapineZiprasidoneMedications: MedicationRecord[] = periproceduralClozapineZiprasidoneIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
