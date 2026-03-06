import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const mockOrder = {
  orderId: 'ord_test_123',
  outletId: 'outlet-b6-chicken-rice',
  customerId: 'customer-123',
  slotDate: '2099-01-01',
  slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
  status: 'received' as const,
  createdAt: new Date().toISOString(),
  items: [{ itemId: 'item-cr-01', name: 'Roasted Chicken Rice', quantity: 1 }],
};

const mockOrdersService = {
  createOrder: vi.fn().mockResolvedValue(mockOrder),
  getOrderById: vi.fn().mockResolvedValue(mockOrder),
  updateOrderStatus: vi.fn().mockResolvedValue({ ...mockOrder, status: 'preparing' as const }),
} as unknown as OrdersService;

const payload = {
  outletId: 'outlet-b6-chicken-rice',
  slotDate: '2099-01-01',
  slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
  items: [{ itemId: 'item-cr-01', quantity: 1 }],
};

describe('OrdersController', () => {
  const controller = new OrdersController(mockOrdersService);

  it('blocks non-customer role from creating orders', async () => {
    await expect(controller.createOrder(payload, 'vendor')).rejects.toThrow(UnauthorizedException);
  });

  it('allows customer role to create order', async () => {
    const result = await controller.createOrder(payload, 'customer');
    expect(result.orderId).toBe('ord_test_123');
  });

  it('returns tracking details for customer role', async () => {
    const result = await controller.getOrderTracking('ord_test_123', 'customer');
    expect(result.orderId).toBe('ord_test_123');
  });

  it('blocks status update for non-vendor role', async () => {
    await expect(
      controller.updateOrderStatus('ord_test_123', { status: 'preparing' }, 'customer'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows status update for vendor role', async () => {
    const result = await controller.updateOrderStatus(
      'ord_test_123',
      { status: 'preparing' },
      'vendor',
    );
    expect(result.status).toBe('preparing');
  });
});
