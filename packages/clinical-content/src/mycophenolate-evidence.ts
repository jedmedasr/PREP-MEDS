import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T06:51:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-cellcept-mycophenolate-mofetil-oral-capsule'
  | 'MED-cellcept-mycophenolate-mofetil-oral-tablet'
  | 'MED-cellcept-mycophenolate-mofetil-oral-suspension'
  | 'MED-cellcept-mycophenolate-mofetil-intravenous-injection'
  | 'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet';

export interface MycophenolateIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: 'ING-mycophenolate-mofetil' | 'ING-mycophenolic-acid';
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'INTRAVENOUS';
  releaseContext: 'IMMEDIATE_OR_UNSPECIFIED' | 'DELAYED_RELEASE' | 'NOT_APPLICABLE';
  evidenceRef: { id: string; version: number };
}

export const mycophenolateIdentityDefinitions: MycophenolateIdentityDefinition[] = [
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-capsule', ingredientId: 'ING-mycophenolate-mofetil', genericName: 'mycophenolate mofetil oral capsule', dosageForm: 'CAPSULE', route: 'ORAL', releaseContext: 'IMMEDIATE_OR_UNSPECIFIED', evidenceRef: { id: 'EVD-CELLCEPT-MMF-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-tablet', ingredientId: 'ING-mycophenolate-mofetil', genericName: 'mycophenolate mofetil oral tablet', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', releaseContext: 'IMMEDIATE_OR_UNSPECIFIED', evidenceRef: { id: 'EVD-CELLCEPT-MMF-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-suspension', ingredientId: 'ING-mycophenolate-mofetil', genericName: 'mycophenolate mofetil oral suspension', dosageForm: 'POWDER, FOR SUSPENSION', route: 'ORAL', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-CELLCEPT-MMF-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-intravenous-injection', ingredientId: 'ING-mycophenolate-mofetil', genericName: 'mycophenolate mofetil intravenous injection', dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', route: 'INTRAVENOUS', releaseContext: 'NOT_APPLICABLE', evidenceRef: { id: 'EVD-CELLCEPT-MMF-IV-IDENTITY', version: 1 } },
  { medicationId: 'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet', ingredientId: 'ING-mycophenolic-acid', genericName: 'mycophenolic acid delayed-release oral tablet', dosageForm: 'TABLET, DELAYED RELEASE', route: 'ORAL', releaseContext: 'DELAYED_RELEASE', evidenceRef: { id: 'EVD-MYFORTIC-MPA-DR-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-capsule', id: 'SRC-CELLCEPT-CAPSULE-GENENTECH-NDA050723', publisher: 'Genentech, Inc.; DailyMed', setId: '37241e87-4af4-4dc3-a1aa-ea6f20d8dc40', effectiveDate: '2026-08-05', applicationNumber: 'NDA050723' },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-tablet', id: 'SRC-CELLCEPT-TABLET-GENENTECH-NDA050722', publisher: 'Genentech, Inc.; DailyMed', setId: '37241e87-4af4-4dc3-a1aa-ea6f20d8dc40', effectiveDate: '2026-08-05', applicationNumber: 'NDA050722' },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-oral-suspension', id: 'SRC-CELLCEPT-SUSPENSION-GENENTECH-NDA050758', publisher: 'Genentech, Inc.; DailyMed', setId: '37241e87-4af4-4dc3-a1aa-ea6f20d8dc40', effectiveDate: '2026-08-05', applicationNumber: 'NDA050758' },
  { medicationId: 'MED-cellcept-mycophenolate-mofetil-intravenous-injection', id: 'SRC-CELLCEPT-IV-GENENTECH-NDA050759', publisher: 'Genentech, Inc.; DailyMed', setId: '37241e87-4af4-4dc3-a1aa-ea6f20d8dc40', effectiveDate: '2026-08-05', applicationNumber: 'NDA050759' },
  { medicationId: 'MED-myfortic-mycophenolic-acid-delayed-release-oral-tablet', id: 'SRC-MYFORTIC-DR-NOVARTIS-NDA050791', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: 'eed26501-890d-4ff6-88e7-6dbea4726e53', effectiveDate: '2026-07-29', applicationNumber: 'NDA050791' },
];
const definitionByMedication = new Map(mycophenolateIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const mycophenolateIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, releaseContext: definition.releaseContext,
      representativeIdentityOnly: true, indicationNotInferred: true, transplantOrganNotInferred: true,
      regimenNotInferred: true, monitoringNotInferred: true, nonInterchangeabilityPreserved: true,
      infectionDecisionReviewOnly: true, giRiskDecisionReviewOnly: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false,
      formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const mycophenolateIdentityAtoms: EvidenceAtom[] = mycophenolateIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} identity.`,
  normalizedTopic: 'mycophenolate-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-antimetabolite-immunosuppressant'], contextTags: ['route-form-release-identity', 'specialist-review-only'] },
  locator: { section: 'Indications and Usage; Limitations of Use; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release context, brand identity, and application provenance only; it does not authenticate a patient-specific strength, dose, regimen, manufacturer, NDC, package, adherence, monitoring result, or current commercial availability.',
    'CELLCEPT capsule, tablet, oral suspension, and intravenous injection remain route/form-specific identities. MYFORTIC delayed-release mycophenolic acid remains distinct from mycophenolate mofetil products.',
    'The MYFORTIC label states delayed-release tablets and mycophenolate mofetil tablets/capsules should not be used interchangeably without physician supervision because absorption rate is not equivalent; no conversion or substitution is authorized here.',
    'Indication, transplanted organ/history, multidrug regimen, last dose, blood counts, renal/hepatic function, interactions, infection, gastrointestinal risk, wound healing, and oral tolerance require specialist and clinician review.',
    'No autonomous continuation, interruption, dose arithmetic, conversion, substitution, route/form change, monitoring target, infection or GI-risk decision, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} identity`, summary: 'Direct DailyMed provenance supports this route/form/release medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'mycophenolate', 'transplant-immunosuppression'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const mycophenolateReviewRules: ClinicalRule[] = [{
  id: 'RULE-MYCOPHENOLATE-SPECIALIST-REVIEW-001', version: 1,
  name: 'Explicit mycophenolate product requires specialist and clinician review',
  scope: { medicationIds: mycophenolateIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: mycophenolateIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const mycophenolateIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: mycophenolateIdentitySources, atoms: mycophenolateIdentityAtoms,
};
