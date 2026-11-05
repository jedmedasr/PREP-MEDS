import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-07T05:46:51Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId = 'MED-cannabis-inhaled-use-pattern' | 'MED-cannabis-oral-ingested-use-pattern' | 'MED-epidiolex-cannabidiol-oral-solution' | 'MED-marinol-dronabinol-oral-capsule' | 'MED-syndros-dronabinol-oral-solution';
type IngredientId = 'ING-cannabis-product-unspecified' | 'ING-cannabidiol' | 'ING-dronabinol';

export interface PeriproceduralCannabinoidIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  identityKind: 'SELF_REPORTED_USE_PATTERN' | 'FDA_LABELED_PRODUCT';
  evidenceRef: { id: string; version: number };
}

export const periproceduralCannabinoidIdentityDefinitions: PeriproceduralCannabinoidIdentityDefinition[] = [
  { medicationId: 'MED-cannabis-inhaled-use-pattern', ingredientId: 'ING-cannabis-product-unspecified', genericName: 'self-reported inhaled cannabis use pattern', identityKind: 'SELF_REPORTED_USE_PATTERN', evidenceRef: { id: 'EVD-CANNABIS-INHALED-USE-PATTERN-PERIOPERATIVE-CONTEXT', version: 1 } },
  { medicationId: 'MED-cannabis-oral-ingested-use-pattern', ingredientId: 'ING-cannabis-product-unspecified', genericName: 'self-reported oral or edible cannabis use pattern', identityKind: 'SELF_REPORTED_USE_PATTERN', evidenceRef: { id: 'EVD-CANNABIS-ORAL-USE-PATTERN-PERIOPERATIVE-CONTEXT', version: 1 } },
  { medicationId: 'MED-epidiolex-cannabidiol-oral-solution', ingredientId: 'ING-cannabidiol', genericName: 'EPIDIOLEX cannabidiol oral solution', identityKind: 'FDA_LABELED_PRODUCT', evidenceRef: { id: 'EVD-EPIDIOLEX-CANNABIDIOL-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-marinol-dronabinol-oral-capsule', ingredientId: 'ING-dronabinol', genericName: 'MARINOL dronabinol oral capsule', identityKind: 'FDA_LABELED_PRODUCT', evidenceRef: { id: 'EVD-MARINOL-DRONABINOL-ORAL-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-syndros-dronabinol-oral-solution', ingredientId: 'ING-dronabinol', genericName: 'SYNDROS dronabinol oral solution', identityKind: 'FDA_LABELED_PRODUCT', evidenceRef: { id: 'EVD-SYNDROS-DRONABINOL-ORAL-SOLUTION-IDENTITY', version: 1 } },
];

const nonAuthorizing = { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
const asraSource: SourceDocument = {
  id: 'SRC-ASRA-PERIOPERATIVE-CANNABIS-CANNABINOID-GUIDELINE-2023', version: 1, sourceType: 'OTHER',
  title: 'ASRA Pain Medicine consensus guidelines on the management of the perioperative patient on cannabis and cannabinoids',
  publisher: 'Regional Anesthesia & Pain Medicine', societyOrRegulator: 'American Society of Regional Anesthesia and Pain Medicine', effectiveDate: '2023-01-03',
  sourceUrl: 'https://rapm.bmj.com/content/48/3/97', externalIdentifier: 'DOI 10.1136/rapm-2022-104013', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
  metadata: { usePatternOnly: true, productCompositionAuthenticated: false, routeAndLastUseRequireReconciliation: true, ...nonAuthorizing },
};
const label = (id: string, title: string, setId: string, effectiveDate: string, dosageForm: string): SourceDocument => ({
  id, version: 1, sourceType: 'FDA_LABEL', title, publisher: 'DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate,
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId, externalIdentifier: 'DailyMed SETID ' + setId,
  jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { setId, route: 'ORAL', dosageForm, wholeProductIdentity: true, ...nonAuthorizing },
});

export const periproceduralCannabinoidIdentitySources: SourceDocument[] = [
  asraSource,
  label('SRC-EPIDIOLEX-SETID8BF2', 'EPIDIOLEX cannabidiol oral solution: direct DailyMed labeling', '8bf27097-4870-43fb-94f0-f3d0871d1eec', '2026-05-29', 'SOLUTION'),
  label('SRC-MARINOL-SETIDD0EF', 'MARINOL dronabinol oral capsule: direct DailyMed labeling', 'd0efeeec-640d-43c3-8f0a-d31324a11c68', '2023-02-14', 'CAPSULE'),
  label('SRC-SYNDROS-SETIDA780', 'SYNDROS dronabinol oral solution: direct DailyMed labeling', 'a7801c70-995d-46a2-91ee-141ef427c6b5', '2026-04-21', 'SOLUTION'),
];

const sourceByMedication: Record<MedicationId, string> = {
  'MED-cannabis-inhaled-use-pattern': asraSource.id,
  'MED-cannabis-oral-ingested-use-pattern': asraSource.id,
  'MED-epidiolex-cannabidiol-oral-solution': 'SRC-EPIDIOLEX-SETID8BF2',
  'MED-marinol-dronabinol-oral-capsule': 'SRC-MARINOL-SETIDD0EF',
  'MED-syndros-dronabinol-oral-solution': 'SRC-SYNDROS-SETIDA780',
};

export const periproceduralCannabinoidIdentityAtoms: EvidenceAtom[] = periproceduralCannabinoidIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: product.identityKind === 'SELF_REPORTED_USE_PATTERN'
    ? `ASRA consensus guidance supports recording ${product.genericName} with route, amount, frequency, duration, and recency context for accountable perioperative review; the report is not a verified product identity.`
    : `Direct DailyMed labeling supports ${product.genericName} as a distinct oral whole-product identity with clinically material CNS, sedation, hemodynamic, hepatic, withdrawal, seizure, or interacting-medication context where applicable.`,
  normalizedTopic: 'periprocedural-cannabinoid-identity-route-and-use-pattern', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-cannabinoid-product'], contextTags: ['cannabinoid-review', 'sedation-review', 'hemodynamic-review', 'route-use-pattern-reconciliation'] },
  locator: { section: product.identityKind === 'SELF_REPORTED_USE_PATTERN' ? 'Screening; route, dose, frequency, duration, and time of last consumption; cardiovascular, respiratory, cognition, anesthetic, pain, and withdrawal considerations' : 'Dosage Forms and Strengths; Warnings and Precautions; Drug Interactions; Description; Product Information' },
  limitations: [
    'Self-reported cannabis, marijuana, THC, CBD, edible, smoked, or vaped use does not authenticate ingredients, potency, purity, formulation, route, dose, frequency, duration, last use, indication, or a regulated product; unclear inputs must fail closed.',
    'EPIDIOLEX, MARINOL, and SYNDROS are distinct whole-product identities. Consumer CBD is not inferred to be EPIDIOLEX, and dronabinol capsule and solution identities are not interchangeable.',
    'Acute intoxication or impaired cognition, cardiovascular and hemodynamic effects, airway or respiratory effects for inhaled use, additive CNS or sedation effects, hepatic and interacting-medication context, withdrawal, postoperative pain or nausea context, and local policy require accountable clinician, pharmacy, anesthesia, and procedural-team review.',
    'No autonomous continuation, interruption, taper, restart, hold interval, substitution, route or formulation conversion, dose change, anesthesia plan, or procedural timing is supported.',
  ],
  retrieval: { title: product.genericName + ' review identity', summary: 'Authoritative guidance or direct labeling supports a bounded identity and review-only peri-procedural context.', keywords: [product.genericName, product.identityKind], concepts: ['cannabinoid', 'medication-reconciliation', 'route-use-pattern', 'sedation', 'hemodynamic-review'], sourceAuthorityRank: product.identityKind === 'FDA_LABELED_PRODUCT' ? 100 : 98 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralCannabinoidReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-CANNABINOID-REVIEW-001', version: 1, name: 'Explicit cannabinoid product or route/use-pattern identity requires clinician, pharmacy, anesthesia, and procedural-team review',
  scope: { medicationIds: periproceduralCannabinoidIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] }, requiredModifierIds: [],
  disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW', evidenceRefs: periproceduralCannabinoidIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const periproceduralCannabinoidIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralCannabinoidIdentitySources, atoms: periproceduralCannabinoidIdentityAtoms };
