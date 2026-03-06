import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuService } from '../menu/menu.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';

export type OrderStatus = 'received' | 'preparing' | 'ready';

export interface StoredOrder {
  orderId: string;
  outletId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: OrderStatus;
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
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MenuService) private readonly menuService: MenuService,
    @Inject(PickupSlotsService) private readonly pickupSlotsService: PickupSlotsService,
  ) {}

  async createOrder(payload: CreateOrderDto): Promise<StoredOrder> {
    if (!payload.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Validate menu items exist and are available
    const menu = await this.menuService.getMenuByOutlet(payload.outletId);

    // Validate pickup slot exists and has capacity
    const availableSlots = await this.pickupSlotsService.getSlots(
      payload.outletId,
      payload.slotDate,
    );
    const selectedSlot = availableSlots.find((s) => s.slotId === payload.slotId);

    if (!selectedSlot) {
      throw new BadRequestException('Selected pickup slot does not exist for outlet/date');
    }
    if (!selectedSlot.isAvailable) {
      throw new BadRequestException('Selected pickup slot is already full');
    }

    const normalizedItems = this.normalizeItems(payload.items, menu.items);

    // Create order + order items in a single transaction
    const order = await this.prisma.order.create({
      data: {
        outlet_id: payload.outletId,
        customer_id: payload.customerId || 'customer-anonymous',
        slot_date: new Date(payload.slotDate),
        slot_id: payload.slotId,
        status: 'received',
        items: {
          create: normalizedItems.map((item) => ({
            item_id: item.itemId,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });

    return this.toStoredOrder(order);
  }

  async listOrdersForVendor(filters: {
    outletId: string;
    slotDate?: string;
    status?: OrderStatus;
  }): Promise<StoredOrder[]> {
    const where: Record<string, unknown> = { outlet_id: filters.outletId };
    if (filters.slotDate) where.slot_date = new Date(filters.slotDate);
    if (filters.status) where.status = filters.status;

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: [{ slot_date: 'asc' }, { created_at: 'desc' }],
    });

    return orders.map((order) => this.toStoredOrder(order));
  }

  async getOrderById(orderId: string): Promise<StoredOrder> {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toStoredOrder(order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<StoredOrder> {
    const existing = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (!this.canTransition(existing.status as OrderStatus, status)) {
      throw new BadRequestException(
        `Invalid status transition from '${existing.status}' to '${status}'`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { order_id: orderId },
      data: { status },
      include: { items: true },
    });

    return this.toStoredOrder(updated);
  }

  private canTransition(from: OrderStatus, to: OrderStatus): boolean {
    if (from === to) return true;

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      received: ['preparing'],
      preparing: ['ready'],
      ready: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  private toStoredOrder(
    order: {
      order_id: string;
      outlet_id: string;
      customer_id: string;
      slot_date: Date;
      slot_id: string;
      status: string;
      created_at: Date;
      items: Array<{
        item_id: string;
        name: string;
        quantity: number;
        notes: string | null;
      }>;
    },
  ): StoredOrder {
    return {
      orderId: order.order_id,
      outletId: order.outlet_id,
      customerId: order.customer_id,
      slotDate: order.slot_date.toISOString().split('T')[0],
      slotId: order.slot_id,
      status: order.status as OrderStatus,
      createdAt: order.created_at.toISOString(),
      items: order.items.map((i) => ({
        itemId: i.item_id,
        name: i.name,
        quantity: i.quantity,
        notes: i.notes ?? undefined,
      })),
    };
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
