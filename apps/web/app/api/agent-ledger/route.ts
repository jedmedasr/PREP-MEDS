import { handleLedgerRequest } from '../../../../../scripts/supabase-ledger/client.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request): Promise<Response> { return handleLedgerRequest(request); }
