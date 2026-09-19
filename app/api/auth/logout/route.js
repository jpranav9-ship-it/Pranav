import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { clearSessionCookie, getSessionToken, hashSessionToken } from '../_helpers';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const token = getSessionToken(request);
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (token && url) {
      const convex = new ConvexHttpClient(url);
      await convex.mutation(anyApi.auth.logout, { tokenHash: hashSessionToken(token) });
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  return clearSessionCookie(NextResponse.json({ ok: true }));
}
