import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T02:31:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-prograf-tacrolimus-immediate-release-oral-capsule'
  | 'MED-prograf-tacrolimus-granules-for-oral-suspension'
  | 'MED-prograf-tacrolimus-intravenous-injection'
  | 'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule'
  | 'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet';

export interface TacrolimusIdentityDefinition {
  medicationId: MedicationId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'INTRAVENOUS';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  evidenceRef: { id: string; version: number };
}

export const tacrolimusIdentityDefinitions: TacrolimusIdentityDefinition[] = [
  { medicationId: 'MED-prograf-tacrolimus-immediate-release-oral-capsule', genericName: 'tacrolimus immediate-release', dosageForm: 'CAPSULE, GELATIN COATED', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-PROGRAF-IR-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-prograf-tacrolimus-granules-for-oral-suspension', genericName: 'tacrolimus for oral suspension', dosageForm: 'GRANULE, FOR SUSPENSION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-PROGRAF-GRANULES-IDENTITY', version: 1 } },
  { medicationId: 'MED-prograf-tacrolimus-intravenous-injection', genericName: 'tacrolimus injection', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-PROGRAF-IV-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule', genericName: 'tacrolimus extended-release capsule', dosageForm: 'CAPSULE, COATED, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ASTAGRAF-XL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet', genericName: 'tacrolimus extended-release tablet', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ENVARSUS-XR-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-prograf-tacrolimus-immediate-release-oral-capsule', id: 'SRC-PROGRAF-CAPSULE-ASTELLAS-NDA050708', publisher: 'Astellas Pharma US, Inc.; DailyMed', setId: '7f667de1-9dfa-4bd6-8ba0-15ee2d78873b', effectiveDate: '2025-03-21', applicationNumber: 'NDA050708' },
  { medicationId: 'MED-prograf-tacrolimus-granules-for-oral-suspension', id: 'SRC-PROGRAF-GRANULES-ASTELLAS-NDA210115', publisher: 'Astellas Pharma US, Inc.; DailyMed', setId: '7f667de1-9dfa-4bd6-8ba0-15ee2d78873b', effectiveDate: '2025-03-21', applicationNumber: 'NDA210115' },
  { medicationId: 'MED-prograf-tacrolimus-intravenous-injection', id: 'SRC-PROGRAF-INJECTION-ASTELLAS-NDA050709', publisher: 'Astellas Pharma US, Inc.; DailyMed', setId: '7f667de1-9dfa-4bd6-8ba0-15ee2d78873b', effectiveDate: '2025-03-21', applicationNumber: 'NDA050709' },
  { medicationId: 'MED-astagraf-xl-tacrolimus-extended-release-oral-capsule', id: 'SRC-ASTAGRAF-XL-ASTELLAS-NDA204096', publisher: 'Astellas Pharma US, Inc.; DailyMed', setId: '550a5cd4-fbf2-4c09-b577-6bde8fcbdf6e', effectiveDate: '2026-02-06', applicationNumber: 'NDA204096' },
  { medicationId: 'MED-envarsus-xr-tacrolimus-extended-release-oral-tablet', id: 'SRC-ENVARSUS-XR-VELOXIS-NDA206406', publisher: 'Veloxis Pharmaceuticals, Inc.; DailyMed', setId: 'de2315b0-6344-43ac-9aea-3e3b68d828e7', effectiveDate: '2025-03-03', applicationNumber: 'NDA206406' },
];
const definitionByMedication = new Map(tacrolimusIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const tacrolimusIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      representativeIdentityOnly: true, transplantOrganNotInferred: true, regimenNotInferred: true,
      troughConcentrationNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const tacrolimusIdentityAtoms: EvidenceAtom[] = tacrolimusIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} tacrolimus identity.`,
  normalizedTopic: 'tacrolimus-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: ['ING-tacrolimus'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'], contextTags: ['route-form-release-identity', 'transplant-team-review-only'] },
  locator: { section: 'Dosage Forms and Strengths; Warnings and Precautions; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, brand identity, and application provenance only; it does not authenticate a patient-specific product, strength, dose, regimen, manufacturer, NDC, package, adherence, trough concentration, or current commercial availability.',
    'PROGRAF immediate-release capsules, PROGRAF granules for oral suspension, PROGRAF intravenous injection, ASTAGRAF XL extended-release capsules, and ENVARSUS XR extended-release tablets are distinct identities and are not treated as interchangeable.',
    'Transplanted organ, time since transplant, rejection history, current multidrug immunosuppression, last dose, therapeutic drug monitoring, renal/hepatic function, interacting drugs, infection status, and ability to take oral medication require transplant-team and clinician review.',
    'No autonomous continuation, interruption, missed-dose instruction, dose arithmetic, conversion, substitution, route/form change, monitoring target, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} tacrolimus identity`, summary: 'Direct DailyMed provenance supports this route/form/release medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'tacrolimus', 'transplant-immunosuppression'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const tacrolimusReviewRules: ClinicalRule[] = [{
  id: 'RULE-TACROLIMUS-TRANSPLANT-REVIEW-001', version: 1,
  name: 'Explicit tacrolimus product requires transplant-team and clinician review',
  scope: { medicationIds: tacrolimusIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: tacrolimusIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const tacrolimusIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: tacrolimusIdentitySources, atoms: tacrolimusIdentityAtoms,
};
