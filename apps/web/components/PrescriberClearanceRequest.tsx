'use client';

import { useMemo, useState } from 'react';

export type AgentClass = 'anticoagulant' | 'p2y12' | 'other-antiplatelet';
export interface ClearanceRequest {
  clinicianName: string; patientReference: string; medication: string;
  agentClass: AgentClass; indication: string; procedure: string; procedureDate: string;
  interventionRisk: string; holdDays: string; renalClearance: string;
  resumptionPlan: string; sourceNote: string;
}
export function generateClearanceRequest(input: ClearanceRequest): string {
  const value = (s: string) => s.trim() || '[not provided]';
  const hold = input.holdDays.trim()
    ? `We propose withholding ${value(input.medication)} for ${input.holdDays.trim()} day(s) before the procedure, subject to your approval. This interval has NOT been automatically validated.`
    : `Please advise whether ${value(input.medication)} may be interrupted and, if so, for how long before the procedure. No interruption interval has been established.`;
  const aspirin = input.agentClass === 'p2y12' || input.agentClass === 'other-antiplatelet'
    ? 'From a GI endoscopy standpoint, continuing low-dose aspirin is generally acceptable when clinically indicated. If interruption of the P2Y12 inhibitor or other antiplatelet is appropriate, continuation or initiation of aspirin during the interruption may be considered ONLY if you approve it for this patient; aspirin is not a universally equivalent substitute. Please account for coronary stents, recent acute coronary syndrome, stroke and other thrombotic risks.'
    : 'From a GI endoscopy standpoint, continuing low-dose aspirin is generally acceptable when clinically indicated. This statement does not imply that aspirin replaces therapeutic anticoagulation.';
  return `Subject: Prescriber approval requested — ${value(input.medication)} — endoscopy ${value(input.procedureDate)}

Dear ${value(input.clinicianName)},

Our GI team is planning ${value(input.procedure)} on ${value(input.procedureDate)} for patient ${value(input.patientReference)}. Your office manages ${value(input.medication)} for ${value(input.indication)}.

Anticipated intervention/bleeding risk: ${value(input.interventionRisk)}.
Cockcroft–Gault creatinine clearance: ${value(input.renalClearance)} mL/min (if applicable; verify current kidney function and weight basis).
Guideline/policy basis for proposed interval: ${value(input.sourceNote)}.

${hold}

${aspirin}

Please provide documented approval or an alternative plan, including:
1. Whether interruption is safe given the patient's indication, recent events and thrombotic risk.
2. Approved last-dose date/time and interruption duration (or instructions to continue).
3. Whether bridging or additional specialist coordination is necessary; routine DOAC bridging is generally not recommended.
4. When and under whose direction therapy should be restarted after adequate procedural hemostasis. Proposed plan: ${value(input.resumptionPlan)}.
5. Any contraindications to the proposed aspirin strategy, if relevant.

Please reply through an approved clinical communication channel. We will not instruct the patient to stop or substitute therapy until the plan is confirmed and documented.

Thank you,
Gastroenterology Team`;
}

export function PrescriberClearanceRequest({ medicationName = '', procedureName = '' }: { medicationName?: string; procedureName?: string }) {
  const [clinicianName, setClinicianName] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [medication, setMedication] = useState(medicationName);
  const [agentClass, setAgentClass] = useState<AgentClass>('anticoagulant');
  const [indication, setIndication] = useState('');
  const [procedure, setProcedure] = useState(procedureName);
  const [procedureDate, setProcedureDate] = useState('');
  const [interventionRisk, setInterventionRisk] = useState('');
  const [holdDays, setHoldDays] = useState('');
  const [renalClearance, setRenalClearance] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [resumptionPlan, setResumptionPlan] = useState('');
  const [copied, setCopied] = useState(false);
  const draft = useMemo(() => generateClearanceRequest({clinicianName,patientReference,medication,agentClass,indication,procedure,procedureDate,interventionRisk,holdDays,renalClearance,resumptionPlan,sourceNote}),[clinicianName,patientReference,medication,agentClass,indication,procedure,procedureDate,interventionRisk,holdDays,renalClearance,resumptionPlan,sourceNote]);
  return <section className="panel" aria-label="Prescriber clearance request">
    <div className="section-heading"><div><h2>Antithrombotic prescriber clearance request</h2><p>Editable provider communication; requires documented prescriber response.</p></div></div>
    <p className="empty-copy">Enter only the minimum patient identifiers needed, and transmit through an approved secure clinical channel. This form does not send messages or store approvals. Do not enter a patient identifier into an unapproved external email system.</p>
    <div className="question-grid">
      <label className="question-field">Managing clinician<input aria-label="Managing clinician" value={clinicianName} onChange={e=>setClinicianName(e.target.value)} placeholder="Dr. ..." /></label>
      <label className="question-field">Patient reference<input aria-label="Patient reference" value={patientReference} onChange={e=>setPatientReference(e.target.value)} placeholder="Secure internal identifier" /></label>
      <label className="question-field">Medication<input aria-label="Medication for clearance" value={medication} onChange={e=>setMedication(e.target.value)} /></label>
      <label className="question-field">Medication class<select aria-label="Antithrombotic class" value={agentClass} onChange={e=>setAgentClass(e.target.value as AgentClass)}><option value="anticoagulant">Anticoagulant</option><option value="p2y12">P2Y12 inhibitor</option><option value="other-antiplatelet">Other antiplatelet</option></select></label>
      <label className="question-field">Indication<input aria-label="Antithrombotic indication" value={indication} onChange={e=>setIndication(e.target.value)} placeholder="AF, VTE, coronary stent..." /></label>
      <label className="question-field">Procedure<input aria-label="Planned procedure" value={procedure} onChange={e=>setProcedure(e.target.value)} /></label>
      <label className="question-field">Procedure date<input aria-label="Procedure date" type="date" value={procedureDate} onChange={e=>setProcedureDate(e.target.value)} /></label>
      <label className="question-field">Anticipated intervention / bleeding risk<input aria-label="Procedure bleeding risk" value={interventionRisk} onChange={e=>setInterventionRisk(e.target.value)} placeholder="Diagnostic, possible polypectomy, EMR..." /></label>
      <label className="question-field">Cockcroft–Gault CrCl (mL/min)<input aria-label="Creatinine clearance for request" type="number" min="0" step="0.1" value={renalClearance} onChange={e=>setRenalClearance(e.target.value)} placeholder="Enter calculated value" /></label>
      <label className="question-field">Proposed hold (days; optional)<input aria-label="Proposed interruption days" type="number" min="0" step="1" value={holdDays} onChange={e=>setHoldDays(e.target.value)} placeholder="Leave blank to request guidance" /></label>
      <label className="question-field">Guideline / facility policy basis<input aria-label="Guideline basis" value={sourceNote} onChange={e=>setSourceNote(e.target.value)} placeholder="ASGE 2016 vs ACG/CAG 2022..." /></label>
      <label className="question-field">Proposed resumption plan<input aria-label="Proposed resumption plan" value={resumptionPlan} onChange={e=>setResumptionPlan(e.target.value)} placeholder="Prescriber to confirm" /></label>
    </div>
    <label className="question-field">Generated provider message<textarea aria-label="Generated provider clearance message" value={draft} readOnly rows={17} style={{width:'100%'}} /></label>
    <div className="action-row"><button className="primary-button" type="button" onClick={async()=>{try {await navigator.clipboard.writeText(draft);setCopied(true);}catch{setCopied(false);}}}>{copied?'Copied':'Copy request for secure messaging'}</button></div>
    <p className="empty-copy">No clearance is implied by generating or copying this message. Obtain and document the prescriber's response before issuing patient-facing interruption instructions.</p>
  </section>;
}
