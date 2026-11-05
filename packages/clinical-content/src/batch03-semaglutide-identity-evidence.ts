import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-27T06:14:00Z';

export interface Batch03SemaglutideIdentityDefinition {
  medicationId:
    | 'MED-semaglutide-ozempic-injection'
    | 'MED-semaglutide-ozempic-oral'
    | 'MED-semaglutide-rybelsus-oral'
    | 'MED-semaglutide-wegovy-injection'
    | 'MED-semaglutide-wegovy-oral';
  ingredientId: 'ING-semaglutide';
  genericName: 'semaglutide';
  brandName: 'Ozempic' | 'Rybelsus' | 'Wegovy';
  dosageForm: 'INJECTION, SOLUTION' | 'TABLET';
  route: 'SUBCUTANEOUS' | 'ORAL';
  aliases: string[];
  evidenceRef: { id: string; version: number };
}

export const batch03SemaglutideIdentityDefinitions: Batch03SemaglutideIdentityDefinition[] = [
  {
    medicationId: 'MED-semaglutide-ozempic-injection',
    ingredientId: 'ING-semaglutide',
    genericName: 'semaglutide',
    brandName: 'Ozempic',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    aliases: ['Ozempic injection', 'Ozempic subcutaneous', 'semaglutide Ozempic injection'],
    evidenceRef: { id: 'EVD-B3-OZEMPIC-INJECTION-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-semaglutide-ozempic-oral',
    ingredientId: 'ING-semaglutide',
    genericName: 'semaglutide',
    brandName: 'Ozempic',
    dosageForm: 'TABLET',
    route: 'ORAL',
    aliases: ['Ozempic tablet', 'Ozempic oral', 'oral Ozempic', 'oral semaglutide Ozempic'],
    evidenceRef: { id: 'EVD-B3-OZEMPIC-ORAL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-semaglutide-rybelsus-oral',
    ingredientId: 'ING-semaglutide',
    genericName: 'semaglutide',
    brandName: 'Rybelsus',
    dosageForm: 'TABLET',
    route: 'ORAL',
    aliases: ['Rybelsus tablet', 'Rybelsus oral', 'oral semaglutide Rybelsus'],
    evidenceRef: { id: 'EVD-B3-RYBELSUS-ORAL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-semaglutide-wegovy-injection',
    ingredientId: 'ING-semaglutide',
    genericName: 'semaglutide',
    brandName: 'Wegovy',
    dosageForm: 'INJECTION, SOLUTION',
    route: 'SUBCUTANEOUS',
    aliases: ['Wegovy injection', 'Wegovy subcutaneous', 'semaglutide Wegovy injection'],
    evidenceRef: { id: 'EVD-B3-WEGOVY-INJECTION-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-semaglutide-wegovy-oral',
    ingredientId: 'ING-semaglutide',
    genericName: 'semaglutide',
    brandName: 'Wegovy',
    dosageForm: 'TABLET',
    route: 'ORAL',
    aliases: ['Wegovy tablet', 'Wegovy oral', 'oral Wegovy', 'oral semaglutide Wegovy'],
    evidenceRef: { id: 'EVD-B3-WEGOVY-ORAL-IDENTITY', version: 1 },
  },
];

function source(
  id: string,
  title: string,
  setId: string,
  splVersion: number,
  effectiveDate: string,
  applicationNumber: string,
  dosageFormsAndRoutes: string,
): SourceDocument {
  return {
    id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title,
    publisher: 'Novo Nordisk; DailyMed',
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
      dosageFormsAndRoutes,
      verificationScope: 'Current semaglutide product and route identity only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
    },
  };
}

export const batch03SemaglutideIdentitySources: SourceDocument[] = [
  source(
    'SRC-B3-OZEMPIC-INJECTION-SPL20',
    'OZEMPIC (semaglutide) injection, for subcutaneous use: manufacturer labeling, SPL 20',
    'adec4fd2-6858-4c99-91d4-531f5f2a2d79',
    20,
    '2026-06-01',
    'NDA209637',
    'INJECTION, SOLUTION / SUBCUTANEOUS',
  ),
  source(
    'SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13',
    'OZEMPIC and RYBELSUS (oral semaglutide) tablets: manufacturer labeling, SPL 13',
    '27f15fac-7d98-4114-a2ec-92494a91da98',
    13,
    '2026-01-30',
    'NDA213051',
    'TABLET / ORAL',
  ),
  source(
    'SRC-B3-WEGOVY-SPL19',
    'WEGOVY (semaglutide) injection and tablet: manufacturer labeling, SPL 19',
    'ee06186f-2aa3-4990-a760-757579d8f77b',
    19,
    '2026-06-18',
    'NDA215256; NDA218316',
    'INJECTION, SOLUTION / SUBCUTANEOUS; TABLET / ORAL',
  ),
];

const sourceByMedication: Record<Batch03SemaglutideIdentityDefinition['medicationId'], string> = {
  'MED-semaglutide-ozempic-injection': 'SRC-B3-OZEMPIC-INJECTION-SPL20',
  'MED-semaglutide-ozempic-oral': 'SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13',
  'MED-semaglutide-rybelsus-oral': 'SRC-B3-OZEMPIC-RYBELSUS-ORAL-SPL13',
  'MED-semaglutide-wegovy-injection': 'SRC-B3-WEGOVY-SPL19',
  'MED-semaglutide-wegovy-oral': 'SRC-B3-WEGOVY-SPL19',
};

function identityAtom(product: Batch03SemaglutideIdentityDefinition): EvidenceAtom {
  return {
    id: product.evidenceRef.id,
    version: product.evidenceRef.version,
    source: { id: sourceByMedication[product.medicationId], version: 1 },
    claim: `Current FDA/DailyMed labeling identifies ${product.brandName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} product containing semaglutide.`,
    normalizedTopic: 'batch03-semaglutide-product-route-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: ['ING-semaglutide'],
      drugClassIds: ['CLS-glp1-receptor-agonist'],
      contextTags: ['product-reconciliation', 'route-formulation', 'clinical-review-only'],
    },
    locator: { section: 'Product Data; Dosage Form; Route of Administration' },
    limitations: [
      'Identity evidence does not establish a patient-specific prescription, indication, dose, schedule, or strength.',
      'Brand name alone is insufficient to select a route when current labeling contains more than one formulation under that brand.',
      'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
    ],
    retrieval: {
      title: `${product.brandName} ${product.route.toLowerCase()} semaglutide identity`,
      summary: `Current FDA/DailyMed labeling supports source-linked ${product.brandName} ${product.route.toLowerCase()} semaglutide product identity.`,
      keywords: [product.genericName, product.brandName, product.route, product.dosageForm, 'GLP-1', 'product identity'],
      concepts: ['medication-identity', 'route-formulation', 'glp1-receptor-agonist'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
}

export const batch03SemaglutideIdentityAtoms: EvidenceAtom[] =
  batch03SemaglutideIdentityDefinitions.map(identityAtom);

export const batch03SemaglutideIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03SemaglutideIdentitySources,
  atoms: batch03SemaglutideIdentityAtoms,
};
