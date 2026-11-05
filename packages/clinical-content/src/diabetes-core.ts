import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const generatedAt = '2026-09-17T03:00:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

const sources: SourceDocument[] = [
  {
    id: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    version: 1,
    sourceType: 'GUIDELINE',
    title: '16. Diabetes Care in the Hospital: Standards of Care in Diabetes—2026',
    publisher: 'American Diabetes Association',
    societyOrRegulator: 'ADA',
    publicationDate: '2025-12-08',
    externalIdentifier: 'doi:10.2337/dc26-S016',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-USMSTF-BOWEL-PREP-2025-B2',
    version: 1,
    sourceType: 'GUIDELINE',
    title: 'Optimizing Bowel Preparation Quality for Colonoscopy: Consensus Recommendations by the US Multi-Society Task Force on Colorectal Cancer',
    publisher: 'ACG/AGA/ASGE',
    societyOrRegulator: 'US Multi-Society Task Force on Colorectal Cancer',
    publicationDate: '2025-03-04',
    externalIdentifier: 'doi:10.14309/ajg.0000000000003287',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-METFORMIN-LABEL-2024-B2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Metformin hydrochloride extended-release tablets prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    publicationDate: '2024-07-03',
    externalIdentifier: 'DailyMed SETID a5980bc8-8de8-c456-e053-2a95a90a792e',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-GLIPIZIDE-LABEL-B2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Glipizide prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-REPAGLINIDE-LABEL-B2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Repaglinide prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-FDA-PRAMLINTIDE-LABEL-B2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'Pramlintide acetate injection prescribing information',
    publisher: 'U.S. Food and Drug Administration / DailyMed',
    societyOrRegulator: 'FDA',
    publicationDate: '2019-12-18',
    externalIdentifier: 'DailyMed SETID 4aea30ff-eb0d-45c1-b114-3127966328ff',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: generatedAt,
    lifecycle: 'DRAFT',
  },
];

function atom(args: {
  id: string;
  sourceId: string;
  claim: string;
  normalizedTopic: string;
  stance: EvidenceAtom['stance'];
  strength: EvidenceAtom['evidenceStrength'];
  applicability: EvidenceAtom['applicability'];
  title: string;
  summary: string;
  keywords: string[];
  concepts: string[];
  authority: number;
  limitations?: string[];
}): EvidenceAtom {
  return {
    id: args.id,
    version: 1,
    source: { id: args.sourceId, version: 1 },
    claim: args.claim,
    normalizedTopic: args.normalizedTopic,
    stance: args.stance,
    evidenceStrength: args.strength,
    applicability: args.applicability,
    locator: {},
    limitations: args.limitations ?? [],
    retrieval: {
      title: args.title,
      summary: args.summary,
      keywords: args.keywords,
      concepts: args.concepts,
      sourceAuthorityRank: args.authority,
    },
    lifecycle: 'DRAFT',
    createdAt: generatedAt,
  };
}

const atoms: EvidenceAtom[] = [
  atom({
    id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY',
    sourceId: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    claim: 'ADA 2026 states that metformin and other oral glucose-lowering agents should be held on the day of surgery or procedure.',
    normalizedTopic: 'oral-diabetes-medications-procedure-day',
    stance: 'SUPPORTS',
    strength: 'NOT_GRADED',
    applicability: { contextTags: ['diabetes', 'oral-glucose-lowering-agent'], procedureCodes: [...procedures] },
    title: 'Hold oral glucose-lowering agents on procedure day',
    summary: 'This supports a procedure-day rule; it does not by itself establish a universal day-before bowel-prep hold for every oral agent.',
    keywords: ['metformin', 'oral diabetes medication', 'procedure day'],
    concepts: ['procedure-day-hold', 'fasting'],
    authority: 100,
    limitations: ['Perioperative guidance is broader than outpatient GI endoscopy.', 'Prep-day handling may require a separate GI/diabetes protocol.'],
  }),
  atom({
    id: 'EVD-B2-ADA-T1D-BASAL-MUST-CONTINUE',
    sourceId: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    claim: 'For type 1 diabetes, basal insulin remains necessary even when the person is not eating; correction-only insulin is not an adequate substitute.',
    normalizedTopic: 'type1-basal-insulin-safety',
    stance: 'SUPPORTS',
    strength: 'HIGH',
    applicability: { drugClassIds: ['CLS-basal-insulin', 'CLS-insulin-pump-aid'], contextTags: ['type-1-diabetes', 'fasting'] },
    title: 'Type 1 diabetes requires basal insulin coverage',
    summary: 'PREP-MEDS must never translate fasting into an instruction to omit all basal insulin in type 1 diabetes.',
    keywords: ['type 1 diabetes', 'basal insulin', 'NPO'],
    concepts: ['basal-insulin-safety', 'DKA-prevention'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-ADA-INSULIN-INDIVIDUALIZE',
    sourceId: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    claim: 'ADA perioperative insulin management uses regimen-specific basal, NPH, and pump adjustments based on diabetes type and clinical judgment rather than a single universal insulin instruction.',
    normalizedTopic: 'perioperative-insulin-individualization',
    stance: 'CONDITIONAL',
    strength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-basal-insulin', 'CLS-prandial-insulin', 'CLS-premixed-insulin', 'CLS-concentrated-insulin', 'CLS-insulin-pump-aid'], procedureCodes: [...procedures] },
    title: 'Insulin plans require regimen-specific clinical judgment',
    summary: 'The evidence supports individualized adjustments; this batch deliberately does not calculate a patient-specific dose.',
    keywords: ['insulin', 'basal', 'NPH', 'pump', 'perioperative'],
    concepts: ['insulin-individualization'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-ADA-PUMP-INSTITUTIONAL-POLICY',
    sourceId: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    claim: 'Insulin pump and automated insulin delivery may be continued when clinically appropriate only with suitable institutional protocols, resources, training, monitoring, and contingency planning.',
    normalizedTopic: 'insulin-pump-institutional-policy',
    stance: 'CONDITIONAL',
    strength: 'LOW',
    applicability: { drugClassIds: ['CLS-insulin-pump-aid'], procedureCodes: [...procedures] },
    title: 'Pump/AID management depends on institutional capability',
    summary: 'PREP-MEDS should route device continuation and basal-rate handling through approved local policy rather than inventing a setting-independent plan.',
    keywords: ['insulin pump', 'AID', 'institutional policy'],
    concepts: ['pump-policy', 'diabetes-technology'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-ADA-CONCENTRATED-PREMIX-CAUTION',
    sourceId: 'SRC-ADA-DIABETES-HOSPITAL-2026-B2',
    claim: 'ADA notes limited perioperative data for concentrated insulin and highlights hypoglycemia or dosing-error concerns with concentrated and premixed regimens.',
    normalizedTopic: 'complex-insulin-formulation-safety',
    stance: 'DESCRIPTIVE',
    strength: 'LOW',
    applicability: { drugClassIds: ['CLS-premixed-insulin', 'CLS-concentrated-insulin'], procedureCodes: [...procedures] },
    title: 'Concentrated and premixed insulin require explicit review',
    summary: 'These formulations should not inherit a generic insulin instruction without regimen confirmation.',
    keywords: ['U-500', 'U-300', 'premixed insulin', 'hypoglycemia'],
    concepts: ['complex-insulin-regimen'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-USMSTF-MEDICATIONS-IN-BOWEL-PREP',
    sourceId: 'SRC-USMSTF-BOWEL-PREP-2025-B2',
    claim: 'The 2025 US Multi-Society Task Force recommends that bowel-preparation planning consider the patient medical history and medications.',
    normalizedTopic: 'colonoscopy-bowel-prep-medication-context',
    stance: 'SUPPORTS',
    strength: 'MODERATE',
    applicability: { procedureCodes: ['COLONOSCOPY', 'EGD_COLONOSCOPY'], populationTags: ['outpatient'] },
    title: 'Medication management is part of individualized bowel-prep planning',
    summary: 'The bowel-prep guideline supports medication-aware preparation but does not replace diabetes-specific peri-procedural medication guidance.',
    keywords: ['colonoscopy', 'bowel preparation', 'diabetes medications'],
    concepts: ['bowel-prep-context'],
    authority: 95,
  }),
  atom({
    id: 'EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS',
    sourceId: 'SRC-FDA-METFORMIN-LABEL-2024-B2',
    claim: 'Metformin labeling identifies surgery and other procedures among risk contexts for metformin-associated lactic acidosis, particularly with other risk factors such as renal impairment or hypoxic states.',
    normalizedTopic: 'metformin-procedure-safety',
    stance: 'DESCRIPTIVE',
    strength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-metformin'], procedureCodes: [...procedures] },
    title: 'Metformin has procedure-related lactic-acidosis risk considerations',
    summary: 'This label context supports safety review but does not justify extending the ADA procedure-day hold to an arbitrary longer interval.',
    keywords: ['metformin', 'lactic acidosis', 'procedure'],
    concepts: ['metformin-safety'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-FDA-SULFONYLUREA-HYPOGLYCEMIA',
    sourceId: 'SRC-FDA-GLIPIZIDE-LABEL-B2',
    claim: 'Sulfonylureas such as glipizide can cause clinically important hypoglycemia, with greater vulnerability in selected patients.',
    normalizedTopic: 'sulfonylurea-fasting-hypoglycemia',
    stance: 'DESCRIPTIVE',
    strength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-sulfonylurea'], procedureCodes: [...procedures] },
    title: 'Sulfonylureas carry hypoglycemia risk during reduced intake',
    summary: 'Fasting and bowel preparation make medication timing clinically relevant.',
    keywords: ['sulfonylurea', 'glipizide', 'hypoglycemia'],
    concepts: ['hypoglycemia'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED',
    sourceId: 'SRC-FDA-REPAGLINIDE-LABEL-B2',
    claim: 'Repaglinide is meal-linked therapy and carries hypoglycemia risk; dosing is tied to meal intake rather than a fixed fasting regimen.',
    normalizedTopic: 'meglitinide-meal-linked',
    stance: 'DESCRIPTIVE',
    strength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-meglitinide'], procedureCodes: [...procedures] },
    title: 'Meglitinides are meal-linked glucose-lowering drugs',
    summary: 'Reduced intake is clinically relevant; PREP-MEDS does not create a patient-specific replacement regimen.',
    keywords: ['repaglinide', 'meglitinide', 'meal', 'hypoglycemia'],
    concepts: ['meal-linked-medication'],
    authority: 100,
  }),
  atom({
    id: 'EVD-B2-FDA-PRAMLINTIDE-INSULIN-CONTEXT',
    sourceId: 'SRC-FDA-PRAMLINTIDE-LABEL-B2',
    claim: 'Pramlintide is used with mealtime insulin and has clinically relevant hypoglycemia and gastrointestinal considerations that require regimen-aware management.',
    normalizedTopic: 'pramlintide-mealtime-insulin-context',
    stance: 'DESCRIPTIVE',
    strength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-pramlintide'], procedureCodes: [...procedures] },
    title: 'Pramlintide requires mealtime-insulin context',
    summary: 'A generic oral-agent rule is inappropriate for pramlintide; clinician review is required.',
    keywords: ['pramlintide', 'Symlin', 'mealtime insulin'],
    concepts: ['pramlintide', 'hypoglycemia'],
    authority: 100,
  }),
];

export const diabetesCoreEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt,
  sources,
  atoms,
};

const oralClasses = [
  'CLS-metformin',
  'CLS-sulfonylurea',
  'CLS-meglitinide',
  'CLS-dpp4-inhibitor',
  'CLS-thiazolidinedione',
  'CLS-alpha-glucosidase-inhibitor',
  'CLS-dopamine-agonist-diabetes',
  'CLS-bile-acid-sequestrant-diabetes',
] as const;

function oralProcedureDayRule(classId: (typeof oralClasses)[number], suffix: string, evidenceRefs: Array<{ id: string; version: number }>): ClinicalRule {
  return {
    id: `RULE-B2-${suffix}-PROCEDURE-DAY`,
    version: 1,
    name: `${suffix} procedure-day oral glucose-lowering pathway`,
    scope: { drugClassIds: [classId], procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-diabetes-medication-indication'],
    hardStops: [
      {
        reasonCode: 'NON_DIABETES_INDICATION_REQUIRES_CLINICIAN_REVIEW',
        condition: { op: 'NOT_EQUALS', field: 'modifier:MOD-diabetes-medication-indication', value: 'DIABETES' },
        disposition: 'CLINICIAN_REVIEW_REQUIRED',
      },
    ],
    disposition: 'HOLD_STANDARD',
    timingRule: {
      instructionCode: 'HOLD_ORAL_GLUCOSE_LOWERING_AGENT_ON_PROCEDURE_DAY',
      procedureDay: { takeMedication: false },
      restart: { criterionCode: 'RESTART_WHEN_USUAL_ORAL_INTAKE_RESUMED_AND_CLINICALLY_APPROPRIATE' },
    },
    restartOwner: 'RULE_DEFINED',
    evidenceRefs,
    status: 'CLINICAL_REVIEW',
    priority: 20,
  };
}

function insulinReviewRule(args: {
  id: string;
  name: string;
  classId: string;
  extraModifierIds?: string[];
  disposition?: 'CLINICIAN_REVIEW_REQUIRED' | 'LOCAL_POLICY_REQUIRED';
  evidenceRefs?: Array<{ id: string; version: number }>;
}): ClinicalRule {
  return {
    id: args.id,
    version: 1,
    name: args.name,
    scope: { drugClassIds: [args.classId], procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-diabetes-type', 'MOD-current-insulin-plan-confirmed', ...(args.extraModifierIds ?? [])],
    hardStops: [
      {
        reasonCode: 'TYPE_1_DIABETES_REQUIRES_BASAL_INSULIN_COVERAGE',
        condition: { op: 'EQUALS', field: 'modifier:MOD-diabetes-type', value: 'TYPE_1' },
        disposition: 'CLINICIAN_REVIEW_REQUIRED',
      },
    ],
    disposition: args.disposition ?? 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: args.evidenceRefs ?? [{ id: 'EVD-B2-ADA-INSULIN-INDIVIDUALIZE', version: 1 }],
    status: 'CLINICAL_REVIEW',
    priority: 30,
  };
}

export const diabetesCoreCandidateRules: ClinicalRule[] = [
  oralProcedureDayRule('CLS-metformin', 'METFORMIN', [
    { id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 },
    { id: 'EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS', version: 1 },
  ]),
  oralProcedureDayRule('CLS-sulfonylurea', 'SULFONYLUREA', [
    { id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 },
    { id: 'EVD-B2-FDA-SULFONYLUREA-HYPOGLYCEMIA', version: 1 },
  ]),
  oralProcedureDayRule('CLS-meglitinide', 'MEGLITINIDE', [
    { id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 },
    { id: 'EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED', version: 1 },
  ]),
  oralProcedureDayRule('CLS-dpp4-inhibitor', 'DPP4', [{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 }]),
  oralProcedureDayRule('CLS-thiazolidinedione', 'TZD', [{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 }]),
  oralProcedureDayRule('CLS-alpha-glucosidase-inhibitor', 'ALPHA-GLUCOSIDASE', [{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 }]),
  oralProcedureDayRule('CLS-dopamine-agonist-diabetes', 'BROMOCRIPTINE-QR', [{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 }]),
  oralProcedureDayRule('CLS-bile-acid-sequestrant-diabetes', 'COLESEVELAM', [{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 1 }]),
  {
    id: 'RULE-B2-PRAMLINTIDE-REVIEW',
    version: 1,
    name: 'Pramlintide peri-procedural regimen review',
    scope: { medicationIds: ['MED-pramlintide'], procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-diabetes-type', 'MOD-mealtime-insulin-use', 'MOD-current-insulin-plan-confirmed'],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-B2-FDA-PRAMLINTIDE-INSULIN-CONTEXT', version: 1 }],
    status: 'CLINICAL_REVIEW',
    priority: 30,
  },
  insulinReviewRule({
    id: 'RULE-B2-BASAL-INSULIN-REVIEW',
    name: 'Basal insulin individualized peri-procedural review',
    classId: 'CLS-basal-insulin',
    evidenceRefs: [
      { id: 'EVD-B2-ADA-INSULIN-INDIVIDUALIZE', version: 1 },
      { id: 'EVD-B2-ADA-T1D-BASAL-MUST-CONTINUE', version: 1 },
    ],
  }),
  insulinReviewRule({
    id: 'RULE-B2-PRANDIAL-INSULIN-REVIEW',
    name: 'Prandial insulin individualized peri-procedural review',
    classId: 'CLS-prandial-insulin',
    extraModifierIds: ['MOD-current-oral-intake-state'],
  }),
  insulinReviewRule({
    id: 'RULE-B2-PREMIXED-INSULIN-REVIEW',
    name: 'Premixed insulin individualized peri-procedural review',
    classId: 'CLS-premixed-insulin',
    evidenceRefs: [
      { id: 'EVD-B2-ADA-INSULIN-INDIVIDUALIZE', version: 1 },
      { id: 'EVD-B2-ADA-CONCENTRATED-PREMIX-CAUTION', version: 1 },
    ],
  }),
  insulinReviewRule({
    id: 'RULE-B2-CONCENTRATED-INSULIN-REVIEW',
    name: 'Concentrated insulin individualized peri-procedural review',
    classId: 'CLS-concentrated-insulin',
    evidenceRefs: [
      { id: 'EVD-B2-ADA-INSULIN-INDIVIDUALIZE', version: 1 },
      { id: 'EVD-B2-ADA-CONCENTRATED-PREMIX-CAUTION', version: 1 },
    ],
  }),
  insulinReviewRule({
    id: 'RULE-B2-INSULIN-PUMP-AID-POLICY',
    name: 'Insulin pump / automated insulin delivery local-policy pathway',
    classId: 'CLS-insulin-pump-aid',
    disposition: 'LOCAL_POLICY_REQUIRED',
    extraModifierIds: ['MOD-pump-aid-system-type'],
    evidenceRefs: [
      { id: 'EVD-B2-ADA-PUMP-INSTITUTIONAL-POLICY', version: 1 },
      { id: 'EVD-B2-ADA-T1D-BASAL-MUST-CONTINUE', version: 1 },
    ],
  }),
];

export const diabetesCoreReleaseMetadata = {
  releaseId: 'PREP-MEDS-MED-BATCH-002-DIABETES-CORE',
  version: 1,
  status: 'CLINICAL_REVIEW_REQUIRED' as const,
  intendedUse: 'SHADOW_VALIDATION_ONLY' as const,
  generatedAt,
  scope: [
    'metformin', 'sulfonylureas', 'meglitinides', 'DPP-4 inhibitors', 'thiazolidinediones',
    'alpha-glucosidase inhibitors', 'pramlintide', 'bromocriptine-QR', 'colesevelam',
    'basal insulin', 'prandial insulin', 'concentrated insulin', 'premixed insulin', 'insulin pump/AID',
  ],
  unresolved: [
    'This batch encodes procedure-day oral medication handling only; day-before bowel-prep handling is not generalized beyond available evidence and requires a governed GI/diabetes protocol.',
    'No patient-specific insulin dose, percentage reduction, unit conversion, or correction regimen is calculated by the LLM or deterministic rule set in this batch.',
    'Insulin pump/AID continuation depends on local institutional capability and protocol.',
    'Type 1 diabetes must never be converted into a blanket basal-insulin hold instruction.',
    'SGLT2 inhibitors and GLP-1/GIP therapies are intentionally deferred to medication Batch 3.',
    'No RxNorm identifiers are asserted unless independently verified in a terminology-ingestion pass.',
  ],
} as const;
