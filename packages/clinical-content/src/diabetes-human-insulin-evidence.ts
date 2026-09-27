import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesInsulinProductEvidence } from './diabetes-insulin-product-evidence.js';

const retrievedAt = '2026-09-18T22:41:42Z';

export interface HumanInsulinProductDefinition {
  medicationId: string;
  labelKey: string;
  brand: string;
  labelledActiveName: string;
  concentration: 100 | 500;
  preparation: 'NPH_SUSPENSION' | 'REGULAR_SOLUTION' | 'HUMAN_PREMIX_SUSPENSION';
  ingredientIds: string[];
  drugClassId: string;
  aliases: string[];
  components?: Array<{ name: string; proportionPercent: number }>;
}

/** Product identity only. These records do not calculate doses or authorize substitution. */
export const humanInsulinProductDefinitions: HumanInsulinProductDefinition[] = [
  {
    medicationId: 'MED-insulin-nph-humulin-u100', labelKey: 'HUMULIN-N', brand: 'Humulin N',
    labelledActiveName: 'insulin isophane human', concentration: 100, preparation: 'NPH_SUSPENSION',
    ingredientIds: ['ING-insulin-nph'], drugClassId: 'CLS-basal-insulin',
    aliases: ['Humulin N KwikPen', 'NPH U-100', 'NPH U100', 'NPH insulin U-100'],
  },
  {
    medicationId: 'MED-insulin-nph-novolin-u100', labelKey: 'NOVOLIN-N', brand: 'Novolin N',
    labelledActiveName: 'insulin isophane human', concentration: 100, preparation: 'NPH_SUSPENSION',
    ingredientIds: ['ING-insulin-nph'], drugClassId: 'CLS-basal-insulin',
    aliases: ['Novolin N FlexPen', 'ReliOn Novolin N', 'NPH U-100', 'NPH U100', 'NPH insulin U-100', 'ReliOn'],
  },
  {
    medicationId: 'MED-insulin-regular-humulin-u100', labelKey: 'HUMULIN-R-U100', brand: 'Humulin R',
    labelledActiveName: 'insulin human', concentration: 100, preparation: 'REGULAR_SOLUTION',
    ingredientIds: ['ING-insulin-regular'], drugClassId: 'CLS-prandial-insulin',
    aliases: ['regular insulin U-100', 'regular insulin U100', 'insulin human regular U-100'],
  },
  {
    medicationId: 'MED-insulin-regular-novolin-u100', labelKey: 'NOVOLIN-R', brand: 'Novolin R',
    labelledActiveName: 'insulin human', concentration: 100, preparation: 'REGULAR_SOLUTION',
    ingredientIds: ['ING-insulin-regular'], drugClassId: 'CLS-prandial-insulin',
    aliases: ['Novolin R FlexPen', 'ReliOn Novolin R', 'regular insulin U-100', 'regular insulin U100', 'insulin human regular U-100', 'ReliOn'],
  },
  {
    medicationId: 'MED-insulin-regular-humulin-u500', labelKey: 'HUMULIN-R-U500', brand: 'Humulin R',
    labelledActiveName: 'insulin human', concentration: 500, preparation: 'REGULAR_SOLUTION',
    ingredientIds: ['ING-insulin-regular'], drugClassId: 'CLS-concentrated-insulin',
    aliases: ['Humulin R U-500 KwikPen', 'Humulin R U500 KwikPen', 'regular insulin U-500', 'insulin human regular U-500'],
  },
  {
    medicationId: 'MED-insulin-human-70-30-humulin-u100', labelKey: 'HUMULIN-70-30', brand: 'Humulin 70/30',
    labelledActiveName: 'insulin isophane human and insulin human', concentration: 100, preparation: 'HUMAN_PREMIX_SUSPENSION',
    ingredientIds: ['ING-insulin-nph', 'ING-insulin-regular'], drugClassId: 'CLS-premixed-insulin',
    aliases: ['Humulin70/30', 'Humulin 70/30 KwikPen', 'human insulin 70/30', '70/30 insulin', '70/30', 'premixed insulin'],
    components: [{ name: 'Insulin isophane human (NPH)', proportionPercent: 70 }, { name: 'Regular insulin human', proportionPercent: 30 }],
  },
  {
    medicationId: 'MED-insulin-human-70-30-novolin-u100', labelKey: 'NOVOLIN-70-30', brand: 'Novolin 70/30',
    labelledActiveName: 'insulin isophane human and insulin human', concentration: 100, preparation: 'HUMAN_PREMIX_SUSPENSION',
    ingredientIds: ['ING-insulin-nph', 'ING-insulin-regular'], drugClassId: 'CLS-premixed-insulin',
    aliases: ['Novolin70/30', 'Novolin 70/30 FlexPen', 'ReliOn Novolin 70/30', 'human insulin 70/30', '70/30 insulin', '70/30', 'premixed insulin', 'ReliOn'],
    components: [{ name: 'Insulin isophane human (NPH)', proportionPercent: 70 }, { name: 'Regular insulin human', proportionPercent: 30 }],
  },
];

interface LabelRecord {
  key: string;
  title: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  uspiRevision: string;
  section: string;
  claim: string;
  limitations: string[];
}
const labels: LabelRecord[] = [
  {
    key: 'HUMULIN-N', title: 'HUMULIN N insulin isophane human manufacturer labeling', publisher: 'Eli Lilly and Company',
    setId: 'f6edd793-440b-40c2-96b5-c16133b7a921', splVersion: 50, effectiveDate: '2025-12-19', uspiRevision: '2025-12',
    section: '3 Dosage Forms and Strengths; 11 Description',
    claim: 'HUMULIN N is insulin isophane human (NPH), supplied as a U-100 suspension, distinct from regular human insulin solution.',
    limitations: ['NPH identity does not establish a patient-specific basal-insulin adjustment or authorize mixing.'],
  },
  {
    key: 'NOVOLIN-N', title: 'NOVOLIN N insulin isophane human manufacturer labeling', publisher: 'Novo Nordisk',
    setId: '82f1445c-b2c6-445a-82cf-ba8825fac776', splVersion: 17, effectiveDate: '2022-11-23', uspiRevision: '2022-11',
    section: '3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied',
    claim: 'NOVOLIN N is a U-100 insulin isophane human (NPH) suspension. Its labeling also identifies ReliOn presentations of NOVOLIN N.',
    limitations: ['ReliOn alone does not identify NPH rather than regular or premixed human insulin.'],
  },
  {
    key: 'HUMULIN-R-U100', title: 'HUMULIN R U-100 regular human insulin manufacturer labeling', publisher: 'Eli Lilly and Company',
    setId: 'b519bd83-038c-4ec5-a231-a51ec5cc291f', splVersion: 35, effectiveDate: '2026-06-16', uspiRevision: '2023-06',
    section: '3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied',
    claim: 'The identified HUMULIN R label describes regular human insulin as a clear U-100 solution. The concentration must be distinguished from HUMULIN R U-500.',
    limitations: ['The SPL effective date is not the June 2023 literature revision date.', 'A common HUMULIN R name does not establish U-100 rather than U-500.'],
  },
  {
    key: 'NOVOLIN-R', title: 'NOVOLIN R regular human insulin manufacturer labeling', publisher: 'Novo Nordisk',
    setId: 'aee7f1f3-612c-4027-8ce9-4fd1f41eed71', splVersion: 19, effectiveDate: '2022-11-23', uspiRevision: '2022-11',
    section: '3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied',
    claim: 'NOVOLIN R is a U-100 regular human insulin solution. The manufacturer label includes ReliOn presentations of NOVOLIN R.',
    limitations: ['Recognition of a label presentation is not verification of a specific current prescription or device.'],
  },
  {
    key: 'HUMULIN-R-U500', title: 'HUMULIN R U-500 concentrated human insulin manufacturer labeling', publisher: 'Eli Lilly and Company',
    setId: 'b60e8dd0-1d48-4dc9-87fd-e14675255e8c', splVersion: 40, effectiveDate: '2024-02-22', uspiRevision: '2024-02',
    section: '3 Dosage Forms and Strengths; 11 Description; 5.1 Dosing Errors',
    claim: 'HUMULIN R U-500 contains 500 units/mL of insulin human and has product-specific dosing-error precautions. It is not the U-100 product despite the shared HUMULIN R name.',
    limitations: ['No unit conversion, syringe-volume calculation, regimen substitution or periendoscopic dose instruction is derived from this identity record.', 'This product retains the dedicated concentrated-insulin review pathway rather than a routine U-100 prandial action.'],
  },
  {
    key: 'HUMULIN-70-30', title: 'HUMULIN 70/30 human premixed insulin manufacturer labeling', publisher: 'Eli Lilly and Company',
    setId: 'e245e0c5-b2d6-418b-baa4-1c3324292885', splVersion: 48, effectiveDate: '2024-12-10', uspiRevision: '2022-06',
    section: '2.2 Dosage Information; 3 Dosage Forms and Strengths; 11 Description',
    claim: 'HUMULIN 70/30 is a U-100 suspension with fixed proportions of 70% insulin isophane human (NPH) and 30% regular human insulin. Its basal and prandial fractions are not independently adjustable.',
    limitations: ['The product is a human-insulin mixture, not the insulin aspart 70/30 analog mixture.', 'Component proportions describe formulation identity, not a calculation of a patient dose.', 'The SPL effective date and the June 2022 literature revision are separate metadata.'],
  },
  {
    key: 'NOVOLIN-70-30', title: 'NOVOLIN 70/30 human premixed insulin manufacturer labeling', publisher: 'Novo Nordisk',
    setId: '508a2763-3cb7-4be5-9e53-544e84cd9b1f', splVersion: 18, effectiveDate: '2022-11-23', uspiRevision: '2022-11',
    section: '1 Indications and Usage / Limitations; 3 Dosage Forms and Strengths; 11 Description; 16.1 How Supplied',
    claim: 'NOVOLIN 70/30 is a U-100 suspension of fixed 70% insulin isophane human (NPH) and 30% regular human insulin, including labeled ReliOn presentations. It is distinct from NOVOLOG Mix 70/30.',
    limitations: ['A shared 70/30 ratio does not establish human versus analog insulin or a manufacturer.', 'The fixed mixture is not decomposed into independently adjustable medication instructions.'],
  },
];

export const humanInsulinSources: SourceDocument[] = labels.map((label) => ({
  id: `SRC-B2-HUMAN-${label.key}`, version: 1, sourceType: 'FDA_LABEL',
  title: label.title, publisher: label.publisher, societyOrRegulator: 'FDA labeling via DailyMed',
  sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${label.setId}`,
  externalIdentifier: `DailyMed SETID ${label.setId}; SPL version ${label.splVersion}`,
  effectiveDate: label.effectiveDate, jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
  metadata: {
    setId: label.setId, splVersion: label.splVersion, uspiLiteratureRevision: label.uspiRevision,
    verificationScope: 'Selected human-insulin identity and formulation passages only',
    currentMarketAvailabilityAsserted: false,
  },
}));
export const humanInsulinAtoms: EvidenceAtom[] = labels.map((label) => ({
  id: `EVD-B2-HUMAN-${label.key}`, version: 1,
  source: { id: `SRC-B2-HUMAN-${label.key}`, version: 1 },
  claim: label.claim, normalizedTopic: 'diabetes-product-formulation-identity',
  stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: {
    medicationIds: humanInsulinProductDefinitions.filter((product) => product.labelKey === label.key).map((product) => product.medicationId),
    contextTags: ['product-reconciliation', 'formulation-confirmation'],
  },
  locator: { section: label.section },
  limitations: [
    'Product identity evidence is not a preprocedure hold, restart, dose, conversion, substitution or device-compatibility instruction.',
    'A label listing does not establish current availability, a patient prescription or every delivery presentation.',
    ...label.limitations,
  ],
  retrieval: { title: label.title, summary: label.claim, keywords: ['human insulin', 'formulation', label.key], concepts: ['medication-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

/** Append-only: earlier source/atom versions and retrieval timestamps are retained. */
export const diabetesHumanInsulinEvidence: EvidenceBundle = {
  ...diabetesInsulinProductEvidence, generatedAt: retrievedAt,
  sources: [...diabetesInsulinProductEvidence.sources, ...humanInsulinSources],
  atoms: [...diabetesInsulinProductEvidence.atoms, ...humanInsulinAtoms],
};
