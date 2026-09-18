import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesFormulationEvidence } from './diabetes-formulation-evidence.js';

const retrievedAt = '2026-09-18T17:47:14Z';

type ProductFamily = 'LYUMJEV' | 'ADMELOG' | 'FIASP' | 'BASAGLAR' | 'SEMGLEE';
export interface InsulinProductDefinition {
  medicationId: string;
  family: ProductFamily;
  brand: string;
  labelledActiveName: string;
  ingredientId: string;
  drugClassId: 'CLS-prandial-insulin' | 'CLS-basal-insulin';
  concentration: 100 | 200;
  aliases: string[];
}

/** Product identity, not a dosing, substitution, availability or device-compatibility catalog. */
export const diabetesInsulinProductDefinitions: InsulinProductDefinition[] = [
  {
    medicationId: 'MED-insulin-lispro-lyumjev-u100', family: 'LYUMJEV', brand: 'Lyumjev',
    labelledActiveName: 'insulin lispro-aabc', ingredientId: 'ING-insulin-lispro',
    drugClassId: 'CLS-prandial-insulin', concentration: 100,
    aliases: ['Lyumjev U100', 'Lyumjev 100 units/mL', 'Lyumjev KwikPen', 'Lyumjev KwikPen U-100', 'Lyumjev Junior KwikPen', 'Lyumjev Tempo Pen', 'insulin lispro-aabc', 'lispro-aabc'],
  },
  {
    medicationId: 'MED-insulin-lispro-lyumjev-u200', family: 'LYUMJEV', brand: 'Lyumjev',
    labelledActiveName: 'insulin lispro-aabc', ingredientId: 'ING-insulin-lispro',
    drugClassId: 'CLS-prandial-insulin', concentration: 200,
    aliases: ['Lyumjev U200', 'Lyumjev 200 units/mL', 'Lyumjev KwikPen', 'Lyumjev KwikPen U-200', 'insulin lispro-aabc', 'lispro-aabc'],
  },
  {
    medicationId: 'MED-insulin-lispro-admelog-u100', family: 'ADMELOG', brand: 'Admelog',
    labelledActiveName: 'insulin lispro', ingredientId: 'ING-insulin-lispro',
    drugClassId: 'CLS-prandial-insulin', concentration: 100,
    aliases: ['Admelog U100', 'Admelog 100 units/mL', 'Admelog SoloStar', 'Admelog SoloStar U-100'],
  },
  {
    medicationId: 'MED-insulin-aspart-fiasp-u100', family: 'FIASP', brand: 'Fiasp',
    labelledActiveName: 'insulin aspart', ingredientId: 'ING-insulin-aspart',
    drugClassId: 'CLS-prandial-insulin', concentration: 100,
    aliases: ['Fiasp U100', 'Fiasp 100 units/mL', 'Fiasp FlexTouch', 'Fiasp PenFill', 'Fiasp PumpCart'],
  },
  {
    medicationId: 'MED-insulin-glargine-basaglar-u100', family: 'BASAGLAR', brand: 'Basaglar',
    labelledActiveName: 'insulin glargine', ingredientId: 'ING-insulin-glargine',
    drugClassId: 'CLS-basal-insulin', concentration: 100,
    aliases: ['Basaglar U100', 'Basaglar 100 units/mL', 'Basaglar KwikPen', 'Basaglar Tempo Pen'],
  },
  {
    medicationId: 'MED-insulin-glargine-semglee-u100', family: 'SEMGLEE', brand: 'Semglee',
    labelledActiveName: 'insulin glargine-yfgn', ingredientId: 'ING-insulin-glargine',
    drugClassId: 'CLS-basal-insulin', concentration: 100,
    aliases: ['Semglee U100', 'Semglee 100 units/mL', 'insulin glargine-yfgn', 'glargine-yfgn', 'insulin glargine U-100'],
  },
];

interface VerifiedLabel {
  family: ProductFamily;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate?: string;
  publicationDate?: string;
  labelRevision: string;
  claim: string;
  limitations: string[];
}
const labels: VerifiedLabel[] = [
  {
    family: 'LYUMJEV', publisher: 'Eli Lilly and Company; DailyMed',
    setId: 'c5a056e2-b568-4ca6-9ed8-79c010942d00', splVersion: 11,
    effectiveDate: '2025-12-30', labelRevision: '2022-10',
    claim: 'The identified LYUMJEV label names insulin lispro-aabc and distinguishes U-100 from U-200. U-200 is a prefilled-pen presentation and must not be used in a pump or intravenously; U-100 pump use remains dependent on the device instructions. Treprostinil sodium is an inactive formulation ingredient.',
    limitations: ['The local lispro ingredient link denotes active-moiety grouping only; the labelled lispro-aabc product identity is retained.', 'Treprostinil is not a separately prescribed medication in this product.'],
  },
  {
    family: 'ADMELOG', publisher: 'Sanofi-Aventis U.S. LLC; DailyMed',
    setId: '0691def8-4a7b-4de3-866f-a280989f47f1', splVersion: 14,
    effectiveDate: '2025-06-04', labelRevision: '2025-05',
    claim: 'The identified ADMELOG label describes insulin lispro U-100 in vial and SoloStar presentations. Its administration and pump provisions belong to ADMELOG and do not establish equivalence of every lispro formulation.',
    limitations: ['Verification is limited to this manufacturer SPL and selected identity/route passages.'],
  },
  {
    family: 'FIASP', publisher: 'Novo Nordisk; DailyMed',
    setId: '834e7efc-393f-4c55-9125-628562a8a5cf', splVersion: 18,
    publicationDate: '2023-07-25', labelRevision: '2023-06',
    claim: 'The identified FIASP label describes insulin aspart U-100 in vial, FlexTouch, PenFill and PumpCart presentations. Niacinamide is an inactive formulation ingredient. PumpCart use requires a compatible device rather than permission inferred from the insulin ingredient.',
    limitations: ['The registry posting date is recorded separately; an unverified SPL effective date is deliberately omitted.', 'The record does not establish a specific presentation or device from a bare Fiasp medication entry.'],
  },
  {
    family: 'BASAGLAR', publisher: 'Eli Lilly and Company; DailyMed',
    setId: '0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae', splVersion: 35,
    effectiveDate: '2026-06-16', labelRevision: '2021-07',
    claim: 'The identified BASAGLAR label describes insulin glargine U-100 in prefilled-pen presentations. It specifies subcutaneous administration and excludes intravenous and insulin-pump administration.',
    limitations: ['The 2026 SPL metadata date differs from the prescribing-information revision date.', 'Listing a labelled presentation does not assert that it is currently marketed or available.'],
  },
  {
    family: 'SEMGLEE', publisher: 'Biocon Biologics Inc.; DailyMed',
    setId: '8cf5544f-87d6-468b-f6ae-898b1fdb5d80', splVersion: 14,
    effectiveDate: '2025-03-03', labelRevision: '2025-03',
    claim: 'The identified SEMGLEE label names insulin glargine-yfgn U-100 in vial and prefilled-pen presentations. The product is for subcutaneous use, not intravenous or pump administration.',
    limitations: ['The local glargine ingredient link denotes active-moiety grouping only, not substitution authorization.', 'A generic glargine-yfgn query must not imply a verified branded manufacturer.'],
  },
];

export const diabetesInsulinProductSources: SourceDocument[] = labels.map((label) => ({
  id: `SRC-B2-PRODUCT-${label.family}`, version: 1, sourceType: 'FDA_LABEL',
  title: `${label.family}: selected product identity and route passages, SPL ${label.splVersion}`,
  publisher: label.publisher, language: 'en', jurisdiction: 'US',
  sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${label.setId}`,
  externalIdentifier: `DailyMed SETID ${label.setId}; SPL version ${label.splVersion}`,
  ...(label.effectiveDate ? { effectiveDate: label.effectiveDate } : {}),
  ...(label.publicationDate ? { publicationDate: label.publicationDate } : {}),
  retrievedAt, lifecycle: 'DRAFT',
  metadata: {
    setId: label.setId, splVersion: label.splVersion, labelRevision: label.labelRevision,
    verificationScope: 'Selected identity and formulation passages; no clinical approval',
    currentMarketAvailabilityAsserted: false,
  },
}));

export const diabetesInsulinProductAtoms: EvidenceAtom[] = labels.map((label) => ({
  id: `EVD-B2-PRODUCT-${label.family}`, version: 1,
  source: { id: `SRC-B2-PRODUCT-${label.family}`, version: 1 },
  claim: label.claim, normalizedTopic: 'diabetes-product-formulation-identity',
  stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: {
    medicationIds: diabetesInsulinProductDefinitions.filter((product) => product.family === label.family).map((product) => product.medicationId),
    contextTags: ['product-reconciliation', 'formulation-confirmation'],
  },
  locator: { section: '2.1 and 2.2 Administration; 3 Dosage Forms and Strengths; 11 Description; 16 How Supplied' },
  limitations: [
    'Identity evidence is not a periendoscopic hold, restart, dose, substitution or device-compatibility recommendation.',
    'No current-market or authenticated-patient-prescription claim is made.',
    ...label.limitations,
  ],
  retrieval: {
    title: `${label.family} product identity`, summary: label.claim,
    keywords: ['insulin', 'formulation', label.family], concepts: ['medication-identity'], sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

/** All historical source/atom versions and retrieval dates remain intact. */
export const diabetesInsulinProductEvidence: EvidenceBundle = {
  ...diabetesFormulationEvidence, generatedAt: retrievedAt,
  sources: [...diabetesFormulationEvidence.sources, ...diabetesInsulinProductSources],
  atoms: [...diabetesFormulationEvidence.atoms, ...diabetesInsulinProductAtoms],
};
