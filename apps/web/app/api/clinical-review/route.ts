import {NextRequest,NextResponse} from 'next/server';
import {terminologyDataset} from '../../../lib/content';
import {config,authenticate,requireMutation,SESSION_COOKIE} from '../../../../../scripts/clinician-review/auth.mjs';
import {ReviewStore} from '../../../../../scripts/clinician-review/store.mjs';
import {reviewStatus,canonicalReviewMap,type ReviewRequest} from '../../../../../scripts/clinician-review/core.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
function failure(error:unknown) {
 const m=error instanceof Error?error.message:'REVIEW_UNAVAILABLE';
 const code=/^[A-Z_]+(?::[A-Za-z._-]+)?$/.test(m)?m:'REVIEW_UNAVAILABLE';
 const status=code==='FEATURE_DISABLED'?404:code.includes('AUTHENTICATION')?401:code.includes('AUTHORIZATION')||code==='CSRF_REJECTED'?403:code.includes('STALE')||code.includes('MOVED')?409:503;
 return NextResponse.json({error:code,patientFacingAuthorized:false},{status,headers});
}
export async function GET(request:NextRequest) {
 try {
  const c=config();const auth=await authenticate(c,request.cookies.get(SESSION_COOKIE)?.value);
  const store=new ReviewStore(c.storeToken,c.auditKey,terminologyDataset.medications);const snapshot=await store.read();
  return NextResponse.json({actor:auth.actor,csrf:auth.csrf,sourceSha:snapshot.sourceSha,auditHead:snapshot.head,
   groups:snapshot.catalog.groups.map(group=>({group,review:reviewStatus(group,snapshot.ledger)})),
   canonicalMap:canonicalReviewMap(snapshot.catalog,terminologyDataset.medications,snapshot.ledger),
   inventoryCount:terminologyDataset.medications.length,patientFacingAuthorized:false},{headers});
 }catch(e){return failure(e);}
}
export async function POST(request:NextRequest) {
 try {
  const c=config();const auth=await authenticate(c,request.cookies.get(SESSION_COOKIE)?.value);requireMutation(request,c,auth.csrf);
  // Bounded streaming read even if Content-Length is omitted or false.
  const reader=request.body?.getReader();if(!reader)throw new Error('INVALID_REQUEST');let total=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8192){await reader.cancel();return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});}chunks.push(value);}
  const raw=JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string,unknown>;
  if(!raw||Array.isArray(raw)||Object.keys(raw).some(k=>!['review','expectedAuditHead'].includes(k))||
   (raw.expectedAuditHead!==null&&(typeof raw.expectedAuditHead!=='string'||!/^[a-f0-9]{40}$/.test(raw.expectedAuditHead))))throw new Error('UNTRUSTED_REVIEW_FIELDS');
  const store=new ReviewStore(c.storeToken,c.auditKey,terminologyDataset.medications);
  const result=await store.review(auth.actor,c.allowedIds,raw.review as ReviewRequest,raw.expectedAuditHead as string|null);
  return NextResponse.json({eventId:result.event.eventId,auditHead:result.head,commitUrl:result.commitUrl??null,
   effectiveState:result.effectiveState??'REPLAYED_AUDIT_EVENT',patientFacingAuthorized:false},{headers});
 }catch(e){return failure(e);}
}
