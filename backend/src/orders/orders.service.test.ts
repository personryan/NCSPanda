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

  it('rejects empty orders, missing slots, and unknown items', async () => {
    const { service } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);

    await expect(
      service.createOrder({
        outletId: 'outlet-b6-chicken-rice',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
        items: [],
      }),
    ).rejects.toThrow('Order must contain at least one item');

    await expect(
      service.createOrder({
        outletId: 'outlet-b6-chicken-rice',
        slotDate: '2099-01-01',
        slotId: 'missing-slot',
        items: [{ itemId: 'item-cr-01', quantity: 1 }],
      }),
    ).rejects.toThrow('Selected pickup slot does not exist');

    await expect(
      service.createOrder({
        outletId: 'outlet-b6-chicken-rice',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
        items: [{ itemId: 'missing-item', quantity: 1 }],
      }),
    ).rejects.toThrow("Item 'missing-item' does not belong");
  });

  it('lists vendor orders with optional filters', async () => {
    const { service, mockPrisma } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);

    const orders = await service.listOrdersForVendor({
      outletId: 'outlet-b6-chicken-rice',
      slotDate: '2099-01-01',
      status: 'received',
    });

    expect(orders[0].orderId).toBe('ord_test_123');
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          outlet_id: 'outlet-b6-chicken-rice',
          slot_date: new Date('2099-01-01'),
          status: 'received',
        },
      }),
    );
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

  it('allows idempotent status updates and rejects update for missing orders', async () => {
    const { service, mockPrisma } = buildService(MENU_RESPONSE, SLOTS_RESPONSE);
    mockPrisma.order.update.mockResolvedValueOnce({ ...BASE_ORDER, status: 'received' });
    await expect(service.updateOrderStatus('ord_test_123', 'received')).resolves.toMatchObject({
      status: 'received',
    });

    mockPrisma.order.findUnique.mockResolvedValueOnce(null);
    await expect(service.updateOrderStatus('missing', 'preparing')).rejects.toThrow(
      NotFoundException,
    );
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
