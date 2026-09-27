import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-27T06:20:00Z';

export interface Batch03IncretinIdentityDefinition {
  medicationId:
    | 'MED-tirzepatide-mounjaro'
    | 'MED-tirzepatide-zepbound'
    | 'MED-exenatide-byetta'
    | 'MED-exenatide-bydureon-bcise'
    | 'MED-liraglutide-victoza'
    | 'MED-liraglutide-saxenda'
    | 'MED-liraglutide-generic-weight-management';
  ingredientId: 'ING-tirzepatide' | 'ING-exenatide' | 'ING-liraglutide';
  genericName: 'tirzepatide' | 'exenatide' | 'liraglutide';
  brandName?: 'Mounjaro' | 'Zepbound' | 'Byetta' | 'Bydureon BCise' | 'Victoza' | 'Saxenda';
  dosageForm: 'INJECTION, SOLUTION' | 'INJECTION' | 'INJECTION, SUSPENSION, EXTENDED RELEASE';
  route: 'SUBCUTANEOUS';
  formulation?: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  indicationBoundary: 'DIABETES' | 'WEIGHT_MANAGEMENT_OR_OSA' | 'WEIGHT_MANAGEMENT';
  evidenceRef: { id: string; version: number };
}

export const batch03IncretinIdentityDefinitions: Batch03IncretinIdentityDefinition[] = [
  {
    medicationId: 'MED-tirzepatide-mounjaro',
    ingredientId: 'ING-tirzepatide',
    genericName: 'tirzepatide',
    brandName: 'Mounjaro',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-MOUNJARO-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-tirzepatide-zepbound',
    ingredientId: 'ING-tirzepatide',
    genericName: 'tirzepatide',
    brandName: 'Zepbound',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'WEIGHT_MANAGEMENT_OR_OSA',
    evidenceRef: { id: 'EVD-B3-ZEPBOUND-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-exenatide-byetta',
    ingredientId: 'ING-exenatide',
    genericName: 'exenatide',
    brandName: 'Byetta',
    dosageForm: 'INJECTION',
    route: 'SUBCUTANEOUS',
    formulation: 'IMMEDIATE_RELEASE',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-BYETTA-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-exenatide-bydureon-bcise',
    ingredientId: 'ING-exenatide',
    genericName: 'exenatide',
    brandName: 'Bydureon BCise',
    dosageForm: 'INJECTION, SUSPENSION, EXTENDED RELEASE',
    route: 'SUBCUTANEOUS',
    formulation: 'EXTENDED_RELEASE',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-BYDUREON-BCISE-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-liraglutide-victoza',
    ingredientId: 'ING-liraglutide',
    genericName: 'liraglutide',
    brandName: 'Victoza',
    dosageForm: 'INJECTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-VICTOZA-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-liraglutide-saxenda',
    ingredientId: 'ING-liraglutide',
    genericName: 'liraglutide',
    brandName: 'Saxenda',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'WEIGHT_MANAGEMENT',
    evidenceRef: { id: 'EVD-B3-SAXENDA-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-liraglutide-generic-weight-management',
    ingredientId: 'ING-liraglutide',
    genericName: 'liraglutide',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'WEIGHT_MANAGEMENT',
    evidenceRef: { id: 'EVD-B3-LIRAGLUTIDE-GENERIC-WM-IDENTITY', version: 1 },
  },
];

function source(
  id: string,
  title: string,
  publisher: string,
  setId: string,
  splVersion: number,
  effectiveDate: string,
  applicationNumber: string,
  dosageFormAndRoute: string,
): SourceDocument {
  return {
    id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title,
    publisher,
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`,
    externalIdentifier: `DailyMed SETID ${setId}; SPL version ${splVersion}; ${applicationNumber}`,
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId,
      splVersion,
      applicationNumber,
      dosageFormAndRoute,
      verificationScope: 'Current product/formulation identity only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
    },
  };
}

export const batch03IncretinIdentitySources: SourceDocument[] = [
  source(
    'SRC-B3-MOUNJARO-SPL40',
    'MOUNJARO (tirzepatide) injection: manufacturer labeling, SPL 40',
    'Eli Lilly and Company; DailyMed',
    'd2d7da5d-ad07-4228-955f-cf7e355c8cc0',
    40,
    '2026-08-27',
    'NDA215866',
    'INJECTION, SOLUTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-ZEPBOUND-SPL40',
    'ZEPBOUND (tirzepatide) injection: manufacturer labeling, SPL 40',
    'Eli Lilly and Company; DailyMed',
    '487cd7e7-434c-4925-99fa-aa80b1cc776b',
    40,
    '2026-08-28',
    'NDA217806',
    'INJECTION, SOLUTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-BYETTA-SPL26',
    'BYETTA (exenatide) injection: manufacturer labeling, SPL 26',
    'AstraZeneca Pharmaceuticals LP; DailyMed',
    '53d03c03-ebf7-418d-88a8-533eabd2ee4f',
    26,
    '2025-09-02',
    'NDA021773',
    'INJECTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-BYDUREON-BCISE-SPL39',
    'BYDUREON BCISE (exenatide) extended-release injectable suspension: manufacturer labeling, SPL 39',
    'AstraZeneca Pharmaceuticals LP; DailyMed',
    '2d18cfc4-e0de-4814-a712-c1b7c504bff5',
    39,
    '2025-05-28',
    'NDA209210',
    'INJECTION, SUSPENSION, EXTENDED RELEASE / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-VICTOZA-SPL31',
    'VICTOZA (liraglutide) injection: manufacturer labeling, SPL 31',
    'Novo Nordisk; DailyMed',
    '5a9ef4ea-c76a-4d34-a604-27c5b505f5a4',
    31,
    '2025-10-14',
    'NDA022341',
    'INJECTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-SAXENDA-SPL22',
    'SAXENDA (liraglutide) injection: manufacturer labeling, SPL 22',
    'Novo Nordisk Pharmaceutical Industries, LP; DailyMed',
    '3946d389-0926-4f77-a708-0acb8153b143',
    22,
    '2026-02-25',
    'NDA206321',
    'INJECTION, SOLUTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-LIRAGLUTIDE-CIPLA-SPL6',
    'Liraglutide injection for chronic weight management: current generic labeling, SPL 6',
    'Cipla USA Inc.; DailyMed',
    '22c86976-9657-4dd0-8fff-0c3f3f08357c',
    6,
    '2026-06-18',
    'ANDA217234',
    'INJECTION, SOLUTION / SUBCUTANEOUS',
  ),
];

const sourceByMedication: Record<Batch03IncretinIdentityDefinition['medicationId'], string> = {
  'MED-tirzepatide-mounjaro': 'SRC-B3-MOUNJARO-SPL40',
  'MED-tirzepatide-zepbound': 'SRC-B3-ZEPBOUND-SPL40',
  'MED-exenatide-byetta': 'SRC-B3-BYETTA-SPL26',
  'MED-exenatide-bydureon-bcise': 'SRC-B3-BYDUREON-BCISE-SPL39',
  'MED-liraglutide-victoza': 'SRC-B3-VICTOZA-SPL31',
  'MED-liraglutide-saxenda': 'SRC-B3-SAXENDA-SPL22',
  'MED-liraglutide-generic-weight-management': 'SRC-B3-LIRAGLUTIDE-CIPLA-SPL6',
};

function identityAtom(product: Batch03IncretinIdentityDefinition): EvidenceAtom {
  const name = product.brandName ?? 'generic liraglutide';
  return {
    id: product.evidenceRef.id,
    version: product.evidenceRef.version,
    source: { id: sourceByMedication[product.medicationId], version: 1 },
    claim: `Current FDA/DailyMed labeling identifies ${name} as a subcutaneous ${product.dosageForm.toLowerCase()} product containing ${product.genericName}; PREP-MEDS uses this evidence only for product/formulation/indication-boundary identity.`,
    normalizedTopic: 'batch03-incretin-product-formulation-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [product.ingredientId],
      contextTags: [
        'product-reconciliation',
        'formulation-identity',
        'indication-boundary',
        'clinical-review-only',
      ],
    },
    locator: { section: 'Product Data; Indications and Usage; Dosage Form; Route of Administration' },
    limitations: [
      'Identity evidence does not establish a patient-specific prescription, dose, schedule, strength, or indication.',
      'Ingredient identity alone does not authenticate a brand, formulation, or clinical indication.',
      'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
    ],
    retrieval: {
      title: `${name} ${product.genericName} product identity`,
      summary: `Current FDA/DailyMed labeling supports source-linked ${name} product/formulation identity while preserving indication and formulation boundaries.`,
      keywords: [product.genericName, name, product.route, product.dosageForm, 'incretin', 'product identity'],
      concepts: ['medication-identity', 'formulation-identity', 'indication-boundary'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

export const batch03IncretinIdentityAtoms: EvidenceAtom[] =
  batch03IncretinIdentityDefinitions.map(identityAtom);


export const batch03TirzepatideProcedureReviewAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B3-MOUNJARO-PROCEDURE-REVIEW',
    version: 1,
    source: { id: 'SRC-B3-MOUNJARO-SPL40', version: 1 },
    claim: 'Current MOUNJARO labeling states that tirzepatide delays gastric emptying, reports rare pulmonary aspiration during elective surgery or procedures requiring general anesthesia or deep sedation, and states that available data are insufficient to determine whether modified fasting or temporary discontinuation reduces retained-gastric-content risk.',
    normalizedTopic: 'batch03-tirzepatide-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-tirzepatide-mounjaro'],
      ingredientIds: ['ING-tirzepatide'],
      contextTags: ['procedure-review', 'gastric-emptying', 'aspiration-risk', 'clinical-review-only'],
    },
    locator: { section: 'Warnings and Precautions 5.9 Pulmonary Aspiration During General Anesthesia or Deep Sedation' },
    limitations: [
      'The label does not establish an endoscopy-specific hold interval.',
      'The label states that available data are insufficient to determine whether temporary discontinuation or modified fasting mitigates the risk.',
      'PREP-MEDS therefore uses this atom to require review, not to generate a hold/continue/restart timing instruction.',
    ],
    retrieval: {
      title: 'MOUNJARO procedure-related gastric-emptying review',
      summary: 'Current MOUNJARO labeling identifies delayed gastric emptying and aspiration reports while stating that evidence is insufficient to define a mitigation strategy.',
      keywords: ['Mounjaro', 'tirzepatide', 'gastric emptying', 'pulmonary aspiration', 'anesthesia', 'deep sedation'],
      concepts: ['tirzepatide', 'gastric-emptying', 'aspiration-risk', 'clinical-review'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
  {
    id: 'EVD-B3-ZEPBOUND-PROCEDURE-REVIEW',
    version: 1,
    source: { id: 'SRC-B3-ZEPBOUND-SPL40', version: 1 },
    claim: 'Current ZEPBOUND labeling states that tirzepatide delays gastric emptying, reports rare pulmonary aspiration during elective surgery or procedures requiring general anesthesia or deep sedation, and states that available data are insufficient to determine whether modified fasting or temporary discontinuation reduces retained-gastric-content risk.',
    normalizedTopic: 'batch03-tirzepatide-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-tirzepatide-zepbound'],
      ingredientIds: ['ING-tirzepatide'],
      contextTags: ['procedure-review', 'gastric-emptying', 'aspiration-risk', 'clinical-review-only'],
    },
    locator: { section: 'Warnings and Precautions 5.9 Pulmonary Aspiration During General Anesthesia or Deep Sedation' },
    limitations: [
      'The label does not establish an endoscopy-specific hold interval.',
      'The label states that available data are insufficient to determine whether temporary discontinuation or modified fasting mitigates the risk.',
      'PREP-MEDS therefore uses this atom to require review, not to generate a hold/continue/restart timing instruction.',
    ],
    retrieval: {
      title: 'ZEPBOUND procedure-related gastric-emptying review',
      summary: 'Current ZEPBOUND labeling identifies delayed gastric emptying and aspiration reports while stating that evidence is insufficient to define a mitigation strategy.',
      keywords: ['Zepbound', 'tirzepatide', 'gastric emptying', 'pulmonary aspiration', 'anesthesia', 'deep sedation'],
      concepts: ['tirzepatide', 'gastric-emptying', 'aspiration-risk', 'clinical-review'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const batch03IncretinIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03IncretinIdentitySources,
  atoms: [...batch03IncretinIdentityAtoms, ...batch03TirzepatideProcedureReviewAtoms],
};
