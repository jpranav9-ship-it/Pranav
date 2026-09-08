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
  const demoHref = contactHref('Book a demo - AEO Prospect Intelligence');
  const proHref = contactHref('AEO Prospect Intelligence Pro');

  return (
    <main className="page">
      <nav className="nav"><a className="brand brand-link" href="/"><span className="brand-mark">A</span><span>AEO Prospect Intelligence</span></a><div className="nav-actions"><a className="nav-link" href={demoHref}>Book a demo</a>{accountEmail ? <a className="nav-link" href="/dashboard">Workspace</a> : <a className="nav-link signin-link" href="/signin">Sign in</a>}</div></nav>
      <section className="hero">
        <div className="eyebrow">PROSPECT INTELLIGENCE FOR AEO/GEO PRODUCT BUILDERS</div><h1>Find the right marketing people who work on <em>AI search.</em></h1>
        <p className="subhead">Built for founders, sales teams, and marketers selling AEO/GEO products. Enter a target company and discover the marketing people most relevant to AI search — why they matter, and how to approach them.</p>
        <form className="search" onSubmit={handleSubmit}><div className="input-wrap"><label htmlFor="company">Target company</label><input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. HubSpot" /></div><button type="submit" disabled={loading || !company.trim() || limitReached}>{loading ? 'Researching…' : limitReached ? 'Pro available' : 'Find Prospects'} <span>→</span></button></form>
        <div className="hint">Try a real company: <strong>HubSpot</strong></div><div className="usage">{searchesUsed} of {SEARCH_LIMIT} free searches used · {remaining} remaining</div>
      </section>
      {!searchedCompany && !loading && !limitReached && <section className="homepage-content">
        <div className="intro-block"><div className="eyebrow">WHY THIS EXISTS</div><h2>Prospecting for AEO/GEO shouldn't mean opening 20 tabs.</h2><p>AEO Prospect Intelligence turns the early part of account research into one workflow: find the marketing people connected to SEO, content, growth, demand generation and AI search, then understand why they could be relevant.</p></div>
        <div className="use-case-grid"><article className="use-case"><span>01</span><h3>AEO/GEO sales prospecting</h3><p>Find marketing leaders who are more likely to care about AI search visibility, citations and changing search behaviour.</p></article><article className="use-case"><span>02</span><h3>Account research</h3><p>See who appears to own the areas around SEO, content, growth, demand generation and product marketing.</p></article><article className="use-case"><span>03</span><h3>Personalized outreach</h3><p>Use public evidence to understand the person and turn it into a relevant conversation angle instead of a generic pitch.</p></article><article className="use-case"><span>04</span><h3>Agency prospecting</h3><p>Identify companies and marketing stakeholders who may have a reason to explore AEO, GEO or AI-search visibility work.</p></article></div>
        <div className="workflow-block"><div><div className="eyebrow">HOW IT WORKS</div><h2>Company → People → AEO context → Customized angle</h2><p>Start with one company. The tool researches public web evidence, identifies relevant marketing prospects and gives you a customized angle for the first conversation.</p></div><div className="workflow-steps"><div><b>01</b><span>Enter a company</span></div><div><b>02</b><span>Find relevant people</span></div><div><b>03</b><span>Understand the AEO fit</span></div><div><b>04</b><span>Get a customized angle</span></div></div></div>
        <div className="pro-card"><div><div className="eyebrow">PRO</div><h2>Need to prospect at scale?</h2><p>Pro is for teams that want more than five searches — including bulk company upload and research, plus the full prospect intelligence workflow.</p></div><div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'10px'}}><span className="pro-pill">PRO · $29 / MONTH</span><a href={proHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'10px 16px',borderRadius:'9px',background:'white',color:'var(--ink)',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Contact for Pro →</a></div></div>
        <div className="aeo-explainer"><div className="eyebrow">AEO + AI SEARCH</div><h2>What is AEO?</h2><p><strong>Answer Engine Optimization (AEO)</strong> is the practice of improving how a brand's content is understood, surfaced and cited in AI-generated answers. It overlaps with SEO, but the goal increasingly includes being visible inside answers from systems such as ChatGPT, Google AI Overviews and Perplexity.</p><div className="faq-grid"><div><h3>Why does this matter for marketers?</h3><p>AI search can influence how buyers discover, compare and evaluate brands before they ever visit a website.</p></div><div><h3>Who usually owns the conversation?</h3><p>Depending on the company, it can sit across SEO, content, growth, digital marketing, demand generation or product marketing.</p></div><div><h3>What does this tool actually do?</h3><p>It helps AEO/GEO sellers identify the people most likely to be relevant and gives them context for a more informed first conversation.</p></div></div></div>
      </section>}
      {loading && <section className="empty"><div className="empty-icon">✦</div><p>Researching {searchedCompany} and finding relevant marketing people…</p></section>}
      {!loading && error && !limitReached && <section className="empty"><div className="empty-icon">!</div><p>{error}</p></section>}
      {!loading && limitReached && <section className="empty"><div className="empty-icon">✓</div><p><strong>You’ve used all 5 free searches.</strong></p><div className="waitlist-box"><h3>Ready for more?</h3><p>Upgrade to Pro for 100 searches/month, bulk company upload and research, and the full prospect intelligence workflow.</p><div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginTop:'18px'}}><a href={proHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:'42px',padding:'0 18px',borderRadius:'9px',background:'var(--ink)',color:'white',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Contact for Pro</a><a href={demoHref} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:'42px',padding:'0 18px',borderRadius:'9px',background:'white',color:'var(--ink)',border:'1px solid var(--line)',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>Book a demo</a></div></div></section>}
      {!loading && !error && !limitReached && searchedCompany && <section className="results"><div className="results-head"><div><div className="eyebrow">PROSPECTS FOUND</div><h2>Who to reach at {searchedCompany}</h2></div><span className="count">{prospects.length} relevant prospects</span></div>{prospects.length > 0 ? <div className="cards">{prospects.map((p, i) => <article className="card" key={`${p.name}-${i}`}><div className="card-top"><div className="avatar">{initials(p.name)}</div><div><h3>{p.name}</h3><p className="role">{p.role}</p></div><span className={`priority p${i}`}>{p.confidence || 'Relevant'}</span></div><div className="detail"><span>WHY THIS PERSON</span><p>{p.why}</p></div><div className="detail"><span>AEO CONTEXT</span><p>{p.relevance}</p></div><div className="angle"><span>OUTREACH ANGLE</span><p>{p.angle}</p></div><div className="card-actions"><a className="source-link" href={p.sourceUrl} target="_blank" rel="noreferrer">Open profile / evidence ↗</a><button className="save-button" type="button" onClick={() => saveProspect(p)} disabled={savingName === p.name}>{savedNames.includes(p.name) ? 'Saved ✓' : savingName === p.name ? 'Saving…' : 'Save prospect'}</button></div><div className="connect-row"><button className="connect-button" type="button" onClick={() => copyConnectNote(p)}>{copiedName === p.name ? 'Connection note copied ✓' : 'Copy connection note'}</button></div></article>)}</div> : <div className="empty"><div className="empty-icon">?</div><p>No well-supported marketing prospects were found. Try the company name again.</p></div>}<p className="disclaimer">Research based on publicly available web evidence · AI-generated summaries should be verified before outreach.</p></section>}
    </main>
  );
}
