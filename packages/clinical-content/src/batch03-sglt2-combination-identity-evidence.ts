import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-27T10:25:00Z';

export interface Batch03Sglt2CombinationIdentityDefinition {
  medicationId:
    | 'MED-empagliflozin-linagliptin-glyxambi'
    | 'MED-dapagliflozin-metformin-xigduo-xr'
    | 'MED-ertugliflozin-metformin-segluromet'
    | 'MED-ertugliflozin-sitagliptin-steglujan'
    | 'MED-empagliflozin-metformin-synjardy'
    | 'MED-empagliflozin-metformin-synjardy-xr'
    | 'MED-empagliflozin-linagliptin-metformin-trijardy-xr';
  ingredientIds: string[];
  genericName: string;
  brandName: 'Glyxambi' | 'Xigduo XR' | 'Segluromet' | 'Steglujan' | 'Synjardy' | 'Synjardy XR' | 'Trijardy XR';
  dosageForm: 'TABLET, FILM COATED' | 'TABLET, FILM COATED, EXTENDED RELEASE';
  release: 'IMMEDIATE' | 'EXTENDED';
  evidenceRef: { id: string; version: number };
  reviewEvidenceRef: { id: string; version: number };
}

export const batch03Sglt2CombinationIdentityDefinitions: Batch03Sglt2CombinationIdentityDefinition[] = [
  {
    medicationId: 'MED-empagliflozin-linagliptin-glyxambi',
    ingredientIds: ['ING-empagliflozin', 'ING-linagliptin'],
    genericName: 'empagliflozin and linagliptin',
    brandName: 'Glyxambi',
    dosageForm: 'TABLET, FILM COATED',
    release: 'IMMEDIATE',
    evidenceRef: { id: 'EVD-B3-GLYXAMBI-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-GLYXAMBI-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-dapagliflozin-metformin-xigduo-xr',
    ingredientIds: ['ING-dapagliflozin', 'ING-metformin'],
    genericName: 'dapagliflozin and metformin hydrochloride',
    brandName: 'Xigduo XR',
    dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE',
    release: 'EXTENDED',
    evidenceRef: { id: 'EVD-B3-XIGDUO-XR-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-XIGDUO-XR-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-ertugliflozin-metformin-segluromet',
    ingredientIds: ['ING-ertugliflozin', 'ING-metformin'],
    genericName: 'ertugliflozin and metformin hydrochloride',
    brandName: 'Segluromet',
    dosageForm: 'TABLET, FILM COATED',
    release: 'IMMEDIATE',
    evidenceRef: { id: 'EVD-B3-SEGLUROMET-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-SEGLUROMET-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-ertugliflozin-sitagliptin-steglujan',
    ingredientIds: ['ING-ertugliflozin', 'ING-sitagliptin'],
    genericName: 'ertugliflozin and sitagliptin',
    brandName: 'Steglujan',
    dosageForm: 'TABLET, FILM COATED',
    release: 'IMMEDIATE',
    evidenceRef: { id: 'EVD-B3-STEGLUJAN-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-STEGLUJAN-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-empagliflozin-metformin-synjardy',
    ingredientIds: ['ING-empagliflozin', 'ING-metformin'],
    genericName: 'empagliflozin and metformin hydrochloride',
    brandName: 'Synjardy',
    dosageForm: 'TABLET, FILM COATED',
    release: 'IMMEDIATE',
    evidenceRef: { id: 'EVD-B3-SYNJARDY-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-SYNJARDY-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-empagliflozin-metformin-synjardy-xr',
    ingredientIds: ['ING-empagliflozin', 'ING-metformin'],
    genericName: 'empagliflozin and metformin hydrochloride',
    brandName: 'Synjardy XR',
    dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE',
    release: 'EXTENDED',
    evidenceRef: { id: 'EVD-B3-SYNJARDY-XR-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-SYNJARDY-XR-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-empagliflozin-linagliptin-metformin-trijardy-xr',
    ingredientIds: ['ING-empagliflozin', 'ING-linagliptin', 'ING-metformin'],
    genericName: 'empagliflozin, linagliptin, and metformin hydrochloride',
    brandName: 'Trijardy XR',
    dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE',
    release: 'EXTENDED',
    evidenceRef: { id: 'EVD-B3-TRIJARDY-XR-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-TRIJARDY-XR-PROCEDURE-REVIEW', version: 1 },
  },
];

const sourceData = [
  ['SRC-B3-GLYXAMBI-SPL23','GLYXAMBI (empagliflozin and linagliptin) tablets: current manufacturer labeling, SPL 23','Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed','ddbab689-f76c-488c-9613-4168d41dd730',23,'2026-01-20','NDA206073'],
  ['SRC-B3-XIGDUO-XR-SPL40','XIGDUO XR (dapagliflozin and metformin hydrochloride extended-release) tablets: current manufacturer labeling, SPL 40','AstraZeneca Pharmaceuticals LP; DailyMed','ac8a0f7b-9f69-4495-abbc-3a47cd75a859',40,'2026-08-11','NDA205649'],
  ['SRC-B3-SEGLUROMET-SPL20','SEGLUROMET (ertugliflozin and metformin hydrochloride) tablets: current manufacturer labeling, SPL 20','Merck Sharp & Dohme LLC; DailyMed','a6aeb99a-ce49-4125-90ce-642df3f1ebad',20,'2026-08-11','NDA209806'],
  ['SRC-B3-STEGLUJAN-SPL24','STEGLUJAN (ertugliflozin and sitagliptin) tablets: current manufacturer labeling, SPL 24','Merck Sharp & Dohme LLC; DailyMed','c2c553d8-5a9d-4366-bf53-8bdb5a876d19',24,'2026-06-03','NDA209805'],
  ['SRC-B3-SYNJARDY-SPL23','SYNJARDY (empagliflozin and metformin hydrochloride) tablets: current manufacturer labeling, SPL 23','Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed','0fdd0255-0055-65f3-b2c0-db8fbb87beae',23,'2026-08-25','NDA206111'],
  ['SRC-B3-SYNJARDY-XR-SPL18','SYNJARDY XR (empagliflozin and metformin hydrochloride extended-release) tablets: current manufacturer labeling, SPL 18','Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed','8006ba29-ee3a-f852-a9bb-c8ec9b41cf66',18,'2026-08-11','NDA208658'],
  ['SRC-B3-TRIJARDY-XR-SPL11','TRIJARDY XR (empagliflozin, linagliptin, and metformin hydrochloride extended-release) tablets: current manufacturer labeling, SPL 11','Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed','71873567-9594-452a-bb92-34a129adecac',11,'2026-08-24','NDA212614'],
] as const;

export const batch03Sglt2CombinationIdentitySources: SourceDocument[] = sourceData.map(
  ([id,title,publisher,setId,splVersion,effectiveDate,applicationNumber]) => ({
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
      route: 'ORAL',
      verificationScope: 'Current product/formulation identity and procedure-review provenance only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  }),
);

const sourceByMedication: Record<string,string> = {
  'MED-empagliflozin-linagliptin-glyxambi': 'SRC-B3-GLYXAMBI-SPL23',
  'MED-dapagliflozin-metformin-xigduo-xr': 'SRC-B3-XIGDUO-XR-SPL40',
  'MED-ertugliflozin-metformin-segluromet': 'SRC-B3-SEGLUROMET-SPL20',
  'MED-ertugliflozin-sitagliptin-steglujan': 'SRC-B3-STEGLUJAN-SPL24',
  'MED-empagliflozin-metformin-synjardy': 'SRC-B3-SYNJARDY-SPL23',
  'MED-empagliflozin-metformin-synjardy-xr': 'SRC-B3-SYNJARDY-XR-SPL18',
  'MED-empagliflozin-linagliptin-metformin-trijardy-xr': 'SRC-B3-TRIJARDY-XR-SPL11',
};

function identityAtom(product: Batch03Sglt2CombinationIdentityDefinition): EvidenceAtom {
  return {
    id: product.evidenceRef.id,
    version: 1,
    source: { id: sourceByMedication[product.medicationId]!, version: 1 },
    claim: `Current manufacturer labeling identifies ${product.brandName} as an oral ${product.release.toLowerCase()}-release fixed-combination product containing ${product.genericName}; PREP-MEDS uses this only for product, formulation, and component identity.`,
    normalizedTopic: 'batch03-sglt2-combination-product-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, contextTags: ['fixed-combination','sglt2','product-reconciliation'] },
    locator: { section: 'Indications and Usage; Dosage Forms and Strengths; Product Data' },
    limitations: [
      'Identity evidence does not authorize substitution, component splitting, patient-specific dosing, or peri-procedural instructions.',
      'Immediate-release and extended-release formulations remain distinct when the manufacturer label distinguishes them.',
      'No pharmacy-inventory or market-availability inference is authorized.',
    ],
    retrieval: { title: `${product.brandName} identity`, summary: 'Current manufacturer product/formulation identity.', keywords: [product.brandName, product.genericName, 'SGLT2 combination'], concepts: ['medication-identity','fixed-combination'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

function reviewAtom(product: Batch03Sglt2CombinationIdentityDefinition): EvidenceAtom {
  return {
    id: product.reviewEvidenceRef.id,
    version: 1,
    source: { id: sourceByMedication[product.medicationId]!, version: 1 },
    claim: `Current ${product.brandName} labeling contains temporary-interruption language for surgery or procedures associated with prolonged fasting; PREP-MEDS preserves that source provenance but requires clinician review rather than converting it into autonomous endoscopy timing.`,
    normalizedTopic: 'batch03-sglt2-combination-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, contextTags: ['sglt2','fixed-combination','procedure-review','clinical-review-only'] },
    locator: { section: 'Dosage and Administration — Temporary Interruption for Surgery' },
    limitations: [
      'The label language is not treated as a universal endoscopy policy or a substitute for local clinical adjudication.',
      'PREP-MEDS does not infer component-specific instructions from the fixed-combination product.',
      'This atom authorizes review routing only; it does not authorize a hold/continue/restart timing rule.',
    ],
    retrieval: { title: `${product.brandName} procedure review`, summary: 'Manufacturer interruption language is retained as review provenance without autonomous timing.', keywords: [product.brandName,'temporary interruption','prolonged fasting','procedure review'], concepts: ['procedure-review','sglt2','fixed-combination'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

export const batch03Sglt2CombinationIdentityAtoms = batch03Sglt2CombinationIdentityDefinitions.map(identityAtom);
export const batch03Sglt2CombinationProcedureReviewAtoms = batch03Sglt2CombinationIdentityDefinitions.map(reviewAtom);

export const batch03Sglt2CombinationIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03Sglt2CombinationIdentitySources,
  atoms: [...batch03Sglt2CombinationIdentityAtoms, ...batch03Sglt2CombinationProcedureReviewAtoms],
};
