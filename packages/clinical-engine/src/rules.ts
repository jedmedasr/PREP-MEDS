import { evaluateCondition } from './conditions.js';
import type {
  ClinicalRule,
  DecisionContext,
  EngineMode,
  RuleCandidateTrace,
  RuleScope,
  VersionedRef,
} from './types.js';

export interface RuleSelection {
  kind: 'SELECTED' | 'NO_MATCH' | 'UNKNOWN_APPLICABILITY' | 'AMBIGUOUS';
  selected?: ClinicalRule;
  competing?: ClinicalRule[];
  unresolvedFields?: string[];
  trace: RuleCandidateTrace[];
}

export interface RequiredModifierResolution {
  unresolvedModifierIds: string[];
  conflictingModifierIds: string[];
  notApplicableModifierIds: string[];
}

function ref(rule: ClinicalRule): VersionedRef {
  return { id: rule.id, version: rule.version };
}

function intersects(left: string[], right: string[]): boolean {
  const set = new Set(right);
  return left.some((item) => set.has(item));
}

export function scopeMatches(scope: RuleScope, context: DecisionContext): boolean {
  if (scope.procedureCodes?.length && !scope.procedureCodes.includes(context.procedureCode)) return false;
  if (scope.medicationIds?.length && !scope.medicationIds.includes(context.medication.medicationId)) return false;
  if (scope.ingredientIds?.length && !intersects(scope.ingredientIds, context.medication.ingredientIds)) return false;
  if (scope.drugClassIds?.length && !intersects(scope.drugClassIds, context.medication.drugClassIds)) return false;
  return true;
}

export function ruleEligibleByStatus(rule: ClinicalRule, mode: EngineMode): boolean {
  if (mode === 'PRODUCTION') return rule.status === 'ACTIVE';
  return !['SUPERSEDED', 'RETIRED'].includes(rule.status);
}

export function resolveRequiredModifiers(
  rule: ClinicalRule,
  context: DecisionContext,
): RequiredModifierResolution {
  const byId = new Map(context.modifiers.map((modifier) => [modifier.modifierId, modifier]));
  const unresolvedModifierIds: string[] = [];
  const conflictingModifierIds: string[] = [];
  const notApplicableModifierIds: string[] = [];

  for (const modifierId of rule.requiredModifierIds) {
    const modifier = byId.get(modifierId);
    if (!modifier || modifier.state === 'UNKNOWN') unresolvedModifierIds.push(modifierId);
    else if (modifier.state === 'CONFLICTING') conflictingModifierIds.push(modifierId);
    else if (modifier.state === 'NOT_APPLICABLE') notApplicableModifierIds.push(modifierId);
  }

  return {
    unresolvedModifierIds: [...new Set(unresolvedModifierIds)].sort(),
    conflictingModifierIds: [...new Set(conflictingModifierIds)].sort(),
    notApplicableModifierIds: [...new Set(notApplicableModifierIds)].sort(),
  };
}

export function selectRule(
  rules: ClinicalRule[],
  context: DecisionContext,
  mode: EngineMode,
): RuleSelection {
  const trace: RuleCandidateTrace[] = [];
  const candidates: ClinicalRule[] = [];
  const unresolvedFields: string[] = [];

  const ordered = [...rules].sort((a, b) => {
    const priorityDelta = (a.priority ?? 100) - (b.priority ?? 100);
    if (priorityDelta !== 0) return priorityDelta;
    const idDelta = a.id.localeCompare(b.id);
    return idDelta !== 0 ? idDelta : a.version - b.version;
  });

  for (const rule of ordered) {
    const priority = rule.priority ?? 100;
    if (!ruleEligibleByStatus(rule, mode)) {
      trace.push({ ruleRef: ref(rule), status: 'INELIGIBLE_STATUS', priority });
      continue;
    }

    if (!scopeMatches(rule.scope, context)) {
      trace.push({ ruleRef: ref(rule), status: 'SCOPE_MISMATCH', priority });
      continue;
    }

    if (rule.applicability) {
      const applicability = evaluateCondition(rule.applicability, context);
      if (applicability.state === 'FALSE') {
        trace.push({ ruleRef: ref(rule), status: 'APPLICABILITY_FALSE', priority });
        continue;
      }
      if (applicability.state === 'UNKNOWN') {
        trace.push({
          ruleRef: ref(rule),
          status: 'APPLICABILITY_UNKNOWN',
          priority,
          unresolvedFields: applicability.unresolvedFields,
        });
        unresolvedFields.push(...applicability.unresolvedFields);
        continue;
      }
    }

    trace.push({ ruleRef: ref(rule), status: 'CANDIDATE', priority });
    candidates.push(rule);
  }

  if (candidates.length === 0) {
    if (unresolvedFields.length > 0) {
      return {
        kind: 'UNKNOWN_APPLICABILITY',
        unresolvedFields: [...new Set(unresolvedFields)].sort(),
        trace,
      };
    }
    return { kind: 'NO_MATCH', trace };
  }

  const topPriority = Math.min(...candidates.map((rule) => rule.priority ?? 100));
  const top = candidates.filter((rule) => (rule.priority ?? 100) === topPriority);
  if (top.length > 1) {
    return { kind: 'AMBIGUOUS', competing: top, trace };
  }

  return { kind: 'SELECTED', selected: top[0]!, trace };
}
