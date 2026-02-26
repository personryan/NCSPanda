import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MenuItemView {
  itemId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  availability: {
    isAvailable: boolean;
    status: 'available' | 'limited' | 'sold_out';
  };
}

export interface OutletMenuView {
  outletId: string;
  outletName: string;
  items: MenuItemView[];
}

@Injectable()
export class MenuService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMenuByOutlet(outletId: string): Promise<OutletMenuView> {
    const outlet = await this.prisma.outlet.findUnique({
      where: { outlet_id: outletId },
      include: { menu_items: true },
    });

    if (!outlet) {
      throw new NotFoundException(`Outlet '${outletId}' was not found`);
    }

    return {
      outletId: outlet.outlet_id,
      outletName: outlet.outlet_name,
      items: outlet.menu_items.map((item) => ({
        itemId: item.item_id,
        name: item.name,
        description: item.description ?? undefined,
        price: Number(item.price),
        currency: item.currency,
        availability: {
          isAvailable: item.is_available,
          status: item.availability_status,
        },
      })),
    };
  }
}
