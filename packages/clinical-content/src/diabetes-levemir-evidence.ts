import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesApidraEvidence } from './diabetes-apidra-evidence.js';

const retrievedAt = '2026-09-26T02:59:33Z';

export const levemirLabelReference = { id: 'SRC-B2-LEVEMIR-SPL30', version: 1 } as const;
export const levemirMarketingStatusReference = { id: 'SRC-B2-LEVEMIR-PURPLEBOOK-2026-09', version: 1 } as const;

export interface LevemirProductDefinition {
  medicationId: 'MED-insulin-detemir-levemir-u100';
  brand: 'Levemir';
  labelledActiveName: 'insulin detemir';
  ingredientId: 'ING-insulin-detemir';
  drugClassId: 'CLS-basal-insulin';
  concentration: 100;
  aliases: string[];
}

export const levemirProductDefinitions: LevemirProductDefinition[] = [{
  medicationId: 'MED-insulin-detemir-levemir-u100',
  brand: 'Levemir',
  labelledActiveName: 'insulin detemir',
  ingredientId: 'ING-insulin-detemir',
  drugClassId: 'CLS-basal-insulin',
  concentration: 100,
  aliases: [
    'Levemir U-100', 'Levemir U100', 'Levemir 100 units/mL',
    'Levemir vial', 'Levemir U-100 vial',
    'Levemir FlexPen', 'Levemir FlexPen U-100',
    'Levemir FlexTouch', 'Levemir FlexTouch U-100',
  ],
}];

export const levemirSources: SourceDocument[] = [
  {
    ...levemirLabelReference,
    sourceType: 'FDA_LABEL',
    title: 'LEVEMIR manufacturer labeling: selected product identity and presentation passages, SPL 30',
    publisher: 'Novo Nordisk Inc.; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d38d65c1-25bf-401d-9c7e-a2c3222da8af',
    externalIdentifier: 'DailyMed SETID d38d65c1-25bf-401d-9c7e-a2c3222da8af; SPL version 30; BLA 021536',
    effectiveDate: '2022-12-08',
    language: 'en',
    jurisdiction: 'US',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'd38d65c1-25bf-401d-9c7e-a2c3222da8af',
      splVersion: 30,
      applicationNumber: 'BLA 021536',
      currentArchivePublishedDate: '2025-12-29',
      labelRevision: '2022-12',
      verificationScope: 'Selected identity, concentration, dosage-form and presentation passages only; no clinical approval',
      clinicalApprovalGranted: false,
      note: 'SPL version/publication metadata and the prescribing-information revision/effective time are recorded separately.',
    },
  },
  {
    ...levemirMarketingStatusReference,
    sourceType: 'OTHER',
    title: 'FDA Purple Book product details: Levemir (insulin detemir), BLA 021536',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA Purple Book',
    sourceUrl: 'https://purplebooksearch.fda.gov/',
    externalIdentifier: 'BLA 021536; Levemir product numbers 001-005',
    publicationDate: '2026-09-11',
    language: 'en',
    jurisdiction: 'US',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'BLA 021536',
      databaseLastUpdated: '2026-09-11',
      listedProductCount: 5,
      listedMarketingStatus: 'Disc',
      verificationScope: 'FDA Purple Book marketing-status field only; no claim about residual pharmacy or repackager inventory',
      clinicalApprovalGranted: false,
    },
  },
];

const medicationIds = levemirProductDefinitions.map((product) => product.medicationId);
export const levemirAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B2-LEVEMIR-PRODUCT-IDENTITY',
    version: 1,
    source: levemirLabelReference,
    claim: 'The identified LEVEMIR manufacturer label names insulin detemir injection at 100 units/mL (U-100). Selected label passages describe a 10 mL multiple-dose vial and a 3 mL prefilled pen presentation. Historical label records also include named pen presentations. Product identity and presentation history do not authenticate a patient prescription or authorize a delivery device.',
    normalizedTopic: 'diabetes-product-formulation-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [...medicationIds],
      contextTags: ['product-reconciliation', 'formulation-confirmation', 'clinical-review-only'],
    },
    locator: { section: '3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied' },
    limitations: [
      'This identity record does not provide a periendoscopic hold, restart, patient dose, insulin conversion or substitution instruction.',
      'Presentation names are medication-reconciliation metadata and do not establish which presentation a patient used.',
      'Generic insulin detemir wording must not be used to infer a branded manufacturer product.',
      'Current US marketing status is encoded separately from product identity.',
    ],
    retrieval: {
      title: 'LEVEMIR product and formulation identity',
      summary: 'Manufacturer labeling identifies LEVEMIR as insulin detemir U-100 and documents branded vial and pen presentations.',
      keywords: ['Levemir', 'insulin detemir', 'U-100', 'FlexPen', 'FlexTouch'],
      concepts: ['medication-identity', 'formulation-confirmation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
  {
    id: 'EVD-B2-LEVEMIR-US-MARKETING-STATUS',
    version: 1,
    source: levemirMarketingStatusReference,
    claim: 'The FDA Purple Book product-detail record for BLA 021536 lists Levemir product numbers 001 through 005 with marketing status "Disc". This regulatory marketing-status field is kept separate from historical product identity and does not prove that all residual inventory or repackaged stock is absent.',
    normalizedTopic: 'diabetes-product-market-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [...medicationIds],
      contextTags: ['product-reconciliation', 'us-marketing-status', 'clinical-review-only'],
    },
    locator: { section: 'Product Details for Levemir; Marketing Status' },
    limitations: [
      'FDA Purple Book "Disc" is recorded as the current listed US marketing status; it is not a pharmacy-inventory lookup.',
      'This status does not authorize substitution, conversion, therapeutic interchange, or a transition plan.',
      'Historical LEVEMIR identity remains useful for medication reconciliation and must not be deleted.',
      'Repackager listings must not be generalized into current manufacturer product availability.',
    ],
    retrieval: {
      title: 'LEVEMIR FDA Purple Book marketing status',
      summary: 'FDA Purple Book lists each LEVEMIR product under BLA 021536 with marketing status Disc.',
      keywords: ['Levemir', 'insulin detemir', 'BLA 021536', 'Purple Book', 'Disc'],
      concepts: ['medication-market-status', 'historical-product-reconciliation'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const diabetesLevemirEvidence: EvidenceBundle = {
  ...diabetesApidraEvidence,
  generatedAt: retrievedAt,
  sources: [...diabetesApidraEvidence.sources, ...levemirSources],
  atoms: [...diabetesApidraEvidence.atoms, ...levemirAtoms],
};
