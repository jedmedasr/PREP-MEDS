import { batch04LoopDiureticIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04LoopDiureticIngredients: IngredientRecord[] = [
  { id: 'ING-furosemide', canonicalName: 'Furosemide' },
  { id: 'ING-torsemide', canonicalName: 'Torsemide' },
  { id: 'ING-bumetanide', canonicalName: 'Bumetanide' },
];

const aliasesByMedication: Record<string, string[]> = {
  'MED-furosemide-tablet': ['furosemide', 'furosemide tablet', 'oral furosemide tablet'],
  'MED-furosemide-oral-solution': ['furosemide', 'furosemide oral solution', 'oral furosemide solution'],
  'MED-furosemide-injection': ['furosemide', 'furosemide IV', 'furosemide IV injection', 'intravenous furosemide'],
  'MED-furosemide-furoscix-readyflow': ['furosemide', 'FUROSCIX', 'FUROSCIX ReadyFlow', 'FUROSCIX ReadyFlow autoinjector'],
  'MED-furosemide-furoscix-on-body-infusor': ['furosemide', 'FUROSCIX', 'FUROSCIX on-body infusor', 'FUROSCIX on body infusor'],
  'MED-torsemide-tablet': ['torsemide', 'torsemide tablet', 'oral torsemide tablet'],
  'MED-torsemide-demadex-injection': ['torsemide', 'DEMADEX injection', 'DEMADEX IV', 'torsemide IV injection'],
  'MED-bumetanide-tablet': ['bumetanide', 'bumetanide tablet', 'oral bumetanide tablet'],
  'MED-bumetanide-injection': ['bumetanide', 'bumetanide injection', 'bumetanide IV injection', 'bumetanide IM injection'],
  'MED-bumetanide-enbumyst-nasal-spray': ['bumetanide', 'ENBUMYST', 'ENBUMYST nasal spray', 'bumetanide nasal spray'],
};

function canonicalName(medicationId: string): string {
  switch (medicationId) {
    case 'MED-furosemide-tablet': return 'Furosemide oral tablet';
    case 'MED-furosemide-oral-solution': return 'Furosemide oral solution';
    case 'MED-furosemide-injection': return 'Furosemide intravenous injection';
    case 'MED-furosemide-furoscix-readyflow': return 'FUROSCIX furosemide ReadyFlow subcutaneous autoinjector';
    case 'MED-furosemide-furoscix-on-body-infusor': return 'FUROSCIX furosemide subcutaneous on-body infusor';
    case 'MED-torsemide-tablet': return 'Torsemide oral tablet';
    case 'MED-torsemide-demadex-injection': return 'DEMADEX torsemide intravenous injection (historical label)';
    case 'MED-bumetanide-tablet': return 'Bumetanide oral tablet';
    case 'MED-bumetanide-injection': return 'Bumetanide intravenous/intramuscular injection';
    default: return 'ENBUMYST bumetanide nasal spray';
  }
}

export const batch04LoopDiureticMedications: MedicationRecord[] = batch04LoopDiureticIdentityDefinitions.map((definition) => ({
  id: definition.medicationId,
  canonicalName: canonicalName(definition.medicationId),
  genericName: definition.genericName,
  brandNames: definition.brandName ? [definition.brandName] : [],
  aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: [definition.ingredientId],
  drugClassIds: ['CLS-diuretic', 'CLS-loop-diuretic'],
}));
