import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T04:50:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-dilantin-phenytoin-sodium-er-oral-capsule'
  | 'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet'
  | 'MED-dilantin-125-phenytoin-oral-suspension'
  | 'MED-phenytoin-sodium-parenteral-injection'
  | 'MED-cerebyx-fosphenytoin-sodium-parenteral-injection';
type IngredientId = 'ING-phenytoin' | 'ING-fosphenytoin';

export interface AntiepilepticPhenytoinIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'CAPSULE, EXTENDED RELEASE' | 'TABLET, CHEWABLE' | 'SUSPENSION' | 'INJECTION, SOLUTION';
  route: 'ORAL' | 'INTRAVENOUS_OR_INTRAMUSCULAR';
  releaseContext: 'EXTENDED_RELEASE' | 'IMMEDIATE_RELEASE' | 'NOT_APPLICABLE';
  chemicalContext: 'PHENYTOIN_SODIUM' | 'PHENYTOIN_FREE_ACID' | 'FOSPHENYTOIN_SODIUM';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticPhenytoinIdentityDefinitions: AntiepilepticPhenytoinIdentityDefinition[] = [
  { medicationId: 'MED-dilantin-phenytoin-sodium-er-oral-capsule', ingredientIds: ['ING-phenytoin'], genericName: 'DILANTIN extended phenytoin sodium', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseContext: 'EXTENDED_RELEASE', chemicalContext: 'PHENYTOIN_SODIUM', evidenceRef: { id: 'EVD-DILANTIN-PHENYTOIN-SODIUM-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet', ingredientIds: ['ING-phenytoin'], genericName: 'DILANTIN INFATABS phenytoin', dosageForm: 'TABLET, CHEWABLE', route: 'ORAL', releaseContext: 'IMMEDIATE_RELEASE', chemicalContext: 'PHENYTOIN_FREE_ACID', evidenceRef: { id: 'EVD-DILANTIN-INFATABS-PHENYTOIN-CHEWABLE-IDENTITY', version: 1 } },
  { medicationId: 'MED-dilantin-125-phenytoin-oral-suspension', ingredientIds: ['ING-phenytoin'], genericName: 'DILANTIN-125 phenytoin', dosageForm: 'SUSPENSION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', chemicalContext: 'PHENYTOIN_FREE_ACID', evidenceRef: { id: 'EVD-DILANTIN-125-PHENYTOIN-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-phenytoin-sodium-parenteral-injection', ingredientIds: ['ING-phenytoin'], genericName: 'phenytoin sodium', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', releaseContext: 'NOT_APPLICABLE', chemicalContext: 'PHENYTOIN_SODIUM', evidenceRef: { id: 'EVD-PHENYTOIN-SODIUM-PARENTERAL-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-cerebyx-fosphenytoin-sodium-parenteral-injection', ingredientIds: ['ING-fosphenytoin'], genericName: 'CEREBYX fosphenytoin sodium', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', releaseContext: 'NOT_APPLICABLE', chemicalContext: 'FOSPHENYTOIN_SODIUM', evidenceRef: { id: 'EVD-CEREBYX-FOSPHENYTOIN-PARENTERAL-INJECTION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; labelVersion: number }> = [
  { medicationId: 'MED-dilantin-phenytoin-sodium-er-oral-capsule', id: 'SRC-DILANTIN-ER-VIATRIS-ANDA084349', publisher: 'Viatris Specialty LLC; DailyMed', setId: '86dd27d1-9cee-48ae-b55d-e2d2f7dbc593', effectiveDate: '2025-04-10', applicationNumber: 'ANDA084349', labelVersion: 3 },
  { medicationId: 'MED-dilantin-infatabs-phenytoin-chewable-oral-tablet', id: 'SRC-DILANTIN-INFATABS-PFIZER-ANDA084427', publisher: 'Parke-Davis Division of Pfizer Inc.; DailyMed', setId: 'ca119a89-2394-4d34-8078-cd1fa4e8e2f1', effectiveDate: '2026-05-12', applicationNumber: 'ANDA084427', labelVersion: 58 },
  { medicationId: 'MED-dilantin-125-phenytoin-oral-suspension', id: 'SRC-DILANTIN-125-VIATRIS-NDA008762', publisher: 'Viatris Specialty LLC; DailyMed', setId: 'f339f9e4-b289-4efe-82b9-46c57d1dc277', effectiveDate: '2023-02-02', applicationNumber: 'NDA008762', labelVersion: 1 },
  { medicationId: 'MED-phenytoin-sodium-parenteral-injection', id: 'SRC-PHENYTOIN-SODIUM-INJECTION-HIKMA-ANDA084307', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '8ad1be7b-a1a4-4a2a-bf9b-d22b350aa6e7', effectiveDate: '2024-04-10', applicationNumber: 'ANDA084307', labelVersion: 21 },
  { medicationId: 'MED-cerebyx-fosphenytoin-sodium-parenteral-injection', id: 'SRC-CEREBYX-PFIZER-NDA020450', publisher: 'Pfizer Laboratories Division of Pfizer Inc.; DailyMed', setId: 'd4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a', effectiveDate: '2025-08-28', applicationNumber: 'NDA020450', labelVersion: 38 },
];
const definitionByMedication = new Map(antiepilepticPhenytoinIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticPhenytoinIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      route: definition.route, dosageForm: definition.dosageForm, releaseContext: definition.releaseContext, chemicalContext: definition.chemicalContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, seizureControlNotInferred: true,
      lastDoseNotInferred: true, adherenceNotInferred: true, serumConcentrationNotInferred: true,
      albuminStatusNotInferred: true, renalFunctionNotInferred: true, hepaticFunctionNotInferred: true,
      cardiacStatusNotInferred: true, interactingDrugsNotInferred: true, oralFeasibilityNotInferred: true,
      withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, saltConversionAuthorized: false, prodrugConversionAuthorized: false,
      doseConversionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false,
      releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticPhenytoinIdentityAtoms: EvidenceAtom[] = antiepilepticPhenytoinIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as a ' + product.route.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity with ' + product.chemicalContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-phenytoin-fosphenytoin-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-release-salt-prodrug-identity', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Highlights; Dosage and Administration; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release, salt or prodrug context, label version, and application provenance only; it does not authenticate a patient-specific package, NDC, dose, regimen, adherence, indication, manufacturer, or current commercial availability.',
    'Extended phenytoin sodium capsules, phenytoin free-acid chewable tablets and suspension, parenteral phenytoin sodium, and parenteral fosphenytoin sodium remain distinct identities; bare phenytoin or DILANTIN is not enough to select one.',
    'Indication, seizure control, last dose, adherence, serum concentrations, albumin, renal/hepatic function, cardiac status, interacting drugs, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous salt, prodrug, route, formulation, or release conversion; dose equivalence; substitution; continuation; interruption; taper; administration timing; monitoring; anesthesia planning; or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this route/form/release/salt/prodrug-specific medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.chemicalContext], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticPhenytoinReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-PHENYTOIN-FOSPHENYTOIN-REVIEW-001', version: 1,
  name: 'Explicit phenytoin or fosphenytoin product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticPhenytoinIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticPhenytoinIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const antiepilepticPhenytoinIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticPhenytoinIdentitySources, atoms: antiepilepticPhenytoinIdentityAtoms,
};
