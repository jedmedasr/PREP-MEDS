import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T13:25:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-pramipexole-dihydrochloride-ir-oral-tablet'
  | 'MED-pramipexole-dihydrochloride-er-oral-tablet'
  | 'MED-ropinirole-hydrochloride-ir-film-coated-tablet'
  | 'MED-ropinirole-hydrochloride-er-film-coated-tablet';
type IngredientId = 'ING-pramipexole' | 'ING-ropinirole';

export interface ParkinsonOralDopamineAgonistIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'TABLET, EXTENDED RELEASE' | 'TABLET, FILM COATED, EXTENDED RELEASE';
  route: 'ORAL';
  releaseProfile: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE';
  labeledIndicationContext: 'PARKINSON_AND_RLS' | 'PARKINSON_ONLY';
  evidenceRef: { id: string; version: number };
}

export const parkinsonOralDopamineAgonistIdentityDefinitions: ParkinsonOralDopamineAgonistIdentityDefinition[] = [
  { medicationId: 'MED-pramipexole-dihydrochloride-ir-oral-tablet', ingredientIds: ['ING-pramipexole'], genericName: 'pramipexole dihydrochloride immediate release', dosageForm: 'TABLET', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', labeledIndicationContext: 'PARKINSON_AND_RLS', evidenceRef: { id: 'EVD-PRAMIPEXOLE-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-pramipexole-dihydrochloride-er-oral-tablet', ingredientIds: ['ING-pramipexole'], genericName: 'pramipexole dihydrochloride extended release', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', labeledIndicationContext: 'PARKINSON_ONLY', evidenceRef: { id: 'EVD-PRAMIPEXOLE-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-ropinirole-hydrochloride-ir-film-coated-tablet', ingredientIds: ['ING-ropinirole'], genericName: 'ropinirole hydrochloride immediate release', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', labeledIndicationContext: 'PARKINSON_AND_RLS', evidenceRef: { id: 'EVD-ROPINIROLE-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-ropinirole-hydrochloride-er-film-coated-tablet', ingredientIds: ['ING-ropinirole'], genericName: 'ropinirole hydrochloride extended release', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', labeledIndicationContext: 'PARKINSON_ONLY', evidenceRef: { id: 'EVD-ROPINIROLE-ER-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string; sourceRole?: string }> = [
  { medicationId: 'MED-pramipexole-dihydrochloride-ir-oral-tablet', id: 'SRC-PRAMIPEXOLE-IR-GSMS-ANDA203855', publisher: 'Golden State Medical Supply, Inc.; DailyMed', setId: 'f8ac759f-59fb-49e4-a772-4114facdaea3', effectiveDate: '2026-01-26', applicationNumber: 'ANDA203855', sourceRole: 'RELABELED_REPACKAGED_LABEL' },
  { medicationId: 'MED-pramipexole-dihydrochloride-er-oral-tablet', id: 'SRC-PRAMIPEXOLE-ER-INGENUS-ANDA213444', publisher: 'Ingenus Pharmaceuticals, LLC; DailyMed', setId: '1d2b1d2c-ae22-424a-bad7-ce24a817b042', effectiveDate: '2025-04-24', applicationNumber: 'ANDA213444' },
  { medicationId: 'MED-ropinirole-hydrochloride-ir-film-coated-tablet', id: 'SRC-ROPINIROLE-IR-GLENMARK-ANDA090135', publisher: 'Glenmark Pharmaceuticals Inc., USA; DailyMed', setId: '85971b31-6f7d-421c-bf3c-5b33f3c1e781', effectiveDate: '2026-01-16', applicationNumber: 'ANDA090135' },
  { medicationId: 'MED-ropinirole-hydrochloride-er-film-coated-tablet', id: 'SRC-ROPINIROLE-ER-ACTAVIS-ANDA090869', publisher: 'Actavis Pharma, Inc.; DailyMed', setId: '300946bf-2f83-471d-868d-9820b65c52bb', effectiveDate: '2023-08-01', applicationNumber: 'ANDA090869' },
];
const definitionByMedication = new Map(parkinsonOralDopamineAgonistIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const parkinsonOralDopamineAgonistIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      route: definition.route, dosageForm: definition.dosageForm, releaseProfile: definition.releaseProfile,
      labeledIndicationContext: definition.labeledIndicationContext, representativeIdentityOnly: true,
      patientIndicationNotInferred: true, renalFunctionNotInferred: true, smokingStatusNotInferred: true,
      cyp1a2InteractionStatusNotInferred: true, withdrawalRiskNotInferred: true, anesthesiaPlanNotInferred: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, releaseConversionAuthorized: false,
      doseConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const parkinsonOralDopamineAgonistIdentityAtoms: EvidenceAtom[] =
  parkinsonOralDopamineAgonistIdentityDefinitions.map((product) => ({
    id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
    claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with ${product.releaseProfile.toLowerCase()} context.`,
    normalizedTopic: 'oral-dopamine-agonist-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-dopamine-agonist'], contextTags: ['release-and-indication-identity', 'anesthesia-review-only'] },
    locator: { section: 'Highlights; Indications and Usage; Description; Product Information; Marketing Information' },
    limitations: [
      'The source authenticates ingredient, oral route, dosage form, release profile, labeled indication context, and application provenance only; it does not authenticate a patient-specific manufacturer, package, NDC, dose, adherence, indication, renal function, interaction status, or current commercial availability.',
      'Immediate-release and extended-release pramipexole remain distinct; immediate-release and extended-release ropinirole remain distinct. Neither ingredient nor release formulation is automatically substituted, converted, or dose-mapped.',
      'The immediate-release labels include Parkinson disease and restless legs syndrome contexts while the selected extended-release labels are Parkinson-specific; the patient-specific indication must not be inferred from product name alone.',
      'Disease severity, current regimen, renal function, somnolence, orthostatic symptoms, hallucinations, impulse-control symptoms, withdrawal risk, concomitant dopaminergic or sedating therapy, smoking and CYP1A2 interaction context for ropinirole, procedure plan, and anesthesia plan require accountable clinician review.',
      'No autonomous continuation, interruption, taper, dose or release conversion, substitution, anesthesia plan, or restart timing is supported by this identity evidence.',
    ],
    retrieval: { title: `${product.genericName} product identity`, summary: 'Direct DailyMed provenance supports this release- and indication-specific oral dopamine-agonist medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseProfile], concepts: ['medication-identity', 'dopamine-agonist', 'anesthesia-review'], sourceAuthorityRank: 100 },
    lifecycle: 'DRAFT', createdAt: retrievedAt,
  }));

export const parkinsonOralDopamineAgonistReviewRules: ClinicalRule[] = [{
  id: 'RULE-PARKINSON-ORAL-DOPAMINE-AGONIST-REVIEW-001', version: 1,
  name: 'Explicit oral dopamine-agonist product requires clinician and anesthesia review',
  scope: { medicationIds: parkinsonOralDopamineAgonistIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: parkinsonOralDopamineAgonistIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 93,
}];

export const parkinsonOralDopamineAgonistIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: parkinsonOralDopamineAgonistIdentitySources, atoms: parkinsonOralDopamineAgonistIdentityAtoms,
};
