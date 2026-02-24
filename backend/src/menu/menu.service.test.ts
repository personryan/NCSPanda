import { describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  const service = new MenuService();

  it('returns outlet-scoped menu data with availability metadata', () => {
    const result = service.getMenuByOutlet('outlet-b6-chicken-rice');
    expect(result.outletId).toBe('outlet-b6-chicken-rice');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty('availability');
    expect(result.items[0].availability).toHaveProperty('isAvailable');
    expect(result.items[0].availability).toHaveProperty('status');
  });

  it('throws NotFoundException for invalid outlet', () => {
    expect(() => service.getMenuByOutlet('missing-outlet')).toThrow(NotFoundException);
  });
});
