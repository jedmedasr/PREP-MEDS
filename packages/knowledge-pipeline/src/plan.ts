import type {
  EvidenceSourceCategory,
  KnowledgeTarget,
  ProcedureCode,
  ResearchPlan,
  SourceSearchPlanEntry,
} from './types.js';

const BASE_SOURCE_PLAN: SourceSearchPlanEntry[] = [
  {
    category: 'US_GI_GUIDELINE',
    required: true,
    rationale: 'Search current U.S. gastroenterology/endoscopy guidance for procedure-specific recommendations or explicit absence of guidance.',
    searchTerms: [],
  },
  {
    category: 'PERIOPERATIVE_ANESTHESIA_GUIDANCE',
    required: true,
    rationale: 'Search perioperative/anesthesia guidance because sedation, fasting, hemodynamics, and aspiration risk may alter implementation.',
    searchTerms: [],
  },
  {
    category: 'FDA_LABEL',
    required: true,
    rationale: 'Search current U.S. labeling for drug-specific contraindications, warnings, timing, interactions, and formulation details.',
    searchTerms: [],
  },
  {
    category: 'SYSTEMATIC_REVIEW',
    required: false,
    rationale: 'Search recent syntheses when they may clarify evolving evidence or guideline gaps.',
    searchTerms: [],
  },
  {
    category: 'RANDOMIZED_TRIAL',
    required: false,
    rationale: 'Search recent trials capable of materially changing interpretation of existing guidance.',
    searchTerms: [],
  },
];

function targetTerms(target: KnowledgeTarget): string[] {
  return [...new Set([target.canonicalName, ...(target.externalCodes?.map((code) => code.display).filter(Boolean) as string[] | undefined ?? [])])]
    .filter((value) => value.trim().length > 0)
    .map((value) => value.trim());
}

export function createDefaultResearchPlan(
  target: KnowledgeTarget,
  procedureCodes: ProcedureCode[] = ['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY'],
): ResearchPlan {
  const names = targetTerms(target);
  const procedureTerms = ['EGD', 'upper endoscopy', 'colonoscopy', 'gastrointestinal endoscopy'];

  return {
    target,
    procedureCodes: [...new Set(procedureCodes)],
    sourcePlan: BASE_SOURCE_PLAN.map((entry) => ({
      ...entry,
      searchTerms: [
        ...names.map((name) => `${name} ${entry.category.toLowerCase().replaceAll('_', ' ')}`),
        ...names.flatMap((name) => procedureTerms.map((procedure) => `${name} ${procedure}`)),
      ],
    })),
    questionsToResolve: [
      'Does management differ for EGD, colonoscopy, or same-day combined procedures?',
      'Which patient-specific modifiers materially change the recommendation?',
      'Which situations require clinician review rather than a routine protocol instruction?',
      'Is there a formulation, route, combination-product, renal, hepatic, pregnancy, or indication dependency?',
      'Who owns the post-procedure restart decision, if applicable?',
      'Where does current national evidence conflict with common or configurable local practice?',
    ],
    expectedModifierDomains: [
      'indication',
      'procedure context',
      'relevant organ function',
      'recent high-risk events',
      'concomitant medications',
      'formulation/route',
    ],
  };
}

export function requiredSourceCategories(plan: ResearchPlan): EvidenceSourceCategory[] {
  return plan.sourcePlan.filter((entry) => entry.required).map((entry) => entry.category);
}
