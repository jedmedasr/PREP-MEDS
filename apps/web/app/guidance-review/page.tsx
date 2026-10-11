"use client";
import {useMemo,useState} from "react";
import {GUIDANCE,REFERENCES} from "./guidance-data";
export default function GuidanceReview(){
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState("apixaban");
 const [risk,setRisk]=useState("high");
 const [crcl,setCrcl]=useState("unknown");
 const [local,setLocal]=useState("");
 const [preview,setPreview]=useState(false);
 const matches=useMemo(()=>GUIDANCE.filter(g=>(g.label+" "+g.aliases.join(" ")+" "+g.category).toLowerCase().includes(query.toLowerCase())),[query]);
 const g=GUIDANCE.find(x=>x.id===selected)??GUIDANCE[0];
 if(!g){return <main style={{maxWidth:1000,margin:"auto",padding:"28px 20px",fontFamily:"system-ui",lineHeight:1.5}}><p>No guidance entries are loaded.</p></main>}
 const renalDependent=["apixaban","rivaroxaban","dabigatran","edoxaban"].includes(g.id);
 const text=g.id==="apixaban"&&risk==="high"?
 ({unknown:"Select a verified creatinine-clearance band to view the ASGE apixaban interval.",over60:"ASGE 2016: interrupt 1–2 days before high-risk endoscopy (CrCl >60 mL/min).",from30:"ASGE 2016: interrupt 3 days before high-risk endoscopy (CrCl 30–59 mL/min).",from15:"ASGE 2016: interrupt 4 days before high-risk endoscopy (CrCl 15–29 mL/min).",under15:"ASGE 2016 table does not provide a validated interval here; specialist-directed plan required."} as Record<string,string>)[crcl] :risk==="high"?g.high:g.low;
 return <main style={{maxWidth:1000,margin:"auto",padding:"28px 20px",fontFamily:"system-ui",lineHeight:1.5}}>
 <p style={{fontWeight:800,color:"#a45100"}}>EVIDENCE REVIEW ONLY · NOT APPROVED PATIENT INSTRUCTIONS</p>
 <h1>PREP-MEDS · Periendoscopic Medication Guidance</h1>
 <p>Browse {GUIDANCE.length} medication classes/agents and brand aliases. Published guidance remains visible separately from unapproved institutional drafts. A medication entry is not proof of a fully validated patient-specific protocol.</p>
 <label>Search medication or brand<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g., Eliquis, Ozempic, Jardiance, Lantus" style={{display:"block",width:"100%",padding:12,boxSizing:"border-box"}}/></label>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:14}}>
 <div><label>Medication<select value={matches.some(x=>x.id===selected)?selected:""} onChange={e=>setSelected(e.target.value)} style={{width:"100%",padding:12}}><option value="" disabled>Select matching medication</option>{matches.map(x=><option value={x.id} key={x.id}>{x.label} ({x.aliases.join(", ")})</option>)}</select></label><small>{matches.length} matching entries</small></div>
 <label>Endoscopic bleeding risk<select value={risk} onChange={e=>setRisk(e.target.value)} style={{display:"block",width:"100%",padding:12}}><option value="high">High-risk intervention</option><option value="low">Low-risk diagnostic procedure</option></select></label>
 {renalDependent&&<label>CrCl for renal-dependent anticoagulant guidance<select value={crcl} onChange={e=>setCrcl(e.target.value)} style={{display:"block",width:"100%",padding:12}}><option value="unknown">Unknown / not verified</option><option value="over60">&gt;60 mL/min</option><option value="from30">30–59 mL/min</option><option value="from15">15–29 mL/min</option><option value="under15">&lt;15 mL/min</option></select></label>}
 </div>
 <section aria-live="polite" style={{border:"2px solid #344e70",padding:20,borderRadius:12,marginTop:22}}>
 <p style={{margin:0,fontWeight:700,color:"#344e70"}}>PUBLISHED SOCIETY GUIDANCE · {g.category}</p>
 <h2>{g.label} <span style={{fontSize:15,fontWeight:400}}>({g.aliases.join(", ")})</span></h2>
 <p style={{fontSize:20,fontWeight:650}}>{text}</p>
 {renalDependent&&g.id!=="apixaban"&&risk==="high"&&<p style={{fontWeight:700,color:"#9b4e00"}}>Renal-dependent timing shown as a reference table summary only; verify exact CrCl band in the linked primary source before applying. No automated interval selection is available for this agent.</p>}
 {g.notes&&<p><strong>Specific caution:</strong> {g.notes}</p>}
 <p><strong>Clinical safeguards:</strong> Verify procedure/intervention, indication, renal function, recent VTE/ACS/stent, concurrent agents, diabetes type, fasting and anesthesia risk as applicable. No automatic patient-specific stop/restart order.</p>
 <p><strong>Evidence:</strong> <a href={REFERENCES[g.source as keyof typeof REFERENCES]} target="_blank" rel="noopener noreferrer">{g.source} primary guideline</a>. Publication dates and context matter; recommendations may conflict across societies.</p>
 </section>
 <section style={{border:"1px solid #888",borderRadius:12,padding:20,marginTop:20}}>
 <h2>Institution-specific protocol · separate layer</h2>
 <p>No approved local override is loaded. Entering text here is an <strong>unsaved draft</strong>, not a published hospital policy.</p>
 <label>Draft local modification (no PHI)<textarea value={local} onChange={e=>{setLocal(e.target.value);setPreview(false)}} maxLength={1500} rows={4} style={{display:"block",width:"100%",boxSizing:"border-box",padding:12}}/></label>
 <button type="button" disabled={!local.trim()} onClick={()=>setPreview(true)} style={{padding:12,marginTop:12}}>Preview local override</button>
 {preview&&<div role="status" style={{border:"2px dashed #a45100",padding:14,marginTop:12}}><strong>LOCAL OVERRIDE · DRAFT · NOT SAVED OR APPROVED</strong><p style={{whiteSpace:"pre-wrap"}}>{local}</p><p>Publication requires institution, owner, approver, version, effective date, and audit trail.</p></div>}
 </section>
 <h2>Guideline reconciliation and limitations</h2>
 <p>ASGE 2016 provides explicit antithrombotic intervals, while ACG/CAG 2022 differs on some elective-endoscopy interruption decisions. ADA 2026 addresses perioperative diabetes medication management. Multisociety 2024 GLP-1 guidance emphasizes individualized aspiration-risk mitigation rather than automatic holds. These are <strong>not</strong> interchangeable recommendations.</p>
 <ul>{Object.entries(REFERENCES).map(([key,url])=><li key={key}><a href={url} target="_blank" rel="noopener noreferrer">{key} source</a></li>)}</ul>
 <p><strong>Validation status:</strong> Expanded clinician-review catalog, not exhaustive formulary reconciliation or clinically approved decision support. Some entries intentionally identify evidence gaps instead of inventing hold intervals. Local edits are not persisted.</p>
 </main>
}