import { mtorInhibitorIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const mtorInhibitorIngredients: IngredientRecord[] = [
  { id: 'ING-sirolimus', canonicalName: 'Sirolimus' },
  { id: 'ING-everolimus', canonicalName: 'Everolimus' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-sirolimus-oral-tablet': { canonicalName: 'Sirolimus oral tablet', genericName: 'sirolimus oral tablet', aliases: ['sirolimus', 'sirolimus tablet', 'Rapamune tablet'], drugClassIds: ['CLS-mtor-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-sirolimus-oral-solution': { canonicalName: 'Sirolimus oral solution', genericName: 'sirolimus oral solution', aliases: ['sirolimus', 'sirolimus solution', 'Rapamune oral solution'], drugClassIds: ['CLS-mtor-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-zortress-everolimus-transplant-oral-tablet': { canonicalName: 'ZORTRESS everolimus transplant oral tablet', genericName: 'everolimus transplant oral tablet', brandNames: ['Zortress'], aliases: ['everolimus', 'everolimus tablet', 'Zortress', 'Zortress tablet'], drugClassIds: ['CLS-mtor-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-afinitor-everolimus-oncology-oral-tablet': { canonicalName: 'AFINITOR everolimus oncology oral tablet', genericName: 'everolimus oncology oral tablet', brandNames: ['Afinitor'], aliases: ['everolimus', 'everolimus tablet', 'Afinitor', 'Afinitor tablet'], drugClassIds: ['CLS-mtor-inhibitor', 'CLS-oncology-therapy'] },
  'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension': { canonicalName: 'AFINITOR DISPERZ everolimus oncology tablet for oral suspension', genericName: 'everolimus oncology tablet for oral suspension', brandNames: ['Afinitor Disperz'], aliases: ['everolimus', 'everolimus tablet for suspension', 'Afinitor Disperz', 'Afinitor Disperz tablet for suspension'], drugClassIds: ['CLS-mtor-inhibitor', 'CLS-oncology-therapy'] },
};

export const mtorInhibitorMedications: MedicationRecord[] =
  mtorInhibitorIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.medicationId.includes('sirolimus') ? 'ING-sirolimus' : 'ING-everolimus'],
  }));
