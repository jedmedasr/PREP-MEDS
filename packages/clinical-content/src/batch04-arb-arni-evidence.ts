import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T08:00:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04ArbArniIdentityDefinition {
  medicationId:
    | 'MED-losartan'
    | 'MED-valsartan'
    | 'MED-irbesartan'
    | 'MED-candesartan'
    | 'MED-olmesartan'
    | 'MED-telmisartan'
    | 'MED-sacubitril-valsartan'
    | 'MED-sacubitril-valsartan-entresto-tablet'
    | 'MED-sacubitril-valsartan-entresto-sprinkle';
  ingredientIds: string[];
  genericName: string;
  brandName?: 'Entresto';
  displayProduct?: 'Novugen sacubitril/valsartan tablet' | 'Entresto tablet' | 'Entresto Sprinkle';
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'PELLET';
  route: 'ORAL';
  drugClassId: 'CLS-arb' | 'CLS-arni';
  evidenceRef: { id: string; version: number };
  fixedCombination?: true;
}

export const batch04ArbArniIdentityDefinitions: Batch04ArbArniIdentityDefinition[] = [
  { medicationId: 'MED-losartan', ingredientIds: ['ING-losartan'], genericName: 'losartan potassium', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-LOSARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-valsartan', ingredientIds: ['ING-valsartan'], genericName: 'valsartan', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-VALSARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-irbesartan', ingredientIds: ['ING-irbesartan'], genericName: 'irbesartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-IRBESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-candesartan', ingredientIds: ['ING-candesartan'], genericName: 'candesartan cilexetil', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-CANDESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-olmesartan', ingredientIds: ['ING-olmesartan'], genericName: 'olmesartan medoxomil', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-OLMESARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-telmisartan', ingredientIds: ['ING-telmisartan'], genericName: 'telmisartan', dosageForm: 'TABLET', route: 'ORAL', drugClassId: 'CLS-arb', evidenceRef: { id: 'EVD-B4-TELMISARTAN-IDENTITY', version: 1 } },
  { medicationId: 'MED-sacubitril-valsartan', ingredientIds: ['ING-sacubitril', 'ING-valsartan'], genericName: 'sacubitril and valsartan', displayProduct: 'Novugen sacubitril/valsartan tablet', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', drugClassId: 'CLS-arni', evidenceRef: { id: 'EVD-B4-SACUBITRIL-VALSARTAN-GENERIC-IDENTITY', version: 1 }, fixedCombination: true },
  { medicationId: 'MED-sacubitril-valsartan-entresto-tablet', ingredientIds: ['ING-sacubitril', 'ING-valsartan'], genericName: 'sacubitril and valsartan', brandName: 'Entresto', displayProduct: 'Entresto tablet', dosageForm: 'TABLET, FILM COATED', route: 'ORAL', drugClassId: 'CLS-arni', evidenceRef: { id: 'EVD-B4-ENTRESTO-TABLET-IDENTITY', version: 1 }, fixedCombination: true },
  { medicationId: 'MED-sacubitril-valsartan-entresto-sprinkle', ingredientIds: ['ING-sacubitril', 'ING-valsartan'], genericName: 'sacubitril and valsartan', brandName: 'Entresto', displayProduct: 'Entresto Sprinkle', dosageForm: 'PELLET', route: 'ORAL', drugClassId: 'CLS-arni', evidenceRef: { id: 'EVD-B4-ENTRESTO-SPRINKLE-IDENTITY', version: 1 }, fixedCombination: true },
];

export const batch04ArbArniIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-B4-LOSARTAN-ZYDUS-SPL22', version: 1, sourceType: 'FDA_LABEL',
    title: 'LOSARTAN POTASSIUM tablets: Zydus Pharmaceuticals USA labeling, SPL 22',
    publisher: 'Zydus Pharmaceuticals USA Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-07-20',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3233c707-70b6-4c29-8210-913eeb2a38ed',
    externalIdentifier: 'DailyMed SETID 3233c707-70b6-4c29-8210-913eeb2a38ed; SPL version 22; ANDA078243', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '3233c707-70b6-4c29-8210-913eeb2a38ed', splVersion: 22, applicationNumber: 'ANDA078243', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', representativeGenericIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-VALSARTAN-MYLAN-SPL16', version: 1, sourceType: 'FDA_LABEL',
    title: 'VALSARTAN tablets: Mylan Pharmaceuticals labeling, SPL 16', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-09-15',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=73e01dc6-7dd4-421a-a4f6-137e75f69f9a', externalIdentifier: 'DailyMed SETID 73e01dc6-7dd4-421a-a4f6-137e75f69f9a; SPL version 16; ANDA090866', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '73e01dc6-7dd4-421a-a4f6-137e75f69f9a', splVersion: 16, applicationNumber: 'ANDA090866', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', representativeGenericIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-IRBESARTAN-MACLEODS-SPL13', version: 1, sourceType: 'FDA_LABEL',
    title: 'IRBESARTAN tablets: Macleods Pharmaceuticals labeling, SPL 13', publisher: 'Macleods Pharmaceuticals Limited; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-08-06',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e8635a1c-ae06-4e23-99f7-e704f91d6f43', externalIdentifier: 'DailyMed SETID e8635a1c-ae06-4e23-99f7-e704f91d6f43; SPL version 13; ANDA202254', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: 'e8635a1c-ae06-4e23-99f7-e704f91d6f43', splVersion: 13, applicationNumber: 'ANDA202254', route: 'ORAL', dosageForm: 'TABLET', representativeGenericIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-CANDESARTAN-VIONA-SPL4', version: 1, sourceType: 'FDA_LABEL',
    title: 'CANDESARTAN CILEXETIL tablets: Viona Pharmaceuticals labeling, SPL 4', publisher: 'Viona Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-09-07',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9da86c48-5911-4512-8c71-eca4a6418cf6', externalIdentifier: 'DailyMed SETID 9da86c48-5911-4512-8c71-eca4a6418cf6; SPL version 4; ANDA091390', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '9da86c48-5911-4512-8c71-eca4a6418cf6', splVersion: 4, applicationNumber: 'ANDA091390', route: 'ORAL', dosageForm: 'TABLET', representativeGenericIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-OLMESARTAN-AUROBINDO-SPL9', version: 1, sourceType: 'FDA_LABEL',
    title: 'OLMESARTAN MEDOXOMIL tablets: Aurobindo Pharma labeling, SPL 9', publisher: 'Aurobindo Pharma Limited; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2025-01-04',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8c94d403-809b-43b9-834f-3ecd330d2dd9', externalIdentifier: 'DailyMed SETID 8c94d403-809b-43b9-834f-3ecd330d2dd9; SPL version 9; ANDA204798', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '8c94d403-809b-43b9-834f-3ecd330d2dd9', splVersion: 9, applicationNumber: 'ANDA204798', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', representativeGenericIdentityOnly: true, sourceSelectionNote: 'Direct non-repackaged DailyMed record with fully authenticated SETID/SPL/application metadata; newer repackaged or archive-only records were not treated as manufacturer identity.', marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-TELMISARTAN-ALEMBIC-SPL11', version: 1, sourceType: 'FDA_LABEL',
    title: 'TELMISARTAN tablets: Alembic Pharmaceuticals labeling, SPL 11', publisher: 'Alembic Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-05-29',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c62d424c-7630-413c-be2c-3932831c3f1d', externalIdentifier: 'DailyMed SETID c62d424c-7630-413c-be2c-3932831c3f1d; SPL version 11; ANDA202130', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: 'c62d424c-7630-413c-be2c-3932831c3f1d', splVersion: 11, applicationNumber: 'ANDA202130', route: 'ORAL', dosageForm: 'TABLET', representativeGenericIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2', version: 1, sourceType: 'FDA_LABEL',
    title: 'SACUBITRIL AND VALSARTAN tablets: Novugen labeling, SPL 2', publisher: 'Novugen Pharma (USA) LLC; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-03-17',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=747eeb5c-ac2f-474f-b6d2-0586d12653a6', externalIdentifier: 'DailyMed SETID 747eeb5c-ac2f-474f-b6d2-0586d12653a6; SPL version 2; ANDA213611', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '747eeb5c-ac2f-474f-b6d2-0586d12653a6', splVersion: 2, applicationNumber: 'ANDA213611', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', productIdentity: 'generic sacubitril and valsartan tablets', marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-ENTRESTO-TABLET-SPL25', version: 1, sourceType: 'FDA_LABEL',
    title: 'ENTRESTO tablets: Novartis labeling, SPL 25', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-07-06',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=000dc81d-ab91-450c-8eae-8eb74e72296f', externalIdentifier: 'DailyMed SETID 000dc81d-ab91-450c-8eae-8eb74e72296f; SPL version 25; NDA207620', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', splVersion: 25, applicationNumber: 'NDA207620', route: 'ORAL', dosageForm: 'TABLET, FILM COATED', productIdentity: 'ENTRESTO tablets', marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-ENTRESTO-SPRINKLE-SPL25', version: 1, sourceType: 'FDA_LABEL',
    title: 'ENTRESTO SPRINKLE oral pellets: Novartis labeling, SPL 25', publisher: 'Novartis Pharmaceuticals Corporation; DailyMed', societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: '2026-07-06',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=000dc81d-ab91-450c-8eae-8eb74e72296f', externalIdentifier: 'DailyMed SETID 000dc81d-ab91-450c-8eae-8eb74e72296f; SPL version 25; NDA218591', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: { setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', splVersion: 25, applicationNumber: 'NDA218591', route: 'ORAL', dosageForm: 'PELLET', productIdentity: 'ENTRESTO SPRINKLE oral pellets', marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false },
  },
  {
    id: 'SRC-B4-AHA-ACC-PERIOP-RAAS-2024', version: 1, sourceType: 'GUIDELINE',
    title: '2024 AHA/ACC/ACS/ASNC/HRS/SCA/SCCT/SCMR/SVM Guideline for Perioperative Cardiovascular Management for Noncardiac Surgery', publisher: 'American Heart Association / American College of Cardiology', societyOrRegulator: 'AHA/ACC multisociety', publicationDate: '2024-09-24', externalIdentifier: 'doi:10.1161/CIR.0000000000001285', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
  },
  {
    id: 'SRC-B4-STOP-OR-NOT-2024', version: 1, sourceType: 'PEER_REVIEWED_STUDY',
    title: 'Continuation vs Discontinuation of Renin-Angiotensin System Inhibitors Before Major Noncardiac Surgery: The Stop-or-Not Randomized Clinical Trial', publisher: 'JAMA', publicationDate: '2024-08-30', externalIdentifier: 'NCT03374449', language: 'en', retrievedAt, lifecycle: 'DRAFT',
  },
];

const sourceByMedication: Record<Batch04ArbArniIdentityDefinition['medicationId'], string> = {
  'MED-losartan': 'SRC-B4-LOSARTAN-ZYDUS-SPL22',
  'MED-valsartan': 'SRC-B4-VALSARTAN-MYLAN-SPL16',
  'MED-irbesartan': 'SRC-B4-IRBESARTAN-MACLEODS-SPL13',
  'MED-candesartan': 'SRC-B4-CANDESARTAN-VIONA-SPL4',
  'MED-olmesartan': 'SRC-B4-OLMESARTAN-AUROBINDO-SPL9',
  'MED-telmisartan': 'SRC-B4-TELMISARTAN-ALEMBIC-SPL11',
  'MED-sacubitril-valsartan': 'SRC-B4-SACUBITRIL-VALSARTAN-NOVUGEN-SPL2',
  'MED-sacubitril-valsartan-entresto-tablet': 'SRC-B4-ENTRESTO-TABLET-SPL25',
  'MED-sacubitril-valsartan-entresto-sprinkle': 'SRC-B4-ENTRESTO-SPRINKLE-SPL25',
};

export const batch04ArbArniIdentityAtoms: EvidenceAtom[] = batch04ArbArniIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: product.fixedCombination
    ? `Current FDA/DailyMed labeling identifies ${product.displayProduct} as an oral whole-product identity containing sacubitril and valsartan. PREP-MEDS preserves both components without splitting the product into independent instructions.`
    : `A direct DailyMed label supports ${product.genericName} as a single-ingredient oral ${product.dosageForm.toLowerCase()} angiotensin II receptor blocker identity. The selected source is representative generic provenance and does not authenticate a patient-specific manufacturer or package.`,
  normalizedTopic: product.fixedCombination ? 'batch04-arni-fixed-combination-identity' : 'batch04-arb-generic-identity',
  stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [...product.ingredientIds], drugClassIds: [product.drugClassId], contextTags: product.fixedCombination ? ['fixed-combination-identity', 'arni', 'formulation-specific', 'clinical-review-only'] : ['generic-identity', 'arb', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: product.fixedCombination
    ? [
        'Sacubitril/valsartan remains one whole-product identity and must not be split into independent medication instructions.',
        'ENTRESTO tablets and ENTRESTO SPRINKLE oral pellets are formulation-distinct identities; route/formulation-unspecified wording must not select one automatically.',
        'FDA/DailyMed listing does not establish current pharmacy inventory or authorize substitution among source-distinct products.',
        'No dose, conversion, peri-procedural hold/continue/restart interval, clinical approval, or local anesthesia policy is authorized by this identity atom.',
      ]
    : [
        'The selected DailyMed label is representative provenance and does not establish the manufacturer, NDC, package, strength, or pharmacy inventory of a patient-specific product.',
        'Salt/prodrug wording is preserved for terminology reconciliation without authorizing substitution or conversion.',
        'No dose, substitution, conversion, peri-procedural hold/continue/restart interval, clinical approval, or local anesthesia policy is authorized by this identity atom.',
      ],
  retrieval: { title: `${product.displayProduct ?? product.genericName} identity`, summary: product.fixedCombination ? `Current FDA/DailyMed provenance supports formulation- and source-distinct ${product.displayProduct} whole-product identity.` : `Direct DailyMed provenance supports generic ${product.genericName} oral identity.`, keywords: [product.genericName, product.displayProduct ?? product.drugClassId, product.route, product.dosageForm], concepts: ['medication-identity', product.fixedCombination ? 'fixed-combination' : 'arb', 'raas'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const batch04RaasPolicyAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B4-RAAS-HTN-LOCAL-POLICY-2024', version: 1, source: { id: 'SRC-B4-AHA-ACC-PERIOP-RAAS-2024', version: 1 },
    claim: 'The 2024 AHA/ACC multisociety perioperative guideline states that in selected patients taking chronic RAAS inhibitors for hypertension who are undergoing elevated-risk noncardiac surgery, omission 24 hours before surgery may be beneficial to limit intraoperative hypotension.',
    normalizedTopic: 'batch04-raas-hypertension-perioperative-policy', stance: 'CONDITIONAL', evidenceStrength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-arb', 'CLS-arni'], procedureCodes: [...procedures], contextTags: ['hypertension', 'local-policy-required'] },
    locator: { section: 'Recommendations for Perioperative Renin-Angiotensin-Aldosterone System Inhibitors' },
    limitations: ['The recommendation is for selected patients with controlled blood pressure undergoing elevated-risk noncardiac surgery; routine outpatient endoscopy is not automatically equivalent to that population.', 'The source interval is not encoded as an autonomous PREP-MEDS endoscopy timing rule.', 'Institutional anesthesia policy and patient indication/hemodynamics require accountable clinical adjudication.'],
    retrieval: { title: 'RAAS inhibitor management for hypertension is procedure-risk dependent', summary: 'AHA/ACC supports selective omission before elevated-risk noncardiac surgery in controlled hypertension, not a universal outpatient-endoscopy rule.', keywords: ['RAAS inhibitor', 'ARB', 'hypertension', 'noncardiac surgery', 'hypotension'], concepts: ['raas', 'hypertension', 'local-policy'], sourceAuthorityRank: 95 }, lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B4-RAAS-HF-CONTINUE-2024', version: 1, source: { id: 'SRC-B4-AHA-ACC-PERIOP-RAAS-2024', version: 1 },
    claim: 'The 2024 AHA/ACC multisociety perioperative guideline states that perioperative continuation of chronic RAAS inhibitor therapy is reasonable in patients treated for heart failure with reduced ejection fraction.',
    normalizedTopic: 'batch04-raas-hf-perioperative-policy', stance: 'CONDITIONAL', evidenceStrength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-arb', 'CLS-arni'], procedureCodes: [...procedures], contextTags: ['heart-failure-reduced-ejection-fraction', 'local-policy-required'] },
    locator: { section: 'Recommendations for Perioperative Renin-Angiotensin-Aldosterone System Inhibitors' },
    limitations: ['This is perioperative noncardiac-surgery guidance, not a product-specific outpatient-endoscopy timing instruction.', 'Patient hemodynamics, indication, and local anesthesia policy remain relevant.', 'No autonomous continue/hold/restart rule is authorized by this atom.'],
    retrieval: { title: 'RAAS inhibitor continuation may be reasonable in HFrEF', summary: 'AHA/ACC considers perioperative continuation reasonable for chronic RAAS inhibitor therapy in HFrEF.', keywords: ['RAAS inhibitor', 'ARB', 'ARNI', 'HFrEF', 'continue'], concepts: ['raas', 'heart-failure', 'local-policy'], sourceAuthorityRank: 95 }, lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
  {
    id: 'EVD-B4-ARB-STOPORNOT-2024', version: 1, source: { id: 'SRC-B4-STOP-OR-NOT-2024', version: 1 },
    claim: 'In the Stop-or-Not randomized trial of major elective noncardiac surgery, continuation versus discontinuation of chronic ACE inhibitor or ARB therapy produced similar major postoperative outcomes, while continuation was associated with more intraoperative hypotension.',
    normalizedTopic: 'batch04-arb-stop-or-not', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-arb'], contextTags: ['major-noncardiac-surgery', 'local-policy-required'] }, locator: { section: 'Primary and secondary outcomes' },
    limitations: ['The trial population underwent major noncardiac surgery; direct transfer to routine outpatient endoscopy is uncertain.', 'The trial studied ACE inhibitors and ARBs, not sacubitril/valsartan as an ARNI identity.', 'This evidence does not authorize an autonomous PREP-MEDS timing rule.'],
    retrieval: { title: 'Stop-or-Not informs ARB perioperative policy tradeoffs', summary: 'The randomized trial found similar major outcomes with continuation versus discontinuation but more intraoperative hypotension with continuation.', keywords: ['ARB', 'Stop-or-Not', 'hypotension', 'noncardiac surgery'], concepts: ['arb', 'raas', 'policy-sensitive'], sourceAuthorityRank: 85 }, lifecycle: 'DRAFT', createdAt: retrievedAt,
  },
];

const arbMedicationIds = batch04ArbArniIdentityDefinitions.filter((product) => product.drugClassId === 'CLS-arb').map((product) => product.medicationId);
const arniMedicationIds = batch04ArbArniIdentityDefinitions.filter((product) => product.drugClassId === 'CLS-arni').map((product) => product.medicationId);

export const batch04ArbArniReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-ARB-POLICY-REVIEW-001', version: 1, name: 'ARB peri-procedural management requires indication-aware local anesthesia policy',
    scope: { medicationIds: arbMedicationIds, procedureCodes: [...procedures] }, requiredModifierIds: ['MOD-raas-indication'], disposition: 'LOCAL_POLICY_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-B4-RAAS-HTN-LOCAL-POLICY-2024', version: 1 }, { id: 'EVD-B4-RAAS-HF-CONTINUE-2024', version: 1 }, { id: 'EVD-B4-ARB-STOPORNOT-2024', version: 1 }], policyDependencyIds: ['POLICY-ANESTHESIA-RAAS'], status: 'TECHNICALLY_TESTED', priority: 60,
  },
  {
    id: 'RULE-B4-ARNI-POLICY-REVIEW-001', version: 1, name: 'Sacubitril/valsartan peri-procedural management requires indication-aware local anesthesia policy',
    scope: { medicationIds: arniMedicationIds, procedureCodes: [...procedures] }, requiredModifierIds: ['MOD-raas-indication'], disposition: 'LOCAL_POLICY_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-B4-RAAS-HTN-LOCAL-POLICY-2024', version: 1 }, { id: 'EVD-B4-RAAS-HF-CONTINUE-2024', version: 1 }], policyDependencyIds: ['POLICY-ANESTHESIA-RAAS'], status: 'TECHNICALLY_TESTED', priority: 60,
  },
];

export const batch04ArbArniIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: batch04ArbArniIdentitySources,
  atoms: [...batch04ArbArniIdentityAtoms, ...batch04RaasPolicyAtoms],
};
