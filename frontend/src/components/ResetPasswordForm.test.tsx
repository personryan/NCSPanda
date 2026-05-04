import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResetPasswordForm from './ResetPasswordForm';
import { supabase } from '../services/supabase';

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

describe('ResetPasswordForm', () => {
  const getSession = supabase.auth.getSession as jest.Mock;
  const updateUser = supabase.auth.updateUser as jest.Mock;

  beforeEach(() => {
    getSession.mockReset();
    updateUser.mockReset();
    getSession.mockResolvedValue({ data: { session: { access_token: 'token-123' } } });
  });

  it('validates token on mount and shows error if invalid', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    render(<ResetPasswordForm onSuccess={jest.fn()} onReturnToLogin={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired reset link/i)).toBeTruthy();
    });
  });

  it('resets password and calls onSuccess', async () => {
    const onSuccess = jest.fn();
    updateUser.mockResolvedValue({ data: {}, error: null });
    render(<ResetPasswordForm onSuccess={onSuccess} onReturnToLogin={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
  });

  it('validates password requirements', async () => {
    render(<ResetPasswordForm onSuccess={jest.fn()} onReturnToLogin={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(screen.getByText(/at least 8 characters/i)).toBeTruthy();
  });

  it('validates password confirmation match', async () => {
    render(<ResetPasswordForm onSuccess={jest.fn()} onReturnToLogin={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'differentpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
  });

  it('shows error from Supabase on failed reset', async () => {
    updateUser.mockResolvedValue({
      data: {},
      error: { message: 'Password reset failed' },
    });
    render(<ResetPasswordForm onSuccess={jest.fn()} onReturnToLogin={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText(/Password reset failed/)).toBeTruthy();
  });

  it('returns to login when clicking back button', async () => {
    const onReturnToLogin = jest.fn();
    render(<ResetPasswordForm onSuccess={jest.fn()} onReturnToLogin={onReturnToLogin} />);

    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Back to sign in/i }));
    expect(onReturnToLogin).toHaveBeenCalledTimes(1);
  });
});
