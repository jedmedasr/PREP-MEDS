import type { GoldenCase, ReplayResult } from './types.js';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

export function runGoldenCases<TInput, TOutput>(
  cases: GoldenCase<TInput, TOutput>[],
  evaluator: (input: TInput) => TOutput,
): ReplayResult<TOutput>[] {
  return cases.map((testCase) => {
    const actual = evaluator(testCase.input);
    return {
      caseId: testCase.id,
      passed: stableStringify(actual) === stableStringify(testCase.expected),
      expected: testCase.expected,
      actual,
    };
  });
}

export function assertGoldenCases(results: ReplayResult[]): void {
  const failed = results.filter((result) => !result.passed);
  if (failed.length > 0) {
    throw new Error(`Golden-case replay failed for: ${failed.map((item) => item.caseId).join(', ')}`);
  }
}
