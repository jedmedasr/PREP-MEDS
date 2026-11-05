import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T08:46:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04NonDhpCcbIdentityDefinition {
  medicationId:
    | 'MED-diltiazem-tablet'
    | 'MED-diltiazem-er-capsule-twice-daily'
    | 'MED-diltiazem-cartia-xt-er-capsule-once-daily'
    | 'MED-diltiazem-er-tablet-once-daily'
    | 'MED-verapamil-tablet'
    | 'MED-verapamil-er-tablet'
    | 'MED-verapamil-verelan-pm-er-capsule';
  ingredientId: 'ING-diltiazem' | 'ING-verapamil';
  genericName: string;
  brandName?: 'Cartia XT' | 'Verelan PM';
  dosageForm:
    | 'TABLET'
    | 'TABLET, FILM COATED'
    | 'TABLET, EXTENDED RELEASE'
    | 'TABLET, FILM COATED, EXTENDED RELEASE'
    | 'CAPSULE, EXTENDED RELEASE';
  releaseForm: 'STANDARD' | 'EXTENDED_RELEASE';
  releaseProfile?: 'TWICE_DAILY' | 'ONCE_DAILY' | 'CONTROLLED_ONSET_BEDTIME';
  route: 'ORAL';
  historicalMarketingEndDate?: string;
  evidenceRef: { id: string; version: number };
}

export const batch04NonDhpCcbIdentityDefinitions: Batch04NonDhpCcbIdentityDefinition[] = [
  { medicationId: 'MED-diltiazem-tablet', ingredientId: 'ING-diltiazem', genericName: 'diltiazem hydrochloride', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-DILTIAZEM-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-diltiazem-er-capsule-twice-daily', ingredientId: 'ING-diltiazem', genericName: 'diltiazem hydrochloride', dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', releaseProfile: 'TWICE_DAILY', route: 'ORAL', evidenceRef: { id: 'EVD-B4-DILTIAZEM-ER-CAPSULE-BID-IDENTITY', version: 1 } },
  { medicationId: 'MED-diltiazem-cartia-xt-er-capsule-once-daily', ingredientId: 'ING-diltiazem', genericName: 'diltiazem hydrochloride', brandName: 'Cartia XT', dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', releaseProfile: 'ONCE_DAILY', route: 'ORAL', evidenceRef: { id: 'EVD-B4-CARTIA-XT-IDENTITY', version: 1 } },
  { medicationId: 'MED-diltiazem-er-tablet-once-daily', ingredientId: 'ING-diltiazem', genericName: 'diltiazem hydrochloride', dosageForm: 'TABLET, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', releaseProfile: 'ONCE_DAILY', route: 'ORAL', evidenceRef: { id: 'EVD-B4-DILTIAZEM-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-verapamil-tablet', ingredientId: 'ING-verapamil', genericName: 'verapamil hydrochloride', dosageForm: 'TABLET, FILM COATED', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-VERAPAMIL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-verapamil-er-tablet', ingredientId: 'ING-verapamil', genericName: 'verapamil hydrochloride', dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B4-VERAPAMIL-ER-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-verapamil-verelan-pm-er-capsule', ingredientId: 'ING-verapamil', genericName: 'verapamil hydrochloride', brandName: 'Verelan PM', dosageForm: 'CAPSULE, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', releaseProfile: 'CONTROLLED_ONSET_BEDTIME', route: 'ORAL', historicalMarketingEndDate: '2026-05-31', evidenceRef: { id: 'EVD-B4-VERELAN-PM-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04NonDhpCcbIdentityDefinition['medicationId'];
  id: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  applicationNumber: string;
}> = [
  { medicationId: 'MED-diltiazem-tablet', id: 'SRC-B4-DILTIAZEM-ZYDUS-TABLET-SPL1', publisher: 'Zydus Lifesciences Limited; DailyMed', setId: '8329d0ac-d68c-48d2-9cbc-e1a1b60192d9', splVersion: 1, effectiveDate: '2026-05-01', applicationNumber: 'ANDA219253' },
  { medicationId: 'MED-diltiazem-er-capsule-twice-daily', id: 'SRC-B4-DILTIAZEM-MYLAN-ER-CAPSULE-SPL13', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', setId: 'ec7e93b8-666c-4d2f-8d08-07931e09f748', splVersion: 13, effectiveDate: '2025-11-27', applicationNumber: 'ANDA074910' },
  { medicationId: 'MED-diltiazem-cartia-xt-er-capsule-once-daily', id: 'SRC-B4-CARTIA-XT-ACTAVIS-SPL21', publisher: 'Actavis Pharma, Inc.; DailyMed', setId: '2dc2b889-8443-4f7f-83be-86c68e179804', splVersion: 21, effectiveDate: '2026-04-30', applicationNumber: 'ANDA074752' },
  { medicationId: 'MED-diltiazem-er-tablet-once-daily', id: 'SRC-B4-DILTIAZEM-SLATERUN-ER-TABLET-SPL10', publisher: 'Slate Run Pharmaceuticals, LLC; DailyMed', setId: 'f7137458-0db3-7ecd-e053-6394a90a5f95', splVersion: 10, effectiveDate: '2026-08-05', applicationNumber: 'ANDA216439' },
  { medicationId: 'MED-verapamil-tablet', id: 'SRC-B4-VERAPAMIL-ACTAVIS-TABLET-SPL16', publisher: 'Actavis Pharma, Inc.; DailyMed', setId: 'a0343397-897b-46d6-943f-a87e07e1de10', splVersion: 16, effectiveDate: '2024-01-30', applicationNumber: 'ANDA072924; ANDA070995; ANDA070994' },
  { medicationId: 'MED-verapamil-er-tablet', id: 'SRC-B4-VERAPAMIL-GLENMARK-ER-TABLET-SPL11', publisher: 'Glenmark Pharmaceuticals Inc., USA; DailyMed', setId: 'ba1bf1ae-9347-4d17-998b-14bf7b5984ce', splVersion: 11, effectiveDate: '2025-12-02', applicationNumber: 'ANDA090700; ANDA078906' },
  { medicationId: 'MED-verapamil-verelan-pm-er-capsule', id: 'SRC-B4-VERELAN-PM-LANNETT-SPL12', publisher: 'Lannett Company, Inc.; DailyMed', setId: 'fd1b433f-1895-4af0-9d1f-3901c6d34c20', splVersion: 12, effectiveDate: '2026-06-01', applicationNumber: 'NDA020943' },
];

const definitionByMedication = new Map(batch04NonDhpCcbIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04NonDhpCcbIdentitySources: SourceDocument[] = sourceData.map((source) => {
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
      releaseForm: definition.releaseForm,
      releaseProfile: definition.releaseProfile ?? null,
      historicalMarketingEndDate: definition.historicalMarketingEndDate ?? null,
      representativeIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});

const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04NonDhpCcbIdentityAtoms: EvidenceAtom[] = batch04NonDhpCcbIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.brandName ?? product.genericName} as an oral ${product.dosageForm.toLowerCase()} nondihydropyridine calcium-channel-blocker identity${product.releaseProfile ? ` with a ${product.releaseProfile.toLowerCase().replaceAll('_', '-')} release profile` : ''}.`,
  normalizedTopic: 'batch04-nondihydropyridine-ccb-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-calcium-channel-blocker', 'CLS-nondihydropyridine-ccb'], contextTags: ['product-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates product/formulation provenance only; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'Different extended-release diltiazem and verapamil products are not automatically interchangeable; PREP-MEDS does not authorize formulation conversion or substitution.',
    'DailyMed/FDA listing does not establish current commercial inventory or availability.',
    'No autonomous endoscopy continuation, withholding, dose adjustment, or restart timing is supported by this identity evidence.',
  ],
  retrieval: {
    title: `${product.brandName ?? product.genericName} formulation identity`,
    summary: `Direct DailyMed provenance supports this diltiazem/verapamil formulation as a distinct medication-reconciliation identity.`,
    keywords: [product.brandName ?? product.genericName, product.genericName, 'nondihydropyridine calcium channel blocker', product.dosageForm, product.releaseProfile ?? product.releaseForm],
    concepts: ['medication-identity', 'calcium-channel-blocker', 'formulation-identity', 'release-profile'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04NonDhpCcbMarketingStatusAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B4-VERELAN-PM-MARKETING-END-2026',
    version: 1,
    source: { id: 'SRC-B4-VERELAN-PM-LANNETT-SPL12', version: 1 },
    claim: 'The current DailyMed SPL records a marketing end date of 2026-05-31 for the listed Verelan PM presentations while the label itself was updated effective 2026-06-01.',
    normalizedTopic: 'batch04-verelan-pm-historical-marketing-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: { medicationIds: ['MED-verapamil-verelan-pm-er-capsule'], ingredientIds: ['ING-verapamil'], contextTags: ['historical-marketing-status', 'availability-not-inferred'] },
    locator: { section: 'Marketing Information' },
    limitations: [
      'A listed marketing end date is preserved as historical regulatory-label metadata and does not prove that no product remains in circulation or patient possession.',
      'PREP-MEDS makes no current commercial-availability assertion from this record.',
    ],
    retrieval: {
      title: 'Verelan PM listed marketing end date',
      summary: 'DailyMed records a 2026-05-31 marketing end date for the listed Verelan PM presentations; this is preserved separately from medication identity.',
      keywords: ['Verelan PM', 'verapamil', 'marketing end', 'historical'],
      concepts: ['historical-product', 'market-status-provenance'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const batch04NonDhpCcbReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-NONDHP-CCB-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Explicit diltiazem/verapamil product requires clinician review pending procedure policy adjudication',
    scope: { medicationIds: batch04NonDhpCcbIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: batch04NonDhpCcbIdentityDefinitions.map((product) => product.evidenceRef),
    status: 'TECHNICALLY_TESTED',
    priority: 60,
  },
];

export const batch04NonDhpCcbIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04NonDhpCcbIdentitySources,
  atoms: [...batch04NonDhpCcbIdentityAtoms, ...batch04NonDhpCcbMarketingStatusAtoms],
};
