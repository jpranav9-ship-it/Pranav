import '../resources/guide.css';

export const metadata={
  title:'About RouteProspect | AEO, GEO & AI Search Prospect Intelligence',
  description:'RouteProspect is prospect intelligence software for founders, SDRs and sales teams selling AEO, GEO and AI-search products.',
  alternates:{canonical:'/about'}
};

const aboutSchema={
  '@context':'https://schema.org',
  '@type':'AboutPage',
  name:'About RouteProspect',
  url:'https://routeprospect.com/about',
  about:{
    '@type':'Organization',
    name:'RouteProspect',
    url:'https://routeprospect.com/',
    logo:'https://routeprospect.com/routeprospect-mark.svg',
    description:'Prospect intelligence software for teams selling AEO, GEO and AI-search products.'
  }
};

export default function Page(){return <main className="guide-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(aboutSchema)}}/><nav className="nav"><a className="brand brand-link" href="/"><img src="/routeprospect-mark.svg" alt="RouteProspect" width="38" height="38"/><span>RouteProspect</span></a><div className="nav-actions"><a className="nav-link" href="/resources">Resources</a><a className="nav-link" href="/contact">Contact</a></div></nav><article className="guide"><div className="eyebrow">ABOUT ROUTEPROSPECT</div><h1>RouteProspect is prospect intelligence for AEO, GEO & AI-search sales.</h1><p className="lead">RouteProspect helps founders, SDRs, agencies and sales teams find the right marketing people inside target accounts when they sell AEO, GEO or AI-search products.</p><h2>What RouteProspect does</h2><p>RouteProspect researches public web evidence around a target company, identifies relevant marketing prospects and explains why each person may matter. It also provides AEO context, a practical outreach hypothesis and the source evidence behind the research.</p><div className="callout"><strong>RouteProspect workflow:</strong> Company → People → Evidence → Relevance → Outreach.</div><h2>The problem we solve</h2><p>Prospecting for AEO and AI-search products is not simply a matter of finding a marketing title. Responsibility can sit across SEO, organic growth, content, demand generation, digital marketing, product marketing or senior marketing leadership. Sales teams need account context and evidence before they decide who deserves a conversation.</p><h2>What RouteProspect is not</h2><ul><li>Not a general contact database.</li><li>Not a LinkedIn scraper.</li><li>Not an email sequencing platform.</li><li>Not primarily an AI visibility monitoring dashboard.</li></ul><h2>Who RouteProspect is built for</h2><ul><li>AEO and GEO agencies</li><li>AI-search software companies</li><li>Founders and early sales teams</li><li>SDRs and marketers selling AI-search products or services</li></ul><h2>Our focus</h2><p>RouteProspect focuses on the sales research layer between choosing an account and starting a relevant conversation. The goal is simple: help sellers spend less time researching the wrong people and more time having useful conversations with the right ones.</p><a className="guide-button" href="/">Try RouteProspect →</a></article></main>}
