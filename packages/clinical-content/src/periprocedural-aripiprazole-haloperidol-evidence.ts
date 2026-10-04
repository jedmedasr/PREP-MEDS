import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-04T05:05:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-abilify-aripiprazole-oral-tablet'
  | 'MED-aripiprazole-orally-disintegrating-tablet'
  | 'MED-abilify-maintena-aripiprazole-er-im-injection'
  | 'MED-abilify-asimtufii-aripiprazole-er-im-injection'
  | 'MED-aristada-aripiprazole-lauroxil-er-im-injection'
  | 'MED-aristada-initio-aripiprazole-lauroxil-er-im-injection'
  | 'MED-haloperidol-oral-tablet'
  | 'MED-haloperidol-oral-solution'
  | 'MED-haloperidol-lactate-immediate-release-im-injection'
  | 'MED-haloperidol-decanoate-er-im-injection';
type IngredientId = 'ING-aripiprazole' | 'ING-aripiprazole-lauroxil' | 'ING-haloperidol' | 'ING-haloperidol-lactate' | 'ING-haloperidol-decanoate';

export interface PeriproceduralAripiprazoleHaloperidolIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  routeContext: 'ORAL' | 'INTRAMUSCULAR';
  dosageForm: 'TABLET' | 'ORALLY_DISINTEGRATING_TABLET' | 'SOLUTION' | 'IMMEDIATE_RELEASE_INJECTION_SOLUTION' | 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION' | 'DECANOATE_INJECTION_SOLUTION';
  releaseContext: 'NOT_APPLICABLE' | 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  evidenceRef: { id: string; version: number };
}
export const periproceduralAripiprazoleHaloperidolIdentityDefinitions: PeriproceduralAripiprazoleHaloperidolIdentityDefinition[] = [
  { medicationId: 'MED-abilify-aripiprazole-oral-tablet', ingredientId: 'ING-aripiprazole', genericName: 'ABILIFY aripiprazole oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-ABILIFY-ARIPIPRAZOLE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-aripiprazole-orally-disintegrating-tablet', ingredientId: 'ING-aripiprazole', genericName: 'aripiprazole orally disintegrating tablet', routeContext: 'ORAL', dosageForm: 'ORALLY_DISINTEGRATING_TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-ARIPIPRAZOLE-ODT-IDENTITY', version: 1 } },
  { medicationId: 'MED-abilify-maintena-aripiprazole-er-im-injection', ingredientId: 'ING-aripiprazole', genericName: 'ABILIFY MAINTENA aripiprazole extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ABILIFY-MAINTENA-ARIPIPRAZOLE-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-abilify-asimtufii-aripiprazole-er-im-injection', ingredientId: 'ING-aripiprazole', genericName: 'ABILIFY ASIMTUFII aripiprazole extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ABILIFY-ASIMTUFII-ARIPIPRAZOLE-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-aristada-aripiprazole-lauroxil-er-im-injection', ingredientId: 'ING-aripiprazole-lauroxil', genericName: 'ARISTADA aripiprazole lauroxil extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ARISTADA-ARIPIPRAZOLE-LAUROXIL-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-aristada-initio-aripiprazole-lauroxil-er-im-injection', ingredientId: 'ING-aripiprazole-lauroxil', genericName: 'ARISTADA INITIO aripiprazole lauroxil extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ARISTADA-INITIO-ARIPIPRAZOLE-LAUROXIL-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-haloperidol-oral-tablet', ingredientId: 'ING-haloperidol', genericName: 'haloperidol oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-HALOPERIDOL-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-haloperidol-oral-solution', ingredientId: 'ING-haloperidol', genericName: 'haloperidol oral solution concentrate', routeContext: 'ORAL', dosageForm: 'SOLUTION', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-HALOPERIDOL-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-haloperidol-lactate-immediate-release-im-injection', ingredientId: 'ING-haloperidol-lactate', genericName: 'haloperidol lactate immediate-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'IMMEDIATE_RELEASE_INJECTION_SOLUTION', releaseContext: 'IMMEDIATE_RELEASE', evidenceRef: { id: 'EVD-HALOPERIDOL-LACTATE-IMMEDIATE-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-haloperidol-decanoate-er-im-injection', ingredientId: 'ING-haloperidol-decanoate', genericName: 'haloperidol decanoate long-acting intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'DECANOATE_INJECTION_SOLUTION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-HALOPERIDOL-DECANOATE-IM-IDENTITY', version: 1 } },
];
const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, saltConversionAuthorized: false, prodrugConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
const source = (id: string, title: string, publisher: string, effectiveDate: string, setId: string, metadata: Record<string, string | number | boolean>): SourceDocument => ({
  id, version: 1, sourceType: 'FDA_LABEL', title, publisher: publisher + '; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate,
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId, externalIdentifier: 'DailyMed SETID ' + setId,
  jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId, ...metadata, ...nonAuthorizing },
});
export const periproceduralAripiprazoleHaloperidolIdentitySources: SourceDocument[] = [
  source('SRC-ABILIFY-OTSUKA-SETIDC040', 'ABILIFY aripiprazole oral tablets: direct DailyMed labeling', 'Otsuka America Pharmaceutical, Inc.', '2025-01-29', 'c040bd1d-45b7-49f2-93ea-aed7220b30ac', { route: 'ORAL', dosageForm: 'TABLET' }),
  source('SRC-ARIPIPRAZOLE-ODT-AUROBINDO-SETID476B', 'Aripiprazole orally disintegrating tablets: direct DailyMed labeling', 'Aurobindo Pharma Limited', '2026-07-15', '476b92f3-cf7b-4c09-ac67-6ed35e6811d5', { route: 'ORAL', dosageForm: 'ORALLY DISINTEGRATING TABLET' }),
  source('SRC-ABILIFY-MAINTENA-OTSUKA-SETIDEE49', 'ABILIFY MAINTENA aripiprazole extended-release intramuscular kit: direct DailyMed labeling', 'Otsuka America Pharmaceutical, Inc.', '2026-03-24', 'ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6', { route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', releaseContext: 'EXTENDED_RELEASE' }),
  source('SRC-ABILIFY-ASIMTUFII-OTSUKA-SETIDDA4C', 'ABILIFY ASIMTUFII aripiprazole extended-release intramuscular injection: direct DailyMed labeling', 'Otsuka America Pharmaceutical, Inc.', '2025-04-04', 'da4c07fd-1130-4341-bb44-63acfa4162be', { route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', releaseContext: 'EXTENDED_RELEASE' }),
  source('SRC-ARISTADA-ALKERMES-SETID17A8', 'ARISTADA aripiprazole lauroxil extended-release intramuscular injection: direct DailyMed labeling', 'Alkermes, Inc.', '2025-01-28', '17a8d11b-73b0-4833-a0b4-cf1ef85edefb', { route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', chemicalForm: 'ARIPIPRAZOLE LAUROXIL', releaseContext: 'EXTENDED_RELEASE' }),
  source('SRC-ARISTADA-INITIO-ALKERMES-SETIDB18F', 'ARISTADA INITIO aripiprazole lauroxil extended-release intramuscular injection: direct DailyMed labeling', 'Alkermes, Inc.', '2025-01-28', 'b18fdfd9-31cd-4a2f-9f1c-ebc70d7a9403', { route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION', chemicalForm: 'ARIPIPRAZOLE LAUROXIL', releaseContext: 'EXTENDED_RELEASE', initiationProductIdentity: true }),
  source('SRC-HALOPERIDOL-TABLET-METHOD-SETID87F8', 'Haloperidol oral tablets: direct DailyMed labeling', 'Method Pharmaceuticals, LLC', '2025-06-29', '87f8773b-bf89-4f7e-bff4-8cad117d5776', { route: 'ORAL', dosageForm: 'TABLET' }),
  source('SRC-HALOPERIDOL-SOLUTION-PAI-SETIDB488', 'Haloperidol oral solution concentrate: direct DailyMed labeling', 'PAI Holdings, LLC dba PAI Pharma', '2025-01-22', 'b488c106-f1ee-4b7b-8516-01162fb929f7', { route: 'ORAL', dosageForm: 'SOLUTION' }),
  source('SRC-HALOPERIDOL-LACTATE-FRESENIUS-SETIDB1AD', 'Haloperidol lactate immediate-release intramuscular injection: direct DailyMed labeling', 'Fresenius Kabi USA, LLC', '2022-01-25', 'b1ad2abd-a9d6-44e3-957b-36a73260f4f5', { route: 'INTRAMUSCULAR', dosageForm: 'INJECTION SOLUTION', chemicalForm: 'HALOPERIDOL LACTATE', releaseContext: 'IMMEDIATE_RELEASE' }),
  source('SRC-HALOPERIDOL-DECANOATE-NORTHSTAR-SETIDB83C', 'Haloperidol decanoate long-acting intramuscular injection: direct DailyMed labeling', 'NorthStar RxLLC', '2026-06-15', 'b83cb022-cfeb-4492-927b-0b461f7201d4', { route: 'INTRAMUSCULAR', dosageForm: 'DECANOATE INJECTION', chemicalForm: 'HALOPERIDOL DECANOATE', releaseContext: 'EXTENDED_RELEASE' }),
];
const sourceByMedication: Record<MedicationId, string> = Object.fromEntries(periproceduralAripiprazoleHaloperidolIdentityDefinitions.map((d, i) => [d.medicationId, periproceduralAripiprazoleHaloperidolIdentitySources[i]!.id])) as Record<MedicationId, string>;
export const periproceduralAripiprazoleHaloperidolIdentityAtoms: EvidenceAtom[] = periproceduralAripiprazoleHaloperidolIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct ingredient/chemical-form/route/form/release or whole-product identity and describes clinically material orthostatic/hemodynamic, QT/arrhythmia where labeled, sedation/cognitive-motor, seizure, dysphagia, withdrawal/relapse, and interacting-medication context requiring reconciliation.`,
  normalizedTopic: 'periprocedural-aripiprazole-haloperidol-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: [product.ingredientId.startsWith('ING-aripiprazole') ? 'CLS-atypical-antipsychotic' : 'CLS-typical-antipsychotic'], contextTags: ['antipsychotic-review', 'hemodynamic-review', 'sedation-review', 'route-form-release-identity', 'long-acting-injectable-review'] },
  locator: { section: 'Dosage Forms and Strengths; Warnings and Precautions; Drug Interactions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient or chemical form, route, dosage form, release context, whole-product identity, and labeled safety context only; it does not authenticate a patient-specific product, dose, schedule, last administration, indication, adherence, or current commercial availability.',
    'Aripiprazole tablet, orally disintegrating tablet, ABILIFY MAINTENA, ABILIFY ASIMTUFII, ARISTADA, and ARISTADA INITIO are not interchangeable. ARISTADA INITIO is a distinct initiation product; no initiation, substitution, route, formulation, release, prodrug, or dose conversion is authorized.',
    'Haloperidol tablet, oral solution, immediate-release lactate intramuscular injection, and decanoate long-acting intramuscular injection are not interchangeable; no salt, ester, route, formulation, release, or dose conversion is authorized.',
    'Indication, psychiatric stability, last administration, relapse or withdrawal risk, hemodynamic, cardiac/QT, seizure, swallowing, sedation/cognitive-motor, extrapyramidal/NMS, interacting-medication, and anesthesia context require accountable clinician, psychiatry, pharmacy, and local-policy review.',
    'No autonomous continuation, interruption, conversion, substitution, initiation, administration, monitoring, anesthesia plan, procedural timing, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' identity', summary: 'Direct DailyMed provenance supports this identity and review-only safety context.', keywords: [product.genericName, product.routeContext, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antipsychotic', 'hemodynamic-review', 'sedation-review', 'long-acting-injectable-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));
export const periproceduralAripiprazoleHaloperidolReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-ARIPIPRAZOLE-HALOPERIDOL-REVIEW-001', version: 1, name: 'Explicit aripiprazole or haloperidol ingredient/route/form/release identity requires clinician, psychiatry, pharmacy, and anesthesia review',
  scope: { medicationIds: periproceduralAripiprazoleHaloperidolIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralAripiprazoleHaloperidolIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];
export const periproceduralAripiprazoleHaloperidolIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralAripiprazoleHaloperidolIdentitySources, atoms: periproceduralAripiprazoleHaloperidolIdentityAtoms };
