import { batch05ClassIIIAntiarrhythmicIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch05ClassIIIAntiarrhythmicIngredients: IngredientRecord[] = [
  { id: 'ING-amiodarone', canonicalName: 'Amiodarone', aliases: ['amiodarone hydrochloride', 'amiodarone HCl'] },
  { id: 'ING-dronedarone', canonicalName: 'Dronedarone' },
  { id: 'ING-sotalol', canonicalName: 'Sotalol', aliases: ['sotalol hydrochloride', 'sotalol HCl'] },
  { id: 'ING-dofetilide', canonicalName: 'Dofetilide' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-amiodarone-tablet': {
    canonicalName: 'Amiodarone hydrochloride oral tablet', genericName: 'amiodarone hydrochloride',
    aliases: ['amiodarone', 'amiodarone tablet', 'oral amiodarone', 'amiodarone HCl tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic'],
  },
  'MED-amiodarone-injection': {
    canonicalName: 'Amiodarone hydrochloride intravenous injection', genericName: 'amiodarone hydrochloride injection',
    aliases: ['amiodarone', 'amiodarone injection', 'IV amiodarone', 'intravenous amiodarone'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic'],
  },
  'MED-dronedarone-multaq-tablet': {
    canonicalName: 'MULTAQ dronedarone oral tablet', genericName: 'dronedarone', brandNames: ['MULTAQ'],
    aliases: ['dronedarone', 'dronedarone tablet', 'MULTAQ tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic'],
  },
  'MED-sotalol-tablet': {
    canonicalName: 'Standard sotalol hydrochloride oral tablet', genericName: 'sotalol hydrochloride',
    aliases: ['sotalol', 'sotalol tablet', 'standard sotalol tablet', 'sotalol HCl tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic', 'CLS-beta-blocker'],
  },
  'MED-sotalol-af-tablet': {
    canonicalName: 'Sotalol hydrochloride AF oral tablet', genericName: 'sotalol hydrochloride AF',
    aliases: ['sotalol', 'sotalol AF', 'sotalol AF tablet', 'sotalol hydrochloride AF tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic', 'CLS-beta-blocker'],
  },
  'MED-sotalol-sotylize-solution': {
    canonicalName: 'SOTYLIZE sotalol hydrochloride oral solution', genericName: 'sotalol hydrochloride oral solution', brandNames: ['SOTYLIZE'],
    aliases: ['sotalol', 'SOTYLIZE', 'sotalol oral solution', 'SOTYLIZE oral solution'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic', 'CLS-beta-blocker'],
  },
  'MED-sotalol-injection': {
    canonicalName: 'Sotalol hydrochloride intravenous injection', genericName: 'sotalol hydrochloride injection',
    aliases: ['sotalol', 'sotalol injection', 'IV sotalol', 'intravenous sotalol'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic', 'CLS-beta-blocker'],
  },
  'MED-dofetilide-tikosyn-capsule': {
    canonicalName: 'TIKOSYN dofetilide oral capsule', genericName: 'dofetilide', brandNames: ['TIKOSYN'],
    aliases: ['dofetilide', 'dofetilide capsule', 'TIKOSYN', 'TIKOSYN capsule'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-iii-antiarrhythmic'],
  },
};

export const batch05ClassIIIAntiarrhythmicMedications: MedicationRecord[] =
  batch05ClassIIIAntiarrhythmicIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
