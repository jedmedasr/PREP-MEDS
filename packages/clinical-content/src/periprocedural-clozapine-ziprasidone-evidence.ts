import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-04T06:20:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-clozapine-oral-tablet'
  | 'MED-clozapine-orally-disintegrating-tablet'
  | 'MED-versacloz-clozapine-oral-suspension'
  | 'MED-geodon-ziprasidone-hydrochloride-oral-capsule'
  | 'MED-geodon-ziprasidone-mesylate-intramuscular-injection';
type IngredientId = 'ING-clozapine' | 'ING-ziprasidone-hydrochloride' | 'ING-ziprasidone-mesylate';

export interface PeriproceduralClozapineZiprasidoneIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  routeContext: 'ORAL' | 'INTRAMUSCULAR';
  dosageForm: 'TABLET' | 'ORALLY_DISINTEGRATING_TABLET' | 'SUSPENSION' | 'CAPSULE' | 'POWDER_FOR_INJECTION_SOLUTION';
  evidenceRef: { id: string; version: number };
}

export const periproceduralClozapineZiprasidoneIdentityDefinitions: PeriproceduralClozapineZiprasidoneIdentityDefinition[] = [
  { medicationId: 'MED-clozapine-oral-tablet', ingredientId: 'ING-clozapine', genericName: 'clozapine conventional oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', evidenceRef: { id: 'EVD-CLOZAPINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-clozapine-orally-disintegrating-tablet', ingredientId: 'ING-clozapine', genericName: 'clozapine orally disintegrating tablet', routeContext: 'ORAL', dosageForm: 'ORALLY_DISINTEGRATING_TABLET', evidenceRef: { id: 'EVD-CLOZAPINE-ODT-IDENTITY', version: 1 } },
  { medicationId: 'MED-versacloz-clozapine-oral-suspension', ingredientId: 'ING-clozapine', genericName: 'VERSACLOZ clozapine oral suspension', routeContext: 'ORAL', dosageForm: 'SUSPENSION', evidenceRef: { id: 'EVD-VERSACLOZ-CLOZAPINE-ORAL-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-geodon-ziprasidone-hydrochloride-oral-capsule', ingredientId: 'ING-ziprasidone-hydrochloride', genericName: 'GEODON ziprasidone hydrochloride oral capsule', routeContext: 'ORAL', dosageForm: 'CAPSULE', evidenceRef: { id: 'EVD-GEODON-ZIPRASIDONE-HYDROCHLORIDE-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-geodon-ziprasidone-mesylate-intramuscular-injection', ingredientId: 'ING-ziprasidone-mesylate', genericName: 'GEODON ziprasidone mesylate intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'POWDER_FOR_INJECTION_SOLUTION', evidenceRef: { id: 'EVD-GEODON-ZIPRASIDONE-MESYLATE-IM-INJECTION-IDENTITY', version: 1 } },
];

const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, saltConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
const source = (id: string, title: string, publisher: string, effectiveDate: string, setId: string, metadata: Record<string, string | number | boolean>): SourceDocument => ({
  id, version: 1, sourceType: 'FDA_LABEL', title, publisher: publisher + '; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate,
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId, externalIdentifier: 'DailyMed SETID ' + setId,
  jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId, ...metadata, ...nonAuthorizing },
});

export const periproceduralClozapineZiprasidoneIdentitySources: SourceDocument[] = [
  source('SRC-CLOZAPINE-TABLET-CARDINAL-SETID7C74', 'Clozapine conventional oral tablet: direct DailyMed labeling', 'Cardinal Health 107, LLC', '2026-04-21', '7c748f8a-73ce-4bd3-aa30-9c66657f06ec', { route: 'ORAL', dosageForm: 'TABLET' }),
  source('SRC-CLOZAPINE-ODT-TEVA-SETID6FCC', 'Clozapine orally disintegrating tablet: direct DailyMed labeling', 'Teva Pharmaceuticals USA, Inc.', '2025-06-24', '6fccf4f7-2e30-4272-9800-225aaef20584', { route: 'ORAL', dosageForm: 'ORALLY DISINTEGRATING TABLET' }),
  source('SRC-VERSACLOZ-TRUPHARMA-SETID2592', 'VERSACLOZ clozapine oral suspension: direct DailyMed labeling', 'TruPharma LLC', '2026-09-06', '2592c9a8-fd74-4e0d-a895-b07b014cf355', { route: 'ORAL', dosageForm: 'SUSPENSION', wholeProductIdentity: true }),
  source('SRC-GEODON-ROERIG-SETID8326-ORAL', 'GEODON ziprasidone hydrochloride oral capsule: direct DailyMed labeling', 'Roerig', '2025-01-13', '8326928a-2cb6-4f7f-9712-03a425a14c37', { route: 'ORAL', dosageForm: 'CAPSULE', chemicalForm: 'ZIPRASIDONE HYDROCHLORIDE' }),
  source('SRC-GEODON-ROERIG-SETID8326-IM', 'GEODON ziprasidone mesylate intramuscular injection: direct DailyMed labeling', 'Roerig', '2025-01-13', '8326928a-2cb6-4f7f-9712-03a425a14c37', { route: 'INTRAMUSCULAR', dosageForm: 'POWDER FOR INJECTION SOLUTION', chemicalForm: 'ZIPRASIDONE MESYLATE', acuteIntramuscularIdentity: true }),
];

const sourceByMedication: Record<MedicationId, string> = Object.fromEntries(periproceduralClozapineZiprasidoneIdentityDefinitions.map((definition, index) => [definition.medicationId, periproceduralClozapineZiprasidoneIdentitySources[index]!.id])) as Record<MedicationId, string>;
export const periproceduralClozapineZiprasidoneIdentityAtoms: EvidenceAtom[] = periproceduralClozapineZiprasidoneIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct ingredient/chemical-form/route/form or whole-product identity and describes clinically material cardiac, hemodynamic, sedation, swallowing/aspiration, gastrointestinal, seizure, withdrawal/relapse, electrolyte, serotonergic, and interacting-medication context where applicable.`,
  normalizedTopic: 'periprocedural-clozapine-ziprasidone-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-atypical-antipsychotic'], contextTags: ['antipsychotic-review', 'hemodynamic-review', 'sedation-review', 'route-form-identity', 'qt-review'] },
  locator: { section: 'Dosage Forms and Strengths; Dosage and Administration; Warnings and Precautions; Adverse Reactions; Drug Interactions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient or chemical form, route, dosage form, whole-product identity, and labeled safety context only; it does not authenticate a patient-specific product, dose, schedule, last administration, indication, adherence, monitoring state, or current commercial availability.',
    'Clozapine conventional tablet, orally disintegrating tablet, and VERSACLOZ suspension are distinct formulations and are not inferred to be interchangeable. Psychiatric stability, interruption or missed-dose history, orthostatic/hemodynamic status, myocarditis/cardiomyopathy, seizure, severe neutropenia, gastrointestinal hypomotility, sedation, hypersalivation/swallowing or aspiration risk, and interacting medicines require accountable clinician, psychiatry, pharmacy, anesthesia, and local-policy review.',
    'GEODON oral ziprasidone hydrochloride capsules and acute intramuscular ziprasidone mesylate injection are distinct chemical-form/route identities and are not inferred to be interchangeable. QT/cardiac history, potassium and magnesium status, interacting QT-prolonging or serotonergic medicines, hemodynamic status, CNS-depressant burden, and anesthesia context require review.',
    'No autonomous initiation, continuation, interruption, taper, restart, monitoring, substitution, salt, route, formulation, or dose conversion, administration plan, anesthesia plan, or procedural timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' identity', summary: 'Direct DailyMed provenance supports this identity and review-only safety context.', keywords: [product.genericName, product.routeContext, product.dosageForm], concepts: ['medication-identity', 'antipsychotic', 'hemodynamic-review', 'sedation-review', 'qt-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralClozapineZiprasidoneReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-CLOZAPINE-ZIPRASIDONE-REVIEW-001', version: 1, name: 'Explicit clozapine or ziprasidone chemical-form/route/form identity requires clinician, psychiatry, pharmacy, and anesthesia review',
  scope: { medicationIds: periproceduralClozapineZiprasidoneIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralClozapineZiprasidoneIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const periproceduralClozapineZiprasidoneIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralClozapineZiprasidoneIdentitySources, atoms: periproceduralClozapineZiprasidoneIdentityAtoms };
