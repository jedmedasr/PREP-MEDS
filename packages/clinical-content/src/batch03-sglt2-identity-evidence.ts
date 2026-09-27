import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-27T02:29:08Z';

export interface Batch03Sglt2IdentityDefinition {
  medicationId: 'MED-empagliflozin' | 'MED-dapagliflozin' | 'MED-ertugliflozin' | 'MED-bexagliflozin';
  ingredientId: 'ING-empagliflozin' | 'ING-dapagliflozin' | 'ING-ertugliflozin' | 'ING-bexagliflozin';
  genericName: 'empagliflozin' | 'dapagliflozin' | 'ertugliflozin' | 'bexagliflozin';
  brandNames: string[];
  dosageForm: 'TABLET' | 'TABLET, FILM COATED';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch03Sglt2IdentityDefinitions: Batch03Sglt2IdentityDefinition[] = [
  { medicationId: 'MED-empagliflozin', ingredientId: 'ING-empagliflozin', genericName: 'empagliflozin', brandNames: ['Jardiance'], dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B3-JARDIANCE-IDENTITY', version: 1 } },
  { medicationId: 'MED-dapagliflozin', ingredientId: 'ING-dapagliflozin', genericName: 'dapagliflozin', brandNames: ['Farxiga'], dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B3-FARXIGA-IDENTITY', version: 1 } },
  { medicationId: 'MED-ertugliflozin', ingredientId: 'ING-ertugliflozin', genericName: 'ertugliflozin', brandNames: ['Steglatro'], dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B3-STEGLATRO-IDENTITY', version: 1 } },
  { medicationId: 'MED-bexagliflozin', ingredientId: 'ING-bexagliflozin', genericName: 'bexagliflozin', brandNames: [], dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B3-BEXAGLIFLOZIN-IDENTITY', version: 1 } },
];

function source(id: string, title: string, publisher: string, setId: string, splVersion: number, effectiveDate: string, applicationNumber: string, dosageForm: string): SourceDocument {
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
      dosageForm,
      route: 'ORAL',
      verificationScope: 'Current product identity only',
      marketAvailabilityAsserted: false,
      clinicalApprovalGranted: false,
    },
  };
}

export const batch03Sglt2IdentitySources: SourceDocument[] = [
  source('SRC-B3-JARDIANCE-SPL31', 'JARDIANCE (empagliflozin) tablets: current prescribing information, SPL 31', 'Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed', 'faf3dd6a-9cd0-39c2-0d2e-232cb3f67565', 31, '2026-01-30', 'NDA204629', 'TABLET, FILM COATED'),
  source('SRC-B3-FARXIGA-SPL46', 'FARXIGA (dapagliflozin) tablets: current prescribing information, SPL 46', 'AstraZeneca Pharmaceuticals LP; DailyMed', '72ad22ae-efe6-4cd6-a302-98aaee423d69', 46, '2026-06-03', 'NDA202293', 'TABLET, FILM COATED'),
  source('SRC-B3-STEGLATRO-SPL17', 'STEGLATRO (ertugliflozin) tablets: current prescribing information, SPL 17', 'Merck Sharp & Dohme LLC; DailyMed', 'e6f3e718-bb99-48f1-ab94-b9f0af05fed6', 17, '2026-06-03', 'NDA209803', 'TABLET, FILM COATED'),
  source('SRC-B3-BEXAGLIFLOZIN-SPL3', 'Bexagliflozin tablets: current authorized-generic prescribing information, SPL 3', 'Golden State Medical Supply, Inc.; DailyMed', '1a3ba9d5-1009-bad0-e063-6294a90ac4cc', 3, '2026-07-30', 'NDA214373', 'TABLET'),
];

const sourceByMedication: Record<Batch03Sglt2IdentityDefinition['medicationId'], string> = {
  'MED-empagliflozin': 'SRC-B3-JARDIANCE-SPL31',
  'MED-dapagliflozin': 'SRC-B3-FARXIGA-SPL46',
  'MED-ertugliflozin': 'SRC-B3-STEGLATRO-SPL17',
  'MED-bexagliflozin': 'SRC-B3-BEXAGLIFLOZIN-SPL3',
};

export const batch03Sglt2IdentityAtoms: EvidenceAtom[] = batch03Sglt2IdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Current FDA labeling identifies ${product.brandNames[0] ?? product.genericName} as an oral ${product.dosageForm.toLowerCase()} product containing ${product.genericName}.`,
  normalizedTopic: 'batch03-sglt2-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-sglt2-inhibitor'] },
  locator: { section: 'Product Data; Dosage Forms and Strengths' },
  limitations: [
    'Identity evidence does not establish a patient-specific prescription or indication.',
    'Label presence does not establish pharmacy inventory or product-wide commercial availability.',
    'No substitution, dose, peri-procedural action, or restart instruction is authorized by this identity atom.',
  ],
  retrieval: {
    title: `${product.genericName} current product identity`,
    summary: `Current FDA/DailyMed labeling supports source-linked ${product.genericName} product identity.`,
    keywords: [product.genericName, ...product.brandNames, 'SGLT2', 'product identity'],
    concepts: ['medication-identity', 'sglt2-inhibitor'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch03Sglt2IdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03Sglt2IdentitySources,
  atoms: batch03Sglt2IdentityAtoms,
};
