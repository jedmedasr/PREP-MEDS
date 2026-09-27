import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesAfrezzaEvidence } from './diabetes-afrezza-evidence.js';

const retrievedAt = '2026-09-26T02:45:00Z';
export const apidraLabelReference = { id: 'SRC-B2-APIDRA-SPL28', version: 1 } as const;

export interface ApidraProductDefinition {
  medicationId: 'MED-insulin-glulisine-apidra-u100';
  brand: 'Apidra';
  labelledActiveName: 'insulin glulisine';
  ingredientId: 'ING-insulin-glulisine';
  drugClassId: 'CLS-prandial-insulin';
  concentration: 100;
  aliases: string[];
}

/** Product identity only; presentation, regimen and device use remain separately unconfirmed. */
export const apidraProductDefinitions: ApidraProductDefinition[] = [{
  medicationId: 'MED-insulin-glulisine-apidra-u100',
  brand: 'Apidra',
  labelledActiveName: 'insulin glulisine',
  ingredientId: 'ING-insulin-glulisine',
  drugClassId: 'CLS-prandial-insulin',
  concentration: 100,
  aliases: [
    'Apidra U-100', 'Apidra U100', 'Apidra 100 units/mL',
    'Apidra SoloStar', 'Apidra SoloStar U-100', 'Apidra SoloStar 100 units/mL',
  ],
}];

export const apidraSources: SourceDocument[] = [{
  ...apidraLabelReference,
  sourceType: 'FDA_LABEL',
  title: 'APIDRA / APIDRA SoloStar manufacturer labeling: selected product identity passages, SPL 28',
  publisher: 'sanofi-aventis U.S. LLC; DailyMed',
  societyOrRegulator: 'FDA labeling via DailyMed',
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e7af6a7a-8046-4fb4-9979-4ec4230b23aa',
  externalIdentifier: 'DailyMed SETID e7af6a7a-8046-4fb4-9979-4ec4230b23aa; SPL version 28; document 6be54063-6912-4810-b1c7-dfca969224d8; BLA 021629',
  effectiveDate: '2025-11-25',
  language: 'en',
  jurisdiction: 'US',
  retrievedAt,
  lifecycle: 'DRAFT',
  metadata: {
    setId: 'e7af6a7a-8046-4fb4-9979-4ec4230b23aa',
    splVersion: 28,
    documentId: '6be54063-6912-4810-b1c7-dfca969224d8',
    applicationNumber: 'BLA 021629',
    labelRevision: '2025-05',
    verificationScope: 'Selected identity, concentration, dosage-form and presentation passages only; no clinical approval',
    currentMarketAvailabilityAsserted: false,
    clinicalApprovalGranted: false,
    note: 'The current SPL is effective 2025-11-25 while the prescribing-information revision shown in the label is May 2025; these dates are intentionally recorded separately.',
  },
}];

const medicationIds = apidraProductDefinitions.map((product) => product.medicationId);
export const apidraAtoms: EvidenceAtom[] = [{
  id: 'EVD-B2-APIDRA-PRODUCT-IDENTITY',
  version: 1,
  source: apidraLabelReference,
  claim: 'The identified APIDRA label names insulin glulisine injection at 100 units/mL (U-100). Section 3 and section 16.1 describe a 10 mL multiple-dose vial and a 3 mL single-patient-use APIDRA SoloStar prefilled pen. Those presentation and route details do not make a bare insulin-glulisine entry an authenticated APIDRA prescription or authorize a delivery device.',
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
    'Listing vial and SoloStar presentations does not confirm which presentation a patient uses or authorize pump/device compatibility.',
    'No current commercial availability, authenticated prescription or clinical activation is asserted.',
    'Generic insulin glulisine wording must not be used to infer a branded manufacturer product.',
  ],
  retrieval: {
    title: 'APIDRA product and formulation identity',
    summary: 'Current manufacturer SPL identifies APIDRA as insulin glulisine U-100 and distinguishes labelled vial and SoloStar presentations.',
    keywords: ['Apidra', 'insulin glulisine', 'U-100', 'SoloStar'],
    concepts: ['medication-identity', 'formulation-confirmation'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}];

/** Append only; the Afrezza evidence snapshot and all earlier evidence remain independently reconstructable. */
export const diabetesApidraEvidence: EvidenceBundle = {
  ...diabetesAfrezzaEvidence,
  generatedAt: retrievedAt,
  sources: [...diabetesAfrezzaEvidence.sources, ...apidraSources],
  atoms: [...diabetesAfrezzaEvidence.atoms, ...apidraAtoms],
};
