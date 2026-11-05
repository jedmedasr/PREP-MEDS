import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-07T05:05:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId = 'MED-garlic-oral-supplement' | 'MED-ginkgo-biloba-oral-supplement' | 'MED-asian-ginseng-oral-supplement' | 'MED-st-johns-wort-oral-supplement' | 'MED-valerian-oral-supplement' | 'MED-kava-oral-supplement';
type IngredientId = 'ING-garlic' | 'ING-ginkgo-biloba' | 'ING-panax-ginseng' | 'ING-hypericum-perforatum' | 'ING-valeriana-officinalis' | 'ING-piper-methysticum';

export interface PeriproceduralHerbalSupplementIdentityDefinition {
  medicationId: MedicationId;
  ingredientId: IngredientId;
  genericName: string;
  reviewContexts: string[];
  evidenceRef: { id: string; version: number };
}

export const periproceduralHerbalSupplementIdentityDefinitions: PeriproceduralHerbalSupplementIdentityDefinition[] = [
  { medicationId: 'MED-garlic-oral-supplement', ingredientId: 'ING-garlic', genericName: 'garlic oral dietary supplement', reviewContexts: ['bleeding', 'anticoagulant-or-antiplatelet-interaction'], evidenceRef: { id: 'EVD-GARLIC-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
  { medicationId: 'MED-ginkgo-biloba-oral-supplement', ingredientId: 'ING-ginkgo-biloba', genericName: 'Ginkgo biloba oral dietary supplement', reviewContexts: ['bleeding', 'anticoagulant-interaction'], evidenceRef: { id: 'EVD-GINKGO-BILOBA-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
  { medicationId: 'MED-asian-ginseng-oral-supplement', ingredientId: 'ING-panax-ginseng', genericName: 'Asian ginseng oral dietary supplement', reviewContexts: ['clotting', 'glucose', 'medication-interaction'], evidenceRef: { id: 'EVD-ASIAN-GINSENG-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
  { medicationId: 'MED-st-johns-wort-oral-supplement', ingredientId: 'ING-hypericum-perforatum', genericName: "St. John's wort oral dietary supplement", reviewContexts: ['drug-interaction', 'serotonergic', 'transplant-anticoagulant-antiepileptic-interaction'], evidenceRef: { id: 'EVD-ST-JOHNS-WORT-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
  { medicationId: 'MED-valerian-oral-supplement', ingredientId: 'ING-valeriana-officinalis', genericName: 'valerian oral dietary supplement', reviewContexts: ['sedation', 'chronic-use-withdrawal', 'alcohol-or-sedative-interaction'], evidenceRef: { id: 'EVD-VALERIAN-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
  { medicationId: 'MED-kava-oral-supplement', ingredientId: 'ING-piper-methysticum', genericName: 'kava oral dietary supplement', reviewContexts: ['sedation', 'alcohol-or-sedative-interaction', 'hepatic'], evidenceRef: { id: 'EVD-KAVA-ORAL-SUPPLEMENT-PERIPROCEDURAL-CONTEXT', version: 1 } },
];

const nonAuthorizing = { supplementIdentityOnly: true, productCompositionAuthenticated: false, marketAvailabilityAsserted: false, substitutionAuthorized: false, formulationConversionAuthorized: false, doseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false };
const source = (id: string, title: string, url: string, effectiveDate: string, metadata: Record<string, string | number | boolean>): SourceDocument => ({
  id, version: 1, sourceType: 'OTHER', title, publisher: 'National Center for Complementary and Integrative Health (NCCIH), NIH', societyOrRegulator: 'U.S. National Institutes of Health', effectiveDate, sourceUrl: url, jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { routeContext: 'ORAL', regulatoryContext: 'DIETARY_SUPPLEMENT_NOT_PREMARKET_FDA_APPROVED', ...metadata, ...nonAuthorizing },
});

export const periproceduralHerbalSupplementIdentitySources: SourceDocument[] = [
  source('SRC-NCCIH-GARLIC-2025', 'Garlic: Usefulness and Safety', 'https://www.nccih.nih.gov/health/garlic', '2025-02-01', { latinName: 'Allium sativum' }),
  source('SRC-NCCIH-GINKGO-2025', 'Ginkgo: Usefulness and Safety', 'https://www.nccih.nih.gov/health/ginkgo', '2025-02-01', { latinName: 'Ginkgo biloba' }),
  source('SRC-NCCIH-ASIAN-GINSENG-2025', 'Asian Ginseng: Usefulness and Safety', 'https://www.nccih.nih.gov/health/asian-ginseng', '2025-02-01', { latinName: 'Panax ginseng' }),
  source('SRC-NCCIH-ST-JOHNS-WORT-2025', "St. John's Wort: Usefulness and Safety", 'https://www.nccih.nih.gov/health/st-johns-wort', '2025-05-01', { latinName: 'Hypericum perforatum' }),
  source('SRC-NCCIH-VALERIAN-2025', 'Valerian: Usefulness and Safety', 'https://www.nccih.nih.gov/health/valerian', '2025-05-01', { latinName: 'Valeriana officinalis' }),
  source('SRC-NCCIH-KAVA-2025', 'Kava: Usefulness and Safety', 'https://www.nccih.nih.gov/health/kava', '2025-05-01', { latinName: 'Piper methysticum' }),
];

const sourceByMedication: Record<MedicationId, string> = Object.fromEntries(periproceduralHerbalSupplementIdentityDefinitions.map((definition, index) => [definition.medicationId, periproceduralHerbalSupplementIdentitySources[index]!.id])) as Record<MedicationId, string>;
export const periproceduralHerbalSupplementIdentityAtoms: EvidenceAtom[] = periproceduralHerbalSupplementIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: `NCCIH identifies ${product.genericName} and describes safety or medication-interaction context relevant to accountable peri-procedural review: ${product.reviewContexts.join(', ')}.`,
  normalizedTopic: 'periprocedural-herbal-supplement-identity-and-safety-context', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: [product.ingredientId], drugClassIds: ['CLS-herbal-dietary-supplement'], contextTags: ['otc-herbal-review', ...product.reviewContexts] },
  locator: { section: 'Common Names; Latin Names; What Do We Know About Safety?; Federal Regulation of Herbal Products' },
  limitations: [
    'The source supports an ingredient-level dietary-supplement identity and described safety context; it does not authenticate a patient-specific brand, extract, plant part, preparation, formulation, dose, purity, potency, combination product, schedule, indication, adherence, or current availability.',
    'Dietary supplements are not FDA-approved before sale; reported names do not establish whole-product composition. Combination products, uncertain ingredients, or unclear preparations must fail closed to accountable medication reconciliation.',
    'Evidence uncertainty, co-medications, comorbidities, bleeding and procedural context, sedation or withdrawal context, hepatic status, and local policy require clinician, pharmacy, anesthesia, and procedural-team review.',
    'No autonomous continuation, interruption, taper, restart, hold interval, substitution, dose change, administration plan, anesthesia plan, or procedural timing is supported.',
  ],
  retrieval: { title: product.genericName + ' review context', summary: 'Authoritative federal health information supports bounded identity and review-only safety context.', keywords: [product.genericName, ...product.reviewContexts], concepts: ['dietary-supplement', 'herbal', 'medication-reconciliation', ...product.reviewContexts], sourceAuthorityRank: 95 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const periproceduralHerbalSupplementReviewRules: ClinicalRule[] = [{
  id: 'RULE-PERIPROCEDURAL-HERBAL-SUPPLEMENT-REVIEW-001', version: 1, name: 'Explicit high-impact herbal supplement identity requires clinician, pharmacy, anesthesia, and procedural-team review',
  scope: { medicationIds: periproceduralHerbalSupplementIdentityDefinitions.map((product) => product.medicationId), procedureCodes: [...procedures] }, requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW', evidenceRefs: periproceduralHerbalSupplementIdentityDefinitions.map((product) => product.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 95,
}];

export const periproceduralHerbalSupplementIdentityEvidence: EvidenceBundle = { schemaVersion: '1.0.0', generatedAt: retrievedAt, sources: periproceduralHerbalSupplementIdentitySources, atoms: periproceduralHerbalSupplementIdentityAtoms };
