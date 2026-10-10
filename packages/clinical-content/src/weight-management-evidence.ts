import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T12:05:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-phentermine-hydrochloride-oral-capsule'
  | 'MED-phentermine-hydrochloride-oral-tablet'
  | 'MED-qsymia-phentermine-topiramate-er-capsule'
  | 'MED-contrave-naltrexone-bupropion-er-tablet'
  | 'MED-xenical-orlistat-120mg-capsule'
  | 'MED-alli-orlistat-60mg-otc-capsule';
type IngredientId = 'ING-phentermine' | 'ING-topiramate' | 'ING-naltrexone' | 'ING-bupropion' | 'ING-orlistat';

export interface WeightManagementIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: string;
  route: 'ORAL';
  releaseProfile: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  regulatoryContext: 'PRESCRIPTION' | 'OTC';
  evidenceRef: { id: string; version: number };
}

export const weightManagementIdentityDefinitions: WeightManagementIdentityDefinition[] = [
  { medicationId: 'MED-phentermine-hydrochloride-oral-capsule', ingredientIds: ['ING-phentermine'], genericName: 'phentermine hydrochloride', dosageForm: 'CAPSULE', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', regulatoryContext: 'PRESCRIPTION', evidenceRef: { id: 'EVD-PHENTERMINE-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-phentermine-hydrochloride-oral-tablet', ingredientIds: ['ING-phentermine'], genericName: 'phentermine hydrochloride', dosageForm: 'TABLET', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', regulatoryContext: 'PRESCRIPTION', evidenceRef: { id: 'EVD-PHENTERMINE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-qsymia-phentermine-topiramate-er-capsule', ingredientIds: ['ING-phentermine', 'ING-topiramate'], genericName: 'phentermine/topiramate extended release', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', regulatoryContext: 'PRESCRIPTION', evidenceRef: { id: 'EVD-QSYMIA-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-contrave-naltrexone-bupropion-er-tablet', ingredientIds: ['ING-naltrexone', 'ING-bupropion'], genericName: 'naltrexone/bupropion extended release', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', regulatoryContext: 'PRESCRIPTION', evidenceRef: { id: 'EVD-CONTRAVE-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-xenical-orlistat-120mg-capsule', ingredientIds: ['ING-orlistat'], genericName: 'orlistat 120 mg', dosageForm: 'CAPSULE', route: 'ORAL', releaseProfile: 'NOT_APPLICABLE', regulatoryContext: 'PRESCRIPTION', evidenceRef: { id: 'EVD-XENICAL-120MG-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-alli-orlistat-60mg-otc-capsule', ingredientIds: ['ING-orlistat'], genericName: 'orlistat 60 mg', dosageForm: 'CAPSULE', route: 'ORAL', releaseProfile: 'NOT_APPLICABLE', regulatoryContext: 'OTC', evidenceRef: { id: 'EVD-ALLI-60MG-OTC-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-phentermine-hydrochloride-oral-capsule', id: 'SRC-PHENTERMINE-CAPSULE-CALVIN-SCOTT-ANDA040887', publisher: 'Calvin Scott & Co., Inc.; DailyMed', setId: '27e88ebe-6247-4598-8ef2-c882992ed579', effectiveDate: '2026-06-01', applicationNumber: 'ANDA040887' },
  { medicationId: 'MED-phentermine-hydrochloride-oral-tablet', id: 'SRC-PHENTERMINE-TABLET-CALVIN-SCOTT-ANDA205008', publisher: 'Calvin Scott & Co., Inc.; DailyMed', setId: '3d1d4dde-1c7f-4a20-b8f8-897b1b284f80', effectiveDate: '2026-06-01', applicationNumber: 'ANDA205008' },
  { medicationId: 'MED-qsymia-phentermine-topiramate-er-capsule', id: 'SRC-QSYMIA-VIVUS-NDA022580', publisher: 'Vivus LLC; DailyMed', setId: '40dd5602-53da-45ac-bb4b-15789aba40f9', effectiveDate: '2026-04-24', applicationNumber: 'NDA022580' },
  { medicationId: 'MED-contrave-naltrexone-bupropion-er-tablet', id: 'SRC-CONTRAVE-NALPROPION-NDA200063', publisher: 'Nalpropion Pharmaceuticals LLC; DailyMed', setId: '485ff360-32c8-11df-928b-0002a5d5c51b', effectiveDate: '2025-11-17', applicationNumber: 'NDA200063' },
  { medicationId: 'MED-xenical-orlistat-120mg-capsule', id: 'SRC-XENICAL-H2PHARMA-NDA020766', publisher: 'H2-Pharma LLC; DailyMed', setId: '6240792b-9224-2d10-e053-2a91aa0a2c3e', effectiveDate: '2026-01-09', applicationNumber: 'NDA020766' },
  { medicationId: 'MED-alli-orlistat-60mg-otc-capsule', id: 'SRC-ALLI-HALEON-NDA021887', publisher: 'Haleon US Holdings LLC; DailyMed', setId: 'a2d3bd73-f3af-4ea5-a57c-66b0004cfe4f', effectiveDate: '2026-03-18', applicationNumber: 'NDA021887' },
];
const definitionByMedication = new Map(weightManagementIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const weightManagementIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (oral): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, releaseProfile: definition.releaseProfile,
      regulatoryContext: definition.regulatoryContext, representativeIdentityOnly: true,
      indicationNotInferred: true, opioidExposureNotInferred: true, seizureRiskNotInferred: true,
      hemodynamicStatusNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      releaseConversionAuthorized: false, formulationConversionAuthorized: false,
      combinationDecompositionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const weightManagementIdentityAtoms: EvidenceAtom[] = weightManagementIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with the stated release and regulatory context.`,
  normalizedTopic: 'weight-management-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-weight-management'], contextTags: ['form-release-combination-identity', 'anesthesia-review-only'] },
  locator: { section: 'Indications and Usage; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, oral route, dosage form, release or regulatory context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, adherence, dose, indication, or current commercial availability.',
    'Standalone phentermine capsule and tablet, QSYMIA whole combination, CONTRAVE whole combination, and XENICAL versus ALLI remain distinct identities; combination ingredients are not decomposed into standalone medication decisions.',
    'Indication, cardiovascular and hemodynamic status, concomitant sympathomimetics, renal/hepatic function, seizure risk, opioid exposure or anticipated opioid analgesia for CONTRAVE, nutritional status, and anesthesia plan require accountable clinician review.',
    'No autonomous continuation, interruption, taper, dose conversion, substitution, opioid plan, anesthesia plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this form/release/combination-specific medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseProfile], concepts: ['medication-identity', 'weight-management', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const weightManagementReviewRules: ClinicalRule[] = [{
  id: 'RULE-WEIGHT-MANAGEMENT-ANESTHESIA-REVIEW-001', version: 1,
  name: 'Explicit weight-management product requires clinician and anesthesia review',
  scope: { medicationIds: weightManagementIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: weightManagementIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 89,
}];

export const weightManagementIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: weightManagementIdentitySources, atoms: weightManagementIdentityAtoms,
};
