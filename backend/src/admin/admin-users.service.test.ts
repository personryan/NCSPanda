import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const createPrisma = () => ({
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  });

  it('allows only active admin profiles to manage users', async () => {
    const prisma = createPrisma();
    const service = new AdminUsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValueOnce({
      user_id: 'admin-1',
      is_active: true,
      role: { role_name: 'admin' },
    });
    await expect(service.assertAdmin('admin-1')).resolves.toBeUndefined();

    prisma.user.findUnique.mockResolvedValueOnce({
      user_id: 'vendor-1',
      is_active: true,
      role: { role_name: 'vendor' },
    });
    await expect(service.assertAdmin('vendor-1')).rejects.toThrow(ForbiddenException);
  });

  it('lists and reads users with roles', async () => {
    const prisma = createPrisma();
    const service = new AdminUsersService(prisma as any);
    const user = { user_id: 'user-1', role: { role_name: 'customer' } };

    prisma.user.findMany.mockResolvedValue([user]);
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.listUsers()).resolves.toEqual([user]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { created_at: 'desc' },
      include: { role: true },
    });
    await expect(service.getUser('user-1')).resolves.toEqual(user);
  });

  it('updates and soft deletes user profiles', async () => {
    const prisma = createPrisma();
    const service = new AdminUsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue({ user_id: 'user-1' });
    prisma.user.update
      .mockResolvedValueOnce({ user_id: 'user-1', role_id: 2, first_name: 'Updated' })
      .mockResolvedValueOnce({ user_id: 'user-1', is_active: false });

    await expect(service.updateUser('user-1', { role_id: 2, first_name: 'Updated' }))
      .resolves.toEqual({ user_id: 'user-1', role_id: 2, first_name: 'Updated' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      data: { role_id: 2, first_name: 'Updated' },
      include: { role: true },
    });

    await expect(service.softDeleteUser('user-1')).resolves.toEqual({
      user_id: 'user-1',
      is_active: false,
    });
    expect(prisma.user.update).toHaveBeenLastCalledWith({
      where: { user_id: 'user-1' },
      data: { is_active: false },
      include: { role: true },
    });
  });

  it('throws not found when reading a missing user', async () => {
    const prisma = createPrisma();
    const service = new AdminUsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getUser('missing')).rejects.toThrow(NotFoundException);
  });
});
