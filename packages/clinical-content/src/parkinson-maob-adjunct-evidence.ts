import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T14:47:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId = 'MED-rasagiline-mesylate-oral-tablet' | 'MED-xadago-safinamide-oral-tablet';
type IngredientId = 'ING-rasagiline' | 'ING-safinamide';

export interface ParkinsonMaobAdjunctIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, FILM COATED';
  route: 'ORAL';
  labeledIndicationContext: 'PARKINSON_MONOTHERAPY_OR_ADJUNCT' | 'PARKINSON_ADJUNCT_LEVODOPA_OFF_EPISODES';
  evidenceRef: { id: string; version: number };
}

export const parkinsonMaobAdjunctIdentityDefinitions: ParkinsonMaobAdjunctIdentityDefinition[] = [
  { medicationId: 'MED-rasagiline-mesylate-oral-tablet', ingredientIds: ['ING-rasagiline'], genericName: 'rasagiline mesylate', dosageForm: 'TABLET', route: 'ORAL', labeledIndicationContext: 'PARKINSON_MONOTHERAPY_OR_ADJUNCT', evidenceRef: { id: 'EVD-RASAGILINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-xadago-safinamide-oral-tablet', ingredientIds: ['ING-safinamide'], genericName: 'XADAGO safinamide mesylate', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', labeledIndicationContext: 'PARKINSON_ADJUNCT_LEVODOPA_OFF_EPISODES', evidenceRef: { id: 'EVD-XADAGO-SAFINAMIDE-ORAL-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; sourceRole?: string }> = [
  { medicationId: 'MED-rasagiline-mesylate-oral-tablet', id: 'SRC-RASAGILINE-BRYANT-RANCH-ANDA207004', publisher: 'Bryant Ranch Prepack; DailyMed', setId: '4c4f5042-0e21-40a0-8352-bb28bb752bfa', effectiveDate: '2024-08-15', applicationNumber: 'ANDA207004', sourceRole: 'RELABELED_REPACKAGED_LABEL' },
  { medicationId: 'MED-xadago-safinamide-oral-tablet', id: 'SRC-XADAGO-MDD-NDA207145', publisher: 'MDD US Operations LLC, a subsidiary of Supernus Pharmaceuticals, Inc.; DailyMed', setId: 'c4d65f28-983f-42b4-bb23-023ae0fe81b2', effectiveDate: '2025-10-22', applicationNumber: 'NDA207145' },
];
const definitionByMedication = new Map(parkinsonMaobAdjunctIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const parkinsonMaobAdjunctIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (oral): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, sourceRole: source.sourceRole ?? 'LABELER_LABEL',
      route: definition.route, dosageForm: definition.dosageForm, labeledIndicationContext: definition.labeledIndicationContext,
      representativeIdentityOnly: true, patientIndicationNotInferred: true, levodopaRegimenNotInferred: true,
      hepaticFunctionNotInferred: true, bloodPressureNotInferred: true, withdrawalRiskNotInferred: true,
      serotonergicOpioidSympathomimeticInteractionStatusNotInferred: true, concomitantMaoiStatusNotInferred: true,
      anesthesiaPlanNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      doseConversionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const parkinsonMaobAdjunctIdentityAtoms: EvidenceAtom[] =
  parkinsonMaobAdjunctIdentityDefinitions.map((product) => ({
    id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
    claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with ${product.labeledIndicationContext.toLowerCase()} labeled context.`,
    normalizedTopic: 'parkinson-mao-b-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-mao-b-inhibitor'], contextTags: ['indication-specific-identity', 'interaction-and-anesthesia-review-only'] },
    locator: { section: 'Highlights; Indications and Usage; Contraindications; Warnings and Precautions; Drug Interactions; Product Information; Marketing Information' },
    limitations: [
      'The source authenticates ingredient, oral route, dosage form, labeled indication context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, current regimen, or current commercial availability.',
      'Rasagiline and safinamide remain distinct from one another and from existing oral and transdermal selegiline identities; no ingredient, formulation, or product substitution is authorized.',
      'Rasagiline labeling includes monotherapy and adjunct contexts, while XADAGO is labeled as adjunctive treatment to levodopa/carbidopa for patients experiencing off episodes; patient-specific indication and regimen must not be inferred from product name alone.',
      'Hepatic function, blood pressure, current levodopa and dopaminergic regimen, withdrawal or NMS-like risk, concomitant MAO inhibitors, serotonergic drugs, opioids, sympathomimetics, anesthesia plan, and procedure plan require accountable clinician review.',
      'No autonomous continuation, interruption, taper, dose conversion, substitution, anesthesia plan, or restart timing is supported by this identity evidence.',
    ],
    retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this indication-specific oral MAO-B-inhibitor medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm], concepts: ['medication-identity', 'mao-b-inhibitor', 'anesthesia-review'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  }));

export const parkinsonMaobAdjunctReviewRules: ClinicalRule[] = [{
  id: 'RULE-PARKINSON-MAOB-ADJUNCT-REVIEW-001', version: 1,
  name: 'Explicit oral Parkinson MAO-B product requires clinician and anesthesia review',
  scope: { medicationIds: parkinsonMaobAdjunctIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: parkinsonMaobAdjunctIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];

export const parkinsonMaobAdjunctIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: parkinsonMaobAdjunctIdentitySources, atoms: parkinsonMaobAdjunctIdentityAtoms,
};
