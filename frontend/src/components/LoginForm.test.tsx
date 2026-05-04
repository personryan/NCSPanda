import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import { supabase } from '../services/supabase';

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginForm', () => {
  const signInWithPassword = supabase.auth.signInWithPassword as jest.Mock;

  beforeEach(() => {
    signInWithPassword.mockReset();
  });

  it('signs in and calls onSuccess', async () => {
    const onSuccess = jest.fn();
    signInWithPassword.mockResolvedValue({ error: null });
    render(<LoginForm onSuccess={onSuccess} onSwitchToRegister={jest.fn()} onSwitchToForgotPassword={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('renders authentication errors and the register/forgot password switches', async () => {
    const onSwitchToRegister = jest.fn();
    const onSwitchToForgotPassword = jest.fn();
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login' } });
    render(<LoginForm onSuccess={jest.fn()} onSwitchToRegister={onSwitchToRegister} onSwitchToForgotPassword={onSwitchToForgotPassword} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));

    expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
    expect(onSwitchToForgotPassword).toHaveBeenCalledTimes(1);
    expect((await screen.findByRole('alert')).textContent).toContain('Invalid login');
  });
});
