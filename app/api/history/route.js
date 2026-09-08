import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { getSessionToken, hashSessionToken } from '../auth/_helpers';

export const runtime = 'nodejs';

async function getAccountId(request) {
  const token = getSessionToken(request);
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!token || !url) return null;
  const convex = new ConvexHttpClient(url);
  const session = await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
  return session?.accountId || null;
}

export async function GET(request) {
  try {
    const accountId = await getAccountId(request);
    if (!accountId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const [searches, savedProspects] = await Promise.all([
      convex.query(anyApi.history.listSearches, { accountId }),
      convex.query(anyApi.history.listSavedProspects, { accountId }),
    ]);
    return NextResponse.json({ searches, savedProspects });
  } catch (error) {
    console.error('History lookup error:', error);
    return NextResponse.json({ error: 'Could not load your workspace.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const accountId = await getAccountId(request);
    if (!accountId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    const { action, company, prospect } = await request.json();
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    if (action === 'saveProspect') {
      if (!company || !prospect?.name) return NextResponse.json({ error: 'Missing prospect details.' }, { status: 400 });
      const result = await convex.mutation(anyApi.history.saveProspect, { accountId, company, prospect });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown history action.' }, { status: 400 });
  } catch (error) {
    console.error('History write error:', error);
    return NextResponse.json({ error: 'Could not save this prospect.' }, { status: 500 });
  }
}
