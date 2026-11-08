// Independent synthetic worker: token parsing, no imports from worker A or its output.
import { readFileSync } from 'node:fs';
const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if ('candidate' in input || 'extraction' in input) throw new Error('BLIND_CONTEXT_VIOLATION');
const s = input.source;
if (s.kind !== 'synthetic') throw new Error('FIXTURE_AGENT_REFUSES_REAL_SOURCE');
const lines = s.text.split('\n');
const fields = Object.fromEntries(lines.map(l => { const split = l.indexOf(': '); return [l.slice(0, split).toLowerCase(), l.slice(split + 2)]; }));
const medication = fields.medication.split('; ');
const proc = fields.procedure.split('; ');
const renal = fields.renal.split(' ');
const readTiming = field => { const t = fields[field].split('; ')[1].split(' '); const hours = t[1] === 'hours'; return { action: 'interrupt', min: +t[0], max: +t[0], unit: hours ? 'hours' : 'calendar_days', anchor: t[hours ? 3 : 4] }; };
const rule = { id: `${s.id}-rule`, version: s.version, origin: 'society',
  medication: { canonicalIds: medication[1].slice('canonical IDs: '.length).split(', '), ingredientIds: medication[2].slice('ingredients: '.length).split(', ') },
  formulation: fields.formulation, procedure: { setting: proc[0].split(' ')[0], code: proc[0].split(' ')[1], bleedingRisk: proc[1].split(': ')[1], thromboticRisk: proc[2].split(': ')[1] },
  renal: { metric: renal[0], min: +renal[2], max: +renal[5], lowerInclusive: renal[1] === '>=', upperInclusive: renal[4] === '<=', unit: renal[6] },
  hold: readTiming('hold'), resume: readTiming('resume'), bridging: fields.bridging, exceptions: fields.exceptions.split(', '),
  certainty: { strength: fields.certainty.split('; ')[0], evidence: fields.certainty.split('; ')[1] } };
let offset = 0;
const anchors = lines.map((quote, i) => { const field = quote.slice(0, quote.indexOf(': ')).toLowerCase(); const a = { field, quote, start: offset, end: offset + quote.length, location: `text-lines:${i + 1}`, sourceHash: s.textHash }; offset += quote.length + 1; return a; });
console.log(JSON.stringify({ sourceId: s.id, sourceHash: s.textHash, publicationDate: s.published, rule, anchors, issues: [] }));
