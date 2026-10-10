import { pulmonaryMethylxanthineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const pulmonaryMethylxanthineIngredients: IngredientRecord[] = [
  { id: 'ING-theophylline-anhydrous', canonicalName: 'Theophylline anhydrous', aliases: ['theophylline'] },
  { id: 'ING-aminophylline-dihydrate', canonicalName: 'Aminophylline dihydrate', aliases: ['aminophylline'] },
];

const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-theophylline-oral-solution': {
    canonicalName: 'Theophylline anhydrous oral solution',
    genericName: 'theophylline anhydrous',
    aliases: ['theophylline', 'theophylline oral solution', 'theophylline solution'],
    drugClassIds: ['CLS-systemic-methylxanthine-bronchodilator'],
  },
  'MED-theophylline-er-oral-tablet': {
    canonicalName: 'Theophylline anhydrous extended-release oral tablet',
    genericName: 'theophylline anhydrous',
    aliases: ['theophylline', 'theophylline extended release tablet', 'theophylline ER tablet'],
    drugClassIds: ['CLS-systemic-methylxanthine-bronchodilator'],
  },
  'MED-theo-24-theophylline-er-oral-capsule': {
    canonicalName: 'THEO-24 theophylline anhydrous extended-release oral capsule',
    genericName: 'theophylline anhydrous',
    brandNames: ['Theo-24'],
    aliases: ['theophylline', 'Theo-24', 'Theo 24', 'theophylline extended release capsule'],
    drugClassIds: ['CLS-systemic-methylxanthine-bronchodilator'],
  },
  'MED-aminophylline-intravenous-injection': {
    canonicalName: 'Aminophylline dihydrate intravenous injection',
    genericName: 'aminophylline dihydrate',
    aliases: ['aminophylline', 'aminophylline injection', 'aminophylline IV'],
    drugClassIds: ['CLS-systemic-methylxanthine-bronchodilator'],
  },
};

export const pulmonaryMethylxanthineMedications: MedicationRecord[] = pulmonaryMethylxanthineIdentityDefinitions.map((item) => ({
  id: item.medicationId,
  ...records[item.medicationId]!,
  ingredientIds: item.ingredientIds,
}));
