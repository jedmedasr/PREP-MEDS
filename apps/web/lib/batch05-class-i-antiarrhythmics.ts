import { batch05ClassIAntiarrhythmicIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch05ClassIAntiarrhythmicIngredients: IngredientRecord[] = [
  { id: 'ING-flecainide', canonicalName: 'Flecainide', aliases: ['flecainide acetate'] },
  { id: 'ING-propafenone', canonicalName: 'Propafenone', aliases: ['propafenone hydrochloride', 'propafenone HCl'] },
  { id: 'ING-mexiletine', canonicalName: 'Mexiletine', aliases: ['mexiletine hydrochloride', 'mexiletine HCl'] },
  { id: 'ING-quinidine', canonicalName: 'Quinidine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-flecainide-tablet': {
    canonicalName: 'Flecainide acetate oral tablet', genericName: 'flecainide acetate',
    aliases: ['flecainide', 'flecainide tablet', 'flecainide acetate tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ic-antiarrhythmic'],
  },
  'MED-propafenone-tablet': {
    canonicalName: 'Propafenone hydrochloride oral film-coated tablet', genericName: 'propafenone hydrochloride',
    aliases: ['propafenone', 'propafenone tablet', 'propafenone immediate-release tablet', 'propafenone HCl tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ic-antiarrhythmic'],
  },
  'MED-propafenone-er-capsule': {
    canonicalName: 'Propafenone hydrochloride extended-release oral capsule', genericName: 'propafenone hydrochloride extended-release',
    aliases: ['propafenone', 'propafenone ER', 'propafenone ER capsule', 'propafenone extended-release capsule'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ic-antiarrhythmic'],
  },
  'MED-mexiletine-capsule': {
    canonicalName: 'Mexiletine hydrochloride oral capsule', genericName: 'mexiletine hydrochloride',
    aliases: ['mexiletine', 'mexiletine capsule', 'mexiletine HCl capsule'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ib-antiarrhythmic'],
  },
  'MED-quinidine-sulfate-tablet': {
    canonicalName: 'Quinidine sulfate oral tablet', genericName: 'quinidine sulfate',
    aliases: ['quinidine', 'quinidine sulfate', 'quinidine sulfate tablet', 'quinidine tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ia-antiarrhythmic'],
  },
  'MED-quinidine-gluconate-er-tablet': {
    canonicalName: 'Quinidine gluconate extended-release oral tablet', genericName: 'quinidine gluconate extended-release',
    aliases: ['quinidine', 'quinidine gluconate', 'quinidine gluconate ER', 'quinidine gluconate extended-release tablet'],
    drugClassIds: ['CLS-antiarrhythmic', 'CLS-class-i-antiarrhythmic', 'CLS-class-ia-antiarrhythmic'],
  },
};

export const batch05ClassIAntiarrhythmicMedications: MedicationRecord[] =
  batch05ClassIAntiarrhythmicIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
