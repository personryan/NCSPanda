import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PickupSlotView {
  slotId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  isAvailable: boolean;
}

const TIME_BLOCKS: [string, string][] = [
  ['11:30', '11:45'],
  ['11:45', '12:00'],
  ['12:00', '12:15'],
  ['12:15', '12:30'],
  ['12:30', '12:45'],
  ['12:45', '13:00'],
];

@Injectable()
export class PickupSlotsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSlots(outletId: string, date: string): Promise<PickupSlotView[]> {
    this.assertValidDate(date);

    const outlet = await this.prisma.outlet.findUnique({
      where: { outlet_id: outletId },
      select: { slot_capacity: true },
    });

    if (!outlet) {
      throw new NotFoundException(`Outlet '${outletId}' was not found`);
    }

    const capacity = outlet.slot_capacity;

    // Count booked orders per slot for this outlet+date
    const bookedCounts = await this.prisma.order.groupBy({
      by: ['slot_id'],
      where: {
        outlet_id: outletId,
        slot_date: new Date(date),
      },
      _count: { order_id: true },
    });

    const bookedMap = new Map(
      bookedCounts.map((b) => [b.slot_id, b._count.order_id]),
    );

    return TIME_BLOCKS.map(([startTime, endTime]) => {
      const slotId = `${outletId}-${date}-${startTime}`;
      const booked = bookedMap.get(slotId) || 0;
      const available = Math.max(0, capacity - booked);

      return {
        slotId,
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
}
