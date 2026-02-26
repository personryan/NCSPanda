import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { VendorOrdersController } from './vendor-orders.controller';
import { VendorOrdersService } from './vendor-orders.service';
import { OrdersService } from '../orders/orders.service';

const MOCK_ORDERS = [
  {
    orderId: 'ord_test_1',
    customerId: 'c-1',
    outletId: 'outlet-b6-chicken-rice',
    slotDate: '2099-01-01',
    slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
    status: 'received' as const,
    createdAt: new Date().toISOString(),
    items: [{ itemId: 'item-cr-01', name: 'Roasted Chicken Rice', quantity: 1 }],
  },
];

const mockOrdersService = {
  listOrdersForVendor: vi.fn().mockResolvedValue(MOCK_ORDERS),
} as unknown as OrdersService;

describe('VendorOrdersController', () => {
  const vendorOrdersService = new VendorOrdersService(mockOrdersService);
  const controller = new VendorOrdersController(vendorOrdersService);

  it('blocks unauthorized calls', () => {
    expect(() =>
      controller.getIncomingOrders({ vendorOutletId: 'outlet-b6-chicken-rice' }, 'customer', undefined),
    ).toThrow(UnauthorizedException);
  });

  it('returns only vendor outlet orders and supports filtering', async () => {
    const result = await controller.getIncomingOrders(
      { vendorOutletId: 'outlet-b6-chicken-rice', slotDate: '2099-01-01' },
      'vendor',
      'outlet-b6-chicken-rice',
    );

    expect(result.length).toBe(1);
    expect(result[0].outletId).toBe('outlet-b6-chicken-rice');
    expect(result[0].itemsSummary).toContain('Roasted Chicken Rice');
  });
});
