import { pulmonaryRescueIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const pulmonaryRescueIngredients: IngredientRecord[] = [
  { id: 'ING-albuterol', canonicalName: 'Albuterol' },
  { id: 'ING-levalbuterol', canonicalName: 'Levalbuterol' },
  { id: 'ING-ipratropium', canonicalName: 'Ipratropium' },
];
const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-ventolin-hfa-albuterol-inhalation-aerosol': { canonicalName: 'VENTOLIN HFA albuterol sulfate metered inhalation aerosol', genericName: 'albuterol sulfate', brandNames: ['Ventolin HFA'], aliases: ['albuterol', 'Ventolin', 'Ventolin HFA', 'Ventolin HFA inhaler', 'albuterol metered-dose inhaler'], drugClassIds: ['CLS-short-acting-beta2-agonist'] },
  'MED-albuterol-sulfate-nebulizer-solution': { canonicalName: 'Albuterol sulfate nebulizer solution concentrate', genericName: 'albuterol sulfate', aliases: ['albuterol', 'albuterol nebulizer', 'albuterol nebulizer solution', 'albuterol inhalation solution concentrate'], drugClassIds: ['CLS-short-acting-beta2-agonist'] },
  'MED-xopenex-hfa-levalbuterol-inhalation-aerosol': { canonicalName: 'XOPENEX HFA levalbuterol tartrate metered inhalation aerosol', genericName: 'levalbuterol tartrate', brandNames: ['Xopenex HFA'], aliases: ['levalbuterol', 'Xopenex', 'Xopenex HFA', 'Xopenex HFA inhaler', 'levalbuterol metered-dose inhaler'], drugClassIds: ['CLS-short-acting-beta2-agonist'] },
  'MED-xopenex-levalbuterol-nebulizer-concentrate': { canonicalName: 'XOPENEX levalbuterol hydrochloride nebulizer solution concentrate', genericName: 'levalbuterol hydrochloride', brandNames: ['Xopenex'], aliases: ['levalbuterol', 'Xopenex', 'Xopenex nebulizer', 'Xopenex inhalation solution concentrate', 'levalbuterol nebulizer solution'], drugClassIds: ['CLS-short-acting-beta2-agonist'] },
  'MED-atrovent-hfa-ipratropium-inhalation-aerosol': { canonicalName: 'ATROVENT HFA ipratropium bromide metered inhalation aerosol', genericName: 'ipratropium bromide', brandNames: ['Atrovent HFA'], aliases: ['ipratropium', 'Atrovent', 'Atrovent HFA', 'Atrovent HFA inhaler', 'ipratropium metered-dose inhaler'], drugClassIds: ['CLS-short-acting-muscarinic-antagonist'] },
  'MED-ipratropium-bromide-nebulizer-solution': { canonicalName: 'Ipratropium bromide nebulizer solution', genericName: 'ipratropium bromide', aliases: ['ipratropium', 'ipratropium nebulizer', 'ipratropium nebulizer solution', 'ipratropium inhalation solution'], drugClassIds: ['CLS-short-acting-muscarinic-antagonist'] },
  'MED-combivent-respimat-ipratropium-albuterol-inhalation-spray': { canonicalName: 'COMBIVENT RESPIMAT ipratropium bromide and albuterol metered inhalation spray', genericName: 'ipratropium bromide and albuterol sulfate', brandNames: ['Combivent Respimat'], aliases: ['Combivent', 'Combivent Respimat', 'Combivent Respimat inhaler', 'ipratropium albuterol Respimat'], drugClassIds: ['CLS-short-acting-bronchodilator-combination'] },
  'MED-ipratropium-albuterol-nebulizer-solution': { canonicalName: 'Ipratropium bromide and albuterol sulfate nebulizer solution', genericName: 'ipratropium bromide and albuterol sulfate', aliases: ['ipratropium albuterol', 'ipratropium albuterol nebulizer', 'ipratropium and albuterol nebulizer solution', 'albuterol ipratropium nebulizer solution'], drugClassIds: ['CLS-short-acting-bronchodilator-combination'] },
};
export const pulmonaryRescueMedications: MedicationRecord[] = pulmonaryRescueIdentityDefinitions.map((item) => ({ id: item.medicationId, ...records[item.medicationId]!, ingredientIds: item.ingredientIds }));
