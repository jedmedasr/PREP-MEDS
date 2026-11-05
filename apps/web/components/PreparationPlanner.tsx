'use client';
import { useMemo, useState } from 'react';
import { PREPS, DIET_GUIDE, addCalendarDays, calendarEvents, defaultInstructions, subtractMinutes, validatePlan, type Plan, type PlanInstruction, type PrepProduct } from '../lib/plan';

const today = '2026-12-10'; // Synthetic demo date; never a patient record.
function initialPlan(): Plan {
  return { product:'GoLYTELY', lowFiberDays:7, procedureDate:today, procedureTime:'09:00', arrivalTime:'08:00',
    protocolApproved:false, instructions:defaultInstructions('GoLYTELY') };
}
function formatTime(time?:string) { if (!time) return 'All day'; const [h,m]=time.split(':').map(Number);return new Date(Date.UTC(2020,0,1,h??0,m??0)).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}); }
export function PreparationPlanner() {
  const [plan,setPlan]=useState<Plan>(initialPlan);
  const [view,setView]=useState<'clinician'|'patient'>('clinician');
  const [patientTab,setPatientTab]=useState<'calendar'|'food'|'medications'>('calendar');
  const [selectedDate,setSelectedDate]=useState(today);
  const [showIssues,setShowIssues]=useState(false);
  const events=useMemo(()=>{try{return calendarEvents(plan)}catch{return []}},[plan]);
  const errors=validatePlan(plan);
  const ready=errors.length===0;
  function editItem(id:string,patch:Partial<PlanInstruction>) {
    setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:p.instructions.map(x=>x.id===id?{...x,...patch,approved:false}:x)}));
  }
  function changeProduct(product:PrepProduct) { setPlan(p=>({...p,product,instructions:defaultInstructions(product),approvedBy:undefined,approvedAt:undefined})); }
  function addMedication() {
    const id='med-'+(plan.instructions.filter(x=>x.kind==='medication').length+1);
    setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:[...p.instructions,{id,title:'Medication (specify)',detail:'Clinician must enter an individualized instruction and verify medication management.',offsetDays:-1,kind:'medication',critical:true,approved:false}]}));
  }
  function approve() {
    if (!plan.protocolApproved || plan.instructions.some(x=>!x.approved) || !plan.procedureDate || !plan.procedureTime || !plan.arrivalTime) {setShowIssues(true);return;}
    setPlan(p=>({...p,approvedBy:'Demo clinician (not authenticated)',approvedAt:new Date().toISOString()}));
    setShowIssues(false);
  }
  function setSchedule(field:'procedureDate'|'procedureTime'|'arrivalTime',value:string) {
    setPlan(p=>({...p,[field]:value,approvedBy:undefined,approvedAt:undefined}));
  }
  const days=useMemo(()=>{try{return Array.from({length:plan.lowFiberDays+1},(_,i)=>addCalendarDays(plan.procedureDate,i-plan.lowFiberDays))}catch{return []}},[plan.procedureDate,plan.lowFiberDays]);
  const selected=events.filter(e=>e.date===selectedDate);
  const second=(()=>{try{return subtractMinutes(plan.procedureTime,360)}catch{return null}})();
  const deadline=(()=>{try{return subtractMinutes(plan.procedureTime,240)}catch{return null}})();
  const secondDate=second?addCalendarDays(plan.procedureDate,second.dayOffset):null;
  const deadlineDate=deadline?addCalendarDays(plan.procedureDate,deadline.dayOffset):null;
  return <section className="planner">
    <div className="planner-heading"><div><p className="eyebrow">PREP-MEDS · VISUAL PREPARATION PLANNER</p><h2>From clinical plan to patient calendar</h2><p>All information on this screen is synthetic. This demonstration does not save, transmit, or prescribe.</p></div>
      <div className="planner-switch"><button className={view==='clinician'?'active':''} onClick={()=>setView('clinician')}>Clinician editor</button><button className={view==='patient'?'active':''} onClick={()=>setView('patient')}>Patient preview</button></div></div>
    {view==='clinician'? <div className="planner-columns"><div className="planner-card">
      <h3>1 · Procedure and bowel preparation</h3>
      <div className="planner-fields"><label>Product<select value={plan.product} onChange={e=>changeProduct(e.target.value as PrepProduct)}>{PREPS.map(p=><option key={p}>{p}</option>)}</select></label>
        <label>Procedure date<input type="date" value={plan.procedureDate} onChange={e=>{setSchedule('procedureDate',e.target.value);setSelectedDate(e.target.value)}} /></label>
        <label>Procedure time<input type="time" value={plan.procedureTime} onChange={e=>setSchedule('procedureTime',e.target.value)}/></label>
        <label>Arrival time<input type="time" value={plan.arrivalTime} onChange={e=>setSchedule('arrivalTime',e.target.value)}/></label>
        <label>Low-fiber lead-in (days)<input type="number" min="0" max="14" value={plan.lowFiberDays} onChange={e=>setPlan(p=>({...p,lowFiberDays:Number(e.target.value),approvedBy:undefined,approvedAt:undefined}))}/></label>
      </div>
      <div className="planner-note"><strong>Timing preview, not a prescription</strong><p>Under a hypothetical 2-hour second dose finishing 4 hours before the procedure, start at {second?formatTime(second.time):'—'} {second?.dayOffset===-1?'the preceding day':'on procedure day'}. This calculation is not automatically applied; the clinician must validate the product, local protocol, arrival constraints, and fasting rules.</p></div>
      <label className="planner-check"><input type="checkbox" checked={plan.protocolApproved} onChange={e=>setPlan(p=>({...p,protocolApproved:e.target.checked,approvedBy:undefined,approvedAt:undefined}))}/> Institutional product, dosing, timing, and anesthesia protocol independently reviewed</label>
    </div><div className="planner-card">
      <div className="planner-row"><h3>2 · Review every instruction</h3><button className="planner-secondary" onClick={addMedication}>+ Medication</button></div>
      {plan.instructions.map(item=><div className="planner-instruction" key={item.id}>
        <div className="planner-row"><strong>{item.kind==='diet'?'🥣':item.kind==='medication'?'💊':'🕒'} {item.title}</strong><span className="planner-tag">{item.critical?'Clinical approval':'Patient education'}</span></div>
        <div className="planner-fields"><label>Title<input value={item.title} onChange={e=>editItem(item.id,{title:e.target.value})}/></label>
        <label>Day relative to procedure<input type="number" min="-30" max="7" value={item.offsetDays} onChange={e=>editItem(item.id,{offsetDays:Number(e.target.value)})}/></label>
        <label>Time (optional)<input type="time" value={item.time??''} onChange={e=>editItem(item.id,{time:e.target.value||undefined})}/></label></div>
        <label className="planner-label">Patient-facing instruction<textarea rows={2} value={item.detail} onChange={e=>editItem(item.id,{detail:e.target.value})}/></label>
        {item.critical&&<label className="planner-label">Reason for individualized change / override<textarea rows={2} placeholder="Document reason if departing from the approved default protocol" value={item.overrideReason??''} onChange={e=>editItem(item.id,{overrideReason:e.target.value})}/></label>}
        <label className="planner-check"><input type="checkbox" checked={item.approved} onChange={e=>setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:p.instructions.map(x=>x.id===item.id?{...x,approved:e.target.checked}:x)}))}/> Reviewed and approved for demonstration</label>
      </div>)}
      <button className="primary-button" onClick={approve}>Approve demonstration plan</button>
      <button className="planner-secondary" onClick={()=>setView('patient')}>Preview patient experience</button>
      {showIssues&&<p className="planner-error">Review every instruction and confirm the institutional protocol before approval.</p>}
      <p className="planner-muted">This is not a legally valid electronic signature or a persistent clinical approval.</p>
    </div></div>:<div className="planner-patient">
      <div className="planner-patient-hero"><span>YOUR COLONOSCOPY GUIDE</span><h3>Feel ready, one day at a time.</h3><p>Procedure: {plan.procedureDate} at {formatTime(plan.procedureTime)} · {plan.product}</p><strong className={ready?'planner-ready':'planner-pending'}>{ready?'Demonstration plan reviewed':'Preview only — clinical instructions not approved'}</strong></div>
      <div className="planner-note" role="note"><strong>⏰ Important: finish bowel prep at least 4 hours before your procedure</strong><p>Scheduled procedure: {formatTime(plan.procedureTime)}. Finish drinking the entire preparation by <strong>{deadline?formatTime(deadline.time):'—'}{deadline?.dayOffset===-1?' the previous day':''}</strong>. For a clinician-confirmed 2-hour second dose, begin by <strong>{second?formatTime(second.time):'—'}{second?.dayOffset===-1?' the previous day':''}</strong>. Set your alarm earlier to allow time to wake up and get ready. These times are a demonstration calculation; your clinical team must confirm your product-specific schedule and anesthesia fasting instructions.</p></div>
      <nav className="planner-tabs" aria-label="Patient guide"><button className={patientTab==='calendar'?'active':''} onClick={()=>setPatientTab('calendar')}>📅 My calendar</button><button className={patientTab==='food'?'active':''} onClick={()=>setPatientTab('food')}>🥣 Food guide</button><button className={patientTab==='medications'?'active':''} onClick={()=>setPatientTab('medications')}>💊 Medications</button></nav>
      {patientTab==='calendar'?<><div className="planner-day-grid">{days.map(day=><button key={day} className={selectedDate===day?'selected':''} onClick={()=>setSelectedDate(day)}><small>{new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',timeZone:'UTC'})}</small><strong>{Number(day.slice(-2))}</strong><span>{day===plan.procedureDate?'🏥':day===addCalendarDays(plan.procedureDate,-1)?'🥤':'🥣'}</span></button>)}</div><div className="planner-card"><h3>{selectedDate===plan.procedureDate?'Procedure day':selectedDate===addCalendarDays(plan.procedureDate,-1)?'The day before':selectedDate}</h3>{selectedDate===addCalendarDays(plan.procedureDate,-1)?<div className="planner-event"><span>🥤</span><div><strong>What counts as a clear liquid?</strong><p>Water, clear broth without pieces, apple or white grape juice without pulp, clear electrolyte drinks, plain tea or black coffee without milk, and yellow/green gelatin or ice pops. No solid food, milk, smoothies, pulp, or red/purple liquids.</p><button className="planner-secondary" onClick={()=>setPatientTab('food')}>See the full food and drink guide</button></div></div>:null}{selectedDate===secondDate&&second?<div className="planner-event"><span>⏰</span><div><strong>{formatTime(second.time)} · Suggested second-dose start (demo)</strong><p>Allow the full 2-hour drinking window, if approved by your clinician, plus extra time to wake up beforehand.</p></div></div>:null}{selectedDate===deadlineDate&&deadline?<div className="planner-event"><span>✅</span><div><strong>{formatTime(deadline.time)} · Finish all bowel preparation by this time</strong><p>At least 4 hours before your scheduled procedure. This is separate from anesthesia fasting instructions.</p></div></div>:null}{selected.length?selected.map(e=><div className="planner-event" key={e.id}><span>{e.kind==='medication'?'💊':e.kind==='diet'?'🥣':'🕒'}</span><div><strong>{formatTime(e.time)} · {e.title}</strong><p>{e.detail}</p>{!e.approved&&<small>Requires clinician review</small>}</div></div>):<p>No specific instructions entered for this date.</p>}</div></>:null}
      {patientTab==='food'?<div className="planner-food-grid">{(['lowFiber','clear'] as const).map(k=><div className="planner-card" key={k}><h3>{k==='lowFiber'?'🥣 Low-fiber diet':'🥤 Clear-liquid diet'}</h3><h4>✓ Examples to choose</h4><ul>{DIET_GUIDE[k].allowed.map(x=><li key={x}>{x}</li>)}</ul><h4>✕ Avoid</h4><ul>{DIET_GUIDE[k].avoid.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div>:null}
      {patientTab==='medications'?<div className="planner-card"><h3>My medication instructions</h3>{plan.instructions.filter(x=>x.kind==='medication').length?plan.instructions.filter(x=>x.kind==='medication').map(x=><div className="planner-event" key={x.id}><span>💊</span><div><strong>{x.title}</strong><p>{x.detail}</p>{!x.approved&&<small>Pending clinician review</small>}</div></div>):<p>No individualized medication instructions entered. Do not stop or adjust medications based on this demo.</p>}</div>:null}
      <div className="planner-note"><strong>Sharing and safety</strong><p>Public demo: <a href="https://prepmeds.vercel.app" target="_blank" rel="noreferrer">prepmeds.vercel.app</a>. This is not a patient-specific link; do not enter or share protected health information. Secure individualized sharing requires authentication, persistent clinician-approved plans, and expiring patient access links.</p></div><div className="planner-note"><strong>Important</strong><p>This preview is for testing with synthetic information only. It is not a secure patient portal. No email or patient link is generated. Follow instructions provided by your clinical team.</p></div>
    </div>}
  </section>;
}
