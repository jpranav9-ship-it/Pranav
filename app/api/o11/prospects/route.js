import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { researchCompany } from '../../../../lib/research';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(request) {
  const expected = process.env.ROUTEPROSPECT_API_KEY;
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!expected || !match) return false;

  const providedBuffer = Buffer.from(match[1]);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function POST(request) {
  if (!process.env.ROUTEPROSPECT_API_KEY) {
    return NextResponse.json(
      { error: 'RouteProspect API is not configured yet.' },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'A valid bearer token is required.' },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const company = typeof body?.company === 'string' ? body.company.trim() : '';
  if (!company) {
    return NextResponse.json(
      { error: 'The company field is required.' },
      { status: 400 },
    );
  }
  if (company.length > 160) {
    return NextResponse.json(
      { error: 'Company name must be 160 characters or fewer.' },
      { status: 400 },
    );
  }

  try {
    const result = await researchCompany(company);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('RouteProspect API error:', error);
    return NextResponse.json(
      { error: 'Prospect research failed. Please try again later.' },
      { status: 502 },
    );
  }
}
