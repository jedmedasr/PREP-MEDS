import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T07:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04ArbArniIdentityDefinition {
  medicationId:
    | 'MED-losartan'
    | 'MED-valsartan'
    | 'MED-irbesartan'
    | 'MED-candesartan'
    | 'MED-olmesartan'
    | 'MED-telmisartan'
    | 'MED-sacubitril-valsartan';
  ingredientIds: string[];
  genericName: string;
  dosageForm: 'TABLET';
  route: 'ORAL';
  drugClassId: 'CLS-arb' | 'CLS-arni';
  evidenceRef: { id: string; version: number };
  fixedCombination?: true;
}

export const batch04ArbArniIdentityDefinitions: Batch04ArbArniIdentityDefinition[] = [
  { medicationId: 'MED-losartan', ingredientIds: ['ING-losartan'], genericName: 'losartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-LOSARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-valsartan', ingredientIds: ['ING-valsartan'], genericName: 'valsartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-VALSARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-irbesartan', ingredientIds: ['ING-irbesartan'], genericName: 'irbesartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-IRBESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-candesartan', ingredientIds: ['ING-candesartan'], genericName: 'candesartan cilexetil', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-CANDESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-olmesartan', ingredientIds: ['ING-olmesartan'], genericName: 'olmesartan medoxomil', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-OLMESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-telmisartan', ingredientIds: ['ING-telmisartan'], genericName: 'telmisartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-TELMISARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-sacubitril-valsartan', ingredientIds: ['ING-sacubitril', 'ING-valsartan'], genericName: 'sacubitril/valsartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arni', evidenceRef: { id: 'EVD-B4-SACUBITRIL-VALSARTAN-IDENTITY', version: 1 }, fixedCombination: true },
];

const sourceSpecs = [
  ['SRC-B4-LOSARTAN-ALEMBIC-SPL14', 'LOSARTAN POTASSIUM tablets: Alembic labeling, SPL 14', 'Alembic Pharmaceuticals Inc.; DailyMed', '2025-11-17', '1dadbe02-289c-4312-9e65-40f3314dcc31', 14, 'ANDA090428'],
  ['SRC-B4-VALSARTAN-AVKARE-SPL4', 'VALSARTAN tablets: AvKARE labeling, SPL 4', 'AvKARE; DailyMed', '2026-01-19', 'a8c61488-4219-dfcb-e053-2a95a90a98a4', 4, 'ANDA204011'],
  ['SRC-B4-IRBESARTAN-AUROBINDO-SPL11', 'IRBESARTAN tablets: Aurobindo labeling, SPL 11', 'Aurobindo Pharma Limited; DailyMed', '2025-11-25', '2113a901-2612-4557-b86d-3afc006fb8bb', 11, 'ANDA203081'],
  ['SRC-B4-CANDESARTAN-ALEMBIC-SPL3', 'CANDESARTAN CILEXETIL tablets: Alembic labeling, SPL 3', 'Alembic Pharmaceuticals Limited; DailyMed', '2023-01-16', 'd23fe59a-2ad6-4885-a0d8-2239048f05a3', 3, 'ANDA209119'],
  ['SRC-B4-OLMESARTAN-ACCORD-SPL9', 'OLMESARTAN MEDOXOMIL tablets: Accord labeling, SPL 9', 'Accord Healthcare Inc.; DailyMed', '2025-11-17', 'e5dbca00-4e1b-4479-b829-021b11bc021e', 9, 'ANDA207662'],
  ['SRC-B4-TELMISARTAN-ASCEND-SPL10', 'TELMISARTAN tablets: Ascend labeling, SPL 10', 'Ascend Laboratories, LLC; DailyMed', '2025-04-02', '29bddc43-2809-4e1f-ae35-2865e15e9bb6', 10, 'ANDA205150'],
  ['SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2', 'SACUBITRIL AND VALSARTAN tablets: Novugen labeling, SPL 2', 'Novugen Pharma (USA) LLC; DailyMed', '2026-03-18', '747eeb5c-ac2f-474f-b6d2-0586d12653a6', 2, 'ANDA213611'],
] as const;

export const batch04ArbArniIdentitySources: SourceDocument[] = sourceSpecs.map(([id, title, publisher, effectiveDate, setId, splVersion, applicationNumber]) => ({
  id,
  version: 1,
  sourceType: 'FDA_LABEL',
  title,
  publisher,
  societyOrRegulator: 'FDA labeling via DailyMed',
  effectiveDate,
  sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + setId,
  externalIdentifier: 'DailyMed SETID ' + setId + '; SPL version ' + splVersion + '; ' + applicationNumber,
  jurisdiction: 'US',
  language: 'en',
  retrievedAt,
  lifecycle: 'DRAFT',
  metadata: {
    setId,
    splVersion,
    applicationNumber,
    route: 'ORAL',
    dosageForm: 'TABLET',
    representativeGenericIdentityOnly: true,
    marketAvailabilityAsserted: false,
    substitutionAuthorized: false,
    clinicalApprovalGranted: false,
    timingRuleAuthorized: false,
  },
}));

const sourceIds = batch04ArbArniIdentitySources.map((source) => source.id);
export const batch04ArbArniIdentityAtoms: EvidenceAtom[] = batch04ArbArniIdentityDefinitions.map((product, index) => ({
  id: product.evidenceRef.id,
  version: 1,
  source: { id: sourceIds[index]!, version: 1 },
  claim: 'A current direct DailyMed label supports ' + product.genericName + ' as an oral tablet identity. This representative source authenticates ingredient, route, form, and application provenance only.',
  normalizedTopic: product.fixedCombination ? 'batch04-arni-fixed-combination-identity' : 'batch04-arb-generic-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: {
    medicationIds: [product.medicationId],
    ingredientIds: [...product.ingredientIds],
    drugClassIds: [product.drugClassId],
    contextTags: product.fixedCombination
      ? ['fixed-combination-identity', 'arni', 'clinical-review-only']
      : ['generic-identity', 'arb', 'clinical-review-only'],
  },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The selected DailyMed label is representative provenance and does not establish the manufacturer or NDC of a patient-specific product.',
    'DailyMed or FDA listing does not establish current pharmacy inventory or commercial availability.',
    'No dose, substitution, conversion, peri-procedural hold/continue/restart interval, or local anesthesia policy is authorized by this identity atom.',
    ...(product.fixedCombination ? ['Sacubitril/valsartan remains one whole-product identity and must not be split into independent medication instructions.'] : []),
  ],
  retrieval: {
    title: product.genericName + ' oral tablet identity',
    summary: 'Direct DailyMed provenance supports the scoped oral tablet identity for terminology reconciliation.',
    keywords: [product.genericName, product.drugClassId, 'ORAL', 'TABLET', 'identity'],
    concepts: ['medication-identity', product.fixedCombination ? 'fixed-combination' : 'arb', 'route-identity', 'form-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

const arbMedicationIds = batch04ArbArniIdentityDefinitions
  .filter((product) => product.drugClassId === 'CLS-arb')
  .map((product) => product.medicationId);

export const batch04ArbArniReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-ARB-POLICY-REVIEW-001',
    version: 1,
    name: 'ARB peri-procedural management requires indication-aware local anesthesia policy',
    scope: { medicationIds: arbMedicationIds, procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-raas-indication'],
    disposition: 'LOCAL_POLICY_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [
      { id: 'EVD-AHA-RAAS-HTN-OMIT-2024', version: 1 },
      { id: 'EVD-AHA-RAAS-HF-CONTINUE-2024', version: 1 },
      { id: 'EVD-STOPORNOT-RAAS-2024', version: 1 },
    ],
    policyDependencyIds: ['POLICY-ANESTHESIA-RAAS'],
    status: 'TECHNICALLY_TESTED',
    priority: 60,
  },
  {
    id: 'RULE-B4-ARNI-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Sacubitril/valsartan whole product requires clinician and local-policy review',
    scope: { medicationIds: ['MED-sacubitril-valsartan'], procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-raas-indication'],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-B4-SACUBITRIL-VALSARTAN-IDENTITY', version: 1 }],
    policyDependencyIds: ['POLICY-ANESTHESIA-RAAS'],
    status: 'TECHNICALLY_TESTED',
    priority: 50,
  },
];

export const batch04ArbArniIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04ArbArniIdentitySources,
  atoms: batch04ArbArniIdentityAtoms,
};
