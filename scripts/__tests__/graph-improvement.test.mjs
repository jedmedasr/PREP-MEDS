import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeIncidentDocuments } from '../graph/improvement.mjs';

function incident(source, code, overrides = {}) {
  return {
    source,
    incident: {
      schema_version: 1,
      task_id: 'ENG-003',
      observed_at: '2026-11-13T12:00:00Z',
      implementation_sha: 'a'.repeat(40),
      workflow_run: 'https://github.com/jedmedasr/PREP-MEDS/actions/runs/1',
      observed_errors: [code],
      remote_recovery_verified: false,
      ...overrides
    }
  };
}

test('repeated failure signatures become deterministic improvement candidates', () => {
  const report = analyzeIncidentDocuments([
    incident('engineering/incidents/a.json', 'LIVE_STATE_UNAVAILABLE'),
    incident('engineering/incidents/b.json', 'LIVE_STATE_UNAVAILABLE')
  ]);
  assert.equal(report.metrics.recurrent_failure_signatures, 1);
  assert.equal(report.metrics.improvement_candidate_count, 1);
  assert.equal(report.improvement_candidates[0].failure_code, 'LIVE_STATE_UNAVAILABLE');
  assert.equal(report.improvement_candidates[0].priority, 'high');
  assert.equal(report.improvement_candidates[0].auto_mutation_authorized, false);
  assert.equal(report.learning_loop_status, 'RECURRENT_FAILURES_CONVERTED_TO_CANDIDATES');
});

test('single unresolved failures still produce reviewable work without automatic mutation', () => {
  const report = analyzeIncidentDocuments([incident('engineering/incidents/a.json', 'API_BUDGET_EXCEEDED')]);
  assert.equal(report.improvement_candidates.length, 1);
  assert.equal(report.improvement_candidates[0].priority, 'medium');
  assert.equal(report.auto_mutation_authorized, false);
  assert.equal(report.clinical_content_mutation_authorized, false);
});

test('verified recovery lowers priority but preserves the historical learning signal', () => {
  const report = analyzeIncidentDocuments([
    incident('engineering/incidents/a.json', 'LIVE_STATE_UNAVAILABLE', { remote_recovery_verified: true }),
    incident('engineering/incidents/b.json', 'LIVE_STATE_UNAVAILABLE', { remote_recovery_verified: true })
  ]);
  assert.equal(report.failure_signatures[0].unresolved_occurrences, 0);
  assert.equal(report.improvement_candidates[0].priority, 'low');
});

test('malformed incident evidence blocks the learning loop rather than being silently ignored', () => {
  const report = analyzeIncidentDocuments([{ source: 'bad.json', incident: { task_id: 'ENG-003' } }]);
  assert.equal(report.learning_loop_status, 'BLOCKED_INVALID_INCIDENT');
  assert.equal(report.metrics.invalid_incident_count, 1);
  assert.equal(report.metrics.improvement_candidate_count, 0);
});

test('candidate identity is stable regardless of incident ordering', () => {
  const a = incident('a.json', 'LIVE_STATE_UNAVAILABLE');
  const b = incident('b.json', 'LIVE_STATE_UNAVAILABLE');
  const left = analyzeIncidentDocuments([a, b]).improvement_candidates[0].id;
  const right = analyzeIncidentDocuments([b, a]).improvement_candidates[0].id;
  assert.equal(left, right);
});
