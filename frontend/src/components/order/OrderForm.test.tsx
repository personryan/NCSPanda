import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OrderForm from './OrderForm';
import { createOrder, fetchMenuByOutlet, fetchPickupSlots } from '../../services/api';

jest.mock('../../services/api', () => ({
  createOrder: jest.fn(),
  fetchMenuByOutlet: jest.fn(),
  fetchPickupSlots: jest.fn(),
}));

const menu = {
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
    {
      itemId: 'item-2',
      name: 'Sold Out Noodles',
      price: 5,
      currency: 'SGD',
      availability: { isAvailable: false, status: 'sold_out' },
    },
  ],
};

const slots = [
  {
    slotId: 'slot-1',
    startTime: '12:00',
    endTime: '12:15',
    capacity: 5,
    booked: 0,
    available: 5,
    isAvailable: true,
  },
];

describe('OrderForm', () => {
  beforeEach(() => {
    (fetchMenuByOutlet as jest.Mock).mockResolvedValue(menu);
    (fetchPickupSlots as jest.Mock).mockResolvedValue(slots);
    (createOrder as jest.Mock).mockResolvedValue({ orderId: 'ord-1' });
  });

  it('validates selection before submitting', async () => {
    render(<OrderForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit pre-order' }));
    expect(await screen.findByText('Please select a pickup slot before submitting.')).toBeTruthy();

    fireEvent.click(await screen.findByRole('button', { name: /12:00/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit pre-order' }));
    expect(await screen.findByText('Please add at least one item to your order.')).toBeTruthy();
  });

  it('submits a selected item and resets the order', async () => {
    render(<OrderForm />);

    fireEvent.click(await screen.findByRole('button', { name: /12:00/ }));
    fireEvent.click(screen.getAllByRole('button', { name: '+' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit pre-order' }));

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        slotId: 'slot-1',
        items: [{ itemId: 'item-1', quantity: 1 }],
      }),
    );
    expect(await screen.findByText('Order submitted successfully. ID: ord-1')).toBeTruthy();
  });

  it('shows loading errors from menu, slots, and order submission', async () => {
    (fetchMenuByOutlet as jest.Mock).mockRejectedValueOnce(new Error('menu failed'));
    (fetchPickupSlots as jest.Mock).mockRejectedValueOnce(new Error('slot failed'));
    const { unmount } = render(<OrderForm />);

    expect(await screen.findByText('slot failed')).toBeTruthy();
    unmount();

    (fetchMenuByOutlet as jest.Mock).mockResolvedValue(menu);
    (fetchPickupSlots as jest.Mock).mockResolvedValue(slots);
    (createOrder as jest.Mock).mockRejectedValueOnce(new Error('order failed'));
    render(<OrderForm />);
    fireEvent.click(await screen.findByRole('button', { name: /12:00/ }));
    fireEvent.click(screen.getAllByRole('button', { name: '+' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Submit pre-order' }));

    expect(await screen.findByText('order failed')).toBeTruthy();
  });
});
