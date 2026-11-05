import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T12:15:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-symbicort-budesonide-formoterol-metered-aerosol'
  | 'MED-advair-hfa-fluticasone-salmeterol-metered-aerosol'
  | 'MED-advair-diskus-fluticasone-salmeterol-dry-powder'
  | 'MED-breo-ellipta-fluticasone-vilanterol-dry-powder'
  | 'MED-dulera-mometasone-formoterol-metered-aerosol'
  | 'MED-trelegy-ellipta-fluticasone-umeclidinium-vilanterol-dry-powder'
  | 'MED-breztri-aerosphere-budesonide-glycopyrrolate-formoterol-metered-aerosol';
type IngredientId =
  | 'ING-budesonide' | 'ING-formoterol' | 'ING-fluticasone-propionate' | 'ING-salmeterol'
  | 'ING-fluticasone-furoate' | 'ING-vilanterol' | 'ING-mometasone-furoate'
  | 'ING-umeclidinium' | 'ING-glycopyrrolate';

export interface PulmonaryControllerCombinationIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'AEROSOL, METERED' | 'POWDER, METERED';
  deviceContext: 'PRESSURIZED_METERED_DOSE_INHALER' | 'DISKUS_DRY_POWDER_INHALER' | 'ELLIPTA_DRY_POWDER_INHALER' | 'AEROSPHERE_PRESSURIZED_METERED_DOSE_INHALER';
  combinationContext: 'ICS_LABA' | 'ICS_LAMA_LABA';
  wholeProductContext: 'SYMBICORT' | 'ADVAIR_HFA' | 'ADVAIR_DISKUS' | 'BREO_ELLIPTA' | 'DULERA' | 'TRELEGY_ELLIPTA' | 'BREZTRI_AEROSPHERE';
  evidenceRef: { id: string; version: number };
}

export const pulmonaryControllerCombinationIdentityDefinitions: PulmonaryControllerCombinationIdentityDefinition[] = [
  { medicationId: 'MED-symbicort-budesonide-formoterol-metered-aerosol', ingredientIds: ['ING-budesonide', 'ING-formoterol'], genericName: 'budesonide and formoterol fumarate', dosageForm: 'AEROSOL, METERED', deviceContext: 'PRESSURIZED_METERED_DOSE_INHALER', combinationContext: 'ICS_LABA', wholeProductContext: 'SYMBICORT', evidenceRef: { id: 'EVD-SYMBICORT-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-advair-hfa-fluticasone-salmeterol-metered-aerosol', ingredientIds: ['ING-fluticasone-propionate', 'ING-salmeterol'], genericName: 'fluticasone propionate and salmeterol', dosageForm: 'AEROSOL, METERED', deviceContext: 'PRESSURIZED_METERED_DOSE_INHALER', combinationContext: 'ICS_LABA', wholeProductContext: 'ADVAIR_HFA', evidenceRef: { id: 'EVD-ADVAIR-HFA-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-advair-diskus-fluticasone-salmeterol-dry-powder', ingredientIds: ['ING-fluticasone-propionate', 'ING-salmeterol'], genericName: 'fluticasone propionate and salmeterol', dosageForm: 'POWDER, METERED', deviceContext: 'DISKUS_DRY_POWDER_INHALER', combinationContext: 'ICS_LABA', wholeProductContext: 'ADVAIR_DISKUS', evidenceRef: { id: 'EVD-ADVAIR-DISKUS-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-breo-ellipta-fluticasone-vilanterol-dry-powder', ingredientIds: ['ING-fluticasone-furoate', 'ING-vilanterol'], genericName: 'fluticasone furoate and vilanterol', dosageForm: 'POWDER, METERED', deviceContext: 'ELLIPTA_DRY_POWDER_INHALER', combinationContext: 'ICS_LABA', wholeProductContext: 'BREO_ELLIPTA', evidenceRef: { id: 'EVD-BREO-ELLIPTA-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-dulera-mometasone-formoterol-metered-aerosol', ingredientIds: ['ING-mometasone-furoate', 'ING-formoterol'], genericName: 'mometasone furoate and formoterol fumarate', dosageForm: 'AEROSOL, METERED', deviceContext: 'PRESSURIZED_METERED_DOSE_INHALER', combinationContext: 'ICS_LABA', wholeProductContext: 'DULERA', evidenceRef: { id: 'EVD-DULERA-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-trelegy-ellipta-fluticasone-umeclidinium-vilanterol-dry-powder', ingredientIds: ['ING-fluticasone-furoate', 'ING-umeclidinium', 'ING-vilanterol'], genericName: 'fluticasone furoate, umeclidinium, and vilanterol', dosageForm: 'POWDER, METERED', deviceContext: 'ELLIPTA_DRY_POWDER_INHALER', combinationContext: 'ICS_LAMA_LABA', wholeProductContext: 'TRELEGY_ELLIPTA', evidenceRef: { id: 'EVD-TRELEGY-ELLIPTA-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-breztri-aerosphere-budesonide-glycopyrrolate-formoterol-metered-aerosol', ingredientIds: ['ING-budesonide', 'ING-glycopyrrolate', 'ING-formoterol'], genericName: 'budesonide, glycopyrrolate, and formoterol fumarate', dosageForm: 'AEROSOL, METERED', deviceContext: 'AEROSPHERE_PRESSURIZED_METERED_DOSE_INHALER', combinationContext: 'ICS_LAMA_LABA', wholeProductContext: 'BREZTRI_AEROSPHERE', evidenceRef: { id: 'EVD-BREZTRI-AEROSPHERE-WHOLE-PRODUCT-IDENTITY', version: 1 } },
];

const sources: SourceDocument[] = [
  { id: 'SRC-SYMBICORT-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'SYMBICORT budesonide/formoterol metered inhalation aerosol labeling', publisher: 'A-S Medication Solutions; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-10-22', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6b78d08a-e098-4188-8f7f-94fbd5f396ef', externalIdentifier: 'DailyMed SETID 6b78d08a-e098-4188-8f7f-94fbd5f396ef', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { repackagedLabel: true, wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-ADVAIR-HFA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ADVAIR HFA fluticasone propionate/salmeterol metered inhalation aerosol labeling', publisher: 'GlaxoSmithKline LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-05-23', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dfaca6f9-3277-47b2-319d-1377917cb54c', externalIdentifier: 'DailyMed SETID dfaca6f9-3277-47b2-319d-1377917cb54c', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-ADVAIR-DISKUS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ADVAIR DISKUS fluticasone propionate/salmeterol inhalation powder labeling', publisher: 'GlaxoSmithKline LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-03-26', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4eeb5f6a-593f-4a9e-9692-adefa2caf8fc', externalIdentifier: 'DailyMed SETID 4eeb5f6a-593f-4a9e-9692-adefa2caf8fc', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-BREO-ELLIPTA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'BREO ELLIPTA fluticasone furoate/vilanterol inhalation powder labeling', publisher: 'GlaxoSmithKline LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-11-07', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=96428df1-ea05-431a-98d3-1ec2c4b63878', externalIdentifier: 'DailyMed SETID 96428df1-ea05-431a-98d3-1ec2c4b63878', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-DULERA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'DULERA mometasone furoate/formoterol metered inhalation aerosol labeling', publisher: 'Organon LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-07-10', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8f399784-f257-4f31-b3dc-368bf2a1864d', externalIdentifier: 'DailyMed SETID 8f399784-f257-4f31-b3dc-368bf2a1864d', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-TRELEGY-ELLIPTA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'TRELEGY ELLIPTA fluticasone furoate/umeclidinium/vilanterol inhalation powder labeling', publisher: 'GlaxoSmithKline LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2023-06-02', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b5a81d5a-4648-4c7a-951d-33c014a63c7e', externalIdentifier: 'DailyMed SETID b5a81d5a-4648-4c7a-951d-33c014a63c7e', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, tripleTherapyIdentity: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
  { id: 'SRC-BREZTRI-AEROSPHERE-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'BREZTRI AEROSPHERE budesonide/glycopyrrolate/formoterol metered inhalation aerosol labeling', publisher: 'AstraZeneca Pharmaceuticals LP; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-04-27', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=715433dc-cb2b-43ea-b6df-c5b4177adc6c', externalIdentifier: 'DailyMed SETID 715433dc-cb2b-43ea-b6df-c5b4177adc6c', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { wholeCombinationProduct: true, tripleTherapyIdentity: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, componentSplittingAuthorized: false, deviceConversionAuthorized: false, timingRuleAuthorized: false, clinicalApprovalGranted: false } },
];

const sourceByProduct: Record<PulmonaryControllerCombinationIdentityDefinition['wholeProductContext'], string> = {
  SYMBICORT: 'SRC-SYMBICORT-DAILYMED', ADVAIR_HFA: 'SRC-ADVAIR-HFA-DAILYMED',
  ADVAIR_DISKUS: 'SRC-ADVAIR-DISKUS-DAILYMED', BREO_ELLIPTA: 'SRC-BREO-ELLIPTA-DAILYMED',
  DULERA: 'SRC-DULERA-DAILYMED', TRELEGY_ELLIPTA: 'SRC-TRELEGY-ELLIPTA-DAILYMED',
  BREZTRI_AEROSPHERE: 'SRC-BREZTRI-AEROSPHERE-DAILYMED',
};

export const pulmonaryControllerCombinationIdentityAtoms: EvidenceAtom[] = pulmonaryControllerCombinationIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByProduct[product.wholeProductContext], version: 1 },
  claim: 'Authoritative labeling supports ' + product.wholeProductContext.replaceAll('_', ' ') + ' as a distinct inhaled ' + product.dosageForm.toLowerCase() + ' whole-product identity containing ' + product.genericName + ' with ' + product.deviceContext.toLowerCase() + ' context.',
  normalizedTopic: 'pulmonary-controller-combination-product-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: ['CLS-pulmonary-controller-combination'], contextTags: ['whole-product-device-combination-identity', 'airway-anesthesia-review-only'] },
  locator: { section: 'Indications and Usage; Dosage Forms and Strengths; Description; Product Information' },
  limitations: [
    'The source authenticates ingredient composition, inhaled form, device context, and whole-product identity only; patient-specific product, strength, regimen, indication, technique, adherence, manufacturer, and current availability are not inferred.',
    'ICS/LABA and ICS/LAMA/LABA products, metered aerosols, DISKUS powder, ELLIPTA powder, and AEROSPHERE aerosol remain distinct and are not automatically substituted, converted, split, or recombined.',
    'Asthma/COPD diagnosis and control, recent exacerbation, systemic-steroid exposure, rescue use, oxygen/current symptoms, infection, device technique and availability, rhythm/hemodynamic concerns, anticholinergic precautions, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, component splitting, ingredient/device/strength conversion, substitution, administration timing, dose arithmetic, monitoring, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.wholeProductContext.replaceAll('_', ' ') + ' identity', summary: 'Authoritative labeling supports this device- and whole-combination-specific controller identity.', keywords: [product.genericName, product.dosageForm, product.deviceContext], concepts: ['medication-identity', 'pulmonary-controller', 'airway-anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

export const pulmonaryControllerCombinationReviewRules: ClinicalRule[] = [{
  id: 'RULE-PULMONARY-CONTROLLER-COMBINATION-REVIEW-001', version: 1,
  name: 'Explicit pulmonary controller combination requires clinician and anesthesia review',
  scope: { medicationIds: pulmonaryControllerCombinationIdentityDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
  requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
  evidenceRefs: pulmonaryControllerCombinationIdentityDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 94,
}];

export const pulmonaryControllerCombinationIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: pulmonaryControllerCombinationIdentityAtoms,
};
