import { Injectable, NotFoundException } from '@nestjs/common';

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
  private readonly outletMenus: Record<string, OutletMenuView> = {
    'outlet-b6-chicken-rice': {
      outletId: 'outlet-b6-chicken-rice',
      outletName: 'B6 Chicken Rice',
      items: [
        {
          itemId: 'item-cr-01',
          name: 'Roasted Chicken Rice',
          description: 'Signature roasted chicken with fragrant rice',
          price: 4.5,
          currency: 'SGD',
          availability: { isAvailable: true, status: 'available' },
        },
        {
          itemId: 'item-cr-02',
          name: 'Steamed Chicken Rice',
          price: 4.2,
          currency: 'SGD',
          availability: { isAvailable: true, status: 'limited' },
        },
        {
          itemId: 'item-cr-03',
          name: 'Braised Tofu Set',
          price: 3.8,
          currency: 'SGD',
          availability: { isAvailable: false, status: 'sold_out' },
        },
      ],
    },
    'outlet-b6-noodles': {
      outletId: 'outlet-b6-noodles',
      outletName: 'B6 Noodles',
      items: [
        {
          itemId: 'item-n-01',
          name: 'Fishball Noodle Soup',
          price: 4.0,
          currency: 'SGD',
          availability: { isAvailable: true, status: 'available' },
        },
        {
          itemId: 'item-n-02',
          name: 'Dry Wanton Mee',
          price: 4.6,
          currency: 'SGD',
          availability: { isAvailable: true, status: 'available' },
        },
      ],
    },
  };

  getMenuByOutlet(outletId: string): OutletMenuView {
    const menu = this.outletMenus[outletId];
    if (!menu) {
      throw new NotFoundException(`Outlet '${outletId}' was not found`);
    }
    return menu;
  }
}
