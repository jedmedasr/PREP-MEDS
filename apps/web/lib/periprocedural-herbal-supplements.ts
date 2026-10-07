import { periproceduralHerbalSupplementIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralHerbalSupplementIngredients: IngredientRecord[] = [
  { id: 'ING-garlic', canonicalName: 'Garlic', aliases: ['Allium sativum'] },
  { id: 'ING-ginkgo-biloba', canonicalName: 'Ginkgo biloba', aliases: ['ginkgo', 'maidenhair tree'] },
  { id: 'ING-panax-ginseng', canonicalName: 'Asian ginseng', aliases: ['Panax ginseng', 'Korean ginseng', 'red ginseng', 'white ginseng'] },
  { id: 'ING-hypericum-perforatum', canonicalName: "St. John's wort", aliases: ['Hypericum perforatum', 'hypericum'] },
  { id: 'ING-valeriana-officinalis', canonicalName: 'Valerian', aliases: ['Valeriana officinalis', 'valerian root'] },
  { id: 'ING-piper-methysticum', canonicalName: 'Kava', aliases: ['Piper methysticum', 'kava kava', 'ava root'] },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-garlic-oral-supplement': { canonicalName: 'Garlic oral dietary supplement', genericName: 'garlic', aliases: ['garlic supplement', 'Allium sativum supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
  'MED-ginkgo-biloba-oral-supplement': { canonicalName: 'Ginkgo biloba oral dietary supplement', genericName: 'ginkgo biloba', aliases: ['ginkgo supplement', 'Ginkgo biloba supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
  'MED-asian-ginseng-oral-supplement': { canonicalName: 'Asian ginseng oral dietary supplement', genericName: 'Asian ginseng', aliases: ['Panax ginseng supplement', 'Korean ginseng supplement', 'red ginseng supplement', 'white ginseng supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
  'MED-st-johns-wort-oral-supplement': { canonicalName: "St. John's wort oral dietary supplement", genericName: "St. John's wort", aliases: ["St Johns wort", 'hypericum supplement', 'Hypericum perforatum supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
  'MED-valerian-oral-supplement': { canonicalName: 'Valerian oral dietary supplement', genericName: 'valerian', aliases: ['valerian supplement', 'valerian root supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
  'MED-kava-oral-supplement': { canonicalName: 'Kava oral dietary supplement', genericName: 'kava', aliases: ['kava supplement', 'kava kava supplement', 'ava root supplement'], drugClassIds: ['CLS-herbal-dietary-supplement'] },
};

export const periproceduralHerbalSupplementMedications: MedicationRecord[] = periproceduralHerbalSupplementIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
