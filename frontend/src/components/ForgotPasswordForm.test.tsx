import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ForgotPasswordForm from './ForgotPasswordForm';
import { supabase } from '../services/supabase';

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('ForgotPasswordForm', () => {
  const resetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;

  beforeEach(() => {
    resetPasswordForEmail.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('submits password reset request and shows success message', async () => {
    const onSuccess = jest.fn();
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(
      <ForgotPasswordForm onSuccess={onSuccess} onSwitchToLogin={jest.fn()} />
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    });

    expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    jest.advanceTimersByTime(3000);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('renders error message on failure', async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: { message: 'User not found' },
    });
    render(
      <ForgotPasswordForm onSuccess={jest.fn()} onSwitchToLogin={jest.fn()} />
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'nonexistent@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('User not found');
  });

  it('renders switch to login button and calls callback', async () => {
    const onSwitchToLogin = jest.fn();
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(
      <ForgotPasswordForm onSuccess={jest.fn()} onSwitchToLogin={onSwitchToLogin} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });
});
