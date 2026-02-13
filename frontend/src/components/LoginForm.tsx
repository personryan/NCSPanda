import { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <h2>Login</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '0.75rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: 4 }}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.5rem' }}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
