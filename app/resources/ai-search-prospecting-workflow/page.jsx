import '../guide.css';

export const metadata = {
  title: 'AEO Prospecting Workflow: An Illustrative Example | RouteProspect',
  description: 'Follow an illustrative AEO/GEO prospecting workflow from account selection and public evidence to buyer qualification and personalized outreach.',
  alternates: { canonical: '/resources/ai-search-prospecting-workflow' },
};

export default function Page() {
  return <main className="guide-page">
    <nav className="nav"><a className="brand brand-link" href="/"><img src="/routeprospect-mark.svg" alt="RouteProspect" width="38" height="38"/><span>RouteProspect</span></a><div className="nav-actions"><a className="nav-link" href="/resources">Resources</a><a className="nav-link" href="/contact">Contact</a></div></nav>
    <article className="guide">
      <div className="eyebrow">ILLUSTRATIVE WORKFLOW</div>
      <h1>From AI-search signals to a qualified prospect: a worked example</h1>
      <p className="lead">This example demonstrates how an AEO/GEO agency or SDR could research an account and prepare a thoughtful first message. The company and observations below are hypothetical; this is a sample workflow, not a customer case study or a claim of measured results.</p>

      <h2>The scenario</h2>
      <p>An agency wants to find B2B software companies that publish educational content and may care about how buyers discover vendors through AI-assisted search. Rather than building a list based only on company size or job titles, the SDR starts with an account hypothesis.</p>

      <h2>Step 1: Check whether the account fits</h2>
      <p><strong>Hypothetical account:</strong> Northstar Metrics, a B2B analytics software company.</p>
      <ul><li>It sells a product buyers are likely to research before speaking with sales.</li><li>Its website includes educational articles and product comparison content.</li><li>Its marketing team has a named content or organic-growth owner.</li></ul>
      <p>These details would need to be verified on the real company's website and public profiles before they could be used in outreach.</p>

      <h2>Step 2: Separate evidence from assumptions</h2>
      <ul><li><strong>Potential evidence:</strong> A public library of comparison pages and educational articles.</li><li><strong>Potential evidence:</strong> A current job listing for an SEO or content role.</li><li><strong>Hypothesis to test:</strong> The team may be interested in understanding how AI-assisted discovery affects its category.</li><li><strong>Not established:</strong> The brand is missing from AI answers, has lost traffic or has budget allocated to AEO.</li></ul>
      <p>This distinction protects credibility. Do not turn an assumption into a statement of fact.</p>

      <h2>Step 3: Identify a plausible owner</h2>
      <p>Look for the person responsible for organic growth, SEO, content strategy or demand generation. Read their role description and any relevant public statements. If responsibility is unclear, identify two or three plausible owners and prioritize the person whose remit most closely matches the topic.</p>

      <h2>Step 4: Use a transparent qualification score</h2>
      <ul><li>ICP fit: 2/2 — the product category depends on buyer research.</li><li>Content/search investment: 2/2 — assumed for this fictional example and to be verified.</li><li>Relevant trigger: 1/2 — the content footprint suggests relevance, but no immediate trigger is known.</li><li>Buyer ownership: 2/2 — a relevant marketing owner is identifiable in the scenario.</li><li>Evidence quality: 1/2 — some evidence is available, but it needs validation.</li></ul>
      <p><strong>Illustrative total: 8/10.</strong> This score is only an example of how a team might organize research. It is not a statistically validated likelihood-to-buy score.</p>

      <h2>Step 5: Draft the first message</h2>
      <div className="callout">Hi [Name] — I was looking at Northstar Metrics' educational and comparison content. For teams helping buyers evaluate software, AI-assisted search is becoming another discovery surface worth understanding. How is your team currently checking whether Northstar is represented in those answers?</div>
      <p>Before sending, replace the hypothetical account name and content observation with verified details. If you have not checked the company's AI-search presence, ask how it measures visibility instead of claiming a gap exists.</p>

      <h2>Step 6: Decide the next action based on the response</h2>
      <ul><li><strong>Interested:</strong> Offer a short conversation and ask what the team currently measures.</li><li><strong>Already working on it:</strong> Ask what is hardest to operationalize, if they are open to sharing.</li><li><strong>Not the owner:</strong> Ask who handles organic or AI-search discovery, without pressuring them.</li><li><strong>No response:</strong> Follow up once with additional value, then stop if there is no engagement.</li></ul>

      <h2>What this workflow teaches</h2>
      <p>Effective prospecting is a chain of decisions: account fit, observable evidence, likely ownership, a reasonable hypothesis and a message that invites a conversation. The value is not a fabricated certainty about intent; it is a better-informed reason to reach out.</p>

      <h2>Apply the workflow with RouteProspect</h2>
      <p>Use RouteProspect to find relevant marketing prospects and organize your account research. Verify the evidence before using it in a message, and track which signals lead to meaningful conversations.</p>
      <a className="guide-button" href="/">Try RouteProspect →</a>
      <p>For a repeatable agency-level process, read the <a href="/resources/aeo-agency-client-acquisition">AEO Agency Client Acquisition Playbook</a>.</p>
    </article>
  </main>;
}
