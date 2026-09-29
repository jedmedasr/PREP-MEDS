import { batch04AceIdentityDefinitions, batch04ArbArniIdentityDefinitions } from '@prep-meds/clinical-content';
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

export const batch04ArbArniIngredients: IngredientRecord[] = [
  { id: 'ING-losartan', canonicalName: 'Losartan', aliases: ['losartan potassium'] },
  { id: 'ING-valsartan', canonicalName: 'Valsartan' },
  { id: 'ING-irbesartan', canonicalName: 'Irbesartan' },
  { id: 'ING-candesartan', canonicalName: 'Candesartan', aliases: ['candesartan cilexetil'] },
  { id: 'ING-olmesartan', canonicalName: 'Olmesartan', aliases: ['olmesartan medoxomil'] },
  { id: 'ING-telmisartan', canonicalName: 'Telmisartan' },
  { id: 'ING-sacubitril', canonicalName: 'Sacubitril' },
];

const commonSacubitrilValsartanAliases = [
  'sacubitril/valsartan',
  'sacubitril valsartan',
] as const;

const batch04ArbArniAliases: Record<string, string[]> = {
  'MED-losartan': ['losartan', 'losartan potassium'],
  'MED-candesartan': ['candesartan', 'candesartan cilexetil'],
  'MED-olmesartan': ['olmesartan', 'olmesartan medoxomil'],
  'MED-sacubitril-valsartan': [
    ...commonSacubitrilValsartanAliases,
    'Novugen sacubitril valsartan tablet',
    'Novugen sacubitril and valsartan tablet',
    'ANDA213611',
  ],
  'MED-sacubitril-valsartan-entresto-tablet': [
    ...commonSacubitrilValsartanAliases,
    'Entresto tablet',
    'Entresto tablets',
    'sacubitril valsartan Entresto tablet',
    'NDA207620',
  ],
  'MED-sacubitril-valsartan-entresto-sprinkle': [
    ...commonSacubitrilValsartanAliases,
    'Entresto Sprinkle',
    'Entresto oral pellets',
    'Entresto pellets',
    'sacubitril valsartan oral pellets',
    'NDA218591',
  ],
};

function canonicalArbArniName(medicationId: string, genericName: string): string {
  if (medicationId === 'MED-sacubitril-valsartan') {
    return 'Sacubitril and valsartan tablet (Novugen ANDA213611)';
  }
  if (medicationId === 'MED-sacubitril-valsartan-entresto-tablet') {
    return 'Entresto sacubitril/valsartan tablet';
  }
  if (medicationId === 'MED-sacubitril-valsartan-entresto-sprinkle') {
    return 'Entresto Sprinkle sacubitril/valsartan oral pellets';
  }
  return genericName.charAt(0).toUpperCase() + genericName.slice(1);
}

export const batch04ArbArniMedications: MedicationRecord[] = batch04ArbArniIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: canonicalArbArniName(definition.medicationId, definition.genericName),
  genericName: definition.genericName,
  brandNames: definition.brandName ? [definition.brandName] : [],
  aliases: batch04ArbArniAliases[definition.medicationId] ?? [],
  ingredientIds: [...definition.ingredientIds],
  drugClassIds: [definition.drugClassId],
}));
