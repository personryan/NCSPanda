import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { MenuService } from '../menu/menu.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  const controller = new OrdersController(new OrdersService(new MenuService(), new PickupSlotsService()));

  const payload = {
    outletId: 'outlet-b6-chicken-rice',
    slotDate: '2099-01-01',
    slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
    items: [{ itemId: 'item-cr-01', quantity: 1 }],
  };

  it('blocks non-customer role from creating orders', () => {
    expect(() => controller.createOrder(payload, 'vendor')).toThrow(UnauthorizedException);
  });

  it('allows customer role to create order', () => {
    const result = controller.createOrder(payload, 'customer');
    expect(result.orderId).toMatch(/^ord_/);
  });
});
