import { useEffect, useMemo, useState } from 'react';
import IncomingOrdersTable from '../components/vendor/IncomingOrdersTable';
import {
  fetchVendorIncomingOrders,
  OrderStatus,
  updateVendorOrderStatus,
  VendorIncomingOrder,
} from '../services/api';

const outletOptions = [
  { id: 'outlet-b6-chicken-rice', label: 'B6 Chicken Rice' },
  { id: 'outlet-b6-noodles', label: 'B6 Noodles' },
];

export default function VendorDashboardPage() {
  const [outletId, setOutletId] = useState(outletOptions[0].id);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<VendorIncomingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = () => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchVendorIncomingOrders(outletId, statusFilter)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load incoming orders');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => loadOrders(), [outletId, statusFilter]);

  const statusSummary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1;
        return acc;
      },
      { received: 0, preparing: 0, ready: 0 },
    );
  }, [orders]);

  const handleAdvanceStatus = async (
    orderId: string,
    status: Exclude<OrderStatus, 'received'>,
  ) => {
    setUpdatingOrderId(orderId);
    setError(null);
    try {
      const updated = await updateVendorOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.orderId === orderId ? { ...order, status: updated.status } : order,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      setError(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>Vendor Incoming Orders</h1>
        <p>Monitor incoming pre-orders by pickup slot and update preparation status.</p>
      </div>

      <div className="vendor-toolbar-grid">
        <div className="menu-toolbar">
          <label htmlFor="vendor-outlet" className="form-label">Outlet scope</label>
          <select id="vendor-outlet" className="form-input" value={outletId} onChange={(e) => setOutletId(e.target.value)}>
            {outletOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="menu-toolbar">
          <label htmlFor="vendor-status-filter" className="form-label">Status filter</label>
          <select
            id="vendor-status-filter"
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <option value="all">All statuses</option>
            <option value="received">Received</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
          </select>
        </div>
      </div>

      <div className="vendor-summary-cards">
        <article className="vendor-card"><h3>Received</h3><strong>{statusSummary.received}</strong></article>
        <article className="vendor-card"><h3>Preparing</h3><strong>{statusSummary.preparing}</strong></article>
        <article className="vendor-card"><h3>Ready</h3><strong>{statusSummary.ready}</strong></article>
      </div>

      <div className="menu-surface">
        {loading ? <p>Loading incoming orders…</p> : null}
        {error ? <p className="alert-error">{error}</p> : null}
        {!loading && !error ? (
          <IncomingOrdersTable
            orders={orders}
            onAdvanceStatus={handleAdvanceStatus}
            updatingOrderId={updatingOrderId}
          />
        ) : null}
      </div>
    </section>
  );
}
