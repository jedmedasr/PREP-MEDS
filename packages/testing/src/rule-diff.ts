import type { RuleBehaviorSnapshot, RuleDiff } from './types.js';

function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffBehavior(
  before: RuleBehaviorSnapshot[],
  after: RuleBehaviorSnapshot[],
): RuleDiff[] {
  const ids = new Set([...before.map((x) => x.caseId), ...after.map((x) => x.caseId)]);
  const beforeMap = new Map(before.map((x) => [x.caseId, x]));
  const afterMap = new Map(after.map((x) => [x.caseId, x]));
  return [...ids].sort().map((caseId) => {
    const left = beforeMap.get(caseId);
    const right = afterMap.get(caseId);
    const changedFields: string[] = [];
    if (!left || !right) changedFields.push('case_presence');
    else {
      if (left.disposition !== right.disposition) changedFields.push('disposition');
      if (!equal(left.reasonCodes, right.reasonCodes)) changedFields.push('reasonCodes');
      if (!equal(left.ruleRefs, right.ruleRefs)) changedFields.push('ruleRefs');
      if (!equal(left.policyRefs, right.policyRefs)) changedFields.push('policyRefs');
    }
    const safetyRelevant = changedFields.some((f) => ['case_presence', 'disposition', 'reasonCodes'].includes(f));
    return { caseId, changed: changedFields.length > 0, before: left, after: right, changedFields, safetyRelevant };
  });
}

export function assertNoUnreviewedSafetyDiffs(diffs: RuleDiff[], approvedCaseIds: string[] = []): void {
  const approved = new Set(approvedCaseIds);
  const blocked = diffs.filter((d) => d.safetyRelevant && !approved.has(d.caseId));
  if (blocked.length) throw new Error(`Unreviewed safety-relevant rule diffs: ${blocked.map((d) => d.caseId).join(', ')}`);
}
