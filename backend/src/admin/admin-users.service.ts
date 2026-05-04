import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async assertAdmin(actorUserId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { user_id: actorUserId },
      include: { role: true },
    });

    if (actor?.is_active !== true || actor.role?.role_name !== 'admin') {
      throw new ForbiddenException('Admin role is required');
    }
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      include: { role: true },
    });
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(userId: string, dto: UpdateAdminUserDto) {
    await this.getUser(userId);

    const data: UpdateAdminUserDto = {};
    if (typeof dto.role_id === 'number') data.role_id = dto.role_id;
    if (typeof dto.first_name === 'string') data.first_name = dto.first_name;
    if (typeof dto.last_name === 'string') data.last_name = dto.last_name;
    if (typeof dto.is_active === 'boolean') data.is_active = dto.is_active;

    return this.prisma.user.update({
      where: { user_id: userId },
      data,
      include: { role: true },
    });
  }

  async softDeleteUser(userId: string) {
    await this.getUser(userId);

    return this.prisma.user.update({
      where: { user_id: userId },
      data: { is_active: false },
      include: { role: true },
    });
  }
}
