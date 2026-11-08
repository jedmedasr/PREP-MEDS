import { createHash } from 'node:crypto';

export const VERSION = 'source-evidence-v1';
export const FIELDS = ['medication', 'formulation', 'procedure', 'renal', 'hold', 'resume', 'bridging', 'exceptions', 'certainty'];
export const stable = (value) => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
export const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : stable(value)).digest('hex');
const same = (a, b) => stable(a) === stable(b);
const nonempty = s => typeof s === 'string' && s.trim().length > 0;
const isoDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
const fail = code => { throw new Error(code); };

/** Source text is data, never executable instructions. The trusted fetch adapter supplies provenance. */
export function snapshot(meta, text) {
  if (!meta || !nonempty(meta.id) || !nonempty(meta.society) || !(isoDate(meta.published) || /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/.test(meta.published ?? '')) || !nonempty(text)) fail('INVALID_SOURCE');
  if (!['primary', 'synthetic'].includes(meta.kind)) fail('NOT_A_PRIMARY_SOURCE');
  const url = new URL(meta.url);
  if (url.protocol !== 'https:' || url.username || url.password) fail('INVALID_SOURCE_URL');
  if (!Array.isArray(meta.allowedHosts) || !meta.allowedHosts.includes(url.hostname)) fail('SOURCE_HOST_NOT_ALLOWED');
  return { ...structuredClone(meta), text, textHash: digest(text), version: meta.version ?? digest(text), available: true };
}

export function anchor(source, field, quote) {
  const start = source.text.indexOf(quote);
  if (start < 0) fail('PASSAGE_NOT_FOUND');
  return { field, start, end: start + quote.length, quote, location: `text-lines:${source.text.slice(0, start).split('\n').length}`, sourceHash: source.textHash };
}

function checkAnchor(source, a, field) {
  return a?.field === field && nonempty(a.quote) && nonempty(a.location) && a.sourceHash === source.textHash &&
    Number.isInteger(a.start) && Number.isInteger(a.end) && a.start >= 0 && a.end > a.start &&
    source.text.slice(a.start, a.end) === a.quote &&
    a.location === `text-lines:${source.text.slice(0, a.start).split('\n').length}`;
}

function validateTiming(t, name, errors) {
  if (!t || !['continue', 'interrupt', 'not_specified'].includes(t.action)) { errors.push(`${name}:ACTION`); return; }
  if (!['hours', 'calendar_days', 'not_specified'].includes(t.unit)) errors.push(`${name}:UNIT`);
  if (!['procedure_start', 'procedure_end', 'not_specified'].includes(t.anchor)) errors.push(`${name}:ANCHOR`);
  if (t.action === 'interrupt') {
    if (!Number.isFinite(t.min) || !Number.isFinite(t.max) || t.min < 0 || t.max < t.min || t.max > 8760 || t.unit === 'not_specified' || t.anchor === 'not_specified') errors.push(`${name}:INTERVAL`);
    if (t.unit === 'calendar_days' && (!Number.isInteger(t.min) || !Number.isInteger(t.max))) errors.push(`${name}:FRACTIONAL_CALENDAR_DAY`);
  } else if (t.min !== null || t.max !== null || t.unit !== 'not_specified' || t.anchor !== 'not_specified') errors.push(`${name}:INVENTED_INTERVAL`);
}

export function validateRule(rule, inventory) {
  const errors = [];
  if (!rule || typeof rule !== 'object') return ['INVALID_RULE'];
  for (const f of FIELDS) if (!(f in rule)) errors.push(`MISSING_FIELD:${f}`);
  if (!nonempty(rule.id) || !nonempty(rule.version) || !['society', 'institution', 'derived'].includes(rule.origin)) errors.push('IDENTITY_OR_ORIGIN');
  const med = rule.medication;
  if (!med || !Array.isArray(med.ingredientIds) || !med.ingredientIds.length || new Set(med.ingredientIds).size !== med.ingredientIds.length || !Array.isArray(med.canonicalIds) || !med.canonicalIds.length || new Set(med.canonicalIds).size !== med.canonicalIds.length) errors.push('MEDICATION_IDENTITY');
  else for (const id of med.canonicalIds) {
    const item = inventory.find(m => m.id === id);
    if (!item || !same([...item.ingredientIds].sort(), [...med.ingredientIds].sort())) errors.push(`INGREDIENT_MAPPING:${id}`);
    if (!item || item.formulation !== rule.formulation) errors.push(`FORMULATION_MAPPING:${id}`);
  }
  if (!nonempty(rule.formulation)) errors.push('FORMULATION_UNSPECIFIED');
  if (!rule.procedure || !['low', 'high'].includes(rule.procedure.bleedingRisk) || !nonempty(rule.procedure.code) || rule.procedure.setting !== 'elective' || !['low', 'high'].includes(rule.procedure.thromboticRisk)) errors.push('PROCEDURE_SCOPE');
  const renal = rule.renal;
  if (!renal || !['CrCl', 'eGFR', 'not_specified'].includes(renal.metric) || renal.unit !== 'mL/min' || typeof renal.lowerInclusive !== 'boolean' || typeof renal.upperInclusive !== 'boolean') errors.push('RENAL_SCHEMA');
  else if (renal.metric === 'not_specified') {
    if (renal.min !== null || renal.max !== null) errors.push('INVENTED_RENAL_THRESHOLD');
  } else if (!Number.isFinite(renal.min) || renal.min < 0 || (renal.max !== null && (!Number.isFinite(renal.max) || renal.max <= renal.min))) errors.push('RENAL_INTERVAL');
  validateTiming(rule.hold, 'HOLD', errors);
  validateTiming(rule.resume, 'RESUME', errors);
  if (rule.hold?.action === 'interrupt' && rule.hold.anchor !== 'procedure_start') errors.push('HOLD_WRONG_ANCHOR');
  if (rule.resume?.action === 'interrupt' && rule.resume.anchor !== 'procedure_end') errors.push('RESUME_WRONG_ANCHOR');
  if (!['not_recommended', 'required', 'individualize', 'not_specified'].includes(rule.bridging)) errors.push('BRIDGING');
  if (!Array.isArray(rule.exceptions) || rule.exceptions.some(x => !nonempty(x)) || new Set(rule.exceptions).size !== rule.exceptions.length) errors.push('EXCEPTIONS');
  if (!rule.certainty || !nonempty(rule.certainty.strength) || !nonempty(rule.certainty.evidence)) errors.push('CERTAINTY');
  return [...new Set(errors)];
}

/** No clinician re-endorsement field: source verification and episode selection are separate. */
export function verifyExtraction(source, a, b, receipts, inventory, trust) {
  const errors = [];
  if (!source?.available || !source.text || digest(source.text) !== source.textHash) return Object.freeze({ verifierVersion: VERSION, status: 'UNVERIFIED', errors: ['SOURCE_UNAVAILABLE_OR_CHANGED'], clinicalEndorsement: false, sourceHash: source?.textHash ?? null });
  if (source?.kind === 'primary' && (!trust?.sourceHashes?.includes(source.textHash) || !trust?.primaryUrls?.includes(source.url))) errors.push('UNTRUSTED_SOURCE_PROVENANCE');
  if (!Array.isArray(receipts) || receipts.length !== 2) errors.push('TWO_INDEPENDENT_RUNS_REQUIRED');
  else {
    const [ra, rb] = receipts;
    if (ra.role !== 'A' || rb.role !== 'B' || !ra.runId || ra.runId === rb.runId || !ra.implementationHash || ra.implementationHash === rb.implementationHash || ra.contextId === rb.contextId) errors.push('NOT_INDEPENDENT');
    for (const [r, output] of [[ra, a], [rb, b]]) {
      if (r.sourceHash !== source.textHash || r.outputHash !== digest(output) || r.inputContract !== 'source-and-scope-only') errors.push('RUN_BINDING');
      if (source.kind === 'primary' && (r.mode !== 'live' || !trust?.runIds?.includes(r.runId))) errors.push('UNTRUSTED_AGENT_RUN');
    }
  }
  for (const [name, extraction] of [['A', a], ['B', b]]) {
    if (!extraction || extraction.sourceHash !== source?.textHash || extraction.sourceId !== source?.id || extraction.publicationDate !== source?.published) { errors.push(`${name}:SOURCE_BINDING`); continue; }
    errors.push(...validateRule(extraction.rule, inventory).map(x => `${name}:${x}`));
    if (extraction.rule?.origin !== 'society') errors.push(`${name}:LOCAL_AUTHORIZATION_REQUIRED`);
    if (!Array.isArray(extraction.issues) || extraction.issues.length) errors.push(`${name}:UNRESOLVED_INTERPRETATION`);
    for (const f of FIELDS) {
      const refs = extraction.anchors?.filter(x => x.field === f) ?? [];
      if (!refs.length || refs.some(ref => !checkAnchor(source, ref, f))) errors.push(`${name}:UNSUPPORTED_PASSAGE:${f}`);
    }
    const renalQuote = (extraction.anchors ?? []).filter(x => x.field === 'renal').map(x => x.quote).join(' ');
    const renal = extraction.rule?.renal;
    if (renal && renal.metric !== 'not_specified') {
      if (!renalQuote.includes(renal.metric) || !/mL\/min/i.test(renalQuote)) errors.push(`${name}:RENAL_MEASURE_NOT_IN_PASSAGE`);
      for (const n of [renal.min, renal.max].filter(n => n !== null)) if (!new RegExp(`(^|[^0-9.])${n}([^0-9.]|$)`).test(renalQuote)) errors.push(`${name}:RENAL_THRESHOLD_NOT_IN_PASSAGE`);
    }
    // Numbers/units cannot be supplied only by agent consensus. They must occur in the timing passage.
    for (const f of ['hold', 'resume']) {
      const t = extraction.rule?.[f];
      const quotes = (extraction.anchors ?? []).filter(x => x.field === f).map(x => x.quote).join(' ');
      if (t?.action === 'interrupt') {
        for (const n of [t.min, t.max]) if (!new RegExp(`(^|[^0-9.])${n}([^0-9.]|$)`).test(quotes)) errors.push(`${name}:${f}:NUMBER_NOT_IN_PASSAGE`);
        if (!new RegExp(t.unit === 'hours' ? '\\bhours?\\b' : '\\bdays?\\b', 'i').test(quotes)) errors.push(`${name}:${f}:UNIT_NOT_IN_PASSAGE`);
        if (/\b(?:do not|never|not recommended to)\s+(?:stop|interrupt|hold)/i.test(quotes)) errors.push(`${name}:${f}:NEGATED_ACTION`);
      }
    }
  }
  if (!same(a?.rule, b?.rule)) errors.push('INDEPENDENT_EXTRACTIONS_DISAGREE');
  const unique = [...new Set(errors)];
  const result = { verifierVersion: VERSION, sourceHash: source?.textHash, ruleHash: digest(a?.rule ?? null), inventoryHash: digest(inventory), errors: unique,
    status: unique.length ? 'UNVERIFIED' : source.kind === 'synthetic' ? 'SYNTHETIC_VERIFIED' : 'SOURCE_VERIFIED',
    clinicalEndorsement: false, independentRuns: receipts?.map(r => r.runId) ?? [] };
  return Object.freeze(result);
}

export function affectedIdentities(oldRule, newRule, inventory) {
  const ingredients = new Set([...(oldRule?.medication?.ingredientIds ?? []), ...(newRule?.medication?.ingredientIds ?? [])]);
  return inventory.filter(m => m.ingredientIds.some(id => ingredients.has(id))).map(m => ({ id: m.id, ingredientIds: [...m.ingredientIds], formulation: m.formulation, requiresReverification: true }));
}

export function ruleDiff(oldRule, newRule) {
  return [...new Set([...Object.keys(oldRule ?? {}), ...Object.keys(newRule ?? {})])].sort().filter(k => !same(oldRule?.[k], newRule?.[k])).map(field => ({ field, before: oldRule?.[field] ?? null, after: newRule?.[field] ?? null }));
}

/** Immutable versions, not an editable CURRENT pointer that erases the previous rule. */
export function appendVersion(history, record) {
  const existing = history.find(x => x.id === record.id);
  if (existing) { if (!same(existing, record)) fail('IMMUTABLE_VERSION_COLLISION'); return history; }
  return [...history, structuredClone(record)];
}

export function applicability(rule, patient) {
  const reasons = [];
  if (!rule.medication.canonicalIds.includes(patient.medicationId)) reasons.push('MEDICATION_NOT_MAPPED');
  if (patient.formulation !== rule.formulation) reasons.push('FORMULATION_MISMATCH');
  for (const k of ['code', 'setting', 'bleedingRisk', 'thromboticRisk']) if (patient.procedure?.[k] !== rule.procedure[k]) reasons.push(`PROCEDURE_${k}`);
  if (!isoDate(patient.procedureDate)) reasons.push('PROCEDURE_DATE_REQUIRED');
  try { new Intl.DateTimeFormat('en', { timeZone: patient.timeZone }).format(); if (!nonempty(patient.timeZone)) throw new Error(); } catch { reasons.push('TIMEZONE_REQUIRED'); }
  if (typeof patient.conditions !== 'object' || !patient.conditions) reasons.push('CONDITIONS_REQUIRED');
  else for (const condition of rule.exceptions) if (patient.conditions[condition] !== false) reasons.push(`EXCEPTION_OR_UNKNOWN:${condition}`);
  const r = rule.renal;
  if (r.metric !== 'not_specified') {
    const v = patient.renal?.value;
    if (patient.renal?.metric !== r.metric || patient.renal?.unit !== r.unit || !Number.isFinite(v)) reasons.push('RENAL_MEASURE_REQUIRED');
    else if ((r.lowerInclusive ? v < r.min : v <= r.min) || (r.max !== null && (r.upperInclusive ? v > r.max : v >= r.max))) reasons.push('RENAL_OUTSIDE_SOURCE_SCOPE');
  }
  return { applicable: reasons.length === 0, reasons };
}

export function comparison(records, patient, inventory, currentHashes) {
  // Society differences remain independent rows. No min/max/consensus recommendation.
  return records.map(record => {
    const verification = verifyExtraction(record.source, record.a, record.b, record.receipts, inventory, record.trust);
    const match = applicability(record.a.rule, patient);
    const stale = currentHashes[record.source.id] !== record.source.textHash || record.superseded === true;
    return { id: record.id, society: record.source.society, published: record.source.published, sourceUrl: record.source.url,
      sourceHash: record.source.textHash, status: stale ? 'POTENTIALLY_SUPERSEDED' : verification.status,
      rule: structuredClone(record.a.rule), passages: record.a.anchors, applicability: match,
      selectable: !stale && verification.errors.length === 0 && match.applicable, reasons: [...verification.errors, ...match.reasons, ...(stale ? ['STALE_SOURCE'] : [])] };
  });
}

const shiftDate = (date, days) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
function calculate(timing, patient, direction, chosen) {
  if (timing.action === 'continue') return { action: 'continue', date: null, timestamp: null };
  if (timing.action === 'not_specified') fail('SOURCE_TIMING_NOT_SPECIFIED');
  const amount = timing.min === timing.max ? timing.min : chosen;
  if (!Number.isFinite(amount) || amount < timing.min || amount > timing.max) fail('CLINICIAN_INTERVAL_SELECTION_REQUIRED');
  if (timing.unit === 'calendar_days') {
    if (!Number.isInteger(amount)) fail('FRACTIONAL_CALENDAR_DAY');
    const base = direction < 0 ? patient.procedureDate : patient.procedureEndDate;
    if (!isoDate(base)) fail('PROCEDURE_END_DATE_REQUIRED');
    return { action: timing.action, date: shiftDate(base, direction * amount), timestamp: null, amount, unit: timing.unit, timeOfDay: 'not_specified_by_source' };
  }
  const base = direction < 0 ? patient.procedureStart : patient.procedureEnd;
  if (typeof base !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(base) || !Number.isFinite(Date.parse(base))) fail('EXPLICIT_OFFSET_TIMESTAMP_REQUIRED');
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: patient.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(base));
  if (direction < 0 && localDate !== patient.procedureDate) fail('PROCEDURE_DATE_TIMESTAMP_MISMATCH');
  return { action: timing.action, date: null, timestamp: new Date(Date.parse(base) + direction * amount * 3600000).toISOString(), amount, unit: timing.unit };
}

/** Prototype deliberately cannot issue production instructions; it does not alter legacy activation. */
export function instructionPreview(records, selection, patient, inventory, currentHashes, { mode = 'disabled' } = {}) {
  if (mode !== 'synthetic' || patient.synthetic !== true) fail('PRODUCTION_ACTIVATION_NOT_IMPLEMENTED');
  if (!selection || !nonempty(selection.clinicianId) || !nonempty(selection.decisionId) || !nonempty(selection.recordId)) fail('EXPLICIT_CLINICIAN_SELECTION_REQUIRED');
  const row = comparison(records, patient, inventory, currentHashes).find(r => r.id === selection.recordId);
  if (!row?.selectable) fail('UNVERIFIED_OR_UNSUPPORTED_SELECTION');
  if (row.status !== 'SYNTHETIC_VERIFIED') fail('REAL_GUIDANCE_NOT_ENABLED_IN_LAB');
  if (row.rule.origin !== 'society') fail('INSTITUTIONAL_OR_DERIVED_AUTHORIZATION_REQUIRED');
  if (row.rule.bridging !== 'not_recommended') fail('BRIDGING_PLAN_UNSUPPORTED');
  if (patient.conditions.hemostasisConfirmed !== true) fail('HEMOSTASIS_NOT_CONFIRMED');
  const hold = calculate(row.rule.hold, patient, -1, selection.holdAmount);
  const resume = calculate(row.rule.resume, patient, 1, selection.resumeAmount);
  const event = { schemaVersion: 1, engineVersion: VERSION, mode: 'SYNTHETIC_ONLY', decisionId: selection.decisionId,
    clinicianId: selection.clinicianId, decidedAt: selection.decidedAt ?? new Date().toISOString(), selection: structuredClone(selection), source: { url: row.sourceUrl, hash: row.sourceHash, society: row.society, published: row.published },
    ruleId: row.rule.id, ruleVersion: row.rule.version, ruleHash: digest(row.rule), verification: row.status,
    patientInputs: structuredClone(patient), hold, resume, warning: 'SYNTHETIC TEST OUTPUT - NOT FOR PATIENT CARE',
    text: `SYNTHETIC ONLY. ${row.rule.hold.action === 'continue' ? 'Continue the synthetic medication.' : `Last-dose boundary: ${hold.date ?? hold.timestamp}.`} Resume boundary: ${resume.date ?? resume.timestamp ?? resume.action}. Calendar dates do not specify a dose time. Do not apply to a real medication or patient.` };
  return { ...event, eventHash: digest(event) };
}

/** A false cache hit must never skip changed scope, verifier, agent code, or missing evidence. */
export function workKey(source, inventory, implementationHashes) {
  return digest({ source: source.textHash, metadata: { id: source.id, published: source.published, kind: source.kind, url: source.url }, inventory, implementationHashes, verifier: VERSION });
}
export function planWork(source, previous, inventory, implementationHashes) {
  const key = workKey(source, inventory, implementationHashes);
  if (previous?.key === key && previous.evidencePresent === true) return { key, invokeAgents: false, reason: 'UNCHANGED_VERIFIED_CACHE', expectedCalls: 0 };
  if (previous?.key === key && previous.state === 'blocked') return { key, invokeAgents: false, reason: 'UNCHANGED_BLOCKER_EXPLICIT_RETRY_REQUIRED', expectedCalls: 0 };
  return { key, invokeAgents: true, reason: previous ? 'SOURCE_SCOPE_OR_VERIFIER_CHANGED' : 'MISSING_EVIDENCE', expectedCalls: 2 };
}
