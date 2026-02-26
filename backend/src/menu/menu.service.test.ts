import { describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';

function makePrisma(outletRow: unknown = undefined) {
  return {
    outlet: {
      findUnique: async () => outletRow,
    },
  } as any;
}

const CHICKEN_RICE_OUTLET = {
  outlet_id: 'outlet-b6-chicken-rice',
  outlet_name: 'B6 Chicken Rice',
  menu_items: [
    {
      item_id: 'item-cr-01',
      name: 'Roasted Chicken Rice',
      description: 'Signature roasted chicken with fragrant rice',
      price: 4.5,
      currency: 'SGD',
      is_available: true,
      availability_status: 'available',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
};

describe('MenuService', () => {
  it('returns outlet-scoped menu data with availability metadata', async () => {
    const service = new MenuService(makePrisma(CHICKEN_RICE_OUTLET));
    const result = await service.getMenuByOutlet('outlet-b6-chicken-rice');

    expect(result.outletId).toBe('outlet-b6-chicken-rice');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty('availability');
    expect(result.items[0].availability).toHaveProperty('isAvailable');
    expect(result.items[0].availability).toHaveProperty('status');
  });

  it('throws NotFoundException for invalid outlet', async () => {
    const service = new MenuService(makePrisma(null));
    await expect(service.getMenuByOutlet('missing-outlet')).rejects.toThrow(NotFoundException);
  });
});
