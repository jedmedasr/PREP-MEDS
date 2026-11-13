'use client';
import {useEffect,useState} from 'react';
import type {Actor,Group,ReviewStatus} from '../../../../scripts/clinician-review/core.mjs';
type View={actor:Actor;csrf:string;sourceSha:string;auditHead:string|null;groups:{group:Group;review:ReviewStatus}[];inventoryCount:number};
export default function ReviewWorkspace(){
 const [view,setView]=useState<View|null>(null),[error,setError]=useState(''),[query,setQuery]=useState(''),[busy,setBusy]=useState(false),[id,setId]=useState('');
 const [checked,setChecked]=useState(false),[notes,setNotes]=useState(''),[receipt,setReceipt]=useState('');
 async function load(){const r=await fetch('/api/clinical-review',{cache:'no-store'});const v=await r.json();if(!r.ok){setView(null);setError(v.error);return;}setView(v as View);setError('');setChecked(false);}
 useEffect(()=>{void load().catch(()=>setError('REVIEW_UNAVAILABLE'));},[]);
 const rows=view?.groups.filter(x=>(x.group.label+' '+x.group.ingredientIds.join(' ')+' '+x.group.canonicalIds.join(' ')).toLowerCase().includes(query.toLowerCase()))??[];
 const selected=rows.find(x=>x.group.id===id)??rows[0];
 function choose(next:string){setId(next);setChecked(false);setNotes('');setReceipt('');}
 async function act(action:'MARK_REVIEWED'|'REQUEST_CHANGES'|'REVOKE'){
  if(!view||!selected)return;setBusy(true);setError('');
  const {group,review}=selected;
  try{const r=await fetch('/api/clinical-review',{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':view.csrf},body:JSON.stringify({expectedAuditHead:view.auditHead,review:{action,groupId:group.id,expectedMaterialHash:review.materialHash,expectedRevision:group.package.revision,requestId:crypto.randomUUID(),attestation:checked,notes}})});
   const answer=await r.json();if(!r.ok)throw new Error(answer.error);setReceipt(`Audit event ${answer.eventId}; effective state ${answer.effectiveState}. Patient-facing activation remains disabled.`);await load();
  }catch(e){setError(e instanceof Error?e.message:'REVIEW_UNAVAILABLE');setChecked(false);}finally{setBusy(false);}
 }
 return <main style={{maxWidth:1100,margin:'0 auto',padding:24}}>
  <h1>Clinical evidence review</h1><p><strong>Evidence approval is not authorization to activate patient-facing instructions.</strong> No patient information belongs in this workspace or its audit notes.</p>
  {!view&&<p><a href='/api/clinical-review/auth'>Sign in with GitHub as an authorized clinician</a></p>}
  {error&&<p role='alert'>{error}. Missing authentication or configuration never creates an approval.</p>}
  {view&&<><p>Reviewer: <strong>{view.actor.login}</strong> (GitHub ID {view.actor.id}). {view.groups.length} defined formulation groups / {view.inventoryCount} canonical medication identities. Unmapped identities remain unreviewed.</p>
   <label>Search ingredient, formulation, or canonical ID<input value={query} onChange={e=>{setQuery(e.target.value);setChecked(false);}} style={{display:'block',width:'100%',padding:10}}/></label>
   <label>Evidence group<select value={selected?.group.id??''} onChange={e=>choose(e.target.value)} style={{display:'block',width:'100%',padding:10}}>{rows.map(x=><option key={x.group.id} value={x.group.id}>{x.group.label} - {x.review.state}</option>)}</select></label>
   {!selected&&<p>No completed group package is registered for this query. The evidence agent can continue extraction without waiting for review of other groups.</p>}
   {selected&&<section><h2>{selected.group.label}</h2><p><strong>{selected.review.state}</strong> | Evidence revision: {selected.group.package.revision}</p>
    <p>Scope: {Object.values(selected.group.formulation).join(' / ')}. Propagation is restricted to this formulation and these exact canonical IDs: {selected.group.canonicalIds.join(', ')}. A generic medication match does not confirm formulation.</p>
    {selected.review.event&&<p>Last recorded action: {selected.review.event.action} by {selected.review.event.actor.login} at {selected.review.event.reviewedAt}. {selected.review.state==='REVIEW_INVALIDATED'?'The current evidence differs; the old approval is historical only.':''}</p>}
    {selected.group.package.unresolved.length>0&&<div><h3>Incomplete evidence</h3>{selected.group.package.unresolved.map(x=><p key={x}>{x}</p>)}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>{selected.group.package.recommendations.map(r=><article key={r.id} style={{border:'1px solid #999',padding:16}}>
     <h3>{r.source.publisher} - {r.source.publication}</h3><p>{r.source.title} ({r.source.version})</p>
     <p><a href={r.source.deepLink??r.source.url} target='_blank' rel='noopener noreferrer'>{r.source.locator} - open primary source</a></p>
     {r.source.deepLink===null&&<p>Deep link unavailable: {r.source.deepLinkUnavailableReason}</p>}
     <p><strong>Scope:</strong> {r.scenario}</p><p><strong>Interruption:</strong> {r.interruption}</p><p><strong>Resumption:</strong> {r.resumption}</p><p><strong>Renal thresholds:</strong> {r.renal}</p><p><strong>Bridging:</strong> {r.bridging}</p><p><strong>Exceptions:</strong> {r.exceptions}</p>
     <p><strong>Supporting passage:</strong> {r.source.passage}</p><p><strong>Footnotes/context:</strong> {r.source.footnotes}</p><p>Strength: {r.strength}; certainty: {r.certainty}.</p>
    </article>)}</div>
    <h3>Differences between sources</h3>{selected.group.package.conflicts.map(x=><p key={x}>{x}</p>)}
    <p>No recommendation is automatically selected or synthesized into a universal interruption interval.</p>
    <label><input type='checkbox' checked={checked} onChange={e=>setChecked(e.target.checked)} disabled={busy||(selected.group.package.state!=='READY_FOR_CLINICIAN_REVIEW'||selected.review.state==='CLINICALLY_REVIEWED')}/> I independently checked the linked primary passages, medication/formulation identity, canonical mappings, applicability, timing, renal boundaries, exceptions, and recorded conflicts for this exact evidence revision.</label>
    <label style={{display:'block',marginTop:16}}>Review notes or requested corrections (no patient information)<textarea value={notes} maxLength={2000} onChange={e=>setNotes(e.target.value)} rows={4} style={{display:'block',width:'100%'}}/></label>
    <p>Material corrections must be submitted as a new evidence revision, not hidden in an approval note. Request changes to return this package for correction; unrelated extraction continues.</p>
    <button disabled={busy||!checked||(selected.group.package.state!=='READY_FOR_CLINICIAN_REVIEW'||selected.review.state==='CLINICALLY_REVIEWED')} onClick={()=>void act('MARK_REVIEWED')}>Mark Reviewed</button>{' '}
    <button disabled={busy||!notes.trim()} onClick={()=>void act('REQUEST_CHANGES')}>Request changes</button>{' '}
    <button disabled={busy||!notes.trim()||!selected.review.event} onClick={()=>void act('REVOKE')}>Revoke evidence review</button>
   </section>}
   <p><button onClick={()=>{void fetch('/api/clinical-review/auth',{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':view.csrf},body:'{}'}).then(()=>{setView(null);setChecked(false);});}}>Sign out</button></p>
  </>}{receipt&&<p role='status'>{receipt}</p>}
 </main>;
}
