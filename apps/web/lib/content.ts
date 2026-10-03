import type { ClinicalRule, PolicyOverlay } from '@prep-meds/clinical-engine';
import {
  antithromboticCandidateRules,
  antithromboticEvidence,
  antithromboticReleaseMetadata,
  firstClinicalContentEvidence,
  firstReleaseCandidateRules,
  firstReleaseMetadata,
  diabetesCoreEvidence,
  diabetesCoreReleaseMetadata,
  diabetesWorkflowRules,
  diabetesWorkflowMetadata,
  batch03ReviewRules,
  batch03SemaglutideIdentityEvidence,
  batch03IncretinIdentityEvidence,
  batch03FixedCombinationIdentityEvidence,
  batch03Sglt2CombinationIdentityEvidence,
  batch04AceIdentityEvidence,
  batch04AceReviewRules,
  batch04ArbArniIdentityEvidence,
  batch04ArbArniReviewRules,
  batch04BetaBlockerIdentityEvidence,
  batch04BetaBlockerReviewRules,
  batch04DhpCcbIdentityEvidence,
  batch04DhpCcbReviewRules,
  batch04NonDhpCcbIdentityEvidence,
  batch04NonDhpCcbReviewRules,
  batch04ThiazideDiureticIdentityEvidence,
  batch04ThiazideDiureticReviewRules,
  batch04LoopDiureticIdentityEvidence,
  batch04LoopDiureticReviewRules,
  batch04PotassiumSparingIdentityEvidence,
  batch04PotassiumSparingReviewRules,
  batch04OtherAntihypertensiveIdentityEvidence,
  batch04OtherAntihypertensiveReviewRules,
  batch05ClassIIIAntiarrhythmicIdentityEvidence,
  batch05ClassIIIAntiarrhythmicReviewRules,
  batch05ClassIAntiarrhythmicIdentityEvidence,
  batch05ClassIAntiarrhythmicReviewRules,
  batch05OtherCardiacIdentityEvidence,
  batch05OtherCardiacReviewRules,
  periproceduralBuprenorphineIdentityEvidence,
  periproceduralBuprenorphineReviewRules,
  periproceduralMethadoneNaltrexoneIdentityEvidence,
  periproceduralMethadoneNaltrexoneReviewRules,
  periproceduralStimulantIdentityEvidence,
  periproceduralStimulantReviewRules,
  periproceduralMaoiIdentityEvidence,
  periproceduralMaoiReviewRules,
  periproceduralLithiumIdentityEvidence,
  periproceduralLithiumReviewRules,
  systemicCorticosteroidIdentityEvidence,
  systemicCorticosteroidReviewRules,
  tacrolimusIdentityEvidence,
  tacrolimusReviewRules,
  cyclosporineIdentityEvidence,
  cyclosporineReviewRules,
  mtorInhibitorIdentityEvidence,
  mtorInhibitorReviewRules,
  mycophenolateIdentityEvidence,
  mycophenolateReviewRules,
  azathioprineIdentityEvidence,
  azathioprineReviewRules,
  weightManagementIdentityEvidence,
  weightManagementReviewRules,
  parkinsonCoreIdentityEvidence,
  parkinsonCoreReviewRules,
  parkinsonOralDopamineAgonistIdentityEvidence,
  parkinsonOralDopamineAgonistReviewRules,
  parkinsonMaobAdjunctIdentityEvidence,
  parkinsonMaobAdjunctReviewRules,
  parkinsonComtIdentityEvidence,
  parkinsonComtReviewRules,
  parkinsonAmantadineIdentityEvidence,
  parkinsonAmantadineReviewRules,
  antiepilepticLevetiracetamIdentityEvidence,
  antiepilepticLevetiracetamReviewRules,
  antiepilepticLacosamideIdentityEvidence,
  antiepilepticLacosamideReviewRules,
  antiepilepticTopiramateIdentityEvidence,
  antiepilepticTopiramateReviewRules,
  antiepilepticZonisamideIdentityEvidence,
  antiepilepticZonisamideReviewRules,
  antiepilepticOxcarbazepineIdentityEvidence,
  antiepilepticOxcarbazepineReviewRules,
  antiepilepticCarbamazepineIdentityEvidence,
  antiepilepticCarbamazepineReviewRules,
  antiepilepticPhenytoinIdentityEvidence,
  antiepilepticPhenytoinReviewRules,
  antiepilepticPhenobarbitalIdentityEvidence,
  antiepilepticPhenobarbitalReviewRules,
  antiepilepticValproateIdentityEvidence,
  antiepilepticValproateReviewRules,
  gabapentinoidIdentityEvidence,
  gabapentinoidReviewRules,
  pulmonaryRescueIdentityEvidence,
  pulmonaryRescueReviewRules,
  pulmonaryControllerCombinationIdentityEvidence,
  pulmonaryControllerCombinationReviewRules,
  pulmonaryMethylxanthineIdentityEvidence,
  pulmonaryMethylxanthineReviewRules,
  pulmonaryHypertensionProstacyclinIdentityEvidence,
  pulmonaryHypertensionProstacyclinReviewRules,
  pulmonaryHypertensionVasodilatorIdentityEvidence,
  pulmonaryHypertensionVasodilatorReviewRules,
} from '@prep-meds/clinical-content';
import { assertTerminologyDataset, type TerminologyDataset } from '@prep-meds/terminology';
import { antithromboticIngredients, antithromboticMedications } from './antithrombotic-terminology';
import { diabetesCoreIngredients, diabetesSearchMedications, diabetesModifierDefinitions } from './diabetes-workflow-content';
import { batch03SemaglutideSearchMedications } from './batch03-semaglutide';
import { batch03IncretinIngredients, batch03IncretinSearchMedications } from './batch03-incretin';
import { batch03FixedCombinationIngredients, batch03FixedCombinationMedications } from './batch03-fixed-combinations';
import { batch03Sglt2CombinationIngredients, batch03Sglt2CombinationMedications } from './batch03-sglt2-combinations';
import { batch04AceIngredients, batch04AceMedications, batch04ArbArniIngredients, batch04ArbArniMedications } from './batch04-raas';
import { batch04BetaBlockerIngredients, batch04BetaBlockerMedications } from './batch04-beta-blockers';
import { batch04DhpCcbIngredients, batch04DhpCcbMedications } from './batch04-dhp-ccbs';
import { batch04NonDhpCcbIngredients, batch04NonDhpCcbMedications } from './batch04-nondhp-ccbs';
import { batch04ThiazideDiureticIngredients, batch04ThiazideDiureticMedications } from './batch04-thiazide-diuretics';
import { batch04LoopDiureticIngredients, batch04LoopDiureticMedications } from './batch04-loop-diuretics';
import { batch04PotassiumSparingIngredients, batch04PotassiumSparingMedications } from './batch04-potassium-sparing';
import { batch04OtherAntihypertensiveIngredients, batch04OtherAntihypertensiveMedications } from './batch04-other-antihypertensives';
import { batch05ClassIIIAntiarrhythmicIngredients, batch05ClassIIIAntiarrhythmicMedications } from './batch05-class-iii-antiarrhythmics';
import { batch05ClassIAntiarrhythmicIngredients, batch05ClassIAntiarrhythmicMedications } from './batch05-class-i-antiarrhythmics';
import { batch05OtherCardiacIngredients, batch05OtherCardiacMedications } from './batch05-other-cardiac';
import { periproceduralBuprenorphineIngredients, periproceduralBuprenorphineMedications } from './periprocedural-buprenorphine';
import { periproceduralMethadoneNaltrexoneIngredients, periproceduralMethadoneNaltrexoneMedications } from './periprocedural-methadone-naltrexone';
import { periproceduralStimulantIngredients, periproceduralStimulantMedications } from './periprocedural-stimulants';
import { periproceduralMaoiIngredients, periproceduralMaoiMedications } from './periprocedural-maois';
import { periproceduralLithiumIngredients, periproceduralLithiumMedications } from './periprocedural-lithium';
import { systemicCorticosteroidIngredients, systemicCorticosteroidMedications } from './systemic-corticosteroids';
import { tacrolimusIngredients, tacrolimusMedications } from './tacrolimus';
import { cyclosporineIngredients, cyclosporineMedications } from './cyclosporine';
import { mtorInhibitorIngredients, mtorInhibitorMedications } from './mtor-inhibitors';
import { mycophenolateIngredients, mycophenolateMedications } from './mycophenolate';
import { azathioprineIngredients, azathioprineMedications } from './azathioprine';
import { weightManagementIngredients, weightManagementMedications } from './weight-management';
import { parkinsonCoreIngredients, parkinsonCoreMedications } from './parkinson-core';
import { parkinsonOralDopamineAgonistIngredients, parkinsonOralDopamineAgonistMedications } from './parkinson-oral-dopamine-agonists';
import { parkinsonMaobAdjunctIngredients, parkinsonMaobAdjunctMedications } from './parkinson-maob-adjuncts';
import { parkinsonComtIngredients, parkinsonComtMedications } from './parkinson-comt';
import { parkinsonAmantadineIngredients, parkinsonAmantadineMedications } from './parkinson-amantadine';
import { antiepilepticLevetiracetamIngredients, antiepilepticLevetiracetamMedications } from './antiepileptic-levetiracetam';
import { antiepilepticLacosamideIngredients, antiepilepticLacosamideMedications } from './antiepileptic-lacosamide';
import { antiepilepticTopiramateMedications } from './antiepileptic-topiramate';
import { antiepilepticZonisamideIngredients, antiepilepticZonisamideMedications } from './antiepileptic-zonisamide';
import { antiepilepticOxcarbazepineIngredients, antiepilepticOxcarbazepineMedications } from './antiepileptic-oxcarbazepine';
import { antiepilepticCarbamazepineIngredients, antiepilepticCarbamazepineMedications } from './antiepileptic-carbamazepine';
import { antiepilepticPhenytoinIngredients, antiepilepticPhenytoinMedications } from './antiepileptic-phenytoin';
import { antiepilepticPhenobarbitalIngredients, antiepilepticPhenobarbitalMedications } from './antiepileptic-phenobarbital';
import { antiepilepticValproateIngredients, antiepilepticValproateMedications } from './antiepileptic-valproate';
import { gabapentinoidIngredients, gabapentinoidMedications } from './gabapentinoids';
import { pulmonaryRescueIngredients, pulmonaryRescueMedications } from './pulmonary-rescue';
import { pulmonaryControllerCombinationIngredients, pulmonaryControllerCombinationMedications } from './pulmonary-controller-combinations';
import { pulmonaryMethylxanthineIngredients, pulmonaryMethylxanthineMedications } from './pulmonary-methylxanthines';
import { pulmonaryHypertensionProstacyclinIngredients, pulmonaryHypertensionProstacyclinMedications } from './pulmonary-hypertension-prostacyclins';
import { pulmonaryHypertensionVasodilatorIngredients, pulmonaryHypertensionVasodilatorMedications } from './pulmonary-hypertension-vasodilators';

export interface UiModifierDefinition {
  id: string;
  label: string;
  description?: string;
  inputType: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
  unit?: string;
}

export type ClinicalContentState =
  | 'NO_ACTIVE_CLINICAL_RULES'
  | 'ACTIVE_RULES_AVAILABLE'
  | 'SHADOW_REVIEW_RULES';

// Validate identity integrity at assembly rather than allowing a broken catalog into the API.
export const terminologyDataset: TerminologyDataset = assertTerminologyDataset({
  version: 'periprocedural-lithium-review-1',
  generatedAt: '2026-10-03T18:55:00Z',
  ingredients: [
    { id: 'ING-apixaban', canonicalName: 'Apixaban', aliases: ['eliquis'] },
    { id: 'ING-warfarin', canonicalName: 'Warfarin', aliases: ['coumadin', 'jantoven'] },
    { id: 'ING-clopidogrel', canonicalName: 'Clopidogrel', aliases: ['plavix'] },
    { id: 'ING-aspirin', canonicalName: 'Aspirin', aliases: ['ASA', 'acetylsalicylic acid'] },
    ...antithromboticIngredients,
    ...diabetesCoreIngredients,
    ...batch03IncretinIngredients,
    ...batch03FixedCombinationIngredients,
    ...batch03Sglt2CombinationIngredients,
    ...batch04AceIngredients,
    ...batch04ArbArniIngredients,
    ...batch04BetaBlockerIngredients,
    ...batch04DhpCcbIngredients,
    ...batch04NonDhpCcbIngredients,
    ...batch04ThiazideDiureticIngredients,
    ...batch04LoopDiureticIngredients,
    ...batch04PotassiumSparingIngredients,
    ...batch04OtherAntihypertensiveIngredients,
    ...batch05ClassIIIAntiarrhythmicIngredients,
    ...batch05ClassIAntiarrhythmicIngredients,
    ...batch05OtherCardiacIngredients,
    ...periproceduralBuprenorphineIngredients,
    ...periproceduralMethadoneNaltrexoneIngredients,
    ...periproceduralStimulantIngredients,
    ...periproceduralMaoiIngredients,
    ...periproceduralLithiumIngredients,
    ...systemicCorticosteroidIngredients,
    ...tacrolimusIngredients,
    ...cyclosporineIngredients,
    ...mtorInhibitorIngredients,
    ...mycophenolateIngredients,
    ...azathioprineIngredients,
    ...weightManagementIngredients,
    ...parkinsonCoreIngredients,
    ...parkinsonOralDopamineAgonistIngredients,
    ...parkinsonMaobAdjunctIngredients,
    ...parkinsonComtIngredients,
    ...parkinsonAmantadineIngredients,
    ...antiepilepticLevetiracetamIngredients,
    ...antiepilepticLacosamideIngredients,
    ...antiepilepticZonisamideIngredients,
    ...antiepilepticOxcarbazepineIngredients,
    ...antiepilepticCarbamazepineIngredients,
    ...antiepilepticPhenytoinIngredients,
    ...antiepilepticPhenobarbitalIngredients,
    ...antiepilepticValproateIngredients,
    ...gabapentinoidIngredients,
    ...pulmonaryRescueIngredients,
    ...pulmonaryControllerCombinationIngredients,
    ...pulmonaryMethylxanthineIngredients,
    ...pulmonaryHypertensionProstacyclinIngredients,
    ...pulmonaryHypertensionVasodilatorIngredients,
    { id: 'ING-empagliflozin', canonicalName: 'Empagliflozin' },
    { id: 'ING-semaglutide', canonicalName: 'Semaglutide' },
    { id: 'ING-insulin-glargine', canonicalName: 'Insulin glargine' },
    { id: 'ING-lisinopril', canonicalName: 'Lisinopril' },
    { id: 'ING-metoprolol', canonicalName: 'Metoprolol' },
    { id: 'ING-atorvastatin', canonicalName: 'Atorvastatin' },
  ],
  medications: [
    {
      id: 'MED-apixaban',
      canonicalName: 'Apixaban',
      genericName: 'apixaban',
      brandNames: ['Eliquis'],
      aliases: ['factor Xa inhibitor', 'blood thinner'],
      ingredientIds: ['ING-apixaban'],
      drugClassIds: ['CLS-doac-factor-xa'],
    },
    {
      id: 'MED-warfarin',
      canonicalName: 'Warfarin',
      genericName: 'warfarin',
      brandNames: ['Coumadin', 'Jantoven'],
      aliases: ['vitamin K antagonist', 'VKA', 'blood thinner'],
      ingredientIds: ['ING-warfarin'],
      drugClassIds: ['CLS-vitamin-k-antagonist'],
    },
    {
      id: 'MED-clopidogrel',
      canonicalName: 'Clopidogrel',
      genericName: 'clopidogrel',
      brandNames: ['Plavix'],
      aliases: ['P2Y12 inhibitor', 'antiplatelet'],
      ingredientIds: ['ING-clopidogrel'],
      drugClassIds: ['CLS-p2y12-inhibitor'],
    },
    {
      id: 'MED-aspirin',
      canonicalName: 'Aspirin',
      genericName: 'aspirin',
      aliases: ['ASA', 'acetylsalicylic acid', 'antiplatelet'],
      ingredientIds: ['ING-aspirin'],
      drugClassIds: ['CLS-antiplatelet'],
    },
    ...antithromboticMedications,
    ...diabetesSearchMedications,
    { id: 'MED-empagliflozin', canonicalName: 'Empagliflozin', ingredientIds: ['ING-empagliflozin'], drugClassIds: ['CLS-sglt2-inhibitor'] },
    ...batch03SemaglutideSearchMedications,
    ...batch03IncretinSearchMedications,
    ...batch03FixedCombinationMedications,
    ...batch03Sglt2CombinationMedications,
    ...batch04AceMedications,
    ...batch04ArbArniMedications,
    ...batch04BetaBlockerMedications,
    ...batch04DhpCcbMedications,
    ...batch04NonDhpCcbMedications,
    ...batch04ThiazideDiureticMedications,
    ...batch04LoopDiureticMedications,
    ...batch04PotassiumSparingMedications,
    ...batch04OtherAntihypertensiveMedications,
    ...batch05ClassIIIAntiarrhythmicMedications,
    ...batch05ClassIAntiarrhythmicMedications,
    ...batch05OtherCardiacMedications,
    ...periproceduralBuprenorphineMedications,
    ...periproceduralMethadoneNaltrexoneMedications,
    ...periproceduralStimulantMedications,
    ...periproceduralMaoiMedications,
    ...periproceduralLithiumMedications,
    ...systemicCorticosteroidMedications,
    ...tacrolimusMedications,
    ...cyclosporineMedications,
    ...mtorInhibitorMedications,
    ...mycophenolateMedications,
    ...azathioprineMedications,
    ...weightManagementMedications,
    ...parkinsonCoreMedications,
    ...parkinsonOralDopamineAgonistMedications,
    ...parkinsonMaobAdjunctMedications,
    ...parkinsonComtMedications,
    ...parkinsonAmantadineMedications,
    ...antiepilepticLevetiracetamMedications,
    ...antiepilepticLacosamideMedications,
    ...antiepilepticTopiramateMedications,
    ...antiepilepticZonisamideMedications,
    ...antiepilepticOxcarbazepineMedications,
    ...antiepilepticCarbamazepineMedications,
    ...antiepilepticPhenytoinMedications,
    ...antiepilepticPhenobarbitalMedications,
    ...antiepilepticValproateMedications,
    ...gabapentinoidMedications,
    ...pulmonaryRescueMedications,
    ...pulmonaryControllerCombinationMedications,
    ...pulmonaryMethylxanthineMedications,
    ...pulmonaryHypertensionProstacyclinMedications,
    ...pulmonaryHypertensionVasodilatorMedications,
    { id: 'MED-lisinopril', canonicalName: 'Lisinopril', genericName: 'lisinopril', ingredientIds: ['ING-lisinopril'], drugClassIds: ['CLS-ace-inhibitor'] },
    { id: 'MED-atorvastatin', canonicalName: 'Atorvastatin', ingredientIds: ['ING-atorvastatin'], drugClassIds: ['CLS-statin'] },
  ],
});

// Production remains fail-closed until accountable clinical governance promotes content to ACTIVE.
export const activeRules: ClinicalRule[] = [];
export const activePolicies: PolicyOverlay[] = [];

// Replace superseded first-release glargine, lisinopril, and formulation-unspecified metoprolol candidates only in the assembled shadow release.
// Their historical source records remain unchanged; current batch review guards become the shadow behavior.
export const clinicalReviewRules: ClinicalRule[] = [
  ...firstReleaseCandidateRules.filter(
    (rule) =>
      !rule.scope.medicationIds?.includes('MED-insulin-glargine') &&
      !rule.scope.medicationIds?.includes('MED-lisinopril') &&
      !rule.scope.medicationIds?.includes('MED-metoprolol'),
  ),
  ...antithromboticCandidateRules,
  ...diabetesWorkflowRules,
  ...batch03ReviewRules,
  ...batch04AceReviewRules,
  ...batch04ArbArniReviewRules,
  ...batch04BetaBlockerReviewRules,
  ...batch04DhpCcbReviewRules,
  ...batch04NonDhpCcbReviewRules,
  ...batch04ThiazideDiureticReviewRules,
  ...batch04LoopDiureticReviewRules,
  ...batch04PotassiumSparingReviewRules,
  ...batch04OtherAntihypertensiveReviewRules,
  ...batch05ClassIIIAntiarrhythmicReviewRules,
  ...batch05ClassIAntiarrhythmicReviewRules,
  ...batch05OtherCardiacReviewRules,
  ...periproceduralBuprenorphineReviewRules,
  ...periproceduralMethadoneNaltrexoneReviewRules,
  ...periproceduralStimulantReviewRules,
  ...periproceduralMaoiReviewRules,
  ...periproceduralLithiumReviewRules,
  ...systemicCorticosteroidReviewRules,
  ...tacrolimusReviewRules,
  ...cyclosporineReviewRules,
  ...mtorInhibitorReviewRules,
  ...mycophenolateReviewRules,
  ...azathioprineReviewRules,
  ...weightManagementReviewRules,
  ...parkinsonCoreReviewRules,
  ...parkinsonOralDopamineAgonistReviewRules,
  ...parkinsonMaobAdjunctReviewRules,
  ...parkinsonComtReviewRules,
  ...parkinsonAmantadineReviewRules,
  ...antiepilepticLevetiracetamReviewRules,
  ...antiepilepticLacosamideReviewRules,
  ...antiepilepticTopiramateReviewRules,
  ...antiepilepticZonisamideReviewRules,
  ...antiepilepticOxcarbazepineReviewRules,
  ...antiepilepticCarbamazepineReviewRules,
  ...antiepilepticPhenytoinReviewRules,
  ...antiepilepticPhenobarbitalReviewRules,
  ...antiepilepticValproateReviewRules,
  ...gabapentinoidReviewRules,
  ...pulmonaryRescueReviewRules,
  ...pulmonaryControllerCombinationReviewRules,
  ...pulmonaryMethylxanthineReviewRules,
  ...pulmonaryHypertensionProstacyclinReviewRules,
  ...pulmonaryHypertensionVasodilatorReviewRules,
];
export const clinicalReviewEvidenceBundles = [
  firstClinicalContentEvidence,
  antithromboticEvidence,
  diabetesCoreEvidence,
  batch03SemaglutideIdentityEvidence,
  batch03IncretinIdentityEvidence,
  batch03FixedCombinationIdentityEvidence,
  batch03Sglt2CombinationIdentityEvidence,
  batch04AceIdentityEvidence,
  batch04ArbArniIdentityEvidence,
  batch04BetaBlockerIdentityEvidence,
  batch04DhpCcbIdentityEvidence,
  batch04NonDhpCcbIdentityEvidence,
  batch04ThiazideDiureticIdentityEvidence,
  batch04LoopDiureticIdentityEvidence,
  batch04PotassiumSparingIdentityEvidence,
  batch04OtherAntihypertensiveIdentityEvidence,
  batch05ClassIIIAntiarrhythmicIdentityEvidence,
  batch05ClassIAntiarrhythmicIdentityEvidence,
  batch05OtherCardiacIdentityEvidence,
  periproceduralBuprenorphineIdentityEvidence,
  periproceduralMethadoneNaltrexoneIdentityEvidence,
  periproceduralStimulantIdentityEvidence,
  periproceduralMaoiIdentityEvidence,
  systemicCorticosteroidIdentityEvidence,
  tacrolimusIdentityEvidence,
  cyclosporineIdentityEvidence,
  mtorInhibitorIdentityEvidence,
  mycophenolateIdentityEvidence,
  azathioprineIdentityEvidence,
  weightManagementIdentityEvidence,
  parkinsonCoreIdentityEvidence,
  parkinsonOralDopamineAgonistIdentityEvidence,
  parkinsonMaobAdjunctIdentityEvidence,
  parkinsonComtIdentityEvidence,
  parkinsonAmantadineIdentityEvidence,
  antiepilepticLevetiracetamIdentityEvidence,
  antiepilepticLacosamideIdentityEvidence,
  antiepilepticTopiramateIdentityEvidence,
  antiepilepticZonisamideIdentityEvidence,
  antiepilepticOxcarbazepineIdentityEvidence,
  antiepilepticCarbamazepineIdentityEvidence,
  antiepilepticPhenytoinIdentityEvidence,
  antiepilepticPhenobarbitalIdentityEvidence,
  antiepilepticValproateIdentityEvidence,
  gabapentinoidIdentityEvidence,
  pulmonaryRescueIdentityEvidence,
  pulmonaryControllerCombinationIdentityEvidence,
  pulmonaryMethylxanthineIdentityEvidence,
  pulmonaryHypertensionProstacyclinIdentityEvidence,
  pulmonaryHypertensionVasodilatorIdentityEvidence,
] as const;
export const clinicalReviewReleaseMetadata = [firstReleaseMetadata, antithromboticReleaseMetadata, diabetesCoreReleaseMetadata, diabetesWorkflowMetadata] as const;

export function isShadowContentMode(): boolean {
  return process.env.PREP_MEDS_CONTENT_MODE === 'shadow';
}

export function decisionRules(): ClinicalRule[] {
  return isShadowContentMode() ? clinicalReviewRules : activeRules;
}

export function clinicalContentState(): ClinicalContentState {
  if (isShadowContentMode()) return 'SHADOW_REVIEW_RULES';
  return activeRules.length === 0 ? 'NO_ACTIVE_CLINICAL_RULES' : 'ACTIVE_RULES_AVAILABLE';
}

export const modifierDefinitions: Record<string, UiModifierDefinition> = {
  ...diabetesModifierDefinitions,
  'MOD-indication': {
    id: 'MOD-indication',
    label: 'Medication indication',
    description: 'Why the patient takes this medication.',
    inputType: 'text',
  },
  'MOD-anticoagulation-indication': {
    id: 'MOD-anticoagulation-indication',
    label: 'Anticoagulation indication',
    description: 'Primary reason for chronic anticoagulation.',
    inputType: 'select',
    options: [
      { value: 'ATRIAL_FIBRILLATION', label: 'Atrial fibrillation/flutter' },
      { value: 'VTE', label: 'Venous thromboembolism (DVT/PE)' },
      { value: 'MECHANICAL_HEART_VALVE', label: 'Mechanical heart valve' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
  'MOD-antiplatelet-indication': {
    id: 'MOD-antiplatelet-indication',
    label: 'Antiplatelet indication',
    description: 'Primary reason for P2Y12 or other antiplatelet therapy.',
    inputType: 'select',
    options: [
      { value: 'CORONARY_STENT_OR_ACS', label: 'Coronary stent / acute coronary syndrome' },
      { value: 'PRIOR_MI_OR_CAD', label: 'Prior MI / coronary artery disease' },
      { value: 'CEREBROVASCULAR', label: 'Stroke / TIA / cerebrovascular disease' },
      { value: 'PAD', label: 'Peripheral arterial disease' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
  'MOD-recent-thrombotic-event': {
    id: 'MOD-recent-thrombotic-event',
    label: 'Recent thrombotic event',
    description: 'Recent VTE, stroke, TIA, systemic embolism, or other event that may increase interruption risk.',
    inputType: 'boolean',
  },
  'MOD-concomitant-antithrombotic': {
    id: 'MOD-concomitant-antithrombotic',
    label: 'Other anticoagulant or antiplatelet medication',
    description: 'Is the patient taking another medication that affects thrombosis/hemostasis, such as aspirin, a P2Y12 inhibitor, or another anticoagulant?',
    inputType: 'boolean',
  },
  'MOD-mechanical-heart-valve': {
    id: 'MOD-mechanical-heart-valve',
    label: 'Mechanical heart valve',
    description: 'Confirm whether the patient has a mechanical prosthetic heart valve.',
    inputType: 'boolean',
  },
  'MOD-anticoagulant-intent': {
    id: 'MOD-anticoagulant-intent',
    label: 'Anticoagulant treatment intent',
    description: 'Clarify whether injectable anticoagulant use is therapeutic treatment, prophylaxis, or bridging.',
    inputType: 'select',
    options: [
      { value: 'THERAPEUTIC', label: 'Therapeutic anticoagulation' },
      { value: 'PROPHYLAXIS', label: 'VTE prophylaxis' },
      { value: 'BRIDGING', label: 'Periprocedural bridging' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
  'MOD-verified-crcl-band': {
    id: 'MOD-verified-crcl-band',
    label: 'Verified creatinine-clearance band',
    description: 'Use a validated calculator/verified clinical value; do not infer CrCl from serum creatinine alone.',
    inputType: 'select',
    options: [
      { value: 'GE_50', label: 'CrCl ≥50 mL/min' },
      { value: 'LT_50', label: 'CrCl <50 mL/min' },
    ],
  },
  'MOD-diabetes-type': {
    id: 'MOD-diabetes-type',
    label: 'Diabetes type',
    inputType: 'select',
    options: [
      { value: 'TYPE_1', label: 'Type 1' },
      { value: 'TYPE_2', label: 'Type 2' },
      { value: 'OTHER', label: 'Other / unclear' },
    ],
  },
  'MOD-significant-gi-symptoms': {
    id: 'MOD-significant-gi-symptoms',
    label: 'Significant GI symptoms',
    description: 'Current severe nausea, vomiting, abdominal symptoms, or inability to tolerate oral intake.',
    inputType: 'boolean',
  },
  'MOD-serum-creatinine': {
    id: 'MOD-serum-creatinine',
    label: 'Serum creatinine',
    inputType: 'number',
    unit: 'mg/dL',
  },
  'MOD-stable-chronic-use': {
    id: 'MOD-stable-chronic-use',
    label: 'Stable chronic therapy',
    description: 'Confirm this is an established maintenance medication rather than a new or acutely changed regimen.',
    inputType: 'boolean',
  },
  'MOD-aspirin-indication': {
    id: 'MOD-aspirin-indication',
    label: 'Aspirin indication',
    inputType: 'select',
    options: [
      { value: 'SECONDARY_CV_PREVENTION', label: 'Secondary cardiovascular prevention' },
      { value: 'PRIMARY_PREVENTION', label: 'Primary prevention' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
  'MOD-dual-antiplatelet-therapy': {
    id: 'MOD-dual-antiplatelet-therapy',
    label: 'Dual antiplatelet therapy',
    description: 'Is the patient also taking another antiplatelet agent as part of DAPT?',
    inputType: 'boolean',
  },
  'MOD-recent-coronary-stent-or-acs': {
    id: 'MOD-recent-coronary-stent-or-acs',
    label: 'Recent coronary stent or acute coronary syndrome',
    inputType: 'boolean',
  },
  'MOD-glp1-escalation-phase': {
    id: 'MOD-glp1-escalation-phase',
    label: 'GLP-1 dose-escalation phase',
    description: 'Is the patient early in treatment or actively increasing the dose?',
    inputType: 'boolean',
  },
  'MOD-known-delayed-gastric-emptying': {
    id: 'MOD-known-delayed-gastric-emptying',
    label: 'Other delayed-gastric-emptying risk',
    description: 'Known gastroparesis, bowel dysmotility, Parkinson disease, or another condition likely to delay gastric emptying.',
    inputType: 'boolean',
  },
  'MOD-glp1-high-dose': {
    id: 'MOD-glp1-high-dose',
    label: 'Higher-dose GLP-1 regimen',
    description: 'Is the patient on a higher maintenance dose associated with greater GI adverse-effect risk?',
    inputType: 'boolean',
  },
  'MOD-raas-indication': {
    id: 'MOD-raas-indication',
    label: 'RAAS inhibitor indication',
    description: 'Clarify whether the RAAS inhibitor is used for hypertension, HFrEF, or another/unclear indication before local anesthesia policy is applied.',
    inputType: 'select',
    options: [
      { value: 'HYPERTENSION', label: 'Hypertension' },
      { value: 'HFrEF', label: 'Heart failure with reduced ejection fraction' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
};
