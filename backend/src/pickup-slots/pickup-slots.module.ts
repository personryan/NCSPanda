import { Module } from '@nestjs/common';
import { PickupSlotsController } from './pickup-slots.controller';
import { PickupSlotsService } from './pickup-slots.service';

@Module({
  controllers: [PickupSlotsController],
  providers: [PickupSlotsService],
  exports: [PickupSlotsService],
})
export class PickupSlotsModule {}
