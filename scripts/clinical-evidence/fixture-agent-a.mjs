// Synthetic integration-test worker, NOT a clinical extraction agent.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const { source: s } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (s.kind !== 'synthetic') throw new Error('FIXTURE_AGENT_REFUSES_REAL_SOURCE');
const line = name => { const found = s.text.split('\n').find(x => x.startsWith(`${name}: `)); if (!found) throw new Error(`Missing ${name}`); return found; };
const value = name => line(name).slice(name.length + 2);
const med = /^([^;]+); canonical IDs: ([^;]+); ingredients: (.+)$/.exec(value('Medication'));
const p = /^(\w+) ([^;]+); bleeding risk: (\w+); thrombotic risk: (\w+)$/.exec(value('Procedure'));
const renal = /^(CrCl|eGFR) >= (\d+) and < (\d+) mL\/min$/.exec(value('Renal'));
const timing = name => { const m = /^interrupt; (\d+) (calendar days|hours) (before|after) (procedure_start|procedure_end)$/.exec(value(name)); if (!m) throw new Error('Unsupported timing'); return { action: 'interrupt', min: Number(m[1]), max: Number(m[1]), unit: m[2] === 'hours' ? 'hours' : 'calendar_days', anchor: m[4] }; };
const rule = { id: s.id + '-rule', version: s.version, origin: 'society',
  medication: { canonicalIds: med[2].split(', '), ingredientIds: med[3].split(', ') }, formulation: value('Formulation'),
  procedure: { setting: p[1], code: p[2], bleedingRisk: p[3], thromboticRisk: p[4] },
  renal: { metric: renal[1], min: Number(renal[2]), max: Number(renal[3]), lowerInclusive: true, upperInclusive: false, unit: 'mL/min' },
  hold: timing('Hold'), resume: timing('Resume'), bridging: value('Bridging'), exceptions: value('Exceptions').split(', '),
  certainty: { strength: value('Certainty').split('; ')[0], evidence: value('Certainty').split('; ')[1] } };
const anchors = ['medication', 'formulation', 'procedure', 'renal', 'hold', 'resume', 'bridging', 'exceptions', 'certainty'].map(field => {
  const quote = line(field[0].toUpperCase() + field.slice(1)); const start = s.text.indexOf(quote);
  return { field, quote, start, end: start + quote.length, location: `text-lines:${s.text.slice(0, start).split('\n').length}`, sourceHash: s.textHash };
});
if (createHash('sha256').update(s.text).digest('hex') !== s.textHash) throw new Error('Changed source');
console.log(JSON.stringify({ sourceId: s.id, sourceHash: s.textHash, publicationDate: s.published, rule, anchors, issues: [] }));
