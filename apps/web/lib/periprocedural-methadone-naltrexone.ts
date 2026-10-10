import { periproceduralMethadoneNaltrexoneIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralMethadoneNaltrexoneIngredients: IngredientRecord[] = [
  { id: 'ING-methadone', canonicalName: 'Methadone' },
  { id: 'ING-naltrexone', canonicalName: 'Naltrexone' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-methadone-oral-tablet': { canonicalName: 'Methadone oral tablet', genericName: 'methadone', aliases: ['methadone', 'methadone tablet', 'methadone oral tablet'], drugClassIds: ['CLS-opioid-agonist', 'CLS-oud-therapy', 'CLS-opioid-analgesic'] },
  'MED-methadone-oral-concentrate': { canonicalName: 'Methadone oral concentrate', genericName: 'methadone', aliases: ['methadone', 'methadone concentrate', 'methadone oral concentrate'], drugClassIds: ['CLS-opioid-agonist', 'CLS-oud-therapy'] },
  'MED-naltrexone-film-coated-oral-tablet': { canonicalName: 'Naltrexone film-coated oral tablet', genericName: 'naltrexone', aliases: ['naltrexone', 'naltrexone tablet', 'oral naltrexone'], drugClassIds: ['CLS-opioid-antagonist', 'CLS-oud-therapy'] },
  'MED-vivitrol-naltrexone-er-im-injection': { canonicalName: 'VIVITROL naltrexone extended-release intramuscular injection kit', genericName: 'naltrexone extended-release', brandNames: ['Vivitrol'], aliases: ['naltrexone', 'Vivitrol', 'Vivitrol injection', 'naltrexone injection', 'naltrexone extended-release injection'], drugClassIds: ['CLS-opioid-antagonist', 'CLS-oud-therapy'] },
};

export const periproceduralMethadoneNaltrexoneMedications: MedicationRecord[] =
  periproceduralMethadoneNaltrexoneIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
