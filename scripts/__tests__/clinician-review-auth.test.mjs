import test from 'node:test';
import assert from 'node:assert/strict';
import {config,seal,unseal,loginRequest,completeLogin,authenticate,requireMutation} from '../clinician-review/auth.mjs';
const secret='a'.repeat(64);
const environment={PREP_MEDS_CLINICIAN_REVIEW:'enabled',PREP_MEDS_REVIEW_ORIGIN:'https://review.example.invalid',PREP_MEDS_REVIEW_SESSION_KEY:secret,
 PREP_MEDS_REVIEW_CLIENT_ID:'fixture-client',PREP_MEDS_REVIEW_CLIENT_SECRET:'fixture-secret',PREP_MEDS_REVIEW_STORE_TOKEN:'fixture-store',PREP_MEDS_CLINICIAN_GITHUB_IDS:'42'};
const c=config(environment);const user={id:42,login:'synthetic-clinician',type:'User'};
const json=x=>new Response(JSON.stringify(x),{status:200});
test('disabled and incompletely configured auth cannot impersonate a clinician',()=>{
 assert.throws(()=>config({}),/FEATURE_DISABLED/);assert.throws(()=>config({...environment,PREP_MEDS_CLINICIAN_GITHUB_IDS:''}),/ALLOWLIST/);
 for(const name of ['PREP_MEDS_REVIEW_CLIENT_SECRET','PREP_MEDS_REVIEW_SESSION_KEY','PREP_MEDS_REVIEW_STORE_TOKEN'])assert.throws(()=>config({...environment,[name]:''}));
 assert.throws(()=>config({...environment,PREP_MEDS_REVIEW_ORIGIN:'http://example.invalid'}),/CONFIGURATION/);
});
test('encrypted cookies are purpose bound, short-lived and authenticated',()=>{
 const now=Date.now(),cookie=seal({purpose:'session',expires:now+1000,token:'secret'},secret);
 assert.equal(cookie.includes('secret'),false);assert.equal(unseal(cookie,secret,'session',now).token,'secret');
 assert.throws(()=>unseal(cookie,secret,'login',now),/AUTHENTICATION/);assert.throws(()=>unseal(cookie,secret,'session',now+1000),/AUTHENTICATION/);
 assert.throws(()=>unseal(cookie.slice(0,-5)+'xxxxx',secret,'session',now));assert.throws(()=>unseal(cookie,'b'.repeat(64),'session',now));
});
test('OAuth requests state and S256 PKCE and never requests repository scope',()=>{
 const {url,cookie}=loginRequest(c);const u=new URL(url);const p=unseal(cookie,secret,'login');
 assert.equal(u.searchParams.get('state'),p.state);assert.equal(u.searchParams.get('code_challenge_method'),'S256');assert.equal(u.searchParams.get('scope'),'read:user');assert.ok(p.verifier.length>=43);
});
test('valid OAuth callback obtains fresh GitHub identity and keeps token out of returned profile',async()=>{
 const {cookie}=loginRequest(c);const state=unseal(cookie,secret,'login').state;const calls=[];
 const fetcher=async(url,opts)=>{calls.push({url,opts});return json(url.includes('access_token')?{access_token:'fixture-token',token_type:'bearer'}:user);};
 const session=await completeLogin(c,cookie,'single-use-code',state,fetcher);
 const p=unseal(session,secret,'session');assert.equal(p.actorId,42);assert.equal(p.token,'fixture-token');
 assert.ok(JSON.parse(calls[0].opts.body).code_verifier);
 const auth=await authenticate(c,session,fetcher);assert.deepEqual(auth.actor,user);assert.equal('token' in auth,false);
});
test('state mismatch never attempts exchange and revoked allowlist/identity cannot approve',async()=>{
 const {cookie}=loginRequest(c);let calls=0;const fetcher=async()=>{calls++;return json(user);};
 await assert.rejects(completeLogin(c,cookie,'code','forged-state',fetcher),/STATE_MISMATCH/);assert.equal(calls,0);
 const session=seal({purpose:'session',token:'fixture',actorId:42,csrf:'csrf',expires:Date.now()+10000},secret);
 await assert.rejects(authenticate({...c,allowedIds:[]},session,fetcher),/AUTHORIZATION/);
 await assert.rejects(authenticate(c,session,async()=>json({...user,id:43})),/AUTHORIZATION/);
 await assert.rejects(authenticate(c,session,async()=>json({...user,type:'Bot'})),/AUTHENTICATION/);
});
test('mutation demands exact origin, JSON and session-bound CSRF',()=>{
 const good={origin:c.origin,'content-type':'application/json','x-csrf-token':'expected'};
 assert.doesNotThrow(()=>requireMutation(new Request(c.origin,{headers:good}),c,'expected'));
 for(const overrides of [{origin:'https://evil.invalid'},{'x-csrf-token':'fake'},{'content-type':'text/plain'}])assert.throws(()=>requireMutation(new Request(c.origin,{headers:{...good,...overrides}}),c,'expected'),/CSRF/);
});
