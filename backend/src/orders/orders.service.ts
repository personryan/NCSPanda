import { BadRequestException, Injectable } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';

export interface StoredOrder {
  orderId: string;
  outletId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: 'received';
  createdAt: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    notes?: string;
  }>;
}

@Injectable()
export class OrdersService {
  private readonly orders: StoredOrder[] = [];
  private readonly slotUsage = new Map<string, number>();

  constructor(
    private readonly menuService: MenuService,
    private readonly pickupSlotsService: PickupSlotsService,
  ) {}

  createOrder(payload: CreateOrderDto): StoredOrder {
    if (!payload.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const menu = this.menuService.getMenuByOutlet(payload.outletId);
    const availableSlots = this.pickupSlotsService.getSlots(payload.outletId, payload.slotDate);
    const selectedSlot = availableSlots.find((slot) => slot.slotId === payload.slotId);

    if (!selectedSlot) {
      throw new BadRequestException('Selected pickup slot does not exist for outlet/date');
    }

    const slotKey = `${payload.outletId}:${payload.slotDate}:${payload.slotId}`;
    const currentUsage = this.slotUsage.get(slotKey) || 0;
    if (currentUsage >= selectedSlot.capacity) {
      throw new BadRequestException('Selected pickup slot is already full');
    }

    const normalizedItems = this.normalizeItems(payload.items, menu.items);

    // atomic in-memory persistence block
    const order: StoredOrder = {
      orderId: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      outletId: payload.outletId,
      customerId: payload.customerId || 'customer-anonymous',
      slotDate: payload.slotDate,
      slotId: payload.slotId,
      status: 'received',
      createdAt: new Date().toISOString(),
      items: normalizedItems,
    };

    this.orders.push(order);
    this.slotUsage.set(slotKey, currentUsage + 1);

    return order;
  }

  listOrdersForVendor(filters: {
    outletId: string;
    slotDate?: string;
    status?: 'received' | 'preparing' | 'ready';
  }): StoredOrder[] {
    return this.orders
      .filter((order) => order.outletId === filters.outletId)
      .filter((order) => (filters.slotDate ? order.slotDate === filters.slotDate : true))
      .filter((order) => (filters.status ? order.status === filters.status : true))
      .sort((a, b) => {
        if (a.slotDate === b.slotDate) {
          return b.createdAt.localeCompare(a.createdAt);
        }
        return a.slotDate.localeCompare(b.slotDate);
      });
  }

  private normalizeItems(
    items: CreateOrderItemDto[],
    menuItems: Array<{ itemId: string; name: string; availability: { isAvailable: boolean } }>,
  ) {
    return items.map((item) => {
      const menuItem = menuItems.find((m) => m.itemId === item.itemId);
      if (!menuItem) {
        throw new BadRequestException(`Item '${item.itemId}' does not belong to selected outlet`);
      }
      if (!menuItem.availability.isAvailable) {
        throw new BadRequestException(`Item '${menuItem.name}' is not currently available`);
      }

      return {
        itemId: menuItem.itemId,
        name: menuItem.name,
        quantity: item.quantity,
        notes: item.notes,
      };
    });
  }
}
