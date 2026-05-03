import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { fetchCurrentUserProfile } from './services/api';
import { supabase } from './services/supabase';

jest.mock('./services/api', () => ({
  fetchCurrentUserProfile: jest.fn(),
}));

jest.mock('./services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('./components/LoginForm', () => (props: { onSwitchToRegister: () => void }) => (
  <button type="button" onClick={props.onSwitchToRegister}>mock-login</button>
));
jest.mock('./components/RegisterForm', () => (props: { onSwitchToLogin: () => void }) => (
  <button type="button" onClick={props.onSwitchToLogin}>mock-register</button>
));
jest.mock('./pages/Menu', () => () => <div>mock-menu-page</div>);
jest.mock('./pages/Orders', () => () => <div>mock-orders-page</div>);
jest.mock('./pages/OrderHistory', () => () => <div>mock-history-page</div>);
jest.mock('./pages/VendorDashboard', () => () => <div>mock-vendor-page</div>);
jest.mock('./pages/ReportingAnalytics', () => () => <div>mock-reporting-page</div>);

const session = {
  access_token: 'token-1',
  user: { email: 'vendor@example.com' },
};

describe('App', () => {
  beforeEach(() => {
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({});
    (fetchCurrentUserProfile as jest.Mock).mockResolvedValue({ role_id: 2 });
  });

  it('shows login/register screens when unauthenticated', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    render(<App />);

    expect(await screen.findByText('mock-login')).toBeTruthy();
    fireEvent.click(screen.getByText('mock-login'));
    expect(screen.getByText('mock-register')).toBeTruthy();
  });

  it('routes vendor users to vendor and reporting pages and signs out', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
    render(<App />);

    expect(await screen.findByText('mock-vendor-page')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reporting' }));
    expect(screen.getByText('mock-reporting-page')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledTimes(1));
  });

  it('lets customer users navigate customer pages', async () => {
    (fetchCurrentUserProfile as jest.Mock).mockResolvedValue({ role_id: 1 });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
    render(<App />);

    expect(await screen.findByText('mock-menu-page')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Vendor Dashboard' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Place Order' }));
    expect(screen.getByText('mock-orders-page')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Order History' }));
    expect(screen.getByText('mock-history-page')).toBeTruthy();
  });
});
