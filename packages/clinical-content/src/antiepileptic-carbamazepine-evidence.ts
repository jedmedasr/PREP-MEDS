import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T03:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-tegretol-carbamazepine-conventional-oral-tablet'
  | 'MED-tegretol-carbamazepine-oral-suspension'
  | 'MED-carbamazepine-chewable-oral-tablet'
  | 'MED-tegretol-xr-carbamazepine-er-oral-tablet'
  | 'MED-carbatrol-carbamazepine-er-oral-capsule'
  | 'MED-equetro-carbamazepine-er-oral-capsule';

export interface AntiepilepticCarbamazepineIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-carbamazepine'];
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, CHEWABLE' | 'SUSPENSION' | 'TABLET, EXTENDED RELEASE' | 'CAPSULE, EXTENDED RELEASE';
  route: 'ORAL';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  productContext: 'TEGRETOL' | 'GENERIC_CHEWABLE' | 'TEGRETOL_XR' | 'CARBATROL' | 'EQUETRO';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticCarbamazepineIdentityDefinitions: AntiepilepticCarbamazepineIdentityDefinition[] = [
  { medicationId: 'MED-tegretol-carbamazepine-conventional-oral-tablet', ingredientIds: ['ING-carbamazepine'], genericName: 'TEGRETOL carbamazepine', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'TEGRETOL', evidenceRef: { id: 'EVD-TEGRETOL-CARBAMAZEPINE-CONVENTIONAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-tegretol-carbamazepine-oral-suspension', ingredientIds: ['ING-carbamazepine'], genericName: 'TEGRETOL carbamazepine', dosageForm: 'SUSPENSION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', productContext: 'TEGRETOL', evidenceRef: { id: 'EVD-TEGRETOL-CARBAMAZEPINE-ORAL-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-carbamazepine-chewable-oral-tablet', ingredientIds: ['ING-carbamazepine'], genericName: 'carbamazepine', dosageForm: 'TABLET, CHEWABLE', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'GENERIC_CHEWABLE', evidenceRef: { id: 'EVD-CARBAMAZEPINE-CHEWABLE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-tegretol-xr-carbamazepine-er-oral-tablet', ingredientIds: ['ING-carbamazepine'], genericName: 'TEGRETOL XR carbamazepine', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'TEGRETOL_XR', evidenceRef: { id: 'EVD-TEGRETOL-XR-CARBAMAZEPINE-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-carbatrol-carbamazepine-er-oral-capsule', ingredientIds: ['ING-carbamazepine'], genericName: 'CARBATROL carbamazepine', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'CARBATROL', evidenceRef: { id: 'EVD-CARBATROL-CARBAMAZEPINE-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-equetero-carbamazepine-er-oral-capsule'.replace('equetero', 'equetero') as MedicationId, ingredientIds: ['ING-carbamazepine'], genericName: 'EQUETRO carbamazepine', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'EQUETRO', evidenceRef: { id: 'EVD-EQUETRO-CARBAMAZEPINE-ER-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber?: string; labelVersion: number }> = [
  { medicationId: 'MED-tegretol-carbamazepine-conventional-oral-tablet', id: 'SRC-TEGRETOL-TABLET-NOVARTIS-NDA016608', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '8d409411-aa9f-4f3a-a52c-fbcb0c3ec053', effectiveDate: '2026-08-20', applicationNumber: 'NDA016608', labelVersion: 39 },
  { medicationId: 'MED-tegretol-carbamazepine-oral-suspension', id: 'SRC-TEGRETOL-SUSPENSION-NOVARTIS-NDA018927', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '8d409411-aa9f-4f3a-a52c-fbcb0c3ec053', effectiveDate: '2026-08-20', applicationNumber: 'NDA018927', labelVersion: 39 },
  { medicationId: 'MED-carbamazepine-chewable-oral-tablet', id: 'SRC-CARBAMAZEPINE-CHEWABLE-SUN-SETID0526A054', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', setId: '0526a054-3eda-49b4-b390-7d5d16e30af8', effectiveDate: '2026-08-30', labelVersion: 12 },
  { medicationId: 'MED-tegretol-xr-carbamazepine-er-oral-tablet', id: 'SRC-TEGRETOL-XR-NOVARTIS-NDA020234', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '8d409411-aa9f-4f3a-a52c-fbcb0c3ec053', effectiveDate: '2026-08-20', applicationNumber: 'NDA020234', labelVersion: 39 },
  { medicationId: 'MED-carbatrol-carbamazepine-er-oral-capsule', id: 'SRC-CARBATROL-TAKEDA-NDA020712', publisher: 'Takeda Pharmaceuticals America, Inc.; DailyMed', setId: 'bc03e499-5bac-4293-bff4-6864153a624d', effectiveDate: '2026-08-17', applicationNumber: 'NDA020712', labelVersion: 41 },
  { medicationId: 'MED-equetero-carbamazepine-er-oral-capsule'.replace('equetero', 'equetero') as MedicationId, id: 'SRC-EQUETRO-VALIDUS-NDA021710', publisher: 'Validus Pharmaceuticals LLC; DailyMed', setId: 'be478f3c-40f6-47cc-8ab9-f420a9372b1c', effectiveDate: '2025-08-19', applicationNumber: 'NDA021710', labelVersion: 10 },
];
const definitionByMedication = new Map(antiepilepticCarbamazepineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticCarbamazepineIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: definition.genericName + ' ' + definition.dosageForm.toLowerCase() + ': direct DailyMed labeling',
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + source.setId,
    externalIdentifier: 'DailyMed SETID ' + source.setId + (source.applicationNumber ? '; ' + source.applicationNumber : ''),
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, ...(source.applicationNumber ? { applicationNumber: source.applicationNumber } : {}), labelVersion: source.labelVersion,
      route: definition.route, dosageForm: definition.dosageForm, releaseContext: definition.releaseContext, productContext: definition.productContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, sodiumStatusNotInferred: true,
      bloodCountsNotInferred: true, hepaticFunctionNotInferred: true, renalFunctionNotInferred: true,
      ancestryOrHlaStatusNotInferred: true, hypersensitivityNotInferred: true, interactingDrugsNotInferred: true,
      seizureControlNotInferred: true, adherenceNotInferred: true, oralFeasibilityNotInferred: true,
      withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, doseConversionAuthorized: false, formulationConversionAuthorized: false,
      releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticCarbamazepineIdentityAtoms: EvidenceAtom[] = antiepilepticCarbamazepineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as an oral ' + product.dosageForm.toLowerCase() + ' identity with ' + product.releaseContext.toLowerCase() + ' and ' + product.productContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-carbamazepine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-release-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Indications and Usage; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release/product context, label version, and application provenance when unambiguously attributable; it does not authenticate a patient-specific package, NDC, dose, adherence, indication, regimen, manufacturer, or current commercial availability.',
    'Conventional tablet, chewable tablet, suspension, extended-release tablet, and branded extended-release capsules remain distinct identities; bare carbamazepine, TEGRETOL, or extended-release capsule wording is not enough to select one.',
    'Indication, seizure control and last dose, adherence, sodium status, blood counts, hepatic and renal function, ancestry or HLA testing, hypersensitivity history, interacting drugs and autoinduction, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous formulation or release conversion, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this form/release-specific carbamazepine medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticCarbamazepineReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-CARBAMAZEPINE-REVIEW-001', version: 1,
  name: 'Explicit carbamazepine product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticCarbamazepineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticCarbamazepineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticCarbamazepineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticCarbamazepineIdentitySources, atoms: antiepilepticCarbamazepineIdentityAtoms,
};
