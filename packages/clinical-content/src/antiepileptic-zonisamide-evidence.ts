import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T00:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-zonegran-zonisamide-oral-capsule'
  | 'MED-zonisade-zonisamide-oral-suspension';

export interface AntiepilepticZonisamideIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-zonisamide'];
  genericName: string;
  dosageForm: 'CAPSULE' | 'SUSPENSION';
  route: 'ORAL';
  formulationContext: 'CAPSULE' | 'ORAL_SUSPENSION';
  productContext: 'ZONEGRAN' | 'ZONISADE';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticZonisamideIdentityDefinitions: AntiepilepticZonisamideIdentityDefinition[] = [
  { medicationId: 'MED-zonegran-zonisamide-oral-capsule', ingredientIds: ['ING-zonisamide'], genericName: 'ZONEGRAN zonisamide', dosageForm: 'CAPSULE', route: 'ORAL', formulationContext: 'CAPSULE', productContext: 'ZONEGRAN', evidenceRef: { id: 'EVD-ZONEGRAN-ZONISAMIDE-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-zonisade-zonisamide-oral-suspension', ingredientIds: ['ING-zonisamide'], genericName: 'ZONISADE zonisamide', dosageForm: 'SUSPENSION', route: 'ORAL', formulationContext: 'ORAL_SUSPENSION', productContext: 'ZONISADE', evidenceRef: { id: 'EVD-ZONISADE-ZONISAMIDE-ORAL-SUSPENSION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; labelVersion: number }> = [
  { medicationId: 'MED-zonegran-zonisamide-oral-capsule', id: 'SRC-ZONEGRAN-ADVANZ-NDA020789', publisher: 'ADVANZ PHARMA (US) CORP.; DailyMed', setId: 'd12de43e-3ac3-4335-bc85-70d7366a91eb', effectiveDate: '2026-09-23', applicationNumber: 'NDA020789', labelVersion: 13 },
  { medicationId: 'MED-zonisade-zonisamide-oral-suspension', id: 'SRC-ZONISADE-AZURITY-NDA214273', publisher: 'Azurity Pharmaceuticals, Inc.; DailyMed', setId: 'ac16fa15-32e9-4f92-8bc6-d8d41ae002c6', effectiveDate: '2025-09-08', applicationNumber: 'NDA214273', labelVersion: 3 },
];
const definitionByMedication = new Map(antiepilepticZonisamideIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticZonisamideIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      route: definition.route, dosageForm: definition.dosageForm, formulationContext: definition.formulationContext, productContext: definition.productContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, renalFunctionNotInferred: true,
      metabolicAcidosisRiskNotInferred: true, hydrationStatusNotInferred: true, kidneyStoneRiskNotInferred: true,
      sulfonamideHypersensitivityNotInferred: true, carbonicAnhydraseInhibitorUseNotInferred: true,
      seizureControlNotInferred: true, adherenceNotInferred: true, oralFeasibilityNotInferred: true,
      withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, doseConversionAuthorized: false, formulationConversionAuthorized: false,
      combinationDecompositionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticZonisamideIdentityAtoms: EvidenceAtom[] = antiepilepticZonisamideIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as an oral ' + product.dosageForm.toLowerCase() + ' identity with ' + product.formulationContext.toLowerCase() + ' and ' + product.productContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-zonisamide-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Dosage and Administration; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, formulation/product context, label version, and application provenance only; it does not authenticate a patient-specific package, NDC, dose, adherence, indication, regimen, manufacturer, or current commercial availability.',
    'ZONEGRAN capsule and ZONISADE oral suspension remain distinct identities; bare zonisamide is not enough to select one.',
    'Indication, seizure context and control, last dose, adherence, renal function, bicarbonate/metabolic-acidosis risk, hydration and kidney-stone risk, sulfonamide hypersensitivity, concomitant carbonic-anhydrase inhibitors, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous formulation conversion, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this formulation-specific zonisamide medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.formulationContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticZonisamideReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-ZONISAMIDE-REVIEW-001', version: 1,
  name: 'Explicit zonisamide product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticZonisamideIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticZonisamideIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticZonisamideIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticZonisamideIdentitySources, atoms: antiepilepticZonisamideIdentityAtoms,
};
