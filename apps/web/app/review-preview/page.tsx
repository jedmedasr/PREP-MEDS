"use client";

import { useState } from "react";

const domains = [
  ["Medication knowledge", "Browse versioned medication identities, formulations and evidence; review only."],
  ["MA intake", "Collect medication names, formulations and uncertainty; escalate without medication instructions."],
  ["Shadow scenarios", "20 synthetic cases with candidate traces, not clinical recommendations."],
  ["Clinical decisions", "26 outstanding decisions require accountable human review."],
];

export default function ReviewPreview() {
  const [role, setRole] = useState("MA");
  const [name, setName] = useState("");
  const [form, setForm] = useState("");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const valid = name.trim().length > 1;
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <p style={{ color: "#a35d00", fontWeight: 700 }}>INTERNAL PROTOTYPE · NOT FOR CLINICAL USE</p>
      <h1>PREP-MEDS · Clinical Review Workspace</h1>
      <p>V1 medication universe: engineering-frozen, clinical review pending. No patient-specific instructions or production clinical rules.</p>
      <label htmlFor="role">Preview role: </label>
      <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 8 }}>
        <option>MA</option><option>Physician</option><option>Pharmacist</option><option>Anesthesia</option>
      </select>
      <section aria-label="Workspace areas" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 28 }}>
        {domains.map(([title, description]) => <article key={title} style={{ border: "1px solid #aaa", borderRadius: 12, padding: 18 }}>
          <h2 style={{ fontSize: 19 }}>{title}</h2><p>{description}</p>
        </article>)}
      </section>
      <section style={{ marginTop: 32, padding: 24, border: "2px solid #8d8d8d", borderRadius: 12 }}>
        <h2>Suggest a medication for review</h2>
        <p>Available to {role}s. A suggestion is <strong>not</strong> a verified medication entry. Never enter patient names, DOB, MRN, or other PHI.</p>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
            <label>Medication name *<input required value={name} onChange={(e) => { setName(e.target.value); setSubmitted(false); }} maxLength={120} style={{ display: "block", width: "100%", padding: 10 }} /></label>
            <label>Formulation / route, if known<input value={form} onChange={(e) => setForm(e.target.value)} maxLength={160} style={{ display: "block", width: "100%", padding: 10 }} /></label>
            <label>Why review is needed (no PHI)<textarea value={context} onChange={(e) => setContext(e.target.value)} maxLength={500} rows={3} style={{ display: "block", width: "100%", padding: 10 }} /></label>
            <button disabled={!valid} type="submit" style={{ padding: 12, cursor: valid ? "pointer" : "not-allowed" }}>Preview review request</button>
          </div>
        </form>
        {submitted && <div role="status" style={{ marginTop: 18, padding: 14, border: "1px solid #888" }}>
          <strong>Draft only — not submitted or stored.</strong>
          <p>Requested: {name} {form && "(" + form + ")"}</p>
          <p>Proposed workflow: intake → deduplicate / identity resolution → AI-assisted source discovery → evidence provenance check → pharmacist / physician review → versioned tests → separately approved publication.</p>
          <p>Automated research must never approve a medication or generate patient instructions.</p>
        </div>}
      </section>
      <p style={{ marginTop: 28, color: "#666" }}>Preview does not connect to patient records, persist submissions, or activate clinical decision pathways. Access control is required before hosting outside a trusted development environment.</p>
    </main>
  );
}
