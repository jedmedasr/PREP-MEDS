import { batch04OtherAntihypertensiveIdentityDefinitions } from '@prep-meds/clinical-content';
import type { IngredientRecord, MedicationRecord } from '@prep-meds/terminology';

export const batch04OtherAntihypertensiveIngredients: IngredientRecord[] = [
  { id: 'ING-clonidine', canonicalName: 'Clonidine', aliases: ['clonidine hydrochloride', 'clonidine HCl'] },
  { id: 'ING-hydralazine', canonicalName: 'Hydralazine', aliases: ['hydralazine hydrochloride', 'hydralazine HCl'] },
  { id: 'ING-minoxidil', canonicalName: 'Minoxidil' },
  { id: 'ING-doxazosin', canonicalName: 'Doxazosin', aliases: ['doxazosin mesylate'] },
  { id: 'ING-prazosin', canonicalName: 'Prazosin', aliases: ['prazosin hydrochloride', 'prazosin HCl'] },
];

const recordById: Record<string, Omit<MedicationRecord, 'id' | 'ingredientIds'>> = {
  'MED-clonidine-tablet': {
    canonicalName: 'Clonidine hydrochloride oral tablet', genericName: 'clonidine hydrochloride',
    aliases: ['clonidine', 'clonidine tablet', 'oral clonidine', 'clonidine HCl tablet'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-central-alpha-agonist'],
  },
  'MED-clonidine-catapres-tts-patch': {
    canonicalName: 'CATAPRES-TTS clonidine transdermal patch', genericName: 'clonidine transdermal system',
    brandNames: ['CATAPRES-TTS'], aliases: ['clonidine', 'clonidine patch', 'clonidine transdermal patch', 'CATAPRES TTS'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-central-alpha-agonist'],
  },
  'MED-hydralazine-tablet': {
    canonicalName: 'Hydralazine hydrochloride oral tablet', genericName: 'hydralazine hydrochloride',
    aliases: ['hydralazine', 'hydralazine tablet', 'hydralazine HCl tablet'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-direct-vasodilator'],
  },
  'MED-minoxidil-oral-tablet': {
    canonicalName: 'Systemic oral tablet containing minoxidil',
    aliases: ['systemic minoxidil oral tablet', 'oral antihypertensive minoxidil tablet'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-direct-vasodilator'],
  },
  'MED-doxazosin-tablet': {
    canonicalName: 'Doxazosin mesylate oral tablet', genericName: 'doxazosin mesylate',
    aliases: ['doxazosin', 'doxazosin tablet'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-alpha-1-blocker'],
  },
  'MED-prazosin-capsule': {
    canonicalName: 'Prazosin hydrochloride oral capsule', genericName: 'prazosin hydrochloride',
    aliases: ['prazosin', 'prazosin capsule', 'prazosin HCl capsule'],
    drugClassIds: ['CLS-antihypertensive', 'CLS-alpha-1-blocker'],
  },
};

export const batch04OtherAntihypertensiveMedications: MedicationRecord[] =
  batch04OtherAntihypertensiveIdentityDefinitions.map((definition) => ({
    id: definition.medicationId,
    ...recordById[definition.medicationId]!,
    ingredientIds: [definition.ingredientId],
  }));
