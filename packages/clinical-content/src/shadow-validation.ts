import type { Disposition, ProcedureCode, VersionedRef } from '@prep-meds/clinical-engine';

export type ShadowReviewDomain =
  | 'ANTITHROMBOTICS'
  | 'DIABETES_GLP1'
  | 'CARDIOVASCULAR_HEMODYNAMIC'
  | 'NEURO_WITHDRAWAL'
  | 'OUD_PAIN'
  | 'STEROIDS_IMMUNOSUPPRESSION'
  | 'PULMONARY_AIRWAY'
  | 'OTC_HERBAL';

export type ShadowReviewRole =
  | 'GI'
  | 'ANESTHESIA'
  | 'PHARMACY'
  | 'CARDIOLOGY'
  | 'ENDOCRINOLOGY'
  | 'NEUROLOGY'
  | 'PAIN_OUD'
  | 'TRANSPLANT'
  | 'PRESCRIBER'
  | 'LOCAL_GOVERNANCE';

export interface ShadowReviewPacket {
  id: string;
  domain: ShadowReviewDomain;
  status: 'DRAFT_REVIEW_REQUIRED';
  reviewerRoles: readonly ShadowReviewRole[];
  evidenceProvenanceRequirements: readonly string[];
  unresolvedLocalPolicyQuestions: readonly string[];
  patientInstructionsEnabled: false;
}

export type ProcedureBleedingRisk = 'LOW' | 'HIGH' | 'UNKNOWN';

export interface SyntheticShadowCase {
  id: string;
  synthetic: true;
  containsPhi: false;
  procedureCode: ProcedureCode;
  procedureBleedingRisk: ProcedureBleedingRisk;
  domain: ShadowReviewDomain;
  medicationInputs: readonly string[];
  scenarioTags: readonly string[];
  unresolvedLocalPolicyQuestionIds: readonly string[];
  expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' | 'LOCAL_POLICY_REQUIRED';
}

export interface ShadowCandidatePathway {
  medicationId: string;
  candidateDisposition: Disposition;
  ruleRefs: readonly VersionedRef[];
  evidenceRefs: readonly VersionedRef[];
  missingModifierIds: readonly string[];
  reasonCodes: readonly string[];
}

export interface ShadowAuditOutput {
  schemaVersion: '1.0.0';
  auditMode: 'SHADOW_VALIDATION_ONLY';
  caseId: string;
  domain: ShadowReviewDomain;
  reviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' | 'LOCAL_POLICY_REQUIRED';
  candidatePathways: readonly ShadowCandidatePathway[];
  patientInstructions: null;
  approvals: {
    clinicalApprovalGranted: false;
    localPolicyApprovalGranted: false;
    productionActivationGranted: false;
  };
}

const sharedProvenance = [
  'Every candidate pathway must resolve each evidence reference to an assembled DRAFT evidence atom and source document.',
  'Product identity evidence must preserve route, dosage form, release, salt/prodrug, and whole-product boundaries.',
  'Guidance context must record the source organization, publication date, jurisdiction, and applicability limitations.',
  'Passing engineering tests must never be represented as clinical or local-policy approval.',
] as const;

export const shadowReviewPackets: readonly ShadowReviewPacket[] = [
  {
    id: 'SHADOW-PACKET-ANTITHROMBOTICS',
    domain: 'ANTITHROMBOTICS',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'CARDIOLOGY', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Assign local procedure bleeding-risk categories and escalation ownership.',
      'Approve renal-function inputs and review thresholds for anticoagulant pathways.',
      'Define accountable handling of recent ACS/stent, thrombotic events, mechanical valves, DAPT, and bridging questions.',
      'Approve restart ownership; no restart instruction is currently authorized.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-DIABETES-GLP1',
    domain: 'DIABETES_GLP1',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'ENDOCRINOLOGY', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve local insulin, glucose-monitoring, and hypoglycemia-rescue ownership.',
      'Approve SGLT2 escalation and ketone-risk workflow without inferring patient-specific timing.',
      'Approve GLP-1/GIP symptom, escalation-phase, gastric-emptying, and anesthesia risk workflow.',
      'Define when endocrinology or prescribing-clinician review is mandatory.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-CARDIOVASCULAR-HEMODYNAMIC',
    domain: 'CARDIOVASCULAR_HEMODYNAMIC',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'CARDIOLOGY', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve indication-sensitive RAAS and diuretic pathways.',
      'Define escalation for arrhythmia, QT, electrolyte, heart-failure, and hemodynamic instability contexts.',
      'Approve ownership for route/form substitutions; no conversion is currently authorized.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-NEURO-WITHDRAWAL',
    domain: 'NEURO_WITHDRAWAL',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'NEUROLOGY', 'PRESCRIBER', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Define escalation for seizure history, missed doses, inability to take the reconciled route/form, and withdrawal risk.',
      'Approve handling of serotonergic, adrenergic, QT, hemodynamic, and cumulative-sedation interactions.',
      'Approve prescriber and anesthesia ownership; no interruption, taper, conversion, or restart timing is authorized.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-OUD-PAIN',
    domain: 'OUD_PAIN',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'PAIN_OUD', 'PRESCRIBER', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve coordination ownership for buprenorphine, methadone, naltrexone, and anticipated peri-procedural analgesia.',
      'Define escalation for indication, formulation, recent administration, withdrawal, respiratory, and relapse risk.',
      'No autonomous dose, interruption, bridging, substitution, analgesia, or restart instruction is authorized.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-STEROIDS-IMMUNOSUPPRESSION',
    domain: 'STEROIDS_IMMUNOSUPPRESSION',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'TRANSPLANT', 'PRESCRIBER', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve adrenal-risk assessment and stress-dose ownership without inferring dose or duration.',
      'Define transplant-team escalation for organ, regimen, monitoring, interaction, infection, and oral-intake context.',
      'No missed-dose, substitution, route/form conversion, monitoring target, or restart instruction is authorized.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-PULMONARY-AIRWAY',
    domain: 'PULMONARY_AIRWAY',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'PRESCRIBER', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve airway-symptom and rescue-medication escalation workflow.',
      'Define device/form reconciliation and availability verification responsibilities.',
      'Define pulmonary-hypertension specialist escalation and uninterrupted-infusion safety ownership.',
    ],
    patientInstructionsEnabled: false,
  },
  {
    id: 'SHADOW-PACKET-OTC-HERBAL',
    domain: 'OTC_HERBAL',
    status: 'DRAFT_REVIEW_REQUIRED',
    reviewerRoles: ['GI', 'ANESTHESIA', 'PHARMACY', 'PRESCRIBER', 'LOCAL_GOVERNANCE'],
    evidenceProvenanceRequirements: sharedProvenance,
    unresolvedLocalPolicyQuestions: [
      'Approve handling of uncertain blend composition, purity, potency, dose, route, and last-use information.',
      'Define escalation for bleeding, sedation, hemodynamic, serotonergic, hepatic, glucose, and cannabinoid contexts.',
      'No generalized hold timing is authorized for a supplement or cannabinoid pathway.',
    ],
    patientInstructionsEnabled: false,
  },
];

export const syntheticShadowCases: readonly SyntheticShadowCase[] = [
  { id: 'SHADOW-CASE-EGD-ASPIRIN-RECENT-ACS', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'ANTITHROMBOTICS', medicationInputs: ['aspirin'], scenarioTags: ['RECENT_ACS', 'DAPT_STATUS_UNKNOWN'], unresolvedLocalPolicyQuestionIds: ['LOCAL-BLEED-RISK', 'LOCAL-RECENT-ACS'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-WARFARIN-MECHANICAL-VALVE', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'HIGH', domain: 'ANTITHROMBOTICS', medicationInputs: ['warfarin'], scenarioTags: ['MECHANICAL_VALVE', 'BRIDGING_NOT_INFERRED'], unresolvedLocalPolicyQuestionIds: ['LOCAL-BLEED-RISK', 'LOCAL-BRIDGING'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-DOAC-RENAL-MODIFIER', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'HIGH', domain: 'ANTITHROMBOTICS', medicationInputs: ['apixaban'], scenarioTags: ['VERIFIED_RENAL_FUNCTION_REQUIRED', 'RECENT_THROMBOTIC_EVENT_UNKNOWN'], unresolvedLocalPolicyQuestionIds: ['LOCAL-RENAL-WORKFLOW'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-CLOPIDOGREL-RECENT-STENT', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'HIGH', domain: 'ANTITHROMBOTICS', medicationInputs: ['clopidogrel'], scenarioTags: ['RECENT_STENT', 'DAPT'], unresolvedLocalPolicyQuestionIds: ['LOCAL-RECENT-STENT'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-TYPE1-BASAL-INSULIN', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'DIABETES_GLP1', medicationInputs: ['insulin glargine'], scenarioTags: ['TYPE_1_DIABETES', 'HYPOGLYCEMIA_PLAN_REQUIRED'], unresolvedLocalPolicyQuestionIds: ['LOCAL-INSULIN-WORKFLOW'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-SGLT2', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'DIABETES_GLP1', medicationInputs: ['empagliflozin'], scenarioTags: ['SGLT2', 'KETONE_RISK_CONTEXT_REQUIRED'], unresolvedLocalPolicyQuestionIds: ['LOCAL-SGLT2-WORKFLOW'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-GLP1-SYMPTOMATIC-ESCALATION', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'DIABETES_GLP1', medicationInputs: ['semaglutide injection'], scenarioTags: ['GLP1_ESCALATION', 'SIGNIFICANT_GI_SYMPTOMS', 'DELAYED_GASTRIC_EMPTYING_RISK'], unresolvedLocalPolicyQuestionIds: ['LOCAL-GLP1-ANESTHESIA'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-RAAS-HF-INDICATION', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'CARDIOVASCULAR_HEMODYNAMIC', medicationInputs: ['lisinopril'], scenarioTags: ['HFrEF_INDICATION', 'HEMODYNAMIC_REVIEW'], unresolvedLocalPolicyQuestionIds: ['LOCAL-RAAS-POLICY'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-ANTIARRHYTHMIC-QT', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'CARDIOVASCULAR_HEMODYNAMIC', medicationInputs: ['amiodarone oral tablet'], scenarioTags: ['QT_RISK', 'ELECTROLYTES_UNKNOWN'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-SEIZURE-WITHDRAWAL', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'NEURO_WITHDRAWAL', medicationInputs: ['levetiracetam oral solution'], scenarioTags: ['SEIZURE_WITHDRAWAL_RISK', 'ORAL_INTAKE_UNCERTAIN'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-ANTIEPILEPTIC-AMBIGUITY', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'NEURO_WITHDRAWAL', medicationInputs: ['valproate'], scenarioTags: ['FORM_ROUTE_RELEASE_AMBIGUOUS', 'FAIL_CLOSED'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-PSYCH-AMBIGUITY', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'NEURO_WITHDRAWAL', medicationInputs: ['bupropion'], scenarioTags: ['RELEASE_AMBIGUOUS', 'FAIL_CLOSED', 'WITHDRAWAL_INTERACTION_REVIEW'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-BUPRENORPHINE', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'OUD_PAIN', medicationInputs: ['buprenorphine sublingual tablet'], scenarioTags: ['OUD_INDICATION_NOT_INFERRED', 'ANALGESIA_PLAN_REQUIRED'], unresolvedLocalPolicyQuestionIds: ['LOCAL-OUD-ANALGESIA'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-NALTREXONE-LAI', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'HIGH', domain: 'OUD_PAIN', medicationInputs: ['VIVITROL'], scenarioTags: ['RECENT_ADMINISTRATION_REQUIRED', 'OPIOID_PLAN_REQUIRED'], unresolvedLocalPolicyQuestionIds: ['LOCAL-OUD-ANALGESIA'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-CHRONIC-STEROID', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'STEROIDS_IMMUNOSUPPRESSION', medicationInputs: ['prednisone tablet'], scenarioTags: ['CHRONIC_EXPOSURE_NOT_INFERRED', 'ADRENAL_RISK_REVIEW'], unresolvedLocalPolicyQuestionIds: ['LOCAL-STEROID-POLICY'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-TRANSPLANT-TACROLIMUS', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'STEROIDS_IMMUNOSUPPRESSION', medicationInputs: ['PROGRAF capsule'], scenarioTags: ['TRANSPLANT_TEAM_REVIEW', 'ORAL_INTAKE_UNCERTAIN', 'INTERACTIONS_UNKNOWN'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-AIRWAY-CONTROLLER', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'PULMONARY_AIRWAY', medicationInputs: ['TRELEGY ELLIPTA'], scenarioTags: ['DEVICE_IDENTITY', 'ACTIVE_AIRWAY_SYMPTOMS_UNKNOWN'], unresolvedLocalPolicyQuestionIds: ['LOCAL-AIRWAY-WORKFLOW'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COLONOSCOPY-PAH-INFUSION', synthetic: true, containsPhi: false, procedureCode: 'COLONOSCOPY', procedureBleedingRisk: 'LOW', domain: 'PULMONARY_AIRWAY', medicationInputs: ['REMODULIN infusion'], scenarioTags: ['PAH_SPECIALIST_REVIEW', 'INFUSION_CONTINUITY', 'DEVICE_DEPENDENCY'], unresolvedLocalPolicyQuestionIds: ['LOCAL-PAH-ESCALATION'], expectedReviewDisposition: 'LOCAL_POLICY_REQUIRED' },
  { id: 'SHADOW-CASE-COMBINED-GINKGO', synthetic: true, containsPhi: false, procedureCode: 'EGD_COLONOSCOPY', procedureBleedingRisk: 'HIGH', domain: 'OTC_HERBAL', medicationInputs: ['ginkgo'], scenarioTags: ['BLEEDING_CONTEXT', 'PRODUCT_COMPOSITION_UNKNOWN'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
  { id: 'SHADOW-CASE-EGD-CANNABIS-ROUTE-AMBIGUITY', synthetic: true, containsPhi: false, procedureCode: 'EGD', procedureBleedingRisk: 'LOW', domain: 'OTC_HERBAL', medicationInputs: ['cannabis'], scenarioTags: ['ROUTE_USE_PATTERN_AMBIGUOUS', 'FAIL_CLOSED', 'SEDATION_AIRWAY_REVIEW'], unresolvedLocalPolicyQuestionIds: [], expectedReviewDisposition: 'CLINICIAN_REVIEW_REQUIRED' },
];

export function buildShadowAudit(
  caseDefinition: SyntheticShadowCase,
  candidatePathways: readonly ShadowCandidatePathway[],
): ShadowAuditOutput {
  const reviewDisposition = caseDefinition.unresolvedLocalPolicyQuestionIds.length > 0
    ? 'LOCAL_POLICY_REQUIRED'
    : 'CLINICIAN_REVIEW_REQUIRED';

  return {
    schemaVersion: '1.0.0',
    auditMode: 'SHADOW_VALIDATION_ONLY',
    caseId: caseDefinition.id,
    domain: caseDefinition.domain,
    reviewDisposition,
    candidatePathways: candidatePathways.map((pathway) => ({
      ...pathway,
      ruleRefs: [...pathway.ruleRefs],
      evidenceRefs: [...pathway.evidenceRefs],
      missingModifierIds: [...pathway.missingModifierIds],
      reasonCodes: [...pathway.reasonCodes],
    })),
    patientInstructions: null,
    approvals: {
      clinicalApprovalGranted: false,
      localPolicyApprovalGranted: false,
      productionActivationGranted: false,
    },
  };
}
