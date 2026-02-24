import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { VendorOrdersController } from './vendor-orders.controller';
import { VendorOrdersService } from './vendor-orders.service';

@Module({
  imports: [OrdersModule],
  controllers: [VendorOrdersController],
  providers: [VendorOrdersService],
})
export class VendorOrdersModule {}
