import { describe, expect, it } from 'vitest';
import { assertGoldenCases, assertNoUnreviewedSafetyDiffs, diffBehavior, runGoldenCases } from '../index.js';

describe('golden replay', () => {
  it('passes deterministic cases', () => {
    const results = runGoldenCases([{ id: 'A', name: 'double', input: 2, expected: 4 }], (n) => n * 2);
    expect(results[0]?.passed).toBe(true);
    expect(() => assertGoldenCases(results)).not.toThrow();
  });
});

describe('rule behavior diff', () => {
  it('flags disposition changes as safety relevant', () => {
    const before = [{ caseId: 'C1', disposition: 'CONTINUE', reasonCodes: [], ruleRefs: [], policyRefs: [] }];
    const after = [{ caseId: 'C1', disposition: 'CLINICIAN_REVIEW_REQUIRED', reasonCodes: ['X'], ruleRefs: [], policyRefs: [] }];
    const diffs = diffBehavior(before, after);
    expect(diffs[0]?.safetyRelevant).toBe(true);
    expect(() => assertNoUnreviewedSafetyDiffs(diffs)).toThrow();
    expect(() => assertNoUnreviewedSafetyDiffs(diffs, ['C1'])).not.toThrow();
  });
});
