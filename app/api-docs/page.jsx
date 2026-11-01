export const metadata = {
  title: 'RouteProspect API Documentation',
  description: 'API documentation for RouteProspect prospect intelligence for AEO/GEO product builders, GTM teams, and marketers.',
  alternates: { canonical: 'https://routeprospect.com/api-docs' },
};

const codeStyle = {
  display: 'block',
  overflowX: 'auto',
  padding: '16px',
  borderRadius: '10px',
  background: '#17211e',
  color: '#f2f5f3',
  fontSize: '13px',
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};

export default function ApiDocsPage() {
  return (
    <main style={{ maxWidth: '850px', margin: '0 auto', padding: '56px 24px 88px', color: '#17211e', lineHeight: 1.7 }}>
      <p style={{ color: '#267456', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        RouteProspect Developer Docs
      </p>
      <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.12, margin: '12px 0 18px' }}>
        Prospect intelligence for AEO/GEO teams
      </h1>
      <p>
        RouteProspect helps AEO/GEO product builders, GTM professionals, and marketers research a target company and identify relevant marketing prospects, with evidence and context for personalized outreach.
      </p>

      <h2 style={{ marginTop: '36px' }}>Endpoint</h2>
      <p><strong>POST</strong> <code>https://routeprospect.com/api/o11/prospects</code></p>
      <p>Returns up to three relevant prospects supported by public web evidence. The endpoint requires a bearer token.</p>

      <h2 style={{ marginTop: '28px' }}>Authentication</h2>
      <p>Send your API key in the Authorization header. Never put the key in a URL or publish it in client-side code.</p>
      <pre style={codeStyle}>{'Authorization: Bearer YOUR_API_KEY'}</pre>

      <h2 style={{ marginTop: '28px' }}>Request body</h2>
      <pre style={codeStyle}>{JSON.stringify({ company: 'HubSpot' }, null, 2)}</pre>
      <p><code>company</code> is required and must be a string of 160 characters or fewer.</p>

      <h2 style={{ marginTop: '28px' }}>Example request</h2>
      <pre style={codeStyle}>{'curl -X POST https://routeprospect.com/api/o11/prospects \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"company":"HubSpot"}\''}</pre>

      <h2 style={{ marginTop: '28px' }}>Example response</h2>
      <pre style={codeStyle}>{JSON.stringify({
        company: 'HubSpot',
        prospects: [
          {
            name: 'Example Person',
            role: 'Example marketing role',
            why: 'Why the person may be relevant to the target company.',
            relevance: 'How the role may relate to AEO/GEO.',
            angle: 'A suggested, evidence-informed outreach angle.',
            sourceUrl: 'https://example.com/public-source',
            confidence: 'Medium',
          },
        ],
        sourceCount: 12,
      }, null, 2)}</pre>
      <p>The response above is illustrative; actual people and results depend on available public evidence.</p>

      <h2 style={{ marginTop: '28px' }}>Responses and errors</h2>
      <ul>
        <li><code>200</code> — research completed; response includes <code>company</code>, <code>prospects</code>, and <code>sourceCount</code>.</li>
        <li><code>400</code> — invalid JSON or missing/invalid company name.</li>
        <li><code>401</code> — bearer token is missing or invalid.</li>
        <li><code>502</code> — prospect research could not be completed.</li>
        <li><code>503</code> — API key or research service configuration is missing.</li>
      </ul>

      <h2 style={{ marginTop: '28px' }}>Data quality</h2>
      <p>Results are generated from public web evidence and AI-assisted summaries. Verify a person's role and source before outreach. RouteProspect is designed for AEO/GEO product builders, GTM teams, and marketers, not as a general-purpose contact database.</p>

      <p style={{ marginTop: '40px', fontSize: '13px', color: '#64716b' }}>
        Website: <a href="https://routeprospect.com" style={{ color: '#267456' }}>routeprospect.com</a>
      </p>
    </main>
  );
}
