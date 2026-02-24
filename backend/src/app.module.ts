import { Module } from '@nestjs/common';
import { HealthController } from './health/healthController';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { PickupSlotsModule } from './pickup-slots/pickup-slots.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MenuModule, PickupSlotsModule],
  controllers: [HealthController],
})
export class AppModule {}