import type { EvidenceAtom, EvidenceBundle, SourceDocument, VersionRef } from '@prep-meds/evidence';
import {
  diabetesWorkflowEvidence as historicalEvidence,
  diabetesWorkflowEvidenceRef as historicalEvidenceRef,
} from './diabetes-evidence-provenance.js';

const auditedAt = '2026-09-18T01:30:01Z';
const glipizideSourceId = 'SRC-FDA-GLIPIZIDE-LABEL-B2';
const bowelPrepSourceId = 'SRC-USMSTF-BOWEL-PREP-GIE-2025-B2';
const previousGlipizideSource = historicalEvidence.sources.find(
  (source) => source.id === glipizideSourceId && source.version === 1,
);
if (!previousGlipizideSource) throw new Error('Missing historical glipizide source');

const sources: SourceDocument[] = [
  {
    ...previousGlipizideSource,
    version: 2,
    supersedes: { id: glipizideSourceId, version: 1 },
    title: 'GLUCOTROL XL (glipizide extended-release): Roerig SPL version 27',
    publisher: 'Roerig / Pfizer; DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=eed99b60-d043-4249-9b2a-f05e46fb588d',
    externalIdentifier: 'DailyMed SETID eed99b60-d043-4249-9b2a-f05e46fb588d; SPL version 27',
    effectiveDate: '2025-04-02',
    retrievedAt: auditedAt,
    lifecycle: 'DRAFT',
    metadata: {
      splVersion: 27,
      setId: 'eed99b60-d043-4249-9b2a-f05e46fb588d',
      labelRevision: '2023-08',
      verificationScope: 'Section 5.1: descriptive class hypoglycemia warning; not a class-wide interruption schedule',
      publicationDateNotInferred: true,
    },
  },
  {
    id: bowelPrepSourceId,
    version: 1,
    sourceType: 'GUIDELINE',
    title: 'Optimizing bowel preparation quality for colonoscopy: US Multi-Society Task Force consensus recommendations (GIE publication)',
    publisher: 'Gastrointestinal Endoscopy; ASGE / ACG / AGA',
    societyOrRegulator: 'US Multi-Society Task Force on Colorectal Cancer',
    publicationDate: '2025-03-04',
    sourceUrl: 'https://www.giejournal.org/article/S0016-5107(25)00080-X/fulltext',
    externalIdentifier: 'doi:10.1016/j.gie.2025.02.010',
    jurisdiction: 'US',
    language: 'en',
    retrievedAt: auditedAt,
    lifecycle: 'DRAFT',
    metadata: {
      journalCitation: 'Gastrointest Endosc. 2025;101(4):702-732',
      documentIdentityNote: 'Separate GIE source; do not attach GIE locators to the historical AJG DOI',
      recommendationStrength: 'Strong',
      evidenceQuality: 'Moderate',
    },
  },
];

function reviseAtom(id: string, previousVersion: number, patch: Partial<EvidenceAtom>): EvidenceAtom {
  const previous = historicalEvidence.atoms.find((atom) => atom.id === id && atom.version === previousVersion);
  if (!previous) throw new Error(`Missing historical evidence ${id}@${previousVersion}`);
  const revised: EvidenceAtom = {
    ...previous,
    ...patch,
    id,
    version: previousVersion + 1,
    supersedes: { id, version: previousVersion },
    lifecycle: 'DRAFT',
    createdAt: auditedAt,
  };
  // Retrieval text must follow the revised claim rather than stale broader wording.
  return { ...revised, retrieval: { ...revised.retrieval, summary: revised.claim } };
}

const atoms: EvidenceAtom[] = [
  reviseAtom('EVD-B2-FDA-SULFONYLUREA-HYPOGLYCEMIA', 1, {
    source: { id: glipizideSourceId, version: 2 },
    claim: 'GLUCOTROL XL labeling explicitly describes severe hypoglycemia as a sulfonylurea-class risk and identifies deficient caloric intake as a risk factor.',
    locator: { section: '5.1 Hypoglycemia', paragraph: 'Class warning and risk-factor discussion' },
    evidenceStrength: 'NOT_GRADED',
    applicability: { drugClassIds: ['CLS-sulfonylurea'], contextTags: ['hypoglycemia-risk', 'reduced-caloric-intake'] },
    limitations: [
      'Class inheritance is limited to the descriptive safety warning explicitly stated in this label.',
      'This ER product label does not verify every product formulation or establish a common hold interval.',
      'The procedure-day action is separately supported by ADA guidance; prep and recovery remain review-only.',
    ],
  }),
  reviseAtom('EVD-B2-USMSTF-MEDICATIONS-IN-BOWEL-PREP', 1, {
    source: { id: bowelPrepSourceId, version: 1 },
    claim: 'The 2025 USMSTF recommends selecting bowel preparation with consideration of medical history, medications and prior preparation adequacy when available.',
    locator: {
      section: 'Recommendations Before Colonoscopy / Choice of Bowel Preparation Purgative',
      paragraph: 'Question on whether regimen selection should consider medical history; first recommendation',
    },
    evidenceStrength: 'MODERATE',
    applicability: { procedureCodes: ['COLONOSCOPY', 'EGD_COLONOSCOPY'], populationTags: ['outpatient'], contextTags: ['bowel-preparation-planning'] },
    limitations: [
      'Strong recommendation with moderate-quality evidence in the cited publication.',
      'This is bowel-preparation planning evidence, not an individual diabetes-drug interruption or restart protocol.',
      'It does not establish medication instructions for EGD without colonoscopy.',
    ],
  }),
  reviseAtom('EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED', 2, {
    applicability: { medicationIds: ['MED-repaglinide'], ingredientIds: ['ING-repaglinide'], contextTags: ['meal-linked-dosing'] },
    limitations: [
      'Direct label evidence applies to repaglinide, not to independently unverified nateglinide labeling.',
      'This reference must not be attached as direct support to a generic meglitinide-class interruption rule.',
      'No replacement regimen, dose arithmetic or universal colonoscopy prep-day schedule is supplied.',
    ],
  }),
  reviseAtom('EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS', 2, {
    applicability: { ingredientIds: ['ING-metformin'], contextTags: ['extended-release-formulation', 'restricted-food-or-fluid-intake'] },
    limitations: [
      'Direct verification is for the identified Granules extended-release SPL, not all immediate-release or combination products.',
      'Generic metformin procedure-day handling uses the independent ADA passage, not automatic ER-label inheritance.',
      'Contrast-specific restart provisions are not a routine-endoscopy restart interval.',
    ],
  }),
];

/** Append-only draft corpus. Historical claims remain available by their exact versions. */
export const diabetesAuditedEvidence: EvidenceBundle = {
  ...historicalEvidence,
  generatedAt: auditedAt,
  sources: [...historicalEvidence.sources, ...sources],
  atoms: [...historicalEvidence.atoms, ...atoms],
};

const auditedVersions: Record<string, number> = Object.fromEntries(atoms.map((atom) => [atom.id, atom.version]));

/** Explicit review-release mapping, never a production approval or an unbounded "latest" lookup. */
export function diabetesAuditedEvidenceRef(ref: VersionRef): VersionRef {
  const historical = historicalEvidenceRef(ref);
  const version = auditedVersions[ref.id];
  return version !== undefined && historical.version < version ? { id: ref.id, version } : historical;
}

export const diabetesScopedEvidenceAudit = {
  status: 'SCOPED_AUDIT_COMPLETE_CLINICAL_REVIEW_REQUIRED',
  clinicalApprovalGranted: false,
  scope: 'Existing non-SGLT/non-GLP oral-agent procedure-day shadow candidates and review-only insulin/pramlintide pathways',
  phaseCoverage: {
    procedureDay: 'ADA-supported oral-agent candidate only after indication and documented-plan confirmation',
    preparation: 'REVIEW_ONLY_NO_AUTONOMOUS_INSTRUCTION',
    recovery: 'REVIEW_ONLY_NO_AUTONOMOUS_RESTART',
    insulin: 'REVIEW_ONLY_NO_DOSE_OR_DEVICE_SETTINGS',
  },
  inheritance: [
    { family: 'Oral glucose-lowering agents', support: 'ADA procedure-day passage', excluded: 'SGLT/GLP agents, non-diabetes indications, unconfirmed products and other phases' },
    { family: 'Sulfonylureas', support: 'Explicit descriptive class hypoglycemia warning in GLUCOTROL XL section 5.1', excluded: 'Product-specific equivalence, dose, and shared preprocedure interruption intervals' },
    { family: 'Meglitinides', support: 'ADA class procedure-day passage', excluded: 'Repaglinide-only label evidence is not nateglinide evidence' },
    { family: 'Metformin', support: 'ADA generic procedure-day passage', excluded: 'One ER label does not validate every formulation or combination' },
    { family: 'Insulin and pramlintide', support: 'Located ADA safety principles and identified pramlintide label', excluded: 'Autonomous dose, pump compatibility, restart or conversion plans' },
  ],
  unresolved: [
    'Named clinical reviewer approval and local GI/anesthesia/diabetes policy reconciliation remain required.',
    'A complete prep-day and recovery protocol is deliberately outside this bounded release.',
    'Product/formulation verification and corresponding rule/test reconciliation are separate checkpoints.',
    'This is not a comprehensive contraindication, drug-interaction or acute-diabetes treatment system.',
  ],
} as const;
