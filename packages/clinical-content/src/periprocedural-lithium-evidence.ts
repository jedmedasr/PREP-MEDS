import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T18:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-lithium-carbonate-immediate-release-oral-tablet'
  | 'MED-lithium-carbonate-immediate-release-oral-capsule'
  | 'MED-lithobid-lithium-carbonate-extended-release-oral-tablet'
  | 'MED-lithium-citrate-oral-solution';

export interface PeriproceduralLithiumIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: 'ING-lithium';
  chemicalForm: 'LITHIUM_CARBONATE' | 'LITHIUM_CITRATE';
  genericName: string;
  dosageForm: string;
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  evidenceRef: { id: string; version: number };
}
export const periproceduralLithiumIdentityDefinitions: PeriproceduralLithiumIdentityDefinition[] = [
  { medicationId: 'MED-lithium-carbonate-immediate-release-oral-tablet', ingredientId: 'ING-lithium', chemicalForm: 'LITHIUM_CARBONATE', genericName: 'lithium carbonate immediate-release', dosageForm: 'TABLET', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-LITHIUM-CARBONATE-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-lithium-carbonate-immediate-release-oral-capsule', ingredientId: 'ING-lithium', chemicalForm: 'LITHIUM_CARBONATE', genericName: 'lithium carbonate immediate-release', dosageForm: 'CAPSULE', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-LITHIUM-CARBONATE-IR-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-lithobid-lithium-carbonate-extended-release-oral-tablet', ingredientId: 'ING-lithium', chemicalForm: 'LITHIUM_CARBONATE', genericName: 'LITHOBID lithium carbonate extended-release', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-LITHOBID-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-lithium-citrate-oral-solution', ingredientId: 'ING-lithium', chemicalForm: 'LITHIUM_CITRATE', genericName: 'lithium citrate', dosageForm: 'SOLUTION', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-LITHIUM-CITRATE-SOLUTION-IDENTITY', version: 1 } },
];

export const periproceduralLithiumIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-LITHIUM-CARBONATE-CITRATE-HIKMA-NDA017812', version: 1, sourceType: 'FDA_LABEL',
    title: 'Lithium carbonate immediate-release tablet/capsule and lithium citrate oral solution: direct DailyMed labeling',
    publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-06-04',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0e6b0a2d-b79c-44d8-b785-5267df9e8f72',
    externalIdentifier: 'DailyMed SETID 0e6b0a2d-b79c-44d8-b785-5267df9e8f72; NDA017812',
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '0e6b0a2d-b79c-44d8-b785-5267df9e8f72', applicationNumber: 'NDA017812', route: 'ORAL', dosageForms: 'TABLET; CAPSULE; SOLUTION', representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, saltConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-LITHOBID-ANI-NDA018027', version: 1, sourceType: 'FDA_LABEL',
    title: 'LITHOBID lithium carbonate film-coated extended-release oral tablet: direct DailyMed labeling',
    publisher: 'ANI Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-08-24',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f7f5b69a-c2a1-4586-a189-1475d41387c0',
    externalIdentifier: 'DailyMed SETID f7f5b69a-c2a1-4586-a189-1475d41387c0; NDA018027',
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: 'f7f5b69a-c2a1-4586-a189-1475d41387c0', applicationNumber: 'NDA018027', route: 'ORAL', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
];
const sourceByMedication: Record<MedicationId, string> = {
  'MED-lithium-carbonate-immediate-release-oral-tablet': 'SRC-LITHIUM-CARBONATE-CITRATE-HIKMA-NDA017812',
  'MED-lithium-carbonate-immediate-release-oral-capsule': 'SRC-LITHIUM-CARBONATE-CITRATE-HIKMA-NDA017812',
  'MED-lithobid-lithium-carbonate-extended-release-oral-tablet': 'SRC-LITHOBID-ANI-NDA018027',
  'MED-lithium-citrate-oral-solution': 'SRC-LITHIUM-CARBONATE-CITRATE-HIKMA-NDA017812',
};
export const periproceduralLithiumIdentityAtoms: EvidenceAtom[] = periproceduralLithiumIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with the stated chemical-form and release context.`,
  normalizedTopic: 'periprocedural-lithium-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-mood-stabilizer', 'CLS-lithium'], contextTags: ['chemical-form-release-identity', 'toxicity-hemodynamic-review-only'] },
  locator: { section: 'Boxed Warning; Dosage Forms and Strengths; Warnings and Precautions; Drug Interactions; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates lithium chemical form, oral route, dosage form, release context, and application provenance only; it does not authenticate a patient-specific product, manufacturer, NDC, strength, dose, regimen, adherence, serum concentration, indication, or current commercial availability.',
    'Immediate-release lithium carbonate tablet and capsule, LITHOBID extended-release tablet, and lithium citrate solution remain distinct identities; no equivalence, substitution, salt conversion, formulation conversion, or release conversion is authorized.',
    'Renal function, sodium and volume status, bowel preparation and fasting exposure, recent vomiting or diarrhea, serum lithium concentration and timing, toxicity symptoms, interacting diuretics/NSAIDs/RAAS antagonists/metronidazole/serotonergic or antipsychotic therapy, cardiac status, and anesthesia plan require accountable clinician and local-policy review.',
    'No autonomous continuation, interruption, taper, dose arithmetic, conversion, substitution, toxicity treatment, anesthesia plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} lithium identity`, summary: 'Direct DailyMed provenance supports this chemical-form/form/release medication-reconciliation identity.', keywords: [product.genericName, product.chemicalForm, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'lithium', 'toxicity-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));
export const periproceduralLithiumReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-LITHIUM-REVIEW-001', version: 1,
  name: 'Explicit lithium product requires clinician and anesthesia review',
  scope: { medicationIds: periproceduralLithiumIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralLithiumIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 93,
}];
export const periproceduralLithiumIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: periproceduralLithiumIdentitySources, atoms: periproceduralLithiumIdentityAtoms,
};
