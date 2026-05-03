import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MenuPage from './Menu';
import { fetchMenuByOutlet } from '../services/api';

jest.mock('../services/api', () => ({
  fetchMenuByOutlet: jest.fn(),
}));

describe('MenuPage', () => {
  it('loads and renders outlet menu data', async () => {
    (fetchMenuByOutlet as jest.Mock).mockResolvedValue({
      outletId: 'outlet-b6-chicken-rice',
      outletName: 'B6 Chicken Rice',
      items: [
        {
          itemId: 'item-1',
          name: 'Chicken Rice',
          price: 4.5,
          currency: 'SGD',
          availability: { isAvailable: true, status: 'available' },
        },
      ],
    });

    render(<MenuPage />);

    expect(await screen.findByText('Chicken Rice')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Outlet'), { target: { value: 'outlet-b6-noodles' } });
    await waitFor(() => expect(fetchMenuByOutlet).toHaveBeenLastCalledWith('outlet-b6-noodles'));
  });

  it('shows fetch errors', async () => {
    (fetchMenuByOutlet as jest.Mock).mockRejectedValue(new Error('menu failed'));
    render(<MenuPage />);

    expect(await screen.findByText('menu failed')).toBeTruthy();
  });
});
