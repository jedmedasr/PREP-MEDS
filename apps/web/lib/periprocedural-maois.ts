import { periproceduralMaoiIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const periproceduralMaoiIngredients: IngredientRecord[] = [
  { id: 'ING-phenelzine', canonicalName: 'Phenelzine' },
  { id: 'ING-tranylcypromine', canonicalName: 'Tranylcypromine' },
  { id: 'ING-isocarboxazid', canonicalName: 'Isocarboxazid' },
  { id: 'ING-selegiline', canonicalName: 'Selegiline' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-phenelzine-sulfate-oral-tablet': { canonicalName: 'Phenelzine sulfate oral tablet', genericName: 'phenelzine sulfate', brandNames: ['Nardil'], aliases: ['phenelzine', 'phenelzine tablet', 'Nardil', 'Nardil tablet'], drugClassIds: ['CLS-monoamine-oxidase-inhibitor', 'CLS-nonselective-irreversible-maoi'] },
  'MED-parnate-tranylcypromine-film-coated-oral-tablet': { canonicalName: 'PARNATE tranylcypromine sulfate film-coated oral tablet', genericName: 'tranylcypromine sulfate', brandNames: ['Parnate'], aliases: ['tranylcypromine', 'tranylcypromine tablet', 'Parnate', 'Parnate tablet'], drugClassIds: ['CLS-monoamine-oxidase-inhibitor', 'CLS-nonselective-irreversible-maoi'] },
  'MED-marplan-isocarboxazid-oral-tablet': { canonicalName: 'MARPLAN isocarboxazid oral tablet', genericName: 'isocarboxazid', brandNames: ['Marplan'], aliases: ['isocarboxazid', 'isocarboxazid tablet', 'Marplan', 'Marplan tablet'], drugClassIds: ['CLS-monoamine-oxidase-inhibitor', 'CLS-nonselective-irreversible-maoi'] },
  'MED-emsam-selegiline-transdermal-system': { canonicalName: 'EMSAM selegiline transdermal system', genericName: 'selegiline transdermal', brandNames: ['Emsam'], aliases: ['Emsam', 'Emsam patch', 'selegiline patch', 'selegiline transdermal system'], drugClassIds: ['CLS-monoamine-oxidase-inhibitor', 'CLS-transdermal-maoi'] },
};

export const periproceduralMaoiMedications: MedicationRecord[] =
  periproceduralMaoiIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
