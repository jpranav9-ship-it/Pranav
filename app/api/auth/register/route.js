import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { hashPassword, normalizeEmail, createSessionToken, hashSessionToken, setSessionCookie } from '../_helpers';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const plainPassword = String(password || '');

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid work email.' }, { status: 400 });
    }
    if (plainPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('Convex is not configured yet.');
    const convex = new ConvexHttpClient(url);
    const passwordHash = hashPassword(plainPassword);
    const account = await convex.mutation(anyApi.auth.register, { email: normalizedEmail, passwordHash });

    const token = createSessionToken();
    const session = await convex.mutation(anyApi.auth.createSession, {
      accountId: account.accountId,
      sessionTokenHash: hashSessionToken(token),
    });

    const response = NextResponse.json({ email: session.email });
    return setSessionCookie(response, token);
  } catch (error) {
    console.error('Register error:', error);
    const message = error.message?.includes('already exists') ? error.message : 'Could not create your account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
