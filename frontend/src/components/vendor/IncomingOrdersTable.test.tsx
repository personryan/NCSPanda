import { fireEvent, render, screen } from '@testing-library/react';
import IncomingOrdersTable from './IncomingOrdersTable';

const baseOrder = {
  orderId: 'ord-1',
  customerId: 'customer-1',
  slotDate: '2099-01-01',
  slotId: 'slot-12:00',
  itemsSummary: 'Chicken Rice x1',
  createdAt: '2099-01-01T00:00:00.000Z',
};

describe('IncomingOrdersTable', () => {
  it('renders empty state', () => {
    render(<IncomingOrdersTable orders={[]} updatingOrderId={null} onAdvanceStatus={jest.fn()} />);
    expect(screen.getByText('No incoming orders yet.')).toBeTruthy();
  });

  it('advances received and preparing orders and completes ready orders', () => {
    const onAdvanceStatus = jest.fn();
    render(
      <IncomingOrdersTable
        updatingOrderId="ord-2"
        onAdvanceStatus={onAdvanceStatus}
        orders={[
          { ...baseOrder, status: 'received' },
          { ...baseOrder, orderId: 'ord-2', status: 'preparing' },
          { ...baseOrder, orderId: 'ord-3', status: 'ready' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mark preparing' }));
    expect(onAdvanceStatus).toHaveBeenCalledWith('ord-1', 'preparing');
    expect(screen.getByRole('button', { name: 'Mark ready' })).toHaveProperty('disabled', true);
    expect(screen.getByText('Completed')).toBeTruthy();
  });
});
