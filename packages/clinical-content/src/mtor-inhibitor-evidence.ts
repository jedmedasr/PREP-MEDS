import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T06:34:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-sirolimus-oral-tablet'
  | 'MED-sirolimus-oral-solution'
  | 'MED-zortress-everolimus-transplant-oral-tablet'
  | 'MED-afinitor-everolimus-oncology-oral-tablet'
  | 'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension';

export interface MtorInhibitorIdentityDefinition {
  medicationId: MedicationId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL';
  indicationContext: 'TRANSPLANT_OR_LAM' | 'TRANSPLANT' | 'ONCOLOGY_OR_TSC';
  evidenceRef: { id: string; version: number };
}

export const mtorInhibitorIdentityDefinitions: MtorInhibitorIdentityDefinition[] = [
  { medicationId: 'MED-sirolimus-oral-tablet', genericName: 'sirolimus oral tablet', dosageForm: 'TABLET, SUGAR COATED', route: 'ORAL', indicationContext: 'TRANSPLANT_OR_LAM', evidenceRef: { id: 'EVD-SIROLIMUS-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-sirolimus-oral-solution', genericName: 'sirolimus oral solution', dosageForm: 'SOLUTION', route: 'ORAL', indicationContext: 'TRANSPLANT_OR_LAM', evidenceRef: { id: 'EVD-SIROLIMUS-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-zortress-everolimus-transplant-oral-tablet', genericName: 'everolimus transplant oral tablet', dosageForm: 'TABLET', route: 'ORAL', indicationContext: 'TRANSPLANT', evidenceRef: { id: 'EVD-ZORTRESS-EVEROLIMUS-TRANSPLANT-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-afinitor-everolimus-oncology-oral-tablet', genericName: 'everolimus oncology oral tablet', dosageForm: 'TABLET', route: 'ORAL', indicationContext: 'ONCOLOGY_OR_TSC', evidenceRef: { id: 'EVD-AFINITOR-EVEROLIMUS-ONCOLOGY-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension', genericName: 'everolimus oncology tablet for oral suspension', dosageForm: 'TABLET, FOR SUSPENSION', route: 'ORAL', indicationContext: 'ONCOLOGY_OR_TSC', evidenceRef: { id: 'EVD-AFINITOR-DISPERZ-EVEROLIMUS-SUSPENSION-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-sirolimus-oral-tablet', id: 'SRC-SIROLIMUS-TABLET-MYLAN-NDA021110', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', setId: '5908cd1a-fc5a-462f-99ed-1d8983e253c9', effectiveDate: '2026-03-26', applicationNumber: 'NDA021110' },
  { medicationId: 'MED-sirolimus-oral-solution', id: 'SRC-SIROLIMUS-SOLUTION-MYLAN-NDA021083', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', setId: '384cb547-55a4-47fc-a0a6-054c18a51b84', effectiveDate: '2026-09-21', applicationNumber: 'NDA021083' },
  { medicationId: 'MED-zortress-everolimus-transplant-oral-tablet', id: 'SRC-ZORTRESS-TABLET-NOVARTIS-NDA021560', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: 'e082a024-7850-400b-a5c2-2a140612562a', effectiveDate: '2026-02-12', applicationNumber: 'NDA021560' },
  { medicationId: 'MED-afinitor-everolimus-oncology-oral-tablet', id: 'SRC-AFINITOR-TABLET-NOVARTIS-NDA022334', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '2150f73a-179b-4afc-b8ce-67c85cc72f04', effectiveDate: '2026-06-01', applicationNumber: 'NDA022334' },
  { medicationId: 'MED-afinitor-disperz-everolimus-oncology-tablet-for-suspension', id: 'SRC-AFINITOR-DISPERZ-NOVARTIS-NDA203985', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: '2150f73a-179b-4afc-b8ce-67c85cc72f04', effectiveDate: '2026-06-01', applicationNumber: 'NDA203985' },
];
const definitionByMedication = new Map(mtorInhibitorIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const mtorInhibitorIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      dosageForm: definition.dosageForm, indicationContext: definition.indicationContext,
      representativeIdentityOnly: true, indicationNotInferred: true, transplantOrganNotInferred: true,
      regimenNotInferred: true, concentrationMonitoringNotInferred: true,
      tabletSolutionEquivalenceNotGeneralized: true, brandIndicationDistinctionPreserved: true,
      woundHealingDecisionReviewOnly: true, interactionDecisionReviewOnly: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false,
      formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const mtorInhibitorIdentityAtoms: EvidenceAtom[] = mtorInhibitorIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with ${product.indicationContext.toLowerCase()} indication context.`,
  normalizedTopic: 'mtor-inhibitor-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.medicationId.includes('sirolimus') ? 'ING-sirolimus' : 'ING-everolimus'], drugClassIds: ['CLS-mtor-inhibitor'], contextTags: ['form-indication-identity', 'specialist-review-only'] },
  locator: { section: 'Indications and Usage; Dosage Forms and Strengths; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, brand/indication context, and application provenance only; it does not authenticate a patient-specific product, strength, dose, regimen, manufacturer, NDC, package, adherence, concentration, or current commercial availability.',
    'Sirolimus tablet and oral solution remain distinct; the label-specific equivalence statement at one dose is not generalized to higher doses and does not authorize conversion or substitution.',
    'ZORTRESS transplant everolimus, AFINITOR oncology/TSC tablets, and AFINITOR DISPERZ tablets for oral suspension remain distinct identities; bare everolimus and formulation-unspecified terms fail closed.',
    'Indication, transplanted organ, time since transplant, rejection history, current multidrug regimen, last dose, therapeutic drug monitoring, renal/hepatic function, interacting drugs, infection status, wound-healing status, and oral tolerance require specialist and clinician review.',
    'No autonomous continuation, interruption, missed-dose instruction, dose arithmetic, conversion, substitution, form change, monitoring target, wound-healing decision, interaction management, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} identity`, summary: 'Direct DailyMed provenance supports this route/form/indication-context medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'mtor-inhibitor', 'specialist-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const mtorInhibitorReviewRules: ClinicalRule[] = [{
  id: 'RULE-MTOR-INHIBITOR-SPECIALIST-REVIEW-001', version: 1,
  name: 'Explicit mTOR-inhibitor product requires specialist and clinician review',
  scope: { medicationIds: mtorInhibitorIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: mtorInhibitorIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const mtorInhibitorIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: mtorInhibitorIdentitySources, atoms: mtorInhibitorIdentityAtoms,
};
