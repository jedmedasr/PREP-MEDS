import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T10:55:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-ventolin-hfa-albuterol-inhalation-aerosol'
  | 'MED-albuterol-sulfate-nebulizer-solution'
  | 'MED-xopenex-hfa-levalbuterol-inhalation-aerosol'
  | 'MED-xopenex-levalbuterol-nebulizer-concentrate'
  | 'MED-atrovent-hfa-ipratropium-inhalation-aerosol'
  | 'MED-ipratropium-bromide-nebulizer-solution'
  | 'MED-combivent-respimat-ipratropium-albuterol-inhalation-spray'
  | 'MED-ipratropium-albuterol-nebulizer-solution';
type IngredientId = 'ING-albuterol' | 'ING-levalbuterol' | 'ING-ipratropium';

export interface PulmonaryRescueIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: [IngredientId] | [IngredientId, IngredientId];
  genericName: string;
  dosageForm: 'AEROSOL, METERED' | 'SOLUTION, CONCENTRATE' | 'SOLUTION' | 'SPRAY, METERED';
  deliveryContext: 'PRESSURIZED_METERED_DOSE_INHALER' | 'NEBULIZER' | 'RESPIMAT';
  wholeProductContext: 'VENTOLIN_HFA' | 'GENERIC_ALBUTEROL_NEBULIZER' | 'XOPENEX_HFA' | 'XOPENEX_NEBULIZER' | 'ATROVENT_HFA' | 'GENERIC_IPRATROPIUM_NEBULIZER' | 'COMBIVENT_RESPIMAT' | 'GENERIC_IPRATROPIUM_ALBUTEROL_NEBULIZER';
  evidenceRef: { id: string; version: number };
}

export const pulmonaryRescueIdentityDefinitions: PulmonaryRescueIdentityDefinition[] = [
  { medicationId: 'MED-ventolin-hfa-albuterol-inhalation-aerosol', ingredientIds: ['ING-albuterol'], genericName: 'albuterol sulfate', dosageForm: 'AEROSOL, METERED', deliveryContext: 'PRESSURIZED_METERED_DOSE_INHALER', wholeProductContext: 'VENTOLIN_HFA', evidenceRef: { id: 'EVD-VENTOLIN-HFA-ALBUTEROL-AEROSOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-albuterol-sulfate-nebulizer-solution', ingredientIds: ['ING-albuterol'], genericName: 'albuterol sulfate', dosageForm: 'SOLUTION, CONCENTRATE', deliveryContext: 'NEBULIZER', wholeProductContext: 'GENERIC_ALBUTEROL_NEBULIZER', evidenceRef: { id: 'EVD-ALBUTEROL-NEBULIZER-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-xopenex-hfa-levalbuterol-inhalation-aerosol', ingredientIds: ['ING-levalbuterol'], genericName: 'levalbuterol tartrate', dosageForm: 'AEROSOL, METERED', deliveryContext: 'PRESSURIZED_METERED_DOSE_INHALER', wholeProductContext: 'XOPENEX_HFA', evidenceRef: { id: 'EVD-XOPENEX-HFA-LEVALBUTEROL-AEROSOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-xopenex-levalbuterol-nebulizer-concentrate', ingredientIds: ['ING-levalbuterol'], genericName: 'levalbuterol hydrochloride', dosageForm: 'SOLUTION, CONCENTRATE', deliveryContext: 'NEBULIZER', wholeProductContext: 'XOPENEX_NEBULIZER', evidenceRef: { id: 'EVD-XOPENEX-LEVALBUTEROL-NEBULIZER-IDENTITY', version: 1 } },
  { medicationId: 'MED-atrovent-hfa-ipratropium-inhalation-aerosol', ingredientIds: ['ING-ipratropium'], genericName: 'ipratropium bromide', dosageForm: 'AEROSOL, METERED', deliveryContext: 'PRESSURIZED_METERED_DOSE_INHALER', wholeProductContext: 'ATROVENT_HFA', evidenceRef: { id: 'EVD-ATROVENT-HFA-IPRATROPIUM-AEROSOL-IDENTITY', version: 1 } },
  { medicationId: 'MED-ipratropium-bromide-nebulizer-solution', ingredientIds: ['ING-ipratropium'], genericName: 'ipratropium bromide', dosageForm: 'SOLUTION', deliveryContext: 'NEBULIZER', wholeProductContext: 'GENERIC_IPRATROPIUM_NEBULIZER', evidenceRef: { id: 'EVD-IPRATROPIUM-NEBULIZER-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-combivent-respimat-ipratropium-albuterol-inhalation-spray', ingredientIds: ['ING-ipratropium', 'ING-albuterol'], genericName: 'ipratropium bromide and albuterol sulfate', dosageForm: 'SPRAY, METERED', deliveryContext: 'RESPIMAT', wholeProductContext: 'COMBIVENT_RESPIMAT', evidenceRef: { id: 'EVD-COMBIVENT-RESPIMAT-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-ipratropium-albuterol-nebulizer-solution', ingredientIds: ['ING-ipratropium', 'ING-albuterol'], genericName: 'ipratropium bromide and albuterol sulfate', dosageForm: 'SOLUTION', deliveryContext: 'NEBULIZER', wholeProductContext: 'GENERIC_IPRATROPIUM_ALBUTEROL_NEBULIZER', evidenceRef: { id: 'EVD-IPRATROPIUM-ALBUTEROL-NEBULIZER-WHOLE-PRODUCT-IDENTITY', version: 1 } },
];

const sources: SourceDocument[] = [
  { id: 'SRC-VENTOLIN-HFA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'VENTOLIN HFA albuterol sulfate metered inhalation aerosol labeling', publisher: 'GlaxoSmithKline LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-04-26', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d92c5d6b-ff10-4087-36a2-1cfc464cb967', externalIdentifier: 'DailyMed SETID d92c5d6b-ff10-4087-36a2-1cfc464cb967', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { marketAvailabilityAsserted: false, substitutionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-ALBUTEROL-NEBULIZER-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Albuterol sulfate inhalation solution concentrate labeling', publisher: 'Rising Pharma Holdings, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-07-16', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3236f82c-14e9-dfd4-e063-6294a90ac43d', externalIdentifier: 'DailyMed SETID 3236f82c-14e9-dfd4-e063-6294a90ac43d', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-XOPENEX-HFA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'XOPENEX HFA levalbuterol tartrate metered inhalation aerosol labeling', publisher: 'Lupin Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-06-02', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=70a35706-d7a8-4a48-98c6-1cab1c42fe8d', externalIdentifier: 'DailyMed SETID 70a35706-d7a8-4a48-98c6-1cab1c42fe8d', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { marketAvailabilityAsserted: false, substitutionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-XOPENEX-NEBULIZER-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'XOPENEX levalbuterol hydrochloride inhalation solution concentrate labeling', publisher: 'Akorn; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2022-09-14', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0c47c47d-45f7-4eb4-b1f8-7d6c633a1f69', externalIdentifier: 'DailyMed SETID 0c47c47d-45f7-4eb4-b1f8-7d6c633a1f69', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { historicalLabelContext: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, dilutionInstructionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-ATROVENT-HFA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ATROVENT HFA ipratropium bromide metered inhalation aerosol labeling', publisher: 'Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-11-05', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=170e98ef-5560-4068-be7d-e649068eb884', externalIdentifier: 'DailyMed SETID 170e98ef-5560-4068-be7d-e649068eb884', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { marketAvailabilityAsserted: false, substitutionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-IPRATROPIUM-NEBULIZER-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Ipratropium bromide inhalation solution labeling', publisher: 'A-S Medication Solutions; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-01-08', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7159cf05-da58-4eb9-9e6d-a7f24eec5f46', externalIdentifier: 'DailyMed SETID 7159cf05-da58-4eb9-9e6d-a7f24eec5f46', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, repackagedLabel: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-COMBIVENT-RESPIMAT-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'COMBIVENT RESPIMAT ipratropium bromide and albuterol metered inhalation spray labeling', publisher: 'Boehringer Ingelheim Pharmaceuticals, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-12-01', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9832312e-0310-4ab6-8501-afa976fc7eb2', externalIdentifier: 'DailyMed SETID 9832312e-0310-4ab6-8501-afa976fc7eb2', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-IPRATROPIUM-ALBUTEROL-NEBULIZER-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'Ipratropium bromide and albuterol sulfate inhalation solution labeling', publisher: 'American Health Packaging; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-06-03', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c04c6ec8-1401-424d-8126-63080e36c4b9', externalIdentifier: 'DailyMed SETID c04c6ec8-1401-424d-8126-63080e36c4b9', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { representativeIdentityOnly: true, wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
];

const sourceByProduct: Record<PulmonaryRescueIdentityDefinition['wholeProductContext'], string> = {
  VENTOLIN_HFA: 'SRC-VENTOLIN-HFA-DAILYMED',
  GENERIC_ALBUTEROL_NEBULIZER: 'SRC-ALBUTEROL-NEBULIZER-DAILYMED',
  XOPENEX_HFA: 'SRC-XOPENEX-HFA-DAILYMED',
  XOPENEX_NEBULIZER: 'SRC-XOPENEX-NEBULIZER-DAILYMED',
  ATROVENT_HFA: 'SRC-ATROVENT-HFA-DAILYMED',
  GENERIC_IPRATROPIUM_NEBULIZER: 'SRC-IPRATROPIUM-NEBULIZER-DAILYMED',
  COMBIVENT_RESPIMAT: 'SRC-COMBIVENT-RESPIMAT-DAILYMED',
  GENERIC_IPRATROPIUM_ALBUTEROL_NEBULIZER: 'SRC-IPRATROPIUM-ALBUTEROL-NEBULIZER-DAILYMED',
};

export const pulmonaryRescueIdentityAtoms: EvidenceAtom[] = pulmonaryRescueIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByProduct[product.wholeProductContext], version: 1 },
  claim: 'Authoritative labeling supports ' + product.wholeProductContext.replaceAll('_', ' ') + ' as a distinct inhaled ' + product.dosageForm.toLowerCase() + ' identity containing ' + product.genericName + ' with ' + product.deliveryContext.toLowerCase() + ' delivery context.',
  normalizedTopic: 'pulmonary-rescue-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-pulmonary-bronchodilator'], contextTags: ['route-form-device-combination-identity', 'airway-anesthesia-review-only'] },
  locator: { section: 'Dosage Forms and Strengths; Description; Product Information; Instructions for Use' },
  limitations: [
    'The source authenticates ingredient, inhaled dosage form, delivery context, and whole-product identity only; patient-specific product, dose, regimen, indication, technique, device availability, manufacturer, and current availability are not inferred.',
    'Metered-dose inhalers, Respimat spray, nebulizer solutions, albuterol, levalbuterol, ipratropium, and ipratropium/albuterol whole products remain distinct and are not automatically substituted, converted, split, or combined.',
    'Airway diagnosis and control, rescue use frequency, recent exacerbation, oxygen requirement, current symptoms, device technique and availability, cardiac rhythm/hemodynamic concerns, anticholinergic precautions, oral/inhaled feasibility, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, mixing, dilution, device or ingredient conversion, component splitting, substitution, administration timing, dose arithmetic, monitoring, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.wholeProductContext.replaceAll('_', ' ') + ' identity', summary: 'Authoritative product labeling supports this route/form/device/combination-specific reconciliation identity.', keywords: [product.genericName, product.dosageForm, product.deliveryContext], concepts: ['medication-identity', 'pulmonary-rescue', 'airway-anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const pulmonaryRescueReviewRules: ClinicalRule[] = [{
  id: 'RULE-PULMONARY-RESCUE-AIRWAY-REVIEW-001', version: 1,
  name: 'Explicit rescue bronchodilator product requires clinician and anesthesia review',
  scope: { medicationIds: pulmonaryRescueIdentityDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: pulmonaryRescueIdentityDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 96,
}];

export const pulmonaryRescueIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: pulmonaryRescueIdentityAtoms,
};
