import { gabapentinoidIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const gabapentinoidIngredients: IngredientRecord[] = [
  { id: 'ING-gabapentin', canonicalName: 'Gabapentin' },
  { id: 'ING-gabapentin-enacarbil', canonicalName: 'Gabapentin enacarbil' },
  { id: 'ING-pregabalin', canonicalName: 'Pregabalin' },
];
const classes = ['CLS-gabapentinoid'];
const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-neurontin-gabapentin-oral-capsule': { canonicalName: 'NEURONTIN gabapentin oral capsule', genericName: 'gabapentin', brandNames: ['Neurontin'], aliases: ['gabapentin', 'Neurontin', 'Neurontin capsule', 'gabapentin oral capsule'], drugClassIds: classes },
  'MED-neurontin-gabapentin-oral-tablet': { canonicalName: 'NEURONTIN gabapentin oral tablet', genericName: 'gabapentin', brandNames: ['Neurontin'], aliases: ['gabapentin', 'Neurontin', 'Neurontin tablet', 'gabapentin oral tablet'], drugClassIds: classes },
  'MED-neurontin-gabapentin-oral-solution': { canonicalName: 'NEURONTIN gabapentin oral solution', genericName: 'gabapentin', brandNames: ['Neurontin'], aliases: ['gabapentin', 'Neurontin', 'Neurontin oral solution', 'gabapentin oral solution'], drugClassIds: classes },
  'MED-gralise-gabapentin-er-oral-tablet': { canonicalName: 'GRALISE gabapentin extended-release oral tablet', genericName: 'gabapentin', brandNames: ['Gralise'], aliases: ['gabapentin', 'Gralise', 'Gralise extended-release tablet', 'gabapentin ER tablet'], drugClassIds: classes },
  'MED-horizant-gabapentin-enacarbil-er-oral-tablet': { canonicalName: 'HORIZANT gabapentin enacarbil extended-release oral tablet', genericName: 'gabapentin enacarbil', brandNames: ['Horizant'], aliases: ['gabapentin', 'gabapentin enacarbil', 'Horizant', 'Horizant extended-release tablet', 'gabapentin enacarbil ER tablet'], drugClassIds: classes },
  'MED-lyrica-pregabalin-oral-capsule': { canonicalName: 'LYRICA pregabalin oral capsule', genericName: 'pregabalin', brandNames: ['Lyrica'], aliases: ['pregabalin', 'Lyrica', 'Lyrica capsule', 'pregabalin oral capsule'], drugClassIds: classes },
  'MED-lyrica-pregabalin-oral-solution': { canonicalName: 'LYRICA pregabalin oral solution', genericName: 'pregabalin', brandNames: ['Lyrica'], aliases: ['pregabalin', 'Lyrica', 'Lyrica oral solution', 'pregabalin oral solution'], drugClassIds: classes },
  'MED-lyrica-cr-pregabalin-er-oral-tablet': { canonicalName: 'LYRICA CR pregabalin extended-release oral tablet', genericName: 'pregabalin', brandNames: ['Lyrica CR'], aliases: ['pregabalin', 'Lyrica', 'Lyrica CR', 'Lyrica CR extended-release tablet', 'pregabalin ER tablet'], drugClassIds: classes },
};
export const gabapentinoidMedications: MedicationRecord[] = gabapentinoidIdentityDefinitions.map((item) => ({ id: item.medicationId, ...records[item.medicationId]!, ingredientIds: item.ingredientIds }));
