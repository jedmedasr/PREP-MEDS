import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T00:50:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-adderall-mixed-amphetamine-salts-tablet'
  | 'MED-adderall-xr-mixed-amphetamine-salts-er-capsule'
  | 'MED-vyvanse-lisdexamfetamine-capsule'
  | 'MED-vyvanse-lisdexamfetamine-chewable-tablet'
  | 'MED-ritalin-methylphenidate-ir-tablet'
  | 'MED-concerta-methylphenidate-er-tablet';
type IngredientId = 'ING-amphetamine' | 'ING-dextroamphetamine' | 'ING-lisdexamfetamine' | 'ING-methylphenidate';

export interface PeriproceduralStimulantIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: string;
  route: 'ORAL';
  releaseProfile: 'IMMEDIATE_RELEASE' | 'EXTENDED_RELEASE' | 'NOT_APPLICABLE';
  indicationContext: string;
  evidenceRef: { id: string; version: number };
}

export const periproceduralStimulantIdentityDefinitions: PeriproceduralStimulantIdentityDefinition[] = [
  { medicationId: 'MED-adderall-mixed-amphetamine-salts-tablet', ingredientIds: ['ING-amphetamine', 'ING-dextroamphetamine'], genericName: 'mixed amphetamine salts', dosageForm: 'TABLET', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', indicationContext: 'ADHD OR NARCOLEPSY', evidenceRef: { id: 'EVD-ADDERALL-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-adderall-xr-mixed-amphetamine-salts-er-capsule', ingredientIds: ['ING-amphetamine', 'ING-dextroamphetamine'], genericName: 'mixed amphetamine salts', dosageForm: 'CAPSULE, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', indicationContext: 'ADHD', evidenceRef: { id: 'EVD-ADDERALL-XR-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-vyvanse-lisdexamfetamine-capsule', ingredientIds: ['ING-lisdexamfetamine'], genericName: 'lisdexamfetamine', dosageForm: 'CAPSULE', route: 'ORAL', releaseProfile: 'NOT_APPLICABLE', indicationContext: 'ADHD OR MODERATE-TO-SEVERE BINGE-EATING DISORDER', evidenceRef: { id: 'EVD-VYVANSE-CAPSULE-IDENTITY', version: 1 } },
  { medicationId: 'MED-vyvanse-lisdexamfetamine-chewable-tablet', ingredientIds: ['ING-lisdexamfetamine'], genericName: 'lisdexamfetamine', dosageForm: 'TABLET, CHEWABLE', route: 'ORAL', releaseProfile: 'NOT_APPLICABLE', indicationContext: 'ADHD OR MODERATE-TO-SEVERE BINGE-EATING DISORDER', evidenceRef: { id: 'EVD-VYVANSE-CHEWABLE-IDENTITY', version: 1 } },
  { medicationId: 'MED-ritalin-methylphenidate-ir-tablet', ingredientIds: ['ING-methylphenidate'], genericName: 'methylphenidate', dosageForm: 'TABLET', route: 'ORAL', releaseProfile: 'IMMEDIATE_RELEASE', indicationContext: 'ADHD OR NARCOLEPSY', evidenceRef: { id: 'EVD-RITALIN-IR-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-concerta-methylphenidate-er-tablet', ingredientIds: ['ING-methylphenidate'], genericName: 'methylphenidate', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', releaseProfile: 'EXTENDED_RELEASE', indicationContext: 'ADHD', evidenceRef: { id: 'EVD-CONCERTA-ER-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-adderall-mixed-amphetamine-salts-tablet', id: 'SRC-ADDERALL-IR-TEVA-ANDA040422', publisher: 'Teva Select Brands; DailyMed', setId: 'f22635fe-821d-4cde-aa12-419f8b53db81', effectiveDate: '2014-02-11', applicationNumber: 'ANDA040422' },
  { medicationId: 'MED-adderall-xr-mixed-amphetamine-salts-er-capsule', id: 'SRC-ADDERALL-XR-TAKEDA-NDA021303', publisher: 'Takeda Pharmaceuticals America, Inc.; DailyMed', setId: 'aff45863-ffe1-4d4f-8acf-c7081512a6c0', effectiveDate: '2002-05-22', applicationNumber: 'NDA021303' },
  { medicationId: 'MED-vyvanse-lisdexamfetamine-capsule', id: 'SRC-VYVANSE-CAPSULE-TAKEDA-NDA021977', publisher: 'Takeda Pharmaceuticals America, Inc.; DailyMed', setId: '704e4378-ca83-445c-8b45-3cfa51c1ecad', effectiveDate: '2007-02-23', applicationNumber: 'NDA021977' },
  { medicationId: 'MED-vyvanse-lisdexamfetamine-chewable-tablet', id: 'SRC-VYVANSE-CHEWABLE-TAKEDA-NDA208510', publisher: 'Takeda Pharmaceuticals America, Inc.; DailyMed', setId: '704e4378-ca83-445c-8b45-3cfa51c1ecad', effectiveDate: '2017-01-28', applicationNumber: 'NDA208510' },
  { medicationId: 'MED-ritalin-methylphenidate-ir-tablet', id: 'SRC-RITALIN-IR-NOVARTIS-NDA010187', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', setId: 'c0bf0835-6a2f-4067-a158-8b86c4b0668a', effectiveDate: '1955-12-31', applicationNumber: 'NDA010187' },
  { medicationId: 'MED-concerta-methylphenidate-er-tablet', id: 'SRC-CONCERTA-ER-JANSSEN-NDA021121', publisher: 'Janssen Pharmaceuticals, Inc.; DailyMed', setId: '1a88218c-5b18-4220-8f56-526de1a276cd', effectiveDate: '2000-08-01', applicationNumber: 'NDA021121' },
];
const definitionByMedication = new Map(periproceduralStimulantIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const periproceduralStimulantIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (oral): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route, dosageForm: definition.dosageForm,
      releaseProfile: definition.releaseProfile, indicationContext: definition.indicationContext,
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      releaseConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const periproceduralStimulantIdentityAtoms: EvidenceAtom[] = periproceduralStimulantIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as an oral ${product.dosageForm.toLowerCase()} identity with the stated release and indication context.`,
  normalizedTopic: 'periprocedural-stimulant-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-cns-stimulant'], contextTags: ['form-release-indication-identity', 'clinical-review-only'] },
  locator: { section: 'Indications and Usage; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, oral route, dosage form, release profile where stated, and label indication context only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or current commercial availability.',
    'Immediate-release and extended-release products remain distinct; VYVANSE capsule and chewable tablet remain distinct; mixed amphetamine salts retain their whole-product ingredient identity.',
    'Indication, prescribed-versus-nonmedical use, cardiovascular and hemodynamic status, concomitant serotonergic or sympathomimetic therapy, MAOI exposure, and anesthesia plan require accountable clinician review.',
    'No autonomous continuation, interruption, dose conversion, substitution, vasopressor plan, anesthesia plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} oral product identity`, summary: 'Direct DailyMed provenance supports this form/release/indication-specific medication-reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.releaseProfile], concepts: ['medication-identity', 'stimulant-context', 'form-release-indication-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralStimulantReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-STIMULANT-REVIEW-001', version: 1,
  name: 'Explicit stimulant product requires clinician review pending anesthesia and local-policy adjudication',
  scope: { medicationIds: periproceduralStimulantIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralStimulantIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 87,
}];

export const periproceduralStimulantIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: periproceduralStimulantIdentitySources, atoms: periproceduralStimulantIdentityAtoms,
};
