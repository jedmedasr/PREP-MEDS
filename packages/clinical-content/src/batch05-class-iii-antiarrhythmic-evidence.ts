import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T14:47:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-amiodarone' | 'ING-dronedarone' | 'ING-sotalol' | 'ING-dofetilide';

export interface Batch05ClassIIIAntiarrhythmicIdentityDefinition {
  medicationId:
    | 'MED-amiodarone-tablet'
    | 'MED-amiodarone-injection'
    | 'MED-dronedarone-multaq-tablet'
    | 'MED-sotalol-tablet'
    | 'MED-sotalol-af-tablet'
    | 'MED-sotalol-sotylize-solution'
    | 'MED-sotalol-injection'
    | 'MED-dofetilide-tikosyn-capsule';
  ingredientId: IngredientId;
  genericName: string;
  brandName?: 'MULTAQ' | 'SOTYLIZE' | 'TIKOSYN';
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'INJECTION, SOLUTION' | 'SOLUTION' | 'CAPSULE';
  route: 'ORAL' | 'INTRAVENOUS';
  evidenceRef: { id: string; version: number };
}

export const batch05ClassIIIAntiarrhythmicIdentityDefinitions: Batch05ClassIIIAntiarrhythmicIdentityDefinition[] = [
  { medicationId: 'MED-amiodarone-tablet', ingredientId: 'ING-amiodarone', genericName: 'amiodarone hydrochloride', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-AMIODARONE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-amiodarone-injection', ingredientId: 'ING-amiodarone', genericName: 'amiodarone hydrochloride', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', evidenceRef: { id: 'EVD-B5-AMIODARONE-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-dronedarone-multaq-tablet', ingredientId: 'ING-dronedarone', genericName: 'dronedarone', brandName: 'MULTAQ', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B5-MULTAQ-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-sotalol-tablet', ingredientId: 'ING-sotalol', genericName: 'sotalol hydrochloride', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-SOTALOL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-sotalol-af-tablet', ingredientId: 'ING-sotalol', genericName: 'sotalol hydrochloride AF', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-SOTALOL-AF-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-sotalol-sotylize-solution', ingredientId: 'ING-sotalol', genericName: 'sotalol hydrochloride', brandName: 'SOTYLIZE', dosageForm: 'SOLUTION', route: 'ORAL', evidenceRef: { id: 'EVD-B5-SOTYLIZE-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-sotalol-injection', ingredientId: 'ING-sotalol', genericName: 'sotalol hydrochloride', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', evidenceRef: { id: 'EVD-B5-SOTALOL-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-dofetilide-tikosyn-capsule', ingredientId: 'ING-dofetilide', genericName: 'dofetilide', brandName: 'TIKOSYN', dosageForm: 'CAPSULE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-TIKOSYN-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch05ClassIIIAntiarrhythmicIdentityDefinition['medicationId'];
  id: string; publisher: string; setId: string; splVersion: number; effectiveDate: string; applicationNumber: string; labelNdcStatus?: 'INACTIVATED';
}> = [
  { medicationId: 'MED-amiodarone-tablet', id: 'SRC-B5-AMIODARONE-TARO-SPL19', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', setId: '7ccd3733-c3af-4a11-8500-0f99194c1472', splVersion: 19, effectiveDate: '2026-03-11', applicationNumber: 'ANDA075424; ANDA076362' },
  { medicationId: 'MED-amiodarone-injection', id: 'SRC-B5-AMIODARONE-MPS-SPL5', publisher: 'Medical Purchasing Solutions, LLC; DailyMed', setId: '66700f8b-3f76-3749-e053-2a91aa0adfdb', splVersion: 5, effectiveDate: '2023-04-18', applicationNumber: 'ANDA077234' },
  { medicationId: 'MED-dronedarone-multaq-tablet', id: 'SRC-B5-MULTAQ-PTC-SPL2', publisher: 'Physicians Total Care, Inc.; DailyMed', setId: '236d4549-f44b-4677-b857-acedd10b9920', splVersion: 2, effectiveDate: '2011-12-28', applicationNumber: 'NDA022425', labelNdcStatus: 'INACTIVATED' },
  { medicationId: 'MED-sotalol-tablet', id: 'SRC-B5-SOTALOL-MARLEX-SPL4', publisher: 'Marlex Pharmaceuticals Inc.; DailyMed', setId: '3c24cdf0-4648-4e5d-993c-1f428ce56a65', splVersion: 4, effectiveDate: '2021-12-01', applicationNumber: 'ANDA207428' },
  { medicationId: 'MED-sotalol-af-tablet', id: 'SRC-B5-SOTALOL-AF-BAYSHORE-SPL2', publisher: 'Bayshore Pharmaceuticals LLC; DailyMed', setId: '2577dd8d-ab1b-4a55-990a-18c69395edfe', splVersion: 2, effectiveDate: '2024-01-17', applicationNumber: 'ANDA207429' },
  { medicationId: 'MED-sotalol-sotylize-solution', id: 'SRC-B5-SOTYLIZE-AZURITY-SPL6', publisher: 'Azurity Pharmaceuticals, Inc.; DailyMed', setId: '1f33f900-0777-4a92-a7f7-00cf3d57d95c', splVersion: 6, effectiveDate: '2024-01-24', applicationNumber: 'NDA205108' },
  { medicationId: 'MED-sotalol-injection', id: 'SRC-B5-SOTALOL-ALTATHERA-SPL15', publisher: 'ALTATHERA Pharmaceuticals, LLC; DailyMed', setId: 'ff3061ab-d930-4318-a5be-684e38be229e', splVersion: 15, effectiveDate: '2025-07-31', applicationNumber: 'NDA022306' },
  { medicationId: 'MED-dofetilide-tikosyn-capsule', id: 'SRC-B5-TIKOSYN-PFIZER-SPL30', publisher: 'Pfizer Laboratories Div Pfizer Inc; DailyMed', setId: '02438044-d6a3-49e9-a1ac-3aad21ef2c8c', splVersion: 30, effectiveDate: '2026-04-21', applicationNumber: 'NDA020931' },
];
const definitionByMedication = new Map(batch05ClassIIIAntiarrhythmicIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch05ClassIIIAntiarrhythmicIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      ...(source.labelNdcStatus ? { labelNdcStatus: source.labelNdcStatus } : {}),
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch05ClassIIIAntiarrhythmicIdentityAtoms: EvidenceAtom[] = batch05ClassIIIAntiarrhythmicIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.brandName ?? product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} medication identity.`,
  normalizedTopic: 'batch05-class-iii-antiarrhythmic-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-class-iii-antiarrhythmic'], contextTags: [product.route === 'INTRAVENOUS' ? 'intravenous-identity' : 'oral-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Oral and intravenous amiodarone remain distinct identities; PREP-MEDS does not authorize route conversion or substitution.',
    'Standard sotalol tablets, sotalol AF tablets, SOTYLIZE oral solution, and intravenous sotalol remain distinct identities; bare sotalol fails closed.',
    'The sotalol AF label states that standard sotalol tablets must not be substituted for sotalol AF tablets because their labeling differs.',
    'DailyMed/FDA listing, historical labeling, and NDC status do not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, substitution, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.brandName ?? product.genericName} ${product.route.toLowerCase()} identity`, summary: 'Direct DailyMed provenance supports this route/form-specific medication-reconciliation identity.', keywords: [product.brandName ?? product.genericName, product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'antiarrhythmic', 'route-form-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch05ClassIIIAntiarrhythmicReviewRules: ClinicalRule[] = [{
  id: 'RULE-B5-CLASS-III-ANTIARRHYTHMIC-PRODUCT-REVIEW-001', version: 1,
  name: 'Explicit class III antiarrhythmic product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch05ClassIIIAntiarrhythmicIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch05ClassIIIAntiarrhythmicIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 60,
}];

export const batch05ClassIIIAntiarrhythmicIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: batch05ClassIIIAntiarrhythmicIdentitySources, atoms: batch05ClassIIIAntiarrhythmicIdentityAtoms,
};
