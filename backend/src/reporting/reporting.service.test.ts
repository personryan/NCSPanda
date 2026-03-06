import { describe, expect, it } from 'vitest';
import { ReportingService } from './reporting.service';

const mockPrisma = {
  order: {
    findMany: async () => [
      {
        order_id: 'ord-1',
        outlet_id: 'outlet-b6-chicken-rice',
        customer_id: 'c1',
        slot_date: new Date('2099-01-01'),
        slot_id: 'slot-1',
        status: 'received',
        created_at: new Date('2099-01-01T10:00:00Z'),
        items: [
          { item_id: 'item-a', name: 'Chicken Rice', quantity: 2, notes: null },
          { item_id: 'item-b', name: 'Soup', quantity: 1, notes: null },
        ],
      },
      {
        order_id: 'ord-2',
        outlet_id: 'outlet-b6-chicken-rice',
        customer_id: 'c2',
        slot_date: new Date('2099-01-01'),
        slot_id: 'slot-2',
        status: 'ready',
        created_at: new Date('2099-01-01T10:30:00Z'),
        items: [{ item_id: 'item-a', name: 'Chicken Rice', quantity: 1, notes: null }],
      },
    ],
  },
} as any;

describe('ReportingService', () => {
  it('returns aggregate vendor analytics', async () => {
    const service = new ReportingService(mockPrisma);

    const summary = await service.getVendorAnalytics({
      outletId: 'outlet-b6-chicken-rice',
      fromDate: '2099-01-01',
      toDate: '2099-01-02',
    });

    expect(summary.totals.orders).toBe(2);
    expect(summary.totals.items).toBe(4);
    expect(summary.statusBreakdown.received).toBe(1);
    expect(summary.statusBreakdown.ready).toBe(1);
    expect(summary.topItems[0].itemId).toBe('item-a');
    expect(summary.topItems[0].quantity).toBe(3);
  });
});
