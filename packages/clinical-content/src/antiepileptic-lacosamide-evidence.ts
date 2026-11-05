import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-02T22:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-vimpat-lacosamide-film-coated-oral-tablet'
  | 'MED-vimpat-lacosamide-oral-solution'
  | 'MED-vimpat-lacosamide-intravenous-injection';

export interface AntiepilepticLacosamideIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: ['ING-lacosamide'];
  genericName: string;
  dosageForm: 'TABLET, FILM COATED' | 'SOLUTION' | 'INJECTION, SOLUTION';
  route: 'ORAL' | 'INTRAVENOUS';
  productContext: 'VIMPAT';
  applicationNumber: 'NDA022253' | 'NDA022254' | 'NDA022255';
  evidenceRef: { id: string; version: number };
}

export const antiepilepticLacosamideIdentityDefinitions: AntiepilepticLacosamideIdentityDefinition[] = [
  { medicationId: 'MED-vimpat-lacosamide-film-coated-oral-tablet', ingredientIds: ['ING-lacosamide'], genericName: 'VIMPAT lacosamide', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', productContext: 'VIMPAT', applicationNumber: 'NDA022253', evidenceRef: { id: 'EVD-VIMPAT-LACOSAMIDE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-vimpat-lacosamide-oral-solution', ingredientIds: ['ING-lacosamide'], genericName: 'VIMPAT lacosamide', dosageForm: 'SOLUTION', route: 'ORAL', productContext: 'VIMPAT', applicationNumber: 'NDA022255', evidenceRef: { id: 'EVD-VIMPAT-LACOSAMIDE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-vimpat-lacosamide-intravenous-injection', ingredientIds: ['ING-lacosamide'], genericName: 'VIMPAT lacosamide', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', productContext: 'VIMPAT', applicationNumber: 'NDA022254', evidenceRef: { id: 'EVD-VIMPAT-LACOSAMIDE-INTRAVENOUS-INJECTION-IDENTITY', version: 1 } },
];

const setId = '9e79b42c-38a3-4b2c-a196-a5a1948250e2';
const sourceByMedication = new Map<MedicationId, string>([
  ['MED-vimpat-lacosamide-film-coated-oral-tablet', 'SRC-VIMPAT-LACOSAMIDE-ORAL-TABLET-UCB-NDA022253'],
  ['MED-vimpat-lacosamide-oral-solution', 'SRC-VIMPAT-LACOSAMIDE-ORAL-SOLUTION-UCB-NDA022255'],
  ['MED-vimpat-lacosamide-intravenous-injection', 'SRC-VIMPAT-LACOSAMIDE-INJECTION-UCB-NDA022254'],
]);

export const antiepilepticLacosamideIdentitySources: SourceDocument[] = antiepilepticLacosamideIdentityDefinitions.map((definition) => ({
  id: sourceByMedication.get(definition.medicationId)!, version: 1, sourceType: 'FDA_LABEL',
  title: definition.genericName + ' ' + definition.dosageForm.toLowerCase() + ' (' + definition.route.toLowerCase() + '): direct DailyMed labeling',
  publisher: 'UCB, Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-05-12',
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId,
  externalIdentifier: 'DailyMed SETID ' + setId + '; ' + definition.applicationNumber,
  jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
  metadata: {
    setId, applicationNumber: definition.applicationNumber, route: definition.route, dosageForm: definition.dosageForm,
    productContext: definition.productContext, labelVersion: 63, representativeIdentityOnly: true,
    patientIndicationNotInferred: true, renalFunctionNotInferred: true, hepaticFunctionNotInferred: true,
    seizureControlNotInferred: true, adherenceNotInferred: true, cardiacConductionRiskNotInferred: true,
    concomitantConductionMedicationNotInferred: true, oralFeasibilityNotInferred: true,
    withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false,
    substitutionAuthorized: false, doseConversionAuthorized: false, routeConversionAuthorized: false,
    formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
  },
}));

export const antiepilepticLacosamideIdentityAtoms: EvidenceAtom[] = antiepilepticLacosamideIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: 'Direct DailyMed labeling supports ' + product.genericName + ' as a ' + product.route.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity under ' + product.applicationNumber + '.',
  normalizedTopic: 'antiepileptic-lacosamide-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-antiepileptic'], contextTags: ['route-form-identity', 'withdrawal-sensitive-review-only', 'cardiac-conduction-review'] },
  locator: { section: 'Highlights; Dosage and Administration; Warnings and Precautions; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, brand context, label version, and application provenance only; it does not authenticate a patient-specific package, NDC, dose, adherence, indication, regimen, or current commercial availability.',
    'VIMPAT film-coated oral tablet, oral solution, and intravenous injection remain distinct identities; bare lacosamide or VIMPAT is not enough to select one.',
    'Indication, seizure type and control, last dose, adherence, renal and hepatic function, cardiac history and conduction risk, concomitant conduction-affecting medication, oral feasibility, withdrawal risk, procedure plan, and anesthesia plan require accountable clinician review.',
    'Although labeling describes intravenous use when oral administration is temporarily not feasible, this evidence does not authorize autonomous route conversion, dose equivalence, substitution, continuation, interruption, taper, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.genericName + ' product identity', summary: 'Direct DailyMed provenance supports this route/form-specific lacosamide medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.route, product.applicationNumber], concepts: ['medication-identity', 'antiepileptic', 'withdrawal-sensitive-review', 'cardiac-conduction-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const antiepilepticLacosamideReviewRules: ClinicalRule[] = [{
  id: 'RULE-ANTIEPILEPTIC-LACOSAMIDE-REVIEW-001', version: 1,
  name: 'Explicit lacosamide product requires clinician and anesthesia review',
  scope: { medicationIds: antiepilepticLacosamideIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: antiepilepticLacosamideIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const antiepilepticLacosamideIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: antiepilepticLacosamideIdentitySources, atoms: antiepilepticLacosamideIdentityAtoms,
};
