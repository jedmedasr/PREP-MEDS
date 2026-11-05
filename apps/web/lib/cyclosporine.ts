import { cyclosporineIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const cyclosporineIngredients: IngredientRecord[] = [
  { id: 'ING-cyclosporine', canonicalName: 'Cyclosporine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-sandimmune-cyclosporine-nonmodified-oral-capsule': { canonicalName: 'SANDIMMUNE cyclosporine nonmodified oral capsule', genericName: 'cyclosporine nonmodified oral', brandNames: ['Sandimmune'], aliases: ['cyclosporine', 'cyclosporine capsule', 'cyclosporine nonmodified capsule', 'Sandimmune', 'Sandimmune capsule'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-sandimmune-cyclosporine-intravenous-injection': { canonicalName: 'SANDIMMUNE cyclosporine intravenous injection', genericName: 'cyclosporine intravenous', brandNames: ['Sandimmune'], aliases: ['cyclosporine', 'cyclosporine injection', 'intravenous cyclosporine', 'Sandimmune injection'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-neoral-cyclosporine-modified-oral-capsule': { canonicalName: 'NEORAL cyclosporine modified oral capsule', genericName: 'cyclosporine modified oral capsule', brandNames: ['Neoral'], aliases: ['cyclosporine', 'cyclosporine capsule', 'cyclosporine modified capsule', 'Neoral', 'Neoral capsule'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-neoral-cyclosporine-modified-oral-solution': { canonicalName: 'NEORAL cyclosporine modified oral solution', genericName: 'cyclosporine modified oral solution', brandNames: ['Neoral'], aliases: ['cyclosporine', 'cyclosporine oral solution', 'cyclosporine modified solution', 'Neoral solution', 'Neoral oral solution'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
};

export const cyclosporineMedications: MedicationRecord[] =
  cyclosporineIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: ['ING-cyclosporine'],
  }));
