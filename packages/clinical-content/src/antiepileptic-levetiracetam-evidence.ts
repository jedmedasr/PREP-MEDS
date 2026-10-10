import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T18:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-keppra-levetiracetam-ir-film-coated-oral-tablet'
  | 'MED-keppra-levetiracetam-oral-solution'
  | 'MED-keppra-levetiracetam-intravenous-concentrate'
  | 'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet'
  | 'MED-spritam-levetiracetam-tablet-for-oral-suspension';

export interface AntiepilepticLevetiracetamIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-levetiracetam'];
  genericName: string;
  dosageForm: 'TABLET, FILM COATED' | 'SOLUTION' | 'INJECTION, SOLUTION, CONCENTRATE' | 'TABLET, FILM COATED, EXTENDED RELEASE' | 'TABLET, FOR SUSPENSION';
  route: 'ORAL' | 'INTRAVENOUS';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  productContext: 'KEPPRA' | 'KEPPRA_XR' | 'SPRITAM';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticLevetiracetamIdentityDefinitions: AntiepilepticLevetiracetamIdentityDefinition[] = [
  { medicationId: 'MED-keppra-levetiracetam-ir-film-coated-oral-tablet', ingredientIds: ['ING-levetiracetam'], genericName: 'KEPPRA levetiracetam', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'KEPPRA', evidenceRef: { id: 'EVD-KEPPRA-IR-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-keppra-levetiracetam-oral-solution', ingredientIds: ['ING-levetiracetam'], genericName: 'KEPPRA levetiracetam', dosageForm: 'SOLUTION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', productContext: 'KEPPRA', evidenceRef: { id: 'EVD-KEPPRA-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-keppra-levetiracetam-intravenous-concentrate', ingredientIds: ['ING-levetiracetam'], genericName: 'KEPPRA levetiracetam', dosageForm: 'INJECTION, SOLUTION, CONCENTRATE', route: 'INTRAVENOUS', releaseContext: 'NOT_APPLICABLE', productContext: 'KEPPRA', evidenceRef: { id: 'EVD-KEPPRA-INTRAVENOUS-CONCENTRATE-IDENTITY', version: 1 } },
  { medicationId: 'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet', ingredientIds: ['ING-levetiracetam'], genericName: 'KEPPRA XR levetiracetam', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'KEPPRA_XR', evidenceRef: { id: 'EVD-KEPPRA-XR-ER-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-spritam-levetiracetam-tablet-for-oral-suspension', ingredientIds: ['ING-levetiracetam'], genericName: 'SPRITAM levetiracetam', dosageForm: 'TABLET, FOR SUSPENSION', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'SPRITAM', evidenceRef: { id: 'EVD-SPRITAM-TABLET-FOR-ORAL-SUSPENSION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-keppra-levetiracetam-ir-film-coated-oral-tablet', id: 'SRC-KEPPRA-ORAL-TABLET-UCB-NDA021035', publisher: 'UCB, Inc.; DailyMed', setId: '3ca9df05-a506-4ec8-a4fe-320f1219ab21', effectiveDate: '2026-01-28', applicationNumber: 'NDA021035' },
  { medicationId: 'MED-keppra-levetiracetam-oral-solution', id: 'SRC-KEPPRA-ORAL-SOLUTION-UCB-NDA021505', publisher: 'UCB, Inc.; DailyMed', setId: '3ca9df05-a506-4ec8-a4fe-320f1219ab21', effectiveDate: '2026-01-28', applicationNumber: 'NDA021505' },
  { medicationId: 'MED-keppra-levetiracetam-intravenous-concentrate', id: 'SRC-KEPPRA-INJECTION-UCB-NDA021872', publisher: 'UCB, Inc.; DailyMed', setId: 'c6d5784d-abf9-45fe-ac5a-d5c53bd50f7e', effectiveDate: '2025-06-30', applicationNumber: 'NDA021872' },
  { medicationId: 'MED-keppra-xr-levetiracetam-er-film-coated-oral-tablet', id: 'SRC-KEPPRA-XR-UCB-NDA022285', publisher: 'UCB, Inc.; DailyMed', setId: '2919e43b-69a8-434c-a2d2-1f3ecd7554c0', effectiveDate: '2025-06-26', applicationNumber: 'NDA022285' },
  { medicationId: 'MED-spritam-levetiracetam-tablet-for-oral-suspension', id: 'SRC-SPRITAM-APRECIA-NDA207958', publisher: 'Aprecia Pharmaceuticals, LLC; DailyMed', setId: 'be651c31-383f-11e4-916c-0800200c9a66', effectiveDate: '2025-10-13', applicationNumber: 'NDA207958' },
];
const definitionByMedication = new Map(antiepilepticLevetiracetamIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticLevetiracetamIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: definition.genericName + ' ' + definition.dosageForm.toLowerCase() + ' (' + definition.route.toLowerCase() + '): direct DailyMed labeling',
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + source.setId,
    externalIdentifier: 'DailyMed SETID ' + source.setId + '; ' + source.applicationNumber,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, releaseContext: definition.releaseContext, productContext: definition.productContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, renalFunctionNotInferred: true,
      seizureControlNotInferred: true, adherenceNotInferred: true, behavioralStatusNotInferred: true,
      oralFeasibilityNotInferred: true, withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, doseConversionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false, releaseConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticLevetiracetamIdentityAtoms: EvidenceAtom[] = antiepilepticLevetiracetamIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as a ' + product.route.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity with ' + product.releaseContext.toLowerCase() + ' and ' + product.productContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-levetiracetam-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-release-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Indications and Usage; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release/product context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, regimen, or current commercial availability.',
    'KEPPRA immediate-release tablet, oral solution, intravenous concentrate, KEPPRA XR extended-release tablet, and SPRITAM tablet for oral suspension remain distinct identities; bare levetiracetam or KEPPRA is not enough to select one.',
    'Indication, seizure type and control, last dose, adherence, renal function, behavioral or neuropsychiatric status, oral feasibility, current antiepileptic regimen, withdrawal or status-epilepticus risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'Although KEPPRA injection labeling describes switching with oral KEPPRA, this evidence does not authorize autonomous route conversion, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this route/form/release-specific levetiracetam medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.route, product.releaseContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticLevetiracetamReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-LEVETIRACETAM-REVIEW-001', version: 1,
  name: 'Explicit levetiracetam product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticLevetiracetamIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticLevetiracetamIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticLevetiracetamIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticLevetiracetamIdentitySources, atoms: antiepilepticLevetiracetamIdentityAtoms,
};
