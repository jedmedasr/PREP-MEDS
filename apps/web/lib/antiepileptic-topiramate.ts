import { antiepilepticTopiramateIdentityDefinitions } from '@prep-meds/clinical-content';
import type { MedicationRecord } from '@prep-meds/terminology';

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-topamax-topiramate-coated-oral-tablet': { canonicalName: 'TOPAMAX topiramate coated oral tablet', genericName: 'topiramate', brandNames: ['Topamax'], aliases: ['topiramate', 'Topamax', 'topiramate tablet', 'Topamax tablet', 'topiramate immediate release tablet'], drugClassIds: ['CLS-antiepileptic', 'CLS-topiramate'] },
  'MED-topamax-topiramate-sprinkle-capsule': { canonicalName: 'TOPAMAX topiramate sprinkle capsule', genericName: 'topiramate', brandNames: ['Topamax'], aliases: ['topiramate', 'Topamax', 'Topamax sprinkle capsule', 'topiramate sprinkle capsule', 'topiramate coated pellets capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-topiramate'] },
  'MED-eprontia-topiramate-oral-solution': { canonicalName: 'EPRONTIA topiramate oral solution', genericName: 'topiramate', brandNames: ['Eprontia'], aliases: ['topiramate', 'Eprontia', 'topiramate oral solution', 'Eprontia oral solution', 'topiramate liquid'], drugClassIds: ['CLS-antiepileptic', 'CLS-topiramate'] },
  'MED-qudexy-xr-topiramate-er-oral-capsule': { canonicalName: 'QUDEXY XR topiramate extended-release oral capsule', genericName: 'topiramate extended release', brandNames: ['Qudexy XR'], aliases: ['topiramate', 'Qudexy XR', 'topiramate extended release capsule', 'topiramate ER capsule', 'Qudexy capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-topiramate'] },
  'MED-trokendi-xr-topiramate-er-oral-capsule': { canonicalName: 'TROKENDI XR topiramate extended-release oral capsule', genericName: 'topiramate extended release', brandNames: ['Trokendi XR'], aliases: ['topiramate', 'Trokendi XR', 'topiramate extended release capsule', 'topiramate ER capsule', 'Trokendi capsule'], drugClassIds: ['CLS-antiepileptic', 'CLS-topiramate'] },
};

export const antiepilepticTopiramateMedications: MedicationRecord[] = antiepilepticTopiramateIdentityDefinitions.map((definition) => ({
  id: definition.medicationId, ...recordById[definition.medicationId]!, ingredientIds: definition.ingredientIds,
}));
