import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

async function tavilySearch(query, apiKey) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 6,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed (${response.status})`);
  }

  return response.json();
}

function cleanResults(data) {
  return (data.results || []).map((item) => ({
    title: item.title || '',
    url: item.url || '',
    content: item.content || '',
  }));
}

export async function POST(request) {
  try {
    const { company } = await request.json();
    const name = String(company || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Please enter a company name.' }, { status: 400 });
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!tavilyKey || !geminiKey) {
      return NextResponse.json(
        { error: 'The research service is not configured yet. Please add the API keys in Vercel and redeploy.' },
        { status: 500 }
      );
    }

    const queries = [
      `"${name}" marketing leadership VP Head Director Growth Product Marketing Demand Generation SEO`,
      `site:linkedin.com/in/ "${name}" marketing growth SEO`,
      `"${name}" company marketing SEO content leadership`,
    ];

    const searches = await Promise.all(queries.map((query) => tavilySearch(query, tavilyKey)));
    const evidence = searches.flatMap(cleanResults);

    const uniqueEvidence = Array.from(
      new Map(evidence.filter((item) => item.url).map((item) => [item.url, item])).values()
    ).slice(0, 18);

    const research = uniqueEvidence
      .map((item, index) => `SOURCE ${index + 1}\nTitle: ${item.title}\nURL: ${item.url}\nEvidence: ${item.content}`)
      .join('\n\n');

    const prompt = `You are an AEO prospect research assistant.\n\nTarget company: ${name}\n\nUse ONLY the public web evidence below. Do not invent people, roles, companies, facts, or URLs. If a person's name or role is not supported by the evidence, do not include that person. Prefer real marketing decision-makers such as VP/Head/Director of Marketing, Growth, Demand Generation, Product Marketing, Content, or SEO.\n\nReturn 2-3 prospects if the evidence supports them. If fewer than 2 are supported, return fewer. It is better to return fewer prospects than fabricated ones.\n\nFor each prospect return:\n- name\n- role\n- why: one sentence explaining why this person is a relevant marketing prospect\n- relevance: one sentence explaining the AEO/GEO relevance of their role\n- angle: one concise outreach angle, grounded in the evidence and clearly framed as a hypothesis rather than a fact\n- sourceUrl: the single strongest source URL supporting the person's identity/role\n- confidence: High, Medium, or Low\n\nReturn ONLY valid JSON in this exact shape:\n{"prospects":[{"name":"...","role":"...","why":"...","relevance":"...","angle":"...","sourceUrl":"https://...","confidence":"High"}]}\n\nWEB EVIDENCE:\n${research}`;

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini request failed (${geminiResponse.status}): ${errorText.slice(0, 200)}`);
    }

    const geminiData = await geminiResponse.json();
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

    return NextResponse.json({ company: name, prospects, sourceCount: uniqueEvidence.length });
  } catch (error) {
    console.error('Prospect research error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong while researching the company.' },
      { status: 500 }
    );
  }
}
