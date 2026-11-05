import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T08:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-valproic-acid-oral-capsule'
  | 'MED-valproic-acid-oral-solution'
  | 'MED-valproate-sodium-intravenous-injection'
  | 'MED-depakote-divalproex-sodium-dr-oral-tablet'
  | 'MED-depakote-er-divalproex-sodium-er-oral-tablet'
  | 'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule';

type IngredientId = 'ING-valproic-acid' | 'ING-valproate-sodium' | 'ING-divalproex-sodium';

export interface AntiepilepticValproateIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: [IngredientId];
  genericName: string;
  dosageForm: 'CAPSULE' | 'SOLUTION' | 'INJECTION, SOLUTION' | 'TABLET, DELAYED RELEASE' | 'TABLET, EXTENDED RELEASE' | 'CAPSULE, DELAYED RELEASE PELLETS';
  route: 'ORAL' | 'INTRAVENOUS';
  chemicalContext: 'VALPROIC_ACID' | 'VALPROATE_SODIUM' | 'DIVALPROEX_SODIUM';
  releaseContext: 'IMMEDIATE_RELEASE' | 'DELAYED_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  wholeProductContext: 'GENERIC_SINGLE_INGREDIENT' | 'DEPAKOTE' | 'DEPAKOTE_ER' | 'DEPAKOTE_SPRINKLES';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticValproateIdentityDefinitions: AntiepilepticValproateIdentityDefinition[] = [
  { medicationId: 'MED-valproic-acid-oral-capsule', ingredientIds: ['ING-valproic-acid'], genericName: 'valproic acid', dosageForm: 'CAPSULE', route: 'ORAL', chemicalContext: 'VALPROIC_ACID', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'GENERIC_SINGLE_INGREDIENT', evidenceRef: { id: 'EVD-VALPROIC-ACID-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-valproic-acid-oral-solution', ingredientIds: ['ING-valproic-acid'], genericName: 'valproic acid', dosageForm: 'SOLUTION', route: 'ORAL', chemicalContext: 'VALPROIC_ACID', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'GENERIC_SINGLE_INGREDIENT', evidenceRef: { id: 'EVD-VALPROIC-ACID-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-valproate-sodium-intravenous-injection', ingredientIds: ['ING-valproate-sodium'], genericName: 'valproate sodium', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', chemicalContext: 'VALPROATE_SODIUM', releaseContext: 'NOT_APPLICABLE', wholeProductContext: 'GENERIC_SINGLE_INGREDIENT', evidenceRef: { id: 'EVD-VALPROATE-SODIUM-IV-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-depakote-divalproex-sodium-dr-oral-tablet', ingredientIds: ['ING-divalproex-sodium'], genericName: 'divalproex sodium', dosageForm: 'TABLET, DELAYED RELEASE', route: 'ORAL', chemicalContext: 'DIVALPROEX_SODIUM', releaseContext: 'DELAYED_RELEASE', wholeProductContext: 'DEPAKOTE', evidenceRef: { id: 'EVD-DEPAKOTE-DIVALPROEX-DR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-depakote-er-divalproex-sodium-er-oral-tablet', ingredientIds: ['ING-divalproex-sodium'], genericName: 'divalproex sodium', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', chemicalContext: 'DIVALPROEX_SODIUM', releaseContext: 'EXTENDED_RELEASE', wholeProductContext: 'DEPAKOTE_ER', evidenceRef: { id: 'EVD-DEPAKOTE-ER-DIVALPROEX-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule', ingredientIds: ['ING-divalproex-sodium'], genericName: 'divalproex sodium', dosageForm: 'CAPSULE, DELAYED RELEASE PELLETS', route: 'ORAL', chemicalContext: 'DIVALPROEX_SODIUM', releaseContext: 'DELAYED_RELEASE', wholeProductContext: 'DEPAKOTE_SPRINKLES', evidenceRef: { id: 'EVD-DEPAKOTE-SPRINKLES-DIVALPROEX-DR-CAPSULE-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; labelVersion?: number }> = [
  { medicationId: 'MED-valproic-acid-oral-capsule', id: 'SRC-VALPROIC-ACID-CAPSULE-UPSHER-SMITH-DAILYMED', publisher: 'Upsher-Smith Laboratories, LLC; DailyMed', setId: '7d4df6ad-3d53-4664-9200-749487bf3689', effectiveDate: '2025-07-09', applicationNumber: 'ANDA073229', labelVersion: 13 },
  { medicationId: 'MED-valproic-acid-oral-solution', id: 'SRC-VALPROIC-ACID-SOLUTION-ANI-DAILYMED', publisher: 'ANI Pharmaceuticals, Inc.; DailyMed', setId: '2314af65-b928-42a9-91eb-6372909ab4f5', effectiveDate: '2026-03-31', applicationNumber: 'ANDA073178', labelVersion: 3 },
  { medicationId: 'MED-valproate-sodium-intravenous-injection', id: 'SRC-VALPROATE-SODIUM-INJECTION-FRESENIUS-DAILYMED', publisher: 'Fresenius Kabi USA, LLC; DailyMed', setId: 'c572ece7-03d3-4c2a-aeb5-61f2023b28ea', effectiveDate: '2024-10-24', applicationNumber: 'ANDA076539', labelVersion: 11 },
  { medicationId: 'MED-depakote-divalproex-sodium-dr-oral-tablet', id: 'SRC-DEPAKOTE-DR-TABLET-ABBVIE-DAILYMED', publisher: 'AbbVie Inc.; DailyMed', setId: '08a65cf4-7749-4ceb-6895-8f4805e2b01f', effectiveDate: '2026-04-14', applicationNumber: 'NDA018723', labelVersion: 1621 },
  { medicationId: 'MED-depakote-er-divalproex-sodium-er-oral-tablet', id: 'SRC-DEPAKOTE-ER-TABLET-ABBVIE-DAILYMED', publisher: 'AbbVie Inc.; DailyMed', setId: '0dc024ce-efc8-4690-7cb5-639c728fccac', effectiveDate: '2026-03-31', applicationNumber: 'NDA021168', labelVersion: 1658 },
  { medicationId: 'MED-depakote-sprinkles-divalproex-sodium-dr-oral-capsule', id: 'SRC-DEPAKOTE-SPRINKLES-CAPSULE-ABBVIE-DAILYMED', publisher: 'AbbVie Inc.; DailyMed', setId: '4619aff4-0f80-444f-858d-42e4137aa809', effectiveDate: '2026-03-31', applicationNumber: 'NDA019680' },
];
const definitionByMedication = new Map(antiepilepticValproateIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const antiepilepticValproateIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: definition.wholeProductContext.replaceAll('_', ' ') + ' ' + definition.dosageForm.toLowerCase() + ': direct DailyMed SPL labeling',
    publisher: source.publisher, societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + source.setId,
    externalIdentifier: 'DailyMed SETID ' + source.setId,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, ...(source.labelVersion === undefined ? {} : { labelVersion: source.labelVersion }),
      route: definition.route, dosageForm: definition.dosageForm, chemicalContext: definition.chemicalContext,
      releaseContext: definition.releaseContext, wholeProductContext: definition.wholeProductContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, seizureControlNotInferred: true,
      chronicUseNotInferred: true, lastDoseNotInferred: true, adherenceNotInferred: true,
      hepaticFunctionNotInferred: true, renalFunctionNotInferred: true, plateletCountNotInferred: true,
      bleedingRiskNotInferred: true, pregnancyStatusNotInferred: true, concomitantAntiepilepticsNotInferred: true,
      concomitantSedativesNotInferred: true, oralFeasibilityNotInferred: true, withdrawalRiskNotInferred: true,
      procedureRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, acidSaltConversionAuthorized: false, doseConversionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false, releaseConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const antiepilepticValproateIdentityAtoms: EvidenceAtom[] = antiepilepticValproateIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed SPL labeling supports ' + product.genericName + ' as a ' + product.route.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity with ' + product.chemicalContext.toLowerCase() + ' and ' + product.releaseContext.toLowerCase() + ' context.',
  normalizedTopic: 'antiepileptic-valproate-divalproex-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic', 'CLS-valproate'], contextTags: ['route-form-release-identity', 'acid-salt-divalproex-distinction', 'withdrawal-sensitive-review-only'] },
  locator: { section: 'Dosage Forms and Strengths; Contraindications; Warnings and Precautions; Drug Interactions; Use in Specific Populations; Description; Product Information' },
  limitations: [
    'The source authenticates the named ingredient, route, dosage form, release context, whole-product context, application number, and SPL provenance only; a patient-specific package, NDC, dose, regimen, adherence, indication, manufacturer, and current commercial availability are not inferred.',
    'Valproic acid, valproate sodium, and divalproex sodium remain distinct chemical/product contexts; oral capsule, oral solution, intravenous injection, delayed-release tablet, extended-release tablet, and delayed-release sprinkle capsule remain distinct identities.',
    'Indication, seizure control, chronic use, last dose, adherence, hepatic and renal function, platelet count or bleeding risk, pregnancy status, concomitant antiepileptics or sedatives, oral feasibility, withdrawal risk, procedure risk, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize autonomous acid/salt, route, formulation, release, or dose conversion; substitution; continuation; interruption; taper; administration timing; monitoring; anesthesia planning; or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed SPL provenance supports this route/form/release-specific medication-reconciliation identity while preserving acid, salt, divalproex, and whole-product distinctions.', keywords: [product.genericName, product.dosageForm, product.chemicalContext, product.releaseContext], concepts: ['medication-identity', 'antiepileptic', 'valproate', 'withdrawal-sensitive-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticValproateReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-VALPROATE-REVIEW-001', version: 1,
  name: 'Explicit valproate or divalproex product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticValproateIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticValproateIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const antiepilepticValproateIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticValproateIdentitySources, atoms: antiepilepticValproateIdentityAtoms,
};
