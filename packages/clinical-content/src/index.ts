export { firstClinicalContentEvidence } from './evidence.js';
export { firstReleaseCandidateRules } from './rules.js';

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
