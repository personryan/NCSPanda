import { render, screen, waitFor } from '@testing-library/react';
import OrderHistoryPage from './OrderHistory';
import { fetchMyOrders } from '../services/api';

jest.mock('../services/api', () => ({
  fetchMyOrders: jest.fn(),
}));

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    (fetchMyOrders as jest.Mock).mockReset();
  });

  it('renders empty state when the customer has no preorders', async () => {
    (fetchMyOrders as jest.Mock).mockResolvedValue([]);

    render(<OrderHistoryPage accessToken="token-1" />);

    await waitFor(() => expect(fetchMyOrders).toHaveBeenCalledWith('token-1'));
    expect(screen.getByText('No preorders yet.')).toBeTruthy();
  });

  it('renders customer preorder history details', async () => {
    (fetchMyOrders as jest.Mock).mockResolvedValue([
      {
        orderId: 'ord-1',
        outletId: 'outlet-b6-chicken-rice',
        outletName: 'B6 Chicken Rice',
        customerId: 'customer-1',
        slotDate: '2099-01-01',
        slotId: 'outlet-b6-chicken-rice-2099-01-01-11:30',
        status: 'received',
        createdAt: '2099-01-01T03:00:00.000Z',
        items: [{ itemId: 'item-cr-01', name: 'Roasted Chicken Rice', quantity: 2 }],
      },
    ]);

    render(<OrderHistoryPage accessToken="token-1" />);

    expect(await screen.findByText('B6 Chicken Rice')).toBeTruthy();
    expect(screen.getByText('2099-01-01 at 11:30')).toBeTruthy();
    expect(screen.getByText('Roasted Chicken Rice x 2')).toBeTruthy();
    expect(screen.getByText('received')).toBeTruthy();
  });
});
