import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { randomUUID } from 'crypto';

const USER_COOKIE = 'aeo_anon_id';

export async function GET(request) {
  try {
    const anonymousId = request.cookies.get(USER_COOKIE)?.value || randomUUID();
    const isNewUser = !request.cookies.get(USER_COOKIE);
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('Convex is not configured yet.');

    const convex = new ConvexHttpClient(url);
    const usage = await convex.query(anyApi.usage.getUsage, { anonymousId });
    const response = NextResponse.json(usage);

    if (isNewUser) {
      response.cookies.set(USER_COOKIE, anonymousId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    console.error('Usage lookup error:', error);
    return NextResponse.json({ error: 'Usage tracking is not configured yet.' }, { status: 500 });
  }
}
