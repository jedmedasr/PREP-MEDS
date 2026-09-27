export { firstClinicalContentEvidence } from './evidence.js';
export { firstReleaseCandidateRules } from './rules.js';
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
