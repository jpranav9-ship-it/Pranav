'use client';

import { useState } from 'react';
import './styles.css';

const prospects = [
  {
    name: 'Sarah Chen',
    role: 'VP, Digital Marketing',
    initials: 'SC',
    why: 'Owns the digital acquisition surface where organic discovery, content performance, and AI search visibility converge.',
    relevance: 'High — AI search is becoming a new discovery layer for buyers. Her remit makes her a likely owner or influencer of an AEO/GEO initiative.',
    angle: '“Sarah, your team already owns how prospects discover the brand through search. We found a few places where AI answers could be steering that discovery elsewhere.”',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Head of Content & SEO',
    initials: 'MR',
    why: 'Directly responsible for the content and search strategy that feeds both traditional search and AI-generated answers.',
    relevance: 'Very high — AEO/GEO sits directly alongside his existing SEO and content responsibilities, making him an ideal technical champion.',
    angle: '“Michael, SEO gets you ranked; AEO increasingly determines whether AI assistants mention you at all. We mapped a few gaps in your current content footprint.”',
  },
  {
    name: 'Priya Nair',
    role: 'Director, Growth Marketing',
    initials: 'PN',
    why: 'Leads growth programs and is accountable for measurable pipeline from digital channels.',
    relevance: 'Medium-high — likely to care about AEO when it can be tied to incremental qualified demand, category visibility, and pipeline.',
    angle: '“Priya, we’re seeing AI answers become an overlooked acquisition channel. I’d love to show you where your brand is currently winning — and losing — those recommendations.”',
  },
];

export default function Home() {
  const [company, setCompany] = useState('Acme');
  const [searched, setSearched] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (company.trim()) setSearched(true);
  }

  return (
    <main className="page">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">A</span><span>AEO Prospect Intelligence</span></div>
        <span className="beta">MVP</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">PROSPECT INTELLIGENCE FOR AEO</div>
        <h1>Find the people who should care about <em>AI search.</em></h1>
        <p className="subhead">Enter a company. Get the marketing prospects, why they matter, and the outreach angle worth testing.</p>

        <form className="search" onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label htmlFor="company">Target company</label>
            <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme" />
          </div>
          <button type="submit">Find Prospects <span>→</span></button>
        </form>
        <div className="hint">Try the example: <strong>Acme</strong></div>
      </section>

      {searched && (
        <section className="results">
          <div className="results-head">
            <div><div className="eyebrow">PROSPECTS FOUND</div><h2>Who to reach at {company}</h2></div>
            <span className="count">3 relevant prospects</span>
          </div>
          <div className="cards">
            {prospects.map((p, i) => (
              <article className="card" key={p.name}>
                <div className="card-top">
                  <div className="avatar">{p.initials}</div>
                  <div><h3>{p.name}</h3><p className="role">{p.role}</p></div>
                  <span className={`priority p${i}`}>{i === 1 ? 'Very relevant' : i === 0 ? 'High relevance' : 'Relevant'}</span>
                </div>
                <div className="detail"><span>WHY THIS PERSON</span><p>{p.why}</p></div>
                <div className="detail"><span>AEO CONTEXT</span><p>{p.relevance}</p></div>
                <div className="angle"><span>OUTREACH ANGLE</span><p>{p.angle}</p></div>
              </article>
            ))}
          </div>
          <p className="disclaimer">Sample data for MVP validation · No external enrichment or integrations are connected yet.</p>
        </section>
      )}

      {!searched && <div className="empty"><div className="empty-icon">✦</div><p>Your prospect intelligence will appear here.</p></div>}
    </main>
  );
}
