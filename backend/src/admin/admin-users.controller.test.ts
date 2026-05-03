import { AdminUsersController } from './admin-users.controller';

describe('AdminUsersController', () => {
  const createService = () => ({
    assertAdmin: jest.fn(),
    listUsers: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
  });

  const req = { user: { id: 'admin-1', email: 'admin@example.com' } } as any;

  it('checks admin access before listing users', async () => {
    const service = createService();
    service.listUsers.mockResolvedValue([{ user_id: 'user-1' }]);
    const controller = new AdminUsersController(service as any);

    await expect(controller.listUsers(req)).resolves.toEqual([{ user_id: 'user-1' }]);
    expect(service.assertAdmin).toHaveBeenCalledWith('admin-1');
  });

  it('delegates update and soft delete operations', async () => {
    const service = createService();
    const controller = new AdminUsersController(service as any);

    service.updateUser.mockResolvedValue({ user_id: 'user-1', role_id: 2 });
    service.softDeleteUser.mockResolvedValue({ user_id: 'user-1', is_active: false });

    await expect(controller.updateUser('user-1', { role_id: 2 }, req))
      .resolves.toEqual({ user_id: 'user-1', role_id: 2 });
    await expect(controller.softDeleteUser('user-1', req))
      .resolves.toEqual({ user_id: 'user-1', is_active: false });

    expect(service.updateUser).toHaveBeenCalledWith('user-1', { role_id: 2 });
    expect(service.softDeleteUser).toHaveBeenCalledWith('user-1');
  });
});
