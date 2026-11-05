import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-30T07:12:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId = 'MED-imuran-azathioprine-oral-tablet' | 'MED-azathioprine-sodium-intravenous-injection';

export interface AzathioprineIdentityDefinition {
  medicationId: MedicationId;
  genericName: string;
  dosageForm: string;
  route: 'ORAL' | 'INTRAVENOUS';
  evidenceRef: { id: string; version: number };
}

export const azathioprineIdentityDefinitions: AzathioprineIdentityDefinition[] = [
  { medicationId: 'MED-imuran-azathioprine-oral-tablet', genericName: 'azathioprine oral tablet', dosageForm: 'TABLET', route: 'ORAL', evidenceRef: { id: 'EVD-IMURAN-AZATHIOPRINE-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-azathioprine-sodium-intravenous-injection', genericName: 'azathioprine sodium intravenous injection', dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', route: 'INTRAVENOUS', evidenceRef: { id: 'EVD-AZATHIOPRINE-SODIUM-IV-IDENTITY', version: 1 } },
];

const sourceData: Array<{ medicationId: MedicationId; id: string; publisher: string; setId: string; effectiveDate: string; applicationNumber: string }> = [
  { medicationId: 'MED-imuran-azathioprine-oral-tablet', id: 'SRC-IMURAN-TABLET-LEGACY-NDA016324', publisher: 'Legacy Pharma USA Inc.; DailyMed', setId: '4d62b6e4-a9d4-4818-e063-6394a90aa208', effectiveDate: '2026-03-19', applicationNumber: 'NDA016324' },
  { medicationId: 'MED-azathioprine-sodium-intravenous-injection', id: 'SRC-AZATHIOPRINE-SODIUM-IV-HIKMA-ANDA074419', publisher: 'Hikma Pharmaceuticals USA Inc.; DailyMed', setId: '9ffe79a1-ac91-4a7b-a9e3-7c84bfa9ddf0', effectiveDate: '2025-01-23', applicationNumber: 'ANDA074419' },
];
const definitionByMedication = new Map(azathioprineIdentityDefinitions.map((definition) => [definition.medicationId, definition]));

export const azathioprineIdentitySources: SourceDocument[] = sourceData.map((source) => {
  const definition = definitionByMedication.get(source.medicationId)!;
  return {
    id: source.id, version: 1, sourceType: 'FDA_LABEL',
    title: `${definition.genericName} ${definition.dosageForm.toLowerCase()} (${definition.route.toLowerCase()}): direct DailyMed labeling`,
    publisher: source.publisher, societyOrRegulator: 'FDA labeling via DailyMed', effectiveDate: source.effectiveDate,
    sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${source.setId}`,
    externalIdentifier: `DailyMed SETID ${source.setId}; ${source.applicationNumber}`,
    jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT',
    metadata: {
      setId: source.setId, applicationNumber: source.applicationNumber, route: definition.route,
      dosageForm: definition.dosageForm, representativeIdentityOnly: true,
      indicationNotInferred: true, transplantContextNotInferred: true, autoimmuneContextNotInferred: true,
      regimenNotInferred: true, doseNotInferred: true, tpmtNudt15StatusNotInferred: true,
      bloodCountNotInferred: true, infectionDecisionReviewOnly: true, interactionDecisionReviewOnly: true,
      marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false,
      formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false,
    },
  };
});
const sourceByMedication = new Map(sourceData.map((source) => [source.medicationId, source.id]));

export const azathioprineIdentityAtoms: EvidenceAtom[] = azathioprineIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication.get(product.medicationId)!, version: 1 },
  claim: `Direct DailyMed labeling supports ${product.genericName} as a ${product.route.toLowerCase()} ${product.dosageForm.toLowerCase()} azathioprine identity.`,
  normalizedTopic: 'azathioprine-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: ['ING-azathioprine'], drugClassIds: ['CLS-antimetabolite-immunosuppressant'], contextTags: ['route-form-identity', 'specialist-review-only'] },
  locator: { section: 'Boxed Warning; Description; Indications and Usage; Precautions; Product Information; Marketing Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, salt context, brand identity, and application provenance only; it does not authenticate a patient-specific strength, dose, regimen, manufacturer, NDC, package, adherence, laboratory result, genotype/phenotype, or current commercial availability.',
    'IMURAN oral tablet and azathioprine sodium intravenous injection remain route/form-specific identities; bare azathioprine fails closed and no oral-to-intravenous conversion or substitution is authorized.',
    'Transplant versus autoimmune or other indication, current multidrug regimen, last dose, TPMT/NUDT15 status, blood counts, renal/hepatic function, interacting drugs including xanthine-oxidase inhibitors, infection status, GI toxicity, malignancy risk, and oral tolerance require specialist and clinician review.',
    'No autonomous continuation, interruption, dose arithmetic, conversion, substitution, route/form change, monitoring target, infection or interaction management, or restart timing is supported by this identity evidence.',
  ],
  retrieval: { title: `${product.genericName} identity`, summary: 'Direct DailyMed provenance supports this route/form medication-reconciliation identity.', keywords: [product.genericName, product.route, product.dosageForm], concepts: ['medication-identity', 'azathioprine', 'immunosuppression'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const azathioprineReviewRules: ClinicalRule[] = [{
  id: 'RULE-AZATHIOPRINE-SPECIALIST-REVIEW-001', version: 1,
  name: 'Explicit azathioprine product requires specialist and clinician review',
  scope: { medicationIds: azathioprineIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: azathioprineIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];

export const azathioprineIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt,
  sources: azathioprineIdentitySources, atoms: azathioprineIdentityAtoms,
};
