import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VendorDashboardPage from './VendorDashboard';
import { fetchVendorIncomingOrders, updateVendorOrderStatus } from '../services/api';

jest.mock('../services/api', () => ({
  fetchVendorIncomingOrders: jest.fn(),
  updateVendorOrderStatus: jest.fn(),
}));

const order = {
  orderId: 'ord-1',
  customerId: 'customer-1',
  outletId: 'outlet-b6-chicken-rice',
  slotDate: '2099-01-01',
  slotId: 'slot-12:00',
  status: 'received',
  createdAt: '2099-01-01T00:00:00.000Z',
  itemsSummary: 'Chicken Rice x1',
};

describe('VendorDashboardPage', () => {
  beforeEach(() => {
    (fetchVendorIncomingOrders as jest.Mock).mockResolvedValue([order]);
    (updateVendorOrderStatus as jest.Mock).mockResolvedValue({ ...order, status: 'preparing' });
  });

  it('loads incoming orders and advances status', async () => {
    render(<VendorDashboardPage />);

    expect(await screen.findByText('ord-1')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mark preparing' }));

    await waitFor(() => expect(updateVendorOrderStatus).toHaveBeenCalledWith('ord-1', 'preparing'));
  });

  it('reloads when filters change and displays errors', async () => {
    (fetchVendorIncomingOrders as jest.Mock).mockRejectedValueOnce(new Error('orders failed'));
    render(<VendorDashboardPage />);

    expect(await screen.findByText('orders failed')).toBeTruthy();

    (fetchVendorIncomingOrders as jest.Mock).mockResolvedValueOnce([]);
    fireEvent.change(screen.getByLabelText('Status filter'), { target: { value: 'ready' } });
    await waitFor(() =>
      expect(fetchVendorIncomingOrders).toHaveBeenLastCalledWith('outlet-b6-chicken-rice', 'ready'),
    );
  });
});
