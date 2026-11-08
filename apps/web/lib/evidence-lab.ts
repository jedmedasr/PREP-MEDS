import encoded from '../../../engineering/clinical-evidence/synthetic-bundle.json';
import { gunzipSync } from 'node:zlib';
import { createHash, randomUUID } from 'node:crypto';
import { comparison, instructionPreview, type Patient, type Selection, type InventoryItem } from '../../../scripts/clinical-evidence/core.mjs';
type Bundle = { notice:string;records:unknown[];inventory:InventoryItem[];patient:Patient;currentHashes:Record<string,string> };
const bytes = gunzipSync(Buffer.from(encoded.data, 'base64'), {maxOutputLength:100000});
if (createHash('sha256').update(bytes).digest('hex') !== encoded.sha256) throw new Error('SYNTHETIC_FIXTURE_INTEGRITY');
const bundle = JSON.parse(bytes.toString('utf8')) as Bundle;
export function evidenceLabEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.PREP_MEDS_CONTENT_MODE === 'shadow' && env.PREP_MEDS_EVIDENCE_LAB === 'synthetic';
}
export function labCase(input: unknown = {}): { patient: Patient; selection?: Selection } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID_REQUEST');
  const payload = input as Record<string, unknown>;
  if (Object.keys(payload).some(k => !['procedureDate', 'renalValue', 'renalMetric', 'bleedingRisk', 'recordId'].includes(k))) throw new Error('SYNTHETIC_FIELDS_ONLY');
  const patient: Patient = structuredClone(bundle.patient);
  if (payload.procedureDate !== undefined) {
    if (typeof payload.procedureDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.procedureDate)) throw new Error('INVALID_PROCEDURE_DATE');
    patient.procedureDate = payload.procedureDate; patient.procedureEndDate = payload.procedureDate;
  }
  if (payload.renalValue !== undefined) {
    if (typeof payload.renalValue !== 'number' || !Number.isFinite(payload.renalValue) || payload.renalValue < 0 || payload.renalValue > 300) throw new Error('INVALID_RENAL_VALUE');
    patient.renal.value = payload.renalValue;
  }
  if (payload.renalMetric !== undefined) {
    if (!['CrCl', 'eGFR'].includes(String(payload.renalMetric))) throw new Error('INVALID_RENAL_METRIC');
    patient.renal.metric = String(payload.renalMetric);
  }
  if (payload.bleedingRisk !== undefined) {
    if (!['low', 'high', 'unknown'].includes(String(payload.bleedingRisk))) throw new Error('INVALID_BLEEDING_RISK');
    patient.procedure.bleedingRisk = String(payload.bleedingRisk);
  }
  if (payload.recordId !== undefined && typeof payload.recordId !== 'string') throw new Error('INVALID_SELECTION');
  return { patient, ...(typeof payload.recordId === 'string' ? { selection: { recordId: payload.recordId, clinicianId: 'SYNTHETIC-CLINICIAN', decisionId: `SYNTHETIC-${randomUUID()}`, decidedAt: new Date().toISOString() } } : {}) };
}
export function buildLabView(input: unknown = {}) {
  const { patient, selection } = labCase(input);
  const rows = comparison(bundle.records, patient, bundle.inventory, bundle.currentHashes);
  return { notice: bundle.notice, patient, rows, ...(selection ? { output: instructionPreview(bundle.records, selection, patient, bundle.inventory, bundle.currentHashes, { mode: 'synthetic' }) } : {}) };
}
