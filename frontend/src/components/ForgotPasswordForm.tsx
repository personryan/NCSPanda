import { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';

export default function ForgotPasswordForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
  };

  if (submitted) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Check your email</h2>
        <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
          We&apos;ve sent a password reset link to <strong>{email}</strong>. 
          Check your email and follow the instructions to reset your password.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Redirecting to sign in in a few seconds...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Reset your password</h2>

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="reset-email" className="form-label">Email</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <button type="button" className="btn-link" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
}
