import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-10-03T17:48:00Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
type MedicationId =
  | 'MED-revatio-sildenafil-oral-tablet'
  | 'MED-revatio-sildenafil-oral-suspension'
  | 'MED-revatio-sildenafil-intravenous-injection'
  | 'MED-adcirca-tadalafil-oral-tablet'
  | 'MED-tracleer-bosentan-oral-tablet'
  | 'MED-tracleer-bosentan-tablet-for-oral-suspension'
  | 'MED-letairis-ambrisentan-oral-tablet'
  | 'MED-opsumit-macitentan-oral-tablet'
  | 'MED-opsynvi-macitentan-tadalafil-oral-tablet'
  | 'MED-adempas-riociguat-oral-tablet'
  | 'MED-winrevair-sotatercept-subcutaneous-injection'
  | 'MED-ventavis-iloprost-inhalation-solution'
  | 'MED-aurlumyn-iloprost-intravenous-injection';
type IngredientId = 'ING-sildenafil' | 'ING-tadalafil' | 'ING-bosentan' | 'ING-ambrisentan' | 'ING-macitentan' | 'ING-riociguat' | 'ING-sotatercept-csrk' | 'ING-iloprost';

export interface PulmonaryHypertensionVasodilatorIdentityDefinition {
  medicationId: MedicationId;
  ingredientIds: IngredientId[];
  genericName: string;
  dosageForm: 'TABLET, FILM COATED' | 'POWDER, FOR SUSPENSION' | 'INJECTION, SOLUTION' | 'TABLET, FOR SUSPENSION' | 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION' | 'SOLUTION';
  routeContext: 'ORAL' | 'INTRAVENOUS' | 'SUBCUTANEOUS' | 'RESPIRATORY_TRACT';
  productContext: 'PAH_PDE5' | 'PAH_ERA' | 'PAH_ERA_PDE5_FIXED_COMBINATION' | 'PAH_SGC_STIMULATOR' | 'PAH_ACTIVIN_SIGNALING_INHIBITOR' | 'PAH_INHALED_PROSTACYCLIN_MIMETIC' | 'NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD';
  evidenceRef: { id: string; version: number };
}

export const pulmonaryHypertensionVasodilatorIdentityDefinitions: PulmonaryHypertensionVasodilatorIdentityDefinition[] = [
  { medicationId: 'MED-revatio-sildenafil-oral-tablet', ingredientIds: ['ING-sildenafil'], genericName: 'sildenafil', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_PDE5', evidenceRef: { id: 'EVD-REVATIO-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-revatio-sildenafil-oral-suspension', ingredientIds: ['ING-sildenafil'], genericName: 'sildenafil', dosageForm: 'POWDER, FOR SUSPENSION', routeContext: 'ORAL', productContext: 'PAH_PDE5', evidenceRef: { id: 'EVD-REVATIO-ORAL-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-revatio-sildenafil-intravenous-injection', ingredientIds: ['ING-sildenafil'], genericName: 'sildenafil', dosageForm: 'INJECTION, SOLUTION', routeContext: 'INTRAVENOUS', productContext: 'PAH_PDE5', evidenceRef: { id: 'EVD-REVATIO-IV-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-adcirca-tadalafil-oral-tablet', ingredientIds: ['ING-tadalafil'], genericName: 'tadalafil', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_PDE5', evidenceRef: { id: 'EVD-ADCIRCA-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-tracleer-bosentan-oral-tablet', ingredientIds: ['ING-bosentan'], genericName: 'bosentan', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_ERA', evidenceRef: { id: 'EVD-TRACLEER-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-tracleer-bosentan-tablet-for-oral-suspension', ingredientIds: ['ING-bosentan'], genericName: 'bosentan', dosageForm: 'TABLET, FOR SUSPENSION', routeContext: 'ORAL', productContext: 'PAH_ERA', evidenceRef: { id: 'EVD-TRACLEER-TABLET-FOR-SUSPENSION-IDENTITY', version: 1 } },
  { medicationId: 'MED-letairis-ambrisentan-oral-tablet', ingredientIds: ['ING-ambrisentan'], genericName: 'ambrisentan', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_ERA', evidenceRef: { id: 'EVD-LETAIRIS-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-opsumit-macitentan-oral-tablet', ingredientIds: ['ING-macitentan'], genericName: 'macitentan', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_ERA', evidenceRef: { id: 'EVD-OPSUMIT-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-opsynvi-macitentan-tadalafil-oral-tablet', ingredientIds: ['ING-macitentan', 'ING-tadalafil'], genericName: 'macitentan and tadalafil', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_ERA_PDE5_FIXED_COMBINATION', evidenceRef: { id: 'EVD-OPSYNVI-WHOLE-PRODUCT-IDENTITY', version: 1 } },
  { medicationId: 'MED-adempas-riociguat-oral-tablet', ingredientIds: ['ING-riociguat'], genericName: 'riociguat', dosageForm: 'TABLET, FILM COATED', routeContext: 'ORAL', productContext: 'PAH_SGC_STIMULATOR', evidenceRef: { id: 'EVD-ADEMPAS-ORAL-TABLET-IDENTITY', version: 1 } },
  { medicationId: 'MED-winrevair-sotatercept-subcutaneous-injection', ingredientIds: ['ING-sotatercept-csrk'], genericName: 'sotatercept-csrk', dosageForm: 'INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION', routeContext: 'SUBCUTANEOUS', productContext: 'PAH_ACTIVIN_SIGNALING_INHIBITOR', evidenceRef: { id: 'EVD-WINREVAIR-SUBCUTANEOUS-INJECTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-ventavis-iloprost-inhalation-solution', ingredientIds: ['ING-iloprost'], genericName: 'iloprost', dosageForm: 'SOLUTION', routeContext: 'RESPIRATORY_TRACT', productContext: 'PAH_INHALED_PROSTACYCLIN_MIMETIC', evidenceRef: { id: 'EVD-VENTAVIS-INHALATION-SOLUTION-IDENTITY', version: 1 } },
  { medicationId: 'MED-aurlumyn-iloprost-intravenous-injection', ingredientIds: ['ING-iloprost'], genericName: 'iloprost', dosageForm: 'INJECTION, SOLUTION', routeContext: 'INTRAVENOUS', productContext: 'NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD', evidenceRef: { id: 'EVD-AURLUMYN-IV-ILOPROST-COLLISION-GUARD', version: 1 } },
];

const sourceMetadata = {
  representativeIdentityOnly: true,
  marketAvailabilityAsserted: false,
  substitutionAuthorized: false,
  routeConversionAuthorized: false,
  componentSplittingAuthorized: false,
  doseConversionAuthorized: false,
  timingRuleAuthorized: false,
  clinicalApprovalGranted: false,
};

const sources: SourceDocument[] = [
  { id: 'SRC-REVATIO-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'REVATIO sildenafil oral tablet, oral suspension, and intravenous injection labeling', publisher: 'Viatris Specialty LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2024-12-18', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3bb9363e-b28d-4019-8aae-539233dca214', externalIdentifier: 'DailyMed SETID 3bb9363e-b28d-4019-8aae-539233dca214', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-ADCIRCA-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ADCIRCA tadalafil oral tablet labeling', publisher: 'Eli Lilly and Company; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-12-15', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ff61b237-be8e-461b-8114-78c52a8ad0ae', externalIdentifier: 'DailyMed SETID ff61b237-be8e-461b-8114-78c52a8ad0ae', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-TRACLEER-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'TRACLEER bosentan oral tablet and tablet for oral suspension labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-11-17', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=749e42fb-2fe0-45dd-9268-b43bb3f4081c', externalIdentifier: 'DailyMed SETID 749e42fb-2fe0-45dd-9268-b43bb3f4081c', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-LETAIRIS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'LETAIRIS ambrisentan oral tablet labeling', publisher: 'Gilead Sciences, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-06-22', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=725d4e73-6c83-477a-adc6-0ae4a133a844', externalIdentifier: 'DailyMed SETID 725d4e73-6c83-477a-adc6-0ae4a133a844', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-OPSUMIT-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'OPSUMIT macitentan oral tablet labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-04-11', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e484a50-55db-4b85-8c57-6cd1b0353abd', externalIdentifier: 'DailyMed SETID 1e484a50-55db-4b85-8c57-6cd1b0353abd', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-OPSYNVI-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'OPSYNVI macitentan and tadalafil fixed-combination oral tablet labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2025-04-11', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6945b183-18d3-40de-afd1-c88e33cc1a63', externalIdentifier: 'DailyMed SETID 6945b183-18d3-40de-afd1-c88e33cc1a63', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, wholeCombinationProduct: true } },
  { id: 'SRC-ADEMPAS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'ADEMPAS riociguat oral tablet labeling', publisher: 'Bayer HealthCare Pharmaceuticals Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-08-13', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7b57509a-3d5d-41d4-8fed-1471e26372a3', externalIdentifier: 'DailyMed SETID 7b57509a-3d5d-41d4-8fed-1471e26372a3', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-WINREVAIR-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'WINREVAIR sotatercept-csrk subcutaneous injection kit labeling', publisher: 'Merck Sharp & Dohme LLC; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-08-12', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=21693ee2-cd23-4137-ac67-066bb3a4a9b7', externalIdentifier: 'DailyMed SETID 21693ee2-cd23-4137-ac67-066bb3a4a9b7', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: sourceMetadata },
  { id: 'SRC-VENTAVIS-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'VENTAVIS iloprost inhalation solution labeling', publisher: 'Actelion Pharmaceuticals US, Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d3bebc1c-f032-402a-bbc9-aff024276ed1', externalIdentifier: 'DailyMed SETID d3bebc1c-f032-402a-bbc9-aff024276ed1; revised 2022-03', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, inhalationDeviceContextRequired: true } },
  { id: 'SRC-AURLUMYN-DAILYMED', version: 1, sourceType: 'FDA_LABEL', title: 'AURLUMYN iloprost intravenous injection labeling', publisher: 'BTG International Inc.; DailyMed', societyOrRegulator: 'FDA-submitted SPL labeling via DailyMed', effectiveDate: '2026-06-08', sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=34036fc0-6832-d066-e063-6394a90a18a4', externalIdentifier: 'DailyMed SETID 34036fc0-6832-d066-e063-6394a90a18a4', jurisdiction: 'US', language: 'en', retrievedAt, lifecycle: 'DRAFT', metadata: { ...sourceMetadata, nonPahCollisionGuard: true } },
];

const sourceByMedication: Record<MedicationId, string> = {
  'MED-revatio-sildenafil-oral-tablet': 'SRC-REVATIO-DAILYMED',
  'MED-revatio-sildenafil-oral-suspension': 'SRC-REVATIO-DAILYMED',
  'MED-revatio-sildenafil-intravenous-injection': 'SRC-REVATIO-DAILYMED',
  'MED-adcirca-tadalafil-oral-tablet': 'SRC-ADCIRCA-DAILYMED',
  'MED-tracleer-bosentan-oral-tablet': 'SRC-TRACLEER-DAILYMED',
  'MED-tracleer-bosentan-tablet-for-oral-suspension': 'SRC-TRACLEER-DAILYMED',
  'MED-letairis-ambrisentan-oral-tablet': 'SRC-LETAIRIS-DAILYMED',
  'MED-opsumit-macitentan-oral-tablet': 'SRC-OPSUMIT-DAILYMED',
  'MED-opsynvi-macitentan-tadalafil-oral-tablet': 'SRC-OPSYNVI-DAILYMED',
  'MED-adempas-riociguat-oral-tablet': 'SRC-ADEMPAS-DAILYMED',
  'MED-winrevair-sotatercept-subcutaneous-injection': 'SRC-WINREVAIR-DAILYMED',
  'MED-ventavis-iloprost-inhalation-solution': 'SRC-VENTAVIS-DAILYMED',
  'MED-aurlumyn-iloprost-intravenous-injection': 'SRC-AURLUMYN-DAILYMED',
};

export const pulmonaryHypertensionVasodilatorIdentityAtoms: EvidenceAtom[] = pulmonaryHypertensionVasodilatorIdentityDefinitions.map((product) => ({
  id: product.evidenceRef.id, version: 1, source: { id: sourceByMedication[product.medicationId], version: 1 },
  claim: 'Authoritative labeling supports ' + product.medicationId + ' as a distinct ' + product.routeContext.toLowerCase() + ' ' + product.dosageForm.toLowerCase() + ' identity containing ' + product.genericName + '.',
  normalizedTopic: 'pulmonary-hypertension-vasodilator-route-form-combination-identity', stance: 'DESCRIPTIVE', evidenceStrength: 'NOT_GRADED',
  applicability: { medicationIds: [product.medicationId], ingredientIds: product.ingredientIds, drugClassIds: [product.productContext === 'NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD' ? 'CLS-iloprost-non-pah-collision-guard' : 'CLS-pulmonary-hypertension-therapy'], contextTags: ['route-form-combination-identity', 'hemodynamic-anesthesia-review-only', 'interaction-review-only'] },
  locator: { section: 'Indications and Usage; Dosage and Administration; Contraindications; Warnings and Precautions; Product Information' },
  limitations: [
    'The source authenticates ingredient, route, dosage form, branded-product, and whole-product identity only; patient-specific regimen, dose, indication, manufacturer, and current availability are not inferred.',
    'REVATIO oral tablet, suspension, and intravenous injection; TRACLEER tablet and tablet for suspension; single-agent products; OPSYNVI fixed combination; WINREVAIR injection; and inhaled versus intravenous iloprost remain distinct. Route, form, device, indication, ingredient, or product conversion is not authorized.',
    'PAH or CTEPH diagnosis and severity, current symptoms/decompensation, right-heart failure/hemodynamics, oxygen/ventilation, systemic blood pressure, nitrate/PDE5/sGC/antihypertensive interactions, hepatic/renal function, hemoglobin/platelets/bleeding context, pregnancy/REMS context, oral feasibility, device access, procedure/sedation context, and anesthesia plan require accountable clinician review.',
    'This evidence does not authorize continuation, interruption, substitution, component splitting, route or dosage-form conversion, dose arithmetic, monitoring targets, administration timing, anesthesia planning, or restart timing.',
  ],
  retrieval: { title: product.medicationId + ' identity', summary: 'Authoritative labeling supports this route-, form-, indication-, and whole-product-specific pulmonary vascular therapy identity.', keywords: [product.genericName, product.dosageForm, product.routeContext], concepts: ['medication-identity', 'pulmonary-hypertension', 'hemodynamic-review', 'anesthesia-review'], sourceAuthorityRank: 100 },
  lifecycle: 'DRAFT', createdAt: retrievedAt,
}));

const pahDefinitions = pulmonaryHypertensionVasodilatorIdentityDefinitions.filter((item) => item.productContext !== 'NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD');
const iloprostCollisionDefinition = pulmonaryHypertensionVasodilatorIdentityDefinitions.find((item) => item.productContext === 'NON_PAH_INTRAVENOUS_ILOPROST_COLLISION_GUARD')!;

export const pulmonaryHypertensionVasodilatorReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-PULMONARY-HYPERTENSION-VASODILATOR-REVIEW-001', version: 1,
    name: 'Explicit pulmonary-hypertension therapy identity requires clinician and anesthesia review',
    scope: { medicationIds: pahDefinitions.map((item) => item.medicationId), procedureCodes: [...procedures] },
    requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: pahDefinitions.map((item) => item.evidenceRef), status: 'TECHNICALLY_TESTED', priority: 100,
  },
  {
    id: 'RULE-ILOPROST-NON-PAH-COLLISION-REVIEW-001', version: 1,
    name: 'Intravenous non-PAH iloprost identity requires clinician review and cannot inherit VENTAVIS handling',
    scope: { medicationIds: [iloprostCollisionDefinition.medicationId], procedureCodes: [...procedures] },
    requiredModifierIds: [], disposition: 'CLINICIAN_REVIEW_REQUIRED', restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [iloprostCollisionDefinition.evidenceRef], status: 'TECHNICALLY_TESTED', priority: 100,
  },
];

export const pulmonaryHypertensionVasodilatorIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0', generatedAt: retrievedAt, sources, atoms: pulmonaryHypertensionVasodilatorIdentityAtoms,
};
