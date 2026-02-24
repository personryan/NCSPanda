import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { MenuService } from '../menu/menu.service';
import { OrdersService } from '../orders/orders.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { VendorOrdersController } from './vendor-orders.controller';
import { VendorOrdersService } from './vendor-orders.service';

describe('VendorOrdersController', () => {
  const ordersService = new OrdersService(new MenuService(), new PickupSlotsService());
  const controller = new VendorOrdersController(new VendorOrdersService(ordersService));

  it('blocks unauthorized calls', () => {
    expect(() =>
      controller.getIncomingOrders({ vendorOutletId: 'outlet-b6-chicken-rice' }, 'customer', undefined),
    ).toThrow(UnauthorizedException);
  });

  it('returns only vendor outlet orders and supports filtering', () => {
    ordersService.createOrder({
      outletId: 'outlet-b6-chicken-rice',
      slotDate: '2099-01-01',
      slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
      items: [{ itemId: 'item-cr-01', quantity: 1 }],
      customerId: 'c-1',
    });
    ordersService.createOrder({
      outletId: 'outlet-b6-noodles',
      slotDate: '2099-01-02',
      slotId: 'outlet-b6-noodles-2099-01-02-11:30',
      items: [{ itemId: 'item-n-01', quantity: 1 }],
      customerId: 'c-2',
    });

    const result = controller.getIncomingOrders(
      { vendorOutletId: 'outlet-b6-chicken-rice', slotDate: '2099-01-01' },
      'vendor',
      'outlet-b6-chicken-rice',
    );

    expect(result.length).toBe(1);
    expect(result[0].outletId).toBe('outlet-b6-chicken-rice');
    expect(result[0].itemsSummary).toContain('Roasted Chicken Rice');
  });
});
