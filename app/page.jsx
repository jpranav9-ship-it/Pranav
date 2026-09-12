'use client';

import { useEffect, useState } from 'react';
import './styles.css';

const SEARCH_LIMIT = 5;
const CONTACT_EMAIL = 'j.pranav9@gmail.com';

function initials(name) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function buildConnectNote(prospect) { const firstName = prospect.name.split(' ')[0]; return `Hi ${firstName}, came across your work in ${prospect.role}. I’m exploring how AEO and AI search are changing the way marketing teams think about visibility. Thought it would be good to connect.`; }
function contactHref(subject) { return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`; }

export default function Home() {
  const [company, setCompany] = useState('');
  const [prospects, setProspects] = useState([]);
  const [searchedCompany, setSearchedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [accountEmail, setAccountEmail] = useState('');
  const [savedNames, setSavedNames] = useState([]);
  const [savingName, setSavingName] = useState('');
  const [copiedName, setCopiedName] = useState('');

  useEffect(() => {
    fetch('/api/usage').then((response) => response.ok ? response.json() : null).then((data) => { if (data) setSearchesUsed(Math.min(data.searchCount || 0, SEARCH_LIMIT)); }).catch(() => {});
    fetch('/api/auth/me').then((response) => response.ok ? response.json() : null).then((data) => { if (data?.authenticated) setAccountEmail(data.email); }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault(); const name = company.trim(); if (!name || loading) return;
    if (searchesUsed >= SEARCH_LIMIT) { setError('You have used all 5 free searches.'); return; }
    setLoading(true); setError(''); setProspects([]); setSearchedCompany(name);
    try {
      const response = await fetch('/api/prospects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: name }) });
      const data = await response.json();
      if (!response.ok) { if (data.limitReached) setSearchesUsed(SEARCH_LIMIT); throw new Error(data.error || 'Could not research this company.'); }
      setSearchesUsed(SEARCH_LIMIT - (data.remaining ?? 0)); setProspects(data.prospects || []);
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  async function saveProspect(prospect) {
    if (!accountEmail) { window.location.href = '/signin'; return; }
    setSavingName(prospect.name);
    try {
      const response = await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'saveProspect', company: searchedCompany, prospect }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not save prospect.');
      setSavedNames((current) => current.includes(prospect.name) ? current : [...current, prospect.name]);
    } catch (err) { setError(err.message || 'Could not save this prospect.'); }
    finally { setSavingName(''); }
  }

  async function copyConnectNote(prospect) {
    try { await navigator.clipboard.writeText(buildConnectNote(prospect)); setCopiedName(prospect.name); setTimeout(() => setCopiedName(''), 2200); }
    catch { setError('Could not copy the connection note.'); }
  }

  const remaining = SEARCH_LIMIT - searchesUsed;
  const limitReached = searchesUsed >= SEARCH_LIMIT;
  const demoHref = contactHref('Book a demo - RouteProspect');
  const proHref = contactHref('RouteProspect Pro');

  return (
    <main className="page">
      <nav className="nav"><a className="brand brand-link" href="/"><img src="/routeprospect-mark.svg" alt="RouteProspect" width="38" height="38" style={{display:'block',borderRadius:'10px'}} /><span>RouteProspect</span></a><div className="nav-actions"><a className="nav-link" href="/contact">Contact</a><a className="nav-link" href={demoHref}>Book a demo</a>{accountEmail ? <a className="nav-link" href="/dashboard">Workspace</a> : <a className="nav-link signin-link" href="/signin">Sign in</a>}</div></nav>
      <section className="hero">
        <div className="eyebrow">PROSPECT INTELLIGENCE FOR AEO/GEO PRODUCT BUILDERS</div><h1>Find the right marketing people who work on <em>AI search.</em></h1>
        <p className="subhead">Built for founders, sales teams, and marketers selling AEO/GEO products. Enter a target company and discover the marketing people most relevant to AI search — why they matter, and how to approach them.</p>
        <form className="search" onSubmit={handleSubmit}><div className="input-wrap"><label htmlFor="company">Target company</label><input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. HubSpot" /></div><button type="submit" disabled={loading || !company.trim() || limitReached}>{loading ? 'Researching…' : limitReached ? 'Pro available' : 'Find Prospects'} <span>→</span></button></form>
        <div className="hint">Try a real company: <strong>HubSpot</strong></div><div className="usage">{searchesUsed} of {SEARCH_LIMIT} free searches used · {remaining} remaining</div>
      </section>
      {!searchedCompany && !loading && !limitReached && <section className="homepage-content">
        <div className="intro-block"><div className="eyebrow">WHY THIS EXISTS</div><h2>Prospecting for AEO/GEO shouldn't mean reaching the wrong person and waiting for a reply.</h2><p>RouteProspect turns the early part of account research into one workflow: find the marketing people connected to SEO, content, growth, demand generation and AI search, then understand why they could be relevant.</p></div>
        <div className="use-case-grid"><article className="use-case"><span>01</span><h3>AEO/GEO sales prospecting</h3><p>Find marketing leaders who are more likely to care about AI search visibility, citations and changing search behaviour.</p></article><article className="use-case"><span>02</span><h3>Account research</h3><p>See who appears to own the areas around SEO, content, growth, demand generation and product marketing.</p></article><article className="use-case"><span>03</span><h3>Personalized outreach</h3><p>Use public evidence to understand the person and turn it into a relevant conversation angle instead of a generic pitch.</p></article><article className="use-case"><span>04</span><h3>Agency prospecting</h3><p>Identify companies and marketing stakeholders who may have a reason to explore AEO, GEO or AI-search visibility work.</p></article></div>
        <div className="workflow-block"><div><div className="eyebrow">HOW IT WORKS</div><h2>Company → People → AEO context → Customized angle</h2><p>Start with one company. The tool researches public web evidence, identifies relevant marketing prospects and gives you a customized angle for the first conversation.</p></div><div className="workflow-steps"><div><b>01</b><span>Enter a company</span></div><div><b>02</b><span>Find relevant people</span></div><div><b>03</b><span>Understand the AEO fit</span></div><div><b>04</b><span>Get a customized angle</span></div></div></div>
        <div className="pro-card"><div><div className="eyebrow">PRO</div><h2>Need to prospect at scale?</h2><p>Pro is for teams that want more than five searches — including bulk company upload and research, plus the full prospect intelligence workflow.</p></div><div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'10px'}}><span className="pro-pill">PRO</span><a href={proHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'10px 16px',borderRadius:'9px',background:'white',color:'var(--ink)',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Contact for Pro →</a></div></div>
        <div className="aeo-explainer"><div className="eyebrow">FOR AEO/GEO SDRs</div><h2>What should an AEO SDR know before reaching out?</h2><p>The hard part isn't knowing what AEO means. It's knowing <strong>who owns the problem, what signal makes the account relevant, and what to say without sending another generic AEO pitch.</strong></p><div className="faq-grid"><div><h3>01 · Find the right owner</h3><p>AEO can touch SEO, content, growth, demand generation or product marketing. A job title alone doesn't tell you who is most relevant.</p></div><div><h3>02 · Look for an account signal</h3><p>Prioritize evidence around search strategy, content, AI search, organic growth or changes in how the company wants buyers to discover them.</p></div><div><h3>03 · Lead with the problem</h3><p>Don't open with an AEO definition. Use the account and person's context to explain why the conversation may be worth having now.</p></div></div><div className="faq-grid" style={{marginTop:'18px'}}><div><h3>04 · Personalization needs proof</h3><p>A useful outreach angle should come from something you can point to — not a made-up assumption about the prospect.</p></div><div><h3>05 · Know when not to reach out</h3><p>If the evidence doesn't support a clear reason for the person to care, move on instead of forcing a pitch.</p></div><div><h3>06 · The SDR job</h3><p>RouteProspect handles the research layer so the SDR can spend more time deciding who to contact and starting the conversation.</p></div></div></div>
      </section>}
      {loading && <section className="empty"><div className="empty-icon">✦</div><p>Researching {searchedCompany} and finding relevant marketing people…</p></section>}
      {!loading && error && !limitReached && <section className="empty"><div className="empty-icon">!</div><p>{error}</p></section>}
      {!loading && limitReached && <section className="empty"><div className="empty-icon">✓</div><p><strong>You’ve used all 5 free searches.</strong></p><div className="waitlist-box"><h3>Ready for more?</h3><p>Upgrade to Pro for 100 searches/month, bulk company upload and research, and the full prospect intelligence workflow.</p><div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginTop:'18px'}}><a href={proHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:'42px',padding:'0 18px',borderRadius:'9px',background:'var(--ink)',color:'white',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Contact for Pro</a><a href={demoHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:'42px',padding:'0 18px',borderRadius:'9px',background:'white',color:'var(--ink)',border:'1px solid var(--line)',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Book a demo</a></div></div></section>}
      {!loading && !error && !limitReached && searchedCompany && <section className="results"><div className="results-head"><div><div className="eyebrow">PROSPECTS FOUND</div><h2>Who to reach at {searchedCompany}</h2></div><span className="count">{prospects.length} relevant prospects</span></div>{prospects.length > 0 ? <div className="cards">{prospects.map((p, i) => <article className="card" key={`${p.name}-${i}`}><div className="card-top"><div className="avatar">{initials(p.name)}</div><div><h3>{p.name}</h3><p className="role">{p.role}</p></div><span className={`priority p${i}`}>{p.confidence || 'Relevant'}</span></div><div className="detail"><span>WHY THIS PERSON</span><p>{p.why}</p></div><div className="detail"><span>AEO CONTEXT</span><p>{p.relevance}</p></div><div className="angle"><span>OUTREACH ANGLE</span><p>{p.angle}</p></div><div className="card-actions"><a className="source-link" href={p.sourceUrl} target="_blank" rel="noreferrer">Open profile / evidence ↗</a><button className="save-button" type="button" onClick={() => saveProspect(p)} disabled={savingName === p.name}>{savedNames.includes(p.name) ? 'Saved ✓' : savingName === p.name ? 'Saving…' : 'Save prospect'}</button></div><div className="connect-row"><button className="connect-button" type="button" onClick={() => copyConnectNote(p)}>{copiedName === p.name ? 'Connection note copied ✓' : 'Copy connection note'}</button></div></article>)}</div> : <div className="empty"><div className="empty-icon">?</div><p>No well-supported marketing prospects were found. Try the company name again.</p></div>}<p className="disclaimer">Research based on publicly available web evidence · AI-generated summaries should be verified before outreach.</p></section>}
    </main>
  );
}
