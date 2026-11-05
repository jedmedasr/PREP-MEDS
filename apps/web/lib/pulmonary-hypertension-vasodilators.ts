import { pulmonaryHypertensionVasodilatorIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const pulmonaryHypertensionVasodilatorIngredients: IngredientRecord[] = [
  { id: 'ING-sildenafil', canonicalName: 'Sildenafil', aliases: ['sildenafil citrate'] },
  { id: 'ING-tadalafil', canonicalName: 'Tadalafil' },
  { id: 'ING-bosentan', canonicalName: 'Bosentan' },
  { id: 'ING-ambrisentan', canonicalName: 'Ambrisentan' },
  { id: 'ING-macitentan', canonicalName: 'Macitentan' },
  { id: 'ING-riociguat', canonicalName: 'Riociguat' },
  { id: 'ING-sotatercept-csrk', canonicalName: 'Sotatercept-csrk', aliases: ['sotatercept'] },
  { id: 'ING-iloprost', canonicalName: 'Iloprost' },
];

const cls = ['CLS-pulmonary-hypertension-therapy'];
const records: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-revatio-sildenafil-oral-tablet': { canonicalName: 'REVATIO sildenafil oral tablet', genericName: 'sildenafil', brandNames: ['Revatio'], aliases: ['sildenafil', 'Revatio', 'Revatio tablet', 'sildenafil PAH tablet'], drugClassIds: cls },
  'MED-revatio-sildenafil-oral-suspension': { canonicalName: 'REVATIO sildenafil oral suspension', genericName: 'sildenafil', brandNames: ['Revatio'], aliases: ['sildenafil', 'Revatio', 'Revatio suspension', 'sildenafil oral suspension'], drugClassIds: cls },
  'MED-revatio-sildenafil-intravenous-injection': { canonicalName: 'REVATIO sildenafil intravenous injection', genericName: 'sildenafil', brandNames: ['Revatio'], aliases: ['sildenafil', 'Revatio', 'Revatio IV', 'sildenafil injection'], drugClassIds: cls },
  'MED-adcirca-tadalafil-oral-tablet': { canonicalName: 'ADCIRCA tadalafil oral tablet', genericName: 'tadalafil', brandNames: ['Adcirca'], aliases: ['tadalafil', 'Adcirca', 'tadalafil PAH tablet'], drugClassIds: cls },
  'MED-tracleer-bosentan-oral-tablet': { canonicalName: 'TRACLEER bosentan oral tablet', genericName: 'bosentan', brandNames: ['Tracleer'], aliases: ['bosentan', 'Tracleer', 'Tracleer film coated tablet'], drugClassIds: cls },
  'MED-tracleer-bosentan-tablet-for-oral-suspension': { canonicalName: 'TRACLEER bosentan tablet for oral suspension', genericName: 'bosentan', brandNames: ['Tracleer'], aliases: ['bosentan', 'Tracleer', 'Tracleer dispersible tablet', 'bosentan tablet for suspension'], drugClassIds: cls },
  'MED-letairis-ambrisentan-oral-tablet': { canonicalName: 'LETAIRIS ambrisentan oral tablet', genericName: 'ambrisentan', brandNames: ['Letairis'], aliases: ['ambrisentan', 'Letairis'], drugClassIds: cls },
  'MED-opsumit-macitentan-oral-tablet': { canonicalName: 'OPSUMIT macitentan oral tablet', genericName: 'macitentan', brandNames: ['Opsumit'], aliases: ['macitentan', 'Opsumit'], drugClassIds: cls },
  'MED-opsynvi-macitentan-tadalafil-oral-tablet': { canonicalName: 'OPSYNVI macitentan/tadalafil fixed-combination oral tablet', genericName: 'macitentan and tadalafil', brandNames: ['Opsynvi'], aliases: ['macitentan', 'tadalafil', 'Opsynvi', 'macitentan tadalafil combination'], drugClassIds: cls },
  'MED-adempas-riociguat-oral-tablet': { canonicalName: 'ADEMPAS riociguat oral tablet', genericName: 'riociguat', brandNames: ['Adempas'], aliases: ['riociguat', 'Adempas'], drugClassIds: cls },
  'MED-winrevair-sotatercept-subcutaneous-injection': { canonicalName: 'WINREVAIR sotatercept-csrk subcutaneous injection kit', genericName: 'sotatercept-csrk', brandNames: ['Winrevair'], aliases: ['sotatercept', 'Winrevair', 'Winrevair injection'], drugClassIds: cls },
  'MED-ventavis-iloprost-inhalation-solution': { canonicalName: 'VENTAVIS iloprost inhalation solution', genericName: 'iloprost', brandNames: ['Ventavis'], aliases: ['iloprost', 'Ventavis', 'iloprost inhalation solution'], drugClassIds: cls },
  'MED-aurlumyn-iloprost-intravenous-injection': { canonicalName: 'AURLUMYN iloprost intravenous injection', genericName: 'iloprost', brandNames: ['Aurlumyn'], aliases: ['iloprost', 'Aurlumyn', 'iloprost IV injection'], drugClassIds: ['CLS-iloprost-non-pah-collision-guard'] },
};

export const pulmonaryHypertensionVasodilatorMedications: MedicationRecord[] = pulmonaryHypertensionVasodilatorIdentityDefinitions.map((item) => ({
  id: item.medicationId,
  ...records[item.medicationId]!,
  ingredientIds: item.ingredientIds,
}));
