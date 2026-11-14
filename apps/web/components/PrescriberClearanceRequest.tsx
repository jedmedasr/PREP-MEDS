'use client';

import { useMemo, useState } from 'react';
import { asge2016ApixabanHighRiskTiming } from '../lib/antithrombotic-timing';

export type AgentClass = 'anticoagulant' | 'p2y12' | 'other-antiplatelet' | 'unknown';
export type ReferenceSource = 'ASGE_2016' | 'ACG_CAG_2022';

export interface ClearanceRequest {
  clinicianName: string;
  patientReference: string;
  medication: string;
  indication: string;
  procedure: string;
  procedureDate: string;
  holdInterval: string;
}

function required(value: string) {
  return value.trim();
}

function displayDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function generateClearanceRequest(input: ClearanceRequest): string {
  const clinicianName = required(input.clinicianName);
  const patientReference = required(input.patientReference);
  const medication = required(input.medication);
  const indication = required(input.indication);
  const procedure = required(input.procedure);
  const procedureDate = required(input.procedureDate);
  const holdInterval = required(input.holdInterval);

  if (!clinicianName || !patientReference || !medication || !indication || !procedure || !procedureDate || !holdInterval) {
    return '';
  }

  return `Hi ${clinicianName},

We are requesting your pre-operative clearance for ${patientReference}, who is scheduled for ${procedure} on ${displayDate(procedureDate)}.

The patient is currently taking ${medication} for ${indication}. We are requesting clearance to hold this medication for ${holdInterval} before the procedure and would also appreciate confirmation that the patient is otherwise optimized to proceed from your standpoint.

If you feel the patient should be seen in clinic before providing clearance, please arrange an expedited appointment if possible so the procedure is not unnecessarily delayed.

Thank you.`;
}

export function inferMedicationIngredient(name: string): string {
  const value = name.toLowerCase();
  const known = [
    'apixaban',
    'rivaroxaban',
    'dabigatran',
    'edoxaban',
    'warfarin',
    'heparin',
    'enoxaparin',
    'dalteparin',
    'fondaparinux',
    'clopidogrel',
    'prasugrel',
    'ticagrelor',
    'cangrelor',
    'aspirin',
  ];
  return known.find((ingredient) => value.includes(ingredient)) ?? '';
}

export function inferAgentClass(name: string): AgentClass {
  const ingredient = inferMedicationIngredient(name);
  if (['apixaban','rivaroxaban','dabigatran','edoxaban','warfarin','heparin','enoxaparin','dalteparin','fondaparinux'].includes(ingredient)) {
    return 'anticoagulant';
  }
  if (['clopidogrel','prasugrel','ticagrelor','cangrelor'].includes(ingredient)) return 'p2y12';
  if (ingredient === 'aspirin') return 'other-antiplatelet';
  return 'unknown';
}

function classLabel(value: AgentClass) {
  if (value === 'anticoagulant') return 'Anticoagulant';
  if (value === 'p2y12') return 'P2Y12 inhibitor';
  if (value === 'other-antiplatelet') return 'Antiplatelet';
  return 'Not yet derived';
}

function holdLabel(days: readonly number[]) {
  if (days.length === 1) return `${days[0]} day${days[0] === 1 ? '' : 's'}`;
  return `${Math.min(...days)}–${Math.max(...days)} days`;
}

export function consultFieldVisibility(procedureName: string) {
  return {
    clinicianName: true,
    patientReference: true,
    indication: true,
    procedure: procedureName.trim() === '',
    procedureDate: true,
  };
}

export function shouldShowManualHoldConfirmation(input: {
  referenceSelected: boolean;
  medicationSelected: boolean;
  derivedHoldInterval: string;
  needsAsgeInputs: boolean;
  asgeInputsComplete: boolean;
}) {
  if (!input.referenceSelected || !input.medicationSelected || input.derivedHoldInterval) return false;
  if (input.needsAsgeInputs && !input.asgeInputsComplete) return false;
  return true;
}

export function PrescriberClearanceRequest({ medicationName = '', procedureName = '' }: { medicationName?: string; procedureName?: string }) {
  const [referenceSource, setReferenceSource] = useState<ReferenceSource | ''>('');
  const [medication, setMedication] = useState(medicationName);
  const [procedure, setProcedure] = useState(procedureName);
  const [clinicianName, setClinicianName] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [indication, setIndication] = useState('');
  const [procedureDate, setProcedureDate] = useState('');
  const [risk, setRisk] = useState<'LOW'|'HIGH'|'UNKNOWN'>('UNKNOWN');
  const [renalClearance, setRenalClearance] = useState('');
  const [stableKidneyFunction, setStableKidneyFunction] = useState(false);
  const [confirmedHoldDays, setConfirmedHoldDays] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const ingredient = useMemo(() => inferMedicationIngredient(medication), [medication]);
  const agentClass = useMemo(() => inferAgentClass(medication), [medication]);
  const numericCrCl = renalClearance.trim() !== '' && Number.isFinite(Number(renalClearance)) ? Number(renalClearance) : null;

  const timing = useMemo(() => {
    if (referenceSource !== 'ASGE_2016') return null;
    return asge2016ApixabanHighRiskTiming({
      medicationIngredient: ingredient,
      creatinineClearanceMlMin: numericCrCl,
      procedureBleedingRisk: risk,
      kidneyFunctionStable: stableKidneyFunction,
    });
  }, [referenceSource, ingredient, numericCrCl, risk, stableKidneyFunction]);

  const derivedHoldInterval = timing?.status === 'MATCHED' ? holdLabel(timing.holdDays) : '';
  const fallbackHoldInterval = confirmedHoldDays.trim()
    ? `${confirmedHoldDays.trim()} day${confirmedHoldDays.trim() === '1' ? '' : 's'}`
    : '';
  const holdInterval = derivedHoldInterval || fallbackHoldInterval;

  const draft = useMemo(
    () => generateClearanceRequest({
      clinicianName,
      patientReference,
      medication,
      indication,
      procedure,
      procedureDate,
      holdInterval,
    }),
    [clinicianName, patientReference, medication, indication, procedure, procedureDate, holdInterval],
  );

  const needsAsgeInputs = referenceSource === 'ASGE_2016' && ingredient === 'apixaban';
  const asgeInputsComplete =
    !needsAsgeInputs ||
    (risk !== 'UNKNOWN' && numericCrCl !== null && stableKidneyFunction);

  const showManualHoldConfirmation = shouldShowManualHoldConfirmation({
    referenceSelected: referenceSource !== '',
    medicationSelected: medication.trim() !== '',
    derivedHoldInterval,
    needsAsgeInputs,
    asgeInputsComplete,
  });

  const consultFields = consultFieldVisibility(procedureName);
  const missingConsultDetails = [
    !clinicianName.trim() ? 'managing clinician' : '',
    !patientReference.trim() ? 'patient reference' : '',
    !indication.trim() ? 'medication indication' : '',
    !procedure.trim() ? 'procedure' : '',
    !procedureDate.trim() ? 'procedure date' : '',
    !holdInterval ? 'hold interval' : '',
  ].filter(Boolean);

  return (
    <section className="panel" aria-label="Prescriber clearance request">
      <div className="section-heading">
        <div>
          <h2>Antithrombotic pre-op clearance</h2>
          <p>Select the reference and medication. PREP-MEDS derives what it can and asks only for missing information that is needed to complete the request.</p>
        </div>
      </div>

      <div className="question-grid">
        <label className="question-field">
          1 · Reference used for hold interval
          <select aria-label="Reference used for hold interval" value={referenceSource} onChange={(event) => {
            setReferenceSource(event.target.value as ReferenceSource | '');
            setConfirmedHoldDays('');
            setShowDraft(false);
          }}>
            <option value="">Select reference</option>
            <option value="ASGE_2016">ASGE 2016</option>
            <option value="ACG_CAG_2022">ACG–CAG 2022</option>
          </select>
        </label>

        <label className="question-field">
          2 · Medication for clearance
          <input
            aria-label="Medication for clearance"
            value={medication}
            onChange={(event) => {
              setMedication(event.target.value);
              setConfirmedHoldDays('');
              setShowDraft(false);
            }}
            placeholder="Select or enter medication"
          />
        </label>
      </div>

      <div className="research-rule" aria-live="polite">
        <h3>Auto-populated</h3>
        <p><strong>Medication class:</strong> {classLabel(agentClass)}</p>
        <p><strong>Procedure:</strong> {procedure.trim() || 'Not available from the current workspace'}</p>
        <p><strong>Hold interval:</strong> {holdInterval || 'Not yet resolved'}</p>
        {timing?.status === 'MATCHED' ? (
          <p><strong>Matched renal bracket:</strong> {timing.renalBracket}. The source interval is preserved as written rather than reduced to a single day.</p>
        ) : null}
      </div>

      {needsAsgeInputs && timing?.status !== 'MATCHED' ? (
        <div className="planner-note">
          <strong>Only the missing inputs for this timing rule</strong>
          <div className="question-grid" style={{marginTop:12}}>
            <label className="question-field">
              Procedure bleeding risk
              <select aria-label="Procedure bleeding risk for clearance" value={risk} onChange={(event) => setRisk(event.target.value as typeof risk)}>
                <option value="UNKNOWN">Select</option>
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label className="question-field">
              Cockcroft–Gault CrCl
              <input aria-label="Creatinine clearance for clearance" type="number" min="0" step="0.1" value={renalClearance} onChange={(event) => setRenalClearance(event.target.value)} placeholder="mL/min" />
            </label>
            <label className="planner-check">
              <input type="checkbox" checked={stableKidneyFunction} onChange={(event) => setStableKidneyFunction(event.target.checked)} />
              Kidney function assessed as stable
            </label>
          </div>
          <p className="planner-muted">{timing?.status === 'REQUIRES_REVIEW' ? timing.reason : 'Complete the required inputs to derive the source-specific interval.'}</p>
        </div>
      ) : null}

      {showManualHoldConfirmation ? (
        <div className="planner-note">
          <strong>Hold interval still needs confirmation</strong>
          <p>PREP-MEDS could not derive a deterministic hold interval from the selected reference and current inputs. Enter the interval only if it has been independently established for this patient.</p>
          <label className="question-field">
            Confirmed hold interval
            <input aria-label="Confirmed hold interval" type="number" min="0" step="1" value={confirmedHoldDays} onChange={(event) => { setConfirmedHoldDays(event.target.value); setShowDraft(false); }} placeholder="Days" />
          </label>
        </div>
      ) : null}

      <div className="planner-settings">
        <div className="planner-settings-body">
          <div className="planner-row">
            <div>
              <strong>Consult details</strong>
              <p className="planner-muted" style={{margin:'4px 0 0'}}>
                {missingConsultDetails.length ? `${missingConsultDetails.length} item${missingConsultDetails.length === 1 ? '' : 's'} still needed` : 'Complete — you can still edit these fields.'}
              </p>
            </div>
          </div>
          <div className="question-grid" style={{marginTop:12}}>
            {consultFields.clinicianName ? <label className="question-field">Managing clinician<input aria-label="Managing clinician" value={clinicianName} onChange={(event) => setClinicianName(event.target.value)} placeholder="Dr. ..." /></label> : null}
            {consultFields.patientReference ? <label className="question-field">Patient reference<input aria-label="Patient reference" value={patientReference} onChange={(event) => setPatientReference(event.target.value)} placeholder="Patient name or approved internal reference" /></label> : null}
            {consultFields.indication ? <label className="question-field">Medication indication<input aria-label="Medication indication" value={indication} onChange={(event) => setIndication(event.target.value)} placeholder="AF, VTE, coronary stent..." /></label> : null}
            {consultFields.procedure ? <label className="question-field">Procedure<input aria-label="Planned procedure" value={procedure} onChange={(event) => setProcedure(event.target.value)} placeholder="Procedure" /></label> : null}
            {consultFields.procedureDate ? <label className="question-field">Procedure date<input aria-label="Procedure date" type="date" value={procedureDate} onChange={(event) => setProcedureDate(event.target.value)} /></label> : null}
          </div>
          {!consultFields.procedure ? <p className="planner-muted">Procedure was carried forward from the current workspace. Only change it upstream if it is incorrect.</p> : null}
        </div>
      </div>

      <div className="planner-note" aria-live="polite">
        <strong>{draft ? 'Ready to generate' : 'Clearance request is not ready yet'}</strong>
        {missingConsultDetails.length ? (
          <p><strong>Still needed:</strong> {missingConsultDetails.join(', ')}.</p>
        ) : (
          <p>All required information is complete.</p>
        )}
        <button
          className="primary-button"
          type="button"
          disabled={!draft}
          onClick={() => { setShowDraft(true); setCopied(false); }}
        >
          Generate clearance request
        </button>
      </div>

      {showDraft && draft ? (
        <>
          <label className="question-field">
            Pre-op clearance request
            <textarea aria-label="Generated provider clearance message" value={draft} readOnly rows={10} style={{width:'100%'}} />
          </label>
          <div className="action-row">
            <button className="primary-button" type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(draft);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}>{copied ? 'Copied' : 'Copy request for secure messaging'}</button>
          </div>
        </>
      ) : null}

      <p className="empty-copy">Generating this request does not constitute clearance. The prescriber or cardiology team must confirm the hold and pre-operative optimization before patient-facing interruption instructions are issued.</p>
    </section>
  );
}
