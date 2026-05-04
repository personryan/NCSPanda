import { Body, Controller, Delete, Get, Inject, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/supabase-auth.service';
import { AdminUsersService } from './admin-users.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Controller('admin/users')
@UseGuards(AuthGuard)
export class AdminUsersController {
  constructor(@Inject(AdminUsersService) private readonly adminUsersService: AdminUsersService) {}

  private async requireAdmin(req: Request & { user: AuthUser }) {
    await this.adminUsersService.assertAdmin(req.user.id);
  }

  @Get()
  async listUsers(@Req() req: Request & { user: AuthUser }) {
    await this.requireAdmin(req);
    return this.adminUsersService.listUsers();
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string, @Req() req: Request & { user: AuthUser }) {
    await this.requireAdmin(req);
    return this.adminUsersService.getUser(userId);
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    await this.requireAdmin(req);
    return this.adminUsersService.updateUser(userId, dto);
  }

  @Delete(':userId')
  async softDeleteUser(@Param('userId') userId: string, @Req() req: Request & { user: AuthUser }) {
    await this.requireAdmin(req);
    return this.adminUsersService.softDeleteUser(userId);
  }
}
