import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterForm from './RegisterForm';
import { supabase } from '../services/supabase';

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

jest.mock('../services/env', () => ({
  getApiBaseUrl: () => '',
}));

describe('RegisterForm', () => {
  const signUp = supabase.auth.signUp as jest.Mock;

  beforeEach(() => {
    signUp.mockReset();
    global.fetch = jest.fn();
  });

  it('creates an account and calls onSuccess', async () => {
    const onSuccess = jest.fn();
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    render(<RegisterForm onSuccess={onSuccess} onSwitchToLogin={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'password123' });
  });

  it('shows sign up errors and switches back to login', async () => {
    const onSwitchToLogin = jest.fn();
    signUp.mockResolvedValue({ data: {}, error: { message: 'Email exists' } });
    render(<RegisterForm onSuccess={jest.fn()} onSwitchToLogin={onSwitchToLogin} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
    expect((await screen.findByRole('alert')).textContent).toContain('Email exists');
  });
});
