import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VendorReportQueryDto } from './dto/vendor-report-query.dto';

@Injectable()
export class ReportingService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getVendorAnalytics(query: VendorReportQueryDto) {
    const dateFilter: Record<string, Date> = {};

    if (query.fromDate) {
      dateFilter.gte = new Date(query.fromDate);
    }

    if (query.toDate) {
      dateFilter.lte = new Date(query.toDate);
    }

    const where = {
      outlet_id: query.outletId,
      ...(Object.keys(dateFilter).length ? { slot_date: dateFilter } : {}),
    };

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: [{ slot_date: 'asc' }, { created_at: 'desc' }],
    });

    const statusBreakdown = {
      received: orders.filter((o) => o.status === 'received').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
    };

    const itemsMap = new Map<string, { itemId: string; name: string; quantity: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = itemsMap.get(item.item_id) ?? {
          itemId: item.item_id,
          name: item.name,
          quantity: 0,
        };

        current.quantity += item.quantity;
        itemsMap.set(item.item_id, current);
      });
    });

    const topItems = [...itemsMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return {
      outletId: query.outletId,
      period: {
        fromDate: query.fromDate ?? null,
        toDate: query.toDate ?? null,
      },
      totals: {
        orders: orders.length,
        items: orders.reduce(
          (acc, order) => acc + order.items.reduce((total, item) => total + item.quantity, 0),
          0,
        ),
      },
      statusBreakdown,
      topItems,
    };
  }
}
