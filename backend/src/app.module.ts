import { Module } from '@nestjs/common';
import { HealthController } from './health/healthController';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}