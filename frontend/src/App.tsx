import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import LoginForm from './components/LoginForm';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>;
  }

  // Not logged in — show login form
  if (!session) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1>NCS Panda</h1>
        <LoginForm onSuccess={() => {}} />
      </main>
    );
  }

  // Logged in — show user info
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>NCS Panda</h1>
      <p>Logged in as: <strong>{session.user.email}</strong></p>
      <p>User ID: <code>{session.user.id}</code></p>
      <button onClick={handleLogout} style={{ padding: '0.5rem 1.5rem', marginTop: '1rem' }}>
        Sign Out
      </button>
    </main>
  );
}

export default App;
