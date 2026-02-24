import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { MenuService } from '../menu/menu.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('creates pre-order without payment for valid payload', () => {
    const service = new OrdersService(new MenuService(), new PickupSlotsService());

    const order = service.createOrder({
      outletId: 'outlet-b6-chicken-rice',
      slotDate: '2099-01-01',
      slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
      items: [{ itemId: 'item-cr-01', quantity: 1 }],
      customerId: 'customer-123',
    });

    expect(order.orderId).toMatch(/^ord_/);
    expect(order.status).toBe('received');
    expect(order.items[0].itemId).toBe('item-cr-01');
  });

  it('blocks over-capacity bookings for same slot', () => {
    const service = new OrdersService(new MenuService(), new PickupSlotsService());

    // outlet-b6-noodles capacity is 14 in slot service
    for (let i = 0; i < 14; i += 1) {
      service.createOrder({
        outletId: 'outlet-b6-noodles',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-noodles-2099-01-01-11:30',
        items: [{ itemId: 'item-n-01', quantity: 1 }],
      });
    }

    expect(() =>
      service.createOrder({
        outletId: 'outlet-b6-noodles',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-noodles-2099-01-01-11:30',
        items: [{ itemId: 'item-n-01', quantity: 1 }],
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects unavailable items', () => {
    const service = new OrdersService(new MenuService(), new PickupSlotsService());

    expect(() =>
      service.createOrder({
        outletId: 'outlet-b6-chicken-rice',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
        items: [{ itemId: 'item-cr-03', quantity: 1 }],
      }),
    ).toThrow(BadRequestException);
  });
});
