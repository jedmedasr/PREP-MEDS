import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesLevemirEvidence } from './diabetes-levemir-evidence.js';

const retrievedAt = '2026-09-26T03:04:08Z';

export const novologLabelReference = { id: 'SRC-B2-NOVOLOG-SPL34', version: 1 } as const;
export const novologMarketingStatusReference = { id: 'SRC-B2-NOVOLOG-PURPLEBOOK-2026-09', version: 1 } as const;

export interface NovoLogProductDefinition {
  medicationId: 'MED-insulin-aspart-novolog-u100';
  brand: 'NovoLog';
  labelledActiveName: 'insulin aspart';
  ingredientId: 'ING-insulin-aspart';
  drugClassId: 'CLS-prandial-insulin';
  concentration: 100;
  aliases: string[];
}

export interface NovoLogPresentationMarketingStatus {
  productNumber: '001' | '002' | '003' | '004' | '005';
  presentation: 'MULTI_DOSE_VIAL' | 'MULTI_DOSE_CARTRIDGE' | 'AUTOINJECTOR';
  status: 'RX' | 'DISCONTINUED';
}

export const novologProductDefinitions: NovoLogProductDefinition[] = [{
  medicationId: 'MED-insulin-aspart-novolog-u100',
  brand: 'NovoLog',
  labelledActiveName: 'insulin aspart',
  ingredientId: 'ING-insulin-aspart',
  drugClassId: 'CLS-prandial-insulin',
  concentration: 100,
  aliases: [
    'NovoLog U-100', 'NovoLog U100', 'NovoLog 100 units/mL',
    'NovoLog vial', 'NovoLog PenFill', 'NovoLog PenFill U-100',
    'NovoLog FlexPen', 'NovoLog FlexPen U-100',
    'NovoLog FlexTouch', 'NovoLog FlexTouch U-100',
    'ReliOn NovoLog', 'ReliOn NovoLog U-100',
  ],
}];

export const novologPresentationMarketingStatuses: NovoLogPresentationMarketingStatus[] = [
  { productNumber: '001', presentation: 'MULTI_DOSE_VIAL', status: 'RX' },
  { productNumber: '002', presentation: 'MULTI_DOSE_CARTRIDGE', status: 'RX' },
  { productNumber: '003', presentation: 'AUTOINJECTOR', status: 'RX' },
  { productNumber: '004', presentation: 'AUTOINJECTOR', status: 'DISCONTINUED' },
  { productNumber: '005', presentation: 'AUTOINJECTOR', status: 'DISCONTINUED' },
];

export const novologSources: SourceDocument[] = [
  {
    ...novologLabelReference,
    sourceType: 'FDA_LABEL',
    title: 'NOVOLOG manufacturer labeling: selected product identity and presentation passages, SPL 34',
    publisher: 'Novo Nordisk; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3a1e73a2-3009-40d0-876c-b4cb2be56fc5',
    externalIdentifier: 'DailyMed SETID 3a1e73a2-3009-40d0-876c-b4cb2be56fc5; SPL version 34; BLA 020986',
    effectiveDate: '2023-02-28',
    language: 'en',
    jurisdiction: 'US',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '3a1e73a2-3009-40d0-876c-b4cb2be56fc5',
      splVersion: 34,
      applicationNumber: 'BLA 020986',
      currentArchivePublishedDate: '2025-01-22',
      labelRevision: '2023-02',
      verificationScope: 'Selected identity, U-100 concentration and presentation passages only; no dosing/device authorization or clinical approval',
      clinicalApprovalGranted: false,
    },
  },
  {
    ...novologMarketingStatusReference,
    sourceType: 'OTHER',
    title: 'FDA Purple Book product details: NovoLog (insulin aspart), BLA 020986',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA Purple Book',
    sourceUrl: 'https://purplebooksearch.fda.gov/',
    externalIdentifier: 'BLA 020986; NovoLog product numbers 001-005',
    publicationDate: '2026-09-11',
    language: 'en',
    jurisdiction: 'US',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'BLA 020986',
      databaseLastUpdated: '2026-09-11',
      listedProductCount: 5,
      presentationStatuses: novologPresentationMarketingStatuses,
      verificationScope: 'FDA Purple Book product-number presentation and marketing-status fields only; no pharmacy inventory claim',
      clinicalApprovalGranted: false,
    },
  },
];

const medicationIds=novologProductDefinitions.map((product)=>product.medicationId);
export const novologAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B2-NOVOLOG-PRODUCT-IDENTITY',
    version: 1,
    source: novologLabelReference,
    claim: 'The identified NOVOLOG manufacturer label names insulin aspart injection at 100 units/mL (U-100) and describes branded vial, PenFill cartridge, FlexPen and FlexTouch presentations. These presentation names support medication reconciliation only and do not establish a patient device, dose or delivery plan.',
    normalizedTopic: 'diabetes-product-formulation-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds:[...medicationIds], contextTags:['product-reconciliation','formulation-confirmation','clinical-review-only'] },
    locator: { section: '3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied' },
    limitations: [
      'This identity record does not provide a periendoscopic hold, restart, patient dose, insulin conversion, pump setting or substitution instruction.',
      'Generic insulin aspart wording must not be used to infer the branded NovoLog manufacturer identity.',
      'Other insulin-aspart products and biosimilars exist; ingredient identity is not brand identity.',
      'Regulatory marketing status is encoded separately at presentation level.',
    ],
    retrieval: {
      title:'NOVOLOG product and formulation identity',
      summary:'Manufacturer labeling identifies NOVOLOG as insulin aspart U-100 and documents vial, cartridge and branded prefilled-pen presentations.',
      keywords:['NovoLog','insulin aspart','U-100','PenFill','FlexPen','FlexTouch'],
      concepts:['medication-identity','formulation-confirmation'],
      sourceAuthorityRank:100,
    },
    lifecycle:'DRAFT',
    createdAt:retrievedAt,
  },
  {
    id: 'EVD-B2-NOVOLOG-US-PRESENTATION-MARKETING-STATUS',
    version: 1,
    source: novologMarketingStatusReference,
    claim: 'The FDA Purple Book product-detail record for BLA 020986 lists NovoLog product 001 multi-dose vial, 002 multi-dose cartridge and 003 autoinjector with marketing status Rx, while autoinjector products 004 and 005 are listed Disc. Mixed presentation-level status is preserved and is not collapsed into a product-wide availability claim.',
    normalizedTopic: 'diabetes-product-market-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds:[...medicationIds], contextTags:['product-reconciliation','us-marketing-status','presentation-status','clinical-review-only'] },
    locator: { section: 'Product Details for NovoLog; Product Number; Product Presentation; Marketing Status' },
    limitations: [
      'Purple Book Rx/Disc status is regulatory product-listing metadata, not a pharmacy inventory lookup.',
      'The source does not establish which autoinjector product number corresponds to a particular branded pen name unless directly stated.',
      'Presentation status cannot trigger substitution, conversion, therapeutic interchange or a transition plan.',
      'Repackager or remaining inventory listings must not be generalized into manufacturer availability.',
    ],
    retrieval: {
      title:'NOVOLOG FDA Purple Book presentation marketing status',
      summary:'FDA Purple Book preserves mixed Rx and Disc status across NovoLog presentation product numbers under BLA 020986.',
      keywords:['NovoLog','insulin aspart','BLA 020986','Purple Book','Rx','Disc'],
      concepts:['medication-market-status','presentation-status'],
      sourceAuthorityRank:100,
    },
    lifecycle:'DRAFT',
    createdAt:retrievedAt,
  },
];

export const diabetesNovoLogEvidence: EvidenceBundle = {
  ...diabetesLevemirEvidence,
  generatedAt:retrievedAt,
  sources:[...diabetesLevemirEvidence.sources,...novologSources],
  atoms:[...diabetesLevemirEvidence.atoms,...novologAtoms],
};
