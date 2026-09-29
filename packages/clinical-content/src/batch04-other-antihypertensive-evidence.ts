import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T13:34:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-clonidine' | 'ING-hydralazine' | 'ING-minoxidil' | 'ING-doxazosin' | 'ING-prazosin';

export interface Batch04OtherAntihypertensiveIdentityDefinition {
  medicationId:
    | 'MED-clonidine-tablet'
    | 'MED-clonidine-catapres-tts-patch'
    | 'MED-hydralazine-tablet'
    | 'MED-minoxidil-oral-tablet'
    | 'MED-doxazosin-tablet'
    | 'MED-prazosin-capsule';
  ingredientId: IngredientId;
  genericName: string;
  brandName?: 'CATAPRES-TTS';
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'PATCH' | 'CAPSULE';
  route: 'ORAL' | 'TRANSDERMAL';
  evidenceRef: { id: string; version: number };
}

export const batch04OtherAntihypertensiveIdentityDefinitions: Batch04OtherAntihypertensiveIdentityDefinition[] = [
  { medicationId: 'MED-clonidine-tablet', ingredientId: 'ING-clonidine', genericName: 'clonidine hydrochloride', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-CLONIDINE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-clonidine-catapres-tts-patch', ingredientId: 'ING-clonidine', genericName: 'clonidine', brandName: 'CATAPRES-TTS', dosageForm: 'PATCH', route: 'TRANSDERMAL', evidenceRef: { id: 'EVD-B4-CATAPRES-TTS-PATCH-IDENTITY', version: 1 } },
  { medicationId: 'MED-hydralazine-tablet', ingredientId: 'ING-hydralazine', genericName: 'hydralazine hydrochloride', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-HYDRALAZINE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-minoxidil-oral-tablet', ingredientId: 'ING-minoxidil', genericName: 'minoxidil', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-MINOXIDIL-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-doxazosin-tablet', ingredientId: 'ING-doxazosin', genericName: 'doxazosin mesylate', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-DOXAZOSIN-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-prazosin-capsule', ingredientId: 'ING-prazosin', genericName: 'prazosin hydrochloride', dosageForm: 'CAPSULE', route: 'ORAL', evidenceRef: { id: 'EVD-B4-PRAZOSIN-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04OtherAntihypertensiveIdentityDefinition['medicationId'];
  id: string; publisher: string; setId: string; splVersion: number; effectiveDate: string; applicationNumber: string; labelListedMarketingEndDate?: string;
}> = [
  { medicationId: 'MED-clonidine-tablet', id: 'SRC-B4-CLONIDINE-CARDINAL-SPL6', publisher: 'Cardinal Health 107, LLC; DailyMed', setId: 'df62817d-2f50-4c27-aaa8-a22f0290c94f', splVersion: 6, effectiveDate: '2026-05-01', applicationNumber: 'ANDA070974; ANDA070975' },
  { medicationId: 'MED-clonidine-catapres-tts-patch', id: 'SRC-B4-CATAPRES-TTS-TECHNOMED-SPL4', publisher: 'Technomed Inc.; DailyMed', setId: 'd4a55825-7041-42f4-b3b2-dd7a25dbe793', splVersion: 4, effectiveDate: '2024-10-11', applicationNumber: 'NDA018891', labelListedMarketingEndDate: '2026-10-30' },
  { medicationId: 'MED-hydralazine-tablet', id: 'SRC-B4-HYDRALAZINE-MACLEODS-SPL1', publisher: 'Macleods Pharmaceuticals Limited; DailyMed', setId: 'f9f56326-6d72-47d3-89ac-3625b8a6d713', splVersion: 1, effectiveDate: '2024-09-06', applicationNumber: 'ANDA211010' },
  { medicationId: 'MED-minoxidil-oral-tablet', id: 'SRC-B4-MINOXIDIL-SUN-SPL5', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', setId: '0354a7f5-5917-44dc-9963-411104008cb5', splVersion: 5, effectiveDate: '2026-02-09', applicationNumber: 'ANDA072709' },
  { medicationId: 'MED-doxazosin-tablet', id: 'SRC-B4-DOXAZOSIN-CHARTWELL-SPL1', publisher: 'Chartwell RX, LLC; DailyMed', setId: 'a7f589b0-eebb-48cb-912f-a4bd956e4dcb', splVersion: 1, effectiveDate: '2023-06-09', applicationNumber: 'ANDA075646' },
  { medicationId: 'MED-prazosin-capsule', id: 'SRC-B4-PRAZOSIN-PDRX-SPL11', publisher: 'PD-Rx Pharmaceuticals, Inc.; DailyMed', setId: 'cd52f022-ca29-4f87-8684-da63e05b3c1f', splVersion: 11, effectiveDate: '2025-10-21', applicationNumber: 'ANDA072575' },
];
const definitionByMedication = new Map(batch04OtherAntihypertensiveIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04OtherAntihypertensiveIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.brandName ?? definition.genericName} ${definition.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, splVersion: source.splVersion, applicationNumber: source.applicationNumber,
      route: definition.route, dosageForm: definition.dosageForm,
      ...(source.labelListedMarketingEndDate ? { labelListedMarketingEndDate: source.labelListedMarketingEndDate } : {}),
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04OtherAntihypertensiveIdentityAtoms: EvidenceAtom[] = batch04OtherAntihypertensiveIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.brandName ?? product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} medication identity.`,
  normalizedTopic: 'batch04-other-antihypertensive-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-antihypertensive'], contextTags: [product.route === 'TRANSDERMAL' ? 'transdermal-identity' : 'oral-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Clonidine oral and transdermal products remain distinct identities; PREP-MEDS does not authorize route conversion or substitution.',
    'Bare minoxidil remains unresolved because topical and systemic products are clinically distinct; only explicit systemic oral-tablet wording maps to this Batch 04 identity.',
    'DailyMed/FDA listing and any label-listed marketing-end metadata do not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.brandName ?? product.genericName} ${product.route.toLowerCase()} identity`, summary: `Direct DailyMed provenance supports this route/form-specific medication-reconciliation identity.`, keywords: [product.brandName ?? product.genericName, product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'antihypertensive', 'route-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch04OtherAntihypertensiveReviewRules: ClinicalRule[] = [{
  id: 'RULE-B4-OTHER-ANTIHYPERTENSIVE-PRODUCT-REVIEW-001', version: 1,
  name: 'Explicit other-antihypertensive product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch04OtherAntihypertensiveIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch04OtherAntihypertensiveIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 60,
}];

export const batch04OtherAntihypertensiveIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: batch04OtherAntihypertensiveIdentitySources, atoms: batch04OtherAntihypertensiveIdentityAtoms,
};
