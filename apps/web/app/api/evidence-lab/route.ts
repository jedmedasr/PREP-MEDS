import { NextResponse } from 'next/server';
import { buildLabView, evidenceLabEnabled } from '../../../lib/evidence-lab';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!evidenceLabEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(buildLabView(), { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  if (!evidenceLabEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (Number(request.headers.get('content-length') ?? 0) > 4096) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  try {
    const text = await request.text();
    if (text.length > 4096) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    return NextResponse.json(buildLabView(JSON.parse(text)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'UNVERIFIED_OR_UNSUPPORTED_SELECTION' }, { status: 422 });
  }
}
