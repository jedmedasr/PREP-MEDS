export interface GoldenCase<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  input: TInput;
  expected: TOutput;
}

export interface ReplayResult<TOutput = unknown> {
  caseId: string;
  passed: boolean;
  expected: TOutput;
  actual: TOutput;
}

export interface RuleBehaviorSnapshot {
  caseId: string;
  disposition: string;
  reasonCodes: string[];
  ruleRefs: Array<{ id: string; version: number }>;
  policyRefs: Array<{ id: string; version: number }>;
}

export interface RuleDiff {
  caseId: string;
  changed: boolean;
  before?: RuleBehaviorSnapshot;
  after?: RuleBehaviorSnapshot;
  changedFields: string[];
  safetyRelevant: boolean;
}
