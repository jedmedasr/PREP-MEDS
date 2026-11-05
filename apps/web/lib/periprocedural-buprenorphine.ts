import { periproceduralBuprenorphineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralBuprenorphineIngredients: IngredientRecord[] = [
  { id: 'ING-buprenorphine', canonicalName: 'Buprenorphine' },
  { id: 'ING-naloxone', canonicalName: 'Naloxone' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-buprenorphine-sublingual-tablet': { canonicalName: 'Buprenorphine sublingual tablet', genericName: 'buprenorphine', aliases: ['buprenorphine', 'buprenorphine SL', 'buprenorphine sublingual tablet'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-oud-therapy'] },
  'MED-suboxone-buprenorphine-naloxone-film': { canonicalName: 'SUBOXONE buprenorphine/naloxone soluble film (sublingual or buccal)', genericName: 'buprenorphine and naloxone', brandNames: ['Suboxone'], aliases: ['buprenorphine', 'buprenorphine naloxone', 'Suboxone', 'Suboxone film', 'buprenorphine naloxone film'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-opioid-antagonist', 'CLS-oud-therapy'] },
  'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet': { canonicalName: 'ZUBSOLV buprenorphine/naloxone sublingual orally disintegrating tablet', genericName: 'buprenorphine and naloxone', brandNames: ['Zubsolv'], aliases: ['buprenorphine', 'buprenorphine naloxone', 'Zubsolv', 'Zubsolv tablet', 'buprenorphine naloxone sublingual tablet'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-opioid-antagonist', 'CLS-oud-therapy'] },
  'MED-belbuca-buprenorphine-buccal-film': { canonicalName: 'BELBUCA buprenorphine buccal film', genericName: 'buprenorphine', brandNames: ['Belbuca'], aliases: ['buprenorphine', 'Belbuca', 'buprenorphine buccal film', 'Belbuca buccal film'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-opioid-analgesic'] },
  'MED-butrans-buprenorphine-er-transdermal-patch': { canonicalName: 'BUTRANS buprenorphine extended-release transdermal patch', genericName: 'buprenorphine extended-release', brandNames: ['Butrans'], aliases: ['buprenorphine', 'Butrans', 'buprenorphine patch', 'buprenorphine transdermal patch', 'Butrans patch'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-opioid-analgesic'] },
  'MED-sublocade-buprenorphine-er-subcutaneous-injection': { canonicalName: 'SUBLOCADE buprenorphine extended-release subcutaneous injection', genericName: 'buprenorphine extended-release', brandNames: ['Sublocade'], aliases: ['buprenorphine', 'Sublocade', 'buprenorphine injection', 'buprenorphine extended-release injection', 'Sublocade injection'], drugClassIds: ['CLS-partial-opioid-agonist', 'CLS-oud-therapy'] },
};

export const periproceduralBuprenorphineMedications: MedicationRecord[] =
  periproceduralBuprenorphineIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
