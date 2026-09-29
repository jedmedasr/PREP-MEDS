import type { ClinicalRule } from '@prep-meds/clinical-engine';
import type { EvidenceAtom, EvidenceBundle, SourceDocument } from '@prep-meds/evidence';

const retrievedAt = '2026-09-29T02:21:25Z';
const procedures = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'] as const;
const qternmetMedicationId = 'MED-dapagliflozin-saxagliptin-metformin-qternmet-xr' as const;

export interface Batch03QternIdentityDefinition {
  medicationId:
    | 'MED-dapagliflozin-saxagliptin-qtern'
    | 'MED-dapagliflozin-saxagliptin-generic-anda211533'
    | 'MED-dapagliflozin-saxagliptin-generic-anda211537'
    | 'MED-dapagliflozin-saxagliptin-metformin-qternmet-xr';
  canonicalName: string;
  genericName: string;
  brandNames: string[];
  aliases: string[];
  ingredientIds: string[];
  sourceRef: { id: string; version: number };
  evidenceRef: { id: string; version: number };
  reviewEvidenceRef: { id: string; version: number };
  marketingStatusEvidenceRef?: { id: string; version: number };
}

export const batch03QternIdentityDefinitions: Batch03QternIdentityDefinition[] = [
  {
    medicationId: 'MED-dapagliflozin-saxagliptin-qtern',
    canonicalName: 'Qtern',
    genericName: 'dapagliflozin and saxagliptin',
    brandNames: ['Qtern'],
    aliases: ['Qtern dapagliflozin saxagliptin', 'NDA209091'],
    ingredientIds: ['ING-dapagliflozin', 'ING-saxagliptin'],
    sourceRef: { id: 'SRC-B3-QTERN-SPL32', version: 1 },
    evidenceRef: { id: 'EVD-B3-QTERN-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-QTERN-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-dapagliflozin-saxagliptin-generic-anda211533',
    canonicalName: 'Dapagliflozin and saxagliptin (ANDA211533)',
    genericName: 'dapagliflozin and saxagliptin',
    brandNames: [],
    aliases: ['Novadoz dapagliflozin saxagliptin', 'MSN dapagliflozin saxagliptin', 'ANDA211533'],
    ingredientIds: ['ING-dapagliflozin', 'ING-saxagliptin'],
    sourceRef: { id: 'SRC-B3-DAPA-SAXA-ANDA211533-SPL1', version: 1 },
    evidenceRef: { id: 'EVD-B3-DAPA-SAXA-ANDA211533-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-DAPA-SAXA-ANDA211533-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: 'MED-dapagliflozin-saxagliptin-generic-anda211537',
    canonicalName: 'Dapagliflozin and saxagliptin (ANDA211537)',
    genericName: 'dapagliflozin and saxagliptin',
    brandNames: [],
    aliases: ['Torrent dapagliflozin saxagliptin', 'ANDA211537'],
    ingredientIds: ['ING-dapagliflozin', 'ING-saxagliptin'],
    sourceRef: { id: 'SRC-B3-DAPA-SAXA-ANDA211537-FDA-APPROVAL', version: 1 },
    evidenceRef: { id: 'EVD-B3-DAPA-SAXA-ANDA211537-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-DAPA-SAXA-ANDA211537-PROCEDURE-REVIEW', version: 1 },
  },
  {
    medicationId: qternmetMedicationId,
    canonicalName: 'Qternmet XR',
    genericName: 'dapagliflozin, saxagliptin, and metformin hydrochloride extended-release',
    brandNames: ['Qternmet XR'],
    aliases: ['Qternmet', 'Qternmet XR dapagliflozin saxagliptin metformin', 'NDA210874'],
    ingredientIds: ['ING-dapagliflozin', 'ING-saxagliptin', 'ING-metformin'],
    sourceRef: { id: 'SRC-B3-QTERNMET-XR-HISTORICAL-LABEL', version: 1 },
    evidenceRef: { id: 'EVD-B3-QTERNMET-XR-IDENTITY', version: 1 },
    reviewEvidenceRef: { id: 'EVD-B3-QTERNMET-XR-PROCEDURE-REVIEW', version: 1 },
    marketingStatusEvidenceRef: { id: 'EVD-B3-QTERNMET-XR-DISCONTINUED-STATUS', version: 1 },
  },
];

export const batch03QternIdentitySources: SourceDocument[] = [
  {
    id: 'SRC-B3-QTERN-SPL32',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'QTERN (dapagliflozin and saxagliptin) tablets: AstraZeneca labeling, SPL 32',
    publisher: 'AstraZeneca Pharmaceuticals LP; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    effectiveDate: '2026-06-03',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=423c489c-085b-4320-b892-7868ebd6dc6b',
    externalIdentifier: 'DailyMed SETID 423c489c-085b-4320-b892-7868ebd6dc6b; SPL version 32; NDA209091',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '423c489c-085b-4320-b892-7868ebd6dc6b',
      splVersion: 32,
      applicationNumber: 'NDA209091',
      route: 'ORAL',
      dosageForm: 'TABLET, FILM COATED',
      labelRevision: '2026-06',
      latestListedMarketingEndDate: '2026-02-28',
      historicalMarketingRecord: true,
      verificationScope: 'Historical branded product identity, application provenance, listed marketing-end metadata, and procedure-review provenance only',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-DAPA-SAXA-ANDA211533-SPL1',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'DAPAGLIFLOZIN AND SAXAGLIPTIN tablets: Novadoz labeling, SPL 1',
    publisher: 'Novadoz Pharmaceuticals LLC; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    publicationDate: '2026-04-10',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1cfa51fd-8406-404c-b2a8-0fc1068675fb',
    externalIdentifier: 'DailyMed SETID 1cfa51fd-8406-404c-b2a8-0fc1068675fb; SPL version 1; ANDA211533',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: '1cfa51fd-8406-404c-b2a8-0fc1068675fb',
      splVersion: 1,
      applicationNumber: 'ANDA211533',
      route: 'ORAL',
      dosageForm: 'TABLET, FILM COATED',
      labelRevision: '2026-04',
      dailyMedUpdatedDate: '2026-04-08',
      packager: 'Novadoz Pharmaceuticals LLC',
      establishmentManufacturer: 'MSN LABORATORIES PRIVATE LIMITED',
      applicationMarketingStartDate: '2026-04-06',
      packageMarketingStartDate: '2026-04-09',
      marketingEndDateListed: false,
      verificationScope: 'Current DailyMed product/application identity and procedure-review provenance; no real-time commercial-availability assertion',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-DAPA-SAXA-ANDA211537-FDA-APPROVAL',
    version: 1,
    sourceType: 'OTHER',
    title: 'FDA first generic approval record: dapagliflozin and saxagliptin tablets, ANDA211537',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA/CDER',
    effectiveDate: '2026-04-06',
    sourceUrl: 'https://www.fda.gov/drugs/drug-and-biologic-approval-and-ind-activity-reports/first-generic-drug-approvals',
    externalIdentifier: 'ANDA211537; approved 2026-04-06; reference listed drug QTERN',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'ANDA211537',
      applicant: 'Torrent Pharmaceuticals Limited',
      route: 'ORAL',
      dosageForm: 'TABLET',
      referenceListedDrug: 'QTERN',
      approvalDate: '2026-04-06',
      manufacturerSplVerified: false,
      verificationScope: 'FDA application-level approval and generic product identity only; no current manufacturer SPL or commercial-availability assertion',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-QTERNMET-XR-HISTORICAL-LABEL',
    version: 1,
    sourceType: 'FDA_LABEL',
    title: 'QTERNMET XR (dapagliflozin, saxagliptin, and metformin hydrochloride extended-release) tablets: historical AstraZeneca labeling',
    publisher: 'AstraZeneca Pharmaceuticals LP; DailyMed',
    societyOrRegulator: 'FDA labeling via DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=cfffcbfe-dcd9-4001-963e-a99e67390116',
    externalIdentifier: 'DailyMed SETID cfffcbfe-dcd9-4001-963e-a99e67390116; label revised 2020-01; NDA210874; SPL version not asserted',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      setId: 'cfffcbfe-dcd9-4001-963e-a99e67390116',
      applicationNumber: 'NDA210874',
      route: 'ORAL',
      dosageForm: 'TABLET, EXTENDED RELEASE',
      labelRevision: '2020-01',
      applicationMarketingStartDate: '2020-06-01',
      latestListedMarketingEndDate: '2020-06-01',
      splVersionAsserted: false,
      historicalMarketingRecord: true,
      verificationScope: 'Historical whole-product/formulation identity, listed DailyMed marketing metadata, and historical procedure-risk provenance; no current-availability assertion',
      marketAvailabilityAsserted: false,
      substitutionAuthorized: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
  {
    id: 'SRC-B3-QTERNMET-XR-ORANGE-BOOK-2026',
    version: 1,
    sourceType: 'OTHER',
    title: 'FDA Orange Book 46th Edition (2026): QTERNMET XR discontinued drug product list',
    publisher: 'U.S. Food and Drug Administration',
    societyOrRegulator: 'FDA/CDER Orange Book',
    sourceUrl: 'https://www.fda.gov/media/71474/download?attachment=',
    externalIdentifier: 'Orange Book 46th Edition (2026); NDA210874 products 001-004; Discontinued Drug Product List',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt,
    lifecycle: 'DRAFT',
    metadata: {
      applicationNumber: 'NDA210874',
      applicant: 'AstraZeneca AB',
      productNumbers: '001,002,003,004',
      route: 'ORAL',
      dosageForm: 'TABLET, EXTENDED RELEASE',
      orangeBookMarketingStatus: 'DISCONTINUED',
      discontinuedListVerified: true,
      verificationScope: 'FDA Orange Book regulatory marketing-status provenance only; does not establish reason for discontinuation or real-time inventory',
      marketAvailabilityAsserted: false,
      clinicalApprovalGranted: false,
      timingRuleAuthorized: false,
    },
  },
];

const sourceById = new Map(batch03QternIdentitySources.map((source) => [source.id, source]));

export const batch03QternIdentityAtoms: EvidenceAtom[] = batch03QternIdentityDefinitions.map((product) => {
  const source = sourceById.get(product.sourceRef.id);
  const sourceGap = product.medicationId === 'MED-dapagliflozin-saxagliptin-generic-anda211537';
  const historicalTriple = product.medicationId === qternmetMedicationId;
  return {
    id: product.evidenceRef.id,
    version: 1,
    source: product.sourceRef,
    claim: sourceGap
      ? 'FDA application-level records identify Torrent ANDA211537 as an approved generic dapagliflozin and saxagliptin oral tablet referencing QTERN; PREP-MEDS preserves that application identity without inventing a manufacturer SPL or commercial-availability state.'
      : historicalTriple
        ? 'The historical AstraZeneca DailyMed record identifies QTERNMET XR as an oral extended-release fixed combination of dapagliflozin, saxagliptin, and metformin hydrochloride under NDA210874; PREP-MEDS preserves this discontinued product/formulation identity without asserting current availability or an unverified SPL version.'
        : product.medicationId === 'MED-dapagliflozin-saxagliptin-qtern'
          ? 'The current searchable AstraZeneca DailyMed record preserves QTERN as the branded dapagliflozin and saxagliptin oral fixed-combination identity under NDA209091; listed marketing-end metadata is retained separately and is not converted into a real-time inventory claim.'
          : 'The current Novadoz DailyMed record identifies an unbranded dapagliflozin and saxagliptin oral fixed-combination product under ANDA211533; PREP-MEDS preserves the application/source identity without asserting real-time commercial availability.',
    normalizedTopic: historicalTriple ? 'batch03-qternmet-xr-historical-product-identity' : 'batch03-dapagliflozin-saxagliptin-product-identity',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [...product.ingredientIds],
      contextTags: ['fixed-combination', 'sglt2', 'dpp4', ...(historicalTriple ? ['metformin', 'extended-release', 'historical-product'] : []), 'product-reconciliation'],
    },
    locator: sourceGap
      ? { section: 'First Generic Drug Approvals; ANDA211537' }
      : historicalTriple
        ? { section: 'Highlights; Dosage Forms and Strengths; Product/Packaging Information' }
        : { section: 'Drug Label Information; Product Data' },
    limitations: [
      'Identity evidence does not authorize substitution, component splitting, patient-specific dosing, or peri-procedural instructions.',
      'FDA approval or a DailyMed marketing row is not treated as proof of current pharmacy inventory or commercial availability.',
      ...(sourceGap ? ['No current manufacturer SPL was authenticated for ANDA211537 in this reconciliation; no SETID or SPL version is inferred.'] : []),
      ...(historicalTriple ? ['The historical QTERNMET XR SPL sequence number is not asserted because it was not authenticated from the current source surface used for this reconciliation.'] : []),
    ],
    retrieval: {
      title: `${product.canonicalName} identity`,
      summary: 'Product/application identity with source-specific market-status boundaries.',
      keywords: [product.canonicalName, product.genericName, source?.externalIdentifier ?? product.sourceRef.id],
      concepts: ['medication-identity', 'fixed-combination', 'application-provenance'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
});

export const batch03QternMarketingStatusAtoms: EvidenceAtom[] = [
  {
    id: 'EVD-B3-QTERNMET-XR-DISCONTINUED-STATUS',
    version: 1,
    source: { id: 'SRC-B3-QTERNMET-XR-ORANGE-BOOK-2026', version: 1 },
    claim: 'The FDA Orange Book 46th Edition (2026) lists all four QTERNMET XR presentations under NDA210874 on the Discontinued Drug Product List; PREP-MEDS records this as regulatory marketing-status provenance without inferring why marketing stopped or whether any residual inventory exists.',
    normalizedTopic: 'batch03-qternmet-xr-marketing-status',
    stance: 'DESCRIPTIVE',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [qternmetMedicationId],
      ingredientIds: ['ING-dapagliflozin', 'ING-saxagliptin', 'ING-metformin'],
      contextTags: ['historical-product', 'discontinued', 'orange-book', 'market-status'],
    },
    locator: { section: 'Discontinued Drug Product List — DAPAGLIFLOZIN; METFORMIN HYDROCHLORIDE; SAXAGLIPTIN HYDROCHLORIDE / QTERNMET XR' },
    limitations: [
      'Discontinued-list status does not establish the reason marketing stopped and is not treated as a safety/efficacy withdrawal determination.',
      'Regulatory marketing status does not establish real-time pharmacy inventory or authorize substitution.',
    ],
    retrieval: {
      title: 'Qternmet XR discontinued status',
      summary: 'FDA Orange Book lists all NDA210874 presentations as discontinued.',
      keywords: ['Qternmet XR', 'NDA210874', 'discontinued', 'Orange Book'],
      concepts: ['marketing-status', 'historical-product'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  },
];

export const batch03QternProcedureReviewAtoms: EvidenceAtom[] = batch03QternIdentityDefinitions.map((product) => {
  const sourceGap = product.medicationId === 'MED-dapagliflozin-saxagliptin-generic-anda211537';
  const historicalTriple = product.medicationId === qternmetMedicationId;
  return {
    id: product.reviewEvidenceRef.id,
    version: 1,
    source: product.sourceRef,
    claim: sourceGap
      ? 'The FDA application-level approval record authenticates ANDA211537 product identity but does not provide an authenticated manufacturer-label basis for a product-specific peri-procedural timing action; PREP-MEDS therefore routes the product to clinician review with no timing rule.'
      : historicalTriple
        ? 'The historical QTERNMET XR label identifies surgery/other procedures and reduced oral intake as clinically relevant risk contexts and discusses temporary discontinuation in situations predisposing to ketoacidosis; PREP-MEDS preserves that historical provenance only and routes the discontinued whole product to clinician review with no autonomous timing rule.'
        : `The authenticated ${product.canonicalName} label contains temporary-interruption language for surgery or procedures associated with prolonged fasting; PREP-MEDS retains that language only as source provenance and routes the whole product to clinician review without autonomous endoscopy timing.`,
    normalizedTopic: historicalTriple ? 'batch03-qternmet-xr-procedure-review' : 'batch03-dapagliflozin-saxagliptin-procedure-review',
    stance: 'CONDITIONAL',
    evidenceStrength: 'NOT_GRADED',
    applicability: {
      medicationIds: [product.medicationId],
      ingredientIds: [...product.ingredientIds],
      contextTags: ['sglt2', 'fixed-combination', 'procedure-review', 'clinical-review-only', ...(historicalTriple ? ['historical-product', 'metformin'] : [])],
    },
    locator: sourceGap
      ? { section: 'First Generic Drug Approvals; application identity only' }
      : historicalTriple
        ? { section: 'Historical label revised 01/2020 — Boxed Warning; Warnings and Precautions 5.1, 5.5, 5.6' }
        : { section: 'Dosage and Administration — Temporary Interruption for Surgery' },
    limitations: [
      'This atom authorizes clinician-review routing only; it does not authorize a hold, continue, restart, or timing instruction.',
      'PREP-MEDS does not infer component-specific instructions from the fixed-combination product.',
      ...(sourceGap ? ['No product-specific manufacturer-label timing language is inferred from FDA approval metadata.'] : []),
      ...(historicalTriple ? ['Historical QTERNMET XR risk language is not converted into a contemporary universal endoscopy instruction.'] : []),
      ...(!sourceGap && !historicalTriple ? ['Manufacturer procedure/fasting language is not treated as a universal endoscopy policy.'] : []),
    ],
    retrieval: {
      title: `${product.canonicalName} procedure review`,
      summary: sourceGap
        ? 'Application identity has no authenticated label-derived timing basis.'
        : historicalTriple
          ? 'Historical procedure-risk provenance retained without autonomous timing.'
          : 'Manufacturer procedure/fasting language retained as review provenance only.',
      keywords: [product.canonicalName, 'procedure review', 'no autonomous timing'],
      concepts: ['procedure-review', 'fixed-combination', 'clinical-review-only'],
      sourceAuthorityRank: 100,
    },
    lifecycle: 'DRAFT',
    createdAt: retrievedAt,
  };
});

export const batch03QternIdentityEvidence: EvidenceBundle = {
  schemaVersion: '1.0.0',
  generatedAt: retrievedAt,
  sources: batch03QternIdentitySources,
  atoms: [...batch03QternIdentityAtoms, ...batch03QternMarketingStatusAtoms, ...batch03QternProcedureReviewAtoms],
};

const dapagliflozinSaxagliptinDefinitions = batch03QternIdentityDefinitions.filter((product) => product.medicationId !== qternmetMedicationId);
const qternmetDefinition = batch03QternIdentityDefinitions.find((product) => product.medicationId === qternmetMedicationId)!;

export const batch03QternReviewRules: ClinicalRule[] = [
  {
    id: 'RULE-B3-DAPA-SAXA-PRODUCT-REVIEW-001',
    version: 1,
    name: 'QTERN and dapagliflozin/saxagliptin product identities require integrated clinician review',
    scope: {
      medicationIds: dapagliflozinSaxagliptinDefinitions.map((product) => product.medicationId),
      procedureCodes: [...procedures],
    },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: dapagliflozinSaxagliptinDefinitions.map((product) => product.reviewEvidenceRef),
    status: 'TECHNICALLY_TESTED',
    priority: 20,
  },
  {
    id: 'RULE-B3-QTERNMET-XR-PRODUCT-REVIEW-001',
    version: 1,
    name: 'Historical QTERNMET XR whole-product identity requires clinician review',
    scope: {
      medicationIds: [qternmetDefinition.medicationId],
      procedureCodes: [...procedures],
    },
    requiredModifierIds: [],
    disposition: 'CLINICIAN_REVIEW_REQUIRED',
    restartOwner: 'CLINICIAN_REVIEW',
    evidenceRefs: [qternmetDefinition.reviewEvidenceRef],
    status: 'TECHNICALLY_TESTED',
    priority: 20,
  },
];
