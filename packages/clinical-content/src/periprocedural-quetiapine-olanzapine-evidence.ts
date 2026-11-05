import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-04T04:03:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-quetiapine-conventional-oral-tablet'
  | 'MED-seroquel-xr-quetiapine-extended-release-oral-tablet'
  | 'MED-zyprexa-olanzapine-oral-tablet'
  | 'MED-zyprexa-zydis-olanzapine-orally-disintegrating-tablet'
  | 'MED-zyprexa-olanzapine-intramuscular-injection'
  | 'MED-zyprexa-relprevv-olanzapine-er-intramuscular-injection';

export interface PeriproceduralQuetiapineOlanzapineIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: 'ING-quetiapine' | 'ING-olanzapine';
  genericName: string;
  routeContext: 'ORAL' | 'INTRAMUSCULAR';
  dosageForm: 'TABLET' | 'EXTENDED_RELEASE_TABLET' | 'ORALLY_DISINTEGRATING_TABLET' | 'POWDER_FOR_SOLUTION' | 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION';
  releaseContext: 'NOT_APPLICABLE' | 'EXTENDED_RELEASE';
  evidenceRef: { id: string; version: number };
}
export const periproceduralQuetiapineOlanzapineIdentityDefinitions: PeriproceduralQuetiapineOlanzapineIdentityDefinition[] = [
  { medicationId: 'MED-quetiapine-conventional-oral-tablet', ingredientId: 'ING-quetiapine', genericName: 'quetiapine conventional oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-QUETIAPINE-CONVENTIONAL-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-seroquel-xr-quetiapine-extended-release-oral-tablet', ingredientId: 'ING-quetiapine', genericName: 'SEROQUEL XR quetiapine extended-release oral tablet', routeContext: 'ORAL', dosageForm: 'EXTENDED_RELEASE_TABLET', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-SEROQUEL-XR-QUETIAPINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-zyprexa-olanzapine-oral-tablet', ingredientId: 'ING-olanzapine', genericName: 'ZYPREXA olanzapine oral tablet', routeContext: 'ORAL', dosageForm: 'TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-ZYPREXA-OLANZAPINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-zyprexa-zydis-olanzapine-orally-disintegrating-tablet', ingredientId: 'ING-olanzapine', genericName: 'ZYPREXA ZYDIS olanzapine orally disintegrating tablet', routeContext: 'ORAL', dosageForm: 'ORALLY_DISINTEGRATING_TABLET', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-ZYPREXA-ZYDIS-OLANZAPINE-ODT-IDENTITY', version: 1 } },
  { medicationId: 'MED-zyprexa-olanzapine-intramuscular-injection', ingredientId: 'ING-olanzapine', genericName: 'ZYPREXA INTRAMUSCULAR olanzapine injection powder for solution', routeContext: 'INTRAMUSCULAR', dosageForm: 'POWDER_FOR_SOLUTION', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-ZYPREXA-OLANZAPINE-IM-IDENTITY', version: 1 } },
  { medicationId: 'MED-zyprexa-relprevv-olanzapine-er-intramuscular-injection', ingredientId: 'ING-olanzapine', genericName: 'ZYPREXA RELPREVV olanzapine extended-release intramuscular injection', routeContext: 'INTRAMUSCULAR', dosageForm: 'EXTENDED_RELEASE_INJECTABLE_SUSPENSION', releaseContext: 'EXTENDED_RELEASE', evidenceRef: { id: 'EVD-ZYPREXA-RELPREVV-OLANZAPINE-IM-IDENTITY', version: 1 } },
];
const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, formulationConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
export const periproceduralQuetiapineOlanzapineIdentitySources: SourceDocument[] = [
  { id: 'SRC-QUETIAPINE-SUN-SETIDFFE5', version: 1, sourceType: 'FDA_LABEL', title: 'Quetiapine fumarate conventional oral tablets: direct DailyMed labeling', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-06-03', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ffe52b98-9872-48c1-90fd-8fcd37c3432f', externalIdentifier: 'DailyMed SETID ffe52b98-9872-48c1-90fd-8fcd37c3432f', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: 'ffe52b98-9872-48c1-90fd-8fcd37c3432f', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', releaseContext: 'NOT_APPLICABLE', ...nonAuthorizing } },
  { id: 'SRC-SEROQUEL-XR-ASTRAZENECA-SETID473A', version: 1, sourceType: 'FDA_LABEL', title: 'SEROQUEL XR quetiapine extended-release oral tablets: direct DailyMed labeling', publisher: 'AstraZeneca Pharmaceuticals LP; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2025-01-22', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=473a3ac4-67f4-4782-baa9-7f9bdd8761f4', externalIdentifier: 'DailyMed SETID 473a3ac4-67f4-4782-baa9-7f9bdd8761f4', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '473a3ac4-67f4-4782-baa9-7f9bdd8761f4', route: 'ORAL', dosageForm: 'TABLET, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', ...nonAuthorizing } },
  { id: 'SRC-ZYPREXA-H2PHARMA-SETIDB418', version: 1, sourceType: 'FDA_LABEL', title: 'ZYPREXA, ZYPREXA ZYDIS, and ZYPREXA INTRAMUSCULAR olanzapine products: direct DailyMed labeling', publisher: 'H2-Pharma LLC; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-02-11', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b418946a-1ab4-4d89-a012-d94fc361a3c4', externalIdentifier: 'DailyMed SETID b418946a-1ab4-4d89-a012-d94fc361a3c4', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: 'b418946a-1ab4-4d89-a012-d94fc361a3c4', routes: 'ORAL; INTRAMUSCULAR', dosageForms: 'TABLET; ORALLY DISINTEGRATING TABLET; INJECTION POWDER FOR SOLUTION', ...nonAuthorizing } },
  { id: 'SRC-ZYPREXA-RELPREVV-H2PHARMA-SETID1154', version: 1, sourceType: 'FDA_LABEL', title: 'ZYPREXA RELPREVV olanzapine extended-release intramuscular kit: direct DailyMed labeling', publisher: 'H2-Pharma LLC; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-05-19', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=11544cba-64a9-49cb-8d74-da228053b252', externalIdentifier: 'DailyMed SETID 11544cba-64a9-49cb-8d74-da228053b252', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId: '11544cba-64a9-49cb-8d74-da228053b252', route: 'INTRAMUSCULAR', dosageForm: 'EXTENDED-RELEASE INJECTABLE SUSPENSION KIT', releaseContext: 'EXTENDED_RELEASE', postInjectionDeliriumSedationSyndromeReviewRequired: true, ...nonAuthorizing } },
];
const sourceByMedication: Record<MedicationId, string> = {
  'MED-quetiapine-conventional-oral-tablet': 'SRC-QUETIAPINE-SUN-SETIDFFE5',
  'MED-seroquel-xr-quetiapine-extended-release-oral-tablet': 'SRC-SEROQUEL-XR-ASTRAZENECA-SETID473A',
  'MED-zyprexa-olanzapine-oral-tablet': 'SRC-ZYPREXA-H2PHARMA-SETIDB418',
  'MED-zyprexa-zydis-olanzapine-orally-disintegrating-tablet': 'SRC-ZYPREXA-H2PHARMA-SETIDB418',
  'MED-zyprexa-olanzapine-intramuscular-injection': 'SRC-ZYPREXA-H2PHARMA-SETIDB418',
  'MED-zyprexa-relprevv-olanzapine-er-intramuscular-injection': 'SRC-ZYPREXA-RELPREVV-H2PHARMA-SETID1154',
};
export const periproceduralQuetiapineOlanzapineIdentityAtoms: EvidenceAtom[] = periproceduralQuetiapineOlanzapineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a distinct route/form/release identity and describes clinically material sedation/cognitive-motor, orthostatic/hemodynamic, seizure, withdrawal, and centrally acting drug-interaction context requiring medication reconciliation.`,
  normalizedTopic: 'periprocedural-quetiapine-olanzapine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-atypical-antipsychotic'], contextTags: ['antipsychotic-review', 'hemodynamic-review', 'sedation-review', 'route-form-release-identity', 'long-acting-injectable-review'] },
  locator: { section: 'Dosage Forms and Strengths; Warnings and Precautions; Drug Interactions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, and labeled safety context only; it does not authenticate a patient-specific product, dose, schedule, last administration, indication, adherence, or current commercial availability.',
    'Quetiapine conventional and extended-release tablets are not interchangeable; olanzapine oral tablet, orally disintegrating tablet, non-extended-release intramuscular powder for solution, and extended-release intramuscular suspension identities are not interchangeable. No substitution, route, formulation, release, or dose conversion is authorized.',
    'Indication, chronic-use pattern, last administration, psychiatric stability, prior relapse or withdrawal, orthostatic and fall risk, cardiac status, seizure risk, interacting medicines, ZYPREXA RELPREVV post-injection delirium/sedation syndrome context, and anesthesia plan require accountable clinician, psychiatry, pharmacy, and local-policy review.',
    'No autonomous continuation, interruption, conversion, substitution, administration or monitoring plan, procedural timing, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: product.genericName + ' identity', summary: 'Direct DailyMed provenance supports this route/form/release identity and review-only safety context.', keywords: [product.genericName, product.routeContext, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'antipsychotic', 'hemodynamic-review', 'sedation-review', 'long-acting-injectable-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));
export const periproceduralQuetiapineOlanzapineReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-QUETIAPINE-OLANZAPINE-REVIEW-001', version: 1, name: 'Explicit quetiapine or olanzapine route/form/release identity requires clinician, psychiatry, pharmacy, and anesthesia review',
  scope: { medicationIds: periproceduralQuetiapineOlanzapineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralQuetiapineOlanzapineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];
export const periproceduralQuetiapineOlanzapineIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralQuetiapineOlanzapineIdentitySources, atoms: periproceduralQuetiapineOlanzapineIdentityAtoms };
