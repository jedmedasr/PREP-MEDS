import { NextResponse } from 'next/server';
import { buildKnowledgeView,knowledgeLibraryEnabled } from '../../../lib/knowledge-library';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
  if(!knowledgeLibraryEnabled())return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json(buildKnowledgeView(),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
  if(!knowledgeLibraryEnabled())return NextResponse.json({error:'Not found'},{status:404});
  const headers={'Cache-Control':'no-store'};
  try {
    if(Number(request.headers.get('content-length')??0)>8192)return NextResponse.json({error:'Request too large'},{status:413,headers});
    const text=await request.text();
    if(text.length>8192)return NextResponse.json({error:'Request too large'},{status:413,headers});
    return NextResponse.json(buildKnowledgeView(JSON.parse(text)),{headers});
  }catch{return NextResponse.json({error:'Invalid, stale, unsupported, or unverified synthetic selection'},{status:422,headers});}
}
