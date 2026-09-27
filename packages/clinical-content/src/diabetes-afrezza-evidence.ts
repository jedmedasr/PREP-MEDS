import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';
import { diabetesHumanInsulinEvidence } from './diabetes-human-insulin-evidence.js';

const retrievedAt = '2026-09-20T21:21:21Z';
export const afrezzaLabelReference = { id: 'SRC-B2-AFREZZA-SPL17', version: 1 } as const;

/** Cartridge label strength is neither a liquid concentration nor a prescribed dose. */
export interface AfrezzaProductDefinition {
  medicationId: string;
  brand: 'Afrezza';
  labelledActiveName: 'insulin human';
  ingredientId: 'ING-inhaled-human-insulin';
  drugClassId: 'CLS-prandial-insulin';
  route: 'ORAL_INHALATION';
  dosageForm: 'INHALATION_POWDER';
  labelledCartridgeUnits?: 4 | 8 | 12;
  aliases: string[];
}

export const afrezzaProductDefinitions: AfrezzaProductDefinition[] = [
  {
    medicationId: 'MED-afrezza-strength-unspecified', brand: 'Afrezza',
    labelledActiveName: 'insulin human', ingredientId: 'ING-inhaled-human-insulin',
    drugClassId: 'CLS-prandial-insulin', route: 'ORAL_INHALATION', dosageForm: 'INHALATION_POWDER',
    aliases: ['Afrezza strength unspecified', 'Afrezza titration pack'],
  },
  ...([4, 8, 12] as const).map((units): AfrezzaProductDefinition => ({
    medicationId: `MED-afrezza-${units}-unit-cartridge`, brand: 'Afrezza',
    labelledActiveName: 'insulin human', ingredientId: 'ING-inhaled-human-insulin',
    drugClassId: 'CLS-prandial-insulin', route: 'ORAL_INHALATION', dosageForm: 'INHALATION_POWDER',
    labelledCartridgeUnits: units,
    aliases: [
      `Afrezza ${units} unit cartridge`, `Afrezza ${units} units per cartridge`,
      `Afrezza ${units} units/cartridge`, `Afrezza ${units}-unit inhalation cartridge`,
    ],
  })),
];

export const afrezzaSources: SourceDocument[] = [{
  ...afrezzaLabelReference, sourceType: 'FDA_LABEL',
  title: 'AFREZZA manufacturer labeling: selected identity and safety passages, SPL 17',
  publisher: 'MannKind Corporation; DailyMed', language: 'en', jurisdiction: 'US',
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29f4637b-e204-425b-b89c-7238008d8c10',
  externalIdentifier: 'DailyMed SETID 29f4637b-e204-425b-b89c-7238008d8c10; SPL version 17; document 51ca8d95-025a-6342-e063-6294a90a94ee',
  effectiveDate: '2026-05-30', retrievedAt, lifecycle: 'DRAFT',
  metadata: {
    setId: '29f4637b-e204-425b-b89c-7238008d8c10', splVersion: 17,
    documentId: '51ca8d95-025a-6342-e063-6294a90a94ee', labelRevision: '2026-05',
    verificationScope: 'Selected cartridge, route, device and safety passages; not a complete clinical audit',
    currentMarketAvailabilityAsserted: false, clinicalApprovalGranted: false,
    note: 'The May 2026 label includes pediatric labeling. Identity verification does not expand PREP-MEDS clinical population scope. Older indexed adult-only labels are not substituted for this version.',
  },
}];

const medicationIds = afrezzaProductDefinitions.map((product) => product.medicationId);
const passages = [
  {
    id: 'EVD-B2-AFREZZA-CARTRIDGE-IDENTITY',
    topic: 'diabetes-product-formulation-identity',
    section: '3 Dosage Forms and Strengths; 11.1 AFREZZA Cartridges; 16 How Supplied',
    claim: 'The identified AFREZZA label describes insulin human inhalation powder in single-use cartridges labeled 4, 8 or 12 units. Packs may contain more than one cartridge strength. Cartridge label strength, package quantity and prescribed mealtime dose are distinct fields; the product is not described as an injectable units-per-mL concentration.',
  },
  {
    id: 'EVD-B2-AFREZZA-ROUTE-DEVICE-IDENTITY',
    topic: 'diabetes-product-route-device-identity',
    section: '2.2 Important Administration Information; 11.1 AFREZZA Cartridges; 11.2 AFREZZA Inhaler; Instructions for Use',
    claim: 'The identified AFREZZA label specifies oral inhalation with the AFREZZA inhaler. The powder contains human insulin with fumaryl diketopiperazine and polysorbate 80 as inactive formulation ingredients. This product identity does not identify an injected insulin or an insulin-pump reservoir product.',
  },
  {
    id: 'EVD-B2-AFREZZA-SAFETY-REVIEW-CONTEXT',
    topic: 'diabetes-inhaled-insulin-clinical-review-context',
    section: 'Boxed Warning; 1 Indications and Usage; 2.3 Switching from Other Mealtime Insulin Regimens; 4 Contraindications; 5.1 Acute Bronchospasm; Medication Guide',
    claim: 'The identified AFREZZA label contraindicates use with chronic lung disease such as asthma or COPD, describes limitations for smoking or recent smoking cessation, and requires basal insulin in type 1 diabetes. Switching from injected insulin requires a clinician-directed plan; a labeled cartridge number is not permission for automatic unit-for-unit substitution.',
  },
];

export const afrezzaAtoms: EvidenceAtom[] = passages.map((passage) => ({
  id: passage.id, version: 1, source: afrezzaLabelReference,
  claim: passage.claim, normalizedTopic: passage.topic,
  stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [...medicationIds], contextTags: ['product-reconciliation', 'inhaled-insulin', 'clinical-review-only'] },
  locator: { section: passage.section },
  limitations: [
    'This record does not provide a periendoscopic hold, restart, patient dose, conversion or cartridge-selection instruction.',
    'Selected label passages do not constitute complete contraindication checking or authorize device use.',
    'Catalog identity does not authenticate a prescription, inhaler, cartridge strength, patient age or administration technique.',
    'No commercial availability, therapeutic substitution or clinical activation is asserted.',
  ],
  retrieval: {
    title: `AFREZZA: ${passage.topic}`, summary: passage.claim,
    keywords: ['Afrezza', 'inhaled human insulin', 'cartridge'],
    concepts: ['medication-identity', 'clinical-review'], sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

/** Append only; earlier evidence bundles and their timestamps remain intact. */
export const diabetesAfrezzaEvidence: EvidenceBundle = {
  ...diabetesHumanInsulinEvidence, generatedAt: retrievedAt,
  sources: [...diabetesHumanInsulinEvidence.sources, ...afrezzaSources],
  atoms: [...diabetesHumanInsulinEvidence.atoms, ...afrezzaAtoms],
};
