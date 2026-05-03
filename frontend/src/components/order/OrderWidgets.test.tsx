import { fireEvent, render, screen } from '@testing-library/react';
import OrderSummary from './OrderSummary';
import SlotPicker from './SlotPicker';

describe('order widgets', () => {
  it('renders empty and populated order summaries', () => {
    const { rerender } = render(<OrderSummary items={[]} />);
    expect(screen.getByText('No items selected yet.')).toBeTruthy();
    expect(screen.getByText('SGD 0.00')).toBeTruthy();

    rerender(
      <OrderSummary
        items={[{ itemId: 'item-1', name: 'Chicken Rice', quantity: 2, price: 4.5, currency: 'SGD' }]}
      />,
    );
    expect(screen.getByText(/Chicken Rice/)).toBeTruthy();
    expect(screen.getAllByText('SGD 9.00')).toHaveLength(2);
  });

  it('renders selectable pickup slots and disables unavailable slots', () => {
    const onSelect = jest.fn();
    const { rerender } = render(<SlotPicker slots={[]} selectedSlotId="" onSelect={onSelect} />);
    expect(screen.getByText('No pickup slots available for selected date.')).toBeTruthy();

    rerender(
      <SlotPicker
        selectedSlotId="slot-1"
        onSelect={onSelect}
        slots={[
          {
            slotId: 'slot-1',
            startTime: '12:00',
            endTime: '12:15',
            capacity: 5,
            booked: 2,
            available: 3,
            isAvailable: true,
          },
          {
            slotId: 'slot-2',
            startTime: '12:15',
            endTime: '12:30',
            capacity: 5,
            booked: 5,
            available: 0,
            isAvailable: false,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /12:00/ }));
    expect(onSelect).toHaveBeenCalledWith('slot-1');
    expect(screen.getByRole('button', { name: /12:30/ })).toHaveProperty('disabled', true);
  });
});
