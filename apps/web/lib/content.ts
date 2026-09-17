import type { ClinicalRule, PolicyOverlay } from '@prep-meds/clinical-engine';
import { firstClinicalContentEvidence, firstReleaseCandidateRules, firstReleaseMetadata } from '@prep-meds/clinical-content';
import type { TerminologyDataset } from '@prep-meds/terminology';

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

export const terminologyDataset: TerminologyDataset = {
  version: 'stage-08.5-seed-1',
  generatedAt: '2026-09-17T01:00:00Z',
  ingredients: [
    { id: 'ING-apixaban', canonicalName: 'Apixaban' },
    { id: 'ING-warfarin', canonicalName: 'Warfarin' },
    { id: 'ING-clopidogrel', canonicalName: 'Clopidogrel' },
    { id: 'ING-aspirin', canonicalName: 'Aspirin' },
    { id: 'ING-empagliflozin', canonicalName: 'Empagliflozin' },
    { id: 'ING-semaglutide', canonicalName: 'Semaglutide' },
    { id: 'ING-insulin-glargine', canonicalName: 'Insulin glargine' },
    { id: 'ING-lisinopril', canonicalName: 'Lisinopril' },
    { id: 'ING-metoprolol', canonicalName: 'Metoprolol' },
    { id: 'ING-atorvastatin', canonicalName: 'Atorvastatin' },
  ],
  medications: [
    { id: 'MED-apixaban', canonicalName: 'Apixaban', ingredientIds: ['ING-apixaban'], drugClassIds: ['CLS-doac-factor-xa'] },
    { id: 'MED-warfarin', canonicalName: 'Warfarin', ingredientIds: ['ING-warfarin'], drugClassIds: ['CLS-vitamin-k-antagonist'] },
    { id: 'MED-clopidogrel', canonicalName: 'Clopidogrel', ingredientIds: ['ING-clopidogrel'], drugClassIds: ['CLS-p2y12-inhibitor'] },
    { id: 'MED-aspirin', canonicalName: 'Aspirin', ingredientIds: ['ING-aspirin'], drugClassIds: ['CLS-antiplatelet'] },
    { id: 'MED-empagliflozin', canonicalName: 'Empagliflozin', ingredientIds: ['ING-empagliflozin'], drugClassIds: ['CLS-sglt2-inhibitor'] },
    { id: 'MED-semaglutide', canonicalName: 'Semaglutide', ingredientIds: ['ING-semaglutide'], drugClassIds: ['CLS-glp1-receptor-agonist'] },
    { id: 'MED-insulin-glargine', canonicalName: 'Insulin glargine', ingredientIds: ['ING-insulin-glargine'], drugClassIds: ['CLS-basal-insulin'] },
    { id: 'MED-lisinopril', canonicalName: 'Lisinopril', ingredientIds: ['ING-lisinopril'], drugClassIds: ['CLS-ace-inhibitor'] },
    { id: 'MED-metoprolol', canonicalName: 'Metoprolol', ingredientIds: ['ING-metoprolol'], drugClassIds: ['CLS-beta-blocker'] },
    { id: 'MED-atorvastatin', canonicalName: 'Atorvastatin', ingredientIds: ['ING-atorvastatin'], drugClassIds: ['CLS-statin'] },
  ],
};

// Production remains fail-closed until accountable clinical governance promotes content to ACTIVE.
export const activeRules: ClinicalRule[] = [];
export const activePolicies: PolicyOverlay[] = [];

// These rules are available only when the server is explicitly configured for shadow validation.
export const clinicalReviewRules: ClinicalRule[] = firstReleaseCandidateRules;
export const clinicalReviewEvidence = firstClinicalContentEvidence;
export const clinicalReviewReleaseMetadata = firstReleaseMetadata;

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
  'MOD-indication': {
    id: 'MOD-indication',
    label: 'Medication indication',
    description: 'Why the patient takes this medication.',
    inputType: 'text',
  },
  'MOD-recent-thrombotic-event': {
    id: 'MOD-recent-thrombotic-event',
    label: 'Recent thrombotic event',
    description: 'Recent VTE, stroke, TIA, or other thrombotic event relevant to interruption risk.',
    inputType: 'boolean',
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
    label: 'ACE inhibitor indication',
    inputType: 'select',
    options: [
      { value: 'HYPERTENSION', label: 'Hypertension' },
      { value: 'HFrEF', label: 'Heart failure with reduced ejection fraction' },
      { value: 'OTHER_UNCLEAR', label: 'Other / unclear' },
    ],
  },
};
