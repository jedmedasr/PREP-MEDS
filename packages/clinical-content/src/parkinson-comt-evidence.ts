import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T15:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-entacapone-oral-tablet'
  | 'MED-tolcapone-oral-tablet'
  | 'MED-ongentys-opicapone-oral-capsule'
  | 'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet';
type IngredientId = 'ING-entacapone' | 'ING-tolcapone' | 'ING-opicapone' | 'ING-carbidopa' | 'ING-levodopa';

export interface ParkinsonComtIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'TABLET' | 'CAPSULE' | 'TABLET, FILM COATED';
  route: 'ORAL';
  productContext: 'ENTACAPONE_ADJUNCT' | 'TOLCAPONE_ADJUNCT' | 'OPICAPONE_ADJUNCT' | 'CARBIDOPA_LEVODOPA_ENTACAPONE_WHOLE_PRODUCT';
  evidenceRef: { id: string; version: number };
}

export const parkinsonComtIdentityDefinitions: ParkinsonComtIdentityDefinition[] = [
  { medicationId: 'MED-entacapone-oral-tablet', ingredientIds: ['ING-entacapone'], genericName: 'entacapone', dosageForm: 'TABLET', route: 'ORAL', productContext: 'ENTACAPONE_ADJUNCT', evidenceRef: { id: 'EVD-ENTACAPONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-tolcapone-oral-tablet', ingredientIds: ['ING-tolcapone'], genericName: 'tolcapone', dosageForm: 'TABLET', route: 'ORAL', productContext: 'TOLCAPONE_ADJUNCT', evidenceRef: { id: 'EVD-TOLCAPONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-ongentys-opicapone-oral-capsule', ingredientIds: ['ING-opicapone'], genericName: 'ONGENTYS opicapone', dosageForm: 'CAPSULE', route: 'ORAL', productContext: 'OPICAPONE_ADJUNCT', evidenceRef: { id: 'EVD-ONGENTYS-OPICAPONE-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet', ingredientIds: ['ING-carbidopa', 'ING-levodopa', 'ING-entacapone'], genericName: 'carbidopa/levodopa/entacapone', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', productContext: 'CARBIDOPA_LEVODOPA_ENTACAPONE_WHOLE_PRODUCT', evidenceRef: { id: 'EVD-CARBIDOPA-LEVODOPA-ENTACAPONE-WHOLE-PRODUCT', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-entacapone-oral-tablet', id: 'SRC-ENTACAPONE-AJANTA-ANDA205792', publisher: 'Ajanta Pharma USA Inc.; DailyMed', setId: 'e9e94e9f-cd7a-45f5-9aeb-9c28ed804d8c', effectiveDate: '2025-11-17', applicationNumber: 'ANDA205792' },
  { medicationId: 'MED-tolcapone-oral-tablet', id: 'SRC-TOLCAPONE-INGENUS-ANDA208937', publisher: 'Ingenus Pharmaceuticals, LLC; DailyMed', setId: 'd94891be-2fef-4e39-8e35-ab7afe93e78e', effectiveDate: '2019-09-11', applicationNumber: 'ANDA208937' },
  { medicationId: 'MED-ongentys-opicapone-oral-capsule', id: 'SRC-ONGENTYS-AMNEAL-NDA212489', publisher: 'Amneal Pharmaceuticals LLC; DailyMed', setId: 'a511a531-112e-43f8-a43f-5334b0efe979', effectiveDate: '2025-11-17', applicationNumber: 'NDA212489' },
  { medicationId: 'MED-carbidopa-levodopa-entacapone-film-coated-oral-tablet', id: 'SRC-CLE-MACLEODS-ANDA214495', publisher: 'Macleods Pharmaceuticals Limited; DailyMed', setId: 'f0d9d7a8-1d06-4119-b2bc-42b3ec08d45b', effectiveDate: '2026-04-27', applicationNumber: 'ANDA214495' },
];
const definitionByMedication = new Map(parkinsonComtIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const parkinsonComtIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      dosageForm: definition.dosageForm, productContext: definition.productContext, representativeIdentityOnly: true,
      patientIndicationNotInferred: true, currentLevodopaRegimenNotInferred: true, hepaticFunctionNotInferred: true,
      dyskinesiaStatusNotInferred: true, withdrawalRiskNotInferred: true, interactionStatusNotInferred: true,
      anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      doseConversionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false,
      combinationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const parkinsonComtIdentityAtoms: EvidenceAtom[] = parkinsonComtIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with ${product.productContext.toLowerCase()} context.`,
  normalizedTopic: 'parkinson-comt-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-comt-inhibitor'], contextTags: ['whole-product-and-adjunct-identity', 'anesthesia-review-only'] },
  locator: { section: 'Highlights; Boxed Warning where present; Indications and Usage; Warnings and Precautions; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient composition, oral route, dosage form, product context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, regimen, or current commercial availability.',
    'Entacapone, tolcapone, and opicapone remain distinct adjunct identities; the carbidopa/levodopa/entacapone tablet remains a whole combination-product identity and is not collapsed into its components.',
    'Current levodopa/carbidopa product and regimen, wearing-off context, dyskinesia, hepatic function and tolcapone liver-risk context, blood pressure, concomitant MAO inhibitors, withdrawal or hyperpyrexia/confusion risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'No autonomous continuation, interruption, taper, component or whole-product conversion, dose conversion, substitution, anesthesia plan, or restart timing is supported.',
  ],
  retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this adjunct- or whole-product-specific COMT medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm], concepts: ['medication-identity', 'comt-inhibitor', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const parkinsonComtReviewRules: ClinicalRule[] = [{
  id: 'RULE-PARKINSON-COMT-REVIEW-001', version: 1,
  name: 'Explicit Parkinson COMT product requires clinician and anesthesia review',
  scope: { medicationIds: parkinsonComtIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: parkinsonComtIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];

export const parkinsonComtIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: parkinsonComtIdentitySources, atoms: parkinsonComtIdentityAtoms,
};
