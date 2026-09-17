import { createHash } from 'node:crypto';

import {
  evaluateDecision,
  type DecisionExecution,
  type EngineRequest,
} from '@prep-meds/clinical-engine';

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value === null || typeof value !== 'object') return value;

  const record = value as Record<string, unknown>;
  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    ordered[key] = canonicalize(record[key]);
  }
  return ordered;
}

export function canonicalDecisionJson(execution: DecisionExecution): string {
  return JSON.stringify(canonicalize(execution));
}

export function decisionFingerprint(execution: DecisionExecution): string {
  return createHash('sha256').update(canonicalDecisionJson(execution)).digest('hex');
}

export interface ReplayResult {
  iterations: number;
  fingerprint: string;
  executions: DecisionExecution[];
}

export function replayDecision(request: EngineRequest, iterations = 5): ReplayResult {
  if (!Number.isInteger(iterations) || iterations < 2) {
    throw new Error('Deterministic replay requires at least 2 iterations.');
  }

  const executions = Array.from({ length: iterations }, () => evaluateDecision(request));
  const fingerprints = executions.map(decisionFingerprint);
  const unique = new Set(fingerprints);

  if (unique.size !== 1) {
    throw new Error(`Non-deterministic clinical-engine output detected: ${[...unique].join(', ')}`);
  }

  return {
    iterations,
    fingerprint: fingerprints[0]!,
    executions,
  };
}
