import { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { getApiBaseUrl } from '../services/env';

const API_BASE = getApiBaseUrl();

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const session = authData.session;
    if (session?.access_token && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError((err as { message?: string }).message || `Profile creation failed (${res.status})`);
          setLoading(false);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create profile');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Create account</h2>

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-password" className="form-label">Password</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="form-input"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="reg-first-name" className="form-label">First name</label>
          <input
            id="reg-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="form-input"
            placeholder="First name"
            autoComplete="given-name"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="reg-last-name" className="form-label">Last name</label>
          <input
            id="reg-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="form-input"
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Creating account…' : 'Sign up'}
      </button>

      <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <button
          type="button"
          className="btn-link"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
