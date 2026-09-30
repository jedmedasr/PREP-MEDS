import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T01:08:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-phenelzine-sulfate-oral-tablet'
  | 'MED-parnate-tranylcypromine-film-coated-oral-tablet'
  | 'MED-marplan-isocarboxazid-oral-tablet'
  | 'MED-emsam-selegiline-transdermal-system';
type IngredientId = 'ING-phenelzine' | 'ING-tranylcypromine' | 'ING-isocarboxazid' | 'ING-selegiline';

export interface PeriproceduralMaoiIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'TRANSDERMAL';
  maoiContext: 'NONSELECTIVE_IRREVERSIBLE_MAOI' | 'TRANSDERMAL_MAOI';
  indicationContext: string;
  evidenceRef: { id: string; version: number };
}

export const periproceduralMaoiIdentityDefinitions: PeriproceduralMaoiIdentityDefinition[] = [
  { medicationId: 'MED-phenelzine-sulfate-oral-tablet', ingredientId: 'ING-phenelzine', genericName: 'phenelzine sulfate', dosageForm: 'TABLET', route: 'ORAL', maoiContext: 'NONSELECTIVE_IRREVERSIBLE_MAOI', indicationContext: 'DEPRESSION; LABEL-SPECIFIC SECOND-LINE CONTEXT', evidenceRef: { id: 'EVD-PHENELZINE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-parnate-tranylcypromine-film-coated-oral-tablet', ingredientId: 'ING-tranylcypromine', genericName: 'tranylcypromine sulfate', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', maoiContext: 'NONSELECTIVE_IRREVERSIBLE_MAOI', indicationContext: 'MDD AFTER INADEQUATE RESPONSE TO OTHER ANTIDEPRESSANTS', evidenceRef: { id: 'EVD-PARNATE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-marplan-isocarboxazid-oral-tablet', ingredientId: 'ING-isocarboxazid', genericName: 'isocarboxazid', dosageForm: 'TABLET', route: 'ORAL', maoiContext: 'NONSELECTIVE_IRREVERSIBLE_MAOI', indicationContext: 'DEPRESSION; NOT FIRST-CHOICE THERAPY', evidenceRef: { id: 'EVD-MARPLAN-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-emsam-selegiline-transdermal-system', ingredientId: 'ING-selegiline', genericName: 'selegiline transdermal', dosageForm: 'TRANSDERMAL SYSTEM', route: 'TRANSDERMAL', maoiContext: 'TRANSDERMAL_MAOI', indicationContext: 'MAJOR DEPRESSIVE DISORDER', evidenceRef: { id: 'EVD-EMSAM-TRANSDERMAL-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-phenelzine-sulfate-oral-tablet', id: 'SRC-PHENELZINE-LUPIN-ANDA200181', publisher: 'Lupin Pharmaceuticals, Inc.; DailyMed', setId: '40483372-448f-4284-976c-8462ef256661', effectiveDate: '2010-12-14', applicationNumber: 'ANDA200181' },
  { medicationId: 'MED-parnate-tranylcypromine-film-coated-oral-tablet', id: 'SRC-PARNATE-ADVANZ-NDA012342', publisher: 'Advanz Pharma (US) Corp.; DailyMed', setId: 'b72d8187-dfcc-4ea0-b5e9-c0be95b69a27', effectiveDate: '2013-01-14', applicationNumber: 'NDA012342' },
  { medicationId: 'MED-marplan-isocarboxazid-oral-tablet', id: 'SRC-MARPLAN-VALIDUS-NDA011961', publisher: 'Validus Pharmaceuticals LLC; DailyMed', setId: 'ac387aa0-3f04-4865-a913-db6ed6f4fdc5', effectiveDate: '1959-07-01', applicationNumber: 'NDA011961' },
  { medicationId: 'MED-emsam-selegiline-transdermal-system', id: 'SRC-EMSAM-NOVEN-NDA021336', publisher: 'Noven Pharmaceuticals, Inc.; DailyMed', setId: 'b891bd9f-fdb8-4862-89c5-ecdd700398a3', effectiveDate: '2006-02-27', applicationNumber: 'NDA021336' },
];
const definitionByMedication = new Map(periproceduralMaoiIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const periproceduralMaoiIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route, dosageForm: definition.dosageForm,
      maoiContext: definition.maoiContext, indicationContext: definition.indicationContext,
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const periproceduralMaoiIdentityAtoms: EvidenceAtom[] = periproceduralMaoiIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} MAOI identity with the stated label indication context.`,
  normalizedTopic: 'periprocedural-maoi-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-monoamine-oxidase-inhibitor'], contextTags: ['route-form-maoi-subtype-identity', 'clinical-review-only'] },
  locator: { section: 'Indications and Usage; Description; Contraindications; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, MAOI context, and label indication context only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or current commercial availability.',
    'Phenelzine, tranylcypromine, isocarboxazid, and EMSAM are not interchangeable; EMSAM transdermal selegiline must not resolve from bare selegiline because oral MAO-B-inhibitor identities are outside this cluster.',
    'Concomitant serotonergic, sympathomimetic, opioid, dextromethorphan, anesthetic, and vasopressor exposure; dose; dietary context; cardiovascular status; and psychiatric risk require accountable clinician review.',
    'No autonomous continuation, interruption, taper, washout, substitution, anesthetic/vasopressor plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} ${product.route.toLowerCase()} MAOI identity`, summary: 'Direct DailyMed provenance supports this route/form/MAOI-context medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'maoi-context', 'route-form-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralMaoiReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-MAOI-REVIEW-001', version: 1,
  name: 'Explicit MAOI product requires clinician review pending anesthesia and local-policy adjudication',
  scope: { medicationIds: periproceduralMaoiIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralMaoiIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 88,
}];

export const periproceduralMaoiIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: periproceduralMaoiIdentitySources, atoms: periproceduralMaoiIdentityAtoms,
};
