import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-27T10:05:00Z';

export interface Batch03FixedCombinationIdentityDefinition {
  medicationId:
    | 'MED-insulin-glargine-lixisenatide-soliqua'
    | 'MED-insulin-degludec-liraglutide-xultophy';
  ingredientIds:
    | ['ING-insulin-glargine', 'ING-lixisenatide']
    | ['ING-insulin-degludec', 'ING-liraglutide'];
  genericName:
    | 'insulin glargine and lixisenatide'
    | 'insulin degludec and liraglutide';
  brandName: 'Soliqua 100/33' | 'Xultophy 100/3.6';
  dosageForm: 'INJECTION, SOLUTION';
  route: 'SUBCUTANEOUS';
  indicationBoundary: 'DIABETES';
  evidenceRef: { id: string; version: number };
  reviewEvidenceRef: { id: string; version: number };
}

export const batch03FixedCombinationIdentityDefinitions: Batch03FixedCombinationIdentityDefinition[] = [
  {
    medicationId: 'MED-insulin-glargine-lixisenatide-soliqua',
    ingredientIds: ['ING-insulin-glargine', 'ING-lixisenatide'],
    genericName: 'insulin glargine and lixisenatide',
    brandName: 'Soliqua 100/33',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-SOLIQUA-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-SOLIQUA-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-insulin-degludec-liraglutide-xultophy',
    ingredientIds: ['ING-insulin-degludec', 'ING-liraglutide'],
    genericName: 'insulin degludec and liraglutide',
    brandName: 'Xultophy 100/3.6',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    evidenceRef: { id: 'EVD-B3-XULTOPHY-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-XULTOPHY-PROCEDURE-REVIEW', version: 1 },
  },
];

export const batch03FixedCombinationIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-B3-SOLIQUA-SPL25',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'SOLIQUA 100/33 (insulin glargine and lixisenatide) injection: manufacturer labeling, SPL 25',
    publisher: 'Sanofi-Aventis U.S. LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-03-18',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4bba538b-cf7c-4310-ae8f-cb711ed21bcc',
    externalIdentifier: 'DailyMed SETID 4bba538b-cf7c-4310-ae8f-cb711ed21bcc; SPL version 25; BLA208673',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '4bba538b-cf7c-4310-ae8f-cb711ed21bcc',
      splVersion: 25,
      applicationNumber: 'BLA208673',
      dosageFormAndRoute: 'INJECTION, SOLUTION / SUBCUTANEOUS',
      verificationScope: 'Current fixed-combination product identity and procedure-review warning only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      doseArithmeticAuthorized: false,
      deviceSettingAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-XULTOPHY-SPL14',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'XULTOPHY 100/3.6 (insulin degludec and liraglutide) injection: manufacturer labeling, SPL 14',
    publisher: 'Novo Nordisk; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2025-10-14',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=21335fe4-d395-4501-ac2a-2f20d7520da9',
    externalIdentifier: 'DailyMed SETID 21335fe4-d395-4501-ac2a-2f20d7520da9; SPL version 14; BLA208583',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '21335fe4-d395-4501-ac2a-2f20d7520da9',
      splVersion: 14,
      applicationNumber: 'BLA208583',
      dosageFormAndRoute: 'INJECTION, SOLUTION / SUBCUTANEOUS',
      verificationScope: 'Current fixed-combination product identity and procedure-review warning only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      doseArithmeticAuthorized: false,
      deviceSettingAuthorized: false,
    },
  },
];

const sourceByMedication: Record<Batch03FixedCombinationIdentityDefinition['medicationId'], string> = {
  'MED-insulin-glargine-lixisenatide-soliqua': 'SRC-B3-SOLIQUA-SPL25',
  'MED-insulin-degludec-liraglutide-xultophy': 'SRC-B3-XULTOPHY-SPL14',
};

function identityAtom(product: Batch03FixedCombinationIdentityDefinition): EvidenceAtom {
  return {
    id: product.evidenceRef.id,
    version: product.evidenceRef.version,
    source: { id: sourceByMedication[product.medicationId], version: 1 },
    claim: `Current FDA/DailyMed manufacturer labeling identifies ${product.brandName} as a subcutaneous fixed-combination injection containing ${product.genericName}; PREP-MEDS uses this evidence only for product and component identity.`,
    normalizedTopic: 'batch03-fixed-insulin-glp1-product-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [...product.ingredientIds],
      contextTags: ['fixed-combination', 'product-reconciliation', 'clinical-review-only'],
    },
    locator: { section: 'Indications and Usage; Dosage Forms and Strengths; Product Data' },
    limitations: [
      'Identity evidence does not establish a patient-specific prescription, dose, schedule, conversion, or device setting.',
      'The insulin and GLP-1 receptor agonist components must not be separated into independently inferred peri-procedural instructions.',
      'No substitution, dose arithmetic, insulin conversion, device setting, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
    ],
    retrieval: {
      title: `${product.brandName} fixed-combination product identity`,
      summary: `Current manufacturer labeling supports source-linked ${product.brandName} identity while preserving both insulin and GLP-1 component boundaries.`,
      keywords: [product.brandName, ...product.ingredientIds, 'fixed combination', 'product identity'],
      concepts: ['medication-identity', 'fixed-combination', 'component-boundary'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

function reviewAtom(product: Batch03FixedCombinationIdentityDefinition): EvidenceAtom {
  return {
    id: product.reviewEvidenceRef.id,
    version: product.reviewEvidenceRef.version,
    source: { id: sourceByMedication[product.medicationId], version: 1 },
    claim: `Current ${product.brandName} labeling identifies both an insulin component and a GLP-1 receptor agonist component and includes procedure-related pulmonary-aspiration warnings associated with delayed gastric emptying; PREP-MEDS therefore requires clinician review rather than deriving a component-specific or product-specific timing instruction from the label.`,
    normalizedTopic: 'batch03-fixed-insulin-glp1-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [...product.ingredientIds],
      contextTags: ['fixed-combination', 'insulin', 'glp1', 'procedure-review', 'clinical-review-only'],
    },
    locator: { section: 'Warnings and Precautions 5.13 Pulmonary Aspiration During General Anesthesia or Deep Sedation' },
    limitations: [
      'The label does not establish an endoscopy-specific peri-procedural medication plan for the fixed combination.',
      'PREP-MEDS does not calculate insulin doses, component conversions, dose reductions, device settings, or replacement regimens.',
      'PREP-MEDS uses this atom to require review, not to generate a hold/continue/restart timing instruction.',
    ],
    retrieval: {
      title: `${product.brandName} fixed-combination procedure review`,
      summary: 'The fixed insulin/GLP-1 product requires integrated clinician review; the label is not converted into autonomous endoscopy timing.',
      keywords: [product.brandName, 'insulin', 'GLP-1', 'gastric emptying', 'pulmonary aspiration', 'procedure review'],
      concepts: ['fixed-combination', 'insulin-safety', 'gastric-emptying', 'clinical-review'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

export const batch03FixedCombinationIdentityAtoms: EvidenceAtom[] =
  batch03FixedCombinationIdentityDefinitions.map(identityAtom);

export const batch03FixedCombinationProcedureReviewAtoms: EvidenceAtom[] =
  batch03FixedCombinationIdentityDefinitions.map(reviewAtom);

export const batch03FixedCombinationIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03FixedCombinationIdentitySources,
  atoms: [
    ...batch03FixedCombinationIdentityAtoms,
    ...batch03FixedCombinationProcedureReviewAtoms,
  ],
};
