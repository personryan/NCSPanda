import OrderRow from './OrderRow';

interface VendorOrder {
  orderId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: string;
  itemsSummary: string;
  createdAt: string;
}

export default function IncomingOrdersTable({ orders }: { orders: VendorOrder[] }) {
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
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
