import { periproceduralStimulantIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralStimulantIngredients: IngredientRecord[] = [
  { id: 'ING-amphetamine', canonicalName: 'Amphetamine' },
  { id: 'ING-dextroamphetamine', canonicalName: 'Dextroamphetamine' },
  { id: 'ING-lisdexamfetamine', canonicalName: 'Lisdexamfetamine' },
  { id: 'ING-methylphenidate', canonicalName: 'Methylphenidate' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-adderall-mixed-amphetamine-salts-tablet': { canonicalName: 'ADDERALL mixed amphetamine salts immediate-release oral tablet', genericName: 'mixed amphetamine salts', brandNames: ['Adderall'], aliases: ['Adderall', 'Adderall IR', 'mixed amphetamine salts', 'mixed amphetamine salts tablet', 'amphetamine dextroamphetamine tablet'], drugClassIds: ['CLS-cns-stimulant', 'CLS-amphetamine-stimulant'] },
  'MED-adderall-xr-mixed-amphetamine-salts-er-capsule': { canonicalName: 'ADDERALL XR mixed amphetamine salts extended-release oral capsule', genericName: 'mixed amphetamine salts extended-release', brandNames: ['Adderall XR'], aliases: ['Adderall', 'Adderall XR', 'mixed amphetamine salts', 'mixed amphetamine salts ER', 'amphetamine dextroamphetamine ER capsule'], drugClassIds: ['CLS-cns-stimulant', 'CLS-amphetamine-stimulant'] },
  'MED-vyvanse-lisdexamfetamine-capsule': { canonicalName: 'VYVANSE lisdexamfetamine oral capsule', genericName: 'lisdexamfetamine', brandNames: ['Vyvanse'], aliases: ['Vyvanse', 'Vyvanse capsule', 'lisdexamfetamine', 'lisdexamfetamine capsule'], drugClassIds: ['CLS-cns-stimulant', 'CLS-amphetamine-stimulant'] },
  'MED-vyvanse-lisdexamfetamine-chewable-tablet': { canonicalName: 'VYVANSE lisdexamfetamine chewable oral tablet', genericName: 'lisdexamfetamine', brandNames: ['Vyvanse'], aliases: ['Vyvanse', 'Vyvanse chewable', 'lisdexamfetamine', 'lisdexamfetamine chewable tablet'], drugClassIds: ['CLS-cns-stimulant', 'CLS-amphetamine-stimulant'] },
  'MED-ritalin-methylphenidate-ir-tablet': { canonicalName: 'RITALIN methylphenidate immediate-release oral tablet', genericName: 'methylphenidate', brandNames: ['Ritalin'], aliases: ['Ritalin', 'Ritalin tablet', 'methylphenidate', 'methylphenidate IR', 'methylphenidate immediate-release tablet'], drugClassIds: ['CLS-cns-stimulant', 'CLS-methylphenidate-stimulant'] },
  'MED-concerta-methylphenidate-er-tablet': { canonicalName: 'CONCERTA methylphenidate extended-release oral tablet', genericName: 'methylphenidate extended-release', brandNames: ['Concerta'], aliases: ['Concerta', 'Concerta ER', 'methylphenidate', 'methylphenidate ER', 'methylphenidate extended-release tablet'], drugClassIds: ['CLS-cns-stimulant', 'CLS-methylphenidate-stimulant'] },
};

export const periproceduralStimulantMedications: MedicationRecord[] =
  periproceduralStimulantIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
