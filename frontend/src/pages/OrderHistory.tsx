import { useEffect, useMemo, useState } from 'react';
import { CustomerOrder, fetchMyOrders } from '../services/api';

interface OrderHistoryPageProps {
  accessToken: string;
}

function getSlotTime(slotId: string): string {
  return slotId.split('-').slice(-1)[0] || '-';
}

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OrderHistoryPage({ accessToken }: Readonly<OrderHistoryPageProps>) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchMyOrders(accessToken)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load order history');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const orderedItems = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        slotTime: getSlotTime(order.slotId),
        itemsLabel: order.items.map((item) => `${item.name} x ${item.quantity}`).join(', '),
      })),
    [orders],
  );

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>Order History</h1>
        <p>Review your submitted preorders and pickup details.</p>
      </div>

      <div className="menu-surface">
        {loading ? <p className="menu-empty">Loading order history...</p> : null}
        {error ? <p className="alert-error">{error}</p> : null}

        {!loading && !error && !orderedItems.length ? (
          <p className="menu-empty">No preorders yet.</p>
        ) : null}

        {!loading && !error && orderedItems.length ? (
          <div className="history-list">
            {orderedItems.map((order) => (
              <article key={order.orderId} className="history-card">
                <div className="history-card__header">
                  <div>
                    <h2>{order.outletName || order.outletId}</h2>
                    <p>{order.slotDate} at {order.slotTime}</p>
                  </div>
                  <span className={`status-pill status-order-${order.status}`}>{order.status}</span>
                </div>
                <p className="history-card__items">{order.itemsLabel || 'No items recorded'}</p>
                <p className="history-card__meta">Submitted {formatCreatedAt(order.createdAt)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
