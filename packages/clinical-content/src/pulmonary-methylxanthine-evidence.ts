import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T15:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-theophylline-oral-solution'
  | 'MED-theophylline-er-oral-tablet'
  | 'MED-theo-24-theophylline-er-oral-capsule'
  | 'MED-aminophylline-intravenous-injection';
type IngredientId = 'ING-theophylline-anhydrous' | 'ING-aminophylline-dihydrate';

export interface PulmonaryMethylxanthineIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'SOLUTION' | 'TABLET, EXTENDED RELEASE' | 'CAPSULE, EXTENDED RELEASE' | 'INJECTION, SOLUTION';
  routeContext: 'ORAL' | 'INTRAVENOUS';
  releaseFormContext: 'ORAL_SOLUTION_NON_EXTENDED_RELEASE' | 'EXTENDED_RELEASE_TABLET' | 'EXTENDED_RELEASE_CAPSULE' | 'PARENTERAL_INJECTION';
  ingredientContext: 'THEOPHYLLINE_ANHYDROUS' | 'AMINOPHYLLINE_DIHYDRATE';
  evidenceRef: { id: string; version: number };
}

export const pulmonaryMethylxanthineIdentityDefinitions: PulmonaryMethylxanthineIdentityDefinition[] = [
  { medicationId: 'MED-theophylline-oral-solution', ingredientIds: ['ING-theophylline-anhydrous'], genericName: 'theophylline anhydrous', dosageForm: 'SOLUTION', routeContext: 'ORAL', releaseFormContext: 'ORAL_SOLUTION_NON_EXTENDED_RELEASE', ingredientContext: 'THEOPHYLLINE_ANHYDROUS', evidenceRef: { id: 'EVD-THEOPHYLLINE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-theophylline-er-oral-tablet', ingredientIds: ['ING-theophylline-anhydrous'], genericName: 'theophylline anhydrous', dosageForm: 'TABLET, EXTENDED RELEASE', routeContext: 'ORAL', releaseFormContext: 'EXTENDED_RELEASE_TABLET', ingredientContext: 'THEOPHYLLINE_ANHYDROUS', evidenceRef: { id: 'EVD-THEOPHYLLINE-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-theo-24-theophylline-er-oral-capsule', ingredientIds: ['ING-theophylline-anhydrous'], genericName: 'theophylline anhydrous', dosageForm: 'CAPSULE, EXTENDED RELEASE', routeContext: 'ORAL', releaseFormContext: 'EXTENDED_RELEASE_CAPSULE', ingredientContext: 'THEOPHYLLINE_ANHYDROUS', evidenceRef: { id: 'EVD-THEO-24-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-aminophylline-intravenous-injection', ingredientIds: ['ING-aminophylline-dihydrate'], genericName: 'aminophylline dihydrate', dosageForm: 'INJECTION, SOLUTION', routeContext: 'INTRAVENOUS', releaseFormContext: 'PARENTERAL_INJECTION', ingredientContext: 'AMINOPHYLLINE_DIHYDRATE', evidenceRef: { id: 'EVD-AMINOPHYLLINE-IV-INJECTION-IDENTITY', version: 1 } },
];

const sources: SourceDocument[] = [
  { id: 'SRC-THEOPHYLLINE-ORAL-SOLUTION-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Theophylline oral solution labeling', publisher: 'Chartwell Governmental & Specialty RX, LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-11-18', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e2716dac-8b23-4e06-bc3e-4dd76b7c813e', externalIdentifier: 'DailyMed SETID e2716dac-8b23-4e06-bc3e-4dd76b7c813e', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseFormConversionAuthorized: false, doseConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-THEOPHYLLINE-ER-TABLET-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Theophylline extended-release oral tablet labeling', publisher: 'Strides Pharma Science Limited; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-06-08', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b7a90ccf-9c32-40cc-9008-7e55b3da4dfd', externalIdentifier: 'DailyMed SETID b7a90ccf-9c32-40cc-9008-7e55b3da4dfd', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseFormConversionAuthorized: false, doseConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-THEO-24-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'THEO-24 theophylline anhydrous extended-release oral capsule labeling', publisher: 'ENDO USA, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-07-09', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7a108fa0-c230-475f-be93-6f864b98a410', externalIdentifier: 'DailyMed SETID 7a108fa0-c230-475f-be93-6f864b98a410', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, brandedProductIdentity: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseFormConversionAuthorized: false, doseConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-AMINOPHYLLINE-INJECTION-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Aminophylline intravenous injection labeling', publisher: 'Hospira, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-05-25', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9a663ef3-881f-48bd-2689-3713b24545c2', externalIdentifier: 'DailyMed SETID 9a663ef3-881f-48bd-2689-3713b24545c2', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, parenteralIdentity: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, ingredientConversionAuthorized: false, doseConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
];

const sourceByMedication: Record<MedicationId, string> = {
  'MED-theophylline-oral-solution': 'SRC-THEOPHYLLINE-ORAL-SOLUTION-DAILYMED',
  'MED-theophylline-er-oral-tablet': 'SRC-THEOPHYLLINE-ER-TABLET-DAILYMED',
  'MED-theo-24-theophylline-er-oral-capsule': 'SRC-THEO-24-DAILYMED',
  'MED-aminophylline-intravenous-injection': 'SRC-AMINOPHYLLINE-INJECTION-DAILYMED',
};

export const pulmonaryMethylxanthineIdentityAtoms: EvidenceAtom[] = pulmonaryMethylxanthineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: 'Authoritative labeling supports ' + product.medicationId + ' as a distinct ' + product.routeContext.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity containing ' + product.genericName + '.',
  normalizedTopic: 'pulmonary-methylxanthine-route-form-release-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-systemic-methylxanthine-bronchodilator'], contextTags: ['route-form-release-identity', 'narrow-therapeutic-index-review-only', 'airway-anesthesia-review-only'] },
  locator: { section: 'Indications and Usage; Clinical Pharmacology; Warnings; Drug Interactions; Product Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, and release-form identity only; patient-specific product, regimen, indication, serum concentration, manufacturer, and current availability are not inferred.',
    'Oral solution, extended-release tablet, THEO-24 extended-release capsule, and intravenous aminophylline remain distinct; ingredient, salt/complex, route, dosage-form, and release-form conversion is not authorized.',
    'Airway disease/control, acute symptoms, serum-theophylline concentration, toxicity symptoms, interacting medicines, smoking-status change, fever/sepsis, hepatic or cardiac disease, seizure or arrhythmia risk, oral feasibility, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, substitution, route or release conversion, dose arithmetic, monitoring targets, administration timing, infusion instructions, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.medicationId + ' identity', summary: 'Authoritative labeling supports this route-, form-, release-, and ingredient-specific systemic methylxanthine identity.', keywords: [product.genericName, product.dosageForm, product.routeContext], concepts: ['medication-identity', 'systemic-methylxanthine', 'airway-anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const pulmonaryMethylxanthineReviewRules: ClinicalRule[] = [{
  id: 'RULE-PULMONARY-METHYLXANTHINE-REVIEW-001', version: 1,
  name: 'Explicit systemic methylxanthine identity requires clinician and anesthesia review',
  scope: { medicationIds: pulmonaryMethylxanthineIdentityDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: pulmonaryMethylxanthineIdentityDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const pulmonaryMethylxanthineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: pulmonaryMethylxanthineIdentityAtoms,
};
