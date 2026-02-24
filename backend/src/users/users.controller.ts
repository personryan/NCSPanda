import { Controller, Post, Get, Body, UseGuards, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/supabase-auth.service';

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Post('profile')
  @UseGuards(AuthGuard)
  async createProfile(
    @Body() dto: CreateProfileDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.usersService.createProfile(req.user.id, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request & { user: AuthUser }) {
    const profile = await this.usersService.getMe(req.user.id);
    if (!profile) {
      return { user_id: req.user.id, email: req.user.email, profile: null };
    }
    return {
      user_id: profile.user_id,
      email: req.user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      is_active: profile.is_active,
      role: profile.role,
      role_id: profile.role_id,
    };
  }
}
