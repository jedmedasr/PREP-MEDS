'use client';

import { useCallback, useEffect, useState } from 'react';

type Snapshot = {
  generated_at: string;
  medications: {
    total: number;
    active: number;
    recent: Array<{
      medication_id: string;
      canonical_name: string;
      generic_name: string | null;
      route: string | null;
      dosage_form: string | null;
      release_type: string | null;
      active: boolean;
      first_seen_commit: string | null;
      last_seen_commit: string | null;
      updated_at: string | null;
    }>;
  };
  review_groups: { total: number };
  pipeline: {
    revisions_accepted_today: number;
    in_research: number;
    awaiting_ci: number;
    ci_failed: number;
    available: number;
    completed: number;
    ready_for_clinician_review: number;
    clinician_reviewed: number;
    patient_facing_authorized: number;
    patient_facing_active: number;
  };
  awaiting_ci: Array<{
    task_id: number;
    group_id: string;
    status: string;
    reason: string | null;
    revision_id: number | null;
    updated_at: string | null;
  }>;
  ready_for_review: Array<{
    group_id: string;
    domain_key: string | null;
    class_key: string | null;
    revision_no: number | null;
    content_sha256: string | null;
    clinician_reviewed: boolean;
    patient_facing_authorized: boolean;
  }>;
  recent_events: Array<{
    event_id: number;
    at: string;
    event_type: string;
    group_id: string | null;
    task_id: number | null;
    revision_id: number | null;
  }>;
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #d7dce2',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
};

function Metric({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{label}</div>
      {detail ? <div style={{ color: '#59636e', fontSize: 13, marginTop: 6 }}>{detail}</div> : null}
    </div>
  );
}

function time(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function OwnerDashboard() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/owner-dashboard', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Dashboard request failed');
      setData(body);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Dashboard request failed');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 20px 56px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <a href="/" style={{ color: '#3d4b59', fontSize: 14 }}>← PREP-MEDS</a>
          <h1 style={{ margin: '10px 0 4px', fontSize: 34 }}>PREP-MEDS LIVE</h1>
          <p style={{ margin: 0, color: '#59636e' }}>
            Owner operations dashboard. Research and technical status only; no clinical content is activated here.
          </p>
        </div>
        <button onClick={() => void load()} disabled={refreshing} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #9aa4ae', background: '#fff', fontWeight: 700 }}>
          {refreshing ? 'Refreshing…' : 'Refresh now'}
        </button>
      </div>

      {error ? (
        <div role="alert" style={{ marginTop: 20, padding: 14, border: '2px solid #a00', borderRadius: 8 }}>
          {error}
        </div>
      ) : null}

      {!data ? <p style={{ marginTop: 24 }}>Loading live pipeline state…</p> : (
        <>
          <div style={{ marginTop: 16, color: '#68727c', fontSize: 13 }}>
            Snapshot generated {time(data.generated_at)} · auto-refresh every 15 seconds
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 18 }}>
            <Metric label="Medications" value={data.medications.total} detail={`${data.medications.active} active`} />
            <Metric label="Review groups" value={data.review_groups.total} />
            <Metric label="Accepted today" value={data.pipeline.revisions_accepted_today} />
            <Metric label="In research" value={data.pipeline.in_research} />
            <Metric label="Awaiting CI" value={data.pipeline.awaiting_ci} />
            <Metric label="CI failed" value={data.pipeline.ci_failed} />
            <Metric label="Ready for your review" value={data.pipeline.ready_for_clinician_review} />
            <Metric label="Clinician reviewed" value={data.pipeline.clinician_reviewed} />
            <Metric label="Patient-facing active" value={data.pipeline.patient_facing_active} />
          </section>

          <section style={{ marginTop: 28 }}>
            <h2>Pipeline</h2>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <div style={{ minWidth: 720, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, textAlign: 'center' }}>
                {[
                  ['Available', data.pipeline.available],
                  ['In research', data.pipeline.in_research],
                  ['Awaiting CI', data.pipeline.awaiting_ci],
                  ['Ready for review', data.pipeline.ready_for_clinician_review],
                  ['Clinician reviewed', data.pipeline.clinician_reviewed],
                  ['Patient-facing active', data.pipeline.patient_facing_active],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ padding: 12, background: '#f5f7f9', borderRadius: 8 }}>
                    <strong style={{ display: 'block', fontSize: 22 }}>{value}</strong>
                    <span style={{ fontSize: 13 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <h2>Awaiting technical CI</h2>
            {data.awaiting_ci.length === 0 ? <p>Nothing is currently waiting on technical CI.</p> : (
              <div style={{ ...cardStyle, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th align="left">Group</th><th align="left">Revision</th><th align="left">Updated</th></tr></thead>
                  <tbody>{data.awaiting_ci.map((row) => (
                    <tr key={row.task_id}>
                      <td style={{ padding: '10px 0', borderTop: '1px solid #e7eaee' }}>{row.group_id}</td>
                      <td style={{ borderTop: '1px solid #e7eaee' }}>{row.revision_id ?? '—'}</td>
                      <td style={{ borderTop: '1px solid #e7eaee' }}>{time(row.updated_at)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ marginTop: 28 }}>
            <h2>Ready for your clinical review</h2>
            {data.ready_for_review.length === 0 ? <p>No groups have cleared the technical gate yet.</p> : (
              <div style={{ ...cardStyle, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th align="left">Group</th><th align="left">Domain</th><th align="left">Revision</th><th align="left">Status</th></tr></thead>
                  <tbody>{data.ready_for_review.map((row) => (
                    <tr key={row.group_id}>
                      <td style={{ padding: '10px 0', borderTop: '1px solid #e7eaee' }}>{row.group_id}</td>
                      <td style={{ borderTop: '1px solid #e7eaee' }}>{row.domain_key ?? '—'}</td>
                      <td style={{ borderTop: '1px solid #e7eaee' }}>{row.revision_no ?? '—'}</td>
                      <td style={{ borderTop: '1px solid #e7eaee' }}>{row.clinician_reviewed ? 'Reviewed' : 'Needs review'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ marginTop: 28 }}>
            <h2>Recent activity</h2>
            <div style={cardStyle}>
              {data.recent_events.map((event) => (
                <div key={event.event_id} style={{ padding: '9px 0', borderTop: '1px solid #edf0f2' }}>
                  <strong>{event.event_type.replaceAll('_', ' ')}</strong>
                  {event.group_id ? <span> · {event.group_id}</span> : null}
                  <div style={{ color: '#68727c', fontSize: 12 }}>{time(event.at)}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <h2>Recently updated medications</h2>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th align="left">Medication</th><th align="left">Form</th><th align="left">Updated</th></tr></thead>
                <tbody>{data.medications.recent.map((medication) => (
                  <tr key={medication.medication_id}>
                    <td style={{ padding: '10px 0', borderTop: '1px solid #e7eaee' }}>{medication.canonical_name}</td>
                    <td style={{ borderTop: '1px solid #e7eaee' }}>{[medication.route, medication.dosage_form, medication.release_type].filter(Boolean).join(' · ') || '—'}</td>
                    <td style={{ borderTop: '1px solid #e7eaee' }}>{time(medication.updated_at)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
