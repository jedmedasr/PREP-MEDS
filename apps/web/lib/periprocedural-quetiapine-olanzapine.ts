import { periproceduralQuetiapineOlanzapineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralQuetiapineOlanzapineIngredients: IngredientRecord[] = [
  { id: 'ING-quetiapine', canonicalName: 'Quetiapine' },
  { id: 'ING-olanzapine', canonicalName: 'Olanzapine' },
];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-quetiapine-conventional-oral-tablet': { canonicalName: 'Quetiapine conventional oral tablet', genericName: 'quetiapine', aliases: ['quetiapine film-coated tablet', 'Seroquel tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-seroquel-xr-quetiapine-extended-release-oral-tablet': { canonicalName: 'SEROQUEL XR quetiapine extended-release oral tablet', genericName: 'quetiapine', brandNames: ['Seroquel XR'], aliases: ['quetiapine XR tablet', 'quetiapine extended-release tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-zyprexa-olanzapine-oral-tablet': { canonicalName: 'ZYPREXA olanzapine oral tablet', genericName: 'olanzapine', aliases: ['Zyprexa tablet', 'olanzapine conventional tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-zyprexa-zydis-olanzapine-orally-disintegrating-tablet': { canonicalName: 'ZYPREXA ZYDIS olanzapine orally disintegrating tablet', genericName: 'olanzapine', brandNames: ['Zyprexa Zydis'], aliases: ['olanzapine ODT'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-zyprexa-olanzapine-intramuscular-injection': { canonicalName: 'ZYPREXA INTRAMUSCULAR olanzapine injection powder for solution', genericName: 'olanzapine', brandNames: ['Zyprexa Intramuscular'], aliases: ['olanzapine intramuscular powder for solution', 'olanzapine non-extended-release IM injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-zyprexa-relprevv-olanzapine-er-intramuscular-injection': { canonicalName: 'ZYPREXA RELPREVV olanzapine extended-release intramuscular injection', genericName: 'olanzapine', brandNames: ['Zyprexa Relprevv'], aliases: ['olanzapine pamoate extended-release IM injection', 'olanzapine long-acting intramuscular injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
};
export const periproceduralQuetiapineOlanzapineMedications: MedicationRecord[] = periproceduralQuetiapineOlanzapineIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
