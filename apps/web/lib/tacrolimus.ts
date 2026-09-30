import { tacrolimusIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const tacrolimusIngredients: IngredientRecord[] = [
  { id: 'ING-tacrolimus', canonicalName: 'Tacrolimus' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-prograf-tacrolimus-immediate-release-oral-capsule': { canonicalName: 'PROGRAF tacrolimus immediate-release oral capsule', genericName: 'tacrolimus immediate-release', brandNames: ['Prograf'], aliases: ['tacrolimus', 'tacrolimus immediate-release capsule', 'Prograf capsule'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-prograf-tacrolimus-granules-for-oral-suspension': { canonicalName: 'PROGRAF tacrolimus granules for oral suspension', genericName: 'tacrolimus for oral suspension', brandNames: ['Prograf Granules'], aliases: ['tacrolimus', 'tacrolimus oral suspension', 'Prograf granules'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-prograf-tacrolimus-intravenous-injection': { canonicalName: 'PROGRAF tacrolimus intravenous injection', genericName: 'tacrolimus injection', brandNames: ['Prograf'], aliases: ['tacrolimus', 'tacrolimus injection', 'Prograf injection', 'intravenous tacrolimus'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule': { canonicalName: 'ASTAGRAF XL tacrolimus extended-release oral capsule', genericName: 'tacrolimus extended-release capsule', brandNames: ['Astagraf XL'], aliases: ['tacrolimus', 'Astagraf XL', 'Astagraf XL capsule', 'tacrolimus extended-release capsule'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
  'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet': { canonicalName: 'ENVARSUS XR tacrolimus extended-release oral tablet', genericName: 'tacrolimus extended-release tablet', brandNames: ['Envarsus XR'], aliases: ['tacrolimus', 'Envarsus XR', 'Envarsus XR tablet', 'tacrolimus extended-release tablet'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'] },
};

export const tacrolimusMedications: MedicationRecord[] =
  tacrolimusIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: ['ING-tacrolimus'],
  }));
