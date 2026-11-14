import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.PREPMEDS_SUPABASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.PREPMEDS_PUBLISHABLE_KEY;
  const dashboardToken = process.env.PREPMEDS_OWNER_DASHBOARD_TOKEN;
  if (!baseUrl || !apiKey || !dashboardToken) {
    return NextResponse.json(
      { error: 'Owner dashboard is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = await fetch(`${baseUrl}/rest/v1/rpc/owner_dashboard_snapshot`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/json',
      'Content-Profile': 'prepmeds',
      'Accept-Profile': 'prepmeds',
    },
    body: JSON.stringify({ p_token: dashboardToken }),
    cache: 'no-store',
  });

  const raw = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    body = { error: 'Dashboard data source returned an invalid response.' };
  }

  return NextResponse.json(body, {
    status: response.ok ? 200 : response.status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
