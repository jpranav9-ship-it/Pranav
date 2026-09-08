'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [searches, setSearches] = useState([]);
  const [savedProspects, setSavedProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/usage').then((r) => r.json()),
      fetch('/api/history').then((r) => r.json()),
    ]).then(([auth, usage, history]) => {
      if (!auth.authenticated) {
        router.replace('/signin');
        return;
      }
      setEmail(auth.email || '');
      setSearchCount(Math.min(usage.searchCount || 0, 5));
      setSearches(history.searches || []);
      setSavedProspects(history.savedProspects || []);
      setLoading(false);
    }).catch(() => router.replace('/signin'));
  }, [router]);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (loading) return <main className="auth-page"><div className="empty">Loading your workspace…</div></main>;

  return (
    <main className="auth-page">
      <nav className="nav">
        <a className="brand brand-link" href="/"><span className="brand-mark">A</span><span>AEO Prospect Intelligence</span></a>
        <div className="nav-actions"><a className="nav-link" href="/">Search</a><button className="dashboard-signout" onClick={signOut}>Sign out</button></div>
      </nav>

      <section className="dashboard">
        <div className="eyebrow">YOUR WORKSPACE</div>
        <h1>Ready to prospect.</h1>
        <p className="dashboard-sub">{email}</p>

        <div className="dashboard-grid">
          <div className="dashboard-card"><span>FREE SEARCHES</span><strong>{searchCount} / 5</strong><p>Searches used on this browser.</p></div>
          <div className="dashboard-card"><span>SAVED PROSPECTS</span><strong>{savedProspects.length}</strong><p>People you marked to come back to.</p></div>
        </div>

        <div className="dashboard-section">
          <div className="section-heading"><div><div className="eyebrow">SAVED</div><h2>Prospects to reach out to</h2></div><span>{savedProspects.length} saved</span></div>
          {savedProspects.length > 0 ? (
            <div className="saved-list">
              {savedProspects.map((item) => (
                <article className="saved-item" key={item._id}>
                  <div><strong>{item.prospect.name}</strong><span>{item.prospect.role} · {item.company}</span></div>
                  <div className="saved-actions"><a href={item.prospect.sourceUrl} target="_blank" rel="noreferrer">LinkedIn / source ↗</a></div>
                </article>
              ))}
            </div>
          ) : <div className="dashboard-empty">Search for a company and save the people you want to approach.</div>}
        </div>

        <div className="dashboard-section">
          <div className="section-heading"><div><div className="eyebrow">HISTORY</div><h2>Recent company research</h2></div><span>{searches.length} recent</span></div>
          {searches.length > 0 ? (
            <div className="history-list">
              {searches.map((item) => (
                <a className="history-item" href="/" key={item._id}><div><strong>{item.company}</strong><span>{item.prospects.length} prospects found</span></div><span>Research again →</span></a>
              ))}
            </div>
          ) : <div className="dashboard-empty">Your searches will appear here after you sign in and research companies.</div>}
        </div>

        <div className="dashboard-panel">
          <div><div className="eyebrow">KEEP GOING</div><h2>Find your next prospect.</h2><p>Research a target company, save the people who look relevant, then come back here when you’re ready to reach out.</p></div>
          <a className="dashboard-cta" href="/">Find a prospect <span>→</span></a>
        </div>
      </section>
    </main>
  );
}
