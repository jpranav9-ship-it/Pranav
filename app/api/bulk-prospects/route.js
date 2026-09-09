import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { getSessionToken, hashSessionToken } from '../auth/_helpers';
import { researchCompany } from '../../../lib/research';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('Convex is not configured yet.');
  return new ConvexHttpClient(url);
}

async function getSignedInAccount(request, convex) {
  const token = getSessionToken(request);
  if (!token) return null;
  try { return await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) }); } catch { return null; }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const companies = Array.isArray(body.companies) ? body.companies : [];
    const cleanCompanies = Array.from(new Set(companies.map((company) => String(company || '').trim()).filter(Boolean))).slice(0, 3);
    if (!cleanCompanies.length) return NextResponse.json({ error: 'Add at least one company.' }, { status: 400 });
    if (companies.length > 3) return NextResponse.json({ error: 'Please research up to 3 companies at a time.' }, { status: 400 });

    const convex = getConvexClient();
    const account = await getSignedInAccount(request, convex);
    if (!account?.accountId) return NextResponse.json({ error: 'Please sign in to use bulk research.', signInRequired: true }, { status: 401 });

    const results = [];
    for (const company of cleanCompanies) {
      try {
        const result = await researchCompany(company);
        results.push({ ...result, status: 'completed' });
        try { await convex.mutation(anyApi.history.saveSearch, { accountId: account.accountId, company, prospects: result.prospects }); } catch (historyError) { console.error('Could not save bulk search history:', historyError); }
      } catch (error) {
        results.push({ company, prospects: [], sourceCount: 0, status: 'failed', error: error.message || 'Research failed.' });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Bulk prospect research error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong while researching the companies.' }, { status: 500 });
  }
}
