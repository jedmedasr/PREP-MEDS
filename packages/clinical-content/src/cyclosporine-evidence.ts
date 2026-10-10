import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T05:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-sandimmune-cyclosporine-nonmodified-oral-capsule'
  | 'MED-sandimmune-cyclosporine-intravenous-injection'
  | 'MED-neoral-cyclosporine-modified-oral-capsule'
  | 'MED-neoral-cyclosporine-modified-oral-solution';

export interface CyclosporineIdentityDefinition {
  medicationId: MedicationId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'INTRAVENOUS';
  formulationContext: 'NON_MODIFIED' | 'MODIFIED' | 'PARENTERAL';
  evidenceRef: { id: string; version: number };
}

export const cyclosporineIdentityDefinitions: CyclosporineIdentityDefinition[] = [
  { medicationId: 'MED-sandimmune-cyclosporine-nonmodified-oral-capsule', genericName: 'cyclosporine nonmodified oral', dosageForm: 'CAPSULE, LIQUID FILLED', route: 'ORAL', formulationContext: 'NON_MODIFIED', evidenceRef: { id: 'EVD-SANDIMMUNE-NONMODIFIED-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-sandimmune-cyclosporine-intravenous-injection', genericName: 'cyclosporine intravenous', dosageForm: 'INJECTION', route: 'INTRAVENOUS', formulationContext: 'PARENTERAL', evidenceRef: { id: 'EVD-SANDIMMUNE-IV-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-neoral-cyclosporine-modified-oral-capsule', genericName: 'cyclosporine modified oral capsule', dosageForm: 'CAPSULE, LIQUID FILLED', route: 'ORAL', formulationContext: 'MODIFIED', evidenceRef: { id: 'EVD-NEORAL-MODIFIED-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-neoral-cyclosporine-modified-oral-solution', genericName: 'cyclosporine modified oral solution', dosageForm: 'SOLUTION', route: 'ORAL', formulationContext: 'MODIFIED', evidenceRef: { id: 'EVD-NEORAL-MODIFIED-SOLUTION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-sandimmune-cyclosporine-nonmodified-oral-capsule', id: 'SRC-SANDIMMUNE-CAPSULE-NOVARTIS-NDA050625', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '5e5926a7-1de0-4b54-a5c0-286b6200ff82', effectiveDate: '2026-07-10', applicationNumber: 'NDA050625' },
  { medicationId: 'MED-sandimmune-cyclosporine-intravenous-injection', id: 'SRC-SANDIMMUNE-INJECTION-NOVARTIS-NDA050573', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '5e5926a7-1de0-4b54-a5c0-286b6200ff82', effectiveDate: '2026-07-10', applicationNumber: 'NDA050573' },
  { medicationId: 'MED-neoral-cyclosporine-modified-oral-capsule', id: 'SRC-NEORAL-CAPSULE-NOVARTIS-NDA050715', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '94461af3-11f1-4670-95d4-2965b9538ae3', effectiveDate: '2026-08-10', applicationNumber: 'NDA050715' },
  { medicationId: 'MED-neoral-cyclosporine-modified-oral-solution', id: 'SRC-NEORAL-SOLUTION-NOVARTIS-NDA050716', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '94461af3-11f1-4670-95d4-2965b9538ae3', effectiveDate: '2026-08-10', applicationNumber: 'NDA050716' },
];
const definitionByMedication = new Map(cyclosporineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const cyclosporineIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      dosageForm: definition.dosageForm, formulationContext: definition.formulationContext,
      representativeIdentityOnly: true, transplantOrganNotInferred: true, indicationNotInferred: true,
      regimenNotInferred: true, concentrationMonitoringNotInferred: true,
      nonBioequivalencePreserved: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const cyclosporineIdentityAtoms: EvidenceAtom[] = cyclosporineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} cyclosporine identity with ${product.formulationContext.toLowerCase()} formulation context.`,
  normalizedTopic: 'cyclosporine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: ['ING-cyclosporine'], drugClassIds: ['CLS-calcineurin-inhibitor', 'CLS-transplant-immunosuppressant'], contextTags: ['route-form-modified-status-identity', 'transplant-team-review-only'] },
  locator: { section: 'Boxed Warning; Dosage Forms and Strengths; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, modified/nonmodified context, brand identity, and application provenance only; it does not authenticate a patient-specific product, strength, dose, regimen, manufacturer, NDC, package, adherence, concentration, or current commercial availability.',
    'Sandimmune nonmodified capsules, Sandimmune intravenous injection, Neoral modified capsules, and Neoral modified oral solution remain distinct identities; modified and nonmodified oral cyclosporine are not treated as bioequivalent or interchangeable.',
    'Transplanted organ or nontransplant indication, time since transplant, rejection history, current multidrug immunosuppression, last dose, therapeutic drug monitoring, renal/hepatic function, interacting drugs, infection status, and ability to take oral medication require transplant-team and clinician review.',
    'No autonomous continuation, interruption, missed-dose instruction, dose arithmetic, bioequivalent conversion, substitution, route/form change, monitoring target, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} cyclosporine identity`, summary: 'Direct DailyMed provenance supports this route/form/modified-status medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'cyclosporine', 'transplant-immunosuppression'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const cyclosporineReviewRules: ClinicalRule[] = [{
  id: 'RULE-CYCLOSPORINE-TRANSPLANT-REVIEW-001', version: 1,
  name: 'Explicit cyclosporine product requires transplant-team and clinician review',
  scope: { medicationIds: cyclosporineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: cyclosporineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const cyclosporineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: cyclosporineIdentitySources, atoms: cyclosporineIdentityAtoms,
};
