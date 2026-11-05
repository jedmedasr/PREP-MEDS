import { batch04PotassiumSparingIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04PotassiumSparingIngredients: IngredientRecord[] = [
  { id: 'ING-spironolactone', canonicalName: 'Spironolactone' },
  { id: 'ING-eplerenone', canonicalName: 'Eplerenone' },
  { id: 'ING-amiloride', canonicalName: 'Amiloride', aliases: ['amiloride hydrochloride', 'amiloride HCl'] },
  { id: 'ING-triamterene', canonicalName: 'Triamterene' },
];
const aliasesByMedication: Record<string, string[]> = {
  'MED-spironolactone-tablet': ['spironolactone', 'spironolactone tablet'],
  'MED-spironolactone-carospir-suspension': ['spironolactone', 'CAROSPIR', 'CAROSPIR suspension', 'spironolactone oral suspension'],
  'MED-eplerenone-tablet': ['eplerenone', 'eplerenone tablet'],
  'MED-amiloride-tablet': ['amiloride', 'amiloride hydrochloride', 'amiloride tablet', 'amiloride HCl tablet'],
  'MED-triamterene-dyrenium-capsule': ['triamterene', 'DYRENIUM', 'DYRENIUM capsule', 'triamterene capsule'],
  'MED-spironolactone-hydrochlorothiazide-tablet': ['spironolactone', 'spironolactone/HCTZ', 'spironolactone hydrochlorothiazide', 'spironolactone and hydrochlorothiazide tablet'],
  'MED-amiloride-hydrochlorothiazide-tablet': ['amiloride', 'amiloride/HCTZ', 'amiloride hydrochlorothiazide', 'amiloride and hydrochlorothiazide tablet'],
  'MED-triamterene-hydrochlorothiazide-capsule': ['triamterene', 'triamterene/HCTZ capsule', 'triamterene and hydrochlorothiazide capsule'],
  'MED-triamterene-hydrochlorothiazide-tablet': ['triamterene', 'triamterene/HCTZ tablet', 'triamterene and hydrochlorothiazide tablet'],
};
function canonicalName(id: string): string {
  switch (id) {
    case 'MED-spironolactone-tablet': return 'Spironolactone oral tablet';
    case 'MED-spironolactone-carospir-suspension': return 'CAROSPIR spironolactone oral suspension';
    case 'MED-eplerenone-tablet': return 'Eplerenone oral tablet';
    case 'MED-amiloride-tablet': return 'Amiloride hydrochloride oral tablet';
    case 'MED-triamterene-dyrenium-capsule': return 'DYRENIUM triamterene oral capsule';
    case 'MED-spironolactone-hydrochlorothiazide-tablet': return 'Spironolactone/hydrochlorothiazide oral tablet';
    case 'MED-amiloride-hydrochlorothiazide-tablet': return 'Amiloride hydrochloride/hydrochlorothiazide oral tablet';
    case 'MED-triamterene-hydrochlorothiazide-capsule': return 'Triamterene/hydrochlorothiazide oral capsule';
    default: return 'Triamterene/hydrochlorothiazide oral tablet';
  }
}
export const batch04PotassiumSparingMedications: MedicationRecord[] = batch04PotassiumSparingIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, canonicalName: canonicalName(definition.medicationId), genericName: definition.genericName,
  brandNames: definition.brandName ? [definition.brandName] : [], aliases: aliasesByMedication[definition.medicationId] ?? [],
  ingredientIds: definition.ingredientIds,
  drugClassIds: ['CLS-diuretic', 'CLS-potassium-sparing-diuretic',
    ...(definition.ingredientIds.includes('ING-spironolactone') || definition.ingredientIds.includes('ING-eplerenone') ? ['CLS-mineralocorticoid-receptor-antagonist'] : []),
    ...(definition.combination ? ['CLS-thiazide-diuretic', 'CLS-fixed-combination-diuretic'] : [])],
}));
