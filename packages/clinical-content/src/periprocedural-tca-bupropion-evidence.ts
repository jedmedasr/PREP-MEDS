import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-07T04:20:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-amitriptyline-hydrochloride-oral-tablet'
  | 'MED-nortriptyline-hydrochloride-oral-capsule'
  | 'MED-imipramine-hydrochloride-oral-tablet'
  | 'MED-clomipramine-hydrochloride-oral-capsule'
  | 'MED-bupropion-hydrochloride-immediate-release-oral-tablet'
  | 'MED-wellbutrin-sr-bupropion-hydrochloride-sustained-release-oral-tablet'
  | 'MED-bupropion-hydrochloride-xl-extended-release-oral-tablet';
type IngredientId = 'ING-amitriptyline-hydrochloride' | 'ING-nortriptyline-hydrochloride' | 'ING-imipramine-hydrochloride' | 'ING-clomipramine-hydrochloride' | 'ING-bupropion-hydrochloride';

export interface PeriproceduralTcaBupropionIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: 'TABLET' | 'CAPSULE' | 'SUSTAINED_RELEASE_TABLET' | 'EXTENDED_RELEASE_TABLET';
  drugClassId: 'CLS-tricyclic-antidepressant' | 'CLS-aminoketone-antidepressant';
  evidenceRef: { id: string; version: number };
}

export const periproceduralTcaBupropionIdentityDefinitions: PeriproceduralTcaBupropionIdentityDefinition[] = [
  { medicationId: 'MED-amitriptyline-hydrochloride-oral-tablet', ingredientId: 'ING-amitriptyline-hydrochloride', genericName: 'amitriptyline hydrochloride oral tablet', dosageForm: 'TABLET', drugClassId: 'CLS-tricyclic-antidepressant', evidenceRef: { id: 'EVD-AMITRIPTYLINE-HYDROCHLORIDE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-nortriptyline-hydrochloride-oral-capsule', ingredientId: 'ING-nortriptyline-hydrochloride', genericName: 'nortriptyline hydrochloride oral capsule', dosageForm: 'CAPSULE', drugClassId: 'CLS-tricyclic-antidepressant', evidenceRef: { id: 'EVD-NORTRIPTYLINE-HYDROCHLORIDE-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-imipramine-hydrochloride-oral-tablet', ingredientId: 'ING-imipramine-hydrochloride', genericName: 'imipramine hydrochloride oral tablet', dosageForm: 'TABLET', drugClassId: 'CLS-tricyclic-antidepressant', evidenceRef: { id: 'EVD-IMIPRAMINE-HYDROCHLORIDE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-clomipramine-hydrochloride-oral-capsule', ingredientId: 'ING-clomipramine-hydrochloride', genericName: 'clomipramine hydrochloride oral capsule', dosageForm: 'CAPSULE', drugClassId: 'CLS-tricyclic-antidepressant', evidenceRef: { id: 'EVD-CLOMIPRAMINE-HYDROCHLORIDE-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-bupropion-hydrochloride-immediate-release-oral-tablet', ingredientId: 'ING-bupropion-hydrochloride', genericName: 'bupropion hydrochloride immediate-release oral tablet', dosageForm: 'TABLET', drugClassId: 'CLS-aminoketone-antidepressant', evidenceRef: { id: 'EVD-BUPROPION-HYDROCHLORIDE-IR-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-wellbutrin-sr-bupropion-hydrochloride-sustained-release-oral-tablet', ingredientId: 'ING-bupropion-hydrochloride', genericName: 'WELLBUTRIN SR bupropion hydrochloride sustained-release oral tablet', dosageForm: 'SUSTAINED_RELEASE_TABLET', drugClassId: 'CLS-aminoketone-antidepressant', evidenceRef: { id: 'EVD-WELLBUTRIN-SR-BUPROPION-HYDROCHLORIDE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-bupropion-hydrochloride-xl-extended-release-oral-tablet', ingredientId: 'ING-bupropion-hydrochloride', genericName: 'bupropion hydrochloride XL extended-release oral tablet', dosageForm: 'EXTENDED_RELEASE_TABLET', drugClassId: 'CLS-aminoketone-antidepressant', evidenceRef: { id: 'EVD-BUPROPION-HYDROCHLORIDE-XL-ORAL-TABLET-IDENTITY', version: 1 } },
];

const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, saltConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
const source = (id: string, title: string, publisher: string, effectiveDate: string, setId: string, metadata: Record<string, string | number | boolean>): SourceDocument => ({
  id, version: 1, sourceType: 'FDA_LABEL', title, publisher: publisher + '; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate,
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId, externalIdentifier: 'DailyMed SETID ' + setId,
  jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId, route: 'ORAL', ...metadata, ...nonAuthorizing },
});

export const periproceduralTcaBupropionIdentitySources: SourceDocument[] = [
  source('SRC-AMITRIPTYLINE-BRYANT-SETID1636', 'Amitriptyline hydrochloride oral tablet: direct DailyMed labeling', 'Bryant Ranch Prepack', '2026-06-29', '16364b31-4b8b-481a-a553-e8974c0e557c', { dosageForm: 'TABLET' }),
  source('SRC-NORTRIPTYLINE-ZYDUS-SETIDDBE8', 'Nortriptyline hydrochloride oral capsule: direct DailyMed labeling', 'Zydus Pharmaceuticals (USA) Inc.', '2024-03-27', 'dbe85bdc-17a1-4201-bf48-a52e35d69b68', { dosageForm: 'CAPSULE' }),
  source('SRC-IMIPRAMINE-OXFORD-SETIDA5F6', 'Imipramine hydrochloride oral tablet: direct DailyMed labeling', 'Oxford Pharmaceuticals, LLC', '2026-02-17', 'a5f60cf1-6f14-40a3-a794-9d69b28088d8', { dosageForm: 'TABLET' }),
  source('SRC-CLOMIPRAMINE-LEADING-SETIDFA0D', 'Clomipramine hydrochloride oral capsule: direct DailyMed labeling', 'Leading Pharma, LLC', '2025-12-26', 'fa0d4de8-c96e-429d-a65c-928afbf46863', { dosageForm: 'CAPSULE' }),
  source('SRC-BUPROPION-IR-AHP-SETID88C9', 'Bupropion hydrochloride immediate-release oral tablet: direct DailyMed labeling', 'American Health Packaging', '2026-04-01', '88c980c8-aaa8-4378-9ac2-24d588640caa', { dosageForm: 'TABLET', release: 'IMMEDIATE_RELEASE' }),
  source('SRC-WELLBUTRIN-SR-GSK-SETIDCBC8', 'WELLBUTRIN SR bupropion hydrochloride sustained-release oral tablet: direct DailyMed labeling', 'GlaxoSmithKline LLC', '2025-11-05', 'cbc8c074-f080-4489-a5ae-207b5fadeba3', { dosageForm: 'TABLET, FILM COATED', release: 'SUSTAINED_RELEASE', wholeProductIdentity: true }),
  source('SRC-BUPROPION-XL-LUPIN-SETID1AF1', 'Bupropion hydrochloride XL extended-release oral tablet: direct DailyMed labeling', 'Lupin Pharmaceuticals, Inc.', '2025-11-25', '1af14d2e-c64d-44b7-a402-8869e8e30661', { dosageForm: 'TABLET, EXTENDED RELEASE', release: 'XL_EXTENDED_RELEASE' }),
];

const sourceByMedication: Record<MedicationId, string> = Object.fromEntries(periproceduralTcaBupropionIdentityDefinitions.map((definition, index) => [definition.medicationId, periproceduralTcaBupropionIdentitySources[index]!.id])) as Record<MedicationId, string>;
export const periproceduralTcaBupropionIdentityAtoms: EvidenceAtom[] = periproceduralTcaBupropionIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct oral ingredient/form/release or whole-product identity and describes clinically material cardiac, hemodynamic, anticholinergic, CNS, seizure, psychiatric, and interacting-medication context where applicable.`,
  normalizedTopic: 'periprocedural-tca-bupropion-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: [product.drugClassId], contextTags: ['antidepressant-review', 'hemodynamic-review', 'cardiac-review', 'seizure-review', 'release-form-identity'] },
  locator: { section: 'Dosage Forms and Strengths; Contraindications; Warnings and Precautions; Adverse Reactions; Drug Interactions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient, oral form, release, whole-product identity, and labeled safety context only; it does not authenticate a patient-specific product, dose, schedule, last administration, indication, adherence, or current commercial availability.',
    'TCA cardiac conduction, arrhythmia, orthostatic or other hemodynamic, anticholinergic, CNS/sedation, seizure, psychiatric, and interacting-medication context requires accountable clinician, psychiatry, pharmacy, anesthesia, and local-policy review.',
    'Bupropion immediate-release, SR, and XL identities are not inferred to be interchangeable. Seizure risk factors, blood pressure/hemodynamic context, psychiatric stability, interacting medicines, and release-specific administration constraints require review.',
    'No autonomous initiation, continuation, interruption, taper, restart, substitution, release/formulation conversion, dose conversion, administration plan, anesthesia plan, or procedural timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' identity', summary: 'Direct DailyMed provenance supports this identity and review-only safety context.', keywords: [product.genericName, product.dosageForm], concepts: ['medication-identity', 'antidepressant', 'hemodynamic-review', 'seizure-review', 'release-form-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralTcaBupropionReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-TCA-BUPROPION-REVIEW-001', version: 1, name: 'Explicit TCA or bupropion release/form identity requires clinician, psychiatry, pharmacy, and anesthesia review',
  scope: { medicationIds: periproceduralTcaBupropionIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralTcaBupropionIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const periproceduralTcaBupropionIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralTcaBupropionIdentitySources, atoms: periproceduralTcaBupropionIdentityAtoms };
