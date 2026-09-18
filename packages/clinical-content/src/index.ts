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
  diabetesAuditedEvidence as diabetesWorkflowEvidence,
  diabetesAuditedEvidence as diabetesCoreEvidence,
  diabetesScopedEvidenceAudit as diabetesEvidenceAuditStatus,
} from './diabetes-evidence-audit.js';

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
