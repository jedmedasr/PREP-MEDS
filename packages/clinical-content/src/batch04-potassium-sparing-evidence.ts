import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T10:46:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-spironolactone' | 'ING-eplerenone' | 'ING-amiloride' | 'ING-triamterene' | 'ING-hydrochlorothiazide';

export interface Batch04PotassiumSparingIdentityDefinition {
  medicationId:
    | 'MED-spironolactone-tablet'
    | 'MED-spironolactone-carospir-suspension'
    | 'MED-eplerenone-tablet'
    | 'MED-amiloride-tablet'
    | 'MED-triamterene-dyrenium-capsule'
    | 'MED-spironolactone-hydrochlorothiazide-tablet'
    | 'MED-amiloride-hydrochlorothiazide-tablet'
    | 'MED-triamterene-hydrochlorothiazide-capsule'
    | 'MED-triamterene-hydrochlorothiazide-tablet';
  ingredientIds: IngredientId[];
  genericName: string;
  brandName?: 'CAROSPIR' | 'DYRENIUM';
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'SUSPENSION' | 'CAPSULE';
  route: 'ORAL';
  combination: boolean;
  evidenceRef: { id: string; version: number };
}

export const batch04PotassiumSparingIdentityDefinitions: Batch04PotassiumSparingIdentityDefinition[] = [
  { medicationId: 'MED-spironolactone-tablet', ingredientIds: ['ING-spironolactone'], genericName: 'spironolactone', dosageForm: 'TABLET', route: 'ORAL', combination: false, evidenceRef: { id: 'EVD-B4-SPIRONOLACTONE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-spironolactone-carospir-suspension', ingredientIds: ['ING-spironolactone'], genericName: 'spironolactone', brandName: 'CAROSPIR', dosageForm: 'SUSPENSION', route: 'ORAL', combination: false, evidenceRef: { id: 'EVD-B4-CAROSPIR-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-eplerenone-tablet', ingredientIds: ['ING-eplerenone'], genericName: 'eplerenone', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', combination: false, evidenceRef: { id: 'EVD-B4-EPLERENONE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-amiloride-tablet', ingredientIds: ['ING-amiloride'], genericName: 'amiloride hydrochloride', dosageForm: 'TABLET', route: 'ORAL', combination: false, evidenceRef: { id: 'EVD-B4-AMILORIDE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-triamterene-dyrenium-capsule', ingredientIds: ['ING-triamterene'], genericName: 'triamterene', brandName: 'DYRENIUM', dosageForm: 'CAPSULE', route: 'ORAL', combination: false, evidenceRef: { id: 'EVD-B4-DYRENIUM-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-spironolactone-hydrochlorothiazide-tablet', ingredientIds: ['ING-spironolactone', 'ING-hydrochlorothiazide'], genericName: 'spironolactone and hydrochlorothiazide', dosageForm: 'TABLET', route: 'ORAL', combination: true, evidenceRef: { id: 'EVD-B4-SPIRONOLACTONE-HCTZ-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-amiloride-hydrochlorothiazide-tablet', ingredientIds: ['ING-amiloride', 'ING-hydrochlorothiazide'], genericName: 'amiloride hydrochloride and hydrochlorothiazide', dosageForm: 'TABLET', route: 'ORAL', combination: true, evidenceRef: { id: 'EVD-B4-AMILORIDE-HCTZ-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-triamterene-hydrochlorothiazide-capsule', ingredientIds: ['ING-triamterene', 'ING-hydrochlorothiazide'], genericName: 'triamterene and hydrochlorothiazide', dosageForm: 'CAPSULE', route: 'ORAL', combination: true, evidenceRef: { id: 'EVD-B4-TRIAMTERENE-HCTZ-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-triamterene-hydrochlorothiazide-tablet', ingredientIds: ['ING-triamterene', 'ING-hydrochlorothiazide'], genericName: 'triamterene and hydrochlorothiazide', dosageForm: 'TABLET', route: 'ORAL', combination: true, evidenceRef: { id: 'EVD-B4-TRIAMTERENE-HCTZ-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: Batch04PotassiumSparingIdentityDefinition['medicationId']; id: string; publisher: string; setId: string; splVersion: number; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-spironolactone-tablet', id: 'SRC-B4-SPIRONOLACTONE-SUN-SPL16', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', setId: 'c23b6b9b-aec3-48a8-a518-76e4097f6479', splVersion: 16, effectiveDate: '2026-07-31', applicationNumber: 'ANDA089424' },
  { medicationId: 'MED-spironolactone-carospir-suspension', id: 'SRC-B4-CAROSPIR-CMP-SPL7', publisher: 'CMP Pharma, Inc.; DailyMed', setId: 'c4f70a04-7d89-4b73-8b02-17d43471bf08', splVersion: 7, effectiveDate: '2023-09-15', applicationNumber: 'NDA209478' },
  { medicationId: 'MED-eplerenone-tablet', id: 'SRC-B4-EPLERENONE-BRECKENRIDGE-SPL8', publisher: 'Breckenridge Pharmaceutical, Inc.; DailyMed', setId: 'e2a51c12-bdc2-4b3b-8e9e-bf363c2817ed', splVersion: 8, effectiveDate: '2026-03-17', applicationNumber: 'ANDA208283' },
  { medicationId: 'MED-amiloride-tablet', id: 'SRC-B4-AMILORIDE-PAR-SPL13', publisher: 'Par Health USA, LLC; DailyMed', setId: 'e0cc2d44-436a-47e8-a890-589882fff4c4', splVersion: 13, effectiveDate: '2026-07-28', applicationNumber: 'ANDA070346' },
  { medicationId: 'MED-triamterene-dyrenium-capsule', id: 'SRC-B4-DYRENIUM-ADVANZ-SPL11', publisher: 'Advanz Pharma (US) Corp.; DailyMed', setId: 'ebb177c0-d45d-4443-a85a-e76bd9931a42', splVersion: 11, effectiveDate: '2024-12-05', applicationNumber: 'NDA013174' },
  { medicationId: 'MED-spironolactone-hydrochlorothiazide-tablet', id: 'SRC-B4-SPIRONOLACTONE-HCTZ-BRYANT-SPL10', publisher: 'Bryant Ranch Prepack; DailyMed', setId: '3c9ceab1-75e9-47b0-a062-33d7d446b88a', splVersion: 10, effectiveDate: '2024-08-20', applicationNumber: 'ANDA089534' },
  { medicationId: 'MED-amiloride-hydrochlorothiazide-tablet', id: 'SRC-B4-AMILORIDE-HCTZ-TEVA-SPL12', publisher: 'Teva Pharmaceuticals USA, Inc.; DailyMed', setId: '8b2c581a-f955-4a8e-bf85-e768e903fd10', splVersion: 12, effectiveDate: '2022-12-27', applicationNumber: 'ANDA071111' },
  { medicationId: 'MED-triamterene-hydrochlorothiazide-capsule', id: 'SRC-B4-TRIAMTERENE-HCTZ-SANDOZ-CAPSULE-SPL24', publisher: 'Sandoz Inc.; DailyMed', setId: 'f824b6ba-bd1c-41a8-8f6f-ad507b48f3e0', splVersion: 24, effectiveDate: '2026-07-16', applicationNumber: 'ANDA074821' },
  { medicationId: 'MED-triamterene-hydrochlorothiazide-tablet', id: 'SRC-B4-TRIAMTERENE-HCTZ-ACTAVIS-TABLET-SPL17', publisher: 'Actavis Pharma, Inc.; DailyMed', setId: 'abf2fe45-8b69-4d3c-981e-289c0aa3e98b', splVersion: 17, effectiveDate: '2024-05-01', applicationNumber: 'ANDA073449; ANDA071851' },
];
const definitionByMedication = new Map(batch04PotassiumSparingIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04PotassiumSparingIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      route: definition.route, dosageForm: definition.dosageForm, combination: definition.combination, ingredientIds: definition.ingredientIds,
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      combinationSubstitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04PotassiumSparingIdentityAtoms: EvidenceAtom[] = batch04PotassiumSparingIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.brandName ?? product.genericName} as an oral ${product.dosageForm.toLowerCase()} ${product.combination ? 'fixed-combination' : 'single-ingredient'} medication identity.`,
  normalizedTopic: 'batch04-potassium-sparing-mra-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-potassium-sparing-diuretic'], contextTags: [product.combination ? 'fixed-combination-identity' : 'single-ingredient-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient composition, oral route, dosage form, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Single-ingredient and hydrochlorothiazide-containing products remain distinct whole-product identities; PREP-MEDS does not authorize component substitution or conversion.',
    'DailyMed/FDA listing does not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.brandName ?? product.genericName} product identity`, summary: `Direct DailyMed provenance supports this ${product.combination ? 'fixed-combination' : 'single-ingredient'} potassium-sparing/MRA product as a distinct medication-reconciliation identity.`, keywords: [product.brandName ?? product.genericName, product.genericName, product.dosageForm, product.combination ? 'fixed combination' : 'single ingredient'], concepts: ['medication-identity', 'potassium-sparing-diuretic', product.combination ? 'combination-product' : 'formulation-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch04PotassiumSparingReviewRules: ClinicalRule[] = [{
  id: 'RULE-B4-POTASSIUM-SPARING-MRA-PRODUCT-REVIEW-001', version: 1,
  name: 'Explicit potassium-sparing/MRA product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch04PotassiumSparingIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch04PotassiumSparingIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 60,
}];

export const batch04PotassiumSparingIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: batch04PotassiumSparingIdentitySources, atoms: batch04PotassiumSparingIdentityAtoms,
};
