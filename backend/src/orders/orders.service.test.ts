import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OrdersService } from './orders.service';
import { MenuService, OutletMenuView } from '../menu/menu.service';
import { PickupSlotsService, PickupSlotView } from '../pickup-slots/pickup-slots.service';

const MENU_RESPONSE: OutletMenuView = {
  outletId: 'outlet-b6-chicken-rice',
  outletName: 'B6 Chicken Rice',
  items: [
    {
      itemId: 'item-cr-01',
      name: 'Roasted Chicken Rice',
      price: 4.5,
      currency: 'SGD',
      availability: { isAvailable: true, status: 'available' },
    },
    {
      itemId: 'item-cr-03',
      name: 'Braised Tofu Set',
      price: 3.8,
      currency: 'SGD',
      availability: { isAvailable: false, status: 'sold_out' },
    },
  ],
};

const SLOTS_RESPONSE: PickupSlotView[] = [
  {
    slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
    startTime: '11:30',
    endTime: '11:45',
    capacity: 18,
    booked: 0,
    available: 18,
    isAvailable: true,
  },
];

const FULL_SLOTS_RESPONSE: PickupSlotView[] = [
  {
    slotId: 'outlet-b6-noodles-2099-01-01-11:30',
    startTime: '11:30',
    endTime: '11:45',
    capacity: 14,
    booked: 14,
    available: 0,
    isAvailable: false,
  },
];

const BASE_ORDER = {
  order_id: 'ord_test_123',
  outlet_id: 'outlet-b6-chicken-rice',
  customer_id: 'customer-123',
  slot_date: new Date('2099-01-01'),
  slot_id: 'outlet-b6-chicken-rice-2099-01-01-11:30',
  status: 'received',
  created_at: new Date(),
  items: [{ item_id: 'item-cr-01', name: 'Roasted Chicken Rice', quantity: 1, notes: null }],
};

function buildService(menuResponse: OutletMenuView, slotsResponse: PickupSlotView[]) {
  const mockPrisma = {
    order: {
      create: vi.fn().mockResolvedValue(BASE_ORDER),
      findUnique: vi.fn().mockResolvedValue(BASE_ORDER),
      update: vi.fn().mockResolvedValue({ ...BASE_ORDER, status: 'preparing' }),
      findMany: vi.fn().mockResolvedValue([BASE_ORDER]),
    },
  } as any;

  const mockMenu = { getMenuByOutlet: vi.fn().mockResolvedValue(menuResponse) } as unknown as MenuService;
  const mockSlots = { getSlots: vi.fn().mockResolvedValue(slotsResponse) } as unknown as PickupSlotsService;

  return { service: new OrdersService(mockPrisma, mockMenu, mockSlots), mockPrisma };
}

describe('OrdersService', () => {
  it('creates pre-order without payment for valid payload', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);

    const order = await service.createOrder({
      outletId: 'outlet-b6-chicken-rice',
      slotDate: '2099-01-01',
      slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
      items: [{ itemId: 'item-cr-01', quantity: 1 }],
      customerId: 'customer-123',
    });

    expect(order.orderId).toBe('ord_test_123');
    expect(order.status).toBe('received');
    expect(order.items[0].itemId).toBe('item-cr-01');
  });

  it('blocks over-capacity bookings for same slot', async () => {
    const { service } = buildService(MENU_RESPONSE, FULL_SLOTS_RESPONSE);

    await expect(
      service.createOrder({
        outletId: 'outlet-b6-noodles',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-noodles-2099-01-01-11:30',
        items: [{ itemId: 'item-cr-01', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects unavailable items', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);

    await expect(
      service.createOrder({
        outletId: 'outlet-b6-chicken-rice',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
        items: [{ itemId: 'item-cr-03', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns order tracking details', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);
    const order = await service.getOrderById('ord_test_123');
    expect(order.orderId).toBe('ord_test_123');
  });

  it('updates order status for valid transition', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);
    const order = await service.updateOrderStatus('ord_test_123', 'preparing');
    expect(order.status).toBe('preparing');
  });

  it('rejects invalid status transitions', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);
    await expect(service.updateOrderStatus('ord_test_123', 'ready')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws not found for missing order', async () => {
    const { service, mockPrisma } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);
    mockPrisma.order.findUnique.mockResolvedValueOnce(null);
    await expect(service.getOrderById('missing')).rejects.toThrow(NotFoundException);
  });
});
