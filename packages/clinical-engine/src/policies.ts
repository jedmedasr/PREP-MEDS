import { evaluateCondition } from './conditions.js';
import { scopeMatches } from './rules.js';
import type {
  DecisionContext,
  EngineMode,
  PolicyEffect,
  PolicyOverlay,
  PolicyTrace,
  VersionedRef,
} from './types.js';

export interface ResolvedPolicyEffect extends PolicyEffect {
  policyRefs: VersionedRef[];
}

export interface PolicyResolution {
  kind: 'RESOLVED' | 'NONE' | 'UNKNOWN' | 'CONFLICT' | 'MISSING_DEPENDENCY';
  effect?: ResolvedPolicyEffect;
  unresolvedFields?: string[];
  missingPolicyIds?: string[];
  conflictFields?: string[];
  trace: PolicyTrace[];
}

interface RankedPolicy {
  policy: PolicyOverlay;
  specificity: number;
  priority: number;
}

function policyRef(policy: PolicyOverlay): VersionedRef {
  return { id: policy.id, version: policy.version };
}

function eligibleByStatus(policy: PolicyOverlay, mode: EngineMode): boolean {
  if (mode === 'PRODUCTION') return policy.status === 'ACTIVE';
  return !['SUPERSEDED', 'RETIRED'].includes(policy.status);
}

function specificity(policy: PolicyOverlay): number {
  let score = policy.scopeLevel === 'SITE' ? 100 : 0;
  if (policy.scope.procedureCodes?.length) score += 10;
  if (policy.scope.medicationIds?.length) score += 10;
  if (policy.scope.ingredientIds?.length) score += 10;
  if (policy.scope.drugClassIds?.length) score += 10;
  return score;
}

function precedence(policy: RankedPolicy): [number, number] {
  return [policy.specificity, -policy.priority];
}

function comparePrecedence(left: RankedPolicy, right: RankedPolicy): number {
  const [leftSpecificity, leftPriority] = precedence(left);
  const [rightSpecificity, rightPriority] = precedence(right);
  if (leftSpecificity !== rightSpecificity) return leftSpecificity - rightSpecificity;
  return leftPriority - rightPriority;
}

function stableStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function chooseField<T>(
  current: { value: T; source: RankedPolicy } | undefined,
  nextValue: T | undefined,
  nextSource: RankedPolicy,
): { selected?: { value: T; source: RankedPolicy }; conflict: boolean } {
  if (nextValue === undefined) return current ? { selected: current, conflict: false } : { conflict: false };
  if (!current) return { selected: { value: nextValue, source: nextSource }, conflict: false };

  const comparison = comparePrecedence(nextSource, current.source);
  if (comparison > 0) return { selected: { value: nextValue, source: nextSource }, conflict: false };
  if (comparison < 0) return { selected: current, conflict: false };

  if (stableStringify(current.value) === stableStringify(nextValue)) {
    return { selected: current, conflict: false };
  }
  return { selected: current, conflict: true };
}

export function resolvePolicies(
  policies: PolicyOverlay[],
  context: DecisionContext,
  mode: EngineMode,
  requiredPolicyIds: string[] = [],
): PolicyResolution {
  const trace: PolicyTrace[] = [];
  const applicable: RankedPolicy[] = [];
  const unresolvedFields: string[] = [];

  const ordered = [...policies].sort((a, b) => {
    const idDelta = a.id.localeCompare(b.id);
    return idDelta !== 0 ? idDelta : a.version - b.version;
  });

  for (const policy of ordered) {
    const rank: RankedPolicy = {
      policy,
      specificity: specificity(policy),
      priority: policy.priority ?? 100,
    };
    const baseTrace = {
      policyRef: policyRef(policy),
      priority: rank.priority,
      specificity: rank.specificity,
    };

    if (!eligibleByStatus(policy, mode)) {
      trace.push({ ...baseTrace, status: 'INELIGIBLE_STATUS' });
      continue;
    }
    if (policy.organizationId !== context.organizationId) {
      trace.push({ ...baseTrace, status: 'ORGANIZATION_MISMATCH' });
      continue;
    }
    if (policy.scopeLevel === 'SITE' && policy.siteId !== context.siteId) {
      trace.push({ ...baseTrace, status: 'SITE_MISMATCH' });
      continue;
    }
    if (!scopeMatches(policy.scope, context)) {
      trace.push({ ...baseTrace, status: 'SCOPE_MISMATCH' });
      continue;
    }
    if (policy.appliesWhen) {
      const condition = evaluateCondition(policy.appliesWhen, context);
      if (condition.state === 'FALSE') {
        trace.push({ ...baseTrace, status: 'CONDITION_FALSE' });
        continue;
      }
      if (condition.state === 'UNKNOWN') {
        trace.push({
          ...baseTrace,
          status: 'CONDITION_UNKNOWN',
          unresolvedFields: condition.unresolvedFields,
        });
        unresolvedFields.push(...condition.unresolvedFields);
        continue;
      }
    }

    trace.push({ ...baseTrace, status: 'CANDIDATE' });
    applicable.push(rank);
  }

  if (unresolvedFields.length > 0) {
    return {
      kind: 'UNKNOWN',
      unresolvedFields: [...new Set(unresolvedFields)].sort(),
      trace,
    };
  }

  const applicableIds = new Set(applicable.map(({ policy }) => policy.id));
  const missingPolicyIds = requiredPolicyIds.filter((id) => !applicableIds.has(id));
  if (missingPolicyIds.length > 0) {
    return {
      kind: 'MISSING_DEPENDENCY',
      missingPolicyIds: [...new Set(missingPolicyIds)].sort(),
      trace,
    };
  }

  if (applicable.length === 0) return { kind: 'NONE', trace };

  let disposition: { value: NonNullable<PolicyEffect['dispositionOverride']>; source: RankedPolicy } | undefined;
  let timing: { value: NonNullable<PolicyEffect['timingRule']>; source: RankedPolicy } | undefined;
  let restart: { value: NonNullable<PolicyEffect['restartOwner']>; source: RankedPolicy } | undefined;
  const conflictFields: string[] = [];
  const reasonCodes = new Set<string>();
  const requiredModifierIds = new Set<string>();
  const contributors = new Map<string, VersionedRef>();

  for (const ranked of applicable) {
    const effect = ranked.policy.effect;
    effect.reasonCodes?.forEach((code) => reasonCodes.add(code));
    effect.requiredModifierIds?.forEach((id) => requiredModifierIds.add(id));
    if (effect.reasonCodes?.length || effect.requiredModifierIds?.length) {
      contributors.set(ranked.policy.id, policyRef(ranked.policy));
    }

    const dispositionChoice = chooseField(disposition, effect.dispositionOverride, ranked);
    if (dispositionChoice.conflict) conflictFields.push('dispositionOverride');
    if (dispositionChoice.selected !== disposition) contributors.set(ranked.policy.id, policyRef(ranked.policy));
    disposition = dispositionChoice.selected;

    const timingChoice = chooseField(timing, effect.timingRule, ranked);
    if (timingChoice.conflict) conflictFields.push('timingRule');
    if (timingChoice.selected !== timing) contributors.set(ranked.policy.id, policyRef(ranked.policy));
    timing = timingChoice.selected;

    const restartChoice = chooseField(restart, effect.restartOwner, ranked);
    if (restartChoice.conflict) conflictFields.push('restartOwner');
    if (restartChoice.selected !== restart) contributors.set(ranked.policy.id, policyRef(ranked.policy));
    restart = restartChoice.selected;
  }

  if (conflictFields.length > 0) {
    return {
      kind: 'CONFLICT',
      conflictFields: [...new Set(conflictFields)].sort(),
      trace,
    };
  }

  const selectedRefs = [...contributors.values()].sort((a, b) => {
    const idDelta = a.id.localeCompare(b.id);
    return idDelta !== 0 ? idDelta : a.version - b.version;
  });
  const selectedKeys = new Set(selectedRefs.map((item) => `${item.id}@${item.version}`));
  const finalizedTrace = trace.map((entry) =>
    entry.status === 'CANDIDATE' && selectedKeys.has(`${entry.policyRef.id}@${entry.policyRef.version}`)
      ? { ...entry, status: 'SELECTED' as const }
      : entry,
  );

  const effect: ResolvedPolicyEffect = {
    policyRefs: selectedRefs,
    ...(disposition !== undefined ? { dispositionOverride: disposition.value } : {}),
    ...(timing !== undefined ? { timingRule: timing.value } : {}),
    ...(restart !== undefined ? { restartOwner: restart.value } : {}),
    ...(reasonCodes.size > 0 ? { reasonCodes: [...reasonCodes].sort() } : {}),
    ...(requiredModifierIds.size > 0 ? { requiredModifierIds: [...requiredModifierIds].sort() } : {}),
  };

  return {
    kind: 'RESOLVED',
    effect,
    trace: finalizedTrace,
  };
}
