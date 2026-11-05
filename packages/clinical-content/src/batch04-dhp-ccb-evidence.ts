import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T08:34:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04DhpCcbIdentityDefinition {
  medicationId:
    | 'MED-amlodipine'
    | 'MED-nifedipine-capsule'
    | 'MED-nifedipine-er'
    | 'MED-felodipine-er';
  ingredientId: 'ING-amlodipine' | 'ING-nifedipine' | 'ING-felodipine';
  genericName: string;
  dosageForm: 'TABLET' | 'CAPSULE' | 'TABLET, FILM COATED, EXTENDED RELEASE' | 'TABLET, EXTENDED RELEASE';
  releaseForm: 'STANDARD' | 'EXTENDED_RELEASE';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch04DhpCcbIdentityDefinitions: Batch04DhpCcbIdentityDefinition[] = [
  { medicationId: 'MED-amlodipine', ingredientId: 'ING-amlodipine', genericName: 'amlodipine besylate', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-AMLODIPINE-IDENTITY', version: 1 } },
  { medicationId: 'MED-nifedipine-capsule', ingredientId: 'ING-nifedipine', genericName: 'nifedipine', dosageForm: 'CAPSULE', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-NIFEDIPINE-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-nifedipine-er', ingredientId: 'ING-nifedipine', genericName: 'nifedipine', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B4-NIFEDIPINE-ER-IDENTITY', version: 1 } },
  { medicationId: 'MED-felodipine-er', ingredientId: 'ING-felodipine', genericName: 'felodipine', dosageForm: 'TABLET, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B4-FELODIPINE-ER-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04DhpCcbIdentityDefinition['medicationId'];
  id: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  applicationNumber: string;
}> = [
  { medicationId: 'MED-amlodipine', id: 'SRC-B4-AMLODIPINE-ASCEND-SPL20', publisher: 'Ascend Laboratories, LLC; DailyMed', setId: '3f4703c0-0b9e-41a0-8b70-da26683d9ed2', splVersion: 20, effectiveDate: '2024-06-21', applicationNumber: 'ANDA078925' },
  { medicationId: 'MED-nifedipine-capsule', id: 'SRC-B4-NIFEDIPINE-AVET-CAPSULE-SPL17', publisher: 'Heritage Pharmaceuticals Inc. d/b/a Avet Pharmaceuticals Inc.; DailyMed', setId: 'b8b8cfee-ea71-44c2-81af-675efecfdf15', splVersion: 17, effectiveDate: '2023-08-03', applicationNumber: 'ANDA202644' },
  { medicationId: 'MED-nifedipine-er', id: 'SRC-B4-NIFEDIPINE-INGENUS-ER-SPL6', publisher: 'Ingenus Pharmaceuticals, LLC; DailyMed', setId: '4d3e11d2-d320-45d3-96c8-48322202b504', splVersion: 6, effectiveDate: '2026-03-30', applicationNumber: 'ANDA210614' },
  { medicationId: 'MED-felodipine-er', id: 'SRC-B4-FELODIPINE-AVET-ER-SPL8', publisher: 'Heritage Pharmaceuticals Inc. d/b/a Avet Pharmaceuticals Inc.; DailyMed', setId: '0bef7cf2-012b-4804-ac93-0a8b333035db', splVersion: 8, effectiveDate: '2026-08-11', applicationNumber: 'ANDA201964' },
];

const definitionByMedication = new Map(batch04DhpCcbIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04DhpCcbIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title: `${definition.genericName.toUpperCase()} ${definition.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher,
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}; ${source.applicationNumber}`,
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId,
      splVersion: source.splVersion,
      applicationNumber: source.applicationNumber,
      route: definition.route,
      dosageForm: definition.dosageForm,
      releaseForm: definition.releaseForm,
      representativeIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});

const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04DhpCcbIdentityAtoms: EvidenceAtom[] = batch04DhpCcbIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} calcium-channel-blocker identity${product.releaseForm === 'EXTENDED_RELEASE' ? ' with explicit extended-release formulation' : ''}.`,
  normalizedTopic: 'batch04-dihydropyridine-ccb-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-calcium-channel-blocker'], contextTags: ['generic-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'This source authenticates product identity and formulation provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'DailyMed/FDA listing does not establish current commercial inventory or authorize substitution.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, or restart timing is supported by this identity evidence.',
  ],
  retrieval: {
    title: `${product.genericName} formulation identity`,
    summary: `Direct DailyMed provenance supports the ${product.dosageForm.toLowerCase()} formulation used for medication reconciliation.`,
    keywords: [product.genericName, 'calcium channel blocker', product.dosageForm, product.releaseForm],
    concepts: ['medication-identity', 'calcium-channel-blocker', 'formulation-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04DhpCcbReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-DHP-CCB-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Explicit dihydropyridine calcium-channel-blocker product requires clinician review pending procedure policy adjudication',
    scope: { medicationIds: batch04DhpCcbIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: batch04DhpCcbIdentityDefinitions.map((product) => product.evidenceRef),
    status: 'TECHNICALLY_TESTED',
    priority: 60,
  },
];

export const batch04DhpCcbIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04DhpCcbIdentitySources,
  atoms: batch04DhpCcbIdentityAtoms,
};
