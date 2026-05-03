import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createPrisma = () => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  });

  it('creates a customer profile with nullable names', async () => {
    const prisma = createPrisma();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ user_id: 'user-1', role_id: 1 });
    const service = new UsersService(prisma as any);

    await expect(service.createProfile('user-1', { first_name: '', last_name: 'Panda' })).resolves
      .toEqual({ user_id: 'user-1', role_id: 1 });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        user_id: 'user-1',
        role_id: 1,
        first_name: '',
        last_name: 'Panda',
      },
      include: { role: true },
    });
  });

  it('rejects duplicate profiles', async () => {
    const prisma = createPrisma();
    prisma.user.findUnique.mockResolvedValue({ user_id: 'user-1' });
    const service = new UsersService(prisma as any);

    await expect(service.createProfile('user-1', {})).rejects.toThrow(ConflictException);
  });

  it('returns a normalized current user profile or null', async () => {
    const prisma = createPrisma();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValueOnce({
      user_id: 'user-1',
      first_name: 'Ncs',
      last_name: 'Panda',
      is_active: true,
      role_id: 2,
      role: { role_name: 'vendor' },
    });
    await expect(service.getMe('user-1')).resolves.toEqual({
      user_id: 'user-1',
      first_name: 'Ncs',
      last_name: 'Panda',
      is_active: true,
      role: 'vendor',
      role_id: 2,
    });

    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.getMe('missing')).resolves.toBeNull();
  });
});
