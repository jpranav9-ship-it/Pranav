'use client';

import { useState } from 'react';
import './styles.css';

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function Home() {
  const [company, setCompany] = useState('');
  const [prospects, setProspects] = useState([]);
  const [searchedCompany, setSearchedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const name = company.trim();
    if (!name || loading) return;

    setLoading(true);
    setError('');
    setProspects([]);
    setSearchedCompany(name);

    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not research this company.');
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. HubSpot" />
          </div>
          <button type="submit" disabled={loading || !company.trim()}>
            {loading ? 'Researching…' : 'Find Prospects'} <span>→</span>
          </button>
        </form>
        <div className="hint">Try a real company: <strong>HubSpot</strong></div>
      </section>

      {loading && (
        <section className="empty"><div className="empty-icon">✦</div><p>Researching {searchedCompany} and finding relevant marketing people…</p></section>
      )}

      {!loading && error && (
        <section className="empty"><div className="empty-icon">!</div><p>{error}</p></section>
      )}

      {!loading && !error && searchedCompany && (
        <section className="results">
          <div className="results-head">
            <div><div className="eyebrow">PROSPECTS FOUND</div><h2>Who to reach at {searchedCompany}</h2></div>
            <span className="count">{prospects.length} relevant prospects</span>
          </div>

          {prospects.length > 0 ? (
            <div className="cards">
              {prospects.map((p, i) => (
                <article className="card" key={`${p.name}-${i}`}>
                  <div className="card-top">
                    <div className="avatar">{initials(p.name)}</div>
                    <div><h3>{p.name}</h3><p className="role">{p.role}</p></div>
                    <span className={`priority p${i}`}>{p.confidence || 'Relevant'}</span>
                  </div>
                  <div className="detail"><span>WHY THIS PERSON</span><p>{p.why}</p></div>
                  <div className="detail"><span>AEO CONTEXT</span><p>{p.relevance}</p></div>
                  <div className="angle"><span>OUTREACH ANGLE</span><p>{p.angle}</p></div>
                  <div className="source"><span>SOURCE</span> <a href={p.sourceUrl} target="_blank" rel="noreferrer">View evidence ↗</a></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty"><div className="empty-icon">?</div><p>No well-supported marketing prospects were found. Try the company name again.</p></div>
          )}
          <p className="disclaimer">Research based on publicly available web evidence · AI-generated summaries should be verified before outreach.</p>
        </section>
      )}

      {!searchedCompany && !loading && <div className="empty"><div className="empty-icon">✦</div><p>Your prospect intelligence will appear here.</p></div>}
    </main>
  );
}
