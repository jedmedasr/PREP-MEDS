import { pulmonaryHypertensionProstacyclinIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const pulmonaryHypertensionProstacyclinIngredients: IngredientRecord[] = [
  { id: 'ING-epoprostenol', canonicalName: 'Epoprostenol', aliases: ['epoprostenol sodium'] },
  { id: 'ING-treprostinil', canonicalName: 'Treprostinil', aliases: ['treprostinil sodium'] },
  { id: 'ING-selexipag', canonicalName: 'Selexipag' },
];

const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-veletri-epoprostenol-intravenous-infusion': { canonicalName: 'VELETRI epoprostenol continuous intravenous infusion', genericName: 'epoprostenol', brandNames: ['Veletri'], aliases: ['epoprostenol IV infusion', 'Veletri infusion', 'Veletri IV'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion': { canonicalName: 'REMODULIN treprostinil continuous subcutaneous or intravenous infusion', genericName: 'treprostinil', brandNames: ['Remodulin'], aliases: ['treprostinil', 'Remodulin infusion', 'treprostinil SC infusion', 'treprostinil IV infusion'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-tyvaso-treprostinil-inhalation-solution': { canonicalName: 'TYVASO treprostinil inhalation solution', genericName: 'treprostinil', brandNames: ['Tyvaso'], aliases: ['treprostinil', 'Tyvaso', 'Tyvaso inhalation solution', 'treprostinil inhalation solution'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-tyvaso-dpi-treprostinil-inhalation-powder': { canonicalName: 'TYVASO DPI treprostinil inhalation powder', genericName: 'treprostinil', brandNames: ['Tyvaso DPI'], aliases: ['treprostinil', 'Tyvaso', 'Tyvaso DPI', 'treprostinil inhalation powder'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-orenitram-treprostinil-er-oral-tablet': { canonicalName: 'ORENITRAM treprostinil extended-release oral tablet', genericName: 'treprostinil', brandNames: ['Orenitram'], aliases: ['treprostinil', 'Orenitram ER tablet', 'treprostinil extended release tablet'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-uptravi-selexipag-oral-tablet': { canonicalName: 'UPTRAVI selexipag oral tablet', genericName: 'selexipag', brandNames: ['Uptravi'], aliases: ['selexipag', 'Uptravi', 'Uptravi oral tablet', 'selexipag oral tablet'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
  'MED-uptravi-selexipag-intravenous-injection': { canonicalName: 'UPTRAVI selexipag intravenous injection', genericName: 'selexipag', brandNames: ['Uptravi'], aliases: ['selexipag', 'Uptravi', 'Uptravi IV', 'selexipag injection'], drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'] },
};

export const pulmonaryHypertensionProstacyclinMedications: MedicationRecord[] = pulmonaryHypertensionProstacyclinIdentityDefinitions.map((item) => ({
  id: item.medicationId,
  ...records[item.medicationId]!,
  ingredientIds: item.ingredientIds,
}));
