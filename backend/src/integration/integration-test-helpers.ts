import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MenuController } from '../menu/menu.controller';
import { MenuService } from '../menu/menu.service';
import { OrdersController } from '../orders/orders.controller';
import { OrdersService } from '../orders/orders.service';
import { PickupSlotsService } from '../pickup-slots/pickup-slots.service';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { VendorOrdersController } from '../vendor-orders/vendor-orders.controller';
import { VendorOrdersService } from '../vendor-orders/vendor-orders.service';

declare const jest: any;

export const TEST_DATE = '2099-01-01';
export const OUTLET_ID = 'outlet-integration';
export const CUSTOMER_ID = '11111111-1111-4111-8111-111111111111';

type RoleName = 'customer' | 'vendor' | 'admin';
type AvailabilityStatus = 'available' | 'limited' | 'sold_out';

export class InMemoryPrisma {
  roles = [
    { role_id: 1, role_name: 'customer' as RoleName, description: 'Customer' },
    { role_id: 2, role_name: 'vendor' as RoleName, description: 'Vendor' },
    { role_id: 3, role_name: 'admin' as RoleName, description: 'Admin' },
  ];

  users = [
    this.userRecord(CUSTOMER_ID, 1, 'Casey', 'Customer'),
    this.userRecord('22222222-2222-4222-8222-222222222222', 2, 'Val', 'Vendor'),
    this.userRecord('33333333-3333-4333-8333-333333333333', 3, 'Ada', 'Admin'),
  ];

  outlets = [
    {
      outlet_id: OUTLET_ID,
      outlet_name: 'Integration Kitchen',
      slot_capacity: 2,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    },
  ];

  menuItems = [
    this.menuItemRecord({
      item_id: 'item-original',
      outlet_id: OUTLET_ID,
      name: 'Original Bowl',
      description: 'House favorite',
      price: 6.5,
    }),
  ];

  orders: any[] = [];

  outlet = {
    findUnique: jest.fn(async (args: any) => {
      const outlet = this.outlets.find((candidate) => candidate.outlet_id === args.where.outlet_id);
      if (!outlet) return null;
      if (args.select?.slot_capacity) return { slot_capacity: outlet.slot_capacity };
      if (args.select?.outlet_id) return { outlet_id: outlet.outlet_id };
      if (args.include?.menu_items) {
        return {
          ...outlet,
          menu_items: this.menuItems.filter((item) => item.outlet_id === outlet.outlet_id),
        };
      }
      return outlet;
    }),
  };

  menuItem = {};

  order = {
    create: jest.fn(async (args: any) => {
      const orderId = `00000000-0000-4000-8000-${String(this.orders.length + 1).padStart(12, '0')}`;
      const order = {
        order_id: orderId,
        outlet_id: args.data.outlet_id,
        customer_id: args.data.customer_id,
        slot_date: args.data.slot_date,
        slot_id: args.data.slot_id,
        status: args.data.status,
        created_at: new Date('2099-01-01T10:00:00.000Z'),
        items: args.data.items.create.map((item: any, index: number) => ({
          order_item_id: index + 1,
          order_id: orderId,
          item_id: item.item_id,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };
      this.orders.push(order);
      return order;
    }),
    findMany: jest.fn(async (args: any) => this.orders
      .filter((order) => !args.where.outlet_id || order.outlet_id === args.where.outlet_id)
      .filter((order) => !args.where.customer_id || order.customer_id === args.where.customer_id)
      .filter((order) => !args.where.slot_date || this.sameDate(order.slot_date, args.where.slot_date))
      .filter((order) => !args.where.status || order.status === args.where.status)
      .map((order) => (args.include?.outlet ? {
        ...order,
        outlet: this.outlets.find((outlet) => outlet.outlet_id === order.outlet_id) ?? null,
      } : order))),
    findUnique: jest.fn(async (args: any) => (
      this.orders.find((order) => order.order_id === args.where.order_id) ?? null
    )),
    findFirst: jest.fn(async (args: any) => (
      this.orders.find((order) => (
        order.order_id === args.where.order_id &&
        order.customer_id === args.where.customer_id
      )) ?? null
    )),
    update: jest.fn(async (args: any) => {
      const order = this.orders.find((candidate) => candidate.order_id === args.where.order_id);
      if (!order) return null;
      Object.assign(order, args.data);
      return order;
    }),
    groupBy: jest.fn(async (args: any) => {
      const counts = new Map<string, number>();
      this.orders
        .filter((order) => order.outlet_id === args.where.outlet_id)
        .filter((order) => this.sameDate(order.slot_date, args.where.slot_date))
        .forEach((order) => counts.set(order.slot_id, (counts.get(order.slot_id) ?? 0) + 1));

      return Array.from(counts.entries()).map(([slot_id, count]) => ({
        slot_id,
        _count: { order_id: count },
      }));
    }),
  };

  user = {
    findUnique: jest.fn(async (args: any) => {
      const user = this.users.find((candidate) => candidate.user_id === args.where.user_id);
      if (!user) return null;
      return args.include?.role ? this.withRole(user) : user;
    }),
    create: jest.fn(async (args: any) => {
      const user = this.userRecord(
        args.data.user_id,
        args.data.role_id,
        args.data.first_name,
        args.data.last_name,
      );
      this.users.push(user);
      return args.include?.role ? this.withRole(user) : user;
    }),
    update: jest.fn(async (args: any) => {
      const user = this.users.find((candidate) => candidate.user_id === args.where.user_id);
      if (!user) return null;
      Object.assign(user, args.data, { updated_at: new Date() });
      return args.include?.role ? this.withRole(user) : user;
    }),
  };

  seedMenuItem(data: {
    item_id: string;
    outlet_id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    is_available?: boolean;
    availability_status?: AvailabilityStatus;
  }) {
    const item = this.menuItemRecord(data);
    this.menuItems.push(item);
    return item;
  }

  private userRecord(userId: string, roleId: number, firstName: string, lastName: string) {
    return {
      user_id: userId,
      role_id: roleId,
      first_name: firstName,
      last_name: lastName,
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  private menuItemRecord(data: {
    item_id: string;
    outlet_id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    is_available?: boolean;
    availability_status?: AvailabilityStatus;
  }) {
    return {
      item_id: data.item_id,
      outlet_id: data.outlet_id,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      currency: data.currency ?? 'SGD',
      is_available: data.is_available ?? true,
      availability_status: data.availability_status ?? 'available',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  private withRole(user: any) {
    return {
      ...user,
      role: this.roles.find((role) => role.role_id === user.role_id) ?? null,
    };
  }

  private sameDate(left: Date, right: Date) {
    return left.toISOString().split('T')[0] === right.toISOString().split('T')[0];
  }
}

export function authContext(authorization?: string) {
  const request = { headers: { authorization } };
  return {
    request,
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext,
  };
}

export function createIntegrationHarness() {
  const prisma = new InMemoryPrisma();
  const menuService = new MenuService(prisma as any);
  const pickupSlotsService = new PickupSlotsService(prisma as any);
  const ordersService = new OrdersService(prisma as any, menuService, pickupSlotsService);
  const vendorOrdersService = new VendorOrdersService(ordersService);
  const usersService = new UsersService(prisma as any);
  const supabaseAuth = { validateAccessToken: jest.fn() };

  return {
    prisma,
    menuController: new MenuController(menuService),
    ordersController: new OrdersController(ordersService, supabaseAuth as any),
    vendorOrdersController: new VendorOrdersController(vendorOrdersService),
    usersController: new UsersController(usersService),
    authGuard: new AuthGuard(supabaseAuth as any),
    supabaseAuth,
  };
}
