'use client';

import { useMemo, useState } from 'react';
import type { ProcedureCode } from '@prep-meds/clinical-engine';

export type InsulinRequest = {
  clinician: string; patientReference: string; procedure: ProcedureCode | '';
  procedureDate: string; procedureTime: string; insulinRegimen: string;
  diabetesType: string; monitoring: string; fastingPolicy: 'midnight' | 'anesthesia';
  clearLiquidStart: string; otherNotes: string;
};

export function insulinDietDescription(input: Pick<InsulinRequest,'procedure'|'fastingPolicy'|'clearLiquidStart'>): string {
  const colonoscopy = input.procedure === 'COLONOSCOPY' || input.procedure === 'EGD_COLONOSCOPY';
  if (!input.procedure) return 'Procedure and diet schedule not yet selected.';
  const fast = input.fastingPolicy === 'midnight'
    ? 'Facility fasting policy: no routine oral intake after midnight. Prescribed split-dose bowel preparation and any specifically permitted clear liquids must follow the separate, verified anesthesia/endoscopy instructions; confirm any conflict with the procedure team.'
    : 'Facility fasting policy: follow the individualized anesthesia-approved solid-food and clear-liquid cutoff times; confirm the exact schedule with the procedure team.';
  if (colonoscopy) return `Clear-liquid diet for the ENTIRE day before the procedure${input.clearLiquidStart.trim() ? ' (starting '+input.clearLiquidStart.trim()+')' : ''}; no solid food that day. Sugar-containing clear liquids may be needed to prevent hypoglycemia; the diabetes prescriber should specify carbohydrate intake and monitoring. ${fast} The bowel preparation is split-dose, with its own timed instructions. Do not omit the morning preparation dose solely because a generic NPO-after-midnight statement appears here.`;
  return `Upper endoscopy only: usual diet before the facility's preprocedure fasting window unless separately instructed. No routine clear-liquid-only day is required solely for upper endoscopy. ${fast}`;
}

export function generateInsulinRequest(input: InsulinRequest): string {
  const val = (s: string) => s.trim() || '[please complete]';
  return `Subject: Insulin regimen instructions requested — endoscopy ${val(input.procedureDate)}

Dear ${val(input.clinician)},

Our gastroenterology team is scheduling ${input.procedure ? input.procedure.replaceAll('_',' + ') : '[procedure not selected]'} for patient ${val(input.patientReference)} on ${val(input.procedureDate)} at ${val(input.procedureTime)}.

Diabetes type / relevant clinical context: ${val(input.diabetesType)}
Current insulin regimen (including doses, timing and delivery method): ${val(input.insulinRegimen)}
Diet and fasting schedule: ${insulinDietDescription(input)}
Additional information: ${val(input.otherNotes)}

Please provide and document a patient-specific insulin plan, including:
1. Basal, intermediate-acting, and long-acting insulin: exact dose and timing the evening before, during the clear-liquid day (if applicable), and on procedure morning.
2. Rapid-/short-acting mealtime and correction insulin: exact instructions while taking only clear liquids, while fasting, and for any glucose correction doses.
3. For insulin pumps or automated insulin delivery: basal/temporary target settings, whether to continue the device, and who will manage it perioperatively, if applicable.
4. Frequency of fingerstick or continuous glucose monitoring; glucose targets, hypoglycemia treatment, and thresholds for contacting your office or the procedural team.
5. When and how to return to the usual insulin regimen once eating resumes, including what to do if oral intake is delayed.
6. Any special precautions for type 1 diabetes (basal insulin must not be completely omitted without an explicit specialist-directed alternative), recurrent hypoglycemia, renal impairment, or other individualized risks.

Current glucose-monitoring information: ${val(input.monitoring)}

Please reply through an approved secure clinical channel with the precise regimen and any recommended changes to the planned dietary or fasting schedule. We will not issue an automatically generated insulin dose adjustment in place of your instructions.

Thank you,
Gastroenterology Team`;
}

export function InsulinPrescriberRequest({ procedure = '' }: { procedure?: ProcedureCode | '' }) {
  const [clinician,setClinician] = useState('');
  const [patientReference,setPatientReference] = useState('');
  const [procedureDate,setProcedureDate] = useState('');
  const [procedureTime,setProcedureTime] = useState('');
  const [insulinRegimen,setInsulinRegimen] = useState('');
  const [diabetesType,setDiabetesType] = useState('');
  const [monitoring,setMonitoring] = useState('');
  const [fastingPolicy,setFastingPolicy] = useState<'midnight'|'anesthesia'>('midnight');
  const [clearLiquidStart,setClearLiquidStart] = useState('');
  const [otherNotes,setOtherNotes] = useState('');
  const [copied,setCopied] = useState(false);
  const request = useMemo(()=>generateInsulinRequest({clinician,patientReference,procedure,procedureDate,procedureTime,insulinRegimen,diabetesType,monitoring,fastingPolicy,clearLiquidStart,otherNotes}),[clinician,patientReference,procedure,procedureDate,procedureTime,insulinRegimen,diabetesType,monitoring,fastingPolicy,clearLiquidStart,otherNotes]);
  return <section className="panel" aria-label="Insulin prescriber management request">
    <div className="section-heading"><div><h2>Insulin prescriber management request</h2><p>Editable message to endocrinology, primary care, or the clinician managing insulin.</p></div></div>
    <p className="empty-copy">This draft is not a prescription. Enter the minimum necessary patient information and send only through an approved secure clinical channel. The prescriber must provide the actual doses.</p>
    <div className="question-grid">
      <label className="question-field">Prescribing clinician<input aria-label="Insulin prescriber" value={clinician} onChange={e=>setClinician(e.target.value)} /></label>
      <label className="question-field">Patient reference<input aria-label="Patient reference for insulin request" value={patientReference} onChange={e=>setPatientReference(e.target.value)} /></label>
      <label className="question-field">Procedure date<input aria-label="Insulin procedure date" type="date" value={procedureDate} onChange={e=>setProcedureDate(e.target.value)} /></label>
      <label className="question-field">Procedure time<input aria-label="Insulin procedure time" type="time" value={procedureTime} onChange={e=>setProcedureTime(e.target.value)} /></label>
      <label className="question-field">Diabetes type / context<input aria-label="Diabetes type" value={diabetesType} onChange={e=>setDiabetesType(e.target.value)} placeholder="Type 1, type 2, other..." /></label>
      <label className="question-field">Insulin regimen<input aria-label="Insulin regimen" value={insulinRegimen} onChange={e=>setInsulinRegimen(e.target.value)} placeholder="Name, units, times, pump..." /></label>
      <label className="question-field">Facility fasting policy<select aria-label="Fasting policy for insulin request" value={fastingPolicy} onChange={e=>setFastingPolicy(e.target.value as 'midnight'|'anesthesia')}><option value="midnight">NPO after midnight (with bowel prep exceptions)</option><option value="anesthesia">Individualized anesthesia cutoffs</option></select></label>
      <label className="question-field">Clear-liquid start (optional)<input aria-label="Clear-liquid start" value={clearLiquidStart} onChange={e=>setClearLiquidStart(e.target.value)} placeholder="Day before procedure" /></label>
      <label className="question-field">Current glucose monitoring<input aria-label="Glucose monitoring" value={monitoring} onChange={e=>setMonitoring(e.target.value)} placeholder="CGM, fingersticks, recent lows..." /></label>
      <label className="question-field">Additional clinical notes<input aria-label="Additional insulin clinical notes" value={otherNotes} onChange={e=>setOtherNotes(e.target.value)} /></label>
    </div>
    <p className="empty-copy"><strong>Selected procedure diet:</strong> {insulinDietDescription({procedure,fastingPolicy,clearLiquidStart})}</p>
    <label className="question-field">Generated insulin management message<textarea aria-label="Generated insulin prescriber message" value={request} readOnly rows={19} style={{width:'100%'}} /></label>
    <div className="action-row"><button type="button" className="primary-button" onClick={async()=>{try{await navigator.clipboard.writeText(request);setCopied(true);}catch{setCopied(false);}}}>{copied?'Copied':'Copy for secure messaging'}</button></div>
  </section>;
}
