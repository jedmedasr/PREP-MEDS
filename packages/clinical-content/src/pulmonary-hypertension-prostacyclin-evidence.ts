import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T16:50:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-veletri-epoprostenol-intravenous-infusion'
  | 'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion'
  | 'MED-tyvaso-treprostinil-inhalation-solution'
  | 'MED-tyvaso-dpi-treprostinil-inhalation-powder'
  | 'MED-orenitram-treprostinil-er-oral-tablet'
  | 'MED-uptravi-selexipag-oral-tablet'
  | 'MED-uptravi-selexipag-intravenous-injection';
type IngredientId = 'ING-epoprostenol' | 'ING-treprostinil' | 'ING-selexipag';

export interface PulmonaryHypertensionProstacyclinIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION' | 'INJECTION, SOLUTION' | 'SOLUTION' | 'POWDER' | 'TABLET, EXTENDED RELEASE' | 'TABLET, FILM COATED' | 'INJECTION, POWDER, FOR SOLUTION';
  routeContext: 'INTRAVENOUS' | 'SUBCUTANEOUS_OR_INTRAVENOUS' | 'RESPIRATORY_TRACT' | 'ORAL';
  deliveryContext: 'CONTINUOUS_INTRAVENOUS_INFUSION' | 'CONTINUOUS_SUBCUTANEOUS_OR_INTRAVENOUS_INFUSION' | 'INHALATION_SOLUTION_DEVICE' | 'DRY_POWDER_INHALER' | 'EXTENDED_RELEASE_ORAL_TABLET' | 'ORAL_TABLET' | 'INTRAVENOUS_INJECTION';
  evidenceRef: { id: string; version: number };
}

export const pulmonaryHypertensionProstacyclinIdentityDefinitions: PulmonaryHypertensionProstacyclinIdentityDefinition[] = [
  { medicationId: 'MED-veletri-epoprostenol-intravenous-infusion', ingredientIds: ['ING-epoprostenol'], genericName: 'epoprostenol', dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', routeContext: 'INTRAVENOUS', deliveryContext: 'CONTINUOUS_INTRAVENOUS_INFUSION', evidenceRef: { id: 'EVD-VELETRI-IV-INFUSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion', ingredientIds: ['ING-treprostinil'], genericName: 'treprostinil', dosageForm: 'INJECTION, SOLUTION', routeContext: 'SUBCUTANEOUS_OR_INTRAVENOUS', deliveryContext: 'CONTINUOUS_SUBCUTANEOUS_OR_INTRAVENOUS_INFUSION', evidenceRef: { id: 'EVD-REMODULIN-SC-IV-INFUSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-tyvaso-treprostinil-inhalation-solution', ingredientIds: ['ING-treprostinil'], genericName: 'treprostinil', dosageForm: 'SOLUTION', routeContext: 'RESPIRATORY_TRACT', deliveryContext: 'INHALATION_SOLUTION_DEVICE', evidenceRef: { id: 'EVD-TYVASO-INHALATION-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-tyvaso-dpi-treprostinil-inhalation-powder', ingredientIds: ['ING-treprostinil'], genericName: 'treprostinil', dosageForm: 'POWDER', routeContext: 'RESPIRATORY_TRACT', deliveryContext: 'DRY_POWDER_INHALER', evidenceRef: { id: 'EVD-TYVASO-DPI-IDENTITY', version: 1 } },
  { medicationId: 'MED-orenitram-treprostinil-er-oral-tablet', ingredientIds: ['ING-treprostinil'], genericName: 'treprostinil', dosageForm: 'TABLET, EXTENDED RELEASE', routeContext: 'ORAL', deliveryContext: 'EXTENDED_RELEASE_ORAL_TABLET', evidenceRef: { id: 'EVD-ORENITRAM-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-uptravi-selexipag-oral-tablet', ingredientIds: ['ING-selexipag'], genericName: 'selexipag', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', deliveryContext: 'ORAL_TABLET', evidenceRef: { id: 'EVD-UPTRAVI-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-uptravi-selexipag-intravenous-injection', ingredientIds: ['ING-selexipag'], genericName: 'selexipag', dosageForm: 'INJECTION, POWDER, FOR SOLUTION', routeContext: 'INTRAVENOUS', deliveryContext: 'INTRAVENOUS_INJECTION', evidenceRef: { id: 'EVD-UPTRAVI-IV-INJECTION-IDENTITY', version: 1 } },
];

const sourceMetadata = {
  representativeIdentityOnly: true,
  marketAvailabilityAsserted: false,
  substitutionAuthorized: false,
  routeConversionAuthorized: false,
  deviceConversionAuthorized: false,
  doseConversionAuthorized: false,
  transitionProtocolAuthorized: false,
  timingRuleAuthorized: false,
  clinicalApprovalGranted: false,
};

const sources: SourceDocument[] = [
  { id: 'SRC-VELETRI-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'VELETRI epoprostenol intravenous infusion labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2022-11-30', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=df502787-46ec-4dd1-a2c0-be90f6d95a5d', externalIdentifier: 'DailyMed SETID df502787-46ec-4dd1-a2c0-be90f6d95a5d', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, continuousInfusionIdentity: true } },
  { id: 'SRC-REMODULIN-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'REMODULIN treprostinil subcutaneous or intravenous infusion labeling', publisher: 'United Therapeutics Corporation; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-07-02', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6c80bb38-e8db-4138-9f0d-dbbf9c673185', externalIdentifier: 'DailyMed SETID 6c80bb38-e8db-4138-9f0d-dbbf9c673185', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, continuousInfusionIdentity: true } },
  { id: 'SRC-TYVASO-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'TYVASO treprostinil inhalation solution labeling', publisher: 'United Therapeutics Corporation; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-04-14', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=cbc31ab1-a80f-4b50-a3b1-39910b0fb609', externalIdentifier: 'DailyMed SETID cbc31ab1-a80f-4b50-a3b1-39910b0fb609', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, inhalationSolutionIdentity: true } },
  { id: 'SRC-TYVASO-DPI-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'TYVASO DPI treprostinil inhalation powder labeling', publisher: 'United Therapeutics Corporation; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-11-20', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ddc3d400-bcb3-4b09-aae2-0768b10a5b0f', externalIdentifier: 'DailyMed SETID ddc3d400-bcb3-4b09-aae2-0768b10a5b0f', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, dryPowderInhalerIdentity: true } },
  { id: 'SRC-ORENITRAM-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ORENITRAM treprostinil extended-release oral tablet labeling', publisher: 'United Therapeutics Corporation; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-11-20', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8ed2003a-c801-411e-831e-d06079bb0d7c', externalIdentifier: 'DailyMed SETID 8ed2003a-c801-411e-831e-d06079bb0d7c', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, extendedReleaseIdentity: true } },
  { id: 'SRC-UPTRAVI-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'UPTRAVI selexipag oral tablet and intravenous injection labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-05-28', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a7a23b87-f892-4e2c-8e2e-ebf841220f90', externalIdentifier: 'DailyMed SETID a7a23b87-f892-4e2c-8e2e-ebf841220f90', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
];

const sourceByMedication: Record<MedicationId, string> = {
  'MED-veletri-epoprostenol-intravenous-infusion': 'SRC-VELETRI-DAILYMED',
  'MED-remodulin-treprostinil-subcutaneous-intravenous-infusion': 'SRC-REMODULIN-DAILYMED',
  'MED-tyvaso-treprostinil-inhalation-solution': 'SRC-TYVASO-DAILYMED',
  'MED-tyvaso-dpi-treprostinil-inhalation-powder': 'SRC-TYVASO-DPI-DAILYMED',
  'MED-orenitram-treprostinil-er-oral-tablet': 'SRC-ORENITRAM-DAILYMED',
  'MED-uptravi-selexipag-oral-tablet': 'SRC-UPTRAVI-DAILYMED',
  'MED-uptravi-selexipag-intravenous-injection': 'SRC-UPTRAVI-DAILYMED',
};

export const pulmonaryHypertensionProstacyclinIdentityAtoms: EvidenceAtom[] = pulmonaryHypertensionProstacyclinIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: 'Authoritative labeling supports ' + product.medicationId + ' as a distinct ' + product.routeContext.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity containing ' + product.genericName + '.',
  normalizedTopic: 'pulmonary-hypertension-prostacyclin-route-form-device-infusion-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-pulmonary-hypertension-prostacyclin-pathway'], contextTags: ['route-form-device-identity', 'infusion-continuity-review-only', 'hemodynamic-anesthesia-review-only'] },
  locator: { section: 'Indications and Usage; Dosage and Administration; Warnings and Precautions; Product Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, device or delivery context, and whole-product identity only; patient-specific regimen, dose, indication, manufacturer, and current availability are not inferred.',
    'VELETRI infusion, REMODULIN subcutaneous/intravenous infusion, TYVASO inhalation solution, TYVASO DPI powder, ORENITRAM extended-release tablets, and UPTRAVI oral and intravenous products remain distinct; route, device, dosage-form, release-form, dose, or product conversion is not authorized.',
    'PAH diagnosis and severity, current symptoms or decompensation, right-heart failure and hemodynamics, oxygen or ventilation needs, hypotension, bleeding or platelet context, hepatic function and interactions, oral feasibility, pump/catheter/device availability, infusion continuity and backup planning, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, transition equations, substitution, route or device conversion, dose arithmetic, infusion rates, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.medicationId + ' identity', summary: 'Authoritative labeling supports this route-, form-, device-, release-, and delivery-specific pulmonary-hypertension prostacyclin-pathway identity.', keywords: [product.genericName, product.dosageForm, product.routeContext], concepts: ['medication-identity', 'pulmonary-hypertension', 'prostacyclin-pathway', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const pulmonaryHypertensionProstacyclinReviewRules: ClinicalRule[] = [{
  id: 'RULE-PULMONARY-HYPERTENSION-PROSTACYCLIN-REVIEW-001', version: 1,
  name: 'Explicit pulmonary-hypertension prostacyclin-pathway identity requires clinician and anesthesia review',
  scope: { medicationIds: pulmonaryHypertensionProstacyclinIdentityDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: pulmonaryHypertensionProstacyclinIdentityDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 100,
}];

export const pulmonaryHypertensionProstacyclinIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: pulmonaryHypertensionProstacyclinIdentityAtoms,
};
