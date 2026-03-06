import { OrderStatus } from '../../services/api';

interface VendorOrder {
  orderId: string;
  customerId: string;
  slotDate: string;
  slotId: string;
  status: OrderStatus;
  itemsSummary: string;
  createdAt: string;
}

function nextStatus(status: OrderStatus): Exclude<OrderStatus, 'received'> | null {
  if (status === 'received') return 'preparing';
  if (status === 'preparing') return 'ready';
  return null;
}

export default function OrderRow({
  order,
  onAdvanceStatus,
  statusUpdating,
}: {
  order: VendorOrder;
  onAdvanceStatus: (orderId: string, status: Exclude<OrderStatus, 'received'>) => void;
  statusUpdating: boolean;
}) {
  const slotTime = order.slotId.split('-').slice(-1)[0] || '-';
  const targetStatus = nextStatus(order.status);

  return (
    <tr>
      <td>{order.orderId}</td>
      <td>{order.customerId}</td>
      <td>{order.slotDate} {slotTime}</td>
      <td>{order.itemsSummary}</td>
      <td>
        <span className={`status-pill status-order-${order.status}`}>{order.status}</span>
      </td>
      <td>
        {targetStatus ? (
          <button
            type="button"
            className="btn btn-ghost btn-inline"
            disabled={statusUpdating}
            onClick={() => onAdvanceStatus(order.orderId, targetStatus)}
          >
            Mark {targetStatus}
          </button>
        ) : (
          <span className="status-done">Completed</span>
        )}
      </td>
    </tr>
  );
}
