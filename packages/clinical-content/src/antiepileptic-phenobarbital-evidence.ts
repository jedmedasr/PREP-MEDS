import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T05:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-phenobarbital-oral-tablet'
  | 'MED-phenobarbital-oral-solution'
  | 'MED-phenobarbital-sodium-parenteral-injection';

export interface AntiepilepticPhenobarbitalIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-phenobarbital'];
  genericName: string;
  dosageForm: 'TABLET' | 'SOLUTION' | 'INJECTION, SOLUTION';
  route: 'ORAL' | 'INTRAVENOUS_OR_INTRAMUSCULAR';
  chemicalContext: 'PHENOBARBITAL' | 'PHENOBARBITAL_SODIUM';
  marketingContext: 'UNAPPROVED_DRUG_OTHER';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticPhenobarbitalIdentityDefinitions: AntiepilepticPhenobarbitalIdentityDefinition[] = [
  { medicationId: 'MED-phenobarbital-oral-tablet', ingredientIds: ['ING-phenobarbital'], genericName: 'phenobarbital', dosageForm: 'TABLET', route: 'ORAL', chemicalContext: 'PHENOBARBITAL', marketingContext: 'UNAPPROVED_DRUG_OTHER', evidenceRef: { id: 'EVD-PHENOBARBITAL-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-phenobarbital-oral-solution', ingredientIds: ['ING-phenobarbital'], genericName: 'phenobarbital oral solution', dosageForm: 'SOLUTION', route: 'ORAL', chemicalContext: 'PHENOBARBITAL', marketingContext: 'UNAPPROVED_DRUG_OTHER', evidenceRef: { id: 'EVD-PHENOBARBITAL-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-phenobarbital-sodium-parenteral-injection', ingredientIds: ['ING-phenobarbital'], genericName: 'phenobarbital sodium', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS_OR_INTRAMUSCULAR', chemicalContext: 'PHENOBARBITAL_SODIUM', marketingContext: 'UNAPPROVED_DRUG_OTHER', evidenceRef: { id: 'EVD-PHENOBARBITAL-SODIUM-PARENTERAL-INJECTION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; labelVersion: number }> = [
  { medicationId: 'MED-phenobarbital-oral-tablet', id: 'SRC-PHENOBARBITAL-TABLET-QUAGEN-DAILYMED', publisher: 'Quagen Pharmaceuticals LLC; DailyMed', setId: '81930c69-d073-402a-9089-ae891bfddc25', effectiveDate: '2023-02-16', labelVersion: 3 },
  { medicationId: 'MED-phenobarbital-oral-solution', id: 'SRC-PHENOBARBITAL-ORAL-SOLUTION-BPI-DAILYMED', publisher: 'BPI Labs LLC; DailyMed', setId: '45f6317e-cfc9-4ec9-84c9-72daa6c68911', effectiveDate: '2025-12-29', labelVersion: 3 },
  { medicationId: 'MED-phenobarbital-sodium-parenteral-injection' as MedicationId, id: 'SRC-PHENOBARBITAL-SODIUM-INJECTION-BPI-DAILYMED', publisher: 'BPI Labs LLC; DailyMed', setId: 'b42d35de-a07a-4db5-998d-d4dbb92342cf', effectiveDate: '2025-12-17', labelVersion: 8 },
];
const definitionByMedication = new Map(antiepilepticPhenobarbitalIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticPhenobarbitalIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: definition.genericName + ' ' + definition.dosageForm.toLowerCase() + ': direct DailyMed SPL labeling',
    publisher: source.publisher, societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + source.setId,
    externalIdentifier: 'DailyMed SETID ' + source.setId,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, labelVersion: source.labelVersion, marketingContext: definition.marketingContext,
      route: definition.route, dosageForm: definition.dosageForm, chemicalContext: definition.chemicalContext,
      representativeIdentityOnly: true, fdaApprovalNotAsserted: true, patientIndicationNotInferred: true,
      seizureControlNotInferred: true, chronicUseNotInferred: true, lastDoseNotInferred: true,
      adherenceNotInferred: true, hepaticFunctionNotInferred: true, renalFunctionNotInferred: true,
      respiratoryStatusNotInferred: true, concomitantSedativesNotInferred: true, oralFeasibilityNotInferred: true,
      withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, saltConversionAuthorized: false, doseConversionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticPhenobarbitalIdentityAtoms: EvidenceAtom[] = antiepilepticPhenobarbitalIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed SPL labeling supports ' + product.genericName + ' as a ' + product.route.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity with ' + product.chemicalContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-phenobarbital-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic', 'CLS-barbiturate'], contextTags: ['route-form-salt-identity', 'withdrawal-sensitive-review-only', 'dailyMed-unapproved-drug-other'] },
  locator: { section: 'Description; Clinical Pharmacology; Warnings; Drug Interactions; Drug Abuse and Dependence; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, salt context, label version, and the listed unapproved-drug-other marketing context only; FDA approval, a patient-specific package, NDC, dose, regimen, adherence, indication, manufacturer, and current commercial availability are not inferred.',
    'Oral tablet, oral solution, and parenteral phenobarbital sodium remain distinct identities; bare phenobarbital wording is not enough to select one.',
    'Indication, seizure control, chronic use, last dose, adherence, hepatic/renal and respiratory status, concomitant sedatives or opioids or alcohol, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous salt, route, formulation, or dose conversion; substitution; continuation; interruption; taper; administration timing; monitoring; anesthesia planning; or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed SPL provenance supports this route/form/salt-specific medication-reconciliation identity while preserving unapproved marketing status.', keywords: [product.genericName, product.dosageForm, product.chemicalContext], concepts: ['medication-identity', 'antiepileptic', 'barbiturate', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticPhenobarbitalReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-PHENOBARBITAL-REVIEW-001', version: 1,
  name: 'Explicit phenobarbital product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticPhenobarbitalIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticPhenobarbitalIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const antiepilepticPhenobarbitalIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticPhenobarbitalIdentitySources, atoms: antiepilepticPhenobarbitalIdentityAtoms,
};
