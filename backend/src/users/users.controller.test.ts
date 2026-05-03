import { UsersController } from './users.controller';

describe('UsersController', () => {
  it('creates a profile for the authenticated user', async () => {
    const usersService = {
      createProfile: jest.fn().mockResolvedValue({ user_id: 'auth-user-1' }),
      getMe: jest.fn(),
    };
    const controller = new UsersController(usersService as any);

    await expect(
      controller.createProfile(
        { first_name: 'Ncs' },
        { user: { id: 'auth-user-1', email: 'user@example.com' } } as any,
      ),
    ).resolves.toEqual({ user_id: 'auth-user-1' });
    expect(usersService.createProfile).toHaveBeenCalledWith('auth-user-1', { first_name: 'Ncs' });
  });

  it('returns an auth-only response when no profile exists', async () => {
    const usersService = {
      createProfile: jest.fn(),
      getMe: jest.fn().mockResolvedValue(null),
    };
    const controller = new UsersController(usersService as any);

    await expect(
      controller.getMe({ user: { id: 'auth-user-1', email: 'user@example.com' } } as any),
    ).resolves.toEqual({
      user_id: 'auth-user-1',
      email: 'user@example.com',
      profile: null,
    });
  });

  it('returns profile and role data for the current user', async () => {
    const usersService = {
      createProfile: jest.fn(),
      getMe: jest.fn().mockResolvedValue({
        user_id: 'auth-user-1',
        first_name: 'Ncs',
        last_name: 'Panda',
        is_active: true,
        role: 'admin',
        role_id: 3,
      }),
    };
    const controller = new UsersController(usersService as any);

    await expect(
      controller.getMe({ user: { id: 'auth-user-1', email: 'user@example.com' } } as any),
    ).resolves.toMatchObject({
      user_id: 'auth-user-1',
      email: 'user@example.com',
      first_name: 'Ncs',
      role: 'admin',
      role_id: 3,
    });
  });
});
