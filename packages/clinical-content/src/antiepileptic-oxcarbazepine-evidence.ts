import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T01:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-trileptal-oxcarbazepine-film-coated-oral-tablet'
  | 'MED-trileptal-oxcarbazepine-oral-suspension'
  | 'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet';

export interface AntiepilepticOxcarbazepineIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-oxcarbazepine'];
  genericName: string;
  dosageForm: 'TABLET, FILM COATED' | 'SUSPENSION' | 'TABLET, EXTENDED RELEASE';
  route: 'ORAL';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  productContext: 'TRILEPTAL' | 'OXTELLAR_XR';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticOxcarbazepineIdentityDefinitions: AntiepilepticOxcarbazepineIdentityDefinition[] = [
  { medicationId: 'MED-trileptal-oxcarbazepine-film-coated-oral-tablet', ingredientIds: ['ING-oxcarbazepine'], genericName: 'TRILEPTAL oxcarbazepine', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'TRILEPTAL', evidenceRef: { id: 'EVD-TRILEPTAL-OXCARBAZEPINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-trileptal-oxcarbazepine-oral-suspension', ingredientIds: ['ING-oxcarbazepine'], genericName: 'TRILEPTAL oxcarbazepine', dosageForm: 'SUSPENSION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', productContext: 'TRILEPTAL', evidenceRef: { id: 'EVD-TRILEPTAL-OXCARBAZEPINE-ORAL-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet', ingredientIds: ['ING-oxcarbazepine'], genericName: 'OXTELLAR XR oxcarbazepine', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'OXTELLAR_XR', evidenceRef: { id: 'EVD-OXTELLAR-XR-OXCARBAZEPINE-ER-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; labelVersion: number }> = [
  { medicationId: 'MED-trileptal-oxcarbazepine-film-coated-oral-tablet', id: 'SRC-TRILEPTAL-TABLET-NOVARTIS-NDA021014', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '4c5c86c8-ab7f-4fcf-bc1b-5a0b1fd0691b', effectiveDate: '2025-12-16', applicationNumber: 'NDA021014', labelVersion: 39 },
  { medicationId: 'MED-trileptal-oxcarbazepine-oral-suspension', id: 'SRC-TRILEPTAL-SUSPENSION-NOVARTIS-NDA021285', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '4c5c86c8-ab7f-4fcf-bc1b-5a0b1fd0691b', effectiveDate: '2025-12-16', applicationNumber: 'NDA021285', labelVersion: 39 },
  { medicationId: 'MED-oxtellar-xr-oxcarbazepine-er-oral-tablet', id: 'SRC-OXTELLAR-XR-SUPERNUS-NDA202810', publisher: 'Supernus Pharmaceuticals, Inc.; DailyMed', setId: 'aa610e56-1d1d-11e1-8bc2-0800200c9a66', effectiveDate: '2026-09-15', applicationNumber: 'NDA202810', labelVersion: 22 },
];
const definitionByMedication = new Map(antiepilepticOxcarbazepineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticOxcarbazepineIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      representativeIdentityOnly: true, patientIndicationNotInferred: true, sodiumStatusNotInferred: true,
      renalFunctionNotInferred: true, hypersensitivityNotInferred: true, seizureControlNotInferred: true,
      adherenceNotInferred: true, oralFeasibilityNotInferred: true, withdrawalRiskNotInferred: true,
      anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      doseConversionAuthorized: false, formulationConversionAuthorized: false, releaseConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticOxcarbazepineIdentityAtoms: EvidenceAtom[] = antiepilepticOxcarbazepineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as an oral ' + product.dosageForm.toLowerCase() + ' identity with ' + product.releaseContext.toLowerCase() + ' and ' + product.productContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-oxcarbazepine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-release-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Dosage and Administration; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release/product context, label version, and application provenance only; it does not authenticate a patient-specific package, NDC, dose, adherence, indication, regimen, manufacturer, or current commercial availability.',
    'TRILEPTAL film-coated tablet, TRILEPTAL oral suspension, and OXTELLAR XR extended-release tablet remain distinct identities; bare oxcarbazepine or TRILEPTAL is not enough to select one.',
    'Indication, seizure context and control, last dose, adherence, sodium status and hyponatremia risk, renal function, hypersensitivity history, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous formulation or release conversion, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this form/release-specific oxcarbazepine medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticOxcarbazepineReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-OXCARBAZEPINE-REVIEW-001', version: 1,
  name: 'Explicit oxcarbazepine product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticOxcarbazepineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticOxcarbazepineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticOxcarbazepineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticOxcarbazepineIdentitySources, atoms: antiepilepticOxcarbazepineIdentityAtoms,
};
