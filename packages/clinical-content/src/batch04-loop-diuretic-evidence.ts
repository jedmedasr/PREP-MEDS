import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T09:41:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04LoopDiureticIdentityDefinition {
  medicationId:
    | 'MED-furosemide-tablet'
    | 'MED-furosemide-oral-solution'
    | 'MED-furosemide-injection'
    | 'MED-furosemide-furoscix-readyflow'
    | 'MED-furosemide-furoscix-on-body-infusor'
    | 'MED-torsemide-tablet'
    | 'MED-torsemide-demadex-injection'
    | 'MED-bumetanide-tablet'
    | 'MED-bumetanide-injection'
    | 'MED-bumetanide-enbumyst-nasal-spray';
  ingredientId: 'ING-furosemide' | 'ING-torsemide' | 'ING-bumetanide';
  genericName: 'furosemide' | 'torsemide' | 'bumetanide';
  brandName?: 'FUROSCIX' | 'DEMADEX' | 'ENBUMYST';
  dosageForm: 'TABLET' | 'SOLUTION' | 'INJECTION, SOLUTION' | 'SPRAY';
  route: 'ORAL' | 'INTRAVENOUS' | 'SUBCUTANEOUS' | 'INTRAVENOUS, INTRAMUSCULAR' | 'NASAL';
  device?: 'READYFLOW AUTOINJECTOR' | 'ON-BODY INFUSOR';
  historicalLabel?: boolean;
  evidenceRef: { id: string; version: number };
}

export const batch04LoopDiureticIdentityDefinitions: Batch04LoopDiureticIdentityDefinition[] = [
  { medicationId: 'MED-furosemide-tablet', ingredientId: 'ING-furosemide', genericName: 'furosemide', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-FUROSEMIDE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-furosemide-oral-solution', ingredientId: 'ING-furosemide', genericName: 'furosemide', dosageForm: 'SOLUTION', route: 'ORAL', evidenceRef: { id: 'EVD-B4-FUROSEMIDE-ORAL-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-furosemide-injection', ingredientId: 'ING-furosemide', genericName: 'furosemide', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', evidenceRef: { id: 'EVD-B4-FUROSEMIDE-IV-IDENTITY', version: 1 } },
  { medicationId: 'MED-furosemide-furoscix-readyflow', ingredientId: 'ING-furosemide', genericName: 'furosemide', brandName: 'FUROSCIX', dosageForm: 'INJECTION, SOLUTION', route: 'SUBCUTANEOUS', device: 'READYFLOW AUTOINJECTOR', evidenceRef: { id: 'EVD-B4-FUROSCIX-READYFLOW-IDENTITY', version: 1 } },
  { medicationId: 'MED-furosemide-furoscix-on-body-infusor', ingredientId: 'ING-furosemide', genericName: 'furosemide', brandName: 'FUROSCIX', dosageForm: 'INJECTION, SOLUTION', route: 'SUBCUTANEOUS', device: 'ON-BODY INFUSOR', evidenceRef: { id: 'EVD-B4-FUROSCIX-ON-BODY-INFUSOR-IDENTITY', version: 1 } },
  { medicationId: 'MED-torsemide-tablet', ingredientId: 'ING-torsemide', genericName: 'torsemide', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-TORSEMIDE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-torsemide-demadex-injection', ingredientId: 'ING-torsemide', genericName: 'torsemide', brandName: 'DEMADEX', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS', historicalLabel: true, evidenceRef: { id: 'EVD-B4-DEMADEX-IV-HISTORICAL-IDENTITY', version: 1 } },
  { medicationId: 'MED-bumetanide-tablet', ingredientId: 'ING-bumetanide', genericName: 'bumetanide', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-BUMETANIDE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-bumetanide-injection', ingredientId: 'ING-bumetanide', genericName: 'bumetanide', dosageForm: 'INJECTION, SOLUTION', route: 'INTRAVENOUS, INTRAMUSCULAR', evidenceRef: { id: 'EVD-B4-BUMETANIDE-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-bumetanide-enbumyst-nasal-spray', ingredientId: 'ING-bumetanide', genericName: 'bumetanide', brandName: 'ENBUMYST', dosageForm: 'SPRAY', route: 'NASAL', evidenceRef: { id: 'EVD-B4-ENBUMYST-NASAL-SPRAY-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04LoopDiureticIdentityDefinition['medicationId'];
  id: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  applicationNumber: string | null;
}> = [
  { medicationId: 'MED-furosemide-tablet', id: 'SRC-B4-FUROSEMIDE-HIKMA-TABLET-SPL19', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '9e493331-dddd-496e-abf8-61747fb67aba', splVersion: 19, effectiveDate: '2025-11-03', applicationNumber: 'NDA018823; ANDA070086' },
  { medicationId: 'MED-furosemide-oral-solution', id: 'SRC-B4-FUROSEMIDE-HIKMA-ORAL-SOLUTION-SPL19', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '9e493331-dddd-496e-abf8-61747fb67aba', splVersion: 19, effectiveDate: '2025-11-03', applicationNumber: 'ANDA070433; ANDA070434' },
  { medicationId: 'MED-furosemide-injection', id: 'SRC-B4-FUROSEMIDE-BAXTER-INJECTION-SPL19', publisher: 'Baxter Healthcare Corporation; DailyMed', setId: 'c71371a7-75c5-45b8-b762-8d782d4c71bc', splVersion: 19, effectiveDate: '2025-06-30', applicationNumber: 'ANDA202747' },
  { medicationId: 'MED-furosemide-furoscix-readyflow', id: 'SRC-B4-FUROSCIX-READYFLOW-SPL18', publisher: 'scPharmaceuticals Inc.; DailyMed', setId: 'eac958dd-8d43-e44e-e053-2995a90a4d5e', splVersion: 18, effectiveDate: '2026-07-31', applicationNumber: 'NDA209988' },
  { medicationId: 'MED-furosemide-furoscix-on-body-infusor', id: 'SRC-B4-FUROSCIX-ON-BODY-INFUSOR-SPL18', publisher: 'scPharmaceuticals Inc.; DailyMed', setId: 'eac958dd-8d43-e44e-e053-2995a90a4d5e', splVersion: 18, effectiveDate: '2026-07-31', applicationNumber: 'NDA209988' },
  { medicationId: 'MED-torsemide-tablet', id: 'SRC-B4-TORSEMIDE-TEVA-TABLET-SPL11', publisher: 'Teva Pharmaceuticals USA, Inc.; DailyMed', setId: '8a95cbdb-0601-47a5-9b3a-0c3b0629ceb9', splVersion: 11, effectiveDate: '2017-02-28', applicationNumber: 'ANDA076346' },
  { medicationId: 'MED-torsemide-demadex-injection', id: 'SRC-B4-DEMADEX-ROCHE-HISTORICAL-SPL1', publisher: 'Roche Pharmaceuticals; DailyMed', setId: 'cf288ad5-d4e7-4b0b-bfd0-41c5327e6984', splVersion: 1, effectiveDate: '2007-02-06', applicationNumber: null },
  { medicationId: 'MED-bumetanide-tablet', id: 'SRC-B4-BUMETANIDE-SANDOZ-TABLET-SPL21', publisher: 'Sandoz Inc.; DailyMed', setId: '05cb961d-ac33-4bcf-b04e-411e496c43c1', splVersion: 21, effectiveDate: '2023-06-30', applicationNumber: 'ANDA074700' },
  { medicationId: 'MED-bumetanide-injection', id: 'SRC-B4-BUMETANIDE-HIKMA-INJECTION-SPL6', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '681b5e9d-e2c7-4f29-aaad-e06d4a528c11', splVersion: 6, effectiveDate: '2026-07-08', applicationNumber: 'ANDA079196' },
  { medicationId: 'MED-bumetanide-enbumyst-nasal-spray', id: 'SRC-B4-ENBUMYST-CORSTASIS-SPL4', publisher: 'Corstasis Therapeutics Inc.; DailyMed', setId: 'd6f752c5-d2bd-4f77-9611-ca2110066d1f', splVersion: 4, effectiveDate: '2026-08-27', applicationNumber: 'NDA219500' },
];

const definitionByMedication = new Map(batch04LoopDiureticIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04LoopDiureticIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title: `${definition.brandName ?? definition.genericName} ${definition.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher,
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}${source.applicationNumber ? `; ${source.applicationNumber}` : ''}`,
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId,
      splVersion: source.splVersion,
      applicationNumber: source.applicationNumber,
      route: definition.route,
      dosageForm: definition.dosageForm,
      device: definition.device ?? null,
      historicalLabel: definition.historicalLabel ?? false,
      representativeIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      routeConversionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});

const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04LoopDiureticIdentityAtoms: EvidenceAtom[] = batch04LoopDiureticIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.brandName ?? product.genericName} as a ${product.route.toLowerCase().replaceAll('_', ' ')} ${product.dosageForm.toLowerCase()} loop-diuretic identity${product.device ? ` using the ${product.device.toLowerCase()} presentation` : ''}.`,
  normalizedTopic: 'batch04-loop-diuretic-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-diuretic', 'CLS-loop-diuretic'], contextTags: ['product-identity', 'route-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates product, route, formulation, device when applicable, and regulatory-label provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Oral, intravenous, intramuscular, subcutaneous-device, and nasal products are distinct reconciliation identities; PREP-MEDS does not authorize route conversion or substitution.',
    'DailyMed/FDA listing, including historical labeling, does not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, or restart timing is supported by this identity evidence.',
  ],
  retrieval: {
    title: `${product.brandName ?? product.genericName} route/formulation identity`,
    summary: `Direct DailyMed provenance supports this ${product.genericName} route/formulation as a distinct medication-reconciliation identity.`,
    keywords: [product.brandName ?? product.genericName, product.genericName, 'loop diuretic', product.route, product.dosageForm, product.device ?? 'no device'],
    concepts: ['medication-identity', 'loop-diuretic', 'route-identity', 'formulation-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04LoopDiureticMarketingStatusAtoms: EvidenceAtom[] = [{
  id: 'EVD-B4-DEMADEX-IV-HISTORICAL-MARKETING-STATUS',
  version: 1,
  source: { id: 'SRC-B4-DEMADEX-ROCHE-HISTORICAL-SPL1', version: 1 },
  claim: 'The archived DEMADEX DailyMed label includes an intravenous torsemide injection presentation with inactivated NDC records.',
  normalizedTopic: 'batch04-demadex-injection-historical-marketing-status',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: ['MED-torsemide-demadex-injection'], ingredientIds: ['ING-torsemide'], contextTags: ['historical-label', 'inactivated-ndc', 'availability-not-inferred'] },
  locator: { section: 'Product Information; Marketing Information' },
  limitations: [
    'The historical label is retained only to prevent route collapse during reconciliation.',
    'Inactivated NDC records do not prove that no product remains in patient possession, and PREP-MEDS makes no current availability assertion.',
  ],
  retrieval: {
    title: 'Historical DEMADEX intravenous identity',
    summary: 'Archived DailyMed provenance preserves intravenous torsemide as a historical route-specific identity without asserting availability.',
    keywords: ['DEMADEX', 'torsemide', 'intravenous', 'historical', 'inactivated NDC'],
    concepts: ['historical-product', 'route-identity', 'market-status-provenance'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}];

export const batch04LoopDiureticReviewRules: ClinicalRule[] = [{
  id: 'RULE-B4-LOOP-DIURETIC-PRODUCT-REVIEW-001',
  version: 1,
  name: 'Explicit loop-diuretic product requires clinician review pending procedure policy adjudication',
  scope: { medicationIds: batch04LoopDiureticIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [],
  disposition: 'CLINICIAN_REVIEW_REQUIRED',
  restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: batch04LoopDiureticIdentityDefinitions.map((product) => product.evidenceRef),
  status: 'TECHNICALLY_TESTED',
  priority: 60,
}];

export const batch04LoopDiureticIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04LoopDiureticIdentitySources,
  atoms: [...batch04LoopDiureticIdentityAtoms, ...batch04LoopDiureticMarketingStatusAtoms],
};
