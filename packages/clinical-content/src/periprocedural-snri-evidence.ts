import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T22:44:17Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-venlafaxine-immediate-release-oral-tablet'
  | 'MED-venlafaxine-extended-release-oral-capsule'
  | 'MED-desvenlafaxine-extended-release-oral-tablet'
  | 'MED-duloxetine-delayed-release-oral-capsule';

export interface PeriproceduralSnriIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: 'ING-venlafaxine' | 'ING-desvenlafaxine' | 'ING-duloxetine';
  genericName: string;
  routeContext: 'ORAL';
  dosageForm: 'TABLET' | 'CAPSULE';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'DELAYED_RELEASE';
  evidenceRef: { id: string; version: number };
}
export const periproceduralSnriIdentityDefinitions: PeriproceduralSnriIdentityDefinition[] = [
  { medicationId: 'MED-venlafaxine-immediate-release-oral-tablet', ingredientId: 'ING-venlafaxine', genericName: 'venlafaxine immediate-release oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-VENLAFAXINE-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-venlafaxine-extended-release-oral-capsule', ingredientId: 'ING-venlafaxine', genericName: 'venlafaxine extended-release oral capsule', routeContext: 'ORAL', dosageForm: 'CAPSULE', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-VENLAFAXINE-ER-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-desvenlafaxine-extended-release-oral-tablet', ingredientId: 'ING-desvenlafaxine', genericName: 'desvenlafaxine extended-release oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-DESVENLAFAXINE-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-duloxetine-delayed-release-oral-capsule', ingredientId: 'ING-duloxetine', genericName: 'duloxetine delayed-release oral capsule', routeContext: 'ORAL', dosageForm: 'CAPSULE', releaseContext: 'DELAYED_RELEASE', evidenceRef: { id: 'EVD-DULOXETINE-DR-CAPSULE-IDENTITY', version: 1 } },
];
const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
export const periproceduralSnriIdentitySources: SourceDocument[] = [
  { id: 'SRC-VENLAFAXINE-IR-YAOPHARMA-ANDA202036', version: 1, sourceType: 'FDA_LABEL', title: 'Venlafaxine hydrochloride immediate-release oral tablet: direct DailyMed labeling', publisher: 'Yaopharma Co., Ltd.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-07-07', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=38fd2c97-cd30-2f7d-e054-00144ff8d46c', externalIdentifier: 'DailyMed SETID 38fd2c97-cd30-2f7d-e054-00144ff8d46c; ANDA202036', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '38fd2c97-cd30-2f7d-e054-00144ff8d46c', applicationNumber: 'ANDA202036', route: 'ORAL', dosageForm: 'TABLET', releaseContext: 'IMMEDIATE_RELEASE', ...nonAuthorizing } },
  { id: 'SRC-VENLAFAXINE-ER-GRANULES-ANDA217390', version: 1, sourceType: 'FDA_LABEL', title: 'Venlafaxine hydrochloride extended-release oral capsule: direct DailyMed labeling', publisher: 'Granules Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-04-10', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=67059969-e291-4609-b130-0faacf2a19f0', externalIdentifier: 'DailyMed SETID 67059969-e291-4609-b130-0faacf2a19f0; ANDA217390', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '67059969-e291-4609-b130-0faacf2a19f0', applicationNumber: 'ANDA217390', route: 'ORAL', dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', ...nonAuthorizing } },
  { id: 'SRC-DESVENLAFAXINE-ER-LUPIN-ANDA204172', version: 1, sourceType: 'FDA_LABEL', title: 'Desvenlafaxine succinate extended-release oral tablet: direct DailyMed labeling', publisher: 'Lupin source label via Preferred Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-04-01', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=453a5759-2f0d-421d-be78-81ab97c8ce77', externalIdentifier: 'DailyMed SETID 453a5759-2f0d-421d-be78-81ab97c8ce77; ANDA204172', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '453a5759-2f0d-421d-be78-81ab97c8ce77', applicationNumber: 'ANDA204172', route: 'ORAL', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', repackagedLabel: true, ...nonAuthorizing } },
  { id: 'SRC-DULOXETINE-DR-LUPIN-ANDA090694', version: 1, sourceType: 'FDA_LABEL', title: 'Duloxetine delayed-release oral capsule: direct DailyMed labeling', publisher: 'Lupin source label via Bryant Ranch Prepack; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-08-03', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=79e1a9b1-e084-48b6-a252-97bbd2f55a79', externalIdentifier: 'DailyMed SETID 79e1a9b1-e084-48b6-a252-97bbd2f55a79; ANDA090694', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '79e1a9b1-e084-48b6-a252-97bbd2f55a79', applicationNumber: 'ANDA090694', route: 'ORAL', dosageForm: 'CAPSULE, DELAYED RELEASE', releaseContext: 'DELAYED_RELEASE', repackagedLabel: true, ...nonAuthorizing } },
];
const sourceByMedication: Record<MedicationId, string> = {
  'MED-venlafaxine-immediate-release-oral-tablet': 'SRC-VENLAFAXINE-IR-YAOPHARMA-ANDA202036',
  'MED-venlafaxine-extended-release-oral-capsule': 'SRC-VENLAFAXINE-ER-GRANULES-ANDA217390',
  'MED-desvenlafaxine-extended-release-oral-tablet': 'SRC-DESVENLAFAXINE-ER-LUPIN-ANDA204172',
  'MED-duloxetine-delayed-release-oral-capsule': 'SRC-DULOXETINE-DR-LUPIN-ANDA090694',
};
export const periproceduralSnriIdentityAtoms: EvidenceAtom[] = periproceduralSnriIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct oral route/form/release identity and describes discontinuation, serotonergic, blood-pressure, bleeding, and seizure-related safety context requiring medication reconciliation.`,
  normalizedTopic: 'periprocedural-snri-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-snri'], contextTags: ['withdrawal-sensitive', 'serotonergic-review', 'hemodynamic-review', 'bleeding-review', 'route-form-release-identity'] },
  locator: { section: 'Dosage and Administration; Warnings and Precautions; Drug Interactions; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, application provenance, and labeled safety context only; it does not authenticate a patient-specific product, strength, dose, schedule, duration, adherence, indication, or current commercial availability.',
    'Venlafaxine immediate-release tablet and extended-release capsule remain distinct identities; desvenlafaxine extended-release tablet and duloxetine delayed-release capsule are not interchangeable with venlafaxine or with one another. No equivalence, substitution, release, formulation, or dose conversion is authorized.',
    'Indication, chronic-use pattern, last dose, adherence, prior discontinuation symptoms or seizures, blood pressure and orthostatic/fall risk, renal and hepatic function, bleeding history, and concomitant serotonergic, adrenergic, antiplatelet, anticoagulant, CNS-active, or interacting medications require accountable clinician and anesthesia review.',
    'No autonomous continuation, interruption, taper, dose change, conversion, substitution, anesthesia plan, procedural timing, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' SNRI identity', summary: 'Direct DailyMed provenance supports this route/form/release identity and review-only safety context.', keywords: [product.genericName, product.routeContext, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'snri', 'withdrawal-review', 'serotonergic-review', 'hemodynamic-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));
export const periproceduralSnriReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-SNRI-REVIEW-001', version: 1, name: 'Explicit SNRI route/form/release identity requires clinician and anesthesia review',
  scope: { medicationIds: periproceduralSnriIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralSnriIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];
export const periproceduralSnriIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralSnriIdentitySources, atoms: periproceduralSnriIdentityAtoms };
