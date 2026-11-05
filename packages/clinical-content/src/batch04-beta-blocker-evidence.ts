import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T08:18:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;

export interface Batch04BetaBlockerIdentityDefinition {
  medicationId:
    | 'MED-metoprolol-tartrate'
    | 'MED-metoprolol-succinate-er'
    | 'MED-carvedilol'
    | 'MED-atenolol'
    | 'MED-propranolol'
    | 'MED-bisoprolol'
    | 'MED-nadolol'
    | 'MED-labetalol';
  ingredientId:
    | 'ING-metoprolol'
    | 'ING-carvedilol'
    | 'ING-atenolol'
    | 'ING-propranolol'
    | 'ING-bisoprolol'
    | 'ING-nadolol'
    | 'ING-labetalol';
  genericName: string;
  dosageForm: 'TABLET' | 'TABLET, FILM COATED' | 'TABLET, EXTENDED RELEASE';
  releaseForm: 'STANDARD' | 'EXTENDED_RELEASE';
  route: 'ORAL';
  evidenceRef: { id: string; version: number };
}

export const batch04BetaBlockerIdentityDefinitions: Batch04BetaBlockerIdentityDefinition[] = [
  { medicationId: 'MED-metoprolol-tartrate', ingredientId: 'ING-metoprolol', genericName: 'metoprolol tartrate', dosageForm: 'TABLET, FILM COATED', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-METOPROLOL-TARTRATE-IDENTITY', version: 1 } },
  { medicationId: 'MED-metoprolol-succinate-er', ingredientId: 'ING-metoprolol', genericName: 'metoprolol succinate', dosageForm: 'TABLET, EXTENDED RELEASE', releaseForm: 'EXTENDED_RELEASE', route: 'ORAL', evidenceRef: { id: 'EVD-B4-METOPROLOL-SUCCINATE-ER-IDENTITY', version: 1 } },
  { medicationId: 'MED-carvedilol', ingredientId: 'ING-carvedilol', genericName: 'carvedilol', dosageForm: 'TABLET, FILM COATED', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-CARVEDILOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-atenolol', ingredientId: 'ING-atenolol', genericName: 'atenolol', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-ATENOLOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-propranolol', ingredientId: 'ING-propranolol', genericName: 'propranolol hydrochloride', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-PROPRANOLOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-bisoprolol', ingredientId: 'ING-bisoprolol', genericName: 'bisoprolol fumarate', dosageForm: 'TABLET, FILM COATED', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-BISOPROLOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-nadolol', ingredientId: 'ING-nadolol', genericName: 'nadolol', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-NADOLOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-labetalol', ingredientId: 'ING-labetalol', genericName: 'labetalol hydrochloride', dosageForm: 'TABLET', releaseForm: 'STANDARD', route: 'ORAL', evidenceRef: { id: 'EVD-B4-LABETALOL-IDENTITY', version: 1 } },
];

const sourceData: Array<{
  medicationId: Batch04BetaBlockerIdentityDefinition['medicationId'];
  id: string;
  publisher: string;
  setId: string;
  splVersion: number;
  effectiveDate: string;
  applicationNumber: string;
  dosageForm: Batch04BetaBlockerIdentityDefinition['dosageForm'];
}> = [
  { medicationId: 'MED-metoprolol-tartrate', id: 'SRC-B4-METOPROLOL-TARTRATE-MYLAN-SPL31', publisher: 'Mylan Pharmaceuticals Inc.; DailyMed', setId: '809c6386-0039-42ff-a03e-e42733e229b8', splVersion: 31, effectiveDate: '2024-01-31', applicationNumber: 'ANDA076704', dosageForm: 'TABLET, FILM COATED' },
  { medicationId: 'MED-metoprolol-succinate-er', id: 'SRC-B4-METOPROLOL-SUCCINATE-ZYDUS-SPL10', publisher: 'Zydus Pharmaceuticals (USA) Inc.; DailyMed', setId: 'bd77ec6e-c58c-440b-81d6-8a462b2fdc9c', splVersion: 10, effectiveDate: '2026-05-19', applicationNumber: 'ANDA203894', dosageForm: 'TABLET, EXTENDED RELEASE' },
  { medicationId: 'MED-carvedilol', id: 'SRC-B4-CARVEDILOL-BLUEPOINT-SPL14', publisher: 'BluePoint Laboratories; DailyMed', setId: 'e68c9b18-e7fd-45f7-a8f5-1d815e32680b', splVersion: 14, effectiveDate: '2026-03-09', applicationNumber: 'ANDA077614', dosageForm: 'TABLET, FILM COATED' },
  { medicationId: 'MED-atenolol', id: 'SRC-B4-ATENOLOL-ZYDUS-SPL13', publisher: 'Zydus Pharmaceuticals USA Inc.; DailyMed', setId: 'db801706-1362-44c7-92ab-f584f96c7e1c', splVersion: 13, effectiveDate: '2024-01-11', applicationNumber: 'ANDA076900', dosageForm: 'TABLET' },
  { medicationId: 'MED-propranolol', id: 'SRC-B4-PROPRANOLOL-LIFESTAR-SPL7', publisher: 'Lifestar Pharma LLC; DailyMed', setId: '25f9b9a3-7b0b-48d2-a458-c613bedc7cab', splVersion: 7, effectiveDate: '2026-02-02', applicationNumber: 'ANDA216663', dosageForm: 'TABLET' },
  { medicationId: 'MED-bisoprolol', id: 'SRC-B4-BISOPROLOL-MICROLABS-SPL1', publisher: 'Micro Labs Limited; DailyMed', setId: 'c3ee566c-74c4-45f4-a947-526a7313e326', splVersion: 1, effectiveDate: '2026-03-11', applicationNumber: 'ANDA218303', dosageForm: 'TABLET, FILM COATED' },
  { medicationId: 'MED-nadolol', id: 'SRC-B4-NADOLOL-ZYDUS-SPL6', publisher: 'Zydus Pharmaceuticals USA Inc.; DailyMed', setId: 'a0a38f9b-268d-4463-881d-5bee6cd92e8a', splVersion: 6, effectiveDate: '2024-01-02', applicationNumber: 'ANDA207761', dosageForm: 'TABLET' },
  { medicationId: 'MED-labetalol', id: 'SRC-B4-LABETALOL-BLUEPOINT-SPL5', publisher: 'BluePoint Laboratories; DailyMed', setId: 'e4562c70-f245-4dbe-8fe1-0bb64a91a315', splVersion: 5, effectiveDate: '2026-06-04', applicationNumber: 'ANDA074787', dosageForm: 'TABLET' },
];

const definitionByMedication = new Map(batch04BetaBlockerIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const batch04BetaBlockerIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id,
    version: 1,
    sourceType: 'FDA_LABEL',
    title: `${definition.genericName.toUpperCase()} ${source.dosageForm.toLowerCase()}: direct DailyMed labeling, SPL ${source.splVersion}`,
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
      route: 'ORAL',
      dosageForm: source.dosageForm,
      releaseForm: definition.releaseForm,
      representativeGenericIdentityOnly: true,
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  };
});

const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const batch04BetaBlockerIdentityAtoms: EvidenceAtom[] = batch04BetaBlockerIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id,
  version: product.evidenceRef.version,
  source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `A direct DailyMed label supports ${product.genericName} as a single-ingredient oral ${product.dosageForm.toLowerCase()} beta-blocker identity${product.releaseForm === 'EXTENDED_RELEASE' ? ' with explicit extended-release formulation' : ''}.`,
  normalizedTopic: 'batch04-beta-blocker-product-identity',
  stance: 'DESCRIPTIVE',
  evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-beta-blocker'], contextTags: ['generic-identity', 'clinical-review-only'] },
  locator: { section: 'Drug Label Information; Product Information; Marketing Information' },
  limitations: [
    'The selected DailyMed record is representative provenance for generic ingredient, route, dosage form, release distinction when explicit, and application identity; it does not authenticate a patient-specific manufacturer, NDC, package, or strength.',
    'DailyMed or FDA listing does not establish current pharmacy inventory or commercial availability.',
    'This identity evidence does not authorize dose adjustment, substitution, conversion, autonomous continuation, medication withholding, or restart timing for endoscopy.',
  ],
  retrieval: {
    title: `${product.genericName} beta-blocker identity`,
    summary: `Direct DailyMed provenance supports ${product.genericName} as an oral beta-blocker product identity for medication reconciliation.`,
    keywords: [product.genericName, 'beta blocker', product.dosageForm, product.releaseForm],
    concepts: ['medication-identity', 'beta-blocker', 'route-identity', 'formulation-identity'],
    sourceAuthorityRank: 100,
  },
  lifecycle: 'DRAFT',
  createdAt: retrievedAt,
}));

export const batch04BetaBlockerReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B4-BETA-BLOCKER-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Explicit beta-blocker product requires clinician review pending endoscopy/anesthesia policy adjudication',
    scope: { medicationIds: batch04BetaBlockerIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
    requiredModifierIds: ['MOD-stable-chronic-use'],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [{ id: 'EVD-AHA-BETA-CONTINUE-2024', version: 1 }],
    status: 'TECHNICALLY_TESTED',
    priority: 60,
  },
];

export const batch04BetaBlockerIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch04BetaBlockerIdentitySources,
  atoms: batch04BetaBlockerIdentityAtoms,
};
