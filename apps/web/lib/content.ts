import type { ClinicalRule, PolicyOverlay } from '@prep-meds/clinical-engine';
import type { TerminologyDataset } from '@prep-meds/terminology';

export interface UiModifierDefinition {
  id: string;
  label: string;
  description?: string;
  inputType: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
  unit?: string;
}

// Stage 8 seeds searchable medication identity only. It does not encode treatment advice.
// These records mirror the Stage 6 research backlog and intentionally omit unverified external codes.
export const terminologyDataset: TerminologyDataset = {
  version: 'stage-08-seed-1',
  generatedAt: '2026-09-16T00:00:00Z',
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

// Clinical content remains empty until governed rules/policies are approved and activated.
export const activeRules: ClinicalRule[] = [];
export const activePolicies: PolicyOverlay[] = [];

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
    description: 'Current nausea, vomiting, severe bloating, or inability to tolerate oral intake.',
    inputType: 'boolean',
  },
  'MOD-serum-creatinine': {
    id: 'MOD-serum-creatinine',
    label: 'Serum creatinine',
    inputType: 'number',
    unit: 'mg/dL',
  },
};
