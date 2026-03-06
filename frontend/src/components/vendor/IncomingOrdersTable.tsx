import { OrderStatus } from '../../services/api';
import OrderRow from './OrderRow';

interface VendorOrder {
  orderId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: OrderStatus;
  itemsSummary: string;
  createdAt: string;
}

export default function IncomingOrdersTable({
  orders,
  onAdvanceStatus,
  updatingOrderId,
}: {
  orders: VendorOrder[];
  onAdvanceStatus: (orderId: string, status: Exclude<OrderStatus, 'received'>) => void;
  updatingOrderId: string | null;
}) {
  if (!orders.length) {
    return <p className="menu-empty">No incoming orders yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="vendor-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Pickup Slot</th>
            <th>Items</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.orderId}
              order={order}
              onAdvanceStatus={onAdvanceStatus}
              statusUpdating={updatingOrderId === order.orderId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
