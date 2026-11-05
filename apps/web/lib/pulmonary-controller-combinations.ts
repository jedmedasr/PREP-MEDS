import { pulmonaryControllerCombinationIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const pulmonaryControllerCombinationIngredients: IngredientRecord[] = [
  { id: 'ING-budesonide', canonicalName: 'Budesonide' },
  { id: 'ING-formoterol', canonicalName: 'Formoterol' },
  { id: 'ING-fluticasone-propionate', canonicalName: 'Fluticasone propionate' },
  { id: 'ING-salmeterol', canonicalName: 'Salmeterol' },
  { id: 'ING-fluticasone-furoate', canonicalName: 'Fluticasone furoate' },
  { id: 'ING-vilanterol', canonicalName: 'Vilanterol' },
  { id: 'ING-mometasone-furoate', canonicalName: 'Mometasone furoate' },
  { id: 'ING-umeclidinium', canonicalName: 'Umeclidinium' },
  { id: 'ING-glycopyrrolate', canonicalName: 'Glycopyrrolate' },
];
const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-symbicort-budesonide-formoterol-metered-aerosol': { canonicalName: 'SYMBICORT budesonide/formoterol metered inhalation aerosol', genericName: 'budesonide and formoterol fumarate', brandNames: ['Symbicort'], aliases: ['Symbicort', 'Symbicort inhaler', 'Symbicort metered-dose inhaler', 'budesonide formoterol aerosol'], drugClassIds: ['CLS-ics-laba-combination'] },
  'MED-advair-hfa-fluticasone-salmeterol-metered-aerosol': { canonicalName: 'ADVAIR HFA fluticasone propionate/salmeterol metered inhalation aerosol', genericName: 'fluticasone propionate and salmeterol', brandNames: ['Advair HFA'], aliases: ['Advair', 'Advair HFA', 'Advair HFA inhaler', 'fluticasone propionate salmeterol aerosol'], drugClassIds: ['CLS-ics-laba-combination'] },
  'MED-advair-diskus-fluticasone-salmeterol-dry-powder': { canonicalName: 'ADVAIR DISKUS fluticasone propionate/salmeterol dry-powder inhaler', genericName: 'fluticasone propionate and salmeterol', brandNames: ['Advair Diskus'], aliases: ['Advair', 'Advair Diskus', 'Advair Diskus inhaler', 'fluticasone propionate salmeterol powder'], drugClassIds: ['CLS-ics-laba-combination'] },
  'MED-breo-ellipta-fluticasone-vilanterol-dry-powder': { canonicalName: 'BREO ELLIPTA fluticasone furoate/vilanterol dry-powder inhaler', genericName: 'fluticasone furoate and vilanterol', brandNames: ['Breo Ellipta'], aliases: ['Breo', 'Breo Ellipta', 'Breo Ellipta inhaler', 'fluticasone furoate vilanterol powder'], drugClassIds: ['CLS-ics-laba-combination'] },
  'MED-dulera-mometasone-formoterol-metered-aerosol': { canonicalName: 'DULERA mometasone furoate/formoterol metered inhalation aerosol', genericName: 'mometasone furoate and formoterol fumarate', brandNames: ['Dulera'], aliases: ['Dulera', 'Dulera inhaler', 'Dulera metered-dose inhaler', 'mometasone formoterol aerosol'], drugClassIds: ['CLS-ics-laba-combination'] },
  'MED-trelegy-ellipta-fluticasone-umeclidinium-vilanterol-dry-powder': { canonicalName: 'TRELEGY ELLIPTA fluticasone furoate/umeclidinium/vilanterol dry-powder inhaler', genericName: 'fluticasone furoate, umeclidinium, and vilanterol', brandNames: ['Trelegy Ellipta'], aliases: ['Trelegy', 'Trelegy Ellipta', 'Trelegy Ellipta inhaler', 'fluticasone umeclidinium vilanterol powder'], drugClassIds: ['CLS-ics-lama-laba-combination'] },
  'MED-breztri-aerosphere-budesonide-glycopyrrolate-formoterol-metered-aerosol': { canonicalName: 'BREZTRI AEROSPHERE budesonide/glycopyrrolate/formoterol metered inhalation aerosol', genericName: 'budesonide, glycopyrrolate, and formoterol fumarate', brandNames: ['Breztri Aerosphere'], aliases: ['Breztri', 'Breztri Aerosphere', 'Breztri Aerosphere inhaler', 'budesonide glycopyrrolate formoterol aerosol'], drugClassIds: ['CLS-ics-lama-laba-combination'] },
};
export const pulmonaryControllerCombinationMedications: MedicationRecord[] = pulmonaryControllerCombinationIdentityDefinitions.map((item) => ({ id: item.medicationId, ...records[item.medicationId]!, ingredientIds: item.ingredientIds }));
