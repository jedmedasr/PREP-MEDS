import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T15:44:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-flecainide' | 'ING-propafenone' | 'ING-mexiletine' | 'ING-quinidine';

export interface Batch05ClassIAntiarrhythmicIdentityDefinition {
  medicationId:
    | 'MED-flecainide-tablet'
    | 'MED-propafenone-tablet'
    | 'MED-propafenone-er-capsule'
    | 'MED-mexiletine-capsule'
    | 'MED-quinidine-sulfate-tablet'
    | 'MED-quinidine-gluconate-er-tablet';
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'CAPSULE' | 'CAPSULE, EXTENDED RELEASE' | 'TABLET, EXTENDED RELEASE';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch05ClassIAntiarrhythmicIdentityDefinitions: Batch05ClassIAntiarrhythmicIdentityDefinition[] = [
  { medicationId: 'MED-flecainide-tablet', ingredientId: 'ING-flecainide', genericName: 'flecainide acetate', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-FLECAINIDE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-propafenone-tablet', ingredientId: 'ING-propafenone', genericName: 'propafenone hydrochloride', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B5-PROPAFENONE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-propafenone-er-capsule', ingredientId: 'ING-propafenone', genericName: 'propafenone hydrochloride', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-PROPAFENONE-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-mexiletine-capsule', ingredientId: 'ING-mexiletine', genericName: 'mexiletine hydrochloride', dosageForm: 'CAPSULE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-MEXILETINE-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-quinidine-sulfate-tablet', ingredientId: 'ING-quinidine', genericName: 'quinidine sulfate', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-QUINIDINE-SULFATE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-quinidine-gluconate-er-tablet', ingredientId: 'ING-quinidine', genericName: 'quinidine gluconate', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-QUINIDINE-GLUCONATE-ER-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch05ClassIAntiarrhythmicIdentityDefinition['medicationId'];
  id: string; publisher: string; setId: string; splVersion: number; effectiveDate: string; applicationNumber: string;
  labelListedMarketingEndDate?: string;
}> = [
  { medicationId: 'MED-flecainide-tablet', id: 'SRC-B5-FLECAINIDE-AUROBINDO-SPL5', publisher: 'Aurobindo Pharma Limited; DailyMed', setId: '14e89448-3a18-42e3-8537-2589be1ef94e', splVersion: 5, effectiveDate: '2024-01-09', applicationNumber: 'ANDA202821' },
  { medicationId: 'MED-propafenone-tablet', id: 'SRC-B5-PROPAFENONE-AUROBINDO-SPL4', publisher: 'Aurobindo Pharma Limited; DailyMed', setId: '0c887381-42fe-4f37-858a-d9ffb218dd1c', splVersion: 4, effectiveDate: '2023-07-21', applicationNumber: 'ANDA202445' },
  { medicationId: 'MED-propafenone-er-capsule', id: 'SRC-B5-PROPAFENONE-ER-VITRUVIAS-SPL3', publisher: 'Vitruvias Therapeutics; DailyMed', setId: 'bc1d2548-15a3-4986-92b1-c3ddfb35343a', splVersion: 3, effectiveDate: '2024-12-26', applicationNumber: 'ANDA210339' },
  { medicationId: 'MED-mexiletine-capsule', id: 'SRC-B5-MEXILETINE-ANI-SPL4', publisher: 'ANI Pharmaceuticals, Inc.; DailyMed', setId: '1b3a807f-368a-42dc-8266-ddf8347a8826', splVersion: 4, effectiveDate: '2025-11-07', applicationNumber: 'ANDA074450' },
  { medicationId: 'MED-quinidine-sulfate-tablet', id: 'SRC-B5-QUINIDINE-SULFATE-EON-SPL8', publisher: 'Eon Labs, Inc.; DailyMed', setId: 'a10b6ded-4fe0-4059-bd77-c45acc3c876d', splVersion: 8, effectiveDate: '2019-09-13', applicationNumber: 'ANDA088072', labelListedMarketingEndDate: '2025-05-31' },
  { medicationId: 'MED-quinidine-gluconate-er-tablet', id: 'SRC-B5-QUINIDINE-GLUCONATE-GSMS-SPL2', publisher: 'Golden State Medical Supply; DailyMed', setId: 'ad2ad985-cca2-25b5-e053-2995a90a402f', splVersion: 2, effectiveDate: '2024-08-27', applicationNumber: 'ANDA089338' },
];
const definitionByMedication = new Map(batch05ClassIAntiarrhythmicIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch05ClassIAntiarrhythmicIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, splVersion: source.splVersion, applicationNumber: source.applicationNumber,
      route: definition.route, dosageForm: definition.dosageForm,
      ...(source.labelListedMarketingEndDate ? { labelListedMarketingEndDate: source.labelListedMarketingEndDate } : {}),
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch05ClassIAntiarrhythmicIdentityAtoms: EvidenceAtom[] = batch05ClassIAntiarrhythmicIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} medication identity.`,
  normalizedTopic: 'batch05-class-i-antiarrhythmic-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-class-i-antiarrhythmic'], contextTags: [product.dosageForm.includes('EXTENDED RELEASE') ? 'extended-release-identity' : 'oral-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release profile, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Propafenone film-coated tablets and extended-release capsules remain distinct identities; PREP-MEDS does not authorize release-form conversion or substitution.',
    'Quinidine sulfate tablets and quinidine gluconate extended-release tablets remain distinct salt/form identities; bare quinidine fails closed.',
    'Label-listed marketing-end metadata is retained separately and does not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, substitution, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} oral identity`, summary: 'Direct DailyMed provenance supports this release/form-specific medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'antiarrhythmic', 'release-form-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch05ClassIAntiarrhythmicReviewRules: ClinicalRule[] = [{
  id: 'RULE-B5-CLASS-I-ANTIARRHYTHMIC-PRODUCT-REVIEW-001', version: 1,
  name: 'Explicit class I antiarrhythmic product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch05ClassIAntiarrhythmicIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch05ClassIAntiarrhythmicIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 60,
}];

export const batch05ClassIAntiarrhythmicIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: batch05ClassIAntiarrhythmicIdentitySources, atoms: batch05ClassIAntiarrhythmicIdentityAtoms,
};
