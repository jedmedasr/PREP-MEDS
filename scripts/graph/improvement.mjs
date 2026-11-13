import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CODE = /^[A-Z][A-Z0-9_:-]{2,}$/;

function stableId(value) {
  return 'IMP-' + createHash('sha256').update(value).digest('hex').slice(0, 10).toUpperCase();
}

export function incidentCodes(incident) {
  const values = [];
  if (Array.isArray(incident?.observed_errors)) values.push(...incident.observed_errors);
  if (typeof incident?.reported_error === 'string') values.push(incident.reported_error);
  if (typeof incident?.error === 'string') values.push(incident.error);
  return [...new Set(values.filter((v) => typeof v === 'string' && CODE.test(v)))].sort();
}

export function incidentRecovered(incident) {
  return incident?.remote_recovery_verified === true ||
    incident?.recovery_verified === true ||
    incident?.repair_verified === true;
}

export function analyzeIncidentDocuments(documents = []) {
  const invalid_incidents = [];
  const incidents = [];
  const signatures = new Map();

  for (const entry of documents) {
    const source = entry?.source ?? 'unknown';
    const incident = entry?.incident;
    if (!incident || typeof incident !== 'object' || Array.isArray(incident)) {
      invalid_incidents.push({ source, reason: 'INCIDENT_NOT_OBJECT' });
      continue;
    }
    const codes = incidentCodes(incident);
    if (!incident.task_id || !codes.length) {
      invalid_incidents.push({ source, reason: !incident.task_id ? 'TASK_ID_REQUIRED' : 'FAILURE_CODE_REQUIRED' });
      continue;
    }
    const normalized = {
      source,
      task_id: incident.task_id,
      observed_at: incident.observed_at ?? incident.observed_date ?? null,
      implementation_sha: incident.implementation_sha ?? null,
      workflow_run: incident.workflow_run ?? null,
      recovered: incidentRecovered(incident),
      codes
    };
    incidents.push(normalized);
    for (const code of codes) {
      if (!signatures.has(code)) signatures.set(code, []);
      signatures.get(code).push(normalized);
    }
  }

  const failure_signatures = [...signatures.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, observations]) => {
    const unresolved = observations.filter((o) => !o.recovered);
    return {
      code,
      occurrences: observations.length,
      unresolved_occurrences: unresolved.length,
      tasks: [...new Set(observations.map((o) => o.task_id))].sort(),
      sources: observations.map((o) => o.source).sort(),
      recurrent: observations.length >= 2
    };
  });

  const improvement_candidates = failure_signatures
    .filter((s) => s.recurrent || s.unresolved_occurrences > 0)
    .map((s) => ({
      id: stableId(s.code),
      kind: 'engineering_reliability',
      failure_code: s.code,
      priority: s.recurrent && s.unresolved_occurrences > 0 ? 'high' : s.unresolved_occurrences > 0 ? 'medium' : 'low',
      occurrences: s.occurrences,
      unresolved_occurrences: s.unresolved_occurrences,
      affected_tasks: s.tasks,
      acceptance: [
        `Add a deterministic regression test that reproduces ${s.code} or its exact failure boundary.`,
        'Repair the underlying engineering cause without weakening fail-closed, evidence, concurrency, or clinical-governance controls.',
        'Pass exact-head graph-orchestrator and applicable repository quality checks.',
        'Record a later observation proving the repaired failure signature does not recur under the same tested condition.'
      ],
      auto_mutation_authorized: false
    }));

  const recurrent = failure_signatures.filter((s) => s.recurrent);
  const recurrentCovered = recurrent.every((s) => improvement_candidates.some((c) => c.failure_code === s.code));
  return {
    schema_version: 1,
    mode: 'bounded_engineering_learning',
    auto_mutation_authorized: false,
    clinical_content_mutation_authorized: false,
    metrics: {
      incident_count: incidents.length,
      invalid_incident_count: invalid_incidents.length,
      unique_failure_signatures: failure_signatures.length,
      recurrent_failure_signatures: recurrent.length,
      unrecovered_incidents: incidents.filter((i) => !i.recovered).length,
      improvement_candidate_count: improvement_candidates.length,
      recurrent_signature_candidate_coverage_percent: recurrent.length ? Math.round(100 * recurrent.filter((s) => improvement_candidates.some((c) => c.failure_code === s.code)).length / recurrent.length) : 100
    },
    learning_loop_status: invalid_incidents.length
      ? 'BLOCKED_INVALID_INCIDENT'
      : recurrent.length
        ? (recurrentCovered ? 'RECURRENT_FAILURES_CONVERTED_TO_CANDIDATES' : 'RECURRENT_FAILURE_WITHOUT_CANDIDATE')
        : 'NO_RECURRENT_FAILURE_SIGNAL',
    failure_signatures,
    improvement_candidates,
    invalid_incidents,
    note: 'Candidates are proposed engineering work, not completion claims. They require reviewed implementation and exact-head verification before the graph may treat them as resolved.'
  };
}

export function analyzeIncidents(root) {
  const dir = resolve(root, 'engineering/incidents');
  let names = [];
  try { names = readdirSync(dir).filter((name) => name.endsWith('.json')).sort(); }
  catch (error) {
    if (error?.code === 'ENOENT') return analyzeIncidentDocuments([]);
    throw error;
  }
  const documents = names.map((name) => {
    const source = `engineering/incidents/${name}`;
    try { return { source, incident: JSON.parse(readFileSync(join(dir, name), 'utf8')) }; }
    catch { return { source, incident: null }; }
  });
  return analyzeIncidentDocuments(documents);
}
