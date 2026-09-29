import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T07:40:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04AceIdentityDefinition {
  medicationId:
    | 'MED-lisinopril'
    | 'MED-enalapril'
    | 'MED-benazepril'
    | 'MED-ramipril'
    | 'MED-captopril';
  ingredientId:
    | 'ING-lisinopril'
    | 'ING-enalapril'
    | 'ING-benazepril'
    | 'ING-ramipril'
    | 'ING-captopril';
  genericName: 'lisinopril' | 'enalapril' | 'benazepril' | 'ramipril' | 'captopril';
  dosageForm: 'TABLET' | 'CAPSULE';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch04AceIdentityDefinitions: Batch04AceIdentityDefinition[] = [
  {
    medicationId: 'MED-lisinopril',
    ingredientId: 'ING-lisinopril',
    genericName: 'lisinopril',
    dosageForm: 'TABLET',
    route: 'ORAL',
    evidenceRef: { id: 'EVD-B4-LISINOPRIL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-enalapril',
    ingredientId: 'ING-enalapril',
    genericName: 'enalapril',
    dosageForm: 'TABLET',
    route: 'ORAL',
    evidenceRef: { id: 'EVD-B4-ENALAPRIL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-benazepril',
    ingredientId: 'ING-benazepril',
    genericName: 'benazepril',
    dosageForm: 'TABLET',
    route: 'ORAL',
    evidenceRef: { id: 'EVD-B4-BENAZEPRIL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-ramipril',
    ingredientId: 'ING-ramipril',
    genericName: 'ramipril',
    dosageForm: 'CAPSULE',
    route: 'ORAL',
    evidenceRef: { id: 'EVD-B4-RAMIPRIL-IDENTITY', version: 1 },
  },
  {
    medicationId: 'MED-captopril',
    ingredientId: 'ING-captopril',
    genericName: 'captopril',
    dosageForm: 'TABLET',
    route: 'ORAL',
    evidenceRef: { id: 'EVD-B4-CAPTOPRIL-IDENTITY', version: 1 },
  },
];

export const batch04AceIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-B4-LISINOPRIL-AUROBINDO-SPL27',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'LISINOPRIL tablets: Aurobindo Pharma Limited labeling, SPL 27',
    publisher: 'Aurobindo Pharma Limited; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-07-21',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0e6364a4-6d66-4151-8197-d45e2a762895',
    externalIdentifier: 'DailyMed SETID 0e6364a4-6d66-4151-8197-d45e2a762895; SPL version 27; ANDA077622',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '0e6364a4-6d66-4151-8197-d45e2a762895',
      splVersion: 27,
      applicationNumber: 'ANDA077622',
      route: 'ORAL',
      dosageForm: 'TABLET',
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B4-ENALAPRIL-SUN-SPL14',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'ENALAPRIL MALEATE tablets: Sun Pharmaceutical Industries labeling, SPL 14',
    publisher: 'Sun Pharmaceutical Industries, Inc.; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-07-14',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f103b9f9-e081-419d-a2d8-b86acda834dd',
    externalIdentifier: 'DailyMed SETID f103b9f9-e081-419d-a2d8-b86acda834dd; SPL version 14; ANDA075657',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'f103b9f9-e081-419d-a2d8-b86acda834dd',
      splVersion: 14,
      applicationNumber: 'ANDA075657',
      route: 'ORAL',
      dosageForm: 'TABLET',
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B4-BENAZEPRIL-ANI-SPL2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'BENAZEPRIL HYDROCHLORIDE tablets: ANI Pharmaceuticals labeling, SPL 2',
    publisher: 'ANI Pharmaceuticals, Inc.; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-08-19',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ff732cfa-9ded-4226-b464-19c90a6865ae',
    externalIdentifier: 'DailyMed SETID ff732cfa-9ded-4226-b464-19c90a6865ae; SPL version 2; ANDA076333',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'ff732cfa-9ded-4226-b464-19c90a6865ae',
      splVersion: 2,
      applicationNumber: 'ANDA076333',
      route: 'ORAL',
      dosageForm: 'TABLET',
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B4-RAMIPRIL-LUPIN-SPL21',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'RAMIPRIL capsules: Lupin Pharmaceuticals labeling, SPL 21',
    publisher: 'Lupin Pharmaceuticals, Inc.; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-08-24',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a8cdec12-81d1-4ef4-82c0-d05d93c37a07',
    externalIdentifier: 'DailyMed SETID a8cdec12-81d1-4ef4-82c0-d05d93c37a07; SPL version 21; ANDA077626',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'a8cdec12-81d1-4ef4-82c0-d05d93c37a07',
      splVersion: 21,
      applicationNumber: 'ANDA077626',
      route: 'ORAL',
      dosageForm: 'CAPSULE',
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B4-CAPTOPRIL-SOLCO-SPL2',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'CAPTOPRIL tablets: Solco Healthcare US labeling, SPL 2',
    publisher: 'Solco Healthcare US, LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2025-12-25',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2d3779b0-83d9-4b6f-a043-f7768cd7fce6',
    externalIdentifier: 'DailyMed SETID 2d3779b0-83d9-4b6f-a043-f7768cd7fce6; SPL version 2; ANDA074477',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '2d3779b0-83d9-4b6f-a043-f7768cd7fce6',
      splVersion: 2,
      applicationNumber: 'ANDA074477',
      route: 'ORAL',
      dosageForm: 'TABLET',
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
];

const sourceByMedication: Record<Batch04AceIdentityDefinition['medicationId'], string> = {
  'MED-lisinopril': 'SRC-B4-LISINOPRIL-AUROBINDO-SPL27',
  'MED-enalapril': 'SRC-B4-ENALAPRIL-SUN-SPL14',
  'MED-benazepril': 'SRC-B4-BENAZEPRIL-ANI-SPL2',
  'MED-ramipril': 'SRC-B4-RAMIPRIL-LUPIN-SPL21',
  'MED-captopril': 'SRC-B4-CAPTOPRIL-SOLCO-SPL2',
};

export const batch04AceIdentityAtoms: EvidenceAtom[] = batch04AceIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: product.evidenceRef.version,
  source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `A current direct DailyMed label supports ${product.genericName} as a single-ingredient ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} ACE-inhibitor identity. The source record is representative provenance for ingredient/route/form reconciliation and does not authenticate the patient's manufacturer or package.`,
  normalizedTopic: 'batch04-ace-inhibitor-generic-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: {
    medicationIds: [product.medicationId],
    ingredientIds: [product.ingredientId],
    drugClassIds: ['CLS-ace-inhibitor'],
    contextTags: ['generic-identity', 'raas', 'clinical-review-only'],
  },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The selected DailyMed label is representative provenance for the generic ingredient, route, dosage form, and application identity; it does not establish the manufacturer or NDC of a patient-specific product.',
    'DailyMed or FDA listing does not establish current pharmacy inventory or commercial availability.',
    'No dose, substitution, conversion, peri-procedural hold/continue/restart interval, or local anesthesia policy is authorized by this identity atom.',
  ],
  retrieval: {
    title: `${product.genericName} oral ${product.dosageForm.toLowerCase()} identity`,
    summary: `Current direct DailyMed provenance supports generic ${product.genericName} ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} identity for terminology reconciliation.`,
    keywords: [product.genericName, 'ACE inhibitor', product.route, product.dosageForm, 'generic identity'],
    concepts: ['medication-identity', 'ace-inhibitor', 'route-identity', 'form-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04AceReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-ACE-INHIBITOR-POLICY-REVIEW-001',
    version: 1,
    name: 'ACE inhibitor peri-procedural management requires indication-aware local anesthesia policy',
    scope: {
      medicationIds: batch04AceIdentityDefinitions.map((product) => product.medicationId),
      procedureCodes: [...procedures],
    },
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
];

export const batch04AceIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04AceIdentitySources,
  atoms: batch04AceIdentityAtoms,
};
