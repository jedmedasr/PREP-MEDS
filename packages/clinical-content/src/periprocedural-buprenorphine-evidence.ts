import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T20:52:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-buprenorphine' | 'ING-naloxone';

export interface PeriproceduralBuprenorphineIdentityDefinition {
  medicationId:
    | 'MED-buprenorphine-sublingual-tablet'
    | 'MED-suboxone-buprenorphine-naloxone-film'
    | 'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet'
    | 'MED-belbuca-buprenorphine-buccal-film'
    | 'MED-butrans-buprenorphine-er-transdermal-patch'
    | 'MED-sublocade-buprenorphine-er-subcutaneous-injection';
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: string;
  route: string;
  indicationContext: 'OPIOID_USE_DISORDER' | 'SEVERE_PERSISTENT_PAIN';
  evidenceRef: { id: string; version: number };
}

export const periproceduralBuprenorphineIdentityDefinitions: PeriproceduralBuprenorphineIdentityDefinition[] = [
  { medicationId: 'MED-buprenorphine-sublingual-tablet', ingredientIds: ['ING-buprenorphine'], genericName: 'buprenorphine', dosageForm: 'TABLET', route: 'SUBLINGUAL', indicationContext: 'OPIOID_USE_DISORDER', evidenceRef: { id: 'EVD-BUPRENORPHINE-SL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-suboxone-buprenorphine-naloxone-film', ingredientIds: ['ING-buprenorphine', 'ING-naloxone'], genericName: 'buprenorphine and naloxone', dosageForm: 'FILM, SOLUBLE', route: 'SUBLINGUAL OR BUCCAL', indicationContext: 'OPIOID_USE_DISORDER', evidenceRef: { id: 'EVD-SUBOXONE-FILM-IDENTITY', version: 1 } },
  { medicationId: 'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet', ingredientIds: ['ING-buprenorphine', 'ING-naloxone'], genericName: 'buprenorphine and naloxone', dosageForm: 'TABLET, ORALLY DISINTEGRATING', route: 'SUBLINGUAL', indicationContext: 'OPIOID_USE_DISORDER', evidenceRef: { id: 'EVD-ZUBSOLV-SL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-belbuca-buprenorphine-buccal-film', ingredientIds: ['ING-buprenorphine'], genericName: 'buprenorphine', dosageForm: 'FILM, SOLUBLE', route: 'BUCCAL', indicationContext: 'SEVERE_PERSISTENT_PAIN', evidenceRef: { id: 'EVD-BELBUCA-BUCCAL-FILM-IDENTITY', version: 1 } },
  { medicationId: 'MED-butrans-buprenorphine-er-transdermal-patch', ingredientIds: ['ING-buprenorphine'], genericName: 'buprenorphine', dosageForm: 'PATCH, EXTENDED RELEASE', route: 'TRANSDERMAL', indicationContext: 'SEVERE_PERSISTENT_PAIN', evidenceRef: { id: 'EVD-BUTRANS-ER-PATCH-IDENTITY', version: 1 } },
  { medicationId: 'MED-sublocade-buprenorphine-er-subcutaneous-injection', ingredientIds: ['ING-buprenorphine'], genericName: 'buprenorphine', dosageForm: 'INJECTION, EXTENDED RELEASE SOLUTION', route: 'SUBCUTANEOUS', indicationContext: 'OPIOID_USE_DISORDER', evidenceRef: { id: 'EVD-SUBLOCADE-ER-SC-INJECTION-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: PeriproceduralBuprenorphineIdentityDefinition['medicationId'];
  id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string;
}> = [
  { medicationId: 'MED-buprenorphine-sublingual-tablet', id: 'SRC-BUPRENORPHINE-SL-SUN-ANDA201760', publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed', setId: '9fd1f18f-0b0f-4059-b603-19ecbf0ed63a', effectiveDate: '2016-02-17', applicationNumber: 'ANDA201760' },
  { medicationId: 'MED-suboxone-buprenorphine-naloxone-film', id: 'SRC-SUBOXONE-FILM-INDIVIOR-NDA022410', publisher: 'Indivior Inc.; DailyMed', setId: '8a5edcf9-828c-4f97-b671-268ab13a8ecd', effectiveDate: '2012-08-24', applicationNumber: 'NDA022410' },
  { medicationId: 'MED-zubsolv-buprenorphine-naloxone-sublingual-tablet', id: 'SRC-ZUBSOLV-SL-OREXO-NDA204242', publisher: 'Orexo US, Inc.; DailyMed', setId: '5f5cfcfe-d52b-49e6-8fe4-550477332dd2', effectiveDate: '2013-07-04', applicationNumber: 'NDA204242' },
  { medicationId: 'MED-belbuca-buprenorphine-buccal-film', id: 'SRC-BELBUCA-BUCCAL-BDSI-NDA207932', publisher: 'BioDelivery Sciences International Inc.; DailyMed', setId: 'bc2b7a3d-72cf-497c-95b0-ba2b71f63c64', effectiveDate: '2017-08-21', applicationNumber: 'NDA207932' },
  { medicationId: 'MED-butrans-buprenorphine-er-transdermal-patch', id: 'SRC-BUTRANS-PATCH-KNOA-NDA021306', publisher: 'Knoa Pharma LLC; DailyMed', setId: '794aa355-66de-41b8-aedf-f2c40f6bc664', effectiveDate: '2011-02-14', applicationNumber: 'NDA021306' },
  { medicationId: 'MED-sublocade-buprenorphine-er-subcutaneous-injection', id: 'SRC-SUBLOCADE-SC-INDIVIOR-NDA209819', publisher: 'Indivior Inc.; DailyMed', setId: '6189fb21-9432-45f8-8481-0bfaf3ccde95', effectiveDate: '2018-02-26', applicationNumber: 'NDA209819' },
];
const definitionByMedication = new Map(periproceduralBuprenorphineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const periproceduralBuprenorphineIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber,
      route: definition.route, dosageForm: definition.dosageForm, indicationContext: definition.indicationContext,
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const periproceduralBuprenorphineIdentityAtoms: EvidenceAtom[] = periproceduralBuprenorphineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} medication identity in the labeled ${product.indicationContext === 'OPIOID_USE_DISORDER' ? 'opioid-use-disorder' : 'severe-persistent-pain'} context.`,
  normalizedTopic: 'periprocedural-buprenorphine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-buprenorphine-therapy'], contextTags: ['route-form-indication-identity', 'clinical-review-only'] },
  locator: { section: 'Indications and Usage; Dosage Forms and Strengths; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates the labeled ingredient combination, route, dosage form, release profile where stated, and indication context only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or current commercial availability.',
    'Bare buprenorphine remains ambiguous across sublingual, buccal, transdermal, and extended-release subcutaneous products and across opioid-use-disorder versus pain contexts.',
    'Buprenorphine/naloxone film and tablet remain whole-product combination identities; no substitution, dose equivalence, route conversion, or formulation conversion is authorized.',
    'Periprocedural management depends on indication, current regimen, opioid tolerance or dependence, concomitant sedatives or opioids, expected procedural pain, anesthesia plan, and accountable local policy.',
    'No autonomous continuation, interruption, taper, dose conversion, bridging, rescue analgesia, sedation plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} ${product.route.toLowerCase()} identity`, summary: 'Direct DailyMed provenance supports this route/form/indication-specific medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm, product.indicationContext], concepts: ['medication-identity', 'buprenorphine', 'route-form-indication-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralBuprenorphineReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-BUPRENORPHINE-REVIEW-001', version: 1,
  name: 'Explicit buprenorphine product requires clinician review pending anesthesia and local-policy adjudication',
  scope: { medicationIds: periproceduralBuprenorphineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralBuprenorphineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 85,
}];

export const periproceduralBuprenorphineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: periproceduralBuprenorphineIdentitySources, atoms: periproceduralBuprenorphineIdentityAtoms,
};
