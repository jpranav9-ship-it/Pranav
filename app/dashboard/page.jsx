'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/usage').then((r) => r.json()),
    ]).then(([auth, usage]) => {
      if (!auth.authenticated) {
        router.replace('/signin');
        return;
      }
      setEmail(auth.email || '');
      setSearchCount(Math.min(usage.searchCount || 0, 5));
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
          <div className="dashboard-card">
            <span>FREE SEARCHES</span>
            <strong>{searchCount} / 5</strong>
            <p>Searches used on this browser.</p>
          </div>
          <div className="dashboard-card">
            <span>ACCOUNT</span>
            <strong>Active</strong>
            <p>Your account is ready for saved research.</p>
          </div>
        </div>

        <div className="dashboard-panel">
          <div>
            <div className="eyebrow">NEXT UP</div>
            <h2>Save prospects as you research.</h2>
            <p>We’re building the workspace around the workflow: find the right person → save them → come back when you’re ready to reach out.</p>
          </div>
          <a className="dashboard-cta" href="/">Find a prospect <span>→</span></a>
        </div>
      </section>
    </main>
  );
}
