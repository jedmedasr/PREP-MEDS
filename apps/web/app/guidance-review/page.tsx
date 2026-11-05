"use client";
import { useState } from "react";

const sources = [
  { name: "ASGE 2016 — Management of antithrombotic agents", url: "https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics" },
  { name: "ACG/CAG 2022 — Periendoscopic antithrombotic management", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8972207/" },
];
const options = [
  { id: "apixaban", name: "Eliquis (apixaban)", type: "DOAC" },
  { id: "clopidogrel", name: "Plavix (clopidogrel)", type: "P2Y12 inhibitor" },
  { id: "ticagrelor", name: "Brilinta (ticagrelor)", type: "P2Y12 inhibitor" },
  { id: "aspirin", name: "Aspirin", type: "Antiplatelet" },
];
export default function GuidanceReview() {
  const [drug, setDrug] = useState("apixaban");
  const [risk, setRisk] = useState("high");
  const [crcl, setCrcl] = useState("over60");
  const [localText, setLocalText] = useState("");
  const [localVisible, setLocalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const high = risk === "high";
  const recommendation = drug === "apixaban"
    ? high ? ({over60:"ASGE 2016: interrupt 1–2 days before high-risk endoscopy (CrCl >60 mL/min).", from30:"ASGE 2016: interrupt 3 days before high-risk endoscopy (CrCl 30–59 mL/min).", from15:"ASGE 2016: interrupt 4 days before high-risk endoscopy (CrCl 15–29 mL/min).", unknown:"Enter creatinine clearance to select an ASGE interval."} as Record<string,string>)[crcl] : "ASGE 2016: suggests continuing DOACs for low-risk endoscopic procedures. ACG/CAG 2022 instead suggests temporary interruption for elective endoscopy; the recommendations differ."
    : drug === "aspirin" ? "ASGE 2016: generally continue aspirin for endoscopy. ACG/CAG 2022 suggests against interrupting cardiac aspirin for secondary prevention."
    : high ? drug === "clopidogrel" ? "ASGE 2016: withhold clopidogrel 5–7 days before high-risk endoscopy when interruption is appropriate; generally continue aspirin if used for secondary prevention." : "ASGE 2016: withhold ticagrelor 3–5 days before high-risk endoscopy when interruption is appropriate; generally continue aspirin if used for secondary prevention."
    : "ASGE 2016: generally continue antiplatelet therapy for low-risk endoscopic procedures.";
  return <main style={{maxWidth:900,margin:"auto",padding:28,fontFamily:"system-ui",lineHeight:1.55}}>
    <p style={{color:"#a45100",fontWeight:700}}>CLINICAL EVIDENCE REVIEW · NOT AN APPROVED PATIENT INSTRUCTION</p>
    <h1>PREP-MEDS · Guideline Recommendations</h1>
    <p>Published society guidance is visible even while local policy approval is pending. Choose the procedure bleeding-risk category before interpreting a hold interval.</p>
    <label>Find medication<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search brand or generic" style={{display:"block",width:"100%",padding:12,marginBottom:12}}/></label>
    <label>Medication<select value={drug} onChange={e=>setDrug(e.target.value)} style={{display:"block",width:"100%",padding:12,marginBottom:12}}>{options.filter(x=>(x.name+" "+x.type).toLowerCase().includes(query.toLowerCase())||x.id===drug).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
    <label>Procedure bleeding risk<select value={risk} onChange={e=>setRisk(e.target.value)} style={{display:"block",width:"100%",padding:12,marginBottom:12}}><option value="high">High bleeding risk (e.g. anticipated polypectomy / EMR)</option><option value="low">Low bleeding risk (e.g. diagnostic endoscopy ± biopsy)</option></select></label>
    {drug==="apixaban"&&high&&<label>Creatinine clearance (CrCl)<select value={crcl} onChange={e=>setCrcl(e.target.value)} style={{display:"block",width:"100%",padding:12}}><option value="over60">&gt;60 mL/min</option><option value="from30">30–59 mL/min</option><option value="from15">15–29 mL/min</option><option value="unknown">Unknown / outside listed ranges</option></select></label>}
    <section aria-live="polite" style={{border:"2px solid #446",padding:20,borderRadius:12,marginTop:24}}>
      <h2>ASGE published recommendation</h2><p style={{fontSize:20,fontWeight:650}}>{recommendation}</p>
      <p><strong>Scope:</strong> elective GI endoscopy; guideline publication 2016. This is not a patient-specific order.</p>
      <p><strong>Contemporary cross-check:</strong> ACG/CAG 2022 suggests temporary DOAC interruption for elective procedures, without prescribing ASGE's renal-stratified intervals; it suggests interrupting the P2Y12 component of DAPT while continuing aspirin, and finds insufficient evidence for a blanket recommendation on P2Y12 monotherapy. Recommendations may differ by guideline and clinical scenario.</p>
      <p><strong>Safety checks before applying:</strong> indication and thrombotic risk, recent VTE/ACS/coronary stent, mechanical valve, other antithrombotics, actual planned intervention, renal function, and prescribing specialist input when indicated. Do not extrapolate the table to CrCl &lt;15 mL/min.</p>
      <p><strong>Restart:</strong> not automatically specified; confirm adequate hemostasis and individualized procedural/thrombotic risk. ACG/CAG 2022 did not establish a universal same-day versus later restart recommendation.</p>
    </section>
    <section style={{marginTop:24,border:"1px solid #777",padding:20,borderRadius:12}}>
      <h2>Local institutional protocol</h2><p>Separate from society guidance. No institution-specific policy has been approved or loaded.</p>
      <label>Draft local protocol for reviewer comparison (no PHI)<textarea value={localText} onChange={e=>{setLocalText(e.target.value);setLocalVisible(false)}} rows={4} maxLength={1500} style={{display:"block",width:"100%",padding:10}}/></label>
      <button type="button" onClick={()=>setLocalVisible(true)} disabled={!localText.trim()} style={{padding:12,marginTop:12}}>Preview local override</button>
      {localVisible&&<div role="status" style={{marginTop:12,padding:12,border:"2px dashed #a45100"}}><strong>UNAPPROVED LOCAL DRAFT — NOT SAVED</strong><p style={{whiteSpace:"pre-wrap"}}>{localText}</p><p>Requires institution, reviewer, approval date, versioning, and audit trail before publication.</p></div>}
    </section>
    <h2>Primary sources</h2><ul>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></li>)}</ul>
    <p><strong>Coverage limitation:</strong> This review page currently covers four example agents, not the entire PREP-MEDS catalog. Guideline excerpts are for clinician review; no patient-specific hold/restart instructions are issued.</p>
  </main>;
}
