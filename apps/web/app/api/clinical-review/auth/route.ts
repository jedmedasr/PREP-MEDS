import {NextRequest,NextResponse} from 'next/server';
import {config,loginRequest,completeLogin,authenticate,requireMutation,SESSION_COOKIE,LOGIN_COOKIE} from '../../../../../../scripts/clinician-review/auth.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const cookieOptions={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'};
export async function GET(request:NextRequest) {
 try {
  const c=config();
  if(request.nextUrl.searchParams.has('code')||request.nextUrl.searchParams.has('error')) {
   const value=await completeLogin(c,request.cookies.get(LOGIN_COOKIE)?.value,request.nextUrl.searchParams.get('code'),request.nextUrl.searchParams.get('state'));
   const response=NextResponse.redirect(c.origin+'/clinical-review');
   response.cookies.set(SESSION_COOKIE,value,{...cookieOptions,maxAge:1800});
   response.cookies.set(LOGIN_COOKIE,'',{...cookieOptions,maxAge:0});
   response.headers.set('Cache-Control','no-store');response.headers.set('Referrer-Policy','no-referrer');return response;
  }
  const login=loginRequest(c);const response=NextResponse.redirect(login.url);
  response.cookies.set(LOGIN_COOKIE,login.cookie,{...cookieOptions,maxAge:600});response.headers.set('Cache-Control','no-store');return response;
 }catch(error){const message=error instanceof Error?error.message:'AUTHENTICATION_REQUIRED';return NextResponse.json({error:/^[A-Z_]+$/.test(message)?message:'AUTHENTICATION_REQUIRED'},{status:403,headers:{'Cache-Control':'no-store'}});}
}
export async function POST(request:NextRequest) {
 try {const c=config();const session=await authenticate(c,request.cookies.get(SESSION_COOKIE)?.value);requireMutation(request,c,session.csrf);
  const r=NextResponse.json({signedOut:true},{headers:{'Cache-Control':'no-store'}});r.cookies.set(SESSION_COOKIE,'',{...cookieOptions,maxAge:0});return r;
 }catch{return NextResponse.json({error:'AUTHENTICATION_REQUIRED'},{status:403});}
}
