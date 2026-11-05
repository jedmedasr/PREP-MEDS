import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesAuditedEvidence } from './diabetes-evidence-audit.js';

const retrievedAt = '2026-09-18T01:35:00Z';

interface LabelIdentity {
  key: string;
  title: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  section: string;
  claim: string;
  medicationIds: string[];
  limitations?: string[];
}

const labels: LabelIdentity[] = [
  {
    key: 'GLARGINE-CONCENTRATIONS', title: 'TOUJEO U-300 insulin glargine label', publisher: 'Sanofi; DailyMed',
    setId: 'c9561d96-124d-48ca-982f-0aa1575bff36', splVersion: 25, effectiveDate: '2025-05-30',
    section: 'Product title; 2.4 Starting Dose in Patients Already on Insulin Therapy',
    claim: 'The TOUJEO label identifies glargine U-300 and separately identifies LANTUS as glargine 100 units/mL; changing between products requires supervised regimen review.',
    medicationIds: ['MED-insulin-glargine-u100', 'MED-insulin-glargine-u300'],
    limitations: ['The LANTUS concentration is identified in this comparator passage; it is not independent verification of every LANTUS presentation or other glargine brand.'],
  },
  {
    key: 'DEGLUDEC-CONCENTRATIONS', title: 'Insulin degludec (Tresiba) manufacturer label', publisher: 'Novo Nordisk Pharma Inc.; DailyMed',
    setId: 'c1be283d-4b1d-4996-b2a7-4488dbff3037', splVersion: 2, effectiveDate: '2022-07-01',
    section: '3 Dosage Forms and Strengths; Patient Information',
    claim: 'The identified degludec label describes U-100 and U-200 presentations and identifies the product as Tresiba; the brand name alone does not determine concentration.',
    medicationIds: ['MED-insulin-degludec-u100', 'MED-insulin-degludec-u200'],
  },
  {
    key: 'HUMALOG-CONCENTRATIONS', title: 'HUMALOG insulin lispro label, A-S Medication Solutions', publisher: 'A-S Medication Solutions; Lilly source labeling; DailyMed',
    setId: 'c6b8ff07-d3e2-457f-8a38-b60de60adf75', splVersion: 24, effectiveDate: '2025-04-01',
    section: '2.2 Administration Instructions for Approved Routes; 3 Dosage Forms and Strengths',
    claim: 'HUMALOG labeling distinguishes U-100 from U-200 and specifically excludes U-200 from continuous subcutaneous pump administration.',
    medicationIds: ['MED-insulin-lispro-humalog-u100', 'MED-insulin-lispro-humalog-u200'],
    limitations: ['Identified repackaged label reproduces source prescribing information; it does not verify other lispro brands or authorize pump compatibility.'],
  },
  {
    key: 'LISPRO-MIX-75-25', title: 'HUMALOG Mix75/25 insulin lispro suspension', publisher: 'Eli Lilly and Company; DailyMed',
    setId: 'c73da51a-1899-45ad-b6cf-9c52c36a25dd', splVersion: 53, effectiveDate: '2024-08-06',
    section: '1 Indications and Usage / Limitations; 3 Dosage Forms and Strengths; 11 Description',
    claim: 'HUMALOG Mix75/25 is U-100 with fixed proportions of 75% protamine-associated lispro and 25% soluble lispro; the two components cannot be independently adjusted.',
    medicationIds: ['MED-insulin-lispro-75-25'],
  },
  {
    key: 'LISPRO-MIX-50-50', title: 'HUMALOG Mix50/50 insulin lispro suspension', publisher: 'Eli Lilly and Company; DailyMed',
    setId: 'b34cd3ff-d0af-4852-b4ef-2a8b4a93aeae', splVersion: 54, effectiveDate: '2026-01-13',
    section: '1 Indications and Usage / Limitations; 3 Dosage Forms and Strengths; 11 Description',
    claim: 'HUMALOG Mix50/50 is U-100 with equal fixed proportions of protamine-associated and soluble lispro; the components are not separately adjustable.',
    medicationIds: ['MED-insulin-lispro-50-50'],
  },
  {
    key: 'ASPART-MIX-70-30', title: 'NOVOLOG Mix 70/30 insulin aspart suspension', publisher: 'Novo Nordisk; DailyMed',
    setId: '1861fcee-7673-4afe-a206-08fa05c0add2', splVersion: 24, effectiveDate: '2023-02-28',
    section: '1 Indications and Usage / Limitations; 3 Dosage Forms and Strengths',
    claim: 'NOVOLOG Mix 70/30 is U-100 containing fixed proportions of 70% protamine-associated aspart and 30% soluble aspart, rather than the human NPH/regular 70/30 product.',
    medicationIds: ['MED-insulin-aspart-70-30'],
  },
  {
    key: 'CYCLOSET-IDENTITY', title: 'CYCLOSET bromocriptine mesylate tablets', publisher: 'Avvisto Therapeutics LLC; DailyMed',
    setId: 'e42ba916-16b9-4d1c-8d09-9d2fbb1b6c20', splVersion: 7, effectiveDate: '2026-01-12',
    section: '1 Indications and Usage; 3 Dosage Forms and Strengths; 11 Description',
    claim: 'CYCLOSET is the bromocriptine formulation indicated for type 2 diabetes, supplied as 0.8 mg tablets; a generic bromocriptine name does not establish this product.',
    medicationIds: ['MED-bromocriptine-qr', 'MED-bromocriptine-unspecified'],
  },
  {
    key: 'PARLODEL-IDENTITY', title: 'PARLODEL bromocriptine mesylate tablets and capsules', publisher: 'Validus Pharmaceuticals LLC; DailyMed',
    setId: 'fc2a08dd-4fb6-4ac4-9082-f99552fae25c', splVersion: 11, effectiveDate: '2023-12-15',
    section: 'Description; Indications and Usage; Precautions / Parkinson Disease',
    claim: 'PARLODEL labeling describes bromocriptine for hyperprolactinemic disorders, acromegaly and Parkinson disease, with withdrawal precautions; it is not the diabetes-specific CYCLOSET product.',
    medicationIds: ['MED-bromocriptine-parlodel', 'MED-bromocriptine-unspecified'],
  },
];

export const diabetesFormulationSources: SourceDocument[] = labels.map((label) => ({
  id: `SRC-B2-FORM-${label.key}`,
  version: 1,
  sourceType: 'FDA_LABEL',
  title: label.title,
  publisher: label.publisher,
  societyOrRegulator: 'FDA labeling via DailyMed',
  sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${label.setId}`,
  externalIdentifier: `DailyMed SETID ${label.setId}; SPL version ${label.splVersion}`,
  effectiveDate: label.effectiveDate,
  jurisdiction: 'US',
  language: 'en',
  retrievedAt,
  lifecycle: 'DRAFT',
  metadata: { setId: label.setId, splVersion: label.splVersion, verificationScope: 'Selected identity/formulation passages only', currentMarketAvailabilityAsserted: false },
}));

export const diabetesFormulationAtoms: EvidenceAtom[] = labels.map((label) => ({
  id: `EVD-B2-FORM-${label.key}`,
  version: 1,
  source: { id: `SRC-B2-FORM-${label.key}`, version: 1 },
  claim: label.claim,
  normalizedTopic: 'diabetes-product-formulation-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [...label.medicationIds], contextTags: ['product-reconciliation', 'formulation-confirmation'] },
  locator: { section: label.section },
  limitations: [
    'This is product-identity evidence, not a preprocedure hold, restart, dose-conversion or substitution instruction.',
    'A pinned label is not an assertion of current product availability or validation of every product presentation.',
    ...(label.limitations ?? []),
  ],
  retrieval: { title: label.title, summary: label.claim, keywords: ['diabetes', 'formulation', label.key], concepts: ['medication-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const diabetesFormulationEvidence: EvidenceBundle = {
  ...diabetesAuditedEvidence,
  generatedAt: retrievedAt,
  sources: [...diabetesAuditedEvidence.sources, ...diabetesFormulationSources],
  atoms: [...diabetesAuditedEvidence.atoms, ...diabetesFormulationAtoms],
};
