import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { getSessionToken, hashSessionToken } from '../_helpers';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const token = getSessionToken(request);
    if (!token) return NextResponse.json({ authenticated: false });
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('Convex is not configured yet.');
    const convex = new ConvexHttpClient(url);
    const session = await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
    return NextResponse.json(session ? { authenticated: true, email: session.email } : { authenticated: false });
  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
