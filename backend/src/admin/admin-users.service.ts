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

    if (!actor || !actor.is_active || actor.role?.role_name !== 'admin') {
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

    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        ...(dto.role_id !== undefined ? { role_id: dto.role_id } : {}),
        ...(dto.first_name !== undefined ? { first_name: dto.first_name } : {}),
        ...(dto.last_name !== undefined ? { last_name: dto.last_name } : {}),
        ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
      },
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
