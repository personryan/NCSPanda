import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PickupSlotsService } from './pickup-slots.service';

function makePrisma(outlet: unknown = null, orderGroups: unknown[] = []) {
  return {
    outlet: {
      findUnique: async () => outlet,
    },
    order: {
      groupBy: async () => orderGroups,
    },
  } as any;
}

describe('PickupSlotsService', () => {
  it('returns slot list with capacity availability', async () => {
    const prisma = makePrisma({ slot_capacity: 18 });
    const service = new PickupSlotsService(prisma);

    const slots = await service.getSlots('outlet-b6-chicken-rice', '2099-01-01');
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('capacity');
    expect(slots[0]).toHaveProperty('booked');
    expect(slots[0]).toHaveProperty('available');
    expect(slots[0]).toHaveProperty('isAvailable');
  });

  it('rejects past dates', async () => {
    const prisma = makePrisma({ slot_capacity: 18 });
    const service = new PickupSlotsService(prisma);

    await expect(service.getSlots('outlet-b6-chicken-rice', '2000-01-01')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects invalid outlet ids', async () => {
    const prisma = makePrisma(null);
    const service = new PickupSlotsService(prisma);

    await expect(service.getSlots('missing-outlet', '2099-01-01')).rejects.toThrow(
      NotFoundException,
    );
  });
});
