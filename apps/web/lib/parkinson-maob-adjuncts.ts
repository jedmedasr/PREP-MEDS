import { parkinsonMaobAdjunctIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const parkinsonMaobAdjunctIngredients: IngredientRecord[] = [
  { id: 'ING-rasagiline', canonicalName: 'Rasagiline' },
  { id: 'ING-safinamide', canonicalName: 'Safinamide' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-rasagiline-mesylate-oral-tablet': { canonicalName: 'Rasagiline mesylate oral tablet', genericName: 'rasagiline mesylate', aliases: ['rasagiline', 'rasagiline tablet', 'rasagiline oral tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-mao-b-inhibitor', 'CLS-parkinson-therapy'] },
  'MED-xadago-safinamide-oral-tablet': { canonicalName: 'XADAGO safinamide mesylate film-coated oral tablet', genericName: 'safinamide mesylate', brandNames: ['Xadago'], aliases: ['safinamide', 'safinamide tablet', 'Xadago', 'Xadago tablet'], drugClassIds: ['CLS-parkinson-dopaminergic', 'CLS-mao-b-inhibitor', 'CLS-parkinson-therapy'] },
};

export const parkinsonMaobAdjunctMedications: MedicationRecord[] =
  parkinsonMaobAdjunctIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
