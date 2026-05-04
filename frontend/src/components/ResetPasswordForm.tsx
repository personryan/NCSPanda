import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function ResetPasswordForm({
  onSuccess,
  onReturnToLogin,
}: {
  onSuccess: () => void;
  onReturnToLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setValidating(false);
    };

    validateToken();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      onSuccess();
    }
  };

  if (validating) {
    return (
      <div className="card">
        <div className="loading-wrap">
          <div className="loading-spinner" aria-hidden />
          <span>Validating reset link...</span>
        </div>
      </div>
    );
  }

  if (error && error.includes('Invalid or expired')) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Reset link expired</h2>
        <div className="alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
        <button type="button" onClick={onReturnToLogin} className="btn btn-primary">
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Create new password</h2>

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="new-password" className="form-label">New password</label>
        <input
          id="new-password"
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

      <div className="form-group">
        <label htmlFor="confirm-password" className="form-label">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="form-input"
          placeholder="Re-enter password"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Resetting password…' : 'Reset password'}
      </button>

      <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        <button type="button" className="btn-link" onClick={onReturnToLogin}>
          Back to sign in
        </button>
      </p>
    </form>
  );
}
