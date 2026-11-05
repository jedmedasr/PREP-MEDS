import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T17:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-amantadine-hydrochloride-ir-oral-capsule'
  | 'MED-amantadine-hydrochloride-ir-oral-tablet'
  | 'MED-amantadine-hydrochloride-oral-solution'
  | 'MED-gocovri-amantadine-er-oral-capsule'
  | 'MED-osmolex-er-amantadine-er-oral-tablet';

export interface ParkinsonAmantadineIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-amantadine'];
  genericName: string;
  dosageForm: 'CAPSULE' | 'TABLET' | 'SOLUTION' | 'CAPSULE, COATED PELLETS' | 'TABLET, EXTENDED RELEASE';
  route: 'ORAL';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  productContext: 'GENERIC_IR' | 'GOCOVRI_ER' | 'OSMOLEX_ER';
  evidenceRef: { id: string; version: number };
}

export const parkinsonAmantadineIdentityDefinitions: ParkinsonAmantadineIdentityDefinition[] = [
  { medicationId: 'MED-amantadine-hydrochloride-ir-oral-capsule', ingredientIds: ['ING-amantadine'], genericName: 'amantadine hydrochloride', dosageForm: 'CAPSULE', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'GENERIC_IR', evidenceRef: { id: 'EVD-AMANTADINE-IR-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-amantadine-hydrochloride-ir-oral-tablet', ingredientIds: ['ING-amantadine'], genericName: 'amantadine hydrochloride', dosageForm: 'TABLET', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'GENERIC_IR', evidenceRef: { id: 'EVD-AMANTADINE-IR-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-amantadine-hydrochloride-oral-solution', ingredientIds: ['ING-amantadine'], genericName: 'amantadine hydrochloride', dosageForm: 'SOLUTION', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', productContext: 'GENERIC_IR', evidenceRef: { id: 'EVD-AMANTADINE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-gocovri-amantadine-er-oral-capsule', ingredientIds: ['ING-amantadine'], genericName: 'GOCOVRI amantadine', dosageForm: 'CAPSULE, COATED PELLETS', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'GOCOVRI_ER', evidenceRef: { id: 'EVD-GOCOVRI-AMANTADINE-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-osmolex-er-amantadine-er-oral-tablet', ingredientIds: ['ING-amantadine'], genericName: 'OSMOLEX ER amantadine', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', productContext: 'OSMOLEX_ER', evidenceRef: { id: 'EVD-OSMOLEX-ER-AMANTADINE-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-amantadine-hydrochloride-ir-oral-capsule', id: 'SRC-AMANTADINE-IR-CAPSULE-CHARTWELL-ANDA209171', publisher: 'Chartwell RX, LLC; DailyMed', setId: 'a016ab57-d18f-4a3b-b2ab-f91fecc1eef7', effectiveDate: '2024-10-14', applicationNumber: 'ANDA209171' },
  { medicationId: 'MED-amantadine-hydrochloride-ir-oral-tablet', id: 'SRC-AMANTADINE-IR-TABLET-ALEMBIC-ANDA214284', publisher: 'Alembic Pharmaceuticals Inc.; DailyMed', setId: 'da1837b5-fda2-48e0-91ba-d6eb2b991b55', effectiveDate: '2025-08-15', applicationNumber: 'ANDA214284' },
  { medicationId: 'MED-amantadine-hydrochloride-oral-solution', id: 'SRC-AMANTADINE-SOLUTION-CHARTWELL-ANDA074028', publisher: 'Chartwell RX, LLC; DailyMed', setId: '52aa093c-82cc-4d81-b072-86a2b8adc9c5', effectiveDate: '2025-12-15', applicationNumber: 'ANDA074028' },
  { medicationId: 'MED-gocovri-amantadine-er-oral-capsule', id: 'SRC-GOCOVRI-SUPERNUS-NDA208944', publisher: 'Supernus Pharmaceuticals, Inc.; DailyMed', setId: '2bee0631-0028-1314-e063-6394a90aaaed', effectiveDate: '2026-09-10', applicationNumber: 'NDA208944' },
  { medicationId: 'MED-osmolex-er-amantadine-er-oral-tablet', id: 'SRC-OSMOLEX-ER-ADAMAS-NDA209410', publisher: 'Adamas Pharma, LLC; DailyMed', setId: '6fbddb66-8b9d-4d37-a348-abcc31276e89', effectiveDate: '2024-10-14', applicationNumber: 'NDA209410' },
];
const definitionByMedication = new Map(parkinsonAmantadineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const parkinsonAmantadineIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      dosageForm: definition.dosageForm, releaseContext: definition.releaseContext, productContext: definition.productContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, renalFunctionNotInferred: true,
      currentDopaminergicRegimenNotInferred: true, neuropsychiatricStatusNotInferred: true,
      orthostasisNotInferred: true, somnolenceNotInferred: true, impulseControlStatusNotInferred: true,
      withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, doseConversionAuthorized: false, routeConversionAuthorized: false,
      formulationConversionAuthorized: false, releaseConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const parkinsonAmantadineIdentityAtoms: EvidenceAtom[] = parkinsonAmantadineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with ${product.releaseContext.toLowerCase()} and ${product.productContext.toLowerCase()} context.`,
  normalizedTopic: 'parkinson-amantadine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-amantadine'], contextTags: ['route-form-release-identity', 'anesthesia-review-only'] },
  locator: { section: 'Highlights; Indications and Usage; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, oral route, dosage form, release/product context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, regimen, or current commercial availability.',
    'Immediate-release capsule, immediate-release tablet, oral solution, GOCOVRI extended-release coated-pellet capsule, and OSMOLEX ER extended-release tablet remain distinct identities; bare amantadine is not enough to select one.',
    'Generic immediate-release labeling includes materially different indications; patient indication, renal function, current dopaminergic regimen, hallucinations or confusion, orthostasis, somnolence, impulse-control concerns, withdrawal or hyperpyrexia/confusion/NMS-like risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'GOCOVRI labeling states that it is not substitutable with other immediate- or extended-release amantadine products. No autonomous continuation, interruption, taper, dose or formulation conversion, substitution, anesthesia plan, or restart timing is supported.',
  ],
  retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this route/form/release-specific amantadine medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'amantadine', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const parkinsonAmantadineReviewRules: ClinicalRule[] = [{
  id: 'RULE-PARKINSON-AMANTADINE-REVIEW-001', version: 1,
  name: 'Explicit amantadine product requires clinician and anesthesia review',
  scope: { medicationIds: parkinsonAmantadineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: parkinsonAmantadineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];

export const parkinsonAmantadineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: parkinsonAmantadineIdentitySources, atoms: parkinsonAmantadineIdentityAtoms,
};
