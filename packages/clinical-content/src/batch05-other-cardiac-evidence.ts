import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T16:58:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type IngredientId = 'ING-digoxin' | 'ING-ivabradine' | 'ING-nitroglycerin' | 'ING-isosorbide-dinitrate' | 'ING-isosorbide-mononitrate' | 'ING-ranolazine';

export interface Batch05OtherCardiacIdentityDefinition {
  medicationId:
    | 'MED-digoxin-tablet'
    | 'MED-digoxin-oral-solution'
    | 'MED-digoxin-injection-solution'
    | 'MED-ivabradine-film-coated-tablet'
    | 'MED-ivabradine-oral-solution'
    | 'MED-nitroglycerin-sublingual-tablet'
    | 'MED-nitroglycerin-lingual-spray'
    | 'MED-nitroglycerin-transdermal-patch'
    | 'MED-nitroglycerin-topical-ointment'
    | 'MED-isosorbide-dinitrate-oral-tablet'
    | 'MED-isosorbide-dinitrate-sublingual-tablet'
    | 'MED-isosorbide-mononitrate-er-tablet'
    | 'MED-ranolazine-er-tablet';
  ingredientId: IngredientId;
  genericName: string;
  dosageForm: string;
  route: string;
  evidenceRef: { id: string; version: number };
}

export const batch05OtherCardiacIdentityDefinitions: Batch05OtherCardiacIdentityDefinition[] = [
  { medicationId: 'MED-digoxin-tablet', ingredientId: 'ING-digoxin', genericName: 'digoxin', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-DIGOXIN-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-digoxin-oral-solution', ingredientId: 'ING-digoxin', genericName: 'digoxin', dosageForm: 'SOLUTION', route: 'ORAL', evidenceRef: { id: 'EVD-B5-DIGOXIN-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-digoxin-injection-solution', ingredientId: 'ING-digoxin', genericName: 'digoxin', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS OR INTRAMUSCULAR', evidenceRef: { id: 'EVD-B5-DIGOXIN-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-ivabradine-film-coated-tablet', ingredientId: 'ING-ivabradine', genericName: 'ivabradine', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B5-IVABRADINE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-ivabradine-oral-solution', ingredientId: 'ING-ivabradine', genericName: 'ivabradine', dosageForm: 'SOLUTION', route: 'ORAL', evidenceRef: { id: 'EVD-B5-IVABRADINE-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-nitroglycerin-sublingual-tablet', ingredientId: 'ING-nitroglycerin', genericName: 'nitroglycerin', dosageForm: 'TABLET', route: 'SUBLINGUAL', evidenceRef: { id: 'EVD-B5-NITROGLYCERIN-SL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-nitroglycerin-lingual-spray', ingredientId: 'ING-nitroglycerin', genericName: 'nitroglycerin', dosageForm: 'SPRAY', route: 'LINGUAL', evidenceRef: { id: 'EVD-B5-NITROGLYCERIN-LINGUAL-SPRAY-IDENTITY', version: 1 } },
  { medicationId: 'MED-nitroglycerin-transdermal-patch', ingredientId: 'ING-nitroglycerin', genericName: 'nitroglycerin', dosageForm: 'PATCH', route: 'TRANSDERMAL', evidenceRef: { id: 'EVD-B5-NITROGLYCERIN-PATCH-IDENTITY', version: 1 } },
  { medicationId: 'MED-nitroglycerin-topical-ointment', ingredientId: 'ING-nitroglycerin', genericName: 'nitroglycerin', dosageForm: 'OINTMENT', route: 'TOPICAL', evidenceRef: { id: 'EVD-B5-NITROGLYCERIN-OINTMENT-IDENTITY', version: 1 } },
  { medicationId: 'MED-isosorbide-dinitrate-oral-tablet', ingredientId: 'ING-isosorbide-dinitrate', genericName: 'isosorbide dinitrate', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B5-ISDN-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-isosorbide-dinitrate-sublingual-tablet', ingredientId: 'ING-isosorbide-dinitrate', genericName: 'isosorbide dinitrate', dosageForm: 'TABLET', route: 'SUBLINGUAL', evidenceRef: { id: 'EVD-B5-ISDN-SL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-isosorbide-mononitrate-er-tablet', ingredientId: 'ING-isosorbide-mononitrate', genericName: 'isosorbide mononitrate', dosageForm: 'TABLET, EXTENDED RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-ISMN-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-ranolazine-er-tablet', ingredientId: 'ING-ranolazine', genericName: 'ranolazine', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B5-RANOLAZINE-ER-TABLET-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch05OtherCardiacIdentityDefinition['medicationId'];
  id: string; publisher: string; setId: string; splVersion: number; effectiveDate: string; applicationNumber: string;
}> = [
  { medicationId: 'MED-digoxin-tablet', id: 'SRC-B5-DIGOXIN-AS-SPL1', publisher: 'A-S Medication Solutions; DailyMed', setId: 'ca595f0c-5bf0-4feb-8183-47832ee8c820', splVersion: 1, effectiveDate: '2026-01-29', applicationNumber: 'ANDA214982' },
  { medicationId: 'MED-digoxin-oral-solution', id: 'SRC-B5-DIGOXIN-SOLUTION-HIKMA-SPL18', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '1b7e5c6e-e052-41b0-a4ce-05dfe62faaaf', splVersion: 18, effectiveDate: '2025-04-10', applicationNumber: 'NDA021648' },
  { medicationId: 'MED-digoxin-injection-solution', id: 'SRC-B5-LANOXIN-COVIS-SPL10', publisher: 'Covis Pharma US, Inc.; DailyMed', setId: '9ec84cac-6ecc-43dc-8006-6ccc029e2707', splVersion: 10, effectiveDate: '2025-10-17', applicationNumber: 'NDA009330' },
  { medicationId: 'MED-ivabradine-film-coated-tablet', id: 'SRC-B5-CORLANOR-TABLET-AMGEN-SPL33', publisher: 'Amgen Inc.; DailyMed', setId: '92018a65-38f6-45f7-91d4-a34921b81d0d', splVersion: 33, effectiveDate: '2025-11-10', applicationNumber: 'NDA206143' },
  { medicationId: 'MED-ivabradine-oral-solution', id: 'SRC-B5-CORLANOR-SOLUTION-AMGEN-SPL33', publisher: 'Amgen Inc.; DailyMed', setId: '92018a65-38f6-45f7-91d4-a34921b81d0d', splVersion: 33, effectiveDate: '2025-11-10', applicationNumber: 'NDA209964' },
  { medicationId: 'MED-nitroglycerin-sublingual-tablet', id: 'SRC-B5-NITROSTAT-HENRY-SCHEIN-SPL2', publisher: 'Henry Schein, Inc.; DailyMed', setId: '5265648f-3062-48a2-a4e3-fea1207807a8', splVersion: 2, effectiveDate: '2025-11-06', applicationNumber: 'NDA021134' },
  { medicationId: 'MED-nitroglycerin-lingual-spray', id: 'SRC-B5-NITROGLYCERIN-SPRAY-PADAGIS-SPL8', publisher: 'Padagis Israel Pharmaceuticals Ltd.; DailyMed', setId: 'e7bbeff1-e4f1-43a6-a1b3-a8c3dcae817d', splVersion: 8, effectiveDate: '2022-09-01', applicationNumber: 'ANDA091496' },
  { medicationId: 'MED-nitroglycerin-transdermal-patch', id: 'SRC-B5-NITROGLYCERIN-PATCH-MYLAN-SPL9', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', setId: 'e98a2692-1cb9-4994-98d8-1d8d9ef1a256', splVersion: 9, effectiveDate: '2014-11-03', applicationNumber: 'ANDA074559' },
  { medicationId: 'MED-nitroglycerin-topical-ointment', id: 'SRC-B5-NITROBID-SAVAGE-SPL15', publisher: 'Savage Laboratories, a division of Fougera Pharmaceuticals, LLC; DailyMed', setId: 'e464e9bb-48e8-4b9f-9fff-e220cfbac0c5', splVersion: 15, effectiveDate: '2026-01-28', applicationNumber: 'ANDA087355' },
  { medicationId: 'MED-isosorbide-dinitrate-oral-tablet', id: 'SRC-B5-ISDN-ADVAGEN-SPL3', publisher: 'Advagen Pharma Ltd.; DailyMed', setId: 'b166eb5b-bad8-4663-9c05-1c43539dab2c', splVersion: 3, effectiveDate: '2026-01-05', applicationNumber: 'ANDA215723' },
  { medicationId: 'MED-isosorbide-dinitrate-sublingual-tablet', id: 'SRC-B5-ISDN-SL-WESTWARD-SPL6', publisher: 'West-ward Pharmaceutical Corp.; DailyMed', setId: '44ede034-1fa1-4993-9aa5-49e04fada541', splVersion: 6, effectiveDate: '2012-05-18', applicationNumber: 'ANDA086055' },
  { medicationId: 'MED-isosorbide-mononitrate-er-tablet', id: 'SRC-B5-ISMN-ER-APHENA-SPL3', publisher: 'Aphena Pharma Solutions - Tennessee, LLC; DailyMed', setId: 'a707727c-819f-43ea-89f3-2a2ae1cb9edf', splVersion: 3, effectiveDate: '2019-12-24', applicationNumber: 'ANDA075155' },
  { medicationId: 'MED-ranolazine-er-tablet', id: 'SRC-B5-RANOLAZINE-GLENMARK-SPL5', publisher: 'Glenmark Pharmaceuticals Inc., USA; DailyMed', setId: '0cf58732-c242-49b0-8e3f-248778b4458d', splVersion: 5, effectiveDate: '2026-01-23', applicationNumber: 'ANDA211082' },
];
const definitionByMedication = new Map(batch05OtherCardiacIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch05OtherCardiacIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, splVersion: source.splVersion, applicationNumber: source.applicationNumber,
      route: definition.route, dosageForm: definition.dosageForm,
      representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false,
      routeConversionAuthorized: false, formulationConversionAuthorized: false,
      clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch05OtherCardiacIdentityAtoms: EvidenceAtom[] = batch05OtherCardiacIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} medication identity.`,
  normalizedTopic: 'batch05-other-cardiac-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: {
    medicationIds: [product.medicationId], ingredientIds: [product.ingredientId],
    drugClassIds: [product.ingredientId === 'ING-digoxin' ? 'CLS-cardiac-glycoside' : product.ingredientId === 'ING-ivabradine' ? 'CLS-hcn-channel-blocker' : 'CLS-antianginal'],
    contextTags: ['route-form-identity', 'clinical-review-only'],
  },
  locator: { section: 'Drug Label Information; Description; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, release profile where stated, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or current commercial availability.',
    'Digoxin oral tablet, oral solution, and injection solution remain distinct; ivabradine tablet and oral solution remain distinct.',
    'Nitroglycerin sublingual tablet, lingual spray, transdermal patch, and topical ointment remain distinct route/form identities; no route or formulation conversion is authorized.',
    'Isosorbide dinitrate oral and sublingual tablets remain distinct; isosorbide mononitrate extended-release and ranolazine extended-release wording must remain explicit.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, substitution, route conversion, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} ${product.route.toLowerCase()} identity`, summary: 'Direct DailyMed provenance supports this route/form-specific medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'cardiovascular', 'route-form-identity'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch05OtherCardiacReviewRules: ClinicalRule[] = [{
  id: 'RULE-B5-OTHER-CARDIAC-PRODUCT-REVIEW-001', version: 1,
  name: 'Explicit other-cardiac product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch05OtherCardiacIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch05OtherCardiacIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 60,
}];

export const batch05OtherCardiacIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: batch05OtherCardiacIdentitySources, atoms: batch05OtherCardiacIdentityAtoms,
};
