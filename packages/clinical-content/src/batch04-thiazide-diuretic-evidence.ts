import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T09:02:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04ThiazideDiureticIdentityDefinition {
  medicationId: 'MED-hydrochlorothiazide' | 'MED-chlorthalidone' | 'MED-indapamide';
  ingredientId: 'ING-hydrochlorothiazide' | 'ING-chlorthalidone' | 'ING-indapamide';
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, FILM COATED';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch04ThiazideDiureticIdentityDefinitions: Batch04ThiazideDiureticIdentityDefinition[] = [
  { medicationId: 'MED-hydrochlorothiazide', ingredientId: 'ING-hydrochlorothiazide', genericName: 'hydrochlorothiazide', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-HYDROCHLOROTHIAZIDE-IDENTITY', version: 1 } },
  { medicationId: 'MED-chlorthalidone', ingredientId: 'ING-chlorthalidone', genericName: 'chlorthalidone', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-B4-CHLORTHALIDONE-IDENTITY', version: 1 } },
  { medicationId: 'MED-indapamide', ingredientId: 'ING-indapamide', genericName: 'indapamide', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', evidenceRef: { id: 'EVD-B4-INDAPAMIDE-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04ThiazideDiureticIdentityDefinition['medicationId'];
  id: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  applicationNumber: string;
}> = [
  { medicationId: 'MED-hydrochlorothiazide', id: 'SRC-B4-HCTZ-TEVA-SPL18', publisher: 'Teva Pharmaceuticals USA, Inc.; DailyMed', setId: 'e2270db4-2930-4ec5-ac96-2b4542aed367', splVersion: 18, effectiveDate: '2024-07-01', applicationNumber: 'ANDA083177' },
  { medicationId: 'MED-chlorthalidone', id: 'SRC-B4-CHLORTHALIDONE-AMNEAL-SPL13', publisher: 'Amneal Pharmaceuticals LLC; DailyMed', setId: 'c4c1bfe5-b5c8-43c0-9428-62337095b2bd', splVersion: 13, effectiveDate: '2026-06-11', applicationNumber: 'ANDA207204' },
  { medicationId: 'MED-indapamide', id: 'SRC-B4-INDAPAMIDE-ANI-SPL4', publisher: 'ANI Pharmaceuticals, Inc.; DailyMed', setId: 'deb83f97-6c61-4a09-bed6-18dcf1183405', splVersion: 4, effectiveDate: '2025-09-12', applicationNumber: 'ANDA074299' },
];

const definitionByMedication = new Map(batch04ThiazideDiureticIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04ThiazideDiureticIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title: `${definition.genericName.toUpperCase()} ${definition.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
    publisher: source.publisher,
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; SPL version ${source.splVersion}; ${source.applicationNumber}`,
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
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});

const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04ThiazideDiureticIdentityAtoms: EvidenceAtom[] = batch04ThiazideDiureticIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a single-ingredient oral ${product.dosageForm.toLowerCase()} diuretic identity.`,
  normalizedTopic: 'batch04-thiazide-diuretic-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-diuretic'], contextTags: ['generic-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'This source authenticates generic ingredient, route, dosage form, SETID, SPL, effective date, and application provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'DailyMed/FDA listing does not establish current commercial inventory or authorize substitution.',
    'This identity evidence does not authorize an autonomous endoscopy continuation, withholding, dose-adjustment, or restart instruction.',
  ],
  retrieval: {
    title: `${product.genericName} diuretic identity`,
    summary: `Direct DailyMed provenance supports ${product.genericName} as an oral diuretic identity for medication reconciliation.`,
    keywords: [product.genericName, 'diuretic', product.dosageForm],
    concepts: ['medication-identity', 'diuretic', 'route-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04ThiazideDiureticReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-THIAZIDE-DIURETIC-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Explicit thiazide/thiazide-like diuretic product requires clinician review pending procedure policy adjudication',
    scope: { medicationIds: batch04ThiazideDiureticIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: batch04ThiazideDiureticIdentityDefinitions.map((product) => product.evidenceRef),
    status: 'TECHNICALLY_TESTED',
    priority: 60,
  },
];

export const batch04ThiazideDiureticIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04ThiazideDiureticIdentitySources,
  atoms: batch04ThiazideDiureticIdentityAtoms,
};
