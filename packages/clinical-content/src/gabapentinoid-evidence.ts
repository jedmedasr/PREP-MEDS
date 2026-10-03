import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T09:45:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-neurontin-gabapentin-oral-capsule'
  | 'MED-neurontin-gabapentin-oral-tablet'
  | 'MED-neurontin-gabapentin-oral-solution'
  | 'MED-gralise-gabapentin-er-oral-tablet'
  | 'MED-horizant-gabapentin-enacarbil-er-oral-tablet'
  | 'MED-lyrica-pregabalin-oral-capsule'
  | 'MED-lyrica-pregabalin-oral-solution'
  | 'MED-lyrica-cr-pregabalin-er-oral-tablet';
type IngredientId = 'ING-gabapentin' | 'ING-gabapentin-enacarbil' | 'ING-pregabalin';

export interface GabapentinoidIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: [IngredientId];
  genericName: string;
  dosageForm: 'CAPSULE' | 'TABLET, FILM COATED' | 'SOLUTION' | 'TABLET, EXTENDED RELEASE';
  releaseContext: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  wholeProductContext: 'NEURONTIN' | 'GRALISE' | 'HORIZANT' | 'LYRICA' | 'LYRICA_CR';
  evidenceRef: { id: string; version: number };
}

export const gabapentinoidIdentityDefinitions: GabapentinoidIdentityDefinition[] = [
  { medicationId: 'MED-neurontin-gabapentin-oral-capsule', ingredientIds: ['ING-gabapentin'], genericName: 'gabapentin', dosageForm: 'CAPSULE', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'NEURONTIN', evidenceRef: { id: 'EVD-NEURONTIN-GABAPENTIN-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-neurontin-gabapentin-oral-tablet', ingredientIds: ['ING-gabapentin'], genericName: 'gabapentin', dosageForm: 'TABLET, FILM COATED', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'NEURONTIN', evidenceRef: { id: 'EVD-NEURONTIN-GABAPENTIN-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-neurontin-gabapentin-oral-solution', ingredientIds: ['ING-gabapentin'], genericName: 'gabapentin', dosageForm: 'SOLUTION', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'NEURONTIN', evidenceRef: { id: 'EVD-NEURONTIN-GABAPENTIN-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-gralise-gabapentin-er-oral-tablet', ingredientIds: ['ING-gabapentin'], genericName: 'gabapentin', dosageForm: 'TABLET, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', wholeProductContext: 'GRALISE', evidenceRef: { id: 'EVD-GRALISE-GABAPENTIN-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-horizant-gabapentin-enacarbil-er-oral-tablet', ingredientIds: ['ING-gabapentin-enacarbil'], genericName: 'gabapentin enacarbil', dosageForm: 'TABLET, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', wholeProductContext: 'HORIZANT', evidenceRef: { id: 'EVD-HORIZANT-GABAPENTIN-ENACARBIL-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-lyrica-pregabalin-oral-capsule', ingredientIds: ['ING-pregabalin'], genericName: 'pregabalin', dosageForm: 'CAPSULE', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'LYRICA', evidenceRef: { id: 'EVD-LYRICA-PREGABALIN-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-lyrica-pregabalin-oral-solution', ingredientIds: ['ING-pregabalin'], genericName: 'pregabalin', dosageForm: 'SOLUTION', releaseContext: 'IMMEDIATE_RELEASE', wholeProductContext: 'LYRICA', evidenceRef: { id: 'EVD-LYRICA-PREGABALIN-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-lyrica-cr-pregabalin-er-oral-tablet', ingredientIds: ['ING-pregabalin'], genericName: 'pregabalin', dosageForm: 'TABLET, EXTENDED RELEASE', releaseContext: 'EXTENDED_RELEASE', wholeProductContext: 'LYRICA_CR', evidenceRef: { id: 'EVD-LYRICA-CR-PREGABALIN-ER-TABLET-IDENTITY', version: 1 } },
];

const sources: SourceDocument[] = [
  { id: 'SRC-NEURONTIN-VIATRIS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'NEURONTIN gabapentin capsule, tablet, and oral solution labeling', publisher: 'Viatris Specialty LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-05-12', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=97935fd9-1d4a-43b6-a5d9-de994591187b', externalIdentifier: 'DailyMed SETID 97935fd9-1d4a-43b6-a5d9-de994591187b', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { applicationNumber: 'NDA020235', labelVersion: 48, marketAvailabilityAsserted: false, substitutionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-GRALISE-ALMATICA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'GRALISE gabapentin extended-release tablet labeling', publisher: 'Almatica Pharma LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-06-30', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=466273b1-c9fc-3930-c94b-aa11394d5140', externalIdentifier: 'DailyMed SETID 466273b1-c9fc-3930-c94b-aa11394d5140', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { applicationNumber: 'NDA022544', labelVersion: 7, marketAvailabilityAsserted: false, substitutionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-HORIZANT-AZURITY-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'HORIZANT gabapentin enacarbil extended-release tablet labeling', publisher: 'Azurity Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-04-28', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4c486fc7-c8c4-4c6c-b30c-366dabaeaadd', externalIdentifier: 'DailyMed SETID 4c486fc7-c8c4-4c6c-b30c-366dabaeaadd', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { labelVersion: 16, marketAvailabilityAsserted: false, substitutionAuthorized: false, prodrugConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-LYRICA-VIATRIS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'LYRICA pregabalin capsule and oral solution labeling', publisher: 'Viatris Specialty LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-04-15', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d4734e7d-5079-455e-8ff5-8f4539c998a9', externalIdentifier: 'DailyMed SETID d4734e7d-5079-455e-8ff5-8f4539c998a9', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { labelVersion: 18, marketAvailabilityAsserted: false, substitutionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-LYRICA-CR-FDA-LABEL', version: 1, sourceType: 'FDA_LABEL', title: 'LYRICA CR pregabalin extended-release tablet prescribing information', publisher: 'Viatris Specialty LLC', societyOrRegulator: 'U.S. Food and Drug Administration', effectiveDate: '2025-04-01', sourceUrl: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/209501s010lbl.pdf', externalIdentifier: 'NDA209501 supplement S-010; Reference ID 5578768', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { applicationNumber: 'NDA209501', supplement: 'S-010', marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-FDA-GABAPENTINOID-RESPIRATORY-SAFETY-2019', version: 1, sourceType: 'FDA_SAFETY_COMMUNICATION', title: 'Gabapentin and pregabalin serious breathing problems safety communication', publisher: 'U.S. Food and Drug Administration', societyOrRegulator: 'U.S. Food and Drug Administration', effectiveDate: '2019-12-19', sourceUrl: 'https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication', externalIdentifier: 'FDA Drug Safety Communication 2019-12-19', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { respiratoryRiskFactorsRequireReview: true, concomitantCnsDepressantsRequireReview: true, autonomousInstructionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
];

const sourceByProduct: Record<GabapentinoidIdentityDefinition['wholeProductContext'], string> = {
  NEURONTIN: 'SRC-NEURONTIN-VIATRIS-DAILYMED', GRALISE: 'SRC-GRALISE-ALMATICA-DAILYMED',
  HORIZANT: 'SRC-HORIZANT-AZURITY-DAILYMED', LYRICA: 'SRC-LYRICA-VIATRIS-DAILYMED', LYRICA_CR: 'SRC-LYRICA-CR-FDA-LABEL',
};

export const gabapentinoidIdentityAtoms: EvidenceAtom[] = gabapentinoidIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByProduct[product.wholeProductContext], version: 1 },
  claim: 'Authoritative labeling supports ' + product.wholeProductContext.replaceAll('_', ' ') + ' as a distinct oral ' + product.dosageForm.toLowerCase() + ' identity containing ' + product.genericName + ' with ' + product.releaseContext.toLowerCase() + ' context.',
  normalizedTopic: 'gabapentinoid-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-gabapentinoid'], contextTags: ['form-release-prodrug-identity', 'withdrawal-sedation-respiratory-review-only'] },
  locator: { section: 'Dosage Forms and Strengths; Warnings and Precautions; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient, oral dosage form, release context, and whole-product identity only; patient-specific product, dose, regimen, adherence, indication, manufacturer, and current availability are not inferred.',
    'Gabapentin immediate-release forms, GRALISE extended-release gabapentin, HORIZANT gabapentin-enacarbil prodrug, LYRICA immediate-release pregabalin forms, and LYRICA CR extended-release pregabalin remain distinct and are not automatically substitutable.',
    'Indication, chronicity, last dose, renal function, seizure history, withdrawal risk, respiratory disease, age/frailty, concomitant opioids or other CNS depressants, oral feasibility, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, taper, substitution, prodrug/form/release/dose conversion, administration timing, monitoring, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.wholeProductContext.replaceAll('_', ' ') + ' identity', summary: 'Authoritative product labeling supports this form/release/prodrug-specific reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseContext], concepts: ['medication-identity', 'gabapentinoid', 'respiratory-sedation-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const gabapentinoidSafetyAtoms: EvidenceAtom[] = [{
  id: 'EVD-FDA-GABAPENTINOID-RESPIRATORY-RISK-CONTEXT', version: 1, source: { id: 'SRC-FDA-GABAPENTINOID-RESPIRATORY-SAFETY-2019', version: 1 },
  claim: 'FDA warns that serious breathing difficulties may occur with gabapentin or pregabalin in patients with respiratory risk factors, including concomitant CNS depressants, reduced lung function, and advanced age.',
  normalizedTopic: 'gabapentinoid-respiratory-sedation-risk-context', stance: 'CAUTIONARY', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: gabapentinoidIdentityDefinitions.map((item) => item.medicationId), ingredientIds: ['ING-gabapentin', 'ING-gabapentin-enacarbil', 'ING-pregabalin'], drugClassIds: ['CLS-gabapentinoid'], contextTags: ['respiratory-risk', 'cns-depressant-context', 'anesthesia-review-only'] },
  locator: { section: 'Issue; Recommendation' },
  limitations: ['This safety communication supports review of respiratory and concomitant-CNS-depressant context; it does not establish patient-specific risk or authorize a peri-procedural hold, continuation, taper, or restart schedule.'],
  retrieval: { title: 'FDA gabapentinoid respiratory-risk context', summary: 'FDA safety context establishes a genuine anesthesia-relevant review gap without creating an autonomous timing rule.', keywords: ['gabapentin', 'pregabalin', 'respiratory depression', 'CNS depressants'], concepts: ['medication-safety', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}];

export const gabapentinoidReviewRules: ClinicalRule[] = [{
  id: 'RULE-GABAPENTINOID-ANESTHESIA-REVIEW-001', version: 1,
  name: 'Explicit gabapentinoid product requires clinician and anesthesia review',
  scope: { medicationIds: gabapentinoidIdentityDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: gabapentinoidIdentityDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const gabapentinoidIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: [...gabapentinoidIdentityAtoms, ...gabapentinoidSafetyAtoms],
};
