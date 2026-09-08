'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/${mode === 'signin' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <nav className="nav">
        <a className="brand brand-link" href="/"><span className="brand-mark">A</span><span>AEO Prospect Intelligence</span></a>
        <a className="back-link" href="/">Back to search</a>
      </nav>

      <section className="auth-card">
        <div className="eyebrow">YOUR PROSPECTING WORKSPACE</div>
        <h1>{mode === 'signin' ? 'Welcome back.' : 'Create your workspace.'}</h1>
        <p className="auth-subhead">Save your prospect research and pick up where you left off.</p>

        <div className="auth-toggle">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={8} /></label>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'} <span>→</span></button>
        </form>

        <p className="auth-note">No payment required. Your first 5 prospect searches remain free.</p>
      </section>
    </main>
  );
}
