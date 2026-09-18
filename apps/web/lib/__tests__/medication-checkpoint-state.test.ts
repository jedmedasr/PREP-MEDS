import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function checkpointPath(): string {
  // Works when Vitest starts from either the repository root or its web workspace.
  let directory = resolve(process.cwd());
  for (;;) {
    if (existsSync(join(directory, 'pnpm-workspace.yaml'))) {
      return join(directory, 'clinical-content/backlog/med-batch-02-checkpoints.json');
    }
    const parent = dirname(directory);
    if (parent === directory) throw new Error('PREP-MEDS workspace root not found');
    directory = parent;
  }
}

// A green clinical build must not conceal an unreadable automation resume file.
describe('medication batch durable state', () => {
  it('retains a complete parseable Batch 02 checkpoint with safe continuation boundaries', () => {
    const state = JSON.parse(readFileSync(checkpointPath(), 'utf8')) as Record<string, unknown>;
    expect(state.batchId).toBe('MED-BATCH-02-DIABETES-CORE');
    expect(state.branch).toBe('med-batch-02-diabetes-core');
    expect(state.pullRequest).toBe(12);
    expect(state.productionActivationAllowed).toBe(false);
    const checkpoints = state.checkpoints as Record<string, unknown>;
    for (const name of ['A_EVIDENCE_AUDIT', 'B_TERMINOLOGY_AUDIT', 'C_RULE_AUDIT', 'D_TEST_AUDIT', 'E_INTEGRATION_AUDIT', 'F_CI_REPAIR', 'G_PR_FINALIZATION']) {
      expect(checkpoints[name]).toBeDefined();
    }
    expect(typeof state.nextCheckpoint).toBe('string');
    expect(typeof state.nextWorkItem).toBe('string');
  });
});
