import { batch04AceIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04AceIngredients: IngredientRecord[] = [
  { id: 'ING-enalapril', canonicalName: 'Enalapril', aliases: ['enalapril maleate'] },
  { id: 'ING-benazepril', canonicalName: 'Benazepril', aliases: ['benazepril hydrochloride', 'benazepril HCl'] },
  { id: 'ING-ramipril', canonicalName: 'Ramipril' },
  { id: 'ING-captopril', canonicalName: 'Captopril' },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-enalapril': ['enalapril maleate'],
  'MED-benazepril': ['benazepril hydrochloride', 'benazepril HCl'],
  'MED-ramipril': ['ramipril capsule'],
  'MED-captopril': ['captopril tablet'],
};

export const batch04AceMedications: MedicationRecord[] = batch04AceIdentityDefinitions
  .filter((definition) => definition.medicationId !== 'MED-lisinopril')
  .map((definition) => ({
    id: definition.medicationId,
    canonicalName: definition.genericName.charAt(0).toUpperCase() + definition.genericName.slice(1),
    genericName: definition.genericName,
    brandNames: [],
    aliases: aliasesByMedication[definition.medicationId] ?? [],
    ingredientIds: [definition.ingredientId],
    drugClassIds: ['CLS-ace-inhibitor'],
  }));
