import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
export const SESSION_COOKIE = '__Host-prep-review-session';
export const LOGIN_COOKIE = '__Host-prep-review-login';
export function config(env = process.env) {
  if (env.PREP_MEDS_CLINICIAN_REVIEW !== 'enabled') throw new Error('FEATURE_DISABLED');
  const origin = new URL(env.PREP_MEDS_REVIEW_ORIGIN ?? '');
  if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('REVIEW_CONFIGURATION_REQUIRED');
  const secret = env.PREP_MEDS_REVIEW_SESSION_KEY ?? '';
  if (!/^[a-f0-9]{64}$/.test(secret) || !env.PREP_MEDS_REVIEW_CLIENT_ID || !env.PREP_MEDS_REVIEW_CLIENT_SECRET || !env.PREP_MEDS_REVIEW_STORE_TOKEN) throw new Error('REVIEW_CONFIGURATION_REQUIRED');
  const allowedIds = (env.PREP_MEDS_CLINICIAN_GITHUB_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (!allowedIds.length || allowedIds.some(x => !/^[1-9]\d*$/.test(x))) throw new Error('CLINICIAN_ALLOWLIST_REQUIRED');
  return { origin: origin.origin, secret, allowedIds, clientId: env.PREP_MEDS_REVIEW_CLIENT_ID,
    clientSecret: env.PREP_MEDS_REVIEW_CLIENT_SECRET, storeToken: env.PREP_MEDS_REVIEW_STORE_TOKEN,
    auditKey: createHmac('sha256', Buffer.from(secret,'hex')).update('prep-meds-clinical-review-audit-v1').digest('hex') };
}
export function seal(value, secret) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', Buffer.from(secret,'hex'), iv);
  const bytes = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString('base64url');
}
export function unseal(value, secret, purpose, now = Date.now()) {
  try {
    if (typeof value !== 'string' || value.length > 6000) throw new Error();
    const bytes=Buffer.from(value,'base64url'); const cipher=createDecipheriv('aes-256-gcm',Buffer.from(secret,'hex'),bytes.subarray(0,12));
    cipher.setAuthTag(bytes.subarray(12,28));
    const p=JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString());
    if (p.purpose !== purpose || !Number.isFinite(p.expires) || p.expires <= now || p.expires > now + 31*60000) throw new Error();
    return p;
  } catch { throw new Error('AUTHENTICATION_REQUIRED'); }
}
export const random = () => randomBytes(32).toString('base64url');
export function loginRequest(c, now = Date.now()) {
  const state=random(),verifier=random();
  const query=new URLSearchParams({client_id:c.clientId,redirect_uri:c.origin+'/api/clinical-review/auth',scope:'read:user',state,
    code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',allow_signup:'false'});
  return {url:'https://github.com/login/oauth/authorize?'+query, cookie:seal({purpose:'login',state,verifier,expires:now+10*60000},c.secret)};
}
export async function boundedJSON(response) {
  if (!response.ok) throw new Error('GITHUB_HTTP_'+response.status);
  const reader=response.body?.getReader(); if(!reader)throw new Error('GITHUB_RESPONSE_INVALID');
  const chunks=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>2*1024*1024){await reader.cancel();throw new Error('GITHUB_RESPONSE_TOO_LARGE');}chunks.push(value);}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function githubUser(token, fetchImpl=fetch) {
  const response=await fetchImpl('https://api.github.com/user',{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  const u=await boundedJSON(response);
  if(u.type!=='User'||!Number.isSafeInteger(u.id)||typeof u.login!=='string')throw new Error('AUTHENTICATION_REQUIRED');
  return {id:u.id,login:u.login,type:u.type};
}
export async function completeLogin(c, cookie, code, state, fetchImpl=fetch, now=Date.now()) {
  const login=unseal(cookie,c.secret,'login',now);
  if(!code||typeof state!=='string'||state!==login.state)throw new Error('OAUTH_STATE_MISMATCH');
  const response=await fetchImpl('https://github.com/login/oauth/access_token',{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),
    headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:c.clientId,client_secret:c.clientSecret,code,
      redirect_uri:c.origin+'/api/clinical-review/auth',code_verifier:login.verifier})});
  const result=await boundedJSON(response);
  if(!result.access_token||result.token_type?.toLowerCase()!=='bearer')throw new Error('OAUTH_TOKEN_REJECTED');
  const actor=await githubUser(result.access_token,fetchImpl);
  if(!c.allowedIds.includes(String(actor.id)))throw new Error('CLINICIAN_AUTHORIZATION_REQUIRED');
  const expiry=Math.min(now+30*60000,now+(Number(result.expires_in)||1800)*1000);
  return seal({purpose:'session',token:result.access_token,actorId:actor.id,csrf:random(),expires:expiry},c.secret);
}
export async function authenticate(c, cookie, fetchImpl=fetch) {
  const session=unseal(cookie,c.secret,'session');
  const actor=await githubUser(session.token,fetchImpl);
  if(actor.id!==session.actorId||!c.allowedIds.includes(String(actor.id)))throw new Error('CLINICIAN_AUTHORIZATION_REQUIRED');
  return {actor,csrf:session.csrf};
}
export function requireMutation(request,c,csrf) {
  if(request.headers.get('origin')!==c.origin||request.headers.get('x-csrf-token')!==csrf||
     request.headers.get('content-type')?.split(';')[0]!=='application/json')throw new Error('CSRF_REJECTED');
}
