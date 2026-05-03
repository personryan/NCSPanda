import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MenuPage from './pages/Menu';
import OrdersPage from './pages/Orders';
import OrderHistoryPage from './pages/OrderHistory';
import VendorDashboardPage from './pages/VendorDashboard';
import ReportingAnalyticsPage from './pages/ReportingAnalytics';
import { fetchCurrentUserProfile } from './services/api';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [activePage, setActivePage] = useState<'menu' | 'order' | 'history' | 'vendor' | 'reporting'>('menu');
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

    if (canUseVendor && activePage !== 'vendor' && activePage !== 'reporting') {
      setActivePage('vendor');
      return;
    }

    if (!canUseVendor && (activePage === 'vendor' || activePage === 'reporting')) {
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
        <div className="app-main__inner">
          <nav className="dashboard-nav" aria-label="App sections">
            <button
              type="button"
              className={`dashboard-nav__btn ${activePage === 'menu' ? 'dashboard-nav__btn--active' : ''}`}
              onClick={() => setActivePage('menu')}
              disabled={!canUseCustomer}
              aria-current={activePage === 'menu' ? 'page' : undefined}
            >
              Browse Menu
            </button>
            <button
              type="button"
              className={`dashboard-nav__btn ${activePage === 'order' ? 'dashboard-nav__btn--active' : ''}`}
              onClick={() => setActivePage('order')}
              disabled={!canUseCustomer}
              aria-current={activePage === 'order' ? 'page' : undefined}
            >
              Place Order
            </button>
            <button
              type="button"
              className={`dashboard-nav__btn ${activePage === 'history' ? 'dashboard-nav__btn--active' : ''}`}
              onClick={() => setActivePage('history')}
              disabled={!canUseCustomer}
              aria-current={activePage === 'history' ? 'page' : undefined}
            >
              Order History
            </button>
            {canUseVendor && (
              <button
                type="button"
                className={`dashboard-nav__btn ${activePage === 'vendor' ? 'dashboard-nav__btn--active' : ''}`}
                onClick={() => setActivePage('vendor')}
                aria-current={activePage === 'vendor' ? 'page' : undefined}
              >
                Vendor Dashboard
              </button>
            )}
            {canUseVendor && (
              <button
                type="button"
                className={`dashboard-nav__btn ${activePage === 'reporting' ? 'dashboard-nav__btn--active' : ''}`}
                onClick={() => setActivePage('reporting')}
                aria-current={activePage === 'reporting' ? 'page' : undefined}
              >
                Reporting
              </button>
            )}
          </nav>
          {activePage === 'menu' && canUseCustomer ? <MenuPage /> : null}
          {activePage === 'order' && canUseCustomer ? <OrdersPage accessToken={session.access_token} /> : null}
          {activePage === 'history' && canUseCustomer ? <OrderHistoryPage accessToken={session.access_token} /> : null}
          {activePage === 'vendor' && canUseVendor ? <VendorDashboardPage /> : null}
          {activePage === 'reporting' && canUseVendor ? <ReportingAnalyticsPage /> : null}
          {((activePage === 'vendor' || activePage === 'reporting') && !canUseVendor) ||
          ((activePage === 'menu' || activePage === 'order' || activePage === 'history') && !canUseCustomer) ? (
            <div className="menu-surface">
              <p className="alert-error">You do not have permission to access this module with your current role.</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default App;
