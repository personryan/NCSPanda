import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReportingAnalyticsPage from './ReportingAnalytics';
import { fetchVendorSummaryReport } from '../services/api';

jest.mock('../services/api', () => ({
  fetchVendorSummaryReport: jest.fn(),
}));

describe('ReportingAnalyticsPage', () => {
  it('loads summary metrics and top items', async () => {
    (fetchVendorSummaryReport as jest.Mock).mockResolvedValue({
      outletId: 'outlet-b6-chicken-rice',
      period: { fromDate: '2099-01-01', toDate: '2099-01-01' },
      totals: { orders: 4, items: 8 },
      statusBreakdown: { received: 1, preparing: 1, ready: 2 },
      topItems: [{ itemId: 'item-1', name: 'Chicken Rice', quantity: 5 }],
    });

    render(<ReportingAnalyticsPage />);

    expect(await screen.findByText('Chicken Rice')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Outlet scope'), { target: { value: 'outlet-b6-noodles' } });
    await waitFor(() => expect(fetchVendorSummaryReport).toHaveBeenLastCalledWith(
      'outlet-b6-noodles',
      expect.any(String),
      expect.any(String),
    ));
  });

  it('renders empty and error states', async () => {
    (fetchVendorSummaryReport as jest.Mock).mockResolvedValueOnce({
      outletId: 'outlet-b6-chicken-rice',
      period: { fromDate: null, toDate: null },
      totals: { orders: 0, items: 0 },
      statusBreakdown: { received: 0, preparing: 0, ready: 0 },
      topItems: [],
    });
    const { rerender } = render(<ReportingAnalyticsPage />);
    expect(await screen.findByText('No item sales in this period.')).toBeTruthy();

    (fetchVendorSummaryReport as jest.Mock).mockRejectedValueOnce(new Error('report failed'));
    rerender(<ReportingAnalyticsPage />);
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2099-01-02' } });
    expect(await screen.findByText('report failed')).toBeTruthy();
  });
});
