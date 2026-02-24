import { Module } from '@nestjs/common';
import { HealthController } from './health/healthController';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MenuModule],
  controllers: [HealthController],
})
export class AppModule {}