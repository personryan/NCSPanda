import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PickupSlotsService } from './pickup-slots.service';

describe('PickupSlotsService', () => {
  const service = new PickupSlotsService();

  it('returns slot list with capacity availability', () => {
    const slots = service.getSlots('outlet-b6-chicken-rice', '2099-01-01');
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('capacity');
    expect(slots[0]).toHaveProperty('booked');
    expect(slots[0]).toHaveProperty('available');
    expect(slots[0]).toHaveProperty('isAvailable');
  });

  it('rejects past dates', () => {
    expect(() => service.getSlots('outlet-b6-chicken-rice', '2000-01-01')).toThrow(BadRequestException);
  });

  it('rejects invalid outlet ids', () => {
    expect(() => service.getSlots('missing-outlet', '2099-01-01')).toThrow(NotFoundException);
  });
});
