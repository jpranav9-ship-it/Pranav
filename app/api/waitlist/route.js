import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { randomUUID } from 'crypto';

const USER_COOKIE = 'aeo_anon_id';

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('Convex is not configured yet.');
  return new ConvexHttpClient(url);
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const anonymousId = request.cookies.get(USER_COOKIE)?.value || randomUUID();
    const isNewUser = !request.cookies.get(USER_COOKIE);
    const convex = getConvexClient();
    const result = await convex.mutation(anyApi.usage.joinWaitlist, {
      email: normalizedEmail,
      anonymousId,
    });

    const response = NextResponse.json({ added: result.added });
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
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Could not join the waitlist right now. Please try again.' },
      { status: 500 }
    );
  }
}
