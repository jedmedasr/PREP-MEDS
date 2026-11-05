import type { ClinicalRule, PolicyOverlay } from './types.js';

export interface EngineValidationIssue {
  code: string;
  message: string;
  artifactId?: string;
  artifactVersion?: number;
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

export function validateRules(rules: ClinicalRule[]): EngineValidationIssue[] {
  const issues: EngineValidationIssue[] = [];
  const versionKeys = rules.map((rule) => `${rule.id}@${rule.version}`);
  for (const duplicate of duplicateValues(versionKeys)) {
    issues.push({ code: 'DUPLICATE_RULE_VERSION', message: `Duplicate rule version ${duplicate}` });
  }

  for (const rule of rules) {
    const artifact = { artifactId: rule.id, artifactVersion: rule.version };
    if (!rule.id.trim()) issues.push({ ...artifact, code: 'EMPTY_RULE_ID', message: 'Rule ID is required.' });
    if (!Number.isInteger(rule.version) || rule.version < 1) {
      issues.push({ ...artifact, code: 'INVALID_RULE_VERSION', message: 'Rule version must be a positive integer.' });
    }
    if (rule.evidenceRefs.length === 0) {
      issues.push({ ...artifact, code: 'RULE_WITHOUT_EVIDENCE', message: 'Every clinical rule must reference evidence.' });
    }
    if (rule.priority !== undefined && (!Number.isInteger(rule.priority) || rule.priority < 0)) {
      issues.push({ ...artifact, code: 'INVALID_RULE_PRIORITY', message: 'Rule priority must be a non-negative integer.' });
    }

    for (const duplicate of duplicateValues(rule.requiredModifierIds)) {
      issues.push({
        ...artifact,
        code: 'DUPLICATE_REQUIRED_MODIFIER',
        message: `Required modifier ${duplicate} is duplicated.`,
      });
    }
    for (const duplicate of duplicateValues(rule.policyDependencyIds ?? [])) {
      issues.push({
        ...artifact,
        code: 'DUPLICATE_POLICY_DEPENDENCY',
        message: `Policy dependency ${duplicate} is duplicated.`,
      });
    }
    for (const hardStop of rule.hardStops ?? []) {
      if (!hardStop.reasonCode.trim()) {
        issues.push({ ...artifact, code: 'EMPTY_HARD_STOP_REASON', message: 'Hard stops require a reason code.' });
      }
    }
  }

  return issues;
}

export function validatePolicies(policies: PolicyOverlay[]): EngineValidationIssue[] {
  const issues: EngineValidationIssue[] = [];
  const versionKeys = policies.map((policy) => `${policy.id}@${policy.version}`);
  for (const duplicate of duplicateValues(versionKeys)) {
    issues.push({ code: 'DUPLICATE_POLICY_VERSION', message: `Duplicate policy version ${duplicate}` });
  }

  for (const policy of policies) {
    const artifact = { artifactId: policy.id, artifactVersion: policy.version };
    if (policy.scopeLevel === 'SITE' && !policy.siteId) {
      issues.push({ ...artifact, code: 'SITE_POLICY_WITHOUT_SITE', message: 'Site-scoped policy requires siteId.' });
    }
    if (policy.scopeLevel === 'ORGANIZATION' && policy.siteId !== undefined) {
      issues.push({
        ...artifact,
        code: 'ORGANIZATION_POLICY_WITH_SITE',
        message: 'Organization-scoped policy must not set siteId.',
      });
    }
    if (policy.priority !== undefined && (!Number.isInteger(policy.priority) || policy.priority < 0)) {
      issues.push({ ...artifact, code: 'INVALID_POLICY_PRIORITY', message: 'Policy priority must be a non-negative integer.' });
    }
    const effect = policy.effect;
    const hasEffect =
      effect.dispositionOverride !== undefined ||
      effect.reasonCodes !== undefined ||
      effect.requiredModifierIds !== undefined ||
      effect.timingRule !== undefined ||
      effect.restartOwner !== undefined;
    if (!hasEffect) {
      issues.push({ ...artifact, code: 'EMPTY_POLICY_EFFECT', message: 'Policy must define at least one operational effect.' });
    }
  }

  return issues;
}

export function validateEngineArtifacts(
  rules: ClinicalRule[],
  policies: PolicyOverlay[] = [],
): EngineValidationIssue[] {
  return [...validateRules(rules), ...validatePolicies(policies)].sort((a, b) => {
    const idDelta = (a.artifactId ?? '').localeCompare(b.artifactId ?? '');
    if (idDelta !== 0) return idDelta;
    const versionDelta = (a.artifactVersion ?? 0) - (b.artifactVersion ?? 0);
    if (versionDelta !== 0) return versionDelta;
    return a.code.localeCompare(b.code);
  });
}
