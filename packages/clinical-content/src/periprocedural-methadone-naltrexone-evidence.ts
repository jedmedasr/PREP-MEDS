import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T21:12:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-methadone-oral-tablet'
  | 'MED-methadone-oral-concentrate'
  | 'MED-naltrexone-film-coated-oral-tablet'
  | 'MED-vivitrol-naltrexone-er-im-injection';
type IngredientId = 'ING-methadone' | 'ING-naltrexone';

export interface PeriproceduralMethadoneNaltrexoneIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: string;
  route: string;
  indicationContext: string;
  evidenceRef: { id: string; version: number };
}

export const periproceduralMethadoneNaltrexoneIdentityDefinitions: PeriproceduralMethadoneNaltrexoneIdentityDefinition[] = [
  { medicationId: 'MED-methadone-oral-tablet', ingredientId: 'ING-methadone', genericName: 'methadone', dosageForm: 'TABLET', route: 'ORAL', indicationContext: 'PAIN OR OPIOID-ADDICTION TREATMENT', evidenceRef: { id: 'EVD-METHADONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-methadone-oral-concentrate', ingredientId: 'ING-methadone', genericName: 'methadone', dosageForm: 'CONCENTRATE', route: 'ORAL', indicationContext: 'OPIOID-ADDICTION DETOXIFICATION OR MAINTENANCE', evidenceRef: { id: 'EVD-METHADONE-ORAL-CONCENTRATE-IDENTITY', version: 1 } },
  { medicationId: 'MED-naltrexone-film-coated-oral-tablet', ingredientId: 'ING-naltrexone', genericName: 'naltrexone', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', indicationContext: 'ALCOHOL DEPENDENCE OR OPIOID-EFFECT BLOCKADE', evidenceRef: { id: 'EVD-NALTREXONE-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-vivitrol-naltrexone-er-im-injection', ingredientId: 'ING-naltrexone', genericName: 'naltrexone', dosageForm: 'INJECTION, POWDER, FOR SUSPENSION, EXTENDED RELEASE', route: 'INTRAMUSCULAR', indicationContext: 'ALCOHOL DEPENDENCE OR POST-DETOXIFICATION OPIOID-RELAPSE PREVENTION', evidenceRef: { id: 'EVD-VIVITROL-ER-IM-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-methadone-oral-tablet', id: 'SRC-METHADONE-TABLET-STAT-ANDA040517', publisher: 'STAT Rx USA LLC; DailyMed', setId: 'a36705c4-867f-41f1-94c9-78b8b31836ce', effectiveDate: '2009-05-19', applicationNumber: 'ANDA040517' },
  { medicationId: 'MED-methadone-oral-concentrate', id: 'SRC-METHADONE-CONCENTRATE-HIKMA-ANDA089897', publisher: 'Hikma Pharmaceuticals USA; DailyMed', setId: 'e72841bf-364b-49b1-8e69-7e26ddcd2657', effectiveDate: '2010-06-23', applicationNumber: 'ANDA089897' },
  { medicationId: 'MED-naltrexone-film-coated-oral-tablet', id: 'SRC-NALTREXONE-TABLET-ACCORD-ANDA091205', publisher: 'Accord Healthcare, Inc.; DailyMed', setId: '49aa3d6d-2270-4615-aafa-b440859ab870', effectiveDate: '2012-01-18', applicationNumber: 'ANDA091205' },
  { medicationId: 'MED-vivitrol-naltrexone-er-im-injection', id: 'SRC-VIVITROL-IM-ALKERMES-NDA021897', publisher: 'Alkermes, Inc.; DailyMed', setId: 'cd11c435-b0f0-4bb9-ae78-60f101f3703f', effectiveDate: '2006-06-13', applicationNumber: 'NDA021897' },
];
const definitionByMedication = new Map(periproceduralMethadoneNaltrexoneIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const periproceduralMethadoneNaltrexoneIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      indicationContext: definition.indicationContext, representativeIdentityOnly: true, marketAvailabilityAsserted: false,
      substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const periproceduralMethadoneNaltrexoneIdentityAtoms: EvidenceAtom[] = periproceduralMethadoneNaltrexoneIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} identity with the stated label indication context.`,
  normalizedTopic: 'periprocedural-methadone-naltrexone-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: [product.ingredientId === 'ING-methadone' ? 'CLS-opioid-agonist' : 'CLS-opioid-antagonist'], contextTags: ['route-form-indication-identity', 'clinical-review-only'] },
  locator: { section: 'Indications and Usage; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release profile where stated, and label indication context only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or current commercial availability.',
    'Methadone tablet and oral concentrate remain distinct; methadone indication, maintenance status, opioid tolerance/dependence, QT risk, concomitant sedatives/opioids, and expected procedural pain require accountable clinician review.',
    'Naltrexone oral tablet and VIVITROL extended-release intramuscular injection remain distinct; indication, current opioid exposure, detoxification status, opioid blockade, and emergency analgesia planning require accountable clinician review.',
    'No autonomous continuation, interruption, taper, dose conversion, substitution, sedation plan, analgesia plan, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} ${product.route.toLowerCase()} identity`, summary: 'Direct DailyMed provenance supports this route/form/indication-specific medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'oud-or-opioid-context', 'route-form-indication-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralMethadoneNaltrexoneReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-METHADONE-NALTREXONE-REVIEW-001', version: 1,
  name: 'Explicit methadone or naltrexone product requires clinician review pending anesthesia and local-policy adjudication',
  scope: { medicationIds: periproceduralMethadoneNaltrexoneIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: periproceduralMethadoneNaltrexoneIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 86,
}];

export const periproceduralMethadoneNaltrexoneIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: periproceduralMethadoneNaltrexoneIdentitySources, atoms: periproceduralMethadoneNaltrexoneIdentityAtoms,
};
