'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DecisionExecution, ModifierValue, ProcedureCode } from '@prep-meds/clinical-engine';

interface SearchHit {
  medicationId: string;
  canonicalName: string;
  matchKind: string;
  matchedField: string;
  matchedText: string;
  ingredientIds: string[];
}

interface WorkflowQuestion {
  id: string;
  label: string;
  description?: string;
  inputType: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
  unit?: string;
  required: true;
}

interface PatientInstructionView {
  allowed: boolean;
  heading: string;
  body: string;
  reason?: string;
}

type ClinicalContentState = 'NO_ACTIVE_CLINICAL_RULES' | 'ACTIVE_RULES_AVAILABLE' | 'SHADOW_REVIEW_RULES';

interface DecisionResponse {
  execution: DecisionExecution;
  patientInstruction: PatientInstructionView;
  clinicalContentState: ClinicalContentState;
}

type ResultTab = 'staff' | 'clinician' | 'evidence' | 'patient';

const procedures: Array<{ code: ProcedureCode; label: string; detail: string }> = [
  { code: 'EGD', label: 'EGD', detail: 'Upper endoscopy' },
  { code: 'COLONOSCOPY', label: 'Colonoscopy', detail: 'Lower endoscopy' },
  { code: 'EGD_COLONOSCOPY', label: 'EGD + colonoscopy', detail: 'Same-day combined procedures' },
];

function statusTone(disposition: string): string {
  if (disposition === 'CONTINUE') return 'status status-good';
  if (disposition === 'HOLD_STANDARD' || disposition === 'CONDITIONAL') return 'status status-caution';
  if (disposition === 'CLINICIAN_REVIEW_REQUIRED' || disposition === 'LOCAL_POLICY_REQUIRED') return 'status status-review';
  return 'status status-muted';
}

function recommendationText(execution: DecisionExecution): string {
  const event = execution.event;
  if (event.disposition === 'HOLD_STANDARD') {
    const rawDays = event.outputSnapshot.timingRule?.preProcedure?.medicationFreeIntervalDaysBeforeProcedure;
    if (typeof rawDays === 'number') {
      return `Hold for ${rawDays} full day${rawDays === 1 ? '' : 's'} before the procedure; do not take it on procedure day.`;
    }
    return 'Hold before the procedure according to the selected structured rule.';
  }
  if (event.disposition === 'CONTINUE') return 'Continue through the procedure under the selected rule.';
  if (event.disposition === 'CLINICIAN_REVIEW_REQUIRED') return 'Do not issue an automatic hold plan; clinician review is required.';
  if (event.disposition === 'LOCAL_POLICY_REQUIRED') return 'A local policy decision is required before a hold plan can be issued.';
  if (event.disposition === 'INSUFFICIENT_INFORMATION') return 'Answer the missing clinical questions before a recommendation can be issued.';
  return 'No actionable medication rule applies to the current context.';
}

function restartText(execution: DecisionExecution): string {
  const owner = execution.event.outputSnapshot.restartOwner;
  if (!owner || owner === 'NOT_APPLICABLE') return 'No separate restart plan is required by this rule.';
  if (owner === 'ENDOSCOPIST') return 'Restart timing: endoscopist-directed after the procedure and hemostasis assessment.';
  if (owner === 'PRESCRIBER') return 'Restart timing: prescribing-clinician directed.';
  if (owner === 'CLINICIAN_REVIEW') return 'Restart timing requires clinician review.';
  return 'Restart timing is defined by the structured rule.';
}

export function ClinicalWorkspace() {
  const [procedure, setProcedure] = useState<ProcedureCode | null>(null);
  const [query, setQuery] = useState('');
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<SearchHit | null>(null);
  const [questions, setQuestions] = useState<WorkflowQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [contentState, setContentState] = useState<ClinicalContentState | null>(null);
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [tab, setTab] = useState<ResultTab>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2 || selectedMedication) {
      setSearchHits([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/medications?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Medication search failed.');
        const body = (await response.json()) as { results: SearchHit[] };
        setSearchHits(body.results);
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') setError('Medication search is unavailable.');
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedMedication]);

  useEffect(() => {
    if (!procedure || !selectedMedication) {
      setQuestions([]);
      setContentState(null);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            procedureCode: procedure,
            medicationId: selectedMedication.medicationId,
          }),
        });
        if (!response.ok) throw new Error('Question discovery failed.');
        const body = (await response.json()) as {
          questions: WorkflowQuestion[];
          contentState: ClinicalContentState;
        };
        setQuestions(body.questions);
        setContentState(body.contentState);
      } catch (questionError) {
        if ((questionError as Error).name !== 'AbortError') setError('Unable to determine required clinical inputs.');
      }
    })();

    return () => controller.abort();
  }, [procedure, selectedMedication]);

  const canEvaluate = Boolean(procedure && selectedMedication) && !loading;

  const progress = useMemo(() => {
    if (decision) return 4;
    if (selectedMedication) return 3;
    if (procedure) return 2;
    return 1;
  }, [procedure, selectedMedication, decision]);

  function resetMedication() {
    setSelectedMedication(null);
    setQuery('');
    setSearchHits([]);
    setQuestions([]);
    setAnswers({});
    setDecision(null);
    setContentState(null);
    setError(null);
  }

  function setQuestionAnswer(question: WorkflowQuestion, value: string | boolean) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function buildModifiers(): ModifierValue[] {
    const recordedAt = new Date().toISOString();
    return questions.map((question) => {
      const value = answers[question.id];
      if (value === undefined || value === '') {
        return {
          modifierId: question.id,
          state: 'UNKNOWN',
          provenance: {
            sourceType: 'USER_ENTERED',
            recordedAt,
            confirmationStatus: 'UNCONFIRMED',
          },
        };
      }
      return {
        modifierId: question.id,
        state: 'KNOWN',
        value,
        ...(question.unit ? { unit: question.unit } : {}),
        provenance: {
          sourceType: 'USER_ENTERED',
          recordedAt,
          confirmationStatus: 'CONFIRMED',
        },
      };
    });
  }

  async function evaluate() {
    if (!procedure || !selectedMedication) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          procedureCode: procedure,
          medicationId: selectedMedication.medicationId,
          modifiers: buildModifiers(),
        }),
      });
      if (!response.ok) throw new Error('Decision evaluation failed.');
      const body = (await response.json()) as DecisionResponse;
      setDecision(body);
      setContentState(body.clinicalContentState);
      setTab('staff');
    } catch {
      setError('Unable to evaluate this medication. No patient instruction was generated.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">PREP-MEDS</p>
          <h1>Pre-endoscopy medication decision support</h1>
          <p className="hero-copy">Search a medication, add the procedure context, answer only required questions, and review the deterministic decision path.</p>
        </div>
        <div className="safety-chip">Clinical rules govern · AI does not prescribe</div>
      </header>

      <div className="progress" aria-label={`Step ${progress} of 4`}>
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={step <= progress ? 'progress-dot active' : 'progress-dot'} />
        ))}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {contentState === 'NO_ACTIVE_CLINICAL_RULES' ? (
        <div className="alert alert-info">
          No clinically activated medication rule is loaded yet. Search and workflow functions are available, but the system will not create a hold/continue instruction until governed clinical content is activated.
        </div>
      ) : null}
      {contentState === 'SHADOW_REVIEW_RULES' ? (
        <div className="alert alert-info">
          Testing preview: DRAFT / REVIEW REQUIRED clinical rules are enabled. Use this view to validate hold/continue logic; patient-facing instructions remain disabled until clinical and local-policy approval.
        </div>
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="step-label">1</span>
            <h2>Select procedure</h2>
          </div>
          {procedure ? <button className="text-button" onClick={() => { setProcedure(null); resetMedication(); }}>Change</button> : null}
        </div>
        <div className="procedure-grid">
          {procedures.map((item) => (
            <button
              key={item.code}
              className={procedure === item.code ? 'procedure-card selected' : 'procedure-card'}
              onClick={() => {
                setProcedure(item.code);
                setDecision(null);
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={`panel ${procedure ? '' : 'panel-disabled'}`}>
        <div className="section-heading">
          <div>
            <span className="step-label">2</span>
            <h2>Find medication</h2>
          </div>
          {selectedMedication ? <button className="text-button" onClick={resetMedication}>Change</button> : null}
        </div>

        {selectedMedication ? (
          <div className="selected-medication">
            <div>
              <strong>{selectedMedication.canonicalName}</strong>
              <span>{selectedMedication.medicationId}</span>
            </div>
            <span className="pill">Identity resolved</span>
          </div>
        ) : (
          <div className="search-wrap">
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={!procedure}
              placeholder="Search generic medication name"
              aria-label="Medication search"
            />
            {searchHits.length > 0 ? (
              <div className="search-results">
                {searchHits.map((hit) => (
                  <button
                    key={hit.medicationId}
                    onClick={() => {
                      setSelectedMedication(hit);
                      setQuery(hit.canonicalName);
                      setSearchHits([]);
                      setDecision(null);
                    }}
                  >
                    <span><strong>{hit.canonicalName}</strong><small>{hit.medicationId}</small></span>
                    <span className="match-label">{hit.matchKind.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className={`panel ${selectedMedication ? '' : 'panel-disabled'}`}>
        <div className="section-heading">
          <div>
            <span className="step-label">3</span>
            <h2>Required information</h2>
          </div>
          <span className="section-note">Only rule-required fields appear</span>
        </div>

        {!selectedMedication ? <p className="empty-copy">Select a medication to determine required inputs.</p> : null}
        {selectedMedication && questions.length === 0 ? (
          <p className="empty-copy">{contentState === 'SHADOW_REVIEW_RULES' ? 'No DRAFT review rule currently requests additional inputs for this medication/procedure combination.' : 'No active rule currently requests additional inputs for this medication/procedure combination.'}</p>
        ) : null}

        {questions.length > 0 ? (
          <div className="question-grid">
            {questions.map((question) => (
              <label key={question.id} className="question-field">
                <span>{question.label}</span>
                {question.description ? <small>{question.description}</small> : null}
                {question.inputType === 'boolean' ? (
                  <select value={String(answers[question.id] ?? '')} onChange={(event) => setQuestionAnswer(question, event.target.value === 'true')}>
                    <option value="">Unknown / not confirmed</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : question.inputType === 'select' ? (
                  <select value={String(answers[question.id] ?? '')} onChange={(event) => setQuestionAnswer(question, event.target.value)}>
                    <option value="">Unknown / not confirmed</option>
                    {question.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={question.inputType === 'number' ? 'number' : 'text'}
                    value={String(answers[question.id] ?? '')}
                    onChange={(event) => setQuestionAnswer(question, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        ) : null}

        <div className="action-row">
          <button className="primary-button" disabled={!canEvaluate} onClick={evaluate}>
            {loading ? 'Evaluating…' : 'Evaluate medication'}
          </button>
          <span>{contentState === 'SHADOW_REVIEW_RULES' ? 'Testing DRAFT review rules in deterministic validation mode.' : 'Production mode uses ACTIVE rules and policies only.'}</span>
        </div>
      </section>

      {decision ? (
        <section className="panel result-panel">
          <div className="section-heading">
            <div>
              <span className="step-label">4</span>
              <h2>Decision result</h2>
            </div>
            <span className={statusTone(decision.execution.event.disposition)}>{decision.execution.event.disposition.replaceAll('_', ' ')}</span>
          </div>

          <div className="tab-row" role="tablist" aria-label="Decision views">
            {(['staff', 'clinician', 'evidence', 'patient'] as ResultTab[]).map((item) => (
              <button key={item} className={tab === item ? 'tab active' : 'tab'} onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>

          {tab === 'staff' ? (
            <div className="result-grid">
              <div className="result-card prominent">
                <span className="card-label">{decision.clinicalContentState === 'SHADOW_REVIEW_RULES' ? 'Draft recommendation' : 'Recommendation'}</span>
                <strong>{recommendationText(decision.execution)}</strong>
                <p>{restartText(decision.execution)}</p>
              </div>
              <div className="result-card">
                <span className="card-label">Disposition</span>
                <strong>{decision.execution.event.disposition.replaceAll('_', ' ')}</strong>
                <p>{decision.execution.event.reasonCodes.length ? decision.execution.event.reasonCodes.join(' · ') : 'No safety stop triggered.'}</p>
              </div>
              <div className="result-card">
                <span className="card-label">Medication / procedure</span>
                <strong>{selectedMedication?.canonicalName}</strong>
                <p>{procedure?.replaceAll('_', ' + ')}</p>
              </div>
              <div className="result-card">
                <span className="card-label">Missing information</span>
                <strong>{decision.execution.event.missingModifierIds.length}</strong>
                <p>{decision.execution.event.missingModifierIds.join(', ') || 'None recorded'}</p>
              </div>
            </div>
          ) : null}

          {tab === 'clinician' ? (
            <div className="code-card">
              <div className="provenance-grid">
                <span>Decision event</span><strong>{decision.execution.event.id}</strong>
                <span>Engine</span><strong>{decision.execution.event.engineVersion}</strong>
                <span>Occurred</span><strong>{decision.execution.event.occurredAt}</strong>
                <span>Rule refs</span><strong>{decision.execution.event.ruleRefs.map((ref) => `${ref.id}@${ref.version}`).join(', ') || 'None'}</strong>
                <span>Policy refs</span><strong>{decision.execution.event.policyRefs.map((ref) => `${ref.id}@${ref.version}`).join(', ') || 'None'}</strong>
                <span>Structured recommendation</span><strong>{recommendationText(decision.execution)}</strong>
                <span>Restart ownership</span><strong>{restartText(decision.execution)}</strong>
              </div>
              <details>
                <summary>Decision trace</summary>
                <pre>{JSON.stringify(decision.execution.trace, null, 2)}</pre>
              </details>
            </div>
          ) : null}

          {tab === 'evidence' ? (
            <div className="evidence-list">
              {decision.execution.event.evidenceRefs.length ? decision.execution.event.evidenceRefs.map((ref) => (
                <div key={`${ref.id}@${ref.version}`} className="evidence-item">
                  <strong>{ref.id}</strong><span>version {ref.version}</span>
                </div>
              )) : <p className="empty-copy">No evidence reference was attached to this non-actionable result.</p>}
            </div>
          ) : null}

          {tab === 'patient' ? (
            <div className={decision.patientInstruction.allowed ? 'patient-card' : 'patient-card blocked'}>
              <span className="card-label">Patient-facing output</span>
              <h3>{decision.patientInstruction.heading}</h3>
              <p>{decision.patientInstruction.body}</p>
              {decision.patientInstruction.reason ? <small>Reason: {decision.patientInstruction.reason}</small> : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
