import { batch05OtherCardiacIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch05OtherCardiacIngredients: IngredientRecord[] = [
  { id: 'ING-digoxin', canonicalName: 'Digoxin', aliases: ['digitalis'] },
  { id: 'ING-ivabradine', canonicalName: 'Ivabradine', aliases: ['ivabradine hydrochloride'] },
  { id: 'ING-nitroglycerin', canonicalName: 'Nitroglycerin', aliases: ['glyceryl trinitrate'] },
  { id: 'ING-isosorbide-dinitrate', canonicalName: 'Isosorbide dinitrate', aliases: ['ISDN'] },
  { id: 'ING-isosorbide-mononitrate', canonicalName: 'Isosorbide mononitrate', aliases: ['ISMN'] },
  { id: 'ING-ranolazine', canonicalName: 'Ranolazine' },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-digoxin-tablet': { canonicalName: 'Digoxin oral tablet', genericName: 'digoxin', aliases: ['digoxin', 'digoxin tablet', 'oral digoxin tablet'], drugClassIds: ['CLS-cardiac-glycoside'] },
  'MED-digoxin-oral-solution': { canonicalName: 'Digoxin oral solution', genericName: 'digoxin', aliases: ['digoxin', 'digoxin solution', 'digoxin oral solution'], drugClassIds: ['CLS-cardiac-glycoside'] },
  'MED-digoxin-injection-solution': { canonicalName: 'Digoxin injection solution (intravenous or intramuscular)', genericName: 'digoxin', brandNames: ['Lanoxin'], aliases: ['digoxin', 'digoxin injection', 'digoxin IV', 'Lanoxin injection'], drugClassIds: ['CLS-cardiac-glycoside'] },
  'MED-ivabradine-film-coated-tablet': { canonicalName: 'Ivabradine oral film-coated tablet', genericName: 'ivabradine', brandNames: ['Corlanor'], aliases: ['ivabradine', 'Corlanor', 'ivabradine tablet', 'Corlanor tablet'], drugClassIds: ['CLS-hcn-channel-blocker'] },
  'MED-ivabradine-oral-solution': { canonicalName: 'Ivabradine oral solution', genericName: 'ivabradine', brandNames: ['Corlanor'], aliases: ['ivabradine', 'Corlanor', 'ivabradine solution', 'Corlanor oral solution'], drugClassIds: ['CLS-hcn-channel-blocker'] },
  'MED-nitroglycerin-sublingual-tablet': { canonicalName: 'Nitroglycerin sublingual tablet', genericName: 'nitroglycerin', brandNames: ['Nitrostat'], aliases: ['nitroglycerin', 'nitroglycerin sublingual', 'nitroglycerin SL tablet', 'Nitrostat'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-nitroglycerin-lingual-spray': { canonicalName: 'Nitroglycerin lingual spray', genericName: 'nitroglycerin', aliases: ['nitroglycerin', 'nitroglycerin spray', 'nitroglycerin lingual spray'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-nitroglycerin-transdermal-patch': { canonicalName: 'Nitroglycerin transdermal patch', genericName: 'nitroglycerin', aliases: ['nitroglycerin', 'nitroglycerin patch', 'nitroglycerin transdermal'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-nitroglycerin-topical-ointment': { canonicalName: 'Nitroglycerin topical ointment', genericName: 'nitroglycerin', brandNames: ['Nitro-Bid'], aliases: ['nitroglycerin', 'nitroglycerin ointment', 'Nitro-Bid'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-isosorbide-dinitrate-oral-tablet': { canonicalName: 'Isosorbide dinitrate oral tablet', genericName: 'isosorbide dinitrate', aliases: ['isosorbide dinitrate', 'ISDN', 'isosorbide dinitrate oral tablet'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-isosorbide-dinitrate-sublingual-tablet': { canonicalName: 'Isosorbide dinitrate sublingual tablet', genericName: 'isosorbide dinitrate', aliases: ['isosorbide dinitrate', 'ISDN', 'isosorbide dinitrate sublingual', 'ISDN sublingual'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-isosorbide-mononitrate-er-tablet': { canonicalName: 'Isosorbide mononitrate extended-release oral tablet', genericName: 'isosorbide mononitrate extended-release', aliases: ['isosorbide mononitrate ER', 'ISMN ER', 'isosorbide mononitrate extended-release tablet'], drugClassIds: ['CLS-organic-nitrate', 'CLS-antianginal'] },
  'MED-ranolazine-er-tablet': { canonicalName: 'Ranolazine extended-release film-coated oral tablet', genericName: 'ranolazine extended-release', aliases: ['ranolazine ER', 'ranolazine extended-release tablet'], drugClassIds: ['CLS-antianginal'] },
};

export const batch05OtherCardiacMedications: MedicationRecord[] =
  batch05OtherCardiacIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
