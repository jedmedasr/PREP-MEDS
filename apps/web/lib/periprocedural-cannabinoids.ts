import { periproceduralCannabinoidIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralCannabinoidIngredients: IngredientRecord[] = [
  { id: 'ING-cannabis-product-unspecified', canonicalName: 'Cannabis product, ingredients unspecified' },
  { id: 'ING-cannabidiol', canonicalName: 'Cannabidiol' },
  { id: 'ING-dronabinol', canonicalName: 'Dronabinol' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-cannabis-inhaled-use-pattern': { canonicalName: 'Self-reported inhaled cannabis use pattern', aliases: ['smoked cannabis', 'vaped cannabis', 'inhaled cannabis product', 'smoked marijuana', 'vaped marijuana'], drugClassIds: ['CLS-cannabinoid-product'] },
  'MED-cannabis-oral-ingested-use-pattern': { canonicalName: 'Self-reported oral or edible cannabis use pattern', aliases: ['cannabis edible', 'edible cannabis', 'oral cannabis product', 'marijuana edible'], drugClassIds: ['CLS-cannabinoid-product'] },
  'MED-epidiolex-cannabidiol-oral-solution': { canonicalName: 'EPIDIOLEX cannabidiol oral solution', genericName: 'cannabidiol oral solution', brandNames: ['Epidiolex'], aliases: ['Epidiolex oral solution'], drugClassIds: ['CLS-cannabinoid-product'] },
  'MED-marinol-dronabinol-oral-capsule': { canonicalName: 'MARINOL dronabinol oral capsule', genericName: 'dronabinol', brandNames: ['Marinol'], aliases: ['Marinol capsule', 'dronabinol capsule'], drugClassIds: ['CLS-cannabinoid-product'] },
  'MED-syndros-dronabinol-oral-solution': { canonicalName: 'SYNDROS dronabinol oral solution', genericName: 'dronabinol', brandNames: ['Syndros'], aliases: ['Syndros oral solution', 'dronabinol oral solution'], drugClassIds: ['CLS-cannabinoid-product'] },
};

export const periproceduralCannabinoidMedications: MedicationRecord[] = periproceduralCannabinoidIdentityDefinitions.map((definition) => ({ id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: [definition.ingredientId] }));
