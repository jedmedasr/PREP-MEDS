import { mycophenolateIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const mycophenolateIngredients: IngredientRecord[] = [
  { id: 'ING-mycophenolate-mofetil', canonicalName: 'Mycophenolate mofetil' },
  { id: 'ING-mycophenolic-acid', canonicalName: 'Mycophenolic acid' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-cellcept-mycophenolate-mofetil-oral-capsule': { canonicalName: 'CELLCEPT mycophenolate mofetil oral capsule', genericName: 'mycophenolate mofetil oral capsule', brandNames: ['CellCept'], aliases: ['mycophenolate', 'mycophenolate mofetil', 'mycophenolate capsule', 'CellCept', 'CellCept capsule'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
  'MED-cellcept-mycophenolate-mofetil-oral-tablet': { canonicalName: 'CELLCEPT mycophenolate mofetil oral tablet', genericName: 'mycophenolate mofetil oral tablet', brandNames: ['CellCept'], aliases: ['mycophenolate', 'mycophenolate mofetil', 'mycophenolate tablet', 'CellCept', 'CellCept tablet'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
  'MED-cellcept-mycophenolate-mofetil-oral-suspension': { canonicalName: 'CELLCEPT mycophenolate mofetil oral suspension', genericName: 'mycophenolate mofetil oral suspension', brandNames: ['CellCept'], aliases: ['mycophenolate', 'mycophenolate mofetil', 'mycophenolate suspension', 'CellCept', 'CellCept oral suspension'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
  'MED-cellcept-mycophenolate-mofetil-intravenous-injection': { canonicalName: 'CELLCEPT mycophenolate mofetil intravenous injection', genericName: 'mycophenolate mofetil intravenous injection', brandNames: ['CellCept Intravenous'], aliases: ['mycophenolate', 'mycophenolate mofetil', 'mycophenolate injection', 'CellCept', 'CellCept IV'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
  'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet': { canonicalName: 'MYFORTIC mycophenolic acid delayed-release oral tablet', genericName: 'mycophenolic acid delayed-release oral tablet', brandNames: ['Myfortic'], aliases: ['mycophenolate', 'mycophenolic acid', 'mycophenolic acid delayed-release tablet', 'Myfortic', 'Myfortic tablet'], drugClassIds: ['CLS-antimetabolite-immunosuppressant', 'CLS-transplant-immunosuppressant'] },
};

export const mycophenolateMedications: MedicationRecord[] =
  mycophenolateIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
