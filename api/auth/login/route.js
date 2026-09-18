import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { createSessionToken, hashSessionToken, normalizeEmail, setSessionCookie } from '../_helpers';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const plainPassword = String(password || '');
    if (!normalizedEmail || !plainPassword) return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('Convex is not configured yet.');
    const convex = new ConvexHttpClient(url);
    const token = createSessionToken();
    const session = await convex.mutation(anyApi.auth.login, {
      email: normalizedEmail,
      password: plainPassword,
      sessionTokenHash: hashSessionToken(token),
    });

    const response = NextResponse.json({ email: session.email });
    return setSessionCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
}
