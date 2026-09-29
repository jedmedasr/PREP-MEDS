import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T06:35:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch03HistoricalIncretinIdentityDefinition {
  medicationId: 'MED-lixisenatide-adlyxin' | 'MED-albiglutide-tanzeum';
  ingredientId: 'ING-lixisenatide' | 'ING-albiglutide';
  genericName: 'lixisenatide' | 'albiglutide';
  brandName: 'Adlyxin' | 'Tanzeum';
  dosageForm: 'INJECTION, SOLUTION' | 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION';
  route: 'SUBCUTANEOUS';
  formulation?: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  indicationBoundary: 'DIABETES';
  historical: true;
  evidenceRef: { id: string; version: number };
  marketingStatusEvidenceRef: { id: string; version: number };
}

export const batch03HistoricalIncretinIdentityDefinitions: Batch03HistoricalIncretinIdentityDefinition[] = [
  {
    medicationId: 'MED-lixisenatide-adlyxin',
    ingredientId: 'ING-lixisenatide',
    genericName: 'lixisenatide',
    brandName: 'Adlyxin',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    historical: true,
    evidenceRef: { id: 'EVD-B3-ADLYXIN-IDENTITY', version: 1 },
    marketingStatusEvidenceRef: { id: 'EVD-B3-ADLYXIN-US-MARKETING-STATUS', version: 1 },
  },
  {
    medicationId: 'MED-albiglutide-tanzeum',
    ingredientId: 'ING-albiglutide',
    genericName: 'albiglutide',
    brandName: 'Tanzeum',
    dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION',
    route: 'SUBCUTANEOUS',
    indicationBoundary: 'DIABETES',
    historical: true,
    evidenceRef: { id: 'EVD-B3-TANZEUM-IDENTITY', version: 1 },
    marketingStatusEvidenceRef: { id: 'EVD-B3-TANZEUM-US-MARKETING-STATUS', version: 1 },
  },
];

export const batch03HistoricalIncretinIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-B3-ADLYXIN-SPL13',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'ADLYXIN (lixisenatide) injection: searchable manufacturer labeling, SPL 13',
    publisher: 'sanofi-aventis U.S. LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2024-01-16',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1727cc16-4f86-4f13-b8b5-804d4984fa8c',
    externalIdentifier: 'DailyMed SETID 1727cc16-4f86-4f13-b8b5-804d4984fa8c; SPL version 13; BLA208471',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '1727cc16-4f86-4f13-b8b5-804d4984fa8c',
      splVersion: 13,
      applicationNumber: 'BLA208471',
      route: 'SUBCUTANEOUS',
      dosageForm: 'INJECTION, SOLUTION',
      labelRevision: '2024-01',
      historicalProduct: true,
      verificationScope: 'Historical branded product/formulation identity only; regulatory marketing status is represented separately',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-ADLYXIN-PURPLEBOOK-2026-09',
    version: 1,
    sourceType: 'OTHER',
    title: 'FDA Purple Book product details: Adlyxin (lixisenatide), BLA208471',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA Purple Book',
    sourceUrl: 'https://purplebooksearch.fda.gov/index.cfm?blaNo=208471&event=productdetails',
    externalIdentifier: 'BLA208471; Adlyxin product numbers 001-002',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'BLA208471',
      applicant: 'Sanofi-Aventis U.S. LLC',
      productNumbers: '001,002',
      listedMarketingStatus: 'Disc',
      verificationScope: 'FDA Purple Book presentation-level regulatory marketing status only; no real-time inventory or availability claim',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-TANZEUM-SPL17',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'TANZEUM (albiglutide) injection: historical manufacturer labeling, SPL 17',
    publisher: 'GlaxoSmithKline LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2017-12-20',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5fcad939-76e7-49cf-af94-4e6aef17901f',
    externalIdentifier: 'DailyMed SETID 5fcad939-76e7-49cf-af94-4e6aef17901f; SPL version 17; BLA125431',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '5fcad939-76e7-49cf-af94-4e6aef17901f',
      splVersion: 17,
      applicationNumber: 'BLA125431',
      route: 'SUBCUTANEOUS',
      dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION',
      labelRevision: '2017-12',
      historicalProduct: true,
      verificationScope: 'Historical branded product/formulation identity only; regulatory marketing status is represented separately',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-TANZEUM-PURPLEBOOK-2026-09',
    version: 1,
    sourceType: 'OTHER',
    title: 'FDA Purple Book product details: Tanzeum (albiglutide), BLA125431',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA Purple Book',
    sourceUrl: 'https://purplebooksearch.fda.gov/index.cfm?blaNo=125431&event=productdetails',
    externalIdentifier: 'BLA125431; Tanzeum product numbers 001-002',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'BLA125431',
      applicant: 'GSK LLC',
      productNumbers: '001,002',
      listedMarketingStatus: 'Disc',
      verificationScope: 'FDA Purple Book presentation-level regulatory marketing status only; no real-time inventory or availability claim',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
];

const labelSourceByMedication: Record<Batch03HistoricalIncretinIdentityDefinition['medicationId'], string> = {
  'MED-lixisenatide-adlyxin': 'SRC-B3-ADLYXIN-SPL13',
  'MED-albiglutide-tanzeum': 'SRC-B3-TANZEUM-SPL17',
};

export const batch03HistoricalIncretinIdentityAtoms: EvidenceAtom[] =
  batch03HistoricalIncretinIdentityDefinitions.map((product) => ({
    id: product.evidenceRef.id,
    version: product.evidenceRef.version,
    source: { id: labelSourceByMedication[product.medicationId], version: 1 },
    claim: `Historical FDA/DailyMed labeling identifies ${product.brandName} as a subcutaneous ${product.dosageForm.toLowerCase()} product containing ${product.genericName}; PREP-MEDS preserves this product/formulation identity for medication reconciliation without asserting current availability.`,
    normalizedTopic: 'batch03-historical-incretin-product-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [product.ingredientId],
      contextTags: ['historical-product', 'glp1', 'product-reconciliation', 'clinical-review-only'],
    },
    locator: { section: 'Product Data; Dosage Forms and Strengths; Route of Administration' },
    limitations: [
      'Historical identity evidence does not establish a current patient prescription, current commercial availability, dose, schedule, or indication.',
      'Ingredient identity alone does not authenticate the historical branded product.',
      'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
    ],
    retrieval: {
      title: `${product.brandName} ${product.genericName} historical product identity`,
      summary: `Historical FDA/DailyMed labeling supports source-linked ${product.brandName} identity while current regulatory marketing status is represented separately.`,
      keywords: [product.genericName, product.brandName, product.route, 'GLP-1', 'historical product'],
      concepts: ['medication-identity', 'historical-product-reconciliation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  }));

export const batch03HistoricalIncretinMarketingStatusAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B3-ADLYXIN-US-MARKETING-STATUS',
    version: 1,
    source: { id: 'SRC-B3-ADLYXIN-PURPLEBOOK-2026-09', version: 1 },
    claim: 'FDA Purple Book product details for BLA208471 list both Adlyxin product presentations (001 and 002) with marketing status "Disc". PREP-MEDS records that regulatory status separately from historical product identity and does not infer real-time pharmacy inventory or availability.',
    normalizedTopic: 'batch03-historical-incretin-market-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-lixisenatide-adlyxin'],
      ingredientIds: ['ING-lixisenatide'],
      contextTags: ['historical-product', 'us-marketing-status', 'clinical-review-only'],
    },
    locator: { section: 'Product Details for Adlyxin; Marketing Status' },
    limitations: [
      'Purple Book "Disc" is a regulatory marketing-status field, not a real-time pharmacy or wholesaler inventory check.',
      'The status does not authorize substitution, conversion, therapeutic interchange, or a transition plan.',
      'No peri-procedural hold/continue/restart timing instruction is authorized by this marketing-status evidence.',
    ],
    retrieval: {
      title: 'Adlyxin FDA Purple Book marketing status',
      summary: 'FDA Purple Book lists both Adlyxin presentations under BLA208471 with marketing status Disc.',
      keywords: ['Adlyxin', 'lixisenatide', 'BLA208471', 'Purple Book', 'Disc'],
      concepts: ['medication-market-status', 'historical-product-reconciliation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
  {
    id: 'EVD-B3-TANZEUM-US-MARKETING-STATUS',
    version: 1,
    source: { id: 'SRC-B3-TANZEUM-PURPLEBOOK-2026-09', version: 1 },
    claim: 'FDA Purple Book product details for BLA125431 list both Tanzeum product presentations (001 and 002) with marketing status "Disc". PREP-MEDS records that regulatory status separately from historical product identity and does not infer real-time pharmacy inventory or availability.',
    normalizedTopic: 'batch03-historical-incretin-market-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: ['MED-albiglutide-tanzeum'],
      ingredientIds: ['ING-albiglutide'],
      contextTags: ['historical-product', 'us-marketing-status', 'clinical-review-only'],
    },
    locator: { section: 'Product Details for Tanzeum; Marketing Status' },
    limitations: [
      'Purple Book "Disc" is a regulatory marketing-status field, not a real-time pharmacy or wholesaler inventory check.',
      'The status does not authorize substitution, conversion, therapeutic interchange, or a transition plan.',
      'No peri-procedural hold/continue/restart timing instruction is authorized by this marketing-status evidence.',
    ],
    retrieval: {
      title: 'Tanzeum FDA Purple Book marketing status',
      summary: 'FDA Purple Book lists both Tanzeum presentations under BLA125431 with marketing status Disc.',
      keywords: ['Tanzeum', 'albiglutide', 'BLA125431', 'Purple Book', 'Disc'],
      concepts: ['medication-market-status', 'historical-product-reconciliation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const batch03HistoricalIncretinReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B3-HISTORICAL-GLP1-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Historical standalone GLP-1 product requires clinician review pending GLP-1 policy adjudication',
    scope: {
      medicationIds: [
        'MED-lixisenatide-adlyxin',
        'MED-albiglutide-tanzeum',
      ],
      procedureCodes: [...procedures],
    },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-GLP1-HIGH-RISK-REVIEW-2024', version: 1 }],
    status: 'TECHNICALLY_TESTED',
    priority: 50,
  },
];

export const batch03HistoricalIncretinIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03HistoricalIncretinIdentitySources,
  atoms: [
    ...batch03HistoricalIncretinIdentityAtoms,
    ...batch03HistoricalIncretinMarketingStatusAtoms,
  ],
};
