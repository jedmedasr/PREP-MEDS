import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T07:00:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch03CurrentIncretinExpansionDefinition {
  medicationId: 'MED-exenatide-generic-anda206697' | 'MED-orforglipron-foundayo';
  ingredientId: 'ING-exenatide' | 'ING-orforglipron';
  genericName: 'exenatide' | 'orforglipron';
  brandName?: 'Foundayo';
  dosageForm: 'INJECTION' | 'TABLET, FILM COATED';
  route: 'SUBCUTANEOUS' | 'ORAL';
  formulation?: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  indicationBoundary: 'DIABETES' | 'WEIGHT_MANAGEMENT';
  evidenceRef: { id: string; version: number };
  reviewEvidenceRef: { id: string; version: number };
}

export const batch03CurrentIncretinExpansionDefinitions: Batch03CurrentIncretinExpansionDefinition[] = [
  {
    medicationId: 'MED-exenatide-generic-anda206697',
    ingredientId: 'ING-exenatide',
    genericName: 'exenatide',
    dosageForm: 'INJECTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-EXENATIDE-ANDA206697-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-EXENATIDE-ANDA206697-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-orforglipron-foundayo',
    ingredientId: 'ING-orforglipron',
    genericName: 'orforglipron',
    brandName: 'Foundayo',
    dosageForm: 'TABLET, FILM COATED',
    route: 'ORAL',
    indicationBoundary: 'WEIGHT_MANAGEMENT',
    evidenceRef: { id: 'EVD-B3-FOUNDAYO-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-FOUNDAYO-PROCEDURE-REVIEW', version: 1 },
  },
];

export const batch03CurrentIncretinExpansionSources: SourceDocument[] = [
  {
    id: 'SRC-B3-EXENATIDE-AMNEAL-SPL17',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'EXENATIDE injection: Amneal manufacturer labeling, SPL 17',
    publisher: 'Amneal Pharmaceuticals LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-05-27',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e6cb5c8f-e97f-4a6a-95a4-939fd2393949',
    externalIdentifier: 'DailyMed SETID e6cb5c8f-e97f-4a6a-95a4-939fd2393949; SPL version 17; ANDA206697',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'e6cb5c8f-e97f-4a6a-95a4-939fd2393949',
      splVersion: 17,
      applicationNumber: 'ANDA206697',
      route: 'SUBCUTANEOUS',
      dosageForm: 'INJECTION',
      labelRevision: '2026-05',
      verificationScope: 'Current source-linked product/application identity and procedure-review provenance only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-FOUNDAYO-SPL10',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'FOUNDAYO (orforglipron) tablets: Eli Lilly manufacturer labeling, SPL 10',
    publisher: 'Eli Lilly and Company; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-07-29',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8ac446c5-feba-474f-a103-23facb9b5c62',
    externalIdentifier: 'DailyMed SETID 8ac446c5-feba-474f-a103-23facb9b5c62; SPL version 10; NDA220934',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '8ac446c5-feba-474f-a103-23facb9b5c62',
      splVersion: 10,
      applicationNumber: 'NDA220934',
      route: 'ORAL',
      dosageForm: 'TABLET, FILM COATED',
      labelRevision: '2026-07',
      initialFdaApprovalDate: '2026-04-01',
      verificationScope: 'Current product/route/indication identity and procedure-review provenance only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
];

const sourceByMedication: Record<Batch03CurrentIncretinExpansionDefinition['medicationId'], string> = {
  'MED-exenatide-generic-anda206697': 'SRC-B3-EXENATIDE-AMNEAL-SPL17',
  'MED-orforglipron-foundayo': 'SRC-B3-FOUNDAYO-SPL10',
};

export const batch03CurrentIncretinExpansionIdentityAtoms: EvidenceAtom[] =
  batch03CurrentIncretinExpansionDefinitions.map((product) => ({
    id: product.evidenceRef.id,
    version: product.evidenceRef.version,
    source: { id: sourceByMedication[product.medicationId], version: 1 },
    claim: product.medicationId === 'MED-exenatide-generic-anda206697'
      ? 'Current Amneal FDA/DailyMed labeling identifies a source-distinct subcutaneous exenatide injection under ANDA206697; PREP-MEDS preserves the application/product identity without treating generic exenatide wording as sufficient to select this source record.'
      : 'Current FDA/DailyMed labeling identifies FOUNDAYO as an oral film-coated tablet product containing orforglipron under NDA220934 for chronic weight management; PREP-MEDS uses this evidence only for source-linked product/route/indication identity.',
    normalizedTopic: 'batch03-current-incretin-product-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [product.ingredientId],
      contextTags: ['current-product', 'glp1', 'product-reconciliation', 'clinical-review-only'],
    },
    locator: { section: 'Product Data; Indications and Usage; Route of Administration' },
    limitations: [
      'Identity evidence does not establish a patient-specific prescription, dose, schedule, strength, or current pharmacy inventory.',
      'Ingredient identity alone does not authenticate the source-linked product or application.',
      'No substitution, conversion, peri-procedural hold/continue/restart instruction, or market-availability claim is authorized by this identity atom.',
    ],
    retrieval: {
      title: product.brandName
        ? `${product.brandName} ${product.genericName} current product identity`
        : `Exenatide ANDA206697 current product identity`,
      summary: product.brandName
        ? `Current FDA/DailyMed labeling supports source-linked ${product.brandName} oral product identity.`
        : 'Current FDA/DailyMed labeling supports source-linked Amneal exenatide injection identity under ANDA206697.',
      keywords: [product.genericName, product.brandName ?? 'ANDA206697', product.route, 'GLP-1', 'product identity'],
      concepts: ['medication-identity', 'route-identity', 'product-reconciliation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  }));

export const batch03CurrentIncretinExpansionProcedureReviewAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B3-EXENATIDE-ANDA206697-PROCEDURE-REVIEW',
    version: 1,
    source: { id: 'SRC-B3-EXENATIDE-AMNEAL-SPL17', version: 1 },
    claim: 'Current Amneal exenatide labeling states that exenatide delays gastric emptying, notes rare pulmonary aspiration reports in patients receiving GLP-1 receptor agonists during elective surgery or procedures requiring general anesthesia or deep sedation, and states that available data are insufficient to determine whether modified fasting or temporary discontinuation mitigates retained-gastric-content risk.',
    normalizedTopic: 'batch03-current-incretin-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-exenatide-generic-anda206697'],
      ingredientIds: ['ING-exenatide'],
      contextTags: ['procedure-review', 'gastric-emptying', 'aspiration-risk', 'clinical-review-only'],
    },
    locator: { section: 'Warnings and Precautions 5.10 Pulmonary Aspiration During General Anesthesia or Deep Sedation' },
    limitations: [
      'The label does not establish an endoscopy-specific hold interval.',
      'Available data are stated to be insufficient to determine whether temporary discontinuation or modified fasting mitigates the risk.',
      'This atom authorizes clinician-review routing only; it does not authorize a hold/continue/restart timing rule.',
    ],
    retrieval: {
      title: 'Amneal exenatide procedure-related gastric-emptying review',
      summary: 'Current exenatide labeling identifies delayed gastric emptying and aspiration reports while stating that evidence is insufficient to define a mitigation strategy.',
      keywords: ['exenatide', 'ANDA206697', 'gastric emptying', 'pulmonary aspiration', 'deep sedation'],
      concepts: ['exenatide', 'gastric-emptying', 'aspiration-risk', 'clinical-review'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
  {
    id: 'EVD-B3-FOUNDAYO-PROCEDURE-REVIEW',
    version: 1,
    source: { id: 'SRC-B3-FOUNDAYO-SPL10', version: 1 },
    claim: 'Current FOUNDAYO labeling states that orforglipron delays gastric emptying, notes rare pulmonary aspiration reports in patients receiving GLP-1 receptor agonists during elective surgery or procedures requiring general anesthesia or deep sedation, and states that available data are insufficient to determine whether modified fasting or temporary discontinuation mitigates retained-gastric-content risk.',
    normalizedTopic: 'batch03-current-incretin-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-orforglipron-foundayo'],
      ingredientIds: ['ING-orforglipron'],
      contextTags: ['procedure-review', 'gastric-emptying', 'aspiration-risk', 'clinical-review-only'],
    },
    locator: { section: 'Warnings and Precautions 5.9 Pulmonary Aspiration During General Anesthesia or Deep Sedation' },
    limitations: [
      'The label does not establish an endoscopy-specific hold interval.',
      'Available data are stated to be insufficient to determine whether temporary discontinuation or modified fasting mitigates the risk.',
      'This atom authorizes clinician-review routing only; it does not authorize a hold/continue/restart timing rule.',
    ],
    retrieval: {
      title: 'FOUNDAYO procedure-related gastric-emptying review',
      summary: 'Current FOUNDAYO labeling identifies delayed gastric emptying and aspiration reports while stating that evidence is insufficient to define a mitigation strategy.',
      keywords: ['Foundayo', 'orforglipron', 'gastric emptying', 'pulmonary aspiration', 'deep sedation'],
      concepts: ['orforglipron', 'gastric-emptying', 'aspiration-risk', 'clinical-review'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const batch03CurrentIncretinExpansionReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B3-CURRENT-INCRETIN-EXPANSION-REVIEW-001',
    version: 1,
    name: 'Current source-linked incretin products require clinician review pending GLP-1 procedure-policy adjudication',
    scope: {
      medicationIds: [
        'MED-exenatide-generic-anda206697',
        'MED-orforglipron-foundayo',
      ],
      procedureCodes: [...procedures],
    },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [
      { id: 'EVD-B3-EXENATIDE-ANDA206697-PROCEDURE-REVIEW', version: 1 },
      { id: 'EVD-B3-FOUNDAYO-PROCEDURE-REVIEW', version: 1 },
    ],
    status: 'TECHNICALLY_TESTED',
    priority: 50,
  },
];

export const batch03CurrentIncretinExpansionEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03CurrentIncretinExpansionSources,
  atoms: [
    ...batch03CurrentIncretinExpansionIdentityAtoms,
    ...batch03CurrentIncretinExpansionProcedureReviewAtoms,
  ],
};
