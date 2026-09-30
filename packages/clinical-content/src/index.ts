import { batch03ReviewRules as baseBatch03ReviewRules } from './rules.js';
import { batch03IncretinIdentityEvidence as baseBatch03IncretinIdentityEvidence } from './batch03-incretin-identity-evidence.js';
import {
  batch03HistoricalIncretinIdentityEvidence,
  batch03HistoricalIncretinReviewRules,
} from './batch03-historical-incretin-identity-evidence.js';
import {
  batch03CurrentIncretinExpansionEvidence,
  batch03CurrentIncretinExpansionReviewRules,
} from './batch03-current-incretin-expansion-evidence.js';
import { batch03Sglt2CombinationIdentityEvidence as baseBatch03Sglt2CombinationIdentityEvidence } from './batch03-sglt2-combination-identity-evidence.js';
import { batch03QternIdentityEvidence, batch03QternReviewRules } from './batch03-qtern-identity-evidence.js';

export { firstClinicalContentEvidence } from './evidence.js';
export { firstReleaseCandidateRules } from './rules.js';
export const batch03ReviewRules = [
  ...baseBatch03ReviewRules,
  ...batch03QternReviewRules,
  ...batch03HistoricalIncretinReviewRules,
  ...batch03CurrentIncretinExpansionReviewRules,
];
export {
  antithromboticCandidateRules as antithromboticBaseCandidateRules,
  antithromboticEvidence,
  antithromboticReleaseMetadata,
} from './antithrombotics.js';
export {
  antithromboticShadowRules,
  antithromboticShadowRules as antithromboticCandidateRules,
} from './antithrombotic-shadow.js';
export {
  diabetesCoreCandidateRules as diabetesCoreBaseCandidateRules,
  diabetesCoreEvidence as diabetesCoreBaseEvidence,
  diabetesCoreReleaseMetadata,
} from './diabetes-core.js';
export {
  diabetesCoreShadowRules,
  diabetesCoreShadowRules as diabetesCoreCandidateRules,
} from './diabetes-core-shadow.js';
export { diabetesWorkflowRules, diabetesWorkflowMetadata } from './diabetes-workflow.js';
export {
  diabetesAuditedEvidence,
  diabetesScopedEvidenceAudit as diabetesEvidenceAuditStatus,
} from './diabetes-evidence-audit.js';
export {
  diabetesFormulationSources,
  diabetesFormulationAtoms,
} from './diabetes-formulation-evidence.js';
export {
  diabetesInsulinProductEvidence,
  diabetesInsulinProductSources,
  diabetesInsulinProductAtoms,
  diabetesInsulinProductDefinitions,
} from './diabetes-insulin-product-evidence.js';
export type { InsulinProductDefinition } from './diabetes-insulin-product-evidence.js';
export {
  diabetesHumanInsulinEvidence,
  humanInsulinProductDefinitions,
  humanInsulinSources,
  humanInsulinAtoms,
} from './diabetes-human-insulin-evidence.js';
export type { HumanInsulinProductDefinition } from './diabetes-human-insulin-evidence.js';
export {
  diabetesAfrezzaEvidence,
  afrezzaLabelReference,
  afrezzaProductDefinitions,
  afrezzaSources,
  afrezzaAtoms,
} from './diabetes-afrezza-evidence.js';
export type { AfrezzaProductDefinition } from './diabetes-afrezza-evidence.js';
export {
  diabetesApidraEvidence,
  apidraLabelReference,
  apidraProductDefinitions,
  apidraSources,
  apidraAtoms,
} from './diabetes-apidra-evidence.js';
export type { ApidraProductDefinition } from './diabetes-apidra-evidence.js';
export {
  diabetesLevemirEvidence,
  levemirLabelReference,
  levemirMarketingStatusReference,
  levemirProductDefinitions,
  levemirSources,
  levemirAtoms,
} from './diabetes-levemir-evidence.js';
export type { LevemirProductDefinition } from './diabetes-levemir-evidence.js';
export {
  diabetesNovoLogEvidence,
  novologLabelReference,
  novologMarketingStatusReference,
  novologProductDefinitions,
  novologPresentationMarketingStatuses,
  novologSources,
  novologAtoms,
} from './diabetes-novolog-evidence.js';
export type { NovoLogProductDefinition, NovoLogPresentationMarketingStatus } from './diabetes-novolog-evidence.js';
export {
  diabetesHumalogEvidence as diabetesWorkflowEvidence,
  diabetesHumalogEvidence,
  humalogLabelReference,
  humalogU100MarketingStatusReference,
  humalogU200MarketingStatusReference,
  humalogProductDefinitions,
  humalogPresentationMarketingStatuses,
  humalogSources,
  humalogAtoms,
} from './diabetes-humalog-evidence.js';
export type { HumalogProductDefinition, HumalogPresentationMarketingStatus } from './diabetes-humalog-evidence.js';
export {
  diabetesOralReleaseEvidence as diabetesCoreEvidence,
  diabetesOralReleaseEvidence,
  metforminImmediateReleaseReference,
  metforminExtendedReleaseReference,
  glipizideImmediateReleaseReference,
  glipizideExtendedReleaseReference,
  glucotrolXlReference,
  oralReleaseProductDefinitions,
  oralReleaseSources,
  oralReleaseAtoms,
} from './diabetes-oral-release-evidence.js';
export type { OralReleaseProductDefinition } from './diabetes-oral-release-evidence.js';
export {
  batch03Sglt2IdentityEvidence,
  batch03Sglt2IdentityDefinitions,
  batch03Sglt2IdentitySources,
  batch03Sglt2IdentityAtoms,
} from './batch03-sglt2-identity-evidence.js';
export type { Batch03Sglt2IdentityDefinition } from './batch03-sglt2-identity-evidence.js';
export {
  batch03SemaglutideIdentityEvidence,
  batch03SemaglutideIdentityDefinitions,
  batch03SemaglutideIdentitySources,
  batch03SemaglutideIdentityAtoms,
} from './batch03-semaglutide-identity-evidence.js';
export type { Batch03SemaglutideIdentityDefinition } from './batch03-semaglutide-identity-evidence.js';
export {
  batch03IncretinIdentityDefinitions,
  batch03IncretinIdentitySources,
  batch03IncretinIdentityAtoms,
  batch03TirzepatideProcedureReviewAtoms,
} from './batch03-incretin-identity-evidence.js';
export type { Batch03IncretinIdentityDefinition } from './batch03-incretin-identity-evidence.js';
export {
  batch03HistoricalIncretinIdentityDefinitions,
  batch03HistoricalIncretinIdentitySources,
  batch03HistoricalIncretinIdentityAtoms,
  batch03HistoricalIncretinMarketingStatusAtoms,
} from './batch03-historical-incretin-identity-evidence.js';
export { batch03HistoricalIncretinReviewRules };
export type { Batch03HistoricalIncretinIdentityDefinition } from './batch03-historical-incretin-identity-evidence.js';
export {
  batch03CurrentIncretinExpansionDefinitions,
  batch03CurrentIncretinExpansionSources,
  batch03CurrentIncretinExpansionIdentityAtoms,
  batch03CurrentIncretinExpansionProcedureReviewAtoms,
} from './batch03-current-incretin-expansion-evidence.js';
export { batch03CurrentIncretinExpansionReviewRules };
export type { Batch03CurrentIncretinExpansionDefinition } from './batch03-current-incretin-expansion-evidence.js';
export {
  batch03FixedCombinationIdentityEvidence,
  batch03FixedCombinationIdentityDefinitions,
  batch03FixedCombinationIdentitySources,
  batch03FixedCombinationIdentityAtoms,
  batch03FixedCombinationProcedureReviewAtoms,
} from './batch03-fixed-combination-identity-evidence.js';
export type { Batch03FixedCombinationIdentityDefinition } from './batch03-fixed-combination-identity-evidence.js';
export {
  batch03Sglt2CombinationIdentityDefinitions,
  batch03Sglt2CombinationIdentitySources,
  batch03Sglt2CombinationIdentityAtoms,
  batch03Sglt2CombinationProcedureReviewAtoms,
} from './batch03-sglt2-combination-identity-evidence.js';
export type { Batch03Sglt2CombinationIdentityDefinition } from './batch03-sglt2-combination-identity-evidence.js';
export { batch03QternIdentityEvidence, batch03QternReviewRules };
export {
  batch03QternIdentityDefinitions,
  batch03QternIdentitySources,
  batch03QternIdentityAtoms,
  batch03QternProcedureReviewAtoms,
} from './batch03-qtern-identity-evidence.js';
export type { Batch03QternIdentityDefinition } from './batch03-qtern-identity-evidence.js';
export {
  batch04AceIdentityEvidence,
  batch04AceIdentityDefinitions,
  batch04AceIdentitySources,
  batch04AceIdentityAtoms,
  batch04AceReviewRules,
} from './batch04-ace-inhibitor-evidence.js';
export type { Batch04AceIdentityDefinition } from './batch04-ace-inhibitor-evidence.js';
export {
  batch04ArbArniIdentityEvidence,
  batch04ArbArniIdentityDefinitions,
  batch04ArbArniIdentitySources,
  batch04ArbArniIdentityAtoms,
  batch04ArbArniReviewRules,
} from './batch04-arb-arni-evidence.js';
export type { Batch04ArbArniIdentityDefinition } from './batch04-arb-arni-evidence.js';
export {
  batch04BetaBlockerIdentityEvidence,
  batch04BetaBlockerIdentityDefinitions,
  batch04BetaBlockerIdentitySources,
  batch04BetaBlockerIdentityAtoms,
  batch04BetaBlockerReviewRules,
} from './batch04-beta-blocker-evidence.js';
export type { Batch04BetaBlockerIdentityDefinition } from './batch04-beta-blocker-evidence.js';
export {
  batch04DhpCcbIdentityEvidence,
  batch04DhpCcbIdentityDefinitions,
  batch04DhpCcbIdentitySources,
  batch04DhpCcbIdentityAtoms,
  batch04DhpCcbReviewRules,
} from './batch04-dhp-ccb-evidence.js';
export type { Batch04DhpCcbIdentityDefinition } from './batch04-dhp-ccb-evidence.js';
export {
  batch04NonDhpCcbIdentityEvidence,
  batch04NonDhpCcbIdentityDefinitions,
  batch04NonDhpCcbIdentitySources,
  batch04NonDhpCcbIdentityAtoms,
  batch04NonDhpCcbMarketingStatusAtoms,
  batch04NonDhpCcbReviewRules,
} from './batch04-nondhp-ccb-evidence.js';
export type { Batch04NonDhpCcbIdentityDefinition } from './batch04-nondhp-ccb-evidence.js';
export {
  batch04ThiazideDiureticIdentityEvidence,
  batch04ThiazideDiureticIdentityDefinitions,
  batch04ThiazideDiureticIdentitySources,
  batch04ThiazideDiureticIdentityAtoms,
  batch04ThiazideDiureticReviewRules,
} from './batch04-thiazide-diuretic-evidence.js';
export type { Batch04ThiazideDiureticIdentityDefinition } from './batch04-thiazide-diuretic-evidence.js';
export {
  batch04LoopDiureticIdentityEvidence,
  batch04LoopDiureticIdentityDefinitions,
  batch04LoopDiureticIdentitySources,
  batch04LoopDiureticIdentityAtoms,
  batch04LoopDiureticMarketingStatusAtoms,
  batch04LoopDiureticReviewRules,
} from './batch04-loop-diuretic-evidence.js';
export type { Batch04LoopDiureticIdentityDefinition } from './batch04-loop-diuretic-evidence.js';
export {
  batch04PotassiumSparingIdentityEvidence,
  batch04PotassiumSparingIdentityDefinitions,
  batch04PotassiumSparingIdentitySources,
  batch04PotassiumSparingIdentityAtoms,
  batch04PotassiumSparingReviewRules,
} from './batch04-potassium-sparing-evidence.js';
export type { Batch04PotassiumSparingIdentityDefinition } from './batch04-potassium-sparing-evidence.js';
export {
  batch04OtherAntihypertensiveIdentityEvidence,
  batch04OtherAntihypertensiveIdentityDefinitions,
  batch04OtherAntihypertensiveIdentitySources,
  batch04OtherAntihypertensiveIdentityAtoms,
  batch04OtherAntihypertensiveReviewRules,
} from './batch04-other-antihypertensive-evidence.js';
export type { Batch04OtherAntihypertensiveIdentityDefinition } from './batch04-other-antihypertensive-evidence.js';

export {
  batch05ClassIIIAntiarrhythmicIdentityEvidence,
  batch05ClassIIIAntiarrhythmicIdentityDefinitions,
  batch05ClassIIIAntiarrhythmicIdentitySources,
  batch05ClassIIIAntiarrhythmicIdentityAtoms,
  batch05ClassIIIAntiarrhythmicReviewRules,
} from './batch05-class-iii-antiarrhythmic-evidence.js';
export type { Batch05ClassIIIAntiarrhythmicIdentityDefinition } from './batch05-class-iii-antiarrhythmic-evidence.js';

export {
  batch05ClassIAntiarrhythmicIdentityEvidence,
  batch05ClassIAntiarrhythmicIdentityDefinitions,
  batch05ClassIAntiarrhythmicIdentitySources,
  batch05ClassIAntiarrhythmicIdentityAtoms,
  batch05ClassIAntiarrhythmicReviewRules,
} from './batch05-class-i-antiarrhythmic-evidence.js';
export type { Batch05ClassIAntiarrhythmicIdentityDefinition } from './batch05-class-i-antiarrhythmic-evidence.js';

export const batch03IncretinIdentityEvidence = {
  ...baseBatch03IncretinIdentityEvidence,
  generatedAt: batch03CurrentIncretinExpansionEvidence.generatedAt,
  sources: [
    ...baseBatch03IncretinIdentityEvidence.sources,
    ...batch03HistoricalIncretinIdentityEvidence.sources,
    ...batch03CurrentIncretinExpansionEvidence.sources,
  ],
  atoms: [
    ...baseBatch03IncretinIdentityEvidence.atoms,
    ...batch03HistoricalIncretinIdentityEvidence.atoms,
    ...batch03CurrentIncretinExpansionEvidence.atoms,
  ],
};

export const batch03Sglt2CombinationIdentityEvidence = {
  ...baseBatch03Sglt2CombinationIdentityEvidence,
  generatedAt: batch03QternIdentityEvidence.generatedAt,
  sources: [...baseBatch03Sglt2CombinationIdentityEvidence.sources, ...batch03QternIdentityEvidence.sources],
  atoms: [...baseBatch03Sglt2CombinationIdentityEvidence.atoms, ...batch03QternIdentityEvidence.atoms],
};

export const firstReleaseMetadata = {
  releaseId: 'PREP-MEDS-CLINICAL-RC-001',
  version: 1,
  status: 'CLINICAL_REVIEW_REQUIRED' as const,
  intendedUse: 'SHADOW_VALIDATION_ONLY' as const,
  createdAt: '2026-09-17T01:00:00Z',
  medications: [
    'MED-apixaban',
    'MED-warfarin',
    'MED-clopidogrel',
    'MED-aspirin',
    'MED-empagliflozin',
    'MED-semaglutide',
    'MED-insulin-glargine',
    'MED-lisinopril',
    'MED-metoprolol',
    'MED-atorvastatin',
  ],
} as const;

export {
  batch05OtherCardiacIdentityEvidence,
  batch05OtherCardiacIdentityDefinitions,
  batch05OtherCardiacIdentitySources,
  batch05OtherCardiacIdentityAtoms,
  batch05OtherCardiacReviewRules,
} from './batch05-other-cardiac-evidence.js';
export type { Batch05OtherCardiacIdentityDefinition } from './batch05-other-cardiac-evidence.js';


export {
  periproceduralBuprenorphineIdentityEvidence,
  periproceduralBuprenorphineIdentityDefinitions,
  periproceduralBuprenorphineIdentitySources,
  periproceduralBuprenorphineIdentityAtoms,
  periproceduralBuprenorphineReviewRules,
} from './periprocedural-buprenorphine-evidence.js';
export type { PeriproceduralBuprenorphineIdentityDefinition } from './periprocedural-buprenorphine-evidence.js';


export {
  periproceduralMethadoneNaltrexoneIdentityEvidence,
  periproceduralMethadoneNaltrexoneIdentityDefinitions,
  periproceduralMethadoneNaltrexoneIdentitySources,
  periproceduralMethadoneNaltrexoneIdentityAtoms,
  periproceduralMethadoneNaltrexoneReviewRules,
} from './periprocedural-methadone-naltrexone-evidence.js';
export type { PeriproceduralMethadoneNaltrexoneIdentityDefinition } from './periprocedural-methadone-naltrexone-evidence.js';


export {
  periproceduralStimulantIdentityEvidence,
  periproceduralStimulantIdentityDefinitions,
  periproceduralStimulantIdentitySources,
  periproceduralStimulantIdentityAtoms,
  periproceduralStimulantReviewRules,
} from './periprocedural-stimulant-evidence.js';
export type { PeriproceduralStimulantIdentityDefinition } from './periprocedural-stimulant-evidence.js';


export {
  periproceduralMaoiIdentityEvidence,
  periproceduralMaoiIdentityDefinitions,
  periproceduralMaoiIdentitySources,
  periproceduralMaoiIdentityAtoms,
  periproceduralMaoiReviewRules,
} from './periprocedural-maoi-evidence.js';
export type { PeriproceduralMaoiIdentityDefinition } from './periprocedural-maoi-evidence.js';


export {
  systemicCorticosteroidIdentityEvidence,
  systemicCorticosteroidIdentityDefinitions,
  systemicCorticosteroidIdentitySources,
  systemicCorticosteroidIdentityAtoms,
  systemicCorticosteroidReviewRules,
} from './systemic-corticosteroid-evidence.js';
export type { SystemicCorticosteroidIdentityDefinition } from './systemic-corticosteroid-evidence.js';


export {
  tacrolimusIdentityEvidence,
  tacrolimusIdentityDefinitions,
  tacrolimusIdentitySources,
  tacrolimusIdentityAtoms,
  tacrolimusReviewRules,
} from './tacrolimus-evidence.js';
export type { TacrolimusIdentityDefinition } from './tacrolimus-evidence.js';


export {
  cyclosporineIdentityEvidence,
  cyclosporineIdentityDefinitions,
  cyclosporineIdentitySources,
  cyclosporineIdentityAtoms,
  cyclosporineReviewRules,
} from './cyclosporine-evidence.js';
export type { CyclosporineIdentityDefinition } from './cyclosporine-evidence.js';


export {
  mtorInhibitorIdentityEvidence,
  mtorInhibitorIdentityDefinitions,
  mtorInhibitorIdentitySources,
  mtorInhibitorIdentityAtoms,
  mtorInhibitorReviewRules,
} from './mtor-inhibitor-evidence.js';
export type { MtorInhibitorIdentityDefinition } from './mtor-inhibitor-evidence.js';


export {
  mycophenolateIdentityEvidence,
  mycophenolateIdentityDefinitions,
  mycophenolateIdentitySources,
  mycophenolateIdentityAtoms,
  mycophenolateReviewRules,
} from './mycophenolate-evidence.js';
export type { MycophenolateIdentityDefinition } from './mycophenolate-evidence.js';


export {
  azathioprineIdentityEvidence,
  azathioprineIdentityDefinitions,
  azathioprineIdentitySources,
  azathioprineIdentityAtoms,
  azathioprineReviewRules,
} from './azathioprine-evidence.js';
export type { AzathioprineIdentityDefinition } from './azathioprine-evidence.js';
