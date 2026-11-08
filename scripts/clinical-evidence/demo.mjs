import { fileURLToPath } from 'node:url';
import { snapshot, comparison, instructionPreview, appendVersion, ruleDiff, affectedIdentities } from './core.mjs';
import { processRevision } from './pipeline.mjs';
export const inventory = [
  { id: 'SYN-A', ingredientIds: ['SYN-ING-A'], formulation: 'oral-tablet' },
  { id: 'SYN-A-BRAND', ingredientIds: ['SYN-ING-A'], formulation: 'oral-tablet' },
  { id: 'SYN-A-INJECTION', ingredientIds: ['SYN-ING-A'], formulation: 'injection' },
  { id: 'SYN-AB', ingredientIds: ['SYN-ING-A', 'SYN-ING-B'], formulation: 'oral-tablet' }
];
export function fixtureSource(id = 'synthetic-society-alpha', days = 3) {
  return snapshot({ id, society: id, kind: 'synthetic', published: '2026-11-01', url: `https://example.invalid/${id}`, allowedHosts: ['example.invalid'], version: `fixture-${days}` }, [
    'Medication: synthetic-a; canonical IDs: SYN-A, SYN-A-BRAND; ingredients: SYN-ING-A',
    'Formulation: oral-tablet', 'Procedure: elective synthetic-procedure; bleeding risk: high; thrombotic risk: low',
    'Renal: CrCl >= 30 and < 60 mL/min', `Hold: interrupt; ${days} calendar days before procedure_start`,
    'Resume: interrupt; 2 calendar days after procedure_end', 'Bridging: not_recommended',
    'Exceptions: unstableRenal, recentThrombosis, activeBleeding', 'Certainty: conditional; low'
  ].join('\n'));
}
export const patient = { synthetic: true, medicationId: 'SYN-A', formulation: 'oral-tablet', procedure: { setting: 'elective', code: 'synthetic-procedure', bleedingRisk: 'high', thromboticRisk: 'low' },
  procedureDate: '2026-11-10', procedureEndDate: '2026-11-10', timeZone: 'America/Chicago', renal: { metric: 'CrCl', value: 45, unit: 'mL/min' },
  conditions: { unstableRenal: false, recentThrombosis: false, activeBleeding: false, hemostasisConfirmed: true } };
export const workers = { agentA: fileURLToPath(new URL('./fixture-agent-a.mjs', import.meta.url)), agentB: fileURLToPath(new URL('./fixture-agent-b.mjs', import.meta.url)) };
export async function runDemo() {
  const first = await processRevision({ source: fixtureSource(), inventory, ...workers });
  const revised = await processRevision({ source: fixtureSource('synthetic-society-alpha', 4), inventory, previous: first.cache, ...workers });
  const alternative = await processRevision({ source: fixtureSource('synthetic-society-beta', 2), inventory, ...workers });
  const unchanged = await processRevision({ source: revised.record.source, inventory, previous: revised.cache, cachedRecord: revised.record, ...workers });
  const history = appendVersion(appendVersion([], first.record), revised.record);
  const records = [revised.record, alternative.record];
  const currentHashes = Object.fromEntries(records.map(r => [r.source.id, r.source.textHash]));
  const selected = { recordId: revised.record.id, clinicianId: 'SYNTHETIC-CLINICIAN', decisionId: 'SYNTHETIC-DECISION-001' };
  return { demonstration: 'SYNTHETIC_DOCUMENTS_NOT_SOCIETY_GUIDANCE', records, inventory, patient, currentHashes,
    revisionDetected: first.record.source.textHash !== revised.record.source.textHash, preservedVersions: history.length,
    diff: ruleDiff(first.record.a.rule, revised.record.a.rule), affected: affectedIdentities(first.record.a.rule, revised.record.a.rule, inventory),
    comparisons: comparison(records, patient, inventory, currentHashes),
    preview: instructionPreview(records, selected, patient, inventory, currentHashes, { mode: 'synthetic' }),
    verification: revised.verification, independentWorkerCalls: first.agentCalls + revised.agentCalls + alternative.agentCalls,
    unchangedSourceCalls: unchanged.agentCalls, modelCalls: 0 };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = await runDemo();
  console.log(JSON.stringify({ ...report, records: report.records.map(r => ({ id: r.id, sourceHash: r.source.textHash, receipts: r.receipts })) }, null, 2));
}
