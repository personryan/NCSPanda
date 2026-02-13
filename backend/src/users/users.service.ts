import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

const DEFAULT_ROLE_ID = 1; // customer

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Profile already exists for this user');
    }

    return this.prisma.user.create({
      data: {
        user_id: userId,
        role_id: DEFAULT_ROLE_ID,
        first_name: dto.first_name ?? null,
        last_name: dto.last_name ?? null,
      },
      include: { role: true },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });
    if (!user) return null;
    return {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      role: user.role.role_name,
      role_id: user.role_id,
    };
  }
}
