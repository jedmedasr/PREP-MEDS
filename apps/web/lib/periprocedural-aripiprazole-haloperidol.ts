import { periproceduralAripiprazoleHaloperidolIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralAripiprazoleHaloperidolIngredients: IngredientRecord[] = [
  { id: 'ING-aripiprazole', canonicalName: 'Aripiprazole' },
  { id: 'ING-aripiprazole-lauroxil', canonicalName: 'Aripiprazole lauroxil' },
  { id: 'ING-haloperidol', canonicalName: 'Haloperidol' },
  { id: 'ING-haloperidol-lactate', canonicalName: 'Haloperidol lactate' },
  { id: 'ING-haloperidol-decanoate', canonicalName: 'Haloperidol decanoate' },
];
const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-abilify-aripiprazole-oral-tablet': { canonicalName: 'ABILIFY aripiprazole oral tablet', genericName: 'aripiprazole', aliases: ['Abilify tablet', 'aripiprazole conventional tablet'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-aripiprazole-orally-disintegrating-tablet': { canonicalName: 'Aripiprazole orally disintegrating tablet', genericName: 'aripiprazole', aliases: ['aripiprazole ODT'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-abilify-maintena-aripiprazole-er-im-injection': { canonicalName: 'ABILIFY MAINTENA aripiprazole extended-release intramuscular injection', genericName: 'aripiprazole', brandNames: ['Abilify Maintena'], aliases: ['aripiprazole Maintena LAI', 'aripiprazole monthly intramuscular injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-abilify-asimtufii-aripiprazole-er-im-injection': { canonicalName: 'ABILIFY ASIMTUFII aripiprazole extended-release intramuscular injection', genericName: 'aripiprazole', brandNames: ['Abilify Asimtufii'], aliases: ['aripiprazole Asimtufii LAI', 'aripiprazole two-month intramuscular injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-aristada-aripiprazole-lauroxil-er-im-injection': { canonicalName: 'ARISTADA aripiprazole lauroxil extended-release intramuscular injection', genericName: 'aripiprazole lauroxil', brandNames: ['Aristada'], aliases: ['aripiprazole lauroxil maintenance LAI'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-aristada-initio-aripiprazole-lauroxil-er-im-injection': { canonicalName: 'ARISTADA INITIO aripiprazole lauroxil extended-release intramuscular injection', genericName: 'aripiprazole lauroxil', brandNames: ['Aristada Initio'], aliases: ['aripiprazole lauroxil initiation injection'], drugClassIds: ['CLS-atypical-antipsychotic'] },
  'MED-haloperidol-oral-tablet': { canonicalName: 'Haloperidol oral tablet', genericName: 'haloperidol', aliases: ['haloperidol conventional tablet', 'Haldol tablet'], drugClassIds: ['CLS-typical-antipsychotic'] },
  'MED-haloperidol-oral-solution': { canonicalName: 'Haloperidol oral solution concentrate', genericName: 'haloperidol', aliases: ['haloperidol concentrate', 'Haldol oral solution'], drugClassIds: ['CLS-typical-antipsychotic'] },
  'MED-haloperidol-lactate-immediate-release-im-injection': { canonicalName: 'Haloperidol lactate immediate-release intramuscular injection', genericName: 'haloperidol', aliases: ['haloperidol lactate IM injection', 'haloperidol immediate-release injection', 'Haldol lactate injection'], drugClassIds: ['CLS-typical-antipsychotic'] },
  'MED-haloperidol-decanoate-er-im-injection': { canonicalName: 'Haloperidol decanoate long-acting intramuscular injection', genericName: 'haloperidol', aliases: ['haloperidol decanoate LAI', 'Haldol decanoate injection'], drugClassIds: ['CLS-typical-antipsychotic'] },
};
export const periproceduralAripiprazoleHaloperidolMedications: MedicationRecord[] = periproceduralAripiprazoleHaloperidolIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
