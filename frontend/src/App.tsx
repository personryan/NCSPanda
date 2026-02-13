import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <span className="app-logo">NCS Panda</span>
        </header>
        <main className="app-main">
          <div className="loading-wrap">
            <div className="loading-spinner" aria-hidden />
            <span>Loading…</span>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <span className="app-logo">NCS Panda</span>
        </header>
        <main className="app-main">
          {showRegister ? (
            <RegisterForm
              onSuccess={() => setShowRegister(false)}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onSuccess={() => {}}
              onSwitchToLogin={() => setShowRegister(true)}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">NCS Panda</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {session.user.email}
          </span>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">
            Sign out
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="card dashboard">
          <h1>Welcome back</h1>
          <p className="user-email">{session.user.email}</p>
          <p className="user-meta">User ID: {session.user.id}</p>
        </div>
      </main>
    </div>
  );
}

export default App;
