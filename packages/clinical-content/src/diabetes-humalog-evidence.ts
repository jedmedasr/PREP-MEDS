import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesNovoLogEvidence } from './diabetes-novolog-evidence.js';

const retrievedAt = '2026-09-26T12:35:00Z';

export const humalogLabelReference = { id: 'SRC-B2-HUMALOG-SPL87', version: 1 } as const;
export const humalogU100MarketingStatusReference = { id: 'SRC-B2-HUMALOG-U100-PURPLEBOOK-2026-09', version: 1 } as const;
export const humalogU200MarketingStatusReference = { id: 'SRC-B2-HUMALOG-U200-PURPLEBOOK-2026-09', version: 1 } as const;

export interface HumalogProductDefinition {
  medicationId: 'MED-insulin-lispro-humalog-u100' | 'MED-insulin-lispro-humalog-u200';
  brand: 'Humalog';
  labelledActiveName: 'insulin lispro';
  ingredientId: 'ING-insulin-lispro';
  drugClassId: 'CLS-prandial-insulin';
  concentration: 100 | 200;
  aliases: string[];
}

export interface HumalogPresentationMarketingStatus {
  applicationNumber: 'BLA 020563' | 'BLA 205747';
  concentration: 100 | 200;
  productNumber: string;
  presentation: 'MULTI_DOSE_VIAL' | 'MULTI_DOSE_CARTRIDGE' | 'AUTOINJECTOR';
  status: 'RX' | 'DISCONTINUED';
}

export const humalogProductDefinitions: HumalogProductDefinition[] = [
  {
    medicationId:'MED-insulin-lispro-humalog-u100', brand:'Humalog', labelledActiveName:'insulin lispro',
    ingredientId:'ING-insulin-lispro', drugClassId:'CLS-prandial-insulin', concentration:100,
    aliases:['Humalog U-100','Humalog U100','Humalog 100 units/mL','Humalog vial U-100','Humalog cartridge U-100','Humalog KwikPen U-100','Humalog Junior KwikPen U-100','Humalog Tempo Pen U-100'],
  },
  {
    medicationId:'MED-insulin-lispro-humalog-u200', brand:'Humalog', labelledActiveName:'insulin lispro',
    ingredientId:'ING-insulin-lispro', drugClassId:'CLS-prandial-insulin', concentration:200,
    aliases:['Humalog U-200','Humalog U200','Humalog 200 units/mL','Humalog KwikPen U-200'],
  },
];

export const humalogPresentationMarketingStatuses: HumalogPresentationMarketingStatus[] = [
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'001',presentation:'MULTI_DOSE_VIAL',status:'RX'},
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'002',presentation:'MULTI_DOSE_CARTRIDGE',status:'DISCONTINUED'},
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'003',presentation:'AUTOINJECTOR',status:'RX'},
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'004',presentation:'AUTOINJECTOR',status:'RX'},
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'005',presentation:'AUTOINJECTOR',status:'RX'},
  {applicationNumber:'BLA 020563',concentration:100,productNumber:'006',presentation:'MULTI_DOSE_VIAL',status:'RX'},
  {applicationNumber:'BLA 205747',concentration:200,productNumber:'001',presentation:'AUTOINJECTOR',status:'RX'},
  {applicationNumber:'BLA 205747',concentration:200,productNumber:'002',presentation:'AUTOINJECTOR',status:'RX'},
];

export const humalogSources: SourceDocument[] = [
  {
    ...humalogLabelReference, sourceType:'FDA_LABEL',
    title:'HUMALOG manufacturer labeling: U-100 and U-200 product identity, SPL 87',
    publisher:'Eli Lilly and Company; DailyMed', societyOrRegulator:'FDA labeling via DailyMed',
    sourceUrl:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f',
    externalIdentifier:'DailyMed SETID c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f; SPL version 87; BLA 020563 and BLA 205747',
    effectiveDate:'2026-06-16', language:'en', jurisdiction:'US', retrievedAt, lifecycle:'DRAFT',
    metadata:{setId:'c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f',splVersion:87,applicationNumbers:'BLA 020563; BLA 205747',labelRevision:'2026-01',verificationScope:'Identity, concentrations and labelled presentations only; no patient-specific dosing, conversion, substitution or device authorization',clinicalApprovalGranted:false},
  },
  {
    ...humalogU100MarketingStatusReference, sourceType:'OTHER',
    title:'FDA Purple Book product details: Humalog U-100 (insulin lispro), BLA 020563',
    publisher:'U.S. Food and Drug Administration', societyOrRegulator:'FDA Purple Book',
    sourceUrl:'https://purplebooksearch.fda.gov/', externalIdentifier:'BLA 020563; Humalog product numbers 001-006',
    publicationDate:'2026-09-11', language:'en', jurisdiction:'US', retrievedAt, lifecycle:'DRAFT',
    metadata:{applicationNumber:'BLA 020563',databaseLastUpdated:'2026-09-11',listedProductCount:6,presentationStatusSummary:'001:VIAL:Rx; 002:CARTRIDGE:Disc; 003:AUTOINJECTOR:Rx; 004:AUTOINJECTOR:Rx; 005:AUTOINJECTOR:Rx; 006:VIAL:Rx',verificationScope:'Presentation/product-number marketing status only; no pharmacy inventory claim',clinicalApprovalGranted:false},
  },
  {
    ...humalogU200MarketingStatusReference, sourceType:'OTHER',
    title:'FDA Purple Book product details: Humalog U-200 (insulin lispro), BLA 205747',
    publisher:'U.S. Food and Drug Administration', societyOrRegulator:'FDA Purple Book',
    sourceUrl:'https://purplebooksearch.fda.gov/', externalIdentifier:'BLA 205747; Humalog product numbers 001-002',
    publicationDate:'2026-09-11', language:'en', jurisdiction:'US', retrievedAt, lifecycle:'DRAFT',
    metadata:{applicationNumber:'BLA 205747',databaseLastUpdated:'2026-09-11',listedProductCount:2,presentationStatusSummary:'001:AUTOINJECTOR:Rx; 002:AUTOINJECTOR:Rx',verificationScope:'Presentation/product-number marketing status only; no pharmacy inventory claim',clinicalApprovalGranted:false},
  },
];

const u100Ids=['MED-insulin-lispro-humalog-u100'];
const u200Ids=['MED-insulin-lispro-humalog-u200'];
export const humalogAtoms: EvidenceAtom[] = [
  {
    id:'EVD-B2-HUMALOG-PRODUCT-IDENTITY',version:1,source:humalogLabelReference,
    claim:'Current Lilly HUMALOG labeling identifies insulin lispro injection in distinct U-100 and U-200 concentrations. U-100 is supplied in multiple vial, cartridge and prefilled-pen presentations; U-200 is supplied as a prefilled pen. These are product-reconciliation facts only and do not establish a patient dose, device plan or substitution.',
    normalizedTopic:'diabetes-product-formulation-identity',stance:'DESCRIPTIVE',evidenceStrength:'NOT_GRADED',
    applicability:{medicationIds:[...u100Ids,...u200Ids],contextTags:['product-reconciliation','formulation-confirmation','clinical-review-only']},
    locator:{section:'3 Dosage Forms and Strengths; 11 Description; 16 How Supplied/Storage and Handling'},
    limitations:['Generic insulin lispro wording must not authenticate Humalog because other insulin-lispro products exist.','U-100 and U-200 are distinct source-linked identities; concentration must not be discarded.','This record does not provide a peri-procedural hold/restart instruction, insulin conversion, patient dose, substitution or device authorization.','Presentation marketing status is sourced separately from FDA Purple Book.'],
    retrieval:{title:'HUMALOG U-100/U-200 product identity',summary:'Lilly labeling distinguishes HUMALOG insulin lispro U-100 and U-200 and their labelled presentations.',keywords:['Humalog','insulin lispro','U-100','U-200','KwikPen'],concepts:['medication-identity','formulation-confirmation'],sourceAuthorityRank:100},
    lifecycle:'DRAFT',createdAt:retrievedAt,
  },
  {
    id:'EVD-B2-HUMALOG-U100-US-PRESENTATION-MARKETING-STATUS',version:1,source:humalogU100MarketingStatusReference,
    claim:'FDA Purple Book BLA 020563 lists six Humalog U-100 product numbers with mixed presentation-level status: product 002 cartridge is Disc while products 001 and 006 vials and products 003-005 autoinjectors are Rx. The mixed status is preserved rather than collapsed into a product-wide availability flag.',
    normalizedTopic:'diabetes-product-market-status',stance:'DESCRIPTIVE',evidenceStrength:'NOT_GRADED',
    applicability:{medicationIds:u100Ids,contextTags:['product-reconciliation','us-marketing-status','presentation-status','clinical-review-only']},
    locator:{section:'Product Details for Humalog; BLA 020563; Product Number; Product Presentation; Marketing Status'},
    limitations:['Purple Book Rx/Disc status is regulatory listing metadata, not a pharmacy inventory lookup.','A discontinued presentation does not establish that all residual or repackaged inventory is absent.','Status cannot authorize substitution, conversion, device use or a medication transition.'],
    retrieval:{title:'HUMALOG U-100 FDA Purple Book presentation status',summary:'FDA Purple Book preserves mixed Rx/Disc presentation status under BLA 020563.',keywords:['Humalog','U-100','BLA 020563','Purple Book','Rx','Disc'],concepts:['medication-market-status','presentation-status'],sourceAuthorityRank:100},
    lifecycle:'DRAFT',createdAt:retrievedAt,
  },
  {
    id:'EVD-B2-HUMALOG-U200-US-PRESENTATION-MARKETING-STATUS',version:1,source:humalogU200MarketingStatusReference,
    claim:'FDA Purple Book BLA 205747 lists two Humalog U-200 autoinjector product numbers and both are Rx. This regulatory status is presentation metadata and is not an inventory, substitution or device-compatibility determination.',
    normalizedTopic:'diabetes-product-market-status',stance:'DESCRIPTIVE',evidenceStrength:'NOT_GRADED',
    applicability:{medicationIds:u200Ids,contextTags:['product-reconciliation','us-marketing-status','presentation-status','clinical-review-only']},
    locator:{section:'Product Details for Humalog; BLA 205747; Product Number; Product Presentation; Marketing Status'},
    limitations:['Purple Book Rx status is regulatory listing metadata, not a pharmacy inventory lookup.','Status does not authorize substitution, conversion, transfer to another delivery device, or a medication transition.'],
    retrieval:{title:'HUMALOG U-200 FDA Purple Book presentation status',summary:'FDA Purple Book lists both Humalog U-200 autoinjector product numbers as Rx under BLA 205747.',keywords:['Humalog','U-200','BLA 205747','Purple Book','Rx'],concepts:['medication-market-status','presentation-status'],sourceAuthorityRank:100},
    lifecycle:'DRAFT',createdAt:retrievedAt,
  },
];

export const diabetesHumalogEvidence: EvidenceBundle = {
  ...diabetesNovoLogEvidence, generatedAt:retrievedAt,
  sources:[...diabetesNovoLogEvidence.sources,...humalogSources],
  atoms:[...diabetesNovoLogEvidence.atoms,...humalogAtoms],
};
