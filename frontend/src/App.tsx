import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MenuPage from './pages/Menu';
import OrdersPage from './pages/Orders';
import VendorDashboardPage from './pages/VendorDashboard';
import { fetchCurrentUserProfile } from './services/api';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [activePage, setActivePage] = useState<'menu' | 'order' | 'vendor'>('menu');
  const [profileRoleId, setProfileRoleId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!session) {
      setProfileRoleId(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchCurrentUserProfile(session.access_token);
        if (!cancelled) setProfileRoleId(data.role_id ?? null);
      } catch (e) {
        if (!cancelled) setProfileRoleId(null);
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const role = profileRoleId === 2 ? 'vendor' : profileRoleId === 3 ? 'admin' : 'customer';
  const canUseCustomer = role === 'customer' || role === 'admin';
  const canUseVendor = role === 'vendor' || role === 'admin';

  useEffect(() => {
    if (!session) return;

    if (canUseVendor && activePage !== 'vendor') {
      setActivePage('vendor');
      return;
    }

    if (!canUseVendor && activePage === 'vendor') {
      setActivePage('menu');
    }
  }, [session, canUseVendor, activePage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfileRoleId(null);
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
            <span>Loading...</span>
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
              onSwitchToRegister={() => setShowRegister(true)}
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
      <main className="app-main app-main-page">
        <div className="menu-page" style={{ marginBottom: '0.5rem' }}>
          <div className="dashboard-actions" style={{ justifyContent: 'flex-start' }}>
            <button
              type="button"
              className={`btn ${activePage === 'menu' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActivePage('menu')}
              disabled={!canUseCustomer}
            >
              Browse Menu
            </button>
            <button
              type="button"
              className={`btn ${activePage === 'order' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActivePage('order')}
              disabled={!canUseCustomer}
            >
              Place Order
            </button>
            <button
              type="button"
              className={`btn ${activePage === 'vendor' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActivePage('vendor')}
              disabled={!canUseVendor}
            >
              Vendor Dashboard
            </button>
          </div>
        </div>
        {activePage === 'menu' && canUseCustomer ? <MenuPage /> : null}
        {activePage === 'order' && canUseCustomer ? <OrdersPage /> : null}
        {activePage === 'vendor' && canUseVendor ? <VendorDashboardPage /> : null}
        {(activePage === 'vendor' && !canUseVendor) ||
        ((activePage === 'menu' || activePage === 'order') && !canUseCustomer) ? (
          <div className="menu-surface">
            <p className="alert-error">You do not have permission to access this module with your current role.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
