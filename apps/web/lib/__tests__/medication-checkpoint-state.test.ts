import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// A green clinical build must not conceal an unreadable automation resume file.
describe('medication batch durable state', () => {
  it('retains a complete parseable Batch 02 checkpoint with safe continuation boundaries', () => {
    const url = new URL('../../../../clinical-content/backlog/med-batch-02-checkpoints.json', import.meta.url);
    const state = JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>;
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
