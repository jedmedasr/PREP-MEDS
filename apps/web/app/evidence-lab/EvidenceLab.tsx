'use client';
import { useEffect, useState } from 'react';
import type { ComparisonRow, Preview, Patient } from '../../../../scripts/clinical-evidence/core.mjs';
// A changed case explicitly clears the previous preview before re-verification.
type View = { rows: ComparisonRow[]; patient: Patient; output?: Preview | undefined };
export default function EvidenceLab() {
  const [view, setView] = useState<View | null>(null);
  const [selected, setSelected] = useState('');
  const [date, setDate] = useState('2026-11-10');
  const [renal, setRenal] = useState('45');
  const [metric, setMetric] = useState('CrCl');
  const [risk, setRisk] = useState('high');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { let alive = true; fetch('/api/evidence-lab').then(async r => { if (!r.ok) throw new Error('Lab unavailable'); return r.json(); }).then((v: View) => { if (alive) setView(v); }).catch((e: Error) => { if (alive) setError(e.message); }); return () => { alive = false; }; }, []);
  const invalidate = () => { setSelected(''); setView(v => v ? { ...v, output: undefined, rows: v.rows.map(r => ({...r, selectable:false})) } : null); };
  async function submit(generate: boolean) {
    setBusy(true); setError('');
    try {
      if (!renal.trim()) throw new Error('A renal value is required; absence is not normal renal function.');
      const response = await fetch('/api/evidence-lab', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({procedureDate:date,renalValue:Number(renal),renalMetric:metric,bleedingRisk:risk,...(generate ? {recordId:selected} : {})}) });
      const result = await response.json() as View & {error?:string};
      if (!response.ok) throw new Error(result.error ?? 'Unverified or unsupported');
      setView(result); if (!generate) setSelected('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Request failed'); setView(v => v ? {...v,output:undefined} : null); }
    finally { setBusy(false); }
  }
  function exportReceipt() {
    if (!view?.output) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(view.output,null,2)],{type:'application/json'}));
    const a = document.createElement('a');a.href=url;a.download='synthetic-evidence-decision.json';a.click();URL.revokeObjectURL(url);
  }
  return <main style={{maxWidth:1100,margin:'auto',padding:24}}>
    <h1>Source-verified evidence laboratory</h1>
    <p role="note"><strong>Synthetic documents, fictional societies, and a synthetic medication only. Not medical guidance. Do not enter patient information.</strong></p>
    <p>No additional clinician re-endorsement is required for a faithfully verified society extraction. This demonstration tests that model; it does not certify any real guideline.</p>
    <section aria-label="Synthetic case" style={{display:'flex',gap:16,flexWrap:'wrap',margin:'24px 0'}}>
      <label>Procedure date <input disabled={busy} type="date" value={date} onChange={e=>{setDate(e.target.value);invalidate();}} /></label>
      <label>Renal measurement <select disabled={busy} value={metric} onChange={e=>{setMetric(e.target.value);invalidate();}}><option>CrCl</option><option>eGFR</option></select></label>
      <label>Value (mL/min) <input disabled={busy} type="number" value={renal} onChange={e=>{setRenal(e.target.value);invalidate();}} /></label>
      <label>Bleeding risk <select disabled={busy} value={risk} onChange={e=>{setRisk(e.target.value);invalidate();}}><option value="high">High</option><option value="low">Low</option><option value="unknown">Unknown</option></select></label>
      <button disabled={busy} onClick={()=>void submit(false)}>Recheck applicability</button>
    </section>
    <p>The synthetic case explicitly supplies oral-tablet formulation, elective procedure, low thrombotic risk, no listed exceptions, and confirmed hemostasis. Resumption is blocked without confirmation. Dates use America/Chicago.</p>
    {error && <p role="alert"><strong>Blocked: {error}</strong></p>}
    <section aria-label="Guideline comparison" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:20}}>
      {view?.rows.map(row=><article key={row.id} style={{border:'1px solid',borderRadius:8,padding:18}}>
        <h2>{row.society.replace('synthetic-society-','Fictional society ')}</h2>
        <p><strong>{row.status}</strong> | Published {row.published}</p>
        <dl><dt>Hold / last-dose boundary</dt><dd>{row.rule.hold.min} to {row.rule.hold.max} {row.rule.hold.unit.replace('_',' ')}</dd><dt>Resumption boundary</dt><dd>{row.rule.resume.min} to {row.rule.resume.max} {row.rule.resume.unit.replace('_',' ')}</dd><dt>Renal scope</dt><dd>{row.rule.renal.metric} {row.rule.renal.lowerInclusive?'>=':'>'} {row.rule.renal.min}; {row.rule.renal.upperInclusive?'<=':'<'} {row.rule.renal.max} {row.rule.renal.unit}</dd><dt>Bridging</dt><dd>{row.rule.bridging}</dd><dt>Certainty</dt><dd>{row.rule.certainty.strength}; {row.rule.certainty.evidence}</dd><dt>Exceptions</dt><dd>{row.rule.exceptions.join(', ')}</dd></dl>
        <details><summary>Exact source passages and locations</summary>{row.passages.map((p,i)=><p key={i}><strong>{p.field}</strong> ({p.location}): <q>{p.quote}</q></p>)}<p>Source SHA-256: <code style={{overflowWrap:'anywhere'}}>{row.sourceHash}</code></p></details>
        {row.reasons.length>0 && <p>Unavailable: {row.reasons.join('; ')}</p>}
        <button disabled={!row.selectable || busy} aria-pressed={selected===row.id} onClick={()=>{setSelected(row.id);setView(v=>v?{...v,output:undefined}:null);}}>{selected===row.id?'Selected by clinician':'Select this source'}</button>
      </article>)}
    </section>
    <p>No shortest/longest interval or consensus is selected automatically.</p>
    <button disabled={!selected || busy} onClick={()=>void submit(true)}>Generate synthetic instruction preview</button>
    {view?.output && <section aria-label="Traceable instruction preview"><h2>Synthetic instruction preview</h2><p>{view.output.text}</p><p>Decision {view.output.decisionId}; rule {view.output.ruleId}@{view.output.ruleVersion}; recorded {view.output.decidedAt}.</p><button onClick={exportReceipt}>Export synthetic audit receipt</button><details><summary>Full decision provenance</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(view.output,null,2)}</pre></details></section>}
    <p>Prototype receipts are returned to the browser, not stored as real clinical records. Authenticated clinician identity and compliant durable decision storage remain production-integration requirements.</p>
  </main>;
}
