import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SupabaseAuthService } from '../auth/supabase-auth.service';

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
  listOrdersForCustomer: vi.fn().mockResolvedValue([mockOrder]),
  getOrderById: vi.fn().mockResolvedValue(mockOrder),
  getOrderByIdForCustomer: vi.fn().mockResolvedValue(mockOrder),
  updateOrderStatus: vi.fn().mockResolvedValue({ ...mockOrder, status: 'preparing' as const }),
} as unknown as OrdersService;

const mockSupabaseAuthService = {
  validateAccessToken: vi.fn().mockResolvedValue({ id: 'customer-123', email: 'customer@example.com' }),
} as unknown as SupabaseAuthService;

const payload = {
  outletId: 'outlet-b6-chicken-rice',
  slotDate: '2099-01-01',
  slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
  items: [{ itemId: 'item-cr-01', quantity: 1 }],
};

describe('OrdersController', () => {
  const controller = new OrdersController(mockOrdersService, mockSupabaseAuthService);

  it('blocks non-customer role from creating orders', async () => {
    await expect(
      controller.getOrderTracking('ord_test_123', { headers: {} } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('creates orders for the authenticated customer', async () => {
    const result = await controller.createOrder(payload, {
      user: { id: 'customer-123', email: 'customer@example.com' },
    } as any);
    expect(result.orderId).toBe('ord_test_123');
    expect(mockOrdersService.createOrder).toHaveBeenCalledWith(payload, 'customer-123');
  });

  it('returns authenticated customer order history', async () => {
    const result = await controller.listMyOrders({
      user: { id: 'customer-123', email: 'customer@example.com' },
    } as any);

    expect(result).toEqual([mockOrder]);
    expect(mockOrdersService.listOrdersForCustomer).toHaveBeenCalledWith('customer-123');
  });

  it('returns customer tracking details only through token-owned lookup', async () => {
    const result = await controller.getOrderTracking('ord_test_123', {
      headers: { authorization: 'Bearer token-1' },
    } as any);
    expect(result.orderId).toBe('ord_test_123');
    expect(mockOrdersService.getOrderByIdForCustomer).toHaveBeenCalledWith(
      'ord_test_123',
      'customer-123',
    );
  });

  it('keeps vendor tracking access header-based', async () => {
    const result = await controller.getOrderTracking('ord_test_123', {
      headers: { 'x-user-role': 'vendor' },
    } as any);

    expect(result.orderId).toBe('ord_test_123');
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith('ord_test_123');
  });

  it('blocks status update for non-vendor role', async () => {
    await expect(
      controller.updateOrderStatus('ord_test_123', { status: 'preparing' }, { headers: {} } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('allows status update for vendor role', async () => {
    const result = await controller.updateOrderStatus(
      'ord_test_123',
      { status: 'preparing' },
      { headers: { 'x-user-role': 'vendor' } } as any,
    );
    expect(result.status).toBe('preparing');
  });
});
