import { periproceduralRisperidoneIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralRisperidoneIngredients: IngredientRecord[] = [{ id: 'ING-risperidone', canonicalName: 'Risperidone' }];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-risperidone-oral-tablet': { canonicalName: 'Risperidone oral tablet', genericName: 'risperidone', aliases: ['risperidone conventional tablet', 'Risperdal tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-risperidone-oral-solution': { canonicalName: 'Risperidone oral solution', genericName: 'risperidone', aliases: ['risperidone solution', 'Risperdal oral solution'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-risperidone-orally-disintegrating-tablet': { canonicalName: 'Risperidone orally disintegrating tablet', genericName: 'risperidone', aliases: ['risperidone ODT', 'Risperdal M-Tab'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-risperdal-consta-risperidone-er-intramuscular-injection': { canonicalName: 'RISPERDAL CONSTA risperidone extended-release intramuscular injection', genericName: 'risperidone', brandNames: ['Risperdal Consta'], aliases: ['risperidone long-acting intramuscular injection', 'risperidone LAI IM'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-perseris-risperidone-er-subcutaneous-injection': { canonicalName: 'PERSERIS risperidone extended-release subcutaneous injection', genericName: 'risperidone', brandNames: ['Perseris'], aliases: ['risperidone Perseris subcutaneous injection', 'Perseris SC'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-uzedy-risperidone-er-subcutaneous-injection': { canonicalName: 'UZEDY risperidone extended-release subcutaneous injection', genericName: 'risperidone', brandNames: ['Uzedy'], aliases: ['risperidone Uzedy subcutaneous injection', 'Uzedy SC'], drugClassIds: ['CLS-atypical-antipsychotic'] },
};
export const periproceduralRisperidoneMedications: MedicationRecord[] = periproceduralRisperidoneIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
