import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

export interface PickupSlotView {
  slotId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  isAvailable: boolean;
}

const OUTLET_SLOT_CAPACITY: Record<string, number> = {
  'outlet-b6-chicken-rice': 18,
  'outlet-b6-noodles': 14,
};

@Injectable()
export class PickupSlotsService {
  getSlots(outletId: string, date: string): PickupSlotView[] {
    this.assertValidDate(date);

    const capacity = OUTLET_SLOT_CAPACITY[outletId];
    if (!capacity) {
      throw new NotFoundException(`Outlet '${outletId}' was not found`);
    }

    const blocks = [
      ['11:30', '11:45'],
      ['11:45', '12:00'],
      ['12:00', '12:15'],
      ['12:15', '12:30'],
      ['12:30', '12:45'],
      ['12:45', '13:00'],
    ];

    // deterministic pseudo-bookings for stable API responses
    const seed = this.hash(`${outletId}:${date}`);

    return blocks.map(([startTime, endTime], index) => {
      const booked = Math.min(capacity, (seed + index * 3) % (capacity + 1));
      const available = Math.max(0, capacity - booked);

      return {
        slotId: `${outletId}-${date}-${startTime}`,
        startTime,
        endTime,
        capacity,
        booked,
        available,
        isAvailable: available > 0,
      };
    });
  }

  private assertValidDate(date: string): void {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('date must be a valid ISO date (yyyy-mm-dd)');
    }

    const dayOnly = new Date(date + 'T00:00:00.000Z');
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (dayOnly < todayUtc) {
      throw new BadRequestException('Past dates are not allowed for pickup slots');
    }
  }

  private hash(input: string): number {
    let value = 0;
    for (let i = 0; i < input.length; i += 1) {
      value = (value * 31 + input.charCodeAt(i)) % 100000;
    }
    return value;
  }
}
