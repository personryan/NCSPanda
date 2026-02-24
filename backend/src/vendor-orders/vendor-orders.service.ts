import { Inject, Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { VendorOrdersQueryDto } from './dto/vendor-orders-query.dto';

@Injectable()
export class VendorOrdersService {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  getIncomingOrders(query: VendorOrdersQueryDto) {
    const orders = this.ordersService.listOrdersForVendor({
      outletId: query.vendorOutletId,
      slotDate: query.slotDate,
      status: query.status,
    });

    return orders.map((order) => ({
      orderId: order.orderId,
      customerId: order.customerId,
      outletId: order.outletId,
      slotDate: order.slotDate,
      slotId: order.slotId,
      status: order.status,
      createdAt: order.createdAt,
      itemsSummary: order.items.map((i) => `${i.name} x${i.quantity}`).join(', '),
    }));
  }
}

