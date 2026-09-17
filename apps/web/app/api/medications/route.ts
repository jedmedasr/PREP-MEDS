import { NextResponse } from 'next/server';
import { TerminologyIndex } from '@prep-meds/terminology';
import { terminologyDataset } from '@/lib/content';

const index = new TerminologyIndex(terminologyDataset);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (!query) {
    return NextResponse.json({ query, results: [] });
  }

  return NextResponse.json({
    query,
    results: index.search(query, { limit: 8, enableFuzzy: true }),
  });
}
