import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T02:05:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-prednisone-immediate-release-oral-tablet'
  | 'MED-prednisone-delayed-release-oral-tablet'
  | 'MED-prednisolone-oral-tablet'
  | 'MED-prednisolone-sodium-phosphate-oral-solution'
  | 'MED-medrol-methylprednisolone-oral-tablet'
  | 'MED-solu-medrol-methylprednisolone-sodium-succinate-injection'
  | 'MED-cortef-hydrocortisone-oral-tablet'
  | 'MED-solu-cortef-hydrocortisone-sodium-succinate-injection'
  | 'MED-dexamethasone-oral-tablet'
  | 'MED-dexamethasone-sodium-phosphate-injection';
type IngredientId = 'ING-prednisone' | 'ING-prednisolone' | 'ING-methylprednisolone' | 'ING-hydrocortisone' | 'ING-dexamethasone';

export interface SystemicCorticosteroidIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'INTRAVENOUS_OR_INTRAMUSCULAR';
  releaseContext: 'IMMEDIATE_RELEASE' | 'DELAYED_RELEASE' | 'NOT_APPLICABLE';
  evidenceRef: { id: string; version: number };
}

export const systemicCorticosteroidIdentityDefinitions: SystemicCorticosteroidIdentityDefinition[] = [
  { medicationId: 'MED-prednisone-immediate-release-oral-tablet', ingredientId: 'ING-prednisone', genericName: 'prednisone immediate-release', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-PREDNISONE-IR-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-prednisone-delayed-release-oral-tablet', ingredientId: 'ING-prednisone', genericName: 'prednisone delayed-release', dosageForm: 'TABLET, DELAYED RELEASE', route: 'ORAL', releaseContext: 'DELAYED_RELEASE', evidenceRef: { id: 'EVD-PREDNISONE-DR-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-prednisolone-oral-tablet', ingredientId: 'ING-prednisolone', genericName: 'prednisolone oral', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-PREDNISOLONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-prednisolone-sodium-phosphate-oral-solution', ingredientId: 'ING-prednisolone', genericName: 'prednisolone sodium phosphate oral', dosageForm: 'SOLUTION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-PREDNISOLONE-SODIUM-PHOSPHATE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-medrol-methylprednisolone-oral-tablet', ingredientId: 'ING-methylprednisolone', genericName: 'methylprednisolone oral', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-MEDROL-METHYLPREDNISOLONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-solu-medrol-methylprednisolone-sodium-succinate-injection', ingredientId: 'ING-methylprednisolone', genericName: 'methylprednisolone sodium succinate injection', dosageForm: 'INJECTION, POWDER, FOR SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-SOLU-MEDROL-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-cortef-hydrocortisone-oral-tablet', ingredientId: 'ING-hydrocortisone', genericName: 'hydrocortisone oral', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-CORTEF-HYDROCORTISONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-solu-cortef-hydrocortisone-sodium-succinate-injection', ingredientId: 'ING-hydrocortisone', genericName: 'hydrocortisone sodium succinate injection', dosageForm: 'INJECTION, POWDER, FOR SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-SOLU-CORTEF-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-dexamethasone-oral-tablet', ingredientId: 'ING-dexamethasone', genericName: 'dexamethasone oral', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-DEXAMETHASONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-dexamethasone-sodium-phosphate-injection', ingredientId: 'ING-dexamethasone', genericName: 'dexamethasone sodium phosphate injection', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-DEXAMETHASONE-SODIUM-PHOSPHATE-INJECTION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-prednisone-immediate-release-oral-tablet', id: 'SRC-PREDNISONE-IR-QPHARMA-ANDA080292', publisher: 'QPharma, Inc.; DailyMed', setId: 'c0e147a8-36a9-1e61-e053-2a95a90afd62', effectiveDate: '2025-12-19', applicationNumber: 'ANDA080292' },
  { medicationId: 'MED-prednisone-delayed-release-oral-tablet', id: 'SRC-PREDNISONE-DR-DRREDDYS-ANDA219477', publisher: "Dr. Reddy's Laboratories Inc.; DailyMed", setId: '01bdc479-1f1f-af94-837c-12e7e861321a', effectiveDate: '2025-12-15', applicationNumber: 'ANDA219477' },
  { medicationId: 'MED-prednisolone-oral-tablet', id: 'SRC-PREDNISOLONE-TABLET-CHARTWELL-ANDA080531', publisher: 'Chartwell RX, LLC; DailyMed', setId: '2e965355-f7f2-4dd3-9c5c-1524c6f39c91', effectiveDate: '2024-06-18', applicationNumber: 'ANDA080531' },
  { medicationId: 'MED-prednisolone-sodium-phosphate-oral-solution', id: 'SRC-PREDNISOLONE-SOLUTION-CHARTWELL-ANDA075988', publisher: 'Chartwell RX, LLC; DailyMed', setId: '2d8c861d-3756-4b75-aaa9-1b82cf11eb94', effectiveDate: '2026-02-13', applicationNumber: 'ANDA075988' },
  { medicationId: 'MED-medrol-methylprednisolone-oral-tablet', id: 'SRC-MEDROL-PFIZER-NDA011153', publisher: 'Pharmacia & Upjohn Company LLC; DailyMed', setId: '39d5270b-d957-4821-93d6-501b7b9f02d4', effectiveDate: '2025-11-18', applicationNumber: 'NDA011153' },
  { medicationId: 'MED-solu-medrol-methylprednisolone-sodium-succinate-injection', id: 'SRC-SOLU-MEDROL-PFIZER-NDA011856', publisher: 'Pharmacia & Upjohn Company LLC; DailyMed', setId: '7271310c-7764-4812-aa30-a5e90987c7a9', effectiveDate: '2026-06-26', applicationNumber: 'NDA011856' },
  { medicationId: 'MED-cortef-hydrocortisone-oral-tablet', id: 'SRC-CORTEF-PFIZER-NDA008697', publisher: 'Pharmacia & Upjohn Company LLC; DailyMed', setId: '9ce19944-dd88-4a7b-84ca-b07f4ec23bad', effectiveDate: '2025-02-17', applicationNumber: 'NDA008697' },
  { medicationId: 'MED-solu-cortef-hydrocortisone-sodium-succinate-injection', id: 'SRC-SOLU-CORTEF-CARDINAL-NDA009866', publisher: 'Cardinal Health 107, LLC; DailyMed', setId: 'f5bb0854-a477-4e59-914b-eeeaef92a596', effectiveDate: '2025-08-25', applicationNumber: 'NDA009866' },
  { medicationId: 'MED-dexamethasone-oral-tablet', id: 'SRC-DEXAMETHASONE-TABLET-CARDINAL-ANDA087916', publisher: 'Cardinal Health 107, LLC; DailyMed', setId: 'bf8acfdb-8dc8-4a69-90b0-33c680c421d6', effectiveDate: '2026-05-25', applicationNumber: 'ANDA087916' },
  { medicationId: 'MED-dexamethasone-sodium-phosphate-injection', id: 'SRC-DEXAMETHASONE-INJECTION-HIKMA-ANDA087702', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '0277cc0a-2fd4-4605-a310-b613be84ee26', effectiveDate: '2026-01-23', applicationNumber: 'ANDA087702' },
];

const definitionByMedication = new Map(systemicCorticosteroidIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const systemicCorticosteroidIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, releaseContext: definition.releaseContext,
      representativeIdentityOnly: true, chronicUseNotInferred: true, doseNotInferred: true,
      adrenalSuppressionNotInferred: true, stressDoseNeedNotInferred: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false,
      formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const systemicCorticosteroidIdentityAtoms: EvidenceAtom[] = systemicCorticosteroidIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} systemic corticosteroid identity.`,
  normalizedTopic: 'systemic-corticosteroid-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-systemic-corticosteroid'], contextTags: ['route-form-release-identity', 'adrenal-context-review-only'] },
  locator: { section: 'Description; Warnings and Precautions; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, and application provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, dose, duration, adherence, or current commercial availability.',
    'Prednisone immediate-release and delayed-release tablets, prednisolone tablet and sodium-phosphate oral solution, and oral versus injectable methylprednisolone and hydrocortisone remain distinct identities.',
    'Chronicity, indication, dose and duration, recent dose changes or interruption, HPA-axis suppression, adrenal insufficiency, infection, glucose effects, procedure stress, and ability to take oral medication require accountable clinician review.',
    'No autonomous continuation, interruption, taper, route or formulation conversion, supplementation, stress-dose plan, substitution, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} systemic corticosteroid identity`, summary: 'Direct DailyMed provenance supports this route/form/release medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'systemic-corticosteroid', 'adrenal-context'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const systemicCorticosteroidReviewRules: ClinicalRule[] = [{
  id: 'RULE-SYSTEMIC-CORTICOSTEROID-REVIEW-001', version: 1,
  name: 'Explicit systemic corticosteroid identity requires clinician review for chronicity and adrenal context',
  scope: { medicationIds: systemicCorticosteroidIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: systemicCorticosteroidIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 89,
}];

export const systemicCorticosteroidIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: systemicCorticosteroidIdentitySources, atoms: systemicCorticosteroidIdentityAtoms,
};
