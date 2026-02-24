import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MenuModule } from '../menu/menu.module';
import { PickupSlotsModule } from '../pickup-slots/pickup-slots.module';

@Module({
  imports: [MenuModule, PickupSlotsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
