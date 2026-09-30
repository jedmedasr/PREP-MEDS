import { weightManagementIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const weightManagementIngredients: IngredientRecord[] = [
  { id: 'ING-phentermine', canonicalName: 'Phentermine' },
  { id: 'ING-topiramate', canonicalName: 'Topiramate' },
  { id: 'ING-bupropion', canonicalName: 'Bupropion' },
  { id: 'ING-orlistat', canonicalName: 'Orlistat' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-phentermine-hydrochloride-oral-capsule': { canonicalName: 'Phentermine hydrochloride oral capsule', genericName: 'phentermine hydrochloride', aliases: ['phentermine', 'phentermine capsule', 'phentermine hydrochloride capsule'], drugClassIds: ['CLS-weight-management', 'CLS-sympathomimetic-anorectic'] },
  'MED-phentermine-hydrochloride-oral-tablet': { canonicalName: 'Phentermine hydrochloride oral tablet', genericName: 'phentermine hydrochloride', aliases: ['phentermine', 'phentermine tablet', 'phentermine hydrochloride tablet'], drugClassIds: ['CLS-weight-management', 'CLS-sympathomimetic-anorectic'] },
  'MED-qsymia-phentermine-topiramate-er-capsule': { canonicalName: 'QSYMIA phentermine/topiramate extended-release oral capsule', genericName: 'phentermine/topiramate extended release', brandNames: ['Qsymia'], aliases: ['Qsymia', 'Qsymia capsule', 'phentermine topiramate ER', 'phentermine/topiramate extended-release capsule'], drugClassIds: ['CLS-weight-management', 'CLS-sympathomimetic-anorectic', 'CLS-fixed-dose-combination'] },
  'MED-contrave-naltrexone-bupropion-er-tablet': { canonicalName: 'CONTRAVE naltrexone/bupropion extended-release oral tablet', genericName: 'naltrexone/bupropion extended release', brandNames: ['Contrave'], aliases: ['Contrave', 'Contrave ER', 'naltrexone bupropion ER', 'naltrexone/bupropion extended-release tablet'], drugClassIds: ['CLS-weight-management', 'CLS-fixed-dose-combination', 'CLS-opioid-antagonist-containing'] },
  'MED-xenical-orlistat-120mg-capsule': { canonicalName: 'XENICAL orlistat 120 mg prescription oral capsule', genericName: 'orlistat 120 mg', brandNames: ['Xenical'], aliases: ['orlistat', 'Xenical', 'Xenical capsule', 'orlistat 120 mg capsule'], drugClassIds: ['CLS-weight-management', 'CLS-gastrointestinal-lipase-inhibitor'] },
  'MED-alli-orlistat-60mg-otc-capsule': { canonicalName: 'ALLI orlistat 60 mg OTC oral capsule', genericName: 'orlistat 60 mg', brandNames: ['Alli'], aliases: ['orlistat', 'Alli', 'Alli capsule', 'orlistat 60 mg capsule'], drugClassIds: ['CLS-weight-management', 'CLS-gastrointestinal-lipase-inhibitor'] },
};

export const weightManagementMedications: MedicationRecord[] =
  weightManagementIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: definition.ingredientIds,
  }));
