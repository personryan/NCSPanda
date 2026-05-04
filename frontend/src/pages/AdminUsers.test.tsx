import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminUsersPage from './AdminUsers';
import {
  fetchAdminUsers,
  softDeleteAdminUser,
  updateAdminUser,
} from '../services/api';

jest.mock('../services/api', () => ({
  fetchAdminUsers: jest.fn(),
  softDeleteAdminUser: jest.fn(),
  updateAdminUser: jest.fn(),
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    (fetchAdminUsers as jest.Mock).mockResolvedValue([
      {
        user_id: '11111111-1111-4111-8111-111111111111',
        first_name: 'Ada',
        last_name: 'Admin',
        role_id: 3,
        is_active: true,
        role: { role_name: 'admin' },
      },
    ]);
  });

  it('loads users without exposing admin creation', async () => {
    render(<AdminUsersPage accessToken="token-1" />);

    expect(await screen.findByText('Ada Admin')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create User' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Update User' })).toHaveProperty('disabled', true);
  });

  it('updates and deactivates profiles', async () => {
    (updateAdminUser as jest.Mock).mockResolvedValue({
      user_id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Ada',
      last_name: 'Updated',
      role_id: 2,
      is_active: true,
      role: { role_name: 'vendor' },
    });
    (softDeleteAdminUser as jest.Mock).mockResolvedValue({
      user_id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Ada',
      last_name: 'Updated',
      role_id: 2,
      is_active: false,
      role: { role_name: 'vendor' },
    });

    render(<AdminUsersPage accessToken="token-1" />);

    expect(await screen.findByText('Ada Admin')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update User' }));

    await waitFor(() =>
      expect(updateAdminUser).toHaveBeenCalledWith(
        'token-1',
        '11111111-1111-4111-8111-111111111111',
        {
          first_name: 'Ada',
          last_name: 'Updated',
          role_id: 2,
          is_active: true,
        },
      ),
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));
    await waitFor(() =>
      expect(softDeleteAdminUser).toHaveBeenCalledWith(
        'token-1',
        '11111111-1111-4111-8111-111111111111',
      ),
    );
  });
});
