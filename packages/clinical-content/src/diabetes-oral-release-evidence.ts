import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesHumalogEvidence } from './diabetes-humalog-evidence.js';

const retrievedAt = '2026-09-26T12:50:57Z';

export const metforminImmediateReleaseReference = { id: 'SRC-B2-METFORMIN-IR-SPL15', version: 1 } as const;
export const metforminExtendedReleaseReference = { id: 'SRC-B2-METFORMIN-ER-SPL15', version: 1 } as const;
export const glipizideImmediateReleaseReference = { id: 'SRC-B2-GLIPIZIDE-IR-SPL8', version: 1 } as const;
export const glipizideExtendedReleaseReference = { id: 'SRC-B2-GLIPIZIDE-ER-SPL101', version: 1 } as const;
export const glucotrolXlReference = { id: 'SRC-B2-GLUCOTROL-XL-SPL28', version: 1 } as const;

export interface OralReleaseProductDefinition {
  medicationId: 'MED-metformin-ir' | 'MED-metformin-er' | 'MED-glipizide-ir' | 'MED-glipizide-er';
  genericName: 'metformin' | 'glipizide';
  ingredientId: 'ING-metformin' | 'ING-glipizide';
  drugClassId: 'CLS-metformin' | 'CLS-sulfonylurea';
  releaseForm: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  dosageForm: 'TABLET';
  route: 'ORAL';
  brandNames: string[];
  aliases: string[];
  evidenceRefs: Array<{ id: string; version: number }>;
}

export const oralReleaseProductDefinitions: OralReleaseProductDefinition[] = [
  {
    medicationId: 'MED-metformin-ir', genericName: 'metformin', ingredientId: 'ING-metformin',
    drugClassId: 'CLS-metformin', releaseForm: 'IMMEDIATE_RELEASE', dosageForm: 'TABLET', route: 'ORAL',
    brandNames: [],
    aliases: ['metformin IR', 'metformin immediate release', 'metformin immediate-release', 'metformin hydrochloride tablet', 'metformin HCl IR'],
    evidenceRefs: [{ id: 'EVD-B2-METFORMIN-IR-IDENTITY', version: 1 }],
  },
  {
    medicationId: 'MED-metformin-er', genericName: 'metformin', ingredientId: 'ING-metformin',
    drugClassId: 'CLS-metformin', releaseForm: 'EXTENDED_RELEASE', dosageForm: 'TABLET', route: 'ORAL',
    brandNames: [],
    aliases: ['metformin ER', 'metformin XR', 'metformin extended release', 'metformin extended-release', 'metformin HCl ER', 'metformin HCl XR', 'metformin hydrochloride extended release'],
    evidenceRefs: [{ id: 'EVD-B2-METFORMIN-ER-IDENTITY', version: 1 }],
  },
  {
    medicationId: 'MED-glipizide-ir', genericName: 'glipizide', ingredientId: 'ING-glipizide',
    drugClassId: 'CLS-sulfonylurea', releaseForm: 'IMMEDIATE_RELEASE', dosageForm: 'TABLET', route: 'ORAL',
    brandNames: [],
    aliases: ['glipizide IR', 'glipizide immediate release', 'glipizide immediate-release', 'glipizide tablet'],
    evidenceRefs: [{ id: 'EVD-B2-GLIPIZIDE-IR-IDENTITY', version: 1 }],
  },
  {
    medicationId: 'MED-glipizide-er', genericName: 'glipizide', ingredientId: 'ING-glipizide',
    drugClassId: 'CLS-sulfonylurea', releaseForm: 'EXTENDED_RELEASE', dosageForm: 'TABLET', route: 'ORAL',
    brandNames: ['Glucotrol XL'],
    aliases: ['glipizide ER', 'glipizide XL', 'glipizide extended release', 'glipizide extended-release', 'Glucotrol XL extended release'],
    evidenceRefs: [
      { id: 'EVD-B2-GLIPIZIDE-ER-IDENTITY', version: 1 },
      { id: 'EVD-B2-GLUCOTROL-XL-IDENTITY', version: 1 },
    ],
  },
];

export const oralReleaseSources: SourceDocument[] = [
  {
    ...metforminImmediateReleaseReference, sourceType: 'FDA_LABEL',
    title: 'Metformin hydrochloride tablets: immediate-release product identity, SPL 15',
    publisher: 'Granules India Limited; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8cd5555c-f6b2-28d8-e053-2a95a90a5f1e',
    externalIdentifier: 'DailyMed SETID 8cd5555c-f6b2-28d8-e053-2a95a90a5f1e; SPL version 15; ANDA090564',
    effectiveDate: '2026-06-29', language: 'en', jurisdiction: 'US', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '8cd5555c-f6b2-28d8-e053-2a95a90a5f1e', splVersion: 15, applicationNumber: 'ANDA090564', dosageForm: 'TABLET', route: 'ORAL', verificationScope: 'Immediate-release metformin product/formulation identity only', clinicalApprovalGranted: false },
  },
  {
    ...metforminExtendedReleaseReference, sourceType: 'FDA_LABEL',
    title: 'Metformin hydrochloride extended-release tablets: product identity, SPL 15',
    publisher: 'PD-Rx Pharmaceuticals; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9171d369-d35a-40e4-a9ad-26484e66fc5e',
    externalIdentifier: 'DailyMed SETID 9171d369-d35a-40e4-a9ad-26484e66fc5e; SPL version 15; ANDA201991',
    effectiveDate: '2026-07-29', language: 'en', jurisdiction: 'US', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '9171d369-d35a-40e4-a9ad-26484e66fc5e', splVersion: 15, applicationNumber: 'ANDA201991', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', sourceNdc: '67877-159', verificationScope: 'Extended-release metformin product/formulation identity only', clinicalApprovalGranted: false },
  },
  {
    ...glipizideImmediateReleaseReference, sourceType: 'FDA_LABEL',
    title: 'Glipizide tablets USP: immediate-release product identity, SPL 8',
    publisher: 'ANI Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=252ba4e0-8dc3-43e3-be00-32570dc095bd',
    externalIdentifier: 'DailyMed SETID 252ba4e0-8dc3-43e3-be00-32570dc095bd; SPL version 8; ANDA074497',
    effectiveDate: '2026-07-13', language: 'en', jurisdiction: 'US', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '252ba4e0-8dc3-43e3-be00-32570dc095bd', splVersion: 8, applicationNumber: 'ANDA074497', dosageForm: 'TABLET', route: 'ORAL', verificationScope: 'Immediate-release glipizide product/formulation identity only', clinicalApprovalGranted: false },
  },
  {
    ...glipizideExtendedReleaseReference, sourceType: 'FDA_LABEL',
    title: 'Glipizide extended-release tablets: generic extended-release product identity, SPL 101',
    publisher: 'Bryant Ranch Prepack; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4afa67b2-7f86-4189-93a5-6a605f74540d',
    externalIdentifier: 'DailyMed SETID 4afa67b2-7f86-4189-93a5-6a605f74540d; SPL version 101; ANDA206928',
    effectiveDate: '2026-04-09', language: 'en', jurisdiction: 'US', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '4afa67b2-7f86-4189-93a5-6a605f74540d', splVersion: 101, applicationNumber: 'ANDA206928', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', sourceNdc: '59651-781', verificationScope: 'Generic extended-release glipizide formulation identity only', clinicalApprovalGranted: false },
  },
  {
    ...glucotrolXlReference, sourceType: 'FDA_LABEL',
    title: 'GLUCOTROL XL (glipizide) extended-release tablets: branded formulation identity, SPL 28',
    publisher: 'Roerig; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=eed99b60-d043-4249-9b2a-f05e46fb588d',
    externalIdentifier: 'DailyMed SETID eed99b60-d043-4249-9b2a-f05e46fb588d; SPL version 28; NDA020329',
    effectiveDate: '2026-07-21', language: 'en', jurisdiction: 'US', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: 'eed99b60-d043-4249-9b2a-f05e46fb588d', splVersion: 28, applicationNumber: 'NDA020329', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', verificationScope: 'GLUCOTROL XL branded extended-release identity only; no availability claim', clinicalApprovalGranted: false },
  },
];

export const oralReleaseAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B2-METFORMIN-IR-IDENTITY', version: 1, source: metforminImmediateReleaseReference,
    claim: 'Current DailyMed labeling identifies metformin hydrochloride as an oral TABLET product without an extended-release dosage-form designation. PREP-MEDS uses this source only to distinguish an immediate-release metformin identity from release-unspecified and extended-release records.',
    normalizedTopic: 'diabetes-product-formulation-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-metformin-ir'], contextTags: ['product-reconciliation', 'release-form', 'clinical-review-only'] },
    locator: { section: 'Product Data; Dosage Form; Route of Administration' },
    limitations: ['This identity record does not establish a patient dose, schedule, peri-procedural action, substitution, conversion or pharmacy availability.', 'Unqualified metformin wording remains release-form ambiguous.'],
    retrieval: { title: 'Metformin immediate-release identity', summary: 'DailyMed product data distinguishes oral metformin TABLET from extended-release tablet labeling.', keywords: ['metformin', 'immediate release', 'tablet', 'ANDA090564'], concepts: ['medication-identity', 'release-form'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B2-METFORMIN-ER-IDENTITY', version: 1, source: metforminExtendedReleaseReference,
    claim: 'Current DailyMed labeling identifies metformin hydrochloride as an oral TABLET, EXTENDED RELEASE product. PREP-MEDS uses this source only for extended-release formulation identity.',
    normalizedTopic: 'diabetes-product-formulation-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-metformin-er'], contextTags: ['product-reconciliation', 'release-form', 'clinical-review-only'] },
    locator: { section: 'Product Data; Dosage Form; Route of Administration' },
    limitations: ['Label switching or dosing language is not encoded as a PREP-MEDS action.', 'This record does not authorize dose conversion, substitution, hold/restart timing or availability inference.', 'Unqualified metformin wording remains release-form ambiguous.'],
    retrieval: { title: 'Metformin extended-release identity', summary: 'DailyMed product data identifies oral metformin TABLET, EXTENDED RELEASE.', keywords: ['metformin', 'ER', 'XR', 'extended release', 'ANDA201991'], concepts: ['medication-identity', 'release-form'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B2-GLIPIZIDE-IR-IDENTITY', version: 1, source: glipizideImmediateReleaseReference,
    claim: 'Current ANI/DailyMed labeling identifies glipizide as an oral TABLET product without an extended-release dosage-form designation. PREP-MEDS uses this source only to distinguish an immediate-release glipizide identity.',
    normalizedTopic: 'diabetes-product-formulation-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-glipizide-ir'], contextTags: ['product-reconciliation', 'release-form', 'clinical-review-only'] },
    locator: { section: 'Product Data; Description; How Supplied' },
    limitations: ['This record does not establish a patient dose, schedule, peri-procedural action, substitution, conversion or pharmacy availability.', 'Unqualified glipizide wording remains release-form ambiguous.'],
    retrieval: { title: 'Glipizide immediate-release identity', summary: 'Current ANI/DailyMed product data distinguishes oral glipizide TABLET from extended-release formulations.', keywords: ['glipizide', 'immediate release', 'tablet', 'ANDA074497'], concepts: ['medication-identity', 'release-form'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B2-GLIPIZIDE-ER-IDENTITY', version: 1, source: glipizideExtendedReleaseReference,
    claim: 'Current DailyMed labeling identifies generic glipizide as an oral TABLET, EXTENDED RELEASE product. PREP-MEDS uses this source only for generic extended-release formulation identity.',
    normalizedTopic: 'diabetes-product-formulation-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-glipizide-er'], contextTags: ['product-reconciliation', 'release-form', 'clinical-review-only'] },
    locator: { section: 'Product Data; Dosage Form; Route of Administration' },
    limitations: ['Label switching or dosing language is not encoded as a PREP-MEDS action.', 'This record does not authorize dose conversion, substitution, hold/restart timing or availability inference.'],
    retrieval: { title: 'Glipizide extended-release identity', summary: 'DailyMed product data identifies generic oral glipizide TABLET, EXTENDED RELEASE.', keywords: ['glipizide', 'ER', 'XL', 'extended release', 'ANDA206928'], concepts: ['medication-identity', 'release-form'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B2-GLUCOTROL-XL-IDENTITY', version: 1, source: glucotrolXlReference,
    claim: 'Current Roerig/DailyMed labeling identifies GLUCOTROL XL as glipizide extended-release tablets. PREP-MEDS uses this source to authenticate the explicit GLUCOTROL XL alias to the glipizide extended-release identity, not to infer release form from unqualified Glucotrol wording.',
    normalizedTopic: 'diabetes-product-formulation-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-glipizide-er'], contextTags: ['product-reconciliation', 'brand-alias', 'release-form', 'clinical-review-only'] },
    locator: { section: 'Product Data; 3 Dosage Forms and Strengths; 16 How Supplied/Storage and Handling' },
    limitations: ['This source does not create a product-wide market-availability assertion.', 'Unqualified Glucotrol remains release-form unspecified in the catalog.', 'No dose, substitution, conversion, peri-procedural action or pharmacy-inventory claim is encoded.'],
    retrieval: { title: 'GLUCOTROL XL extended-release identity', summary: 'Current Roerig/DailyMed labeling authenticates GLUCOTROL XL as branded glipizide extended release.', keywords: ['Glucotrol XL', 'glipizide', 'extended release', 'NDA020329'], concepts: ['medication-identity', 'brand-alias', 'release-form'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
];

export const diabetesOralReleaseEvidence: EvidenceBundle = {
  ...diabetesHumalogEvidence,
  generatedAt: retrievedAt,
  sources: [...diabetesHumalogEvidence.sources, ...oralReleaseSources],
  atoms: [...diabetesHumalogEvidence.atoms, ...oralReleaseAtoms],
};
