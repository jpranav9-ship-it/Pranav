import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { randomUUID } from 'crypto';
import { getSessionToken, hashSessionToken, hashPassword, normalizeEmail, createSessionToken, setSessionCookie, clearSessionCookie } from '../auth/_helpers';
import { researchCompany } from '../../../lib/research';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SEARCH_LIMIT = 5;
const USER_COOKIE = 'aeo_anon_id';

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('Convex is not configured yet.');
  return new ConvexHttpClient(url);
}

function getOrCreateAnonymousId(request) {
  return request.cookies.get(USER_COOKIE)?.value || randomUUID();
}

function withUserCookie(response, anonymousId, isNew) {
  if (isNew) {
    response.cookies.set(USER_COOKIE, anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return response;
}

async function getSignedInAccount(request, convex) {
  const token = getSessionToken(request);
  if (!token) return null;
  try {
    return await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
  } catch {
    return null;
  }
}

async function tavilySearch(query, apiKey) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 6,
      include_answer: false,
      include_raw_content: false,
    }),
  });
  if (!response.ok) throw new Error(`Tavily search failed (${response.status})`);
  return response.json();
}

function cleanResults(data) {
  return (data.results || []).map((item) => ({
    title: item.title || '',
    url: item.url || '',
    content: item.content || '',
  }));
}

async function callGemini(model, prompt, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Gemini request failed (${response.status}): ${errorText.slice(0, 200)}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function generateResearch(prompt, apiKey) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await callGemini(model, prompt, apiKey);
      } catch (error) {
        lastError = error;
        if (error.status !== 503) throw error;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  }

  throw lastError || new Error('Gemini research service is temporarily unavailable.');
}

async function handleProspects(request) {
  let anonymousId = '';
  let reserved = false;

  try {
    const { company } = await request.json();
    const name = String(company || '').trim();

    if (!name) return NextResponse.json({ error: 'Please enter a company name.' }, { status: 400 });

    const tavilyKey = process.env.TAVILY_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!tavilyKey || !geminiKey) {
      return NextResponse.json(
        { error: 'The research service is not configured yet. Please add the API keys in Vercel and redeploy.' },
        { status: 500 },
      );
    }

    anonymousId = getOrCreateAnonymousId(request);
    const isNewUser = !request.cookies.get(USER_COOKIE);
    const convex = getConvexClient();

    const usage = await convex.mutation(anyApi.usage.reserveSearch, { anonymousId });
    if (!usage.allowed) {
      const response = NextResponse.json(
        { error: 'You have used all 5 free searches. Upgrade to Pro for more searches.', limitReached: true, remaining: 0 },
        { status: 429 },
      );
      return withUserCookie(response, anonymousId, isNewUser);
    }

    reserved = true;

    const queries = [
      `"${name}" marketing leadership VP Head Director Growth Product Marketing Demand Generation SEO`,
      `site:linkedin.com/in/ "${name}" marketing growth SEO`,
      `"${name}" company marketing SEO content leadership`,
    ];

    const searches = await Promise.all(queries.map((query) => tavilySearch(query, tavilyKey)));
    const evidence = searches.flatMap(cleanResults);
    const uniqueEvidence = Array.from(
      new Map(evidence.filter((item) => item.url).map((item) => [item.url, item])).values(),
    ).slice(0, 18);

    const research = uniqueEvidence
      .map((item, index) => `SOURCE ${index + 1}\nTitle: ${item.title}\nURL: ${item.url}\nEvidence: ${item.content}`)
      .join('\n\n');

    const prompt = `You are an AEO prospect research assistant.

Target company: ${name}

Use ONLY the public web evidence below. Do not invent people, roles, companies, facts, or URLs. If a person's name or role is not supported by the evidence, do not include that person. Prefer real marketing decision-makers such as VP/Head/Director of Marketing, Growth, Demand Generation, Product Marketing, Content, or SEO.

Return 2-3 prospects if the evidence supports them. If fewer than 2 are supported, return fewer. It is better to return fewer prospects than fabricated ones.

For each prospect return:
- name
- role
- why: one sentence explaining why this person is a relevant marketing prospect
- relevance: one sentence explaining the AEO/GEO relevance of their role
- angle: one concise, customized outreach angle that uses the person's role, the company's context, and a specific signal from the evidence when available. Write it as a practical hypothesis for a salesperson, not a generic AEO pitch and not as an unsupported claim.
- sourceUrl: the single strongest source URL supporting the person's identity/role
- confidence: High, Medium, or Low

Return ONLY valid JSON in this exact shape:
{"prospects":[{"name":"...","role":"...","why":"...","relevance":"...","angle":"...","sourceUrl":"https://...","confidence":"High"}]}

WEB EVIDENCE:
${research}`;

    const geminiData = await generateResearch(prompt, geminiKey);
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('Research response was not valid JSON.');
      parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    }

    const prospects = Array.isArray(parsed.prospects)
      ? parsed.prospects
          .filter((p) => p?.name && p?.role && p?.sourceUrl)
          .slice(0, 3)
          .map((p) => ({
            name: p.name,
            role: p.role,
            why: p.why || 'Relevant marketing responsibility identified from public evidence.',
            relevance: p.relevance || 'Potential relevance to AEO/GEO based on the person’s marketing remit.',
            angle: p.angle || 'Explore how AI search visibility could complement the existing marketing strategy.',
            sourceUrl: p.sourceUrl,
            confidence: p.confidence || 'Medium',
          }))
      : [];

    const signedInAccount = await getSignedInAccount(request, convex);
    if (signedInAccount?.accountId) {
      try {
        await convex.mutation(anyApi.history.saveSearch, {
          accountId: signedInAccount.accountId,
          company: name,
          prospects,
        });
      } catch (historyError) {
        console.error('Could not save search history:', historyError);
      }
    }

    const response = NextResponse.json({
      company: name,
      prospects,
      sourceCount: uniqueEvidence.length,
      remaining: usage.remaining,
    });
    return withUserCookie(response, anonymousId, isNewUser);
  } catch (error) {
    if (reserved && anonymousId && process.env.NEXT_PUBLIC_CONVEX_URL) {
      try {
        await getConvexClient().mutation(anyApi.usage.refundSearch, { anonymousId });
      } catch (refundError) {
        console.error('Could not refund failed search:', refundError);
      }
    }
    console.error('Prospect research error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong while researching the company.' },
      { status: 500 },
    );
  }
}

async function handleBulkProspects(request) {
  try {
    const body = await request.json();
    const companies = Array.isArray(body.companies) ? body.companies : [];
    const cleanCompanies = Array.from(
      new Set(companies.map((company) => String(company || '').trim()).filter(Boolean)),
    ).slice(0, 3);

    if (!cleanCompanies.length) return NextResponse.json({ error: 'Add at least one company.' }, { status: 400 });
    if (companies.length > 3) {
      return NextResponse.json({ error: 'Please research up to 3 companies at a time.' }, { status: 400 });
    }

    const convex = getConvexClient();
    const account = await getSignedInAccount(request, convex);
    if (!account?.accountId) {
      return NextResponse.json({ error: 'Please sign in to use bulk research.', signInRequired: true }, { status: 401 });
    }

    const results = [];
    for (const company of cleanCompanies) {
      try {
        const result = await researchCompany(company);
        results.push({ ...result, status: 'completed' });
        try {
          await convex.mutation(anyApi.history.saveSearch, {
            accountId: account.accountId,
            company,
            prospects: result.prospects,
          });
        } catch (historyError) {
          console.error('Could not save bulk search history:', historyError);
        }
      } catch (error) {
        results.push({
          company,
          prospects: [],
          sourceCount: 0,
          status: 'failed',
          error: error.message || 'Research failed.',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Bulk prospect research error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong while researching the companies.' },
      { status: 500 },
    );
  }
}

async function handleHistory(request) {
  async function getAccountId() {
    const token = getSessionToken(request);
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!token || !url) return null;
    const convex = new ConvexHttpClient(url);
    const session = await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
    return session?.accountId || null;
  }

  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

    const convex = getConvexClient();
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

async function handleHistoryPost(request) {
  try {
    const token = getSessionToken(request);
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!token || !url) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

    const convex = getConvexClient();
    const session = await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
    const accountId = session?.accountId || null;
    if (!accountId) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

    const { action, company, prospect } = await request.json();
    if (action === 'saveProspect') {
      if (!company || !prospect?.name) {
        return NextResponse.json({ error: 'Missing prospect details.' }, { status: 400 });
      }
      const result = await convex.mutation(anyApi.history.saveProspect, { accountId, company, prospect });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown history action.' }, { status: 400 });
  } catch (error) {
    console.error('History write error:', error);
    return NextResponse.json({ error: 'Could not save this prospect.' }, { status: 500 });
  }
}

async function handleUsage(request) {
  try {
    const anonymousId = request.cookies.get(USER_COOKIE)?.value || randomUUID();
    const isNewUser = !request.cookies.get(USER_COOKIE);
    const convex = getConvexClient();
    const usage = await convex.query(anyApi.usage.getUsage, { anonymousId });
    const response = NextResponse.json(usage);
    return withUserCookie(response, anonymousId, isNewUser);
  } catch (error) {
    console.error('Usage lookup error:', error);
    return NextResponse.json({ error: 'Usage tracking is not configured yet.' }, { status: 500 });
  }
}

async function handleWaitlist(request) {
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
    return withUserCookie(response, anonymousId, isNewUser);
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Could not join the waitlist right now. Please try again.' },
      { status: 500 },
    );
  }
}

async function handleLogin(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const plainPassword = String(password || '');
    if (!normalizedEmail || !plainPassword) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    }

    const convex = getConvexClient();
    const token = createSessionToken();
    const session = await convex.mutation(anyApi.auth.login, {
      email: normalizedEmail,
      password: plainPassword,
      sessionTokenHash: hashSessionToken(token),
    });

    return setSessionCookie(NextResponse.json({ email: session.email }), token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
}

async function handleLogout(request) {
  try {
    const token = getSessionToken(request);
    if (token && process.env.NEXT_PUBLIC_CONVEX_URL) {
      const convex = getConvexClient();
      await convex.mutation(anyApi.auth.logout, { tokenHash: hashSessionToken(token) });
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  return clearSessionCookie(NextResponse.json({ ok: true }));
}

async function handleMe(request) {
  try {
    const token = getSessionToken(request);
    if (!token) return NextResponse.json({ authenticated: false });

    const convex = getConvexClient();
    const session = await convex.query(anyApi.auth.getSession, { tokenHash: hashSessionToken(token) });
    return NextResponse.json(session ? { authenticated: true, email: session.email } : { authenticated: false });
  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

async function handleRegister(request) {
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

    const convex = getConvexClient();
    const account = await convex.mutation(anyApi.auth.register, {
      email: normalizedEmail,
      passwordHash: hashPassword(plainPassword),
    });

    const token = createSessionToken();
    await convex.mutation(anyApi.auth.createSession, {
      accountId: account.accountId,
      sessionTokenHash: hashSessionToken(token),
    });

    return setSessionCookie(NextResponse.json({ email: account.email }), token);
  } catch (error) {
    console.error('Register error:', error);
    const message = error.message?.includes('already exists') ? error.message : 'Could not create your account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function routeName(request) {
  return request.nextUrl.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
}

export async function GET(request) {
  const path = routeName(request);
  if (path === 'usage') return handleUsage(request);
  if (path === 'history') return handleHistory(request);
  if (path === 'auth/me') return handleMe(request);
  return NextResponse.json({ error: 'API route not found.' }, { status: 404 });
}

export async function POST(request) {
  const path = routeName(request);
  if (path === 'prospects') return handleProspects(request);
  if (path === 'bulk-prospects') return handleBulkProspects(request);
  if (path === 'history') return handleHistoryPost(request);
  if (path === 'waitlist') return handleWaitlist(request);
  if (path === 'auth/login') return handleLogin(request);
  if (path === 'auth/logout') return handleLogout(request);
  if (path === 'auth/register') return handleRegister(request);
  return NextResponse.json({ error: 'API route not found.' }, { status: 404 });
}
