import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

const mockSummary = {
  outletId: 'outlet-b6-chicken-rice',
  period: { fromDate: null, toDate: null },
  totals: { orders: 4, items: 10 },
  statusBreakdown: { received: 1, preparing: 2, ready: 1 },
  topItems: [{ itemId: 'item-a', name: 'Chicken Rice', quantity: 6 }],
};

const mockService = {
  getVendorAnalytics: vi.fn().mockResolvedValue(mockSummary),
} as unknown as ReportingService;

describe('ReportingController', () => {
  const controller = new ReportingController(mockService);

  it('blocks non-vendor calls', () => {
    expect(() =>
      controller.getVendorSummary({ outletId: 'outlet-b6-chicken-rice' }, 'customer'),
    ).toThrow(UnauthorizedException);
    expect(() =>
      controller.getVendorSummary({ outletId: 'outlet-b6-chicken-rice' }, 'admin'),
    ).toThrow(UnauthorizedException);
  });

  it('returns summary for vendor role', async () => {
    const result = await controller.getVendorSummary(
      { outletId: 'outlet-b6-chicken-rice' },
      'vendor',
    );

    expect(result.totals.orders).toBe(4);
  });
});
