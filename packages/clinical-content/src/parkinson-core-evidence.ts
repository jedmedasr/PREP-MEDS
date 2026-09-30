import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T12:50:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-carbidopa-levodopa-ir-oral-tablet'
  | 'MED-carbidopa-levodopa-er-oral-tablet'
  | 'MED-rytary-carbidopa-levodopa-er-capsule'
  | 'MED-crexont-carbidopa-levodopa-er-capsule'
  | 'MED-duopa-carbidopa-levodopa-enteral-suspension'
  | 'MED-inbrija-levodopa-inhalation-capsule'
  | 'MED-neupro-rotigotine-er-transdermal-patch';
type IngredientId = 'ING-carbidopa' | 'ING-levodopa' | 'ING-rotigotine';

export interface ParkinsonCoreIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'ENTERAL' | 'ORAL_INHALATION' | 'TRANSDERMAL';
  releaseProfile: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  deliveryContext: 'SWALLOW_ORAL' | 'ENTERAL_PUMP' | 'INHALER_ONLY' | 'TRANSDERMAL_PATCH';
  evidenceRef: { id: string; version: number };
}

export const parkinsonCoreIdentityDefinitions: ParkinsonCoreIdentityDefinition[] = [
  { medicationId: 'MED-carbidopa-levodopa-ir-oral-tablet', ingredientIds: ['ING-carbidopa', 'ING-levodopa'], genericName: 'carbidopa/levodopa immediate release', dosageForm: 'TABLET', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', deliveryContext: 'SWALLOW_ORAL', evidenceRef: { id: 'EVD-CARBIDOPA-LEVODOPA-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-carbidopa-levodopa-er-oral-tablet', ingredientIds: ['ING-carbidopa', 'ING-levodopa'], genericName: 'carbidopa/levodopa extended release', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', deliveryContext: 'SWALLOW_ORAL', evidenceRef: { id: 'EVD-CARBIDOPA-LEVODOPA-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-rytary-carbidopa-levodopa-er-capsule', ingredientIds: ['ING-carbidopa', 'ING-levodopa'], genericName: 'carbidopa/levodopa extended release', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', deliveryContext: 'SWALLOW_ORAL', evidenceRef: { id: 'EVD-RYTARY-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-crexont-carbidopa-levodopa-er-capsule', ingredientIds: ['ING-carbidopa', 'ING-levodopa'], genericName: 'carbidopa/levodopa extended release', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', deliveryContext: 'SWALLOW_ORAL', evidenceRef: { id: 'EVD-CREXONT-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-duopa-carbidopa-levodopa-enteral-suspension', ingredientIds: ['ING-carbidopa', 'ING-levodopa'], genericName: 'carbidopa/levodopa enteral suspension', dosageForm: 'SUSPENSION', route: 'ENTERAL', releaseProfile: 'NOT_APPLICABLE', deliveryContext: 'ENTERAL_PUMP', evidenceRef: { id: 'EVD-DUOPA-ENTERAL-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-inbrija-levodopa-inhalation-capsule', ingredientIds: ['ING-levodopa'], genericName: 'levodopa inhalation powder', dosageForm: 'CAPSULE FOR INHALATION', route: 'ORAL_INHALATION', releaseProfile: 'NOT_APPLICABLE', deliveryContext: 'INHALER_ONLY', evidenceRef: { id: 'EVD-INBRIJA-INHALATION-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-neupro-rotigotine-er-transdermal-patch', ingredientIds: ['ING-rotigotine'], genericName: 'rotigotine extended release', dosageForm: 'PATCH, EXTENDED RELEASE', route: 'TRANSDERMAL', releaseProfile: 'EXTENDED_RELEASE', deliveryContext: 'TRANSDERMAL_PATCH', evidenceRef: { id: 'EVD-NEUPRO-ER-PATCH-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber?: string }> = [
  { medicationId: 'MED-carbidopa-levodopa-ir-oral-tablet', id: 'SRC-CARBIDOPA-LEVODOPA-IR-DRREDDYS-DIRECT-LABEL', publisher: "Dr. Reddy's Laboratories Inc; DailyMed", setId: '87ab55c9-203d-d595-3e3e-0e38f2f6d9c4', effectiveDate: '2026-05-19' },
  { medicationId: 'MED-carbidopa-levodopa-er-oral-tablet', id: 'SRC-CARBIDOPA-LEVODOPA-ER-SCIEGEN-ANDA214091', publisher: 'ScieGen Pharmaceuticals Inc; DailyMed', setId: '1b17ab1e-f3c1-4343-ba28-e2901cd97d43', effectiveDate: '2026-06-01', applicationNumber: 'ANDA214091' },
  { medicationId: 'MED-rytary-carbidopa-levodopa-er-capsule', id: 'SRC-RYTARY-AMNEAL-NDA203312', publisher: 'Amneal Pharmaceuticals LLC; DailyMed', setId: '6c1f7cd4-de56-45c1-a734-5e77b4aeb6f7', effectiveDate: '2026-03-26', applicationNumber: 'NDA203312' },
  { medicationId: 'MED-crexont-carbidopa-levodopa-er-capsule', id: 'SRC-CREXONT-AMNEAL-NDA217186', publisher: 'Amneal Pharmaceuticals LLC; DailyMed', setId: '095a08b6-b0b8-4f88-b759-67e8b87287a0', effectiveDate: '2026-05-29', applicationNumber: 'NDA217186' },
  { medicationId: 'MED-duopa-carbidopa-levodopa-enteral-suspension', id: 'SRC-DUOPA-ABBVIE-NDA203952', publisher: 'AbbVie Inc.; DailyMed', setId: '7066d371-dc6a-0d6f-7bed-e5dd4ee912da', effectiveDate: '2026-03-19', applicationNumber: 'NDA203952' },
  { medicationId: 'MED-inbrija-levodopa-inhalation-capsule', id: 'SRC-INBRIJA-MERZ-NDA209184', publisher: 'Merz Pharmaceuticals, LLC; DailyMed', setId: 'a906f8e1-6e1c-480a-8276-c01bc65dd3be', effectiveDate: '2026-01-16', applicationNumber: 'NDA209184' },
  { medicationId: 'MED-neupro-rotigotine-er-transdermal-patch', id: 'SRC-NEUPRO-UCB-NDA021829', publisher: 'UCB, Inc.; DailyMed', setId: '939e28c5-f3a9-42c0-9a2d-8d471d82a6e0', effectiveDate: '2026-09-10', applicationNumber: 'NDA021829' },
];
const definitionByMedication = new Map(parkinsonCoreIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const parkinsonCoreIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}${source.applicationNumber ? `; ${source.applicationNumber}` : ''}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, releaseProfile: definition.releaseProfile,
      deliveryContext: definition.deliveryContext, representativeIdentityOnly: true,
      indicationNotInferred: true, currentRegimenNotInferred: true, offStateNotInferred: true,
      enteralAccessNotInferred: true, pulmonaryStatusNotInferred: true, anesthesiaPlanNotInferred: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false,
      routeConversionAuthorized: false, deviceConversionAuthorized: false, formulationConversionAuthorized: false,
      combinationDecompositionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const parkinsonCoreIdentityAtoms: EvidenceAtom[] = parkinsonCoreIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} identity with the stated release and delivery context.`,
  normalizedTopic: 'parkinson-dopaminergic-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-parkinson-dopaminergic'], contextTags: ['route-form-release-device-identity', 'anesthesia-review-only'] },
  locator: { section: 'Highlights; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release profile, delivery context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, or current commercial availability.',
    'Immediate-release tablet, extended-release tablet, RYTARY, CREXONT, DUOPA, INBRIJA, and NEUPRO remain distinct identities; carbidopa/levodopa products are not mutually interchangeable and combination ingredients are not decomposed into standalone medication decisions.',
    'Parkinson indication and severity, current regimen, oral tolerance, OFF-state risk, withdrawal or neuroleptic-malignant-syndrome-like risk, enteral access and pump status, inhaler technique and pulmonary status, patch status, concomitant dopaminergic therapy, procedure plan, and anesthesia plan require accountable clinician review.',
    'INBRIJA capsules are an inhalation-powder identity for use with its inhaler and must not be represented as swallowed oral capsules; DUOPA remains enteral-pump specific.',
    'No autonomous continuation, interruption, taper, dose or release conversion, route or device conversion, substitution, anesthesia plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this route/form/release/device-specific Parkinson medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.route, product.releaseProfile], concepts: ['medication-identity', 'parkinson-dopaminergic', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const parkinsonCoreReviewRules: ClinicalRule[] = [{
  id: 'RULE-PARKINSON-CORE-ANESTHESIA-REVIEW-001', version: 1,
  name: 'Explicit Parkinson dopaminergic product requires clinician and anesthesia review',
  scope: { medicationIds: parkinsonCoreIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: parkinsonCoreIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 93,
}];

export const parkinsonCoreIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: parkinsonCoreIdentitySources, atoms: parkinsonCoreIdentityAtoms,
};
