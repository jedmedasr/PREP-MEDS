import type { CitationLocator, EvidenceAtom, EvidenceBundle, SourceDocument, VersionRef } from '@prep-meds/evidence';
import { diabetesCoreEvidence } from './diabetes-core.js';

const auditedAt = '2026-09-18T01:17:58Z';
const adaId = 'SRC-ADA-DIABETES-HOSPITAL-2026-B2';
const metforminId = 'SRC-FDA-METFORMIN-LABEL-2024-B2';
const repaglinideId = 'SRC-FDA-REPAGLINIDE-LABEL-B2';
const pramlintideId = 'SRC-FDA-PRAMLINTIDE-LABEL-B2';

function sourceRevision(id: string, patch: Partial<SourceDocument>): SourceDocument {
  const previous = diabetesCoreEvidence.sources.find((source) => source.id === id && source.version === 1);
  if (!previous) throw new Error(`Missing historical diabetes source ${id}@1`);
  // A label's SPL effective date is not automatically its publication/retrieval date.
  const { publicationDate: _oldPublicationDate, ...identity } = previous;
  return {
    ...identity, ...patch, id, version: 2, supersedes: { id, version: 1 },
    retrievedAt: auditedAt, lifecycle: 'DRAFT',
  };
}

const revisedSources: SourceDocument[] = [
  sourceRevision(adaId, {
    sourceUrl: 'https://doi.org/10.2337/dc26-S016', publicationDate: '2025-12-08',
    metadata: { verificationScope: 'Selected perioperative and inpatient narrative passages; not clinical approval' },
  }),
  sourceRevision(metforminId, {
    title: 'Metformin hydrochloride extended-release tablets: Granules Pharmaceuticals SPL version 4',
    publisher: 'Granules Pharmaceuticals Inc.; DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a5980bc8-8de8-c456-e053-2a95a90a792e',
    effectiveDate: '2024-07-03',
    metadata: { splVersion: 4, setId: 'a5980bc8-8de8-c456-e053-2a95a90a792e', formulation: 'extended release', verificationScope: 'Specified SPL, not every metformin product' },
  }),
  sourceRevision(repaglinideId, {
    title: 'Repaglinide tablets: Bryant Ranch Prepack label, source NDC 33342-250',
    publisher: 'Bryant Ranch Prepack; Macleods source labeling; DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d85abce4-16da-4231-b28a-6afca04ebf68',
    externalIdentifier: 'DailyMed SETID d85abce4-16da-4231-b28a-6afca04ebf68',
    publicationDate: '2025-06-09',
    metadata: { splVersion: 1, labelRevision: '2025-06', dailyMedUpdatedDate: '2025-06-05', repackagedLabel: true, verificationScope: 'Sections 2.1 and 5.1' },
  }),
  sourceRevision(pramlintideId, {
    title: 'SYMLINPEN pramlintide acetate injection: SPL version 18',
    publisher: 'AstraZeneca Pharmaceuticals LP; DailyMed',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4aea30ff-eb0d-45c1-b114-3127966328ff',
    effectiveDate: '2019-12-18', publicationDate: '2024-08-20',
    metadata: { splVersion: 18, labelRevision: '2019-12', verificationScope: 'Specified SPL; registry posting date differs from effective date' },
  }),
];

interface VerifiedPassage {
  locator: CitationLocator;
  claim: string;
  limitations: string[];
}
const passages: Record<string, VerifiedPassage> = {
  'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY': {
    locator: { section: 'Perioperative Care', paragraph: 'Medication-management discussion, item 4' },
    claim: 'ADA advises withholding metformin and other oral glucose-lowering agents on the day of surgery or a procedure.',
    limitations: ['This passage does not supply a complete colonoscopy prep-day or recovery protocol.', 'Narrative advice is not assigned an inferred GRADE certainty level.'],
  },
  'EVD-B2-ADA-T1D-BASAL-MUST-CONTINUE': {
    locator: { section: 'Glucose-Lowering Treatment in Hospitalized Individuals / Insulin Therapy / Type 1 Diabetes' },
    claim: 'ADA requires basal insulin coverage for hospitalized people with type 1 diabetes even when not eating, with safeguards against omitting basal insulin during care transitions.',
    limitations: ['Inpatient safety principle; not a patient-specific periendoscopic insulin dose.', 'The original HIGH classification was not a verified grade for this narrative passage.'],
  },
  'EVD-B2-ADA-INSULIN-INDIVIDUALIZE': {
    locator: { section: 'Perioperative Care', paragraph: 'Medication-management discussion, item 5' },
    claim: 'Periprocedural insulin management depends on insulin type, diabetes context and clinical judgment; a generic instruction to stop all insulin is inappropriate.',
    limitations: ['PREP-MEDS does not calculate a dose or substitute for an individualized regimen.', 'No GRADE category is inferred from narrative guidance.'],
  },
  'EVD-B2-ADA-PUMP-INSTITUTIONAL-POLICY': {
    locator: { section: 'Insulin Pump Use in the Hospital; Perioperative Care', paragraph: 'Recommendation 16.7 and perioperative medication-management discussion, item 5' },
    claim: 'Continued pump or automated insulin delivery use depends on clinical appropriateness, institutional capability and protocols; an alternative insulin plan is needed when a pump cannot be used.',
    limitations: ['Recommendation 16.7 carries ADA grade C, not an automatically equivalent GRADE LOW rating.', 'Device compatibility, procedural restrictions and backup therapy remain local clinical decisions.'],
  },
  'EVD-B2-ADA-CONCENTRATED-PREMIX-CAUTION': {
    locator: { section: 'Glucose-Lowering Treatment in Hospitalized Individuals / Insulin Therapy / Noncritical Care Setting' },
    claim: 'ADA notes increased inpatient hypoglycemia with insulin mixtures and limited, variable inpatient/perioperative data for concentrated insulin, with dosing-error concerns particularly for U-500.',
    limitations: ['Inpatient mixture findings are not a universal outpatient pre-endoscopy hold rule.', 'The narrative passage does not justify the original inferred LOW certainty label.'],
  },
  'EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS': {
    locator: { section: 'Boxed Warning; 5.1 Lactic Acidosis; Patient Information' },
    claim: 'The specified metformin extended-release label identifies renal impairment and procedures with restricted food or fluid intake among lactic-acidosis risk contexts, requiring prescriber-directed planning.',
    limitations: ['Verified ER label; formulation-wide inheritance needs review.', 'Iodinated-contrast restart provisions must not become an automatic routine-endoscopy restart interval.'],
  },
  'EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED': {
    locator: { section: '2.1 Recommended Dosage and Administration; 5.1 Hypoglycemia' },
    claim: 'The repaglinide label ties administration to meals and directs omission of a scheduled dose when the corresponding meal is skipped to reduce hypoglycemia risk.',
    limitations: ['This is repaglinide labeling, not independent nateglinide verification.', 'A meal-linked instruction alone does not define every bowel-preparation scenario.'],
  },
  'EVD-B2-FDA-PRAMLINTIDE-INSULIN-CONTEXT': {
    locator: { section: 'Boxed Warning; 1 Indications and Usage; 2.1 Important Considerations; 2.4 Administration; 4 Contraindications' },
    claim: 'Pramlintide is adjunctive to mealtime insulin, carries severe-hypoglycemia risk, and requires prescriber-directed reinitiation after interruption; confirmed gastroparesis is a contraindication.',
    limitations: ['No initiation, restart or insulin-adjustment dose is generated by PREP-MEDS.', 'Label verification does not constitute clinical approval of this workflow.'],
  },
};

const revisedAtoms: EvidenceAtom[] = Object.entries(passages).map(([id, passage]) => {
  const previous = diabetesCoreEvidence.atoms.find((atom) => atom.id === id && atom.version === 1);
  if (!previous) throw new Error(`Missing historical diabetes evidence ${id}@1`);
  if (!revisedSources.some((source) => source.id === previous.source.id)) throw new Error(`Missing revised source for ${id}`);
  return {
    ...previous, version: 2, supersedes: { id, version: 1 },
    source: { id: previous.source.id, version: 2 },
    claim: passage.claim, locator: passage.locator,
    evidenceStrength: 'NOT_GRADED',
    limitations: [...previous.limitations, ...passage.limitations],
    retrieval: { ...previous.retrieval, summary: passage.claim },
    lifecycle: 'DRAFT', createdAt: auditedAt,
  };
});

/** Historical versions are retained for exact-version reconstruction; nothing is auto-approved. */
export const diabetesWorkflowEvidence: EvidenceBundle = {
  ...diabetesCoreEvidence,
  generatedAt: auditedAt,
  sources: [...diabetesCoreEvidence.sources, ...revisedSources],
  atoms: [...diabetesCoreEvidence.atoms, ...revisedAtoms],
};

export function diabetesWorkflowEvidenceRef(ref: VersionRef): VersionRef {
  return passages[ref.id] && ref.version === 1 ? { id: ref.id, version: 2 } : { ...ref };
}

export const diabetesEvidenceAuditStatus = {
  status: 'PARTIAL_REVIEW_REQUIRED',
  verifiedPassageCount: revisedAtoms.length,
  unresolved: [
    'Glipizide source still needs a uniquely identified label version and exact locator.',
    'USMSTF source must be mapped to its precise recommendation locator; it is not a complete drug-timing protocol.',
    'Class-level inheritance, every product identity and concentration-specific guidance need explicit verification.',
    'Prep-day and restart pathways are not complete medication protocols.',
  ],
} as const;
