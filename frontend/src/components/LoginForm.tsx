import { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';

export default function LoginForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Sign in</h2>

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
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
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="form-input"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      {onSwitchToLogin && (
        <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Don&apos;t have an account?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            Sign up
          </button>
        </p>
      )}
    </form>
  );
}
