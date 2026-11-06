'use client';
import { useEffect, useMemo, useState } from 'react';
import { PREPS, DIET_GUIDE, addCalendarDays, calendarEvents, defaultInstructions, standardPrepTimes, subtractMinutes, validatePlan, type Plan, type PlanInstruction, type PrepProduct } from '../lib/plan';

type SavedFacility = {id:string;name:string;address:string;phone:string;parking:string;checkIn:string;instructions:string};
const SAVED_FACILITIES_KEY = 'prepmeds.savedFacilities.v1';
const FACILITIES = [
  {id:'mmmc',name:'MedStar Montgomery Medical Center (MMMC)',address:'18101 Prince Philip Drive, Olney, MD 20832',phone:'301-774-8882'},
  {id:'silver-spring',name:'MedStar Health Endoscopy Center at Silver Spring',address:'12008 Veirs Mill Road, Silver Spring, MD 20906',phone:'301-942-0022'}
] as const;

const today = '2026-12-10'; // Synthetic demo date; never a patient record.
function initialPlan(): Plan {
  return { product:'GoLYTELY', lowFiberDays:7, procedureDate:today, procedureTime:'09:00', arrivalTime:'08:00', arrivalMode:'offset', arrivalOffsetMinutes:60, facilityName:FACILITIES[0].name, facilityAddress:FACILITIES[0].address, facilityPhone:FACILITIES[0].phone, facilityParking:'', facilityCheckIn:'', facilityInstructions:'', anesthesiaFastingPolicy:'strict-midnight',
    protocolApproved:false, instructions:defaultInstructions('GoLYTELY','09:00') };
}
function formatTime(time?:string) { if (!time) return 'All day'; const [h,m]=time.split(':').map(Number);return new Date(Date.UTC(2020,0,1,h??0,m??0)).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}); }

function encodeBytes(bytes:Uint8Array<ArrayBufferLike>){return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decodeBytes(value:string):Uint8Array<ArrayBuffer>{const s=value.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(s.padEnd(Math.ceil(s.length/4)*4,'='));const bytes=new Uint8Array(new ArrayBuffer(raw.length));for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes;}
async function makeGuideLink(plan:Plan){
 const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
 const iv=crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv.buffer},key,new TextEncoder().encode(JSON.stringify(plan))));
 const rawKey=new Uint8Array(await crypto.subtle.exportKey('raw',key));
 return location.origin+location.pathname+'#guide='+[iv,ciphertext,rawKey].map(encodeBytes).join('.');
}
async function loadGuide(hash:string):Promise<Plan|null>{
 const m=hash.match(/^#guide=([\w-]+)\.([\w-]+)\.([\w-]+)$/);if(!m||hash.length>25000)return null;
 const iv=decodeBytes(m[1]),keyBytes=decodeBytes(m[3]);if(iv.length!==12||keyBytes.length!==32)return null;
 const key=await crypto.subtle.importKey('raw',keyBytes.buffer,'AES-GCM',false,['decrypt']);
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv.buffer},key,decodeBytes(m[2]).buffer);
 const p=JSON.parse(new TextDecoder().decode(bytes)) as Plan;
 if(!p||!PREPS.includes(p.product)||typeof p.procedureDate!=='string'||typeof p.procedureTime!=='string'||!Array.isArray(p.instructions)||p.instructions.length>50)return null;
 return p;
}

export function PreparationPlanner() {
  const [plan,setPlan]=useState<Plan>(initialPlan);
  const [savedFacilities,setSavedFacilities]=useState<SavedFacility[]>([]);
  const [activeSavedId,setActiveSavedId]=useState<string|null>(null);
  const [facilitySaveMessage,setFacilitySaveMessage]=useState('');
  useEffect(()=>{try{const raw=window.localStorage.getItem(SAVED_FACILITIES_KEY);if(raw){const parsed:unknown=JSON.parse(raw);if(Array.isArray(parsed))setSavedFacilities(parsed.filter((v):v is SavedFacility=>!!v&&typeof v==='object'&&typeof v.id==='string'&&typeof v.name==='string'&&typeof v.address==='string'&&typeof v.phone==='string'&&typeof v.parking==='string'&&typeof v.checkIn==='string'&&typeof v.instructions==='string'));}}catch{/* Storage may be disabled; current session remains editable. */}},[]);

  const [view,setView]=useState<'clinician'|'patient'>('clinician');
  const [sharedGuide,setSharedGuide]=useState(false);
  const [shareMessage,setShareMessage]=useState('');
  useEffect(()=>{if(!location.hash.startsWith('#guide='))return;let active=true;void loadGuide(location.hash).then(p=>{if(!active)return;if(p){setPlan(p);setSelectedDate(p.procedureDate);setView('patient');setSharedGuide(true);}else setShareMessage('Invalid guide link. Contact your care team.');}).catch(()=>{if(active)setShareMessage('Unable to open this guide. Contact your care team.');});return()=>{active=false;};},[]);
  async function copyPatientLink(){
    if(!ready){setShowIssues(true);setShareMessage('Review the plan before sharing.');return;}
    try{await navigator.clipboard.writeText(await makeGuideLink(plan));setShareMessage('Demo guide link copied. Anyone with the link can view it. Do not include patient identifiers.');}
    catch{setShareMessage('Could not copy link. Check browser permissions.');}
  }

  const [patientTab,setPatientTab]=useState<'calendar'|'food'|'medications'>('calendar');
  const [timingExpanded,setTimingExpanded]=useState(false);
  const [selectedDate,setSelectedDate]=useState(today);
  const [showIssues,setShowIssues]=useState(false);
  const [expandedInstructions,setExpandedInstructions]=useState<string[]>([]);
  const events=useMemo(()=>{try{return calendarEvents(plan)}catch{return []}},[plan]);
  const errors=validatePlan(plan);
  const ready=errors.length===0;
  function editItem(id:string,patch:Partial<PlanInstruction>) {
    setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:p.instructions.map(x=>x.id===id?{...x,...patch,approved:false}:x)}));
  }
  function changeProduct(product:PrepProduct) { setPlan(p=>({...p,product,instructions:defaultInstructions(product,p.procedureTime),approvedBy:undefined,approvedAt:undefined})); }
  function addMedication() {
    const id='med-'+(plan.instructions.filter(x=>x.kind==='medication').length+1);
    setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:[...p.instructions,{id,title:'Medication (specify)',detail:'Clinician must enter an individualized instruction and verify medication management.',offsetDays:-1,kind:'medication',critical:true,approved:false}]}));
  }
  function reviewAllInstructions() {
    setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:p.instructions.map(item=>({...item,approved:true}))}));
    setShowIssues(false);
  }
  function toggleInstruction(id:string) {
    setExpandedInstructions(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);
  }
  function approve() {
    if (!plan.protocolApproved || plan.instructions.some(x=>!x.approved) || !plan.procedureDate || !plan.procedureTime || !plan.arrivalTime) {setShowIssues(true);return;}
    setPlan(p=>({...p,approvedBy:'Demo clinician (not authenticated)',approvedAt:new Date().toISOString()}));
    setShowIssues(false);
  }
  const selectedFacility=activeSavedId && savedFacilities.some(f=>f.id===activeSavedId)?activeSavedId: FACILITIES.find(f=>f.name===plan.facilityName && f.address===plan.facilityAddress)?.id ?? 'custom';
  function chooseFacility(id:string) {
    const facility=FACILITIES.find(f=>f.id===id);
    const saved=savedFacilities.find(f=>f.id===id);
    setActiveSavedId(saved?.id??null);
    setFacilitySaveMessage('');
    setPlan(p=>({...p,facilityName:facility?.name??saved?.name??'',facilityAddress:facility?.address??saved?.address??'',facilityPhone:facility?.phone??saved?.phone??'',facilityParking:saved?.parking??'',facilityCheckIn:saved?.checkIn??'',facilityInstructions:saved?.instructions??'',approvedBy:undefined,approvedAt:undefined}));
  }
  function saveFacility() {
    const name=plan.facilityName?.trim()??'';
    const address=plan.facilityAddress?.trim()??'';
    if(!name||!address){setFacilitySaveMessage('Enter a facility name and address before saving.');return;}
    const id=activeSavedId??`facility-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry:SavedFacility={id,name,address,phone:plan.facilityPhone?.trim()??'',parking:plan.facilityParking??'',checkIn:plan.facilityCheckIn??'',instructions:plan.facilityInstructions??''};
    const next=activeSavedId?savedFacilities.map(f=>f.id===id?entry:f):[...savedFacilities,entry];
    try{window.localStorage.setItem(SAVED_FACILITIES_KEY,JSON.stringify(next));setSavedFacilities(next);setActiveSavedId(id);setFacilitySaveMessage('Location saved on this device.');}
    catch{setFacilitySaveMessage('Could not save to this browser. Check storage settings.');}
  }
  function deleteSavedFacility(){
    if(!activeSavedId)return;
    const next=savedFacilities.filter(f=>f.id!==activeSavedId);
    try{window.localStorage.setItem(SAVED_FACILITIES_KEY,JSON.stringify(next));setSavedFacilities(next);setActiveSavedId(null);setFacilitySaveMessage('Saved location deleted from this device.');}
    catch{setFacilitySaveMessage('Could not update saved locations.');}
  }
  function updateFacility(field: 'facilityName'|'facilityAddress'|'facilityPhone'|'facilityParking'|'facilityCheckIn'|'facilityInstructions', value:string) {
    setFacilitySaveMessage('');
    setPlan(p=>({...p,[field]:value,approvedBy:undefined,approvedAt:undefined}));
  }
  function setArrivalMode(mode:'manual'|'offset') {
    setPlan(p=>({...p,arrivalMode:mode,arrivalTime:mode==='offset'?subtractMinutes(p.procedureTime,p.arrivalOffsetMinutes??60).time:p.arrivalTime,approvedBy:undefined,approvedAt:undefined}));
  }
  function setArrivalOffset(value:number) {
    setPlan(p=>({...p,arrivalOffsetMinutes:value,arrivalTime:Number.isInteger(value)&&value>=0&&value<=360?subtractMinutes(p.procedureTime,value).time:p.arrivalTime,approvedBy:undefined,approvedAt:undefined}));
  }
  function setSchedule(field:'procedureDate'|'procedureTime'|'arrivalTime',value:string) {
    setPlan(p=>{
      const updates:Partial<Plan> = {[field]:value};
      if(field==='procedureTime' && /^([01]\\d|2[0-3]):[0-5]\\d$/.test(value)){
        if(p.arrivalMode==='offset') updates.arrivalTime=subtractMinutes(value,p.arrivalOffsetMinutes??60).time;
        const oldTiming=standardPrepTimes(p.procedureTime).secondStart;
        const newTiming=standardPrepTimes(value).secondStart;
        updates.instructions=p.instructions.map(item=>item.id==='prep-second' && item.time===oldTiming.time && item.offsetDays===oldTiming.dayOffset
          ?{...item,time:newTiming.time,offsetDays:newTiming.dayOffset,approved:false}:item);
      }
      return {...p,...updates,approvedBy:undefined,approvedAt:undefined};
    });
  }
  const days=useMemo(()=>{try{return Array.from({length:plan.lowFiberDays+1},(_,i)=>addCalendarDays(plan.procedureDate,i-plan.lowFiberDays))}catch{return []}},[plan.procedureDate,plan.lowFiberDays]);
  const selected=events.filter(e=>e.date===selectedDate && e.id!=='prep-second' && e.id!=='fasting' && e.id!=='diet-low' && e.id!=='diet-clear');
  const second=(()=>{const item=plan.instructions.find(x=>x.id==='prep-second');return item?.time?{time:item.time,dayOffset:item.offsetDays}:(()=>{try{return subtractMinutes(plan.procedureTime,360)}catch{return null}})()})();
  const deadline=(()=>{try{return subtractMinutes(plan.procedureTime,240)}catch{return null}})();
  const strictMidnight=(plan.anesthesiaFastingPolicy??'strict-midnight')==='strict-midnight';
  const secondDate=second?addCalendarDays(plan.procedureDate,second.dayOffset):null;
  const deadlineDate=deadline?addCalendarDays(plan.procedureDate,deadline.dayOffset):null;
  const dayBefore=addCalendarDays(plan.procedureDate,-1);
  const isProcedureDay=selectedDate===plan.procedureDate;
  const isClearDay=selectedDate===dayBefore;
  const isLowFiberDay=selectedDate<dayBefore;
  const selectedDayLabel=new Date(selectedDate+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'});
  const foodMode=isClearDay||isProcedureDay?'clear':'lowFiber';
  const startTime=second?formatTime(second.time):'Ask your team';
  return <section className="planner">
    <div className="planner-heading"><div><p className="eyebrow">PREP-MEDS · VISUAL PREPARATION PLANNER</p><h2>From clinical plan to patient calendar</h2><p>Demo only. Do not enter patient identifiers or use for clinical delivery.</p></div>
      {!sharedGuide&&<div className="planner-switch"><button className={view==='clinician'?'active':''} onClick={()=>setView('clinician')}>Clinician editor</button><button className={view==='patient'?'active':''} onClick={()=>setView('patient')}>Patient preview</button></div>}</div>
    {view==='clinician'? <div className="planner-columns"><div className="planner-card">
      <h3>1 · Appointment</h3>
      <div className="planner-compact-schedule">
        <label className="planner-inline-field"><span>Procedure date</span><input type="date" value={plan.procedureDate} onChange={e=>{setSchedule('procedureDate',e.target.value);setSelectedDate(e.target.value)}} /></label>
        <label className="planner-inline-field"><span>Procedure time</span><input type="time" value={plan.procedureTime} onChange={e=>setSchedule('procedureTime',e.target.value)}/></label>
        <div className="planner-inline-field planner-arrival-line"><span>Arrive</span><strong>{formatTime(plan.arrivalTime)}</strong><button type="button" className="planner-text-action" onClick={()=>setArrivalMode(plan.arrivalMode==='manual'?'offset':'manual')}>{plan.arrivalMode==='manual'?'Use offset':'Set exact time'}</button></div>
        {plan.arrivalMode==='offset'?<label className="planner-inline-field planner-arrival-offset"><span>Arrival lead time</span><input aria-label="Minutes before procedure" type="number" min="0" max="360" value={plan.arrivalOffsetMinutes??60} onChange={e=>setArrivalOffset(Number(e.target.value))}/><span>min before</span></label>:<label className="planner-inline-field"><span>Set arrival</span><input type="time" value={plan.arrivalTime} onChange={e=>setSchedule('arrivalTime',e.target.value)}/></label>}
      </div>
      <label className="planner-label">Procedure location<select aria-label="Procedure location" value={selectedFacility} onChange={e=>chooseFacility(e.target.value)}><option value="mmmc">MMMC — Olney</option><option value="silver-spring">MedStar Endoscopy — Silver Spring</option>{savedFacilities.map(f=><option key={f.id} value={f.id}>{f.name} (saved)</option>)}<option value="custom">Other location (enter below)</option></select></label>
      <div className="planner-facility-summary"><strong>{plan.facilityName?.trim()||'Facility not set'}</strong><span>{plan.facilityAddress?.trim()||'Add a facility address below'}</span></div><details className="planner-settings"><summary><span><strong>Facility details</strong><small>Address, parking, check-in and contact</small></span><span aria-hidden="true">⌄</span></summary><div className="planner-settings-body">      <h3>Facility and arrival instructions</h3>
      <div className="planner-fields">
        <label>Facility name<input value={plan.facilityName??''} onChange={e=>updateFacility('facilityName',e.target.value)} placeholder="Endoscopy center or hospital"/></label>
        <label>Full address<input value={plan.facilityAddress??''} onChange={e=>updateFacility('facilityAddress',e.target.value)} placeholder="Street, city, state, ZIP"/></label>
        <label>Facility phone<input type="tel" value={plan.facilityPhone??''} onChange={e=>updateFacility('facilityPhone',e.target.value)}/></label>
      </div>
      <div className="planner-location-actions"><button type="button" onClick={saveFacility}>{activeSavedId?'Update saved location':'Save location'}</button>{activeSavedId&&<button type="button" onClick={deleteSavedFacility}>Delete saved location</button>}<small role="status">{facilitySaveMessage||'Edits affect this plan immediately. Save to reuse a location on this browser; saved locations are not shared across devices.'}</small></div>
      <label className="planner-label">Parking and entrance<textarea rows={2} value={plan.facilityParking??''} onChange={e=>updateFacility('facilityParking',e.target.value)}/></label>
      <label className="planner-label">Check-in location<textarea rows={2} value={plan.facilityCheckIn??''} onChange={e=>updateFacility('facilityCheckIn',e.target.value)}/></label>
      <label className="planner-label">Additional facility instructions<textarea rows={3} value={plan.facilityInstructions??''} onChange={e=>updateFacility('facilityInstructions',e.target.value)}/></label>
      <p className="planner-muted">These facility details appear only on procedure day. Changing the facility instructions requires reapproval.</p>
</div></details>
      <details className="planner-settings"><summary><span><strong>Preparation and fasting settings</strong><small>Product, diet lead-in and anesthesia policy</small></span><span aria-hidden="true">⌄</span></summary><div className="planner-settings-body"><div className="planner-fields">
      <label>Product<select value={plan.product} onChange={e=>changeProduct(e.target.value as PrepProduct)}>{PREPS.map(p=><option key={p}>{p}</option>)}</select></label>
              <label>Facility anesthesia fasting policy<select value={plan.anesthesiaFastingPolicy??'strict-midnight'} onChange={e=>setPlan(p=>({...p,anesthesiaFastingPolicy:e.target.value as 'strict-midnight'|'custom',anesthesiaClearLiquidCutoff:e.target.value==='strict-midnight'?undefined:p.anesthesiaClearLiquidCutoff,approvedBy:undefined,approvedAt:undefined}))}><option value="strict-midnight">Strict NPO after midnight, with approved exceptions</option><option value="custom">Custom facility cutoff</option></select></label>
        {(plan.anesthesiaFastingPolicy==='custom')?<label>Facility-confirmed other-liquid cutoff<input type="time" value={plan.anesthesiaClearLiquidCutoff??''} onChange={e=>setPlan(p=>({...p,anesthesiaClearLiquidCutoff:e.target.value||undefined,approvedBy:undefined,approvedAt:undefined}))}/></label>:null}
        <label>Low-fiber lead-in (days)<input type="number" min="0" max="14" value={plan.lowFiberDays} onChange={e=>setPlan(p=>({...p,lowFiberDays:Number(e.target.value),approvedBy:undefined,approvedAt:undefined}))}/></label>

      </div></div></details>      <div className="planner-note"><strong>Timing preview, not a prescription</strong><p>For a two-hour second dose ending 4 hours before the procedure, the calculated start is {second?formatTime(second.time):'—'} {second?.dayOffset===-1?'the preceding day':'on procedure day'}. The editable dose schedule is prefilled from this timing policy; the clinician must validate the product, local protocol, arrival constraints, and fasting rules.</p></div>
      <label className="planner-label">Approved morning medication instructions (optional)<textarea rows={2} placeholder="Enter only clinician-confirmed medication instructions; otherwise patient is directed to call the team." value={plan.morningMedicationInstructions??''} onChange={e=>setPlan(p=>({...p,morningMedicationInstructions:e.target.value,approvedBy:undefined,approvedAt:undefined}))}/></label>
      <p className="planner-muted">Default facility policy: strict NPO after midnight for food and other liquids, with exceptions only for the prescribed bowel preparation and specifically approved medications. Other facilities can select a custom cutoff. Any custom policy must be reviewed against the bowel-prep schedule and anesthesia instructions.</p>
      <label className="planner-check"><input type="checkbox" checked={plan.protocolApproved} onChange={e=>setPlan(p=>({...p,protocolApproved:e.target.checked,approvedBy:undefined,approvedAt:undefined}))}/> Institutional product, dosing, timing, and anesthesia protocol independently reviewed</label>
    </div><div className="planner-card">
      <div className="planner-row"><div><h3>2 · Review instructions</h3><p className="planner-muted">{plan.instructions.filter(x=>x.approved).length} of {plan.instructions.length} reviewed</p></div><button className="planner-secondary" onClick={addMedication}>+ Medication</button></div>
      <div className="planner-prep-overview"><strong>{plan.product} · split-dose schedule</strong><p>First: {formatTime(plan.instructions.find(x=>x.id==='prep-first')?.time)} the day before · Second: {formatTime(plan.instructions.find(x=>x.id==='prep-second')?.time)} {plan.instructions.find(x=>x.id==='prep-second')?.offsetDays===-1?'the day before':'on procedure day'}</p><small>Editable planning times; confirm product-specific dosing and anesthesia rules.</small></div>
      <div className="planner-review-toolbar"><button className="primary-button" type="button" onClick={reviewAllInstructions}>✓ Mark all instructions reviewed</button><p>Confirms that you have checked each instruction. You must still approve the full plan separately.</p></div>
      {plan.instructions.filter(item=>item.id!=='prep-first' && item.id!=='prep-second').map(item=><div className="planner-instruction" key={item.id}>
        <button type="button" className="planner-instruction-toggle" aria-expanded={expandedInstructions.includes(item.id)} onClick={()=>toggleInstruction(item.id)}><span><strong>{item.title}</strong><small>{item.approved?'✓ Reviewed':'Needs review'} · {item.offsetDays===0?'Procedure day':item.offsetDays===-1?'Day before':Math.abs(item.offsetDays)+' days before'}</small></span><span aria-hidden="true">{expandedInstructions.includes(item.id)?'−':'+'}</span></button>
        {expandedInstructions.includes(item.id)?<div className="planner-instruction-detail">
        <div className="planner-row"><strong>{item.kind==='diet'?'🥣':item.kind==='medication'?'💊':'🕒'} {item.title}</strong><span className="planner-tag">{item.critical?'Clinical approval':'Patient education'}</span></div>
        <div className="planner-fields"><label>Title<input value={item.title} onChange={e=>editItem(item.id,{title:e.target.value})}/></label>
        <label>Day relative to procedure<input type="number" min="-30" max="7" value={item.offsetDays} onChange={e=>editItem(item.id,{offsetDays:Number(e.target.value)})}/></label>
        <label>Time (optional)<input type="time" value={item.time??''} onChange={e=>editItem(item.id,{time:e.target.value||undefined})}/></label></div>
        <label className="planner-label">Patient-facing instruction<textarea rows={2} value={item.detail} onChange={e=>editItem(item.id,{detail:e.target.value})}/></label>
        {item.critical&&<label className="planner-label">Reason for individualized change / override<textarea rows={2} placeholder="Document reason if departing from the approved default protocol" value={item.overrideReason??''} onChange={e=>editItem(item.id,{overrideReason:e.target.value})}/></label>}
        <label className="planner-check"><input type="checkbox" checked={item.approved} onChange={e=>setPlan(p=>({...p,approvedBy:undefined,approvedAt:undefined,instructions:p.instructions.map(x=>x.id===item.id?{...x,approved:e.target.checked}:x)}))}/> Reviewed and approved for demonstration</label></div>:null}
      </div>)}
      <details className="planner-settings planner-dose-editor"><summary><span><strong>Edit {plan.product} dose times</strong><small>First and second dose start times</small></span><span aria-hidden="true">⌄</span></summary><div className="planner-settings-body"><div className="planner-fields">
      {plan.instructions.filter(item=>item.id==='prep-first'||item.id==='prep-second').map(item=><label key={item.id}>{item.id==='prep-first'?'First dose start':'Second dose start'}<input type="time" value={item.time??''} onChange={e=>editItem(item.id,{time:e.target.value||undefined})}/></label>)}
      </div><p className="planner-muted">Check the calendar day for times crossing midnight. Review the product label and fluid requirements.</p></div></details>
      <button className="primary-button planner-final-approve" onClick={approve}>Approve demonstration plan</button>
      <button className="planner-secondary" onClick={()=>setView('patient')}>Preview patient experience</button><div className="planner-card"><h3>4 · Share guide</h3><p>Copy an encrypted demonstration link that opens the patient view. Do not enter patient identifiers. Anyone holding the link can read it; this prototype has no expiration or revocation.</p><button className="primary-button" type="button" disabled={!ready} onClick={copyPatientLink}>Copy patient guide link</button><button className="planner-secondary" type="button" onClick={()=>window.print()}>Print guide</button><p role="status" className="planner-muted">{shareMessage}</p></div>
      {showIssues&&<p className="planner-error">Review every instruction and confirm the institutional protocol before approval.</p>}
      <p className="planner-muted">This is not a legally valid electronic signature or a persistent clinical approval.</p>
    </div></div>:<div className="planner-patient">
      {shareMessage&&<p role="status" className="planner-error">{shareMessage}</p>}<div className="planner-patient-hero"><span>YOUR COLONOSCOPY GUIDE</span><h3>Feel ready, one day at a time.</h3><p>Procedure: {plan.procedureDate} at {formatTime(plan.procedureTime)} · {plan.product}</p><strong className={ready?'planner-ready':'planner-pending'}>{ready?'Demonstration plan reviewed':'Preview only — clinical instructions not approved'}</strong></div>
      {patientTab==='calendar' && isProcedureDay?<div className="planner-card" aria-label="Procedure location and arrival"><h3>Where to go on procedure day</h3><p><strong>Arrive at {formatTime(plan.arrivalTime)}</strong> for your {formatTime(plan.procedureTime)} procedure.</p><p><strong>{plan.facilityName?.trim()||'Ask your care team for the location'}</strong></p>{plan.facilityAddress?.trim()?<p>{plan.facilityAddress} · <a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(plan.facilityAddress)} target="_blank" rel="noreferrer">Get directions</a></p>:null}{plan.facilityParking?.trim()?<p><strong>Parking and entrance:</strong> {plan.facilityParking}</p>:null}{plan.facilityCheckIn?.trim()?<p><strong>Check-in:</strong> {plan.facilityCheckIn}</p>:null}{plan.facilityInstructions?.trim()?<p><strong>Before you arrive:</strong> {plan.facilityInstructions}</p>:null}{plan.facilityPhone?.trim()?<p><strong>Questions?</strong> {plan.facilityPhone}</p>:null}</div>:null}
      {patientTab==='calendar'?<section className="planner-timing" aria-label="Plan for the selected day">
        <div className="planner-timing-heading"><div><span className="planner-kicker">YOUR PLAN FOR {selectedDayLabel.toUpperCase()}</span><h3>{isProcedureDay?'Today is your colonoscopy':isClearDay?'Clear drinks only today':'Eat low-fiber foods today'}</h3><p>{isProcedureDay?'Follow the times below. They change when your procedure time changes.':isClearDay?'No solid food. Drink only the clear drinks on your list until your stop time.':'Today you may eat the low-fiber foods on your list. The day before your test is different.'}</p></div><span className="planner-procedure-pill">{isProcedureDay?'🏥 '+formatTime(plan.procedureTime):isClearDay?'🥤 DAY BEFORE':'🥣 LOW-FIBER DAY'}</span></div>
        <div className="planner-timing-steps">
          {isLowFiberDay?<article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">🥣</span></div><div className="planner-time-content"><span className="planner-step-label">TODAY'S FOOD PLAN</span><h4>Low-fiber foods</h4><p>You may eat white bread, rice, plain pasta, eggs, and chicken without skin. Do not eat nuts, seeds, popcorn, or raw vegetables.</p><p><strong>Important:</strong> The day before your test, you must switch to clear drinks only. You cannot eat these foods that day.</p><button className="planner-inline-link" onClick={()=>setPatientTab('food')}>See foods for this day →</button></div></article>:null}
          {isClearDay?<><article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">🥤</span><span className="planner-time-line"/></div><div className="planner-time-content"><span className="planner-step-label">ALL DAY · FOOD & DRINK</span><h4>Clear drinks only. No food.</h4><p>You may have water, clear broth, apple juice without pulp, or plain tea. No bread, rice, eggs, soup with pieces, milk, or other solid food.</p><button className="planner-inline-link" onClick={()=>setPatientTab('food')}>See clear drinks for today →</button></div></article><article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">🕔</span></div><div className="planner-time-content"><span className="planner-step-label">EVENING · FIRST BOWEL PREP DOSE</span><h4>{formatTime(plan.instructions.find(x=>x.id==='prep-first')?.time??'17:00')}</h4><p>Take the first dose of your bowel prep as your care team tells you. Use the mixing and drinking steps they gave you.</p>{second?.dayOffset===-1?<div className="planner-step-detail">Your second dose may start at <strong>{startTime} tonight</strong>. This is based on your test time and needs your team's approval.</div>:null}<div className="planner-step-detail">After midnight: no regular drinks. Your prescribed bowel prep and approved medicine may be exceptions.</div></div></article></>:null}
          {isProcedureDay?<><article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">🥤</span><span className="planner-time-line"/></div><div className="planner-time-content"><span className="planner-step-label">SECOND BOWEL PREP DOSE</span><h4>{second?.dayOffset===0?startTime:'Started the night before'}</h4><p>{second?.dayOffset===0?'Wake up before this time. Start your second dose only as your care team tells you.':'For this early test, the planned start time is the night before.'}</p><div className="planner-step-detail">Finish <strong>all</strong> bowel prep by <strong>{deadline?formatTime(deadline.time):'ask your team'}{deadline?.dayOffset===-1?' the night before':''}</strong> — at least 4 hours before your test.</div></div></article><article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">💧</span><span className="planner-time-line"/></div><div className="planner-time-content"><span className="planner-step-label">FOOD & REGULAR DRINKS</span><h4>{strictMidnight?'Nothing after midnight':plan.anesthesiaClearLiquidCutoff?'Stop at '+formatTime(plan.anesthesiaClearLiquidCutoff):'Ask your team'}</h4><p>{strictMidnight?'No food, water, coffee, or other regular drinks after midnight. Your prescribed bowel prep is an exception.':'Follow your clinic’s stop time for other drinks. Do not guess if it is missing.'}</p></div></article><article className="planner-time-step"><div className="planner-time-rail"><span className="planner-time-icon">💊</span></div><div className="planner-time-content"><span className="planner-step-label">MORNING MEDICINE</span><h4>Only if your team says yes</h4><p>{plan.morningMedicationInstructions?.trim()||'Ask which medicines to take. Use a small sip of water only if your team says it is okay.'}</p><button className="planner-inline-link" onClick={()=>setPatientTab('medications')}>See my medicine plan →</button></div></article></>:null}
        </div>
        <button className="planner-timing-expand" aria-expanded={timingExpanded} onClick={()=>setTimingExpanded(x=>!x)}>{timingExpanded?'Hide extra help −':'Why are these rules different? +'}</button>
        {timingExpanded?<div className="planner-timing-explain"><p><strong>Bowel prep</strong> cleans your colon. <strong>Other drinks</strong> have a separate stop time. <strong>Medicine</strong> has its own rules. Do not use one stop time for all three.</p><p>If you are not sure what to do, call your care team.</p></div>:null}
        <p className="planner-timing-footnote">Demo only. Your care team must check the times and approve your plan.</p>
      </section>:null}
      <nav className="planner-tabs" aria-label="Patient guide"><button className={patientTab==='calendar'?'active':''} onClick={()=>setPatientTab('calendar')}>📅 My calendar</button><button className={patientTab==='food'?'active':''} onClick={()=>setPatientTab('food')}>🥣 Food guide</button><button className={patientTab==='medications'?'active':''} onClick={()=>setPatientTab('medications')}>💊 Medications</button></nav>
      {patientTab==='calendar'?<><div className="planner-day-grid">{days.map(day=><button key={day} className={selectedDate===day?'selected':''} onClick={()=>{setSelectedDate(day);setTimingExpanded(false)}}><small>{new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',timeZone:'UTC'})}</small><strong>{Number(day.slice(-2))}</strong><span>{day===plan.procedureDate?'🏥':day===addCalendarDays(plan.procedureDate,-1)?'🥤':'🥣'}</span></button>)}</div><div className="planner-card"><h3>{selectedDate===plan.procedureDate?'Procedure day':selectedDate===addCalendarDays(plan.procedureDate,-1)?'The day before':selectedDate}</h3>{selectedDate===addCalendarDays(plan.procedureDate,-1)?<div className="planner-event"><span>🥤</span><div><strong>What counts as a clear liquid?</strong><p>Water, clear broth without pieces, apple or white grape juice without pulp, clear electrolyte drinks, plain tea or black coffee without milk, and yellow/green gelatin or ice pops. No solid food, milk, smoothies, pulp, or red/purple liquids.</p><button className="planner-secondary" onClick={()=>setPatientTab('food')}>See clear drinks for this day</button></div></div>:null}{selectedDate===secondDate&&second?<div className="planner-event"><span>⏰</span><div><strong>{formatTime(second.time)} · Suggested second-dose start (demo)</strong><p>Allow the full 2-hour drinking window, if approved by your clinician, plus extra time to wake up beforehand.</p></div></div>:null}{selectedDate===deadlineDate&&deadline?<div className="planner-event"><span>✅</span><div><strong>{formatTime(deadline.time)} · Finish all bowel preparation by this time</strong><p>At least 4 hours before your scheduled procedure. This is separate from anesthesia fasting instructions.</p></div></div>:null}{selected.length?selected.map(e=><div className="planner-event" key={e.id}><span>{e.kind==='medication'?'💊':e.kind==='diet'?'🥣':'🕒'}</span><div><strong>{formatTime(e.time)} · {e.title}</strong><p>{e.detail}</p>{!e.approved&&<small>Requires clinician review</small>}</div></div>):null}</div></>:null}
      {patientTab==='food'?<div className="planner-card planner-food-focused"><span className="planner-kicker">FOOD GUIDE FOR {selectedDayLabel.toUpperCase()}</span><h3>{foodMode==='clear'?'🥤 Clear drinks only — NO solid food':'🥣 Low-fiber food days'}</h3><p className="planner-food-warning">{foodMode==='clear'?'Do NOT eat bread, rice, eggs, meat, or any other solid food today. The low-fiber food list is for earlier days only.':'You may eat low-fiber foods today. The day before your test, you must stop eating solid food and have clear drinks only.'}</p><div className="planner-food-grid"><div><h4>✓ You may have</h4><ul>{DIET_GUIDE[foodMode].allowed.map(x=><li key={x}>{x}</li>)}</ul></div><div><h4>✕ Do not have</h4><ul>{DIET_GUIDE[foodMode].avoid.map(x=><li key={x}>{x}</li>)}</ul></div></div><button className="planner-secondary" onClick={()=>setPatientTab('calendar')}>← Back to my day</button></div>:null}
      {patientTab==='medications'?<div className="planner-card"><h3>My medication instructions</h3>{plan.instructions.filter(x=>x.kind==='medication').length?plan.instructions.filter(x=>x.kind==='medication').map(x=><div className="planner-event" key={x.id}><span>💊</span><div><strong>{x.title}</strong><p>{x.detail}</p>{!x.approved&&<small>Pending clinician review</small>}</div></div>):<p>No individualized medication instructions entered. Do not stop or adjust medications based on this demo.</p>}</div>:null}
      <div className="planner-note"><strong>Sharing and safety</strong><p>Public demo: <a href="https://prepmeds.vercel.app" target="_blank" rel="noreferrer">prepmeds.vercel.app</a>. This is not a patient-specific link; do not enter or share protected health information. Secure individualized sharing requires authentication, persistent clinician-approved plans, and expiring patient access links.</p></div><div className="planner-note"><strong>Important</strong><p>This preview is for testing with synthetic information only. It is not a secure patient portal. No email or patient link is generated. Follow instructions provided by your clinical team.</p></div>
    </div>}
  </section>;
}
