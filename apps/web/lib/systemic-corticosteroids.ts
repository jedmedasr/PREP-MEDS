import { systemicCorticosteroidIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const systemicCorticosteroidIngredients: IngredientRecord[] = [
  { id: 'ING-prednisone', canonicalName: 'Prednisone' },
  { id: 'ING-prednisolone', canonicalName: 'Prednisolone' },
  { id: 'ING-methylprednisolone', canonicalName: 'Methylprednisolone' },
  { id: 'ING-hydrocortisone', canonicalName: 'Hydrocortisone' },
  { id: 'ING-dexamethasone', canonicalName: 'Dexamethasone' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-prednisone-immediate-release-oral-tablet': { canonicalName: 'Prednisone immediate-release oral tablet', genericName: 'prednisone immediate-release', aliases: ['prednisone', 'prednisone tablet', 'prednisone IR', 'prednisone immediate-release tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-prednisone-delayed-release-oral-tablet': { canonicalName: 'Prednisone delayed-release oral tablet', genericName: 'prednisone delayed-release', aliases: ['prednisone', 'prednisone delayed-release tablet', 'prednisone DR tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-prednisolone-oral-tablet': { canonicalName: 'Prednisolone oral tablet', genericName: 'prednisolone oral', aliases: ['prednisolone', 'prednisolone tablet', 'oral prednisolone tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-prednisolone-sodium-phosphate-oral-solution': { canonicalName: 'Prednisolone sodium phosphate oral solution', genericName: 'prednisolone sodium phosphate oral', aliases: ['prednisolone', 'prednisolone oral solution', 'prednisolone sodium phosphate solution'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-medrol-methylprednisolone-oral-tablet': { canonicalName: 'MEDROL methylprednisolone oral tablet', genericName: 'methylprednisolone oral', brandNames: ['Medrol'], aliases: ['methylprednisolone', 'methylprednisolone tablet', 'Medrol', 'Medrol tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-solu-medrol-methylprednisolone-sodium-succinate-injection': { canonicalName: 'SOLU-MEDROL methylprednisolone sodium succinate injection', genericName: 'methylprednisolone sodium succinate injection', brandNames: ['Solu-Medrol'], aliases: ['methylprednisolone', 'methylprednisolone injection', 'Solu-Medrol', 'Solu-Medrol injection'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-cortef-hydrocortisone-oral-tablet': { canonicalName: 'CORTEF hydrocortisone oral tablet', genericName: 'hydrocortisone oral', brandNames: ['Cortef'], aliases: ['hydrocortisone', 'hydrocortisone tablet', 'Cortef', 'Cortef tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-solu-cortef-hydrocortisone-sodium-succinate-injection': { canonicalName: 'SOLU-CORTEF hydrocortisone sodium succinate injection', genericName: 'hydrocortisone sodium succinate injection', brandNames: ['Solu-Cortef'], aliases: ['hydrocortisone', 'hydrocortisone injection', 'Solu-Cortef', 'Solu-Cortef injection'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-dexamethasone-oral-tablet': { canonicalName: 'Dexamethasone oral tablet', genericName: 'dexamethasone oral', aliases: ['dexamethasone', 'dexamethasone tablet', 'oral dexamethasone tablet'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
  'MED-dexamethasone-sodium-phosphate-injection': { canonicalName: 'Dexamethasone sodium phosphate injection', genericName: 'dexamethasone sodium phosphate injection', aliases: ['dexamethasone', 'dexamethasone injection', 'dexamethasone sodium phosphate injection'], drugClassIds: ['CLS-systemic-corticosteroid', 'CLS-glucocorticoid'] },
};

export const systemicCorticosteroidMedications: MedicationRecord[] =
  systemicCorticosteroidIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
