'use client';

import { useState } from 'react';
import { asge2016ApixabanHighRiskTiming } from '../lib/antithrombotic-timing';
import { researchHoldCalendarDates } from '../lib/antithrombotic-calendar-research';

/** Research-only source comparison; never generates patient instructions. */
export function AntithromboticTimingResearch() {
  const [crcl, setCrcl] = useState('');
  const [procedureDate, setProcedureDate] = useState('');
  const [stable, setStable] = useState(false);
  const [risk, setRisk] = useState<'LOW'|'HIGH'|'UNKNOWN'>('UNKNOWN');
  const [ingredient, setIngredient] = useState('apixaban');
  const valid = crcl.trim() !== '' && Number.isFinite(Number(crcl));
  const result = asge2016ApixabanHighRiskTiming({
    medicationIngredient: ingredient,
    creatinineClearanceMlMin: valid ? Number(crcl) : null,
    procedureBleedingRisk: risk,
    kidneyFunctionStable: stable,
  });
  const dates = result.status === "MATCHED" ? researchHoldCalendarDates({ procedureLocalDate: procedureDate, holdDays: result.holdDays }) : null;
  return <section className="panel" aria-label="Guideline timing research comparison">
    <div className="section-heading"><div><h2>Antithrombotic timing — guideline comparison</h2>
      <p>Clinician research only. No automatic treatment recommendation or patient instruction.</p></div></div>
    <div className="result-grid">
      <label>Procedure local date<input aria-label="Procedure local date" type="date" value={procedureDate} onChange={e => setProcedureDate(e.target.value)} /></label>
      <label>Active ingredient<select aria-label="Timing ingredient" value={ingredient} onChange={e=>setIngredient(e.target.value)}>
        <option value="apixaban">Apixaban</option><option value="rivaroxaban">Rivaroxaban — not yet mapped</option>
        <option value="dabigatran">Dabigatran — not yet mapped</option></select></label>
      <label>Procedure bleeding risk<select aria-label="Procedure bleeding risk" value={risk} onChange={e=>setRisk(e.target.value as typeof risk)}>
        <option value="UNKNOWN">Not determined</option><option value="LOW">Low</option><option value="HIGH">High</option></select></label>
      <label>Verified Cockcroft–Gault CrCl (mL/min)<input aria-label="Verified creatinine clearance" type="number" min="0" step="0.1" value={crcl} onChange={e=>setCrcl(e.target.value)} /></label>
      <label><input type="checkbox" checked={stable} onChange={e=>setStable(e.target.checked)} /> Kidney function clinically assessed as stable</label>
    </div>
    <div className="research-rule" aria-live="polite">
      <h3>ASGE 2016</h3>
      {result.status === 'MATCHED'
        ? <><p><strong>Interruption: {result.holdDays.join('–')} day{result.holdDays.length > 1 || result.holdDays[0] !== 1 ? 's' : ''} before procedure</strong></p>
          <p>Matched renal bracket: {result.renalBracket}. High-risk procedure only. The guideline's range is not resolved into a specific last-dose time.</p></>
        : <p><strong>No timing determination:</strong> {result.reason}</p>}
      {dates?.status === 'CALENDAR_DATES_ONLY' ? <p><strong>Calendar subtraction candidates: {dates.candidateDates.join(' or ')}</strong>. {dates.disclaimer}</p> : null}
      <p><a href="https://doi.org/10.1016/j.gie.2015.09.035" target="_blank" rel="noreferrer">ASGE original 2016 guideline</a></p>
    </div>
    <div className="research-rule">
      <h3>ACG–CAG 2022</h3>
      <p>Conditional suggestion for temporary DOAC interruption in elective endoscopy; no universal agent- and CrCl-specific interruption interval established by the recommendation. No specific restart day endorsed.</p>
      <p><a href="https://doi.org/10.14309/ajg.0000000000001627" target="_blank" rel="noreferrer">ACG–CAG 2022 guideline</a></p>
    </div>
    <p className="empty-copy">This comparison is incomplete. Additional guidelines, indication, thrombosis risk, concomitant drugs, intervention and hemostasis must be reviewed. No guideline is preselected. No medication action or patient guide is generated.</p>
  </section>;
}
