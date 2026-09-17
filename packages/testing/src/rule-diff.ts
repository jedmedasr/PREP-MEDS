import type { ClinicalRule } from '@prep-meds/clinical-engine';

export type RuleChangeKind =
  | 'ADDED'
  | 'REMOVED'
  | 'STATUS_CHANGED'
  | 'SCOPE_CHANGED'
  | 'APPLICABILITY_CHANGED'
  | 'REQUIRED_INPUTS_CHANGED'
  | 'HARD_STOPS_CHANGED'
  | 'DISPOSITION_CHANGED'
  | 'TIMING_CHANGED'
  | 'RESTART_OWNER_CHANGED'
  | 'EVIDENCE_CHANGED'
  | 'POLICY_DEPENDENCIES_CHANGED'
  | 'PRIORITY_CHANGED';

export interface RuleChange {
  ruleId: string;
  fromVersion?: number;
  toVersion?: number;
  kind: RuleChangeKind;
  releaseBlocking: boolean;
}

function stable(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(record[key])}`)
    .join(',')}}`;
}

function changed(left: unknown, right: unknown): boolean {
  return stable(left) !== stable(right);
}

function latestById(rules: ClinicalRule[]): Map<string, ClinicalRule> {
  const result = new Map<string, ClinicalRule>();
  for (const rule of rules) {
    const existing = result.get(rule.id);
    if (!existing || existing.version < rule.version) result.set(rule.id, rule);
  }
  return result;
}

function add(
  changes: RuleChange[],
  oldRule: ClinicalRule,
  newRule: ClinicalRule,
  kind: RuleChangeKind,
  releaseBlocking = true,
): void {
  changes.push({
    ruleId: oldRule.id,
    fromVersion: oldRule.version,
    toVersion: newRule.version,
    kind,
    releaseBlocking,
  });
}

export function diffClinicalRules(
  previousRules: ClinicalRule[],
  currentRules: ClinicalRule[],
): RuleChange[] {
  const previous = latestById(previousRules);
  const current = latestById(currentRules);
  const changes: RuleChange[] = [];
  const ids = [...new Set([...previous.keys(), ...current.keys()])].sort();

  for (const id of ids) {
    const oldRule = previous.get(id);
    const newRule = current.get(id);

    if (!oldRule && newRule) {
      changes.push({ ruleId: id, toVersion: newRule.version, kind: 'ADDED', releaseBlocking: true });
      continue;
    }
    if (oldRule && !newRule) {
      changes.push({ ruleId: id, fromVersion: oldRule.version, kind: 'REMOVED', releaseBlocking: true });
      continue;
    }
    if (!oldRule || !newRule) continue;

    if (oldRule.status !== newRule.status) add(changes, oldRule, newRule, 'STATUS_CHANGED');
    if (changed(oldRule.scope, newRule.scope)) add(changes, oldRule, newRule, 'SCOPE_CHANGED');
    if (changed(oldRule.applicability, newRule.applicability)) add(changes, oldRule, newRule, 'APPLICABILITY_CHANGED');
    if (changed(oldRule.requiredModifierIds, newRule.requiredModifierIds)) add(changes, oldRule, newRule, 'REQUIRED_INPUTS_CHANGED');
    if (changed(oldRule.hardStops, newRule.hardStops)) add(changes, oldRule, newRule, 'HARD_STOPS_CHANGED');
    if (oldRule.disposition !== newRule.disposition) add(changes, oldRule, newRule, 'DISPOSITION_CHANGED');
    if (changed(oldRule.timingRule, newRule.timingRule)) add(changes, oldRule, newRule, 'TIMING_CHANGED');
    if (oldRule.restartOwner !== newRule.restartOwner) add(changes, oldRule, newRule, 'RESTART_OWNER_CHANGED');
    if (changed(oldRule.evidenceRefs, newRule.evidenceRefs)) add(changes, oldRule, newRule, 'EVIDENCE_CHANGED');
    if (changed(oldRule.policyDependencyIds, newRule.policyDependencyIds)) add(changes, oldRule, newRule, 'POLICY_DEPENDENCIES_CHANGED');
    if (oldRule.priority !== newRule.priority) add(changes, oldRule, newRule, 'PRIORITY_CHANGED');
  }

  return changes.sort((a, b) => {
    const id = a.ruleId.localeCompare(b.ruleId);
    return id !== 0 ? id : a.kind.localeCompare(b.kind);
  });
}

export function assertNoUnreviewedRuleChanges(changes: RuleChange[]): void {
  const blocking = changes.filter((change) => change.releaseBlocking);
  if (blocking.length === 0) return;
  const summary = blocking.map((change) => `${change.ruleId}:${change.kind}`).join(', ');
  throw new Error(`Clinical rule changes require explicit review: ${summary}`);
}
