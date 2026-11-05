import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-02T23:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-topamax-topiramate-coated-oral-tablet'
  | 'MED-topamax-topiramate-sprinkle-capsule'
  | 'MED-eprontia-topiramate-oral-solution'
  | 'MED-qudexy-xr-topiramate-er-oral-capsule'
  | 'MED-trokendi-xr-topiramate-er-oral-capsule';

export interface AntiepilepticTopiramateIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-topiramate'];
  genericName: string;
  dosageForm: 'TABLET, COATED' | 'CAPSULE, COATED PELLETS' | 'SOLUTION' | 'CAPSULE, EXTENDED RELEASE';
  route: 'ORAL';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  productContext: 'TOPAMAX' | 'EPRONTIA' | 'QUDEXY_XR' | 'TROKENDI_XR';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticTopiramateIdentityDefinitions: AntiepilepticTopiramateIdentityDefinition[] = [
  { medicationId: 'MED-topamax-topiramate-coated-oral-tablet', ingredientIds: ['ING-topiramate'], genericName: 'TOPAMAX topiramate', dosageForm: 'TABLET, COATED', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'TOPAMAX', evidenceRef: { id: 'EVD-TOPAMAX-TOPIRAMATE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-topamax-topiramate-sprinkle-capsule', ingredientIds: ['ING-topiramate'], genericName: 'TOPAMAX topiramate', dosageForm: 'CAPSULE, COATED PELLETS', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'TOPAMAX', evidenceRef: { id: 'EVD-TOPAMAX-TOPIRAMATE-SPRINKLE-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-eprontia-topiramate-oral-solution', ingredientIds: ['ING-topiramate'], genericName: 'EPRONTIA topiramate', dosageForm: 'SOLUTION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', productContext: 'EPRONTIA', evidenceRef: { id: 'EVD-EPRONTIA-TOPIRAMATE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-qudexy-xr-topiramate-er-oral-capsule', ingredientIds: ['ING-topiramate'], genericName: 'QUDEXY XR topiramate', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'QUDEXY_XR', evidenceRef: { id: 'EVD-QUDEXY-XR-TOPIRAMATE-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-trokendi-xr-topiramate-er-oral-capsule', ingredientIds: ['ING-topiramate'], genericName: 'TROKENDI XR topiramate', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'TROKENDI_XR', evidenceRef: { id: 'EVD-TROKENDI-XR-TOPIRAMATE-ER-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; labelVersion: number }> = [
  { medicationId: 'MED-topamax-topiramate-coated-oral-tablet', id: 'SRC-TOPAMAX-TABLET-JANSSEN-NDA020505', publisher: 'Janssen Pharmaceuticals, Inc.; DailyMed', setId: '21628112-0c47-11df-95b3-498d55d89593', effectiveDate: '2026-03-12', applicationNumber: 'NDA020505', labelVersion: 30 },
  { medicationId: 'MED-topamax-topiramate-sprinkle-capsule', id: 'SRC-TOPAMAX-SPRINKLE-JANSSEN-NDA020844', publisher: 'Janssen Pharmaceuticals, Inc.; DailyMed', setId: '21628112-0c47-11df-95b3-498d55d89593', effectiveDate: '2026-03-12', applicationNumber: 'NDA020844', labelVersion: 30 },
  { medicationId: 'MED-eprontia-topiramate-oral-solution', id: 'SRC-EPRONTIA-AZURITY-NDA214679', publisher: 'Azurity Pharmaceuticals, Inc.; DailyMed', setId: 'e2a4df59-fead-4a01-9021-9eda02c48010', effectiveDate: '2025-11-13', applicationNumber: 'NDA214679', labelVersion: 8 },
  { medicationId: 'MED-qudexy-xr-topiramate-er-oral-capsule', id: 'SRC-QUDEXY-XR-UPSHER-SMITH-NDA205122', publisher: 'Upsher-Smith Laboratories, LLC; DailyMed', setId: '46f54677-3a22-4c38-9b92-923020164e15', effectiveDate: '2026-09-03', applicationNumber: 'NDA205122', labelVersion: 30 },
  { medicationId: 'MED-trokendi-xr-topiramate-er-oral-capsule', id: 'SRC-TROKENDI-XR-SUPERNUS-NDA201635', publisher: 'Supernus Pharmaceuticals, Inc.; DailyMed', setId: '2dc7957e-a3e5-46bb-aa66-f3250f872f5e', effectiveDate: '2026-03-20', applicationNumber: 'NDA201635', labelVersion: 29 },
];
const definitionByMedication = new Map(antiepilepticTopiramateIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticTopiramateIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: definition.genericName + ' ' + definition.dosageForm.toLowerCase() + ': direct DailyMed labeling',
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + source.setId,
    externalIdentifier: 'DailyMed SETID ' + source.setId + '; ' + source.applicationNumber,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, labelVersion: source.labelVersion,
      route: definition.route, dosageForm: definition.dosageForm, releaseContext: definition.releaseContext, productContext: definition.productContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, renalFunctionNotInferred: true,
      metabolicAcidosisRiskNotInferred: true, hydrationStatusNotInferred: true, seizureControlNotInferred: true,
      adherenceNotInferred: true, oralFeasibilityNotInferred: true, withdrawalRiskNotInferred: true,
      anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      doseConversionAuthorized: false, formulationConversionAuthorized: false, releaseConversionAuthorized: false,
      combinationDecompositionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticTopiramateIdentityAtoms: EvidenceAtom[] = antiepilepticTopiramateIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as an oral ' + product.dosageForm.toLowerCase() + ' identity with ' + product.releaseContext.toLowerCase() + ' and ' + product.productContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-topiramate-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-release-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Dosage and Administration; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release/product context, label version, and application provenance only; it does not authenticate a patient-specific package, NDC, dose, adherence, indication, regimen, manufacturer, or current commercial availability.',
    'TOPAMAX tablet, TOPAMAX sprinkle capsule, EPRONTIA oral solution, QUDEXY XR extended-release capsule, and TROKENDI XR extended-release capsule remain distinct identities; bare topiramate or TOPAMAX is not enough to select one.',
    'QSYMIA phentermine/topiramate remains an existing whole combination-product identity and is not decomposed into standalone topiramate.',
    'Indication, seizure or migraine context, last dose, adherence, renal function, bicarbonate/metabolic-acidosis risk, hydration status, concomitant carbonic-anhydrase inhibitors, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous formulation or release conversion, whole-product decomposition, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this form/release-specific topiramate medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticTopiramateReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-TOPIRAMATE-REVIEW-001', version: 1,
  name: 'Explicit topiramate product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticTopiramateIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticTopiramateIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticTopiramateIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticTopiramateIdentitySources, atoms: antiepilepticTopiramateIdentityAtoms,
};
