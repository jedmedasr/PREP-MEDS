import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-04T02:49:01Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-risperidone-oral-tablet'
  | 'MED-risperidone-oral-solution'
  | 'MED-risperidone-orally-disintegrating-tablet'
  | 'MED-risperdal-consta-risperidone-er-intramuscular-injection'
  | 'MED-perseris-risperidone-er-subcutaneous-injection'
  | 'MED-uzedy-risperidone-er-subcutaneous-injection';

export interface PeriproceduralRisperidoneIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: 'ING-risperidone';
  genericName: string;
  routeContext: 'ORAL' | 'INTRAMUSCULAR' | 'SUBCUTANEOUS';
  dosageForm: 'TABLET' | 'SOLUTION' | 'ORALLY_DISINTEGRATING_TABLET' | 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION';
  releaseContext: 'NOT_APPLICABLE' | 'EXTENDED_RELEASE';
  evidenceRef: { id: string; version: number };
}
export const periproceduralRisperidoneIdentityDefinitions: PeriproceduralRisperidoneIdentityDefinition[] = [
  { medicationId: 'MED-risperidone-oral-tablet', ingredientId: 'ING-risperidone', genericName: 'risperidone oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-RISPERIDONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-risperidone-oral-solution', ingredientId: 'ING-risperidone', genericName: 'risperidone oral solution', routeContext: 'ORAL', dosageForm: 'SOLUTION', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-RISPERIDONE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-risperidone-orally-disintegrating-tablet', ingredientId: 'ING-risperidone', genericName: 'risperidone orally disintegrating tablet', routeContext: 'ORAL', dosageForm: 'ORALLY_DISINTEGRATING_TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-RISPERIDONE-ODT-IDENTITY', version: 1 } },
  { medicationId: 'MED-risperdal-consta-risperidone-er-intramuscular-injection', ingredientId: 'ING-risperidone', genericName: 'RISPERDAL CONSTA risperidone extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-RISPERDAL-CONSTA-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-perseris-risperidone-er-subcutaneous-injection', ingredientId: 'ING-risperidone', genericName: 'PERSERIS risperidone extended-release subcutaneous injection', routeContext: 'SUBCUTANEOUS', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-PERSERIS-SC-IDENTITY', version: 1 } },
  { medicationId: 'MED-uzedy-risperidone-er-subcutaneous-injection', ingredientId: 'ING-risperidone', genericName: 'UZEDY risperidone extended-release subcutaneous injection', routeContext: 'SUBCUTANEOUS', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-UZEDY-SC-IDENTITY', version: 1 } },
];
const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
export const periproceduralRisperidoneIdentitySources: SourceDocument[] = [
  { id: 'SRC-RISPERIDONE-ORAL-JANSSEN-SETID701E', version: 1, sourceType: 'FDA_LABEL', title: 'Risperidone tablets, oral solution, and orally disintegrating tablets: direct DailyMed labeling', publisher: 'Janssen Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-08-20', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=701e1cd8-2868-4d29-85a9-a2212c88165f', externalIdentifier: 'DailyMed SETID 701e1cd8-2868-4d29-85a9-a2212c88165f', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '701e1cd8-2868-4d29-85a9-a2212c88165f', routes: 'ORAL', dosageForms: 'TABLET; SOLUTION; ORALLY DISINTEGRATING TABLET', ...nonAuthorizing } },
  { id: 'SRC-RISPERDAL-CONSTA-JANSSEN-SETIDBB34', version: 1, sourceType: 'FDA_LABEL', title: 'RISPERDAL CONSTA risperidone long-acting intramuscular injection: direct DailyMed labeling', publisher: 'Janssen Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2025-11-05', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=bb34ee82-d2c2-43b8-ba21-2825c0954691', externalIdentifier: 'DailyMed SETID bb34ee82-d2c2-43b8-ba21-2825c0954691', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: 'bb34ee82-d2c2-43b8-ba21-2825c0954691', route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION KIT', releaseContext: 'EXTENDED_RELEASE', ...nonAuthorizing } },
  { id: 'SRC-PERSERIS-INDIVIOR-SETIDA4F2', version: 1, sourceType: 'FDA_LABEL', title: 'PERSERIS risperidone extended-release subcutaneous injectable suspension: direct DailyMed labeling', publisher: 'Indivior Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2025-01-28', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a4f21b1a-5691-4b14-a56d-651962d06f39', externalIdentifier: 'DailyMed SETID a4f21b1a-5691-4b14-a56d-651962d06f39', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: 'a4f21b1a-5691-4b14-a56d-651962d06f39', route: 'SUBCUTANEOUS', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', releaseContext: 'EXTENDED_RELEASE', ...nonAuthorizing } },
  { id: 'SRC-UZEDY-TEVA-SETID734E', version: 1, sourceType: 'FDA_LABEL', title: 'UZEDY risperidone extended-release subcutaneous injectable suspension: direct DailyMed labeling', publisher: 'Teva Pharmaceuticals USA, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2025-10-31', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=734eb776-4be0-4808-834b-0d8b0f9e021e', externalIdentifier: 'DailyMed SETID 734eb776-4be0-4808-834b-0d8b0f9e021e', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '734eb776-4be0-4808-834b-0d8b0f9e021e', route: 'SUBCUTANEOUS', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', releaseContext: 'EXTENDED_RELEASE', ...nonAuthorizing } },
];
const sourceByMedication: Record<MedicationId, string> = {
  'MED-risperidone-oral-tablet': 'SRC-RISPERIDONE-ORAL-JANSSEN-SETID701E',
  'MED-risperidone-oral-solution': 'SRC-RISPERIDONE-ORAL-JANSSEN-SETID701E',
  'MED-risperidone-orally-disintegrating-tablet': 'SRC-RISPERIDONE-ORAL-JANSSEN-SETID701E',
  'MED-risperdal-consta-risperidone-er-intramuscular-injection': 'SRC-RISPERDAL-CONSTA-JANSSEN-SETIDBB34',
  'MED-perseris-risperidone-er-subcutaneous-injection': 'SRC-PERSERIS-INDIVIOR-SETIDA4F2',
  'MED-uzedy-risperidone-er-subcutaneous-injection': 'SRC-UZEDY-TEVA-SETID734E',
};
export const periproceduralRisperidoneIdentityAtoms: EvidenceAtom[] = periproceduralRisperidoneIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct route/form/release identity and describes clinically material orthostatic, sedation/cognitive-motor, neuroleptic-malignant-syndrome, seizure, dysphagia, and interaction context requiring medication reconciliation.`,
  normalizedTopic: 'periprocedural-risperidone-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-atypical-antipsychotic'], contextTags: ['antipsychotic-review', 'hemodynamic-review', 'sedation-review', 'route-form-release-identity', 'long-acting-injectable-review'] },
  locator: { section: 'Dosage and Administration; Warnings and Precautions; Drug Interactions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, and labeled safety context only; it does not authenticate a patient-specific product, dose, schedule, last administration, indication, adherence, or current commercial availability.',
    'Oral tablet, oral solution, orally disintegrating tablet, RISPERDAL CONSTA intramuscular, PERSERIS subcutaneous, and UZEDY subcutaneous identities are not interchangeable; no substitution, route, formulation, release, or dose conversion is authorized.',
    'Indication, chronic-use pattern, last administration, psychiatric stability, prior relapse or withdrawal, orthostatic and fall risk, cardiac status, swallowing risk, organ function, interacting medicines, and anesthesia plan require accountable clinician, psychiatry, pharmacy, and local-policy review.',
    'No autonomous continuation, interruption, conversion, substitution, anesthesia plan, procedural timing, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' risperidone identity', summary: 'Direct DailyMed provenance supports this route/form/release identity and review-only safety context.', keywords: [product.genericName, product.routeContext, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antipsychotic', 'hemodynamic-review', 'sedation-review', 'long-acting-injectable-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));
export const periproceduralRisperidoneReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-RISPERIDONE-REVIEW-001', version: 1, name: 'Explicit risperidone route/form/release identity requires clinician, psychiatry, pharmacy, and anesthesia review',
  scope: { medicationIds: periproceduralRisperidoneIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralRisperidoneIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];
export const periproceduralRisperidoneIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralRisperidoneIdentitySources, atoms: periproceduralRisperidoneIdentityAtoms };
