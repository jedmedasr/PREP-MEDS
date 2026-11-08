import { digest, TASK } from './core.mjs';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim());
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;

/** Read-only adapter for the explicitly incomplete v1 handoffs from evidence/knowledge PRs.
 * Original files remain immutable. A legacy PASS is never accepted or manufactured.
 */
export function normalizeHandoff(raw) {
  if (!object(raw)) throw new Error('MALFORMED_HANDOFF');
  if ('previous_task' in raw || 'previous_outcome' in raw || 'created_at' in raw) {
    if (!TASK.test(raw.previous_task ?? '') || !['PASS','PARTIAL','FAIL'].includes(raw.previous_outcome) ||
        !strings(raw.outstanding_blockers) || typeof raw.created_at !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T/.test(raw.created_at) || !date(raw.created_at.slice(0,10)) ||
        !Number.isFinite(Date.parse(raw.created_at))) throw new Error('MALFORMED_HANDOFF');
    return structuredClone(raw);
  }
  const outcome = raw.outcome ?? raw.objective_status;
  if (raw.outcome !== undefined && raw.objective_status !== undefined && raw.outcome !== raw.objective_status)
    throw new Error('CONFLICTING_HANDOFF_OUTCOME');
  if (raw.schema_version !== 1 || !TASK.test(raw.task_id ?? '') || !['PARTIAL','FAIL'].includes(outcome) || !date(raw.date))
    throw new Error('UNSUPPORTED_LEGACY_HANDOFF');
  const lists = [raw.remaining_blockers,raw.not_delivered].filter(value => value !== undefined);
  if (!lists.length || lists.some(value => !strings(value)) || lists.flat().length === 0)
    throw new Error('MALFORMED_HANDOFF_BLOCKERS');
  return {
    schema_version:2, previous_task:raw.task_id, previous_outcome:outcome,
    // Midnight is an ordering key for a day-precision record, NOT a claimed execution time.
    created_at:`${raw.date}T00:00:00.000Z`, timestamp_precision:'day',
    outstanding_blockers:[...new Set(lists.flat())], next_eligible_task:null,
    recommended_action:'Reconcile the preserved historical handoff, source changes and blockers before resuming.',
    legacy_source_digest:digest(raw), legacy_schema_version:1, completion_inferred:false
  };
}
