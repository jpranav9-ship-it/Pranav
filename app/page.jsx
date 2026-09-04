'use client';

import { useEffect, useState } from 'react';
import './styles.css';

const SEARCH_LIMIT = 5;

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function Home() {
  const [company, setCompany] = useState('');
  const [prospects, setProspects] = useState([]);
  const [searchedCompany, setSearchedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('');
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  useEffect(() => {
    fetch('/api/usage')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data) setSearchesUsed(Math.min(data.searchCount || 0, SEARCH_LIMIT));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = company.trim();
    if (!name || loading) return;

    if (searchesUsed >= SEARCH_LIMIT) {
      setError('You have used all 5 free searches.');
      return;
    }

    setLoading(true);
    setError('');
    setProspects([]);
    setSearchedCompany(name);
    setWaitlistStatus('');

    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: name }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.limitReached) setSearchesUsed(SEARCH_LIMIT);
        throw new Error(data.error || 'Could not research this company.');
      }
      setSearchesUsed(SEARCH_LIMIT - (data.remaining ?? 0));
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleWaitlist(e) {
    e.preventDefault();
    if (joiningWaitlist) return;
    setJoiningWaitlist(true);
    setWaitlistStatus('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not join the waitlist.');
      setWaitlistStatus(data.added ? 'You’re on the list. We’ll let you know when more searches are available.' : 'You’re already on the waitlist.');
      setWaitlistEmail('');
    } catch (err) {
      setWaitlistStatus(err.message || 'Could not join the waitlist.');
    } finally {
      setJoiningWaitlist(false);
    }
  }

  const remaining = SEARCH_LIMIT - searchesUsed;
  const limitReached = searchesUsed >= SEARCH_LIMIT;

  return (
    <main className="page">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">A</span><span>AEO Prospect Intelligence</span></div>
        <span className="beta">MVP</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">PROSPECT INTELLIGENCE FOR AEO/GEO TEAMS</div>
        <h1>Find the right marketing people at your <em>target accounts.</em></h1>
        <p className="subhead">Built for founders, salespeople, and marketers selling AEO/GEO products. Enter a company to find relevant marketing prospects, why they matter, and the outreach angle worth testing.</p>

        <form className="search" onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label htmlFor="company">Target company</label>
            <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. HubSpot" />
          </div>
          <button type="submit" disabled={loading || !company.trim() || limitReached}>
            {loading ? 'Researching…' : limitReached ? 'Limit reached' : 'Find Prospects'} <span>→</span>
          </button>
        </form>
        <div className="hint">Try a real company: <strong>HubSpot</strong></div>
        <div className="usage">{searchesUsed} of {SEARCH_LIMIT} free searches used · {remaining} remaining</div>
      </section>

      {loading && (
        <section className="empty"><div className="empty-icon">✦</div><p>Researching {searchedCompany} and finding relevant marketing people…</p></section>
      )}

      {!loading && error && !limitReached && (
        <section className="empty"><div className="empty-icon">!</div><p>{error}</p></section>
      )}

      {!loading && limitReached && (
        <section className="empty">
          <div className="empty-icon">✓</div>
          <p><strong>You’ve used all 5 free searches.</strong></p>
          <div className="waitlist-box">
            <h3>Want more?</h3>
            <p>Join the waitlist and we’ll let you know when more searches are available.</p>
            <form className="waitlist-form" onSubmit={handleWaitlist}>
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email address"
                required
              />
              <button type="submit" disabled={joiningWaitlist}>{joiningWaitlist ? 'Joining…' : 'Join the waitlist'}</button>
            </form>
            {waitlistStatus && <div className="waitlist-status">{waitlistStatus}</div>}
          </div>
        </section>
      )}

      {!loading && !error && !limitReached && searchedCompany && (
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

      {!searchedCompany && !loading && !limitReached && <div className="empty"><div className="empty-icon">✦</div><p>Your prospect intelligence will appear here.</p></div>}
    </main>
  );
}
